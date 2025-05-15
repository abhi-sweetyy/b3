"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";

export default function Hero() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);

  // Function to scroll to sections
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Add animation on load
  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="bg-white w-full pt-10 md:pt-14 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-5 sm:px-6 md:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-10 md:gap-8">
          {/* Left column - Text Content */}
          <div
            className={`w-full md:w-1/2 md:pr-6 transition-all duration-700 transform ${isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
              {t("hero.title", "Immobilien Exposés")}
              <br />
              <span className="text-[#5169FE]">
                {t("hero.subtitle", "vereinfacht")}
              </span>
            </h1>

            <p className="mt-4 text-gray-700 text-base sm:text-lg">
              {t(
                "hero.description",
                "Mit ExposeFlow erstellen Sie Immobilienmarketing-Materialien in Minuten ohne Design-Erfahrung",
              )}
            </p>

            <ul className="mt-6 space-y-3">
              <li className="flex items-start gap-2.5">
                <div className="flex-shrink-0 text-[#5169FE] mt-1">✓</div>
                <span className="text-gray-700">
                  {t(
                    "hero.feature1",
                    "Erstellen Sie professionelle Immobilienbeschreibungen mit KI",
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="flex-shrink-0 text-[#5169FE] mt-1">✓</div>
                <span className="text-gray-700">
                  {t(
                    "hero.feature2",
                    "Gestalten Sie schöne Layouts ohne Grafikdesign-Kenntnisse",
                  )}
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <div className="flex-shrink-0 text-[#5169FE] mt-1">✓</div>
                <span className="text-gray-700">
                  {t(
                    "hero.feature3",
                    "Heben Sie sich von der Konkurrenz mit Premium-Materialien ab",
                  )}
                </span>
              </li>
            </ul>

            {/* Button container with mobile-specific styling for equal buttons */}
            <div className="mt-8 w-full flex flex-col sm:flex-row sm:w-auto gap-4">
              <Link href="/sign-up" className="w-full sm:w-auto">
                <button className="w-full sm:w-auto px-5 py-2.5 bg-[#5169FE] text-white rounded-lg font-medium hover:bg-[#4058e0] transition-colors">
                  {t("hero.startCreating", "Jetzt erstellen")}
                </button>
              </Link>
              <button
                onClick={() => scrollToSection("demo")}
                className="w-full sm:w-auto px-5 py-2.5 bg-white text-[#5169FE] border border-[#5169FE] rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                {t("hero.seeExamples", "Demo ansehen")}
              </button>
            </div>
          </div>

          {/* Right column - Image */}
          <div
            className={`w-full md:w-1/2 mt-10 md:mt-0 transition-all duration-1000 delay-200 transform ${isVisible ? "translate-x-0 opacity-100" : "translate-x-12 opacity-0"}`}
          >
            <div className="relative mx-auto max-w-lg">
              {/* Just the clean image with rounded corners and shadow */}
              <div className="overflow-hidden rounded-lg shadow-xl">
                <img
                  src="/brochure-preview.png"
                  alt="Real Estate Brochure Preview"
                  className="w-full h-auto object-contain block"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
