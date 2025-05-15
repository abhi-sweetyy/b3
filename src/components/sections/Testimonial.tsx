"use client";

import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";

export default function Testimonial() {
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
    <section
      ref={sectionRef}
      className={`bg-white py-16 px-4 sm:px-6 transition-all duration-700 transform ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="max-w-6xl mx-auto">
        <div className="bg-[#F8F8FC] rounded-xl p-8 md:p-12">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            {/* Testimonial Image */}
            <div className="w-full md:w-1/3 flex justify-center">
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <img
                  src="/testimonial-person.jpg"
                  alt="Customer testimonial"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Testimonial Content */}
            <div className="w-full md:w-2/3">
              <p className="text-lg text-gray-700 mb-6 italic">
                "
                {t(
                  "testimonial.quote",
                  "ExposeFlow is built for efficiency. It can easily handle property details, photos, texts, and so much more. It's just brilliant. I love using it, and our team is amazed by the level of professionalism in our brochures."
                )}
                "
              </p>

              <div>
                <h4 className="text-[#5169FE] font-semibold text-lg">
                  {t("testimonial.name", "John Smith")}
                </h4>
                <p className="text-gray-600">
                  {t(
                    "testimonial.position",
                    "Real Estate Agent"
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
