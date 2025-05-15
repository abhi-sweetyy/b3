"use client";

import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

interface TemplateStepProps {
  templates: Array<{
    id: string;
    name: string;
    description: string;
    preview_image_url: string;
  }>;
  selectedTemplate: string;
  onSelect: (templateId: string) => void;
}

const TemplateStep: React.FC<TemplateStepProps> = ({
  templates,
  selectedTemplate,
  onSelect,
}) => {
  const { t, i18n } = useTranslation();
  const [showAllTemplates, setShowAllTemplates] = useState(false);

  // Default templates with translation keys
  const defaultTemplates = [
    {
      id: "1N-9VAQ0ecfhxiPP2qUHJFK7FMSWaR5-uJOJo6mLh2mo", // Classic Colorless Template
      nameKey: "templateSelector.classicColorless.name",
      descriptionKey: "templateSelector.classicColorless.description",
      preview_image_url: "/templates/modern-real-estate.png",
    },
    {
      id: "1-NQuZKcfsox-s6JuFafJLXJI8H4Wh_uZrTIhB2uhBW4", // Classic Template
      nameKey: "templateSelector.classic.name",
      descriptionKey: "templateSelector.classic.description",
      preview_image_url: "/templates/classic-property.png",
    },
    {
      id: "1g1IiE3IrndlYyBr8aqhwK8txlqX0gnnN7PK204ijFvc", // Colorful Template
      nameKey: "templateSelector.colorful.name",
      descriptionKey: "templateSelector.colorful.description",
      preview_image_url: "/templates/luxury-villa.png",
    },
    {
      id: "1mMumP3-ak8h-w1Hv_82ZRSlTOhqIN2VAvgQPhJU4mGo", // Modern Template
      nameKey: "templateSelector.modern.name",
      descriptionKey: "templateSelector.modern.description",
      preview_image_url: "/templates/modern-template.png",
    },
  ];

  // Use provided templates or fall back to default templates with translations
  const allTemplates =
    templates.length > 0
      ? templates
      : defaultTemplates.map((template) => ({
          id: template.id,
          name: t(template.nameKey),
          description: t(template.descriptionKey),
          preview_image_url: template.preview_image_url,
        }));

  // Show only first 3 templates initially
  const displayTemplates = showAllTemplates
    ? allTemplates
    : allTemplates.slice(0, 3);

  // Update templates when language changes
  useEffect(() => {
    // This will ensure the component re-renders when the language changes
  }, [i18n.language]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayTemplates.map((template) => (
          <div
            key={template.id}
            className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? "border-[#5169FE] ring-2 ring-[#5169FE]/20"
                : "border-gray-200 hover:border-gray-400"
            }`}
            onClick={() => onSelect(template.id)}
          >
            <div className="aspect-video bg-gray-100 relative">
              {template.preview_image_url ? (
                <img
                  src={template.preview_image_url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  {t("templateSelector.noPreview", "No preview available")}
                </div>
              )}
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-[#5169FE] text-white rounded-full p-1">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </div>
            <div className="p-4 bg-white">
              <h3 className="font-medium text-[#171717]">{template.name}</h3>
              <p className="text-sm text-gray-600 mt-1">
                {template.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {!showAllTemplates && allTemplates.length > 3 && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setShowAllTemplates(true)}
            className="px-4 py-2 bg-[#5169FE] text-white rounded-lg hover:bg-[#3D52D5] transition-colors"
          >
            {t("templateSelector.viewAllTemplates", "View All Templates")}
          </button>
        </div>
      )}

      {showAllTemplates && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-[#171717]">
                {t("templateSelector.allTemplates", "All Templates")}
              </h2>
              <button
                onClick={() => setShowAllTemplates(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allTemplates.map((template) => (
                <div
                  key={template.id}
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all ${
                    selectedTemplate === template.id
                      ? "border-[#5169FE] ring-2 ring-[#5169FE]/20"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                  onClick={() => {
                    onSelect(template.id);
                    setShowAllTemplates(false);
                  }}
                >
                  <div className="aspect-video bg-gray-100 relative">
                    {template.preview_image_url ? (
                      <img
                        src={template.preview_image_url}
                        alt={template.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        {t(
                          "templateSelector.noPreview",
                          "No preview available",
                        )}
                      </div>
                    )}
                    {selectedTemplate === template.id && (
                      <div className="absolute top-2 right-2 bg-[#5169FE] text-white rounded-full p-1">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="p-4 bg-white">
                    <h3 className="font-medium text-[#171717]">
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {template.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemplateStep;
