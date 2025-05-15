import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
// import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
// import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

// Add this config export to disable the default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const relevantEvents = new Set([
  'checkout.session.completed',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted'
]);

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

// Mark this route as dynamic to prevent static generation errors
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.text();
  const headersList = await headers()
  const sig = headersList.get('Stripe-Signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  // const supabase = createRouteHandlerClient({ cookies });

  try {
    if (!sig || !webhookSecret) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    console.log('Processing webhook:', event.type);

    if (relevantEvents.has(event.type)) {
      try {
        switch (event.type) {
          case 'customer.subscription.created':
          case 'customer.subscription.updated':
          case 'customer.subscription.deleted': {
            const subscription = event.data.object as Stripe.Subscription;
            const customer = await stripe.customers.retrieve(subscription.customer as string) as Stripe.Customer;
            const userId = customer.metadata.userId;

            if (!userId) {
              console.error('No userId in customer metadata:', customer.id);
              return NextResponse.json({ error: 'No userId found' }, { status: 400 });
            }

            const subscriptionData = {
              id: subscription.id,
              user_id: userId,
              status: subscription.status,
              price_id: subscription.items.data[0].price.id,
              quantity: subscription.items.data[0].quantity,
              cancel_at_period_end: subscription.cancel_at_period_end,
              created: new Date(subscription.created * 1000).toISOString(),
              current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
              current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
              ended_at: subscription.ended_at ? new Date(subscription.ended_at * 1000).toISOString() : null,
              cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
              canceled_at: subscription.canceled_at ? new Date(subscription.canceled_at * 1000).toISOString() : null,
              trial_start: subscription.trial_start ? new Date(subscription.trial_start * 1000).toISOString() : null,
              trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
            };

            const { error } = await supabaseAdmin
              .from('subscriptions')
              .upsert(subscriptionData);

            if (error) {
              console.error('Supabase error:', error);
              return NextResponse.json({ error: 'Database insert failed' }, { status: 500 });
            }

            console.log('Subscription stored successfully for user:', userId);
            break;
          }
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;

            // Extract metadata
            const userId = session.metadata?.userId;
            const creditsAwardedString = session.metadata?.creditsAwarded;

            if (!userId || !creditsAwardedString) {
              console.error('Webhook received checkout.session.completed without userId or creditsAwarded in metadata', session.id);
              return NextResponse.json({ error: 'Missing metadata' }, { status: 400 });
            }

            const creditsAwarded = parseInt(creditsAwardedString, 10);
            if (isNaN(creditsAwarded)) {
              console.error('Webhook received invalid creditsAwarded value in metadata', session.id, creditsAwardedString);
              return NextResponse.json({ error: 'Invalid creditsAwarded metadata' }, { status: 400 });
            }

            console.log(`Processing successful payment for user: ${userId}, awarding ${creditsAwarded} credits.`);

            try {
              // Fetch current credits using the Admin client
              const { data: profile, error: fetchError } = await supabaseAdmin
                .from('profiles')
                .select('credits')
                .eq('id', userId)
                .single();

              if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = Row not found
                console.error(`Webhook: Error fetching profile for user ${userId}:`, fetchError);
                throw fetchError; // Throw to return 500
              }

              const currentCredits = profile?.credits || 0;
              const newCreditAmount = currentCredits + creditsAwarded;

              // Update user credits using the Admin client
              const { error: updateError } = await supabaseAdmin
                .from('profiles')
                .upsert({ id: userId, credits: newCreditAmount })
                .eq('id', userId); // Ensure we only update the target user

              if (updateError) {
                console.error(`Webhook: Error updating credits for user ${userId}:`, updateError);
                throw updateError; // Throw to return 500
              }

              console.log(`Successfully updated credits for user ${userId} to ${newCreditAmount}`);

            } catch (dbError: any) {
              console.error('Webhook: Database operation failed:', dbError);
              // Return 500 to signal Stripe to retry the webhook
              return NextResponse.json({ error: `Database Error: ${dbError.message}` }, { status: 500 });
            }
            break;
          }
        }
      } catch (error) {
        console.error('Error processing webhook:', error);
        return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
  }
}
