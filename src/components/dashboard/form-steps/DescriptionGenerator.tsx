"use client";

import React, { useState } from "react";
import { PropertyPlaceholders } from "@/types/placeholders";
import { toast } from "react-hot-toast";

interface DescriptionGeneratorProps {
  placeholders: PropertyPlaceholders;
  updatePlaceholder: (key: keyof PropertyPlaceholders, value: string) => void;
  rawPropertyData: string;
}

const DescriptionGenerator: React.FC<DescriptionGeneratorProps> = ({
  placeholders,
  updatePlaceholder,
  rawPropertyData,
}) => {
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({
    shortdescription: false,
    descriptionlarge: false,
    descriptionextralarge: false,
  });

  const generateDescription = async (field: keyof PropertyPlaceholders) => {
    if (!rawPropertyData && !placeholders.title && !placeholders.address) {
      toast.error(
        "Please provide property information before generating descriptions",
      );
      return;
    }

    try {
      setIsGenerating((prev) => ({ ...prev, [field]: true }));

      // Prepare the prompt for this specific field
      let prompt = "";
      let contextInfo = "";

      // Build context from existing placeholders
      if (placeholders.title)
        contextInfo += `Property: ${placeholders.title}\n`;
      if (placeholders.address)
        contextInfo += `Address: ${placeholders.address}\n`;
      if (placeholders.price) contextInfo += `Price: ${placeholders.price}\n`;

      // Determine what kind of description we need
      switch (field) {
        case "shortdescription":
          prompt = `Generate a ONE sentence description of this property, mentioning type (apartment, house, etc), 
                   whether it's for rent or sale (infer from context), and location.`;
          break;
        case "descriptionlarge":
          prompt = `Generate TWO PARAGRAPHS describing this property's location, using the address.
                   Include details like key features of the surrounding area, such as its proximity to parks, green spaces, public transport, shops, restaurants, schools and other amenities.`;
          break;
        case "descriptionextralarge":
          prompt = `Generate a COMPREHENSIVE multi-paragraph description of 12 - 15 sentences of this property including
                   details about rooms, features, construction, materials, neighborhood, and special attributes.
                   This should be the most detailed description, suitable for marketing materials.`;
          break;
      }

      // Combine context with the raw property data
      const fullPrompt = contextInfo + "\n\n" + (rawPropertyData || "");

      // Call OpenAI API to generate description
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || ""}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "Real Estate Description Generator",
          },
          body: JSON.stringify({
            model: "meta-llama/llama-4-maverick:free",
            messages: [
              {
                role: "system",
                content: prompt,
              },
              {
                role: "user",
                content: fullPrompt,
              },
            ],
            temperature: field === "shortdescription" ? 0.5 : 0.7,
            max_tokens:
              field === "shortdescription"
                ? 80
                : field === "descriptionlarge"
                  ? 200
                  : 1000,
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to generate description");
      }

      const data = await response.json();
      const generatedText = data.choices?.[0]?.message?.content || "";

      // Update the placeholder with generated text
      updatePlaceholder(field, generatedText.trim());
      toast.success(
        `${field === "shortdescription" ? "Short" : field === "descriptionlarge" ? "Site Plan" : "Detailed"} description generated!`,
      );
    } catch (error) {
      console.error(`Error generating ${field}:`, error);
      toast.error(
        `Failed to generate ${field === "shortdescription" ? "short" : field === "descriptionlarge" ? "site plan" : "detailed"} description`,
      );
    } finally {
      setIsGenerating((prev) => ({ ...prev, [field]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-white text-lg font-medium mb-4">
          AI Description Generator
        </h3>
        <p className="text-gray-400 mb-6">
          Generate professional descriptions for your property
        </p>

        <div className="space-y-6">
          {/* Short Description */}
          <div className="bg-[#141f38] border border-[#1c2a47] rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-white font-medium">Short Description</h4>
                <p className="text-sm text-gray-400">
                  One sentence summary for listings
                </p>
              </div>
              <button
                onClick={() => generateDescription("shortdescription")}
                disabled={isGenerating.shortdescription}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center disabled:opacity-50"
              >
                {isGenerating.shortdescription ? (
                  <>
                    <svg
                      className="animate-spin mr-2 h-4 w-4 text-white"
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
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Generate
                  </>
                )}
              </button>
            </div>
            <textarea
              value={placeholders.shortdescription}
              onChange={(e) =>
                updatePlaceholder("shortdescription", e.target.value)
              }
              rows={2}
              className="w-full bg-[#1D2839] border border-[#2A3441] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Short property description..."
            />
          </div>

          {/* Site Plan Description */}
          <div className="bg-[#141f38] border border-[#1c2a47] rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-white font-medium">
                  Site Plan Description
                </h4>
                <p className="text-sm text-gray-400">
                  Details about property layout and dimensions
                </p>
              </div>
              <button
                onClick={() => generateDescription("descriptionlarge")}
                disabled={isGenerating.descriptionlarge}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center disabled:opacity-50"
              >
                {isGenerating.descriptionlarge ? (
                  <>
                    <svg
                      className="animate-spin mr-2 h-4 w-4 text-white"
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
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Generate
                  </>
                )}
              </button>
            </div>
            <textarea
              value={placeholders.descriptionlarge}
              onChange={(e) =>
                updatePlaceholder("descriptionlarge", e.target.value)
              }
              rows={4}
              className="w-full bg-[#1D2839] border border-[#2A3441] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Description of property layout and dimensions..."
            />
          </div>

          {/* Detailed Property Description */}
          <div className="bg-[#141f38] border border-[#1c2a47] rounded-lg p-4">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-white font-medium">
                  Detailed Property Description
                </h4>
                <p className="text-sm text-gray-400">
                  Comprehensive description for marketing materials
                </p>
              </div>
              <button
                onClick={() => generateDescription("descriptionextralarge")}
                disabled={isGenerating.descriptionextralarge}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center disabled:opacity-50"
              >
                {isGenerating.descriptionextralarge ? (
                  <>
                    <svg
                      className="animate-spin mr-2 h-4 w-4 text-white"
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
                    Generating...
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Generate
                  </>
                )}
              </button>
            </div>
            <textarea
              value={placeholders.descriptionextralarge}
              onChange={(e) =>
                updatePlaceholder("descriptionextralarge", e.target.value)
              }
              rows={8}
              className="w-full bg-[#1D2839] border border-[#2A3441] rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Detailed description of the property..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DescriptionGenerator;
