"use client";

import { useTranslation } from "react-i18next";

export default function Demo() {
  const { t } = useTranslation();

  return (
    <section id="demo" className="bg-[#F8F8FC] py-16">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8 text-[#171717]">
          {t("demo.title", "See ExposeFlow in Action")}
        </h2>
        <div className="aspect-w-16 aspect-h-9 bg-white rounded-lg shadow-lg">
          {/* Placeholder for video/demo */}
          <div className="w-full h-[400px] flex items-center justify-center">
            <span className="text-gray-400">
              {t("demo.placeholder", "Video Demo Placeholder")}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
