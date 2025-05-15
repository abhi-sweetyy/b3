'use client';

import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';
import i18n, { forceReloadTranslations } from '@/app/i18n';
import type { Session } from '@supabase/supabase-js';
import { loadStripe } from '@stripe/stripe-js';

export const dynamic = 'force-dynamic';

// Credit package options with competitive pricing
const CREDIT_PACKAGES = [
  { id: 'basic', name: 'Basic', credits: 10, price: 9.99, popular: false },
  { id: 'standard', name: 'Standard', credits: 25, price: 19.99, popular: true, bestValue: false },
  { id: 'pro', name: 'Pro', credits: 50, price: 29.99, popular: false, bestValue: true },
  { id: 'enterprise', name: 'Enterprise', credits: 100, price: 49.99, popular: false }
];

// Initialize Stripe outside the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function BillingPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  const [userCredits, setUserCredits] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [i18nInitialized, setI18nInitialized] = useState(false);
  const { t } = useTranslation();

  // Force reload translations when component mounts
  useEffect(() => {
    const loadTranslations = async () => {
      try {
        if (i18n.language) {
          await forceReloadTranslations(i18n.language);
          setI18nInitialized(true);
        }
      } catch (error) {
        console.error("Error loading translations:", error);
        // Set initialized even on error to prevent infinite loading
        setI18nInitialized(true);
      }
    };

    loadTranslations();
  }, []);

  // Session handling and redirection
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setIsLoadingAuth(false);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      console.log("Billing Page Initial Session: ", initialSession);
      if (!session) { // Set initial session only if not already set
        setSession(initialSession);
      }
      // Wait for listener to set loading false
      if (isLoadingAuth) {
          setIsLoadingAuth(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]); // Keep router dependency

  // Fetch user credits - depends on session
  useEffect(() => {
    // Moved redirection logic to session handling useEffect

    async function fetchUserData(currentSession: Session | null) { // Accept session as arg
      if (!currentSession?.user?.id) {
        setUserCredits(null); // Clear credits if no user
        return;
      }

      try {
        const { data, error } = await supabase // Use state client
          .from('profiles')
          .select('credits')
          .eq('id', currentSession.user.id) // Use arg session
          .single();

        if (error) {
          if (error.code === 'PGRST116') {
            await supabase // Use state client
              .from('profiles')
              .insert({ id: currentSession.user.id, credits: 0 }); // Use arg session
            setUserCredits(0);
          } else {
            console.error("Error fetching user credits:", error);
            setUserCredits(0); // Default to 0 on other errors
          }
        } else {
          setUserCredits(data?.credits ?? 0); // Use nullish coalescing
        }
      } catch (error) {
        console.error("Error fetching user credits:", error);
        setUserCredits(0); // Default to 0 on catch
      }
    }

    // Fetch only when session status is known (not undefined)
    if (session !== undefined) {
        fetchUserData(session);
    }
  }, [session, supabase]); // Depend on session and supabase

  const handlePurchaseCredits = async (packageId: string) => {
    if (!session?.user?.id) {
      toast.error(t("billing.mustBeLoggedIn"));
      return;
    }

    setIsProcessing(packageId);

    try {
      // Find the selected package - needed for UI feedback potentially
      const selectedPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
      if (!selectedPackage) {
        throw new Error(t("billing.invalidPackage"));
      }

      // 1. Call the backend to create a checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ packageId: packageId, userId: session.user.id }),
      });

      const checkoutSession = await response.json();

      if (!response.ok) {
        throw new Error(checkoutSession.error || 'Failed to create checkout session');
      }

      // 2. Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe.js failed to load.');
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId: checkoutSession.sessionId,
      });

      if (error) {
        console.error("Stripe redirect error:", error);
        throw error; // Throw error to be caught below
      }

      // Note: DB update is now handled by the webhook
      // The user will be redirected away, so local state update isn't strictly needed here
      // unless you show a success message on the redirect back.

    } catch (error: any) {
      console.error("Error purchasing credits:", error);
      toast.error(error.message || t("billing.purchaseFailed"));
      setIsProcessing(null); // Reset button on error
    } 
    // No finally block needed as redirect happens on success
  };

  // Updated loading check
  if (isLoadingAuth || !i18nInitialized) { // Check auth loading and i18n
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="flex flex-col items-center">
          <div className="h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-800">Loading...</p>
        </div>
      </div>
    );
  }

  // If loading is done but there's no session, render null (or redirect handled by useEffect)
  if (!session) return null;

  // Neuer Inhalt - Kostenlose Testphase
  return (
    <div className="min-h-screen">
      {/* Background elements matching dashboard */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">{t("billing.title", "Abrechnung")}</h1>
          <p className="text-gray-600 mt-2">{t("billing.subtitle", "Verwalten Sie Ihre Guthabennutzung")}</p>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-1">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                ExposeFlow befindet sich aktuell in einer kostenlosen Testphase, um mit dem Feedback von Testkunden eine gut funktionierende hilfreiche Softwarelösung für Immobilienmakler zu entwickeln. Zu einem späteren Zeitpunkt wird die Erstellung einen fairen Preis abgesprochen mit Nutzern bekommen - abgerechnet pro Nutzung.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}