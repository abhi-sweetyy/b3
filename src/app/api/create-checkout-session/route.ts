import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js'; // Use standard Supabase client for user check

// Ensure Stripe key is available
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  throw new Error('STRIPE_SECRET_KEY is not set in environment variables');
}
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: '2023-08-16', // Use the version expected by types
});

// Use Supabase client to validate user session if needed, though primary validation happens on page
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Define credit packages here or import from a shared location
// Duplicating for simplicity, consider moving to a shared lib later
const CREDIT_PACKAGES = [
  { id: 'basic', name: 'Basic', credits: 10, price: 9.99, popular: false },
  { id: 'standard', name: 'Standard', credits: 25, price: 19.99, popular: true, bestValue: false },
  { id: 'pro', name: 'Pro', credits: 50, price: 29.99, popular: false, bestValue: true },
  { id: 'enterprise', name: 'Enterprise', credits: 100, price: 49.99, popular: false }
];

export async function POST(req: Request) {
  const { packageId, userId } = await req.json();
  
  // Determine the base URL for redirects
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'; 

  if (!packageId || !userId) {
    return NextResponse.json({ error: 'Missing packageId or userId' }, { status: 400 });
  }

  // Find the selected package
  const selectedPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
  if (!selectedPackage) {
    return NextResponse.json({ error: 'Invalid package ID' }, { status: 400 });
  }

  // Optional: Verify user exists using Supabase (client-side check is usually sufficient)
  // const { data: user, error: userError } = await supabase.auth.admin.getUserById(userId);
  // if (userError || !user) {
  //     return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
  // }

  try {
    // Create a Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd', // Or your desired currency
            product_data: {
              name: `${selectedPackage.name} - ${selectedPackage.credits} Credits`,
              description: `One-time purchase of ${selectedPackage.credits} credits.`,
            },
            // Price in cents
            unit_amount: Math.round(selectedPackage.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment', // Use 'payment' for one-time purchases
      success_url: `${siteUrl}/dashboard/billing?session_id={CHECKOUT_SESSION_ID}&status=success`, // Use siteUrl
      cancel_url: `${siteUrl}/dashboard/billing?status=cancelled`, // Use siteUrl
      metadata: {
        userId: userId,
        packageId: selectedPackage.id,
        creditsAwarded: selectedPackage.credits.toString(), // Store as string
      },
      // Consider adding customer_email if available to prefill checkout
      // customer_email: user?.email // Get email from validated user session if available
    });

    if (!session.id) {
        throw new Error('Failed to create Stripe session.');
    }

    return NextResponse.json({ sessionId: session.id });

  } catch (error: any) {
    console.error('Error creating Stripe session:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
