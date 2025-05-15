"use client";

import { useTranslation } from "react-i18next";

export default function Benefits() {
  const { t } = useTranslation();

  // Benefits data with reordered items: Save Time, Professional Results, Save Money
  const benefits = [
    {
      title: t("benefits.saveTime.title"),
      description: t("benefits.saveTime.description"),
    },
    {
      title: t("benefits.professional.title"),
      description: t("benefits.professional.description"),
    },
    {
      title: t("benefits.saveMoney.title"),
      description: t("benefits.saveMoney.description"),
    },
  ];

  return (
    <section id="benefits" className="bg-white py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#171717]">
          {t("benefits.title")}
        </h2>
        <div className="grid md:grid-cols-3 gap-12">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex flex-col items-center text-center">
              <div className="mb-4 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-500 text-2xl font-bold">
                ✓
              </div>
              <h3 className="text-lg font-bold mb-2 text-[#171717]">
                {benefit.title}
              </h3>
              <p className="text-gray-600">{benefit.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
