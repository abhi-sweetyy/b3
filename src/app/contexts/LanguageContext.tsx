"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import i18n from "@/app/i18n";

interface LanguageContextType {
  currentLanguage: string;
  changeLanguage: (lang: string) => Promise<void>;
  isReady: boolean;
}

const defaultContext: LanguageContextType = {
  currentLanguage: "de", // Changed default to German
  changeLanguage: async () => {},
  isReady: false,
};

const LanguageContext = createContext<LanguageContextType>(defaultContext);

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentLanguage, setCurrentLanguage] = useState<string>(
    i18n.language || "de",
  ); // Default to 'de'
  const [isReady, setIsReady] = useState<boolean>(i18n.isInitialized);

  useEffect(() => {
    // Debug when component mounts
    console.log(
      "LanguageProvider mounted, current i18n language:",
      i18n.language,
    );
    console.log("i18n initialized:", i18n.isInitialized);

    // Set up initialized event handler
    const handleInitialized = () => {
      console.log("i18n initialized event fired");
      setIsReady(true);
    };

    if (!i18n.isInitialized) {
      i18n.on("initialized", handleInitialized);
    } else {
      setIsReady(true);
    }

    // Listen for language changes
    const handleLanguageChanged = (lng: string) => {
      console.log("i18n language changed event:", lng);
      setCurrentLanguage(lng);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    // Try to load saved language preference from localStorage on initial load
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("preferred-language");
      console.log("Saved language from localStorage:", savedLanguage);

      if (savedLanguage && ["en", "de"].includes(savedLanguage)) {
        changeLanguage(savedLanguage);
      } else {
        // Default to German if no saved preference
        changeLanguage("de");
      }
    }

    // Clean up event listeners
    return () => {
      i18n.off("initialized", handleInitialized);
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, []);

  const changeLanguage = async (lang: string): Promise<void> => {
    console.log("Changing language to:", lang);

    try {
      // Force a reload of the i18n instance with the new language
      await i18n.changeLanguage(lang);

      console.log(
        "Language changed successfully, new i18n language:",
        i18n.language,
      );
      setCurrentLanguage(lang);
      localStorage.setItem("preferred-language", lang);

      // Force components to re-render with the new language
      window.dispatchEvent(new Event("languageChanged"));
    } catch (err) {
      console.error("Error changing language:", err);
    }
  };

  return (
    <LanguageContext.Provider
      value={{ currentLanguage, changeLanguage, isReady }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;
