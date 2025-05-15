"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { createBrowserClient } from "@supabase/ssr";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardNav from "@/components/dashboard/DashboardNav";
import type { Session, SupabaseClient } from '@supabase/supabase-js';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [credits, setCredits] = useState<number | null>(null);
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  
  // Determine active tab based on pathname
  let activeTab = "dashboard";
  if (pathname.includes("/account")) {
    activeTab = "account";
  } else if (pathname.includes("/billing")) {
    activeTab = "billing";
  } else if (pathname.includes("/brochures")) {
    activeTab = "brochures";
  }

  // Toggle sidebar collapse state
  const toggleSidebarCollapse = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
    // Store preference in localStorage
    localStorage.setItem('sidebarCollapsed', (!isSidebarCollapsed).toString());
  };

  // Check if user has a sidebar preference
  useEffect(() => {
    const savedPreference = localStorage.getItem('sidebarCollapsed');
    if (savedPreference !== null) {
      setIsSidebarCollapsed(savedPreference === 'true');
    }
  }, []);

  // Session handling
  useEffect(() => {
    // Initial fetch and listener setup
    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      console.log("Dashboard Layout Auth Change: ", event, currentSession);
      // Update state only if it's different to prevent infinite loops
      setSession((prevSession) => {
        if (JSON.stringify(prevSession) !== JSON.stringify(currentSession)) {
          return currentSession;
        }
        return prevSession;
      });
      setIsLoading(false); // Loading finished when session status is known
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
       console.log("Dashboard Layout Initial Session Check: ", initialSession);
      if (session === undefined) { // Only set if still undefined
         setSession(initialSession);
      }
      // Ensure loading is false eventually
      if (isLoading) {
          setIsLoading(false);
      }
    });

    // Cleanup listener on unmount
    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]); // Dependency only on supabase

  // --- BEGIN PROACTIVE Session Check --- 
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      console.log("Periodic Session Check:", data.session);
      // If getSession returns null but local state still has a session, clear local state
      if (data.session === null && session !== null) {
        console.log("Clearing stale local session based on getSession result.");
        setSession(null);
      }
    };

    // Check session every 60 seconds
    const intervalId = setInterval(checkSession, 60 * 1000);

    // Check session immediately when tab becomes visible
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log("Tab became visible, checking session...");
        checkSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Initial check on mount as well
    checkSession();

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  // Depend on supabase client and the local session state (to know when to clear it)
  }, [supabase, session]);
  // --- END PROACTIVE Session Check ---

  // Fetch credits - depends on session
  useEffect(() => {
    const fetchCredits = async (currentSession: Session | null) => {
      if (!currentSession?.user?.id) {
        setCredits(null); // Clear credits if no user
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', currentSession.user.id)
        .single();

      if (error) {
        console.error("Layout: Error fetching credits:", error);
        setCredits(null);
      } else if (data) {
        setCredits(data.credits);
      }
    };

    if (session !== undefined) { // Fetch only when session status is known
      fetchCredits(session);
    }
  }, [session, supabase]);

  // Listen for credits updates - depends on session
  useEffect(() => {
    if (!session?.user?.id || !supabase) return;

    const channel = supabase
      .channel('profile-credits') // Use a unique channel name
      .on(
        'postgres_changes',
        {
          event: 'UPDATE', // Listen only for updates
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${session.user.id}`,
        },
        (payload: any) => {
          console.log("Credit update received:", payload);
          if (payload.new && payload.new.credits !== undefined) {
            setCredits(payload.new.credits);
          }
        }
      )
      .subscribe((status) => {
        console.log('Credit subscription status:', status);
        if (status === 'SUBSCRIBED') {
            console.log('Listening for credit changes for user:', session.user.id);
        }
      });

    return () => {
      if (supabase && channel) {
        supabase.removeChannel(channel);
        console.log('Removed credit subscription channel');
      }
    };
  }, [session, supabase]);

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  // Close menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Show loading indicator until session is determined
  if (isLoading) {
     return (
       <div className="flex items-center justify-center min-h-screen bg-gray-50">
         <div className="h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
       </div>
     );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        userEmail={session?.user?.email}
        credits={credits}
      />
      <DashboardNav
        activeTab={activeTab}
        isOpen={isMenuOpen}
        setIsOpen={setIsMenuOpen}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={toggleSidebarCollapse}
      />
      
      {/* Main content with padding that adjusts to sidebar state */}
      <div className={`transition-all duration-300 pt-16 ${isSidebarCollapsed ? 'md:pl-20' : 'md:pl-64'}`}>
        <main className="px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
