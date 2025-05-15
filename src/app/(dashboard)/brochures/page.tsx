"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";
import { useTranslation } from 'react-i18next';
import i18n from "@/app/i18n";
import { forceReloadTranslations } from "@/app/i18n";
import type { Session, SupabaseClient } from '@supabase/supabase-js';

interface Project {
  id: string;
  title: string;
  address: string;
  created_at: string;
  status: string;
  template_id: string;
}

const BrochuresPage = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [supabase] = useState(() => createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  ));
  const [loadingProjects, setLoadingProjects] = useState(true);
  const { t } = useTranslation();
  const [i18nInitialized, setI18nInitialized] = useState(false);

  useEffect(() => {
    const loadTranslations = async () => {
      if (i18n.language) {
        await forceReloadTranslations(i18n.language);
        setI18nInitialized(true);
      }
    };
    
    loadTranslations();
  }, []);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setIsLoadingAuth(false);
    });

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!session) {
         setSession(initialSession);
      }
      if (isLoadingAuth) {
          setIsLoadingAuth(false);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase, router]);

  const fetchProjects = async (currentSession: Session | null) => {
    if (!currentSession?.user?.id) {
       setLoadingProjects(false);
       return;
    }

    setLoadingProjects(true);

    const { data, error } = await supabase
      .from('real_estate_projects')
      .select('*')
      .eq('user_id', currentSession.user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching projects:', error);
    } else if (data) {
      setProjects(data);
    }

    setLoadingProjects(false);
  };

  useEffect(() => {
    if (session) {
      fetchProjects(session);
    } else if (session === null) {
       setLoadingProjects(false);
       setProjects([]);
    }
  }, [session, supabase]);

  if (isLoadingAuth || loadingProjects) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-500/5 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px]"></div>
      </div>
      
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-wrap justify-between items-center mb-8">
          <div className="mr-auto">
            <h1 className="text-3xl font-bold text-gray-900">{t('brochures.title')}</h1>
            <p className="text-gray-600 mt-2">{t('brochures.subtitle')}</p>
          </div>
          
          <div className="mt-4 sm:mt-0">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              {t('brochures.createNew')}
            </Link>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-xl shadow-md p-8">
          <div className="flex items-center mb-8">
            <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center mr-4">
              <svg className="w-5 h-5 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">{t('brochures.yourBrochures')}</h2>
          </div>
          
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <svg className="w-16 h-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
              <p className="text-gray-600 text-lg mb-2">{t('brochures.noBrochuresYet')}</p>
              <p className="text-gray-500 mb-6 max-w-md">{t('brochures.createFirstDescription')}</p>
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center overflow-hidden rounded-lg bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-3 transition-all duration-300 ease-out hover:scale-105 hover:shadow-lg focus:outline-none"
              >
                <span className="absolute right-0 -mt-12 h-32 w-8 translate-x-12 rotate-12 transform bg-white opacity-10 transition-all duration-1000 ease-out group-hover:-translate-x-40"></span>
                <span className="relative flex items-center text-white font-medium">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  {t('brochures.createFirstButton')}
                </span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {projects.map(project => (
                <Link 
                  href={`/project/${project.id}`} 
                  key={project.id}
                  className="group bg-gray-50 border border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all duration-300 hover:shadow-md hover:shadow-blue-100 flex flex-col"
                >
                  <div className="h-40 bg-gradient-to-r from-blue-50 to-indigo-50 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-blue-100" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14zM12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zm0 8c-1.65 0-3-1.35-3-3s1.35-3 3-3 3 1.35 3 3-1.35 3-3 3z"/>
                      </svg>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow">
                    <h3 className="font-medium text-lg text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{project.title}</h3>
                    <p className="text-gray-500 text-sm mb-2">{project.address}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrochuresPage; 