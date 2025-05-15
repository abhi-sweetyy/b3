"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";

export default function CTASection() {
  const { t } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <section ref={sectionRef} className="bg-white py-10 sm:py-12 md:py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div
          className={`relative overflow-hidden bg-[#EDF0FF] rounded-xl p-6 sm:p-8 md:p-12 shadow-lg transition-all duration-1000 transform ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-12"
          }`}
        >
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-200/10 rounded-full blur-3xl -ml-32 -mb-32"></div>

          <div className="flex flex-col lg:flex-row items-center relative z-10">
            <div className="w-full lg:w-2/3 lg:pr-12 mb-8 lg:mb-0">
              <div
                className={`transition-all duration-700 delay-300 transform ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-4 sm:mb-6">
                  {t(
                    "cta.title",
                    "Ready to Transform Your Real Estate Marketing?",
                  )}
                </h2>
                <p className="text-lg text-gray-700 mb-6">
                  {t(
                    "cta.description",
                    "Experience how our AI-powered brochure creator can revolutionize your workflow. Save valuable time and create high-quality exposés.",
                  )}
                </p>
              </div>
            </div>

            <div
              className={`w-full lg:w-1/3 transition-all duration-700 delay-500 transform ${
                isVisible
                  ? "opacity-100 translate-y-0 scale-100"
                  : "opacity-0 translate-y-4 scale-95"
              }`}
            >
              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-md hover:shadow-lg transition-all duration-300">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                  {t("cta.bookDemo", "Book a Demo")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t(
                    "cta.bookDemoDescription",
                    "Schedule a 30-minute appointment with our team.",
                  )}
                </p>

                <Link
                  href="https://calendly.com/ines-goetschel-uni-ulm/30min"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <button className="w-full bg-[#5169FE] hover:bg-[#4058e0] text-white py-3 px-6 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-200 border border-[#5169FE] hover:scale-[1.03]">
                    {t("cta.scheduleButton", "Choose a Time")}
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
