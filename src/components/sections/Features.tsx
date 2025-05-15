"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function Features() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("photo");
  const [visible, setVisible] = useState({ steps: false, tabs: false });
  const stepsRef = useRef<HTMLDivElement>(null);
  const tabsRef = useRef<HTMLDivElement>(null);

  // Function to handle visibility of elements based on scroll
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "0px",
      threshold: 0.15,
    };

    const handleIntersect = (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver,
    ) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (entry.target === stepsRef.current) {
            setVisible((prev) => ({ ...prev, steps: true }));
          } else if (entry.target === tabsRef.current) {
            setVisible((prev) => ({ ...prev, tabs: true }));
          }
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersect, observerOptions);

    if (stepsRef.current) {
      observer.observe(stepsRef.current);
    }

    if (tabsRef.current) {
      observer.observe(tabsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Steps data for the how it works section
  const steps = [
    {
      number: "1",
      title: t("features.step1.title"),
      description: t("features.step1.description"),
    },
    {
      number: "2",
      title: t("features.step2.title"),
      description: t("features.step2.description"),
    },
    {
      number: "3",
      title: t("features.step3.title"),
      description: t("features.step3.description"),
    },
  ];

  return (
    <>
      {/* How it Works Section */}
      <section
        id="features"
        className="max-w-6xl mx-auto px-5 sm:px-6 py-16 md:py-20 bg-white"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 md:mb-14 text-[#171717] relative">
          {t("features.title")}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-1 bg-[#5169FE] rounded-full"></div>
        </h2>

        <div
          ref={stepsRef}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 mb-14"
        >
          {steps.map((step, index) => (
            <div
              key={index}
              className={`bg-[#F8F8FC] p-6 rounded-xl shadow-sm hover:shadow-md transition-all duration-500 relative transform ${
                visible.steps
                  ? "translate-y-0 opacity-100"
                  : "translate-y-12 opacity-0"
              }`}
              style={{ transitionDelay: `${index * 150}ms` }}
            >
              <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#CBD1FF] flex items-center justify-center">
                <span className="text-[#5169FE] font-bold">{step.number}</span>
              </div>
              <h3 className="text-lg font-semibold mb-3 text-[#171717]">
                {step.title}
              </h3>
              <p className="text-gray-600">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Link href="/sign-up">
            <button className="bg-[#5169FE] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 border border-[#5169FE] hover:scale-105">
              {t("features.getStarted")}
            </button>
          </Link>
        </div>
      </section>

      {/* 
      // Tabbed Features Section is commented out as requested
      // This code is preserved but not displayed on the page

      <section 
        ref={tabsRef}
        className={`max-w-6xl mx-auto px-5 sm:px-6 py-16 md:py-20 bg-white transition-all duration-700 transform ${
          visible.tabs ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0'
        }`}
      >
        <div className="flex justify-center mb-8 relative overflow-x-auto pb-2 -mx-5 px-5">
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#E0E0E0]"></div>

          <div className="flex space-x-1 sm:space-x-4">
            <button
              className={`px-3 sm:px-6 py-3 font-medium focus:outline-none whitespace-nowrap transition-colors relative text-sm sm:text-base ${
                activeTab === "photo"
                  ? "text-[#5169FE]"
                  : "text-gray-500 hover:text-[#5169FE]"
              }`}
              onClick={() => setActiveTab("photo")}
            >
              {t("features.tabs.photoEnhancement")}
              {activeTab === "photo" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5169FE]"></div>
              )}
            </button>

            <button
              className={`px-3 sm:px-6 py-3 font-medium focus:outline-none whitespace-nowrap transition-colors relative text-sm sm:text-base ${
                activeTab === "text"
                  ? "text-[#5169FE]"
                  : "text-gray-500 hover:text-[#5169FE]"
              }`}
              onClick={() => setActiveTab("text")}
            >
              {t("features.tabs.aiText")}
              {activeTab === "text" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5169FE]"></div>
              )}
            </button>

            <button
              className={`px-3 sm:px-6 py-3 font-medium focus:outline-none whitespace-nowrap transition-colors relative text-sm sm:text-base ${
                activeTab === "templates"
                  ? "text-[#5169FE]"
                  : "text-gray-500 hover:text-[#5169FE]"
              }`}
              onClick={() => setActiveTab("templates")}
            >
              {t("features.tabs.templates")}
              {activeTab === "templates" && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5169FE]"></div>
              )}
            </button>
          </div>
        </div>

        <div className="bg-[#F8F8FC] rounded-xl p-6 sm:p-8 md:p-10 relative md:min-h-[400px] shadow-md">
          {activeTab === "photo" && (
            <div className="flex flex-col lg:flex-row h-full gap-6">
              <div className="lg:w-1/2 pr-0 lg:pr-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[#171717]">
                  {t("features.tabs.photoEnhancement")}
                </h3>
                <p className="text-gray-700 mb-5">
                  {t(
                    "features.photoEnhancement.description",
                    "Automatically enhance your property photos with AI suggested professional filters and adjustments. Our technology detects and improves lighting, colors, and clarity to make your listings stand out.",
                  )}
                </p>
                <button className="flex items-center text-[#5169FE] font-medium hover:underline transition-all">
                  {t("features.learnMore")}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="lg:w-1/2 flex items-center justify-center overflow-hidden">
                <div className="h-[220px] sm:h-[240px] w-full flex items-center justify-center">
                  <img
                    src="/before-after-property.jpg"
                    alt="Before and after property photo enhancement"
                    className="rounded-lg object-cover w-full h-full shadow-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "text" && (
            <div className="flex flex-col lg:flex-row h-full gap-6">
              <div className="lg:w-1/2 pr-0 lg:pr-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[#171717]">
                  {t("features.tabs.aiText")}
                </h3>
                <p className="text-gray-700 mb-5">
                  {t(
                    "features.aiText.description",
                    "Generate compelling property descriptions automatically using advanced AI technology. Our system creates engaging, accurate content that highlights the best features of your properties without the need for manual writing.",
                  )}
                </p>
                <button className="flex items-center text-[#5169FE] font-medium hover:underline transition-all">
                  {t("features.learnMore")}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="lg:w-1/2 flex items-center">
                <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg w-full h-[220px] sm:h-[240px] flex items-center justify-center shadow-md">
                  <span className="text-white text-xl font-semibold px-4 text-center">
                    {t("features.aiText.imageAlt", "AI Text Generation")}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="flex flex-col lg:flex-row h-full gap-6">
              <div className="lg:w-1/2 pr-0 lg:pr-8">
                <h3 className="text-xl sm:text-2xl font-bold mb-4 text-[#171717]">
                  {t("features.tabs.templates")}
                </h3>
                <p className="text-gray-700 mb-5">
                  {t(
                    "features.templates.description",
                    "Choose from a variety of professionally designed templates for your brochures or use your previous designs. Our collection of layouts ensures you'll find the perfect style to showcase any property type.",
                  )}
                </p>
                <button className="flex items-center text-[#5169FE] font-medium hover:underline transition-all">
                  {t("features.learnMore")}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 ml-1 transform transition-transform group-hover:translate-x-1"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
              <div className="lg:w-1/2 flex items-center">
                <div className="h-[220px] sm:h-[240px] w-full flex items-center justify-center bg-white rounded-lg shadow-sm p-4">
                  <img
                    src="/expose-vorlagen.png"
                    alt={t(
                      "features.templates.imageAlt",
                      "Professional brochure templates",
                    )}
                    className="rounded-lg max-h-full object-contain"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="absolute bottom-4 sm:bottom-6 right-4 sm:right-10 flex items-center space-x-4 text-gray-500">
            <button
              className="text-gray-400 hover:text-[#5169FE] focus:outline-none transition-colors p-2 hover:bg-white/50 rounded-full"
              onClick={() => {
                if (activeTab === "text") setActiveTab("photo");
                if (activeTab === "templates") setActiveTab("text");
              }}
              disabled={activeTab === "photo"}
              aria-label="Previous feature"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <div className="text-xs font-medium">
              {activeTab === "photo" && "1/3"}
              {activeTab === "text" && "2/3"}
              {activeTab === "templates" && "3/3"}
            </div>

            <button
              className="text-gray-400 hover:text-[#5169FE] focus:outline-none transition-colors p-2 hover:bg-white/50 rounded-full"
              onClick={() => {
                if (activeTab === "photo") setActiveTab("text");
                if (activeTab === "text") setActiveTab("templates");
              }}
              disabled={activeTab === "templates"}
              aria-label="Next feature"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>
      */}
    </>
  );
}
