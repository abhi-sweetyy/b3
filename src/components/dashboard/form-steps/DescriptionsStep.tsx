"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { PropertyPlaceholders } from "@/types/placeholders";
import { toast } from "react-hot-toast";

interface DescriptionsStepProps {
  placeholders: PropertyPlaceholders;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
  autoFilledFields?: string[];
}

const DescriptionsStep: React.FC<DescriptionsStepProps> = ({
  placeholders,
  handleInputChange,
  autoFilledFields = [],
}) => {
  const { t } = useTranslation();
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to generate descriptions only
  const generateDescriptions = async () => {
    try {
      setIsGenerating(true);
      toast.loading(
        t("descriptions.generating", "Beschreibungen werden generiert..."),
        { id: "generate-descriptions" },
      );

      // Check API key
      const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
      if (!apiKey) {
        toast.error(t("api.keyMissing"), { id: "generate-descriptions" });
        setIsGenerating(false);
        return;
      }

      // Format the property data as a text prompt for the AI
      const contextPrompt = `
Immobilieninformationen:
Titel: ${placeholders.title || ""}
Adresse: ${placeholders.address_street || ""} ${placeholders.address_house_nr || ""}, ${placeholders.address_plz || ""} ${placeholders.cityname || ""}
Preis: ${placeholders.price || ""}
Immobilientyp: ${placeholders.object_type === "apartment" ? "Wohnung" : "Einfamilienhaus"}
Angebotstyp: ${placeholders.offer_type === "for_sale" ? "Zum Verkauf" : "Zur Miete"}
Wohnfläche: ${placeholders.living_area || ""}
Grundstücksfläche: ${placeholders.property_area || ""}
Zimmeranzahl: ${placeholders.number_rooms || ""}
Baujahr: ${placeholders.construction_year || ""}

Bitte generiere drei Beschreibungen für diese Immobilie in deutscher Sprache:

1. Eine kurze Einzeilige Zusammenfassung (shortdescription) - ein prägnanter Satz, der die attraktivsten und besonderen Merkmale der Immobilie hervorhebt
2. Eine Lagebeschreibung (descriptionlarge) - ein bis zwei Absätze über die Lage und Umgebung der Immobilie
3. Eine ausführliche Beschreibung (descriptionextralarge) - drei bis vier Absätze über alle Aspekte der Immobilie

Bitte schreibe in einem professionellen, ansprechenden Stil für Immobilienexposés. Verwende keine generischen Floskeln.
Antworte mit diesem Format:

KURZBESCHREIBUNG:
[Hier deine Kurzbeschreibung]

LAGEBESCHREIBUNG:
[Hier deine Lagebeschreibung]

DETAILBESCHREIBUNG:
[Hier deine ausführliche Beschreibung]
`;

      // Call the OpenRouter API directly for descriptions only
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "Real Estate Description Generator",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-maverick:free",
            messages: [
              {
                role: "system",
                content:
                  "Du bist ein professioneller Immobilien-Texter, der ansprechende Beschreibungen für Immobilienexposés erstellt. Erstelle kreative, einzigartige Beschreibungen, die das Besondere jeder Immobilie hervorheben. Die Kurzbeschreibung sollte prägnant und einprägsam sein, nicht länger als einen Satz.",
              },
              {
                role: "user",
                content: contextPrompt,
              },
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate descriptions");
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content || "";

      // Parse the response to extract the different descriptions
      let shortDescription = "";
      let layoutDescription = "";
      let detailedDescription = "";

      // Extract the short description
      const shortMatch = generatedText.match(
        /KURZBESCHREIBUNG:\s*([\s\S]*?)(?=LAGEBESCHREIBUNG:|$)/i,
      );
      if (shortMatch && shortMatch[1]) {
        shortDescription = shortMatch[1].trim();
      }

      // Extract the layout description
      const layoutMatch = generatedText.match(
        /LAGEBESCHREIBUNG:\s*([\s\S]*?)(?=DETAILBESCHREIBUNG:|$)/i,
      );
      if (layoutMatch && layoutMatch[1]) {
        layoutDescription = layoutMatch[1].trim();
      }

      // Extract the detailed description
      const detailedMatch = generatedText.match(
        /DETAILBESCHREIBUNG:\s*([\s\S]*?)$/i,
      );
      if (detailedMatch && detailedMatch[1]) {
        detailedDescription = detailedMatch[1].trim();
      }

      // Only update if we successfully extracted the descriptions
      if (shortDescription) {
        // Create an event-like object to mimic handleInputChange behavior
        const shortEvent = {
          target: { name: "shortdescription", value: shortDescription },
          currentTarget: { name: "shortdescription", value: shortDescription },
          preventDefault: () => {},
          stopPropagation: () => {},
        };

        handleInputChange(shortEvent as any);
      }

      if (layoutDescription) {
        // Create an event-like object to mimic handleInputChange behavior
        const layoutEvent = {
          target: { name: "descriptionlarge", value: layoutDescription },
          currentTarget: { name: "descriptionlarge", value: layoutDescription },
          preventDefault: () => {},
          stopPropagation: () => {},
        };

        handleInputChange(layoutEvent as any);
      }

      if (detailedDescription) {
        const detailedEvent = {
          target: { name: "descriptionextralarge", value: detailedDescription },
          currentTarget: {
            name: "descriptionextralarge",
            value: detailedDescription,
          },
          preventDefault: () => {},
          stopPropagation: () => {},
        };

        handleInputChange(detailedEvent as any);
      }

      toast.success(
        t(
          "descriptions.generationSuccess",
          "Beschreibungen erfolgreich generiert",
        ),
        { id: "generate-descriptions" },
      );
    } catch (error) {
      console.error("Error generating descriptions:", error);
      toast.error(
        t(
          "descriptions.generationFailed",
          "Fehler beim Generieren der Beschreibungen",
        ),
        { id: "generate-descriptions" },
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-gray-800 text-lg font-medium">
              {t("descriptions.title")}
            </h3>
            <p className="text-gray-600 mt-1">{t("descriptions.subtitle")}</p>
          </div>

          {/* Generate Descriptions Button */}
          <button
            type="button"
            onClick={generateDescriptions}
            disabled={isGenerating}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center transition-colors"
          >
            {isGenerating ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                {t("descriptions.generating", "Werden generiert...")}
              </>
            ) : (
              <>
                {t("descriptions.generateButton", "Beschreibungen generieren")}
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("descriptions.shortDescription")}
              {autoFilledFields.includes("shortdescription") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <textarea
              name="shortdescription"
              value={placeholders.shortdescription || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                autoFilledFields.includes("shortdescription")
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-white border border-gray-300"
              }`}
              placeholder={t("descriptions.shortDescriptionPlaceholder")}
              rows={2}
            />
            <p className="mt-1 text-sm text-gray-500">
              {t(
                "descriptions.shortDescriptionHelp",
                "Kurze Beschreibung in einem Satz.",
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("descriptions.layoutDescription")}
              {autoFilledFields.includes("descriptionlarge") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <textarea
              name="descriptionlarge"
              value={placeholders.descriptionlarge || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                autoFilledFields.includes("descriptionlarge")
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-white border border-gray-300"
              }`}
              placeholder={t("descriptions.layoutDescriptionPlaceholder")}
              rows={4}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("descriptions.detailedDescription")}
              {autoFilledFields.includes("descriptionextralarge") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <textarea
              name="descriptionextralarge"
              value={placeholders.descriptionextralarge || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                autoFilledFields.includes("descriptionextralarge")
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-white border border-gray-300"
              }`}
              placeholder={t("descriptions.detailedDescriptionPlaceholder")}
              rows={8}
              style={{ whiteSpace: "pre-wrap" }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionsStep;
