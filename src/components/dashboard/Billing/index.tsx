"use client";

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { Session } from '@supabase/supabase-js';

interface BillingProps {
  initialSubscription: {
    isPro: boolean;
    currentPeriodEnd: string | null;
  };
  userId: string;
}

const formatDate = (date: string) => {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: 'numeric'
  });
};

export default function BillingClient({ initialSubscription, userId }: BillingProps) {
  const [supabaseClient] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));

  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const [subscription, setSubscription] = useState({
    isPro: initialSubscription.isPro,
    isLoading: false,
    currentPeriodEnd: initialSubscription.currentPeriodEnd
  });

  useEffect(() => {
    const { data: authListener } = supabaseClient.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setIsLoadingSession(false);
    });

    supabaseClient.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!session) {
        setSession(initialSession);
      }
      if (isLoadingSession) {
        setIsLoadingSession(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabaseClient]);

  useEffect(() => {
    if (!session?.user?.id || !supabaseClient) return;

    if (session.user.id !== userId) {
      console.warn("User ID prop does not match current session user ID in BillingClient.");
      return;
    }

    const channel = supabaseClient
      .channel('subscription-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const { data: subscriptionData } = await supabaseClient
            .from('subscriptions')
            .select('*')
            .eq('user_id', userId)
            .eq('status', 'active')
            .single();

          setSubscription({
            isPro: !!subscriptionData,
            isLoading: false,
            currentPeriodEnd: subscriptionData?.current_period_end || null
          });
        }
      )
      .subscribe();

    return () => {
      if (supabaseClient && channel) {
        supabaseClient.removeChannel(channel);
      }
    };
  }, [supabaseClient, userId, session]);

  if (isLoadingSession || subscription.isLoading) {
    return <div className="flex items-center justify-center p-6">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500" />
    </div>;
  }

  if (!session) {
    return <div className="text-center p-6 text-gray-500">Please log in to view billing information.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[#1D2839] bg-[#0A0A0A] p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Subscription Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Free Plan */}
          <div className={`rounded-lg border border-[#1D2839] p-6 ${!subscription.isPro ? 'bg-[#1D2839]/10' : 'bg-[#0A0A0A]'}`}>
            <h3 className="text-lg font-semibold text-white mb-2">Free Plan</h3>
            <p className="text-2xl font-bold text-white mb-4">$0<span className="text-[#8491A5] text-sm">/month</span></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-[#8491A5]">
                <span className="text-green-500 mr-2">✓</span>
                1 Contract Analysis/month
              </li>
              <li className="flex items-center text-[#8491A5]">
                <span className="text-green-500 mr-2">✓</span>
                Basic Risk Assessment
              </li>
              <li className="flex items-center text-[#8491A5]">
                <span className="text-green-500 mr-2">✓</span>
                3-Day History
              </li>
            </ul>
            {!subscription.isPro && (
              <div className="text-center text-sm text-[#8491A5] bg-[#1D2839]/20 py-1 rounded-full">
                Current Plan
              </div>
            )}
          </div>

          {/* Pro Plan */}
          <div className={`rounded-lg border border-[#1D2839] p-6 ${subscription.isPro ? 'bg-[#1D2839]/10' : 'bg-[#0A0A0A]'}`}>
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-lg font-semibold text-white">Pro Plan</h3>
              {subscription.isPro && (
                <span className="px-2 py-1 text-xs bg-blue-500/10 text-blue-400 rounded-full">Current</span>
              )}
            </div>
            <p className="text-2xl font-bold text-white mb-4">$29<span className="text-[#8491A5] text-sm">/month</span></p>
            <ul className="space-y-2 mb-6">
              <li className="flex items-center text-[#8491A5]">
                <span className="text-blue-400 mr-2">✓</span>
                10 Contract Analyses/month
              </li>
              <li className="flex items-center text-[#8491A5]">
                <span className="text-blue-400 mr-2">✓</span>
                Advanced Risk Assessment
              </li>
              <li className="flex items-center text-[#8491A5]">
                <span className="text-blue-400 mr-2">✓</span>
                Priority Processing
              </li>
              <li className="flex items-center text-[#8491A5]">
                <span className="text-blue-400 mr-2">✓</span>
                30-Day History
              </li>
            </ul>
            {subscription.isPro ? (
              <div className="space-y-2">
                {subscription.currentPeriodEnd && (
                  <p className="text-sm text-[#8491A5]">
                    Next billing date: {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
                <button
                  onClick={() => {
                    window.location.href = '/api/manage-subscription';
                  }}
                  className="w-full px-4 py-2 border border-[#1D2839] rounded-full text-white hover:bg-[#1D2839]/10 transition-colors"
                >
                  Manage Subscription
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  window.location.href = '/api/create-checkout-session';
                }}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Upgrade to Pro
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
