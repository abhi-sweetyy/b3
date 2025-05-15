"use client";

import React, { useState, useRef, useEffect } from "react";
import mammoth from "mammoth";
import { toast } from "react-hot-toast";
import { PropertyPlaceholders } from "@/types/placeholders";
import { useTranslation } from "react-i18next";
import i18n from "@/app/i18n";
import { useLanguage } from "@/app/contexts/LanguageContext";
import { cities, cityNames } from "@/data/cityData"; // Import city data

// Erweitern des globalen Window-Objekts um Google Maps Typen
declare global {
  interface Window {
    google: {
      maps: {
        places: {
          Autocomplete: new (
            input: HTMLInputElement,
            options?: google.maps.places.AutocompleteOptions,
          ) => google.maps.places.Autocomplete;
        };
      };
    };
  }
}

interface BasicInfoStepProps {
  placeholders: PropertyPlaceholders;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
    data?: Partial<PropertyPlaceholders>,
  ) => void;
  handleCityChange: (city: string) => void;
  handleDocumentUpload: (
    text: string,
    skipDescriptions?: boolean,
  ) => Promise<void>;
  autoFilledFields: string[];
  docText?: string; // Add prop for document text
  setDocText?: (text: string) => void; // Add prop for setting document text
}

const BasicInfoStep: React.FC<BasicInfoStepProps> = ({
  placeholders,
  handleInputChange,
  handleCityChange,
  handleDocumentUpload,
  autoFilledFields,
  docText = "", // Default to empty string if not provided
  setDocText = () => {}, // Default to no-op function if not provided
}) => {
  const { t, i18n: translationInstance } = useTranslation();
  const { currentLanguage } = useLanguage();

  console.log(
    "Maps API Key available:",
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? "Yes" : "No",
  );
  console.log(
    "Maps API Key first few chars:",
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      ? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY.substring(0, 5) + "..."
      : "Not found",
  );

  // Use local state only as fallback if parent state handlers aren't provided
  const [localDocText, setLocalDocText] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Google Maps Autocomplete Refs
  const autocompleteInputRef = useRef<HTMLInputElement>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);
  const [autocompleteInstance, setAutocompleteInstance] =
    useState<google.maps.places.Autocomplete | null>(null);

  // Get the effective document text (from props if available, otherwise local)
  const effectiveDocText = docText || localDocText;

  // Function to update document text that works with either parent or local state
  const updateDocText = (text: string) => {
    if (setDocText) {
      setDocText(text); // Update parent state if available
    } else {
      setLocalDocText(text); // Fall back to local state
    }
  };

  // Load Google Maps API
  useEffect(() => {
    // Check if Google Maps Script is already loaded
    if (window.google && window.google.maps) {
      setIsGoogleMapsLoaded(true);
      return;
    }

    // Create script element
    const googleMapsScript = document.createElement("script");
    // Replace with your actual API key
    googleMapsScript.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places&language=${currentLanguage || "de"}`;
    googleMapsScript.async = true;
    googleMapsScript.defer = true;

    // Event listener for script loaded
    googleMapsScript.addEventListener("load", () => {
      console.log("Google Maps script loaded");
      setIsGoogleMapsLoaded(true);
    });

    // Error handling
    googleMapsScript.addEventListener("error", (e) => {
      console.error("Google Maps script failed to load", e);
    });

    // Add script to document
    document.body.appendChild(googleMapsScript);

    // Cleanup function
    return () => {
      // Remove script if component unmounts
      const scriptTags = document.querySelectorAll(
        'script[src*="maps.googleapis.com/maps/api"]',
      );
      scriptTags.forEach((tag) => {
        if (tag && tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
    };
  }, [currentLanguage]);

  // Initialize Autocomplete when Google Maps is loaded
  useEffect(() => {
    if (isGoogleMapsLoaded && autocompleteInputRef.current) {
      try {
        // Create Autocomplete instance
        const options = {
          componentRestrictions: { country: "de" }, // Limit to Germany
          fields: ["address_components", "formatted_address"],
          types: ["address"], // Restrict to addresses only
        };

        const autocomplete = new window.google.maps.places.Autocomplete(
          autocompleteInputRef.current,
          options,
        );

        // Add place changed listener
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();

          if (!place.address_components) {
            console.error("No valid address selected");
            return;
          }

          // Extract address components
          let street = "";
          let houseNumber = "";
          let postalCode = "";
          let city = "";

          place.address_components.forEach((component) => {
            const types = component.types;

            if (types.includes("route")) {
              street = component.long_name;
            } else if (types.includes("street_number")) {
              houseNumber = component.long_name;
            } else if (types.includes("postal_code")) {
              postalCode = component.long_name;
            } else if (types.includes("locality")) {
              city = component.long_name;
            }
          });

          console.log("Parsed address:", {
            street,
            houseNumber,
            postalCode,
            city,
          });

          // Create synthetic events to update form fields
          const updateField = (name: string, value: string) => {
            // Create synthetic event object
            const event = {
              target: {
                name,
                value,
              },
              // Add additional properties expected by handleInputChange
              currentTarget: { name, value },
              preventDefault: () => {},
              stopPropagation: () => {},
            } as unknown as React.ChangeEvent<HTMLInputElement>;

            handleInputChange(event);
          };

          // NEW CODE: Create a data update object for city to ensure description generation
          let citySent = false;
          if (city) {
            // Wait for other address fields to be updated
            setTimeout(() => {
              // Create a dataToUpdate object with cityname
              const dataToUpdate: Partial<PropertyPlaceholders> = {
                cityname: city,
              };

              // Create a synthetic event for city
              const cityEvent = {
                target: {
                  name: "cityname",
                  value: city,
                },
                currentTarget: { name: "cityname", value: city },
                preventDefault: () => {},
                stopPropagation: () => {},
              } as unknown as React.ChangeEvent<HTMLSelectElement>;

              // Use handleInputChange with dataToUpdate to ensure description is updated
              handleInputChange(cityEvent, dataToUpdate);
              citySent = true;
            }, 100);
          }
          // END NEW CODE

          // Update address fields
          if (street) updateField("address_street", street);
          if (houseNumber) updateField("address_house_nr", houseNumber);
          if (postalCode) updateField("address_plz", postalCode);

          // NEW CODE: Only try to match city if we didn't send it directly
          if (city && !citySent) {
            // Find exact match first...
            // (rest of city matching code unchanged)
          }
          // END NEW CODE

          // Clear the autocomplete input
          if (autocompleteInputRef.current) {
            autocompleteInputRef.current.value = "";
          }
        });

        setAutocompleteInstance(autocomplete);
      } catch (error) {
        console.error("Error initializing Google Maps Autocomplete:", error);
      }
    }
  }, [isGoogleMapsLoaded, handleInputChange, t]);

  // --- BEGIN: Handle City Selection ---
  const handleCitySelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    const cityData = cities[selectedCity];

    console.group("BasicInfoStep - City Selection");
    console.log("Selected city:", selectedCity);
    console.log("City data found:", cityData ? "YES" : "NO");
    console.groupEnd();

    // Create data update object with ALL city data
    const dataToUpdate: Partial<PropertyPlaceholders> = {
      cityname: selectedCity,
    };

    // Ensure city data is properly added
    if (cityData) {
      // Explicitly set all city-related fields
      dataToUpdate.city_text1 = cityData.text1;
      dataToUpdate.cityimg1 = cityData.img1;
      dataToUpdate.cityimg2 = cityData.img2;
      dataToUpdate.cityimg3 = cityData.img3;

      console.log("City data being sent to parent:", {
        city: selectedCity,
        text1: cityData.text1 ? "PRESENT" : "MISSING",
        img1: cityData.img1 ? "PRESENT" : "MISSING",
        img2: cityData.img2 ? "PRESENT" : "MISSING",
        img3: cityData.img3 ? "PRESENT" : "MISSING",
      });
    }

    // Call handleInputChange directly with the updated data
    handleInputChange(e, dataToUpdate);
  };
  // --- END: Handle City Selection ---

  // This useEffect might no longer be needed for forcing updates,
  // but keep it for logging if desired. Added `t` dependency.
  useEffect(() => {
    console.log(
      "Language/t updated in BasicInfoStep:",
      currentLanguage,
      translationInstance.language,
    );
    // forceUpdate({}); // Removed force update
  }, [currentLanguage, translationInstance.language, t]); // Added t

  // Log placeholders and translation test. Added `t` dependency.
  useEffect(() => {
    console.log(
      "BasicInfoStep rendered/updated with placeholders:",
      placeholders,
    );
    console.log("Auto-filled fields:", autoFilledFields);

    const documentTitle = t("basicInfo.documentTitle");
    const selectCityText = t("basicInfo.selectCity"); // Log the problematic key
    console.log("Translation test - documentTitle:", documentTitle);
    console.log("Translation test - selectCity:", selectCityText);
    if (
      documentTitle === "basicInfo.documentTitle" ||
      selectCityText === "basicInfo.selectCity"
    ) {
      console.warn(
        "Translation not working correctly - showing key instead of value",
      );
    }
  }, [placeholders, autoFilledFields, t]); // Added t

  // Add useEffect to log object_type prop changes and translation
  useEffect(() => {
    if (placeholders.object_type) {
      console.log(
        `[BasicInfoStep] placeholder.object_type updated to: ${placeholders.object_type}`,
      );
      console.log(
        `[BasicInfoStep] Translation for objectType.${placeholders.object_type}: ${t(`objectType.${placeholders.object_type}`)}`,
      );
    }
  }, [placeholders.object_type, t]);

  const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    updateDocText(e.target.value);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessing(true);
      setUploadError(null);

      // Process different file types
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        updateDocText(result.value);
      } else if (file.name.endsWith(".txt") || file.name.endsWith(".rtf")) {
        const text = await file.text();
        updateDocText(text);
      } else {
        setUploadError(t("basicInfo.fileTypeError"));
        setIsProcessing(false);
        return;
      }

      setIsProcessing(false);
    } catch (error) {
      console.error("Error processing file:", error);
      setUploadError(t("basicInfo.processError"));
      setIsProcessing(false);
    }
  };

  const handleCitySelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCity = e.target.value;
    // Rufe die spezialisierte Funktion auf
    handleCityChange(selectedCity);
  };

  const processDocument = async () => {
    if (!effectiveDocText.trim()) {
      setUploadError(t("basicInfo.emptyDocError"));
      return;
    }

    try {
      setIsProcessing(true);
      setUploadError(null);

      console.log(
        "Processing document with text:",
        effectiveDocText.substring(0, 50) + "...",
      );

      try {
        // Pass true to skip generating descriptions
        await handleDocumentUpload(effectiveDocText, true); // Add this parameter
        console.log("Document processed successfully");
      } catch (error) {
        console.error("Error processing document:", error);
        setUploadError(t("basicInfo.aiProcessError"));
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const commonInputClass =
    "w-full rounded-md px-3 py-2 text-gray-800 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const commonLabelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm">
        <h3 className="text-gray-800 text-lg font-medium mb-4">
          {t("basicInfo.documentTitle")}
        </h3>
        <p className="text-gray-600 mb-4">
          {t("basicInfo.uploadInstructions")}
        </p>

        <div className="mb-4">
          <div className="flex items-center justify-center w-full">
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 border-gray-300 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <svg
                  className="w-8 h-8 mb-3 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  ></path>
                </svg>
                <p className="mb-2 text-sm text-gray-600">
                  <span className="font-semibold">
                    {t("basicInfo.clickToUpload")}
                  </span>{" "}
                  {t("basicInfo.dragDrop")}
                </p>
                <p className="text-xs text-gray-500">
                  {t("basicInfo.supportedFormats")}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept=".docx,.txt,.rtf"
                onChange={handleFileUpload}
              />
            </label>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 text-sm mb-2">{t("basicInfo.orPaste")}</p>
          <textarea
            value={effectiveDocText}
            onChange={handleTextAreaChange}
            rows={10}
            className="w-full bg-white border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={t("basicInfo.pasteHere")}
          ></textarea>
        </div>

        {uploadError && (
          <div className="bg-red-100 border border-red-300 text-red-600 p-3 rounded-md mb-4 flex items-center">
            <svg
              className="w-5 h-5 mr-2 flex-shrink-0"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <span>{uploadError}</span>
          </div>
        )}

        <button
          type="button"
          onClick={processDocument}
          disabled={isProcessing || !effectiveDocText.trim()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-50 disabled:hover:bg-blue-600"
        >
          {isProcessing ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
              {t("basicInfo.processing")}
            </>
          ) : (
            <>
              <svg
                className="w-5 h-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              {t("basicInfo.extractInfo")}
            </>
          )}
        </button>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-gray-800 text-lg font-medium mb-4">
          {t("basicInfo.requiredInfo")}
        </h3>
        <p className="text-gray-600 mb-4">{t("basicInfo.fillEdit")}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("basicInfo.propertyTitle")}*
              {autoFilledFields.includes("title") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <input
              type="text"
              name="title"
              value={placeholders.title || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                autoFilledFields.includes("title")
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-white border border-gray-300"
              }`}
              placeholder={t("basicInfo.enterTitle")}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("basicInfo.price")}*
              {autoFilledFields.includes("price") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <input
              type="text"
              name="price"
              value={placeholders.price || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                autoFilledFields.includes("price")
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-white border border-gray-300"
              }`}
              placeholder={t("basicInfo.enterPrice")}
              required
            />
          </div>

          {/* Short Description Field - Added here */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("descriptions.shortDescription")}*
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
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              {t("descriptions.shortDescriptionHelp")}
            </p>
          </div>

          {/* Google Maps Autocomplete Input */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t(
                "basicInfo.addressSearch",
                "Adresssuche mit Autovervollständigung",
              )}
            </label>
            <input
              ref={autocompleteInputRef}
              type="text"
              className="w-full rounded-md px-3 py-2 text-gray-800 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={t(
                "basicInfo.enterAddress",
                "Adresse eingeben für Vorschläge",
              )}
            />
            <small className="text-gray-500 mt-1 block">
              {t(
                "basicInfo.addressSearchHelp",
                "Gib eine Adresse ein und wähle aus den Vorschlägen",
              )}
            </small>
          </div>

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                {t("basicInfo.addressStreet")}*
                {autoFilledFields.includes("address_street") && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {t("basicInfo.aiFilled")}
                  </span>
                )}
              </label>
              <input
                type="text"
                name="address_street"
                value={placeholders.address_street || ""}
                onChange={handleInputChange}
                className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                  autoFilledFields.includes("address_street")
                    ? "bg-blue-50 border border-blue-300"
                    : "bg-white border border-gray-300"
                }`}
                placeholder={t("basicInfo.enterAddressStreet")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                {t("basicInfo.addressHouseNr")}*
                {autoFilledFields.includes("address_house_nr") && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {t("basicInfo.aiFilled")}
                  </span>
                )}
              </label>
              <input
                type="text"
                name="address_house_nr"
                value={placeholders.address_house_nr || ""}
                onChange={handleInputChange}
                className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                  autoFilledFields.includes("address_house_nr")
                    ? "bg-blue-50 border border-blue-300"
                    : "bg-white border border-gray-300"
                }`}
                placeholder={t("basicInfo.enterAddressHouseNr")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                {t("basicInfo.addressPlz")}*
                {autoFilledFields.includes("address_plz") && (
                  <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                    {t("basicInfo.aiFilled")}
                  </span>
                )}
              </label>
              <input
                type="text"
                name="address_plz"
                value={placeholders.address_plz || ""}
                onChange={handleInputChange}
                className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                  autoFilledFields.includes("address_plz")
                    ? "bg-blue-50 border border-blue-300"
                    : "bg-white border border-gray-300"
                }`}
                placeholder={t("basicInfo.enterAddressPlz")}
                required
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t("basicInfo.addressCity")}*
              </label>
              <select
                name="cityname"
                value={placeholders.cityname || ""}
                onChange={handleCitySelection}
                required
                className="w-full rounded-md px-3 py-2 text-gray-800 bg-white border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="" disabled>
                  {t("basicInfo.selectCity")}
                </option>
                {cityNames.map((cityName) => (
                  <option key={cityName} value={cityName}>
                    {cityName}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("basicInfo.dateAvailable")}
              {autoFilledFields.includes("date_available") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <input
              type="text"
              name="date_available"
              value={placeholders.date_available || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                autoFilledFields.includes("date_available")
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-white border border-gray-300"
              }`}
              placeholder={t("basicInfo.enterDateAvailable")}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("basicInfo.objectType")}*
              {autoFilledFields.includes("object_type") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <select
              name="object_type"
              value={placeholders.object_type || ""}
              onChange={handleInputChange}
              required
              className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                autoFilledFields.includes("object_type")
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-white border border-gray-300"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">{t("basicInfo.selectObjectType")}</option>
              <option value="apartment">{t("objectType.apartment")}</option>
              <option value="family_house">
                {t("objectType.family_house")}
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("basicInfo.offerType")}*
              {autoFilledFields.includes("offer_type") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <select
              name="offer_type"
              value={placeholders.offer_type || ""}
              onChange={handleInputChange}
              required
              className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                autoFilledFields.includes("offer_type")
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-white border border-gray-300"
              } focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            >
              <option value="">{t("basicInfo.selectOfferType")}</option>
              <option value="for_sale">{t("offerType.for_sale")}</option>
              <option value="for_rent">{t("offerType.for_rent")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("basicInfo.constructionYear")}
              {autoFilledFields.includes("construction_year") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <input
              type="text"
              name="construction_year"
              value={placeholders.construction_year || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                autoFilledFields.includes("construction_year")
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-white border border-gray-300"
              }`}
              placeholder={t("basicInfo.enterConstructionYear")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              {t("basicInfo.maintenanceFees")}
              {autoFilledFields.includes("maintenance_fees") && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                  {t("basicInfo.aiFilled")}
                </span>
              )}
            </label>
            <input
              type="text"
              name="maintenance_fees"
              value={placeholders.maintenance_fees || ""}
              onChange={handleInputChange}
              className={`w-full rounded-md px-3 py-2 text-gray-800 ${
                autoFilledFields.includes("maintenance_fees")
                  ? "bg-blue-50 border border-blue-300"
                  : "bg-white border border-gray-300"
              }`}
              placeholder={t("basicInfo.enterMaintenanceFees")}
            />
          </div>
        </div>

        {/* Commission Section - Integrated from CommissionStep */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-gray-800 text-lg font-medium mb-4">
            {t("commission.title")}
          </h3>
          <p className="text-gray-600 mb-4">{t("commission.enterInfo")}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Buyer Commission */}
            <div>
              <label className={commonLabelClass}>
                {t("commission.buyer")}
              </label>
              <input
                type="text"
                name="buyer_commission"
                value={placeholders.buyer_commission || ""}
                onChange={handleInputChange}
                className={commonInputClass}
                placeholder={t("commission.enterBuyer")}
              />
            </div>

            {/* Seller Commission */}
            <div>
              <label className={commonLabelClass}>
                {t("commission.seller")}
              </label>
              <input
                type="text"
                name="seller_commission"
                value={placeholders.seller_commission || ""}
                onChange={handleInputChange}
                className={commonInputClass}
                placeholder={t("commission.enterSeller")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicInfoStep;
