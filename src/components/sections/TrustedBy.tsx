"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";

export default function TrustedBy() {
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

  // Create two sets of logos for the infinite scroll effect
  const logos = [
    { src: "/immo-logo-1.png", alt: "Real Estate Agency 1" },
    { src: "/immo-logo-2.png", alt: "Real Estate Agency 2" },
    { src: "/immo-logo-1.png", alt: "Real Estate Agency 3" },
    { src: "/immo-logo-2.png", alt: "Real Estate Agency 4" },
    { src: "/immo-logo-1.png", alt: "Real Estate Agency 5" },
    { src: "/immo-logo-2.png", alt: "Real Estate Agency 6" },
  ];

  return (
    <section
      ref={sectionRef}
      className={`bg-[#F8F8FC] py-12 md:py-16 px-5 sm:px-6 transition-all duration-700 transform ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <h2
          className={`text-center text-gray-700 text-sm sm:text-base font-medium tracking-wider uppercase mb-8 md:mb-10 transition-all duration-500 delay-300 transform ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          {t("trustedBy.title", "Vertraut von erfahrenen Immobilienmaklern")}
        </h2>

        {/* Logos marquee container with subtle equal gradients */}
        <div className="relative overflow-hidden">
          {/* Custom CSS gradients for more natural spread */}
          <div className="custom-gradient-left"></div>
          <div className="custom-gradient-right"></div>

          {/* Scrolling logos */}
          <div
            className={`flex items-center space-x-8 sm:space-x-16 py-4 px-4 animate-scroll-slow transition-all duration-700 delay-500 transform ${
              isVisible
                ? "translate-y-0 opacity-100"
                : "translate-y-8 opacity-0"
            }`}
          >
            {/* First set of logos */}
            {logos.map((logo, index) => (
              <div
                key={`logo-1-${index}`}
                className="flex-shrink-0 px-2 sm:px-4"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-8 sm:h-12 md:h-14 object-contain filter grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
                />
              </div>
            ))}

            {/* Duplicate set for seamless loop */}
            {logos.map((logo, index) => (
              <div
                key={`logo-2-${index}`}
                className="flex-shrink-0 px-2 sm:px-4"
              >
                <img
                  src={logo.src}
                  alt={logo.alt}
                  className="h-8 sm:h-12 md:h-14 object-contain filter grayscale hover:grayscale-0 transition-all duration-300 hover:scale-110"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add custom styles for animation and gradients */}
      <style jsx global>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(calc(-100% / 2));
          }
        }
        .animate-scroll-slow {
          animation: scroll 30s linear infinite;
        }

        .custom-gradient-left {
          position: absolute;
          left: 0;
          top: 0;
          height: 100%;
          width: 36px;
          z-index: 10;
          background: linear-gradient(
            to right,
            #f8f8fc 10%,
            rgba(248, 248, 252, 0.8) 30%,
            rgba(248, 248, 252, 0.5) 50%,
            rgba(248, 248, 252, 0.2) 75%,
            transparent 100%
          );
        }
        .custom-gradient-right {
          position: absolute;
          right: 0;
          top: 0;
          height: 100%;
          width: 36px;
          z-index: 10;
          background: linear-gradient(
            to left,
            #f8f8fc 10%,
            rgba(248, 248, 252, 0.8) 30%,
            rgba(248, 248, 252, 0.5) 50%,
            rgba(248, 248, 252, 0.2) 75%,
            transparent 100%
          );
        }
      `}</style>
    </section>
  );
}
