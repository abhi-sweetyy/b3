"use client";

import { useTranslation } from "react-i18next";
import { BsBrush, BsImages, BsGridFill, BsList } from "react-icons/bs";
import { RiPaintFill, RiRobot2Fill } from "react-icons/ri";

interface FeatureBoxProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureBox = ({ icon, title, description }: FeatureBoxProps) => {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
        {/* First circle with lighter opacity - outer circle */}
        <div className="absolute inset-0 bg-[#5169FE]/10 rounded-full transform scale-110"></div>
        {/* Second circle with slightly higher opacity - inner circle */}
        <div className="absolute inset-2 bg-[#5169FE]/20 rounded-full"></div>
        <div className="relative z-10 text-[#5169FE] text-2xl">{icon}</div>
      </div>
      <h3 className="text-xl font-semibold mb-3 text-gray-800">{title}</h3>
      <p className="text-gray-600 leading-relaxed max-w-xs mx-auto">
        {description}
      </p>
    </div>
  );
};

const FeaturesGrid = () => {
  const { t } = useTranslation();

  const features = [
    {
      icon: <BsBrush />,
      title: t("features.grid.customBranding.title"),
      description: t("features.grid.customBranding.description"),
    },
    {
      // Switched: Now BsImages for Photo Editing
      icon: <BsImages />,
      title: t("features.grid.photoEditing.title"),
      description: t("features.grid.photoEditing.description"),
    },
    {
      // Switched: Now RiPaintFill for Fully Customizable
      icon: <RiPaintFill />,
      title: t("features.grid.fullyCustomizable.title"),
      description: t("features.grid.fullyCustomizable.description"),
    },
    {
      icon: <BsList />,
      title: t("features.grid.pageSelection.title"),
      description: t("features.grid.pageSelection.description"),
    },
    {
      icon: <BsGridFill />,
      title: t("features.grid.options.title"),
      description: t("features.grid.options.description"),
    },
    {
      icon: <RiRobot2Fill />,
      title: t("features.grid.automation.title"),
      description: t("features.grid.automation.description"),
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10 md:mb-14 text-[#171717]">
            {t("features.grid.mainTitle")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-16 max-w-5xl mx-auto">
          {features.map((feature, index) => (
            <FeatureBox
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
