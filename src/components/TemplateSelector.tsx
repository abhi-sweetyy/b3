"use client";

import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";

export interface TemplateSelectorProps {
  templates: Array<{
    id: string; // This will be the Google Slides template ID
    name: string;
    description: string;
    preview_image_url: string;
  }>;
  selectedTemplate: string;
  onSelectTemplate: (templateId: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  selectedTemplate,
  onSelectTemplate,
}) => {
  const { t, i18n } = useTranslation();

  // Default templates with translation keys
  const defaultTemplates = [
    {
      id: "1Vr2RP8eZvxrGDKXxBOgwKo_d_U0xKEeI-k_qwXr-UYE", // Classic Colorless Template
      nameKey: "templateSelector.classicColorless.name",
      descriptionKey: "templateSelector.classicColorless.description",
      preview_image_url: "/templates/modern-real-estate.png",
    },
    {
      id: "1DmJ6m2b4wvsSqXoYTXzJ3DTvN92oa8SFXwAaMQXYVYE", // Classic Template
      nameKey: "templateSelector.classic.name",
      descriptionKey: "templateSelector.classic.description",
      preview_image_url: "/templates/classic-property.png",
    },
    {
      id: "1X-okYwWgK9J5PKEjY5sJ5_ZvBf_kxdJ6Z2-dtXxGH_E", // Colorful Template
      nameKey: "templateSelector.colorful.name",
      descriptionKey: "templateSelector.colorful.description",
      preview_image_url: "/templates/luxury-villa.png",
    },
  ];

  // Use provided templates or fall back to default templates with translations
  const displayTemplates =
    templates.length > 0
      ? templates
      : defaultTemplates.map((template) => ({
          id: template.id,
          name: t(template.nameKey),
          description: t(template.descriptionKey),
          preview_image_url: template.preview_image_url,
        }));

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
                ? "border-blue-500 ring-2 ring-blue-500/50"
                : "border-[#1D2839] hover:border-gray-500"
            }`}
            onClick={() => onSelectTemplate(template.id)}
          >
            <div className="aspect-video bg-[#0A0A0A] relative">
              {template.preview_image_url ? (
                <img
                  src={template.preview_image_url}
                  alt={template.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-[#8491A5]">
                  {t("templateSelector.noPreview", "No preview available")}
                </div>
              )}
              {selectedTemplate === template.id && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
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
            <div className="p-4 bg-[#0A0A0A]">
              <h3 className="font-medium text-white">{template.name}</h3>
              <p className="text-sm text-[#8491A5] mt-1">
                {template.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TemplateSelector;
