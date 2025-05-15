"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useLanguage } from "@/app/contexts/LanguageContext"; // Adjust path as needed

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLanguageDropdownOpen, setIsLanguageDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { t } = useTranslation();
  const { currentLanguage, changeLanguage } = useLanguage();
  const languageDropdownRef = useRef<HTMLDivElement>(null);

  // Function to scroll to sections
  const scrollToSection = (sectionId: string, scrollToOverride?: string) => {
    const targetId = scrollToOverride || sectionId;
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });

      // If we're scrolling to the FAQ section, also open the first FAQ item
      if (targetId === "faq") {
        // Use a small delay to ensure the scrolling is complete first
        setTimeout(() => {
          // Find the FAQ component's state setter and call it with index 0
          // We use custom event to communicate with the FAQ component
          const openFirstFaqEvent = new CustomEvent("openFirstFaq");
          document.dispatchEvent(openFirstFaqEvent);
        }, 100);
      }
    }
    setIsMobileMenuOpen(false);
  };

  // Language options with proper flag image paths
  const languages = [
    { code: "en", flag: "/flags/en.png" },
    { code: "de", flag: "/flags/de.png" },
  ];

  // Change language function
  const handleLanguageChange = (langCode: string) => {
    changeLanguage(langCode);
    setIsLanguageDropdownOpen(false);
  };

  // Handle scroll events to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Click outside to close language dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        languageDropdownRef.current &&
        !languageDropdownRef.current.contains(event.target as Node)
      ) {
        setIsLanguageDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Effect to load saved language preference on initial load or set default to German
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLanguage = localStorage.getItem("preferred-language");
      if (savedLanguage) {
        changeLanguage(savedLanguage);
      } else {
        // Default to German if no saved preference
        changeLanguage("de");
        localStorage.setItem("preferred-language", "de");
      }
    }
  }, []);

  // Navigation items - Changed "benefits" to "pricing" that points to the FAQ
  const navItems = [
    { label: t("features"), id: "features" },
    { label: t("demo"), id: "demo" },
    { label: t("pricing"), id: "pricing-section", scrollTo: "faq" }, // Unique ID but still scrolls to FAQ
    { label: t("faq"), id: "faq", scrollTo: "faq-1" }, // Added scrollTo to target the first FAQ question
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 shadow ${
        scrolled
          ? "bg-white shadow-md py-2"
          : "bg-white/90 backdrop-blur-sm py-3"
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center px-4 md:px-8">
        <div className="flex items-center gap-8">
          {/* Logo and Brand */}
          <div
            className="flex items-center cursor-pointer transition-transform hover:scale-105 duration-200"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          >
            <img
              src="/favicon.png"
              alt="ExposeFlow Logo"
              className="h-8 w-auto mr-2"
            />
            <span className="text-[#5169FE] font-bold text-xl">ExposeFlow</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id, item.scrollTo)}
                className="text-[#171717] hover:text-[#5169FE] font-medium text-sm transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5169FE] transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {/* Language Selector - Fixed width */}
          <div className="relative" ref={languageDropdownRef}>
            <button
              onClick={() => setIsLanguageDropdownOpen(!isLanguageDropdownOpen)}
              className="flex items-center justify-between w-20 bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-[#171717] transition-colors"
              aria-label="Select language"
            >
              <div className="flex items-center">
                <img
                  src={
                    languages.find((lang) => lang.code === currentLanguage)
                      ?.flag || "/flags/de.png" // Default flag image is now German
                  }
                  alt={`${currentLanguage} flag`}
                  className="w-5 h-4 object-cover"
                />
                <span className="ml-1">{currentLanguage.toUpperCase()}</span>
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={`h-4 w-4 transition-transform duration-200 ${isLanguageDropdownOpen ? "rotate-180" : ""}`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {/* Language Dropdown with animation */}
            <div
              className={`absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg overflow-hidden z-50 border border-gray-200 transition-all duration-200 origin-top-right ${
                isLanguageDropdownOpen
                  ? "transform scale-100 opacity-100"
                  : "transform scale-95 opacity-0 pointer-events-none"
              }`}
            >
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`flex items-center w-full px-4 py-2.5 text-sm text-left hover:bg-gray-100 transition-colors ${
                    currentLanguage === language.code ? "bg-gray-50" : ""
                  }`}
                >
                  <img
                    src={language.flag}
                    alt={`${language.code} flag`}
                    className="w-5 h-4 object-cover mr-2"
                  />
                  <span className="text-gray-600">
                    {language.code.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Login button - visible on desktop only */}
          <Link href="/sign-in" className="hidden sm:block">
            <button className="bg-white hover:bg-gray-100 text-[#5169FE] px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm border border-[#5169FE] hover:shadow-sm">
              {t("login")}
            </button>
          </Link>

          {/* Signup button (renamed in German) - visible on desktop only */}
          <Link href="/sign-up" className="hidden md:block">
            <button className="bg-[#5169FE] hover:bg-[#4058e0] text-white px-4 py-2 rounded-lg transition-all duration-200 font-medium text-sm whitespace-nowrap border border-[#5169FE] hover:shadow-md">
              {t("getStarted")}
            </button>
          </Link>

          {/* Mobile Menu Button with improved animation */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-1.5 text-[#171717] rounded-md hover:bg-gray-100 transition-colors"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <div className="w-6 h-5 relative">
              <span
                className={`absolute h-0.5 w-6 bg-gray-800 transform transition-all duration-300 ${
                  isMobileMenuOpen ? "rotate-45 top-2.5" : "top-0"
                }`}
              ></span>
              <span
                className={`absolute h-0.5 bg-gray-800 transform transition-all duration-300 ${
                  isMobileMenuOpen ? "opacity-0 w-0" : "opacity-100 w-6 top-2"
                }`}
              ></span>
              <span
                className={`absolute h-0.5 w-6 bg-gray-800 transform transition-all duration-300 ${
                  isMobileMenuOpen ? "-rotate-45 top-2.5" : "top-4"
                }`}
              ></span>
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu with animation */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMobileMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <div className="bg-white px-4 pb-4 pt-2 shadow-inner">
          <div className="flex flex-col space-y-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id, item.scrollTo)}
                className="text-[#171717] hover:text-[#5169FE] font-medium text-sm transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#5169FE] transition-all duration-300 group-hover:w-full"></span>
              </button>
            ))}

            {/* Mobile-only login link */}
            <Link href="/sign-in">
              <button className="text-left py-2.5 px-3 text-[#5169FE] font-medium rounded-lg hover:bg-gray-50 transition-colors w-full">
                {t("login")}
              </button>
            </Link>

            {/* "Jetzt registrieren" button moved to mobile menu (renamed in German) */}
            <Link href="/sign-up">
              <button className="text-left py-2.5 px-3 bg-[#5169FE] text-white font-medium rounded-lg hover:bg-[#4058e0] transition-colors w-full">
                {t("getStarted")}
              </button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
