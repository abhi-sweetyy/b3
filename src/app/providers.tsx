"use client";

import React, { useState, useEffect } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n, { initI18n } from './i18n';
import { LanguageProvider } from './contexts/LanguageContext';

export function Providers({ children }: { children: React.ReactNode }) {
  const [isI18nInitialized, setIsI18nInitialized] = useState(false);
  
  useEffect(() => {
    // Initialize i18n
    (async () => {
      await initI18n();
      setIsI18nInitialized(true);
    })();
  }, []);
  

  
  return (
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        {children}
      </LanguageProvider>
    </I18nextProvider>
  );
} 