"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface GoogleMapsLocationProps {
  address: string;
  onMapImageGenerated: (imageUrl: string) => void;
  existingImageUrl?: string;
  apiKey?: string;
}

const GoogleMapsLocationComponent: React.FC<GoogleMapsLocationProps> = ({
  address,
  onMapImageGenerated,
  existingImageUrl,
  apiKey,
}) => {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [mapUrl, setMapUrl] = useState<string | null>(existingImageUrl || null);
  const [isGeneratingMap, setIsGeneratingMap] = useState<boolean>(false);

  // Debug: Log API key status
  useEffect(() => {
    console.log(
      "GoogleMapsLocationComponent: API Key vorhanden?",
      apiKey ? "Ja" : "Nein",
    );
    console.log("GoogleMapsLocationComponent: Adresse:", address);
  }, [apiKey, address]);

  // Generate Static Map URL
  const generateStaticMapUrl = (address: string): string => {
    // Encode the address for URL
    const encodedAddress = encodeURIComponent(address);

    // Add a cache-busting parameter to prevent caching issues
    const cacheBuster = new Date().getTime();

    // Return the complete URL with all necessary parameters
    return `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=14&size=800x450&scale=4&maptype=roadmap&markers=color:red%7C${encodedAddress}&key=${apiKey}&_=${cacheBuster}`;
  };

  // Generate map on component mount or address change
  useEffect(() => {
    if (!address || !apiKey) {
      setError(t("maps.missingData", "Address or API key is missing"));
      return;
    }

    // Only generate a new map if there isn't one already or if explicitly requested
    if (!existingImageUrl && !mapUrl) {
      try {
        setIsGeneratingMap(true);
        // Generate a static map URL
        const url = generateStaticMapUrl(address);

        // Test the image URL by loading it first
        const img = new Image();
        img.onload = () => {
          console.log("Map image loaded successfully");
          setMapUrl(url);
          onMapImageGenerated(url);
          setError(null);
          setIsGeneratingMap(false);
        };

        img.onerror = () => {
          console.error("Failed to load map image");
          setError(t("maps.generateError", "Failed to generate map image"));
          setIsGeneratingMap(false);
        };

        img.src = url;
      } catch (err) {
        console.error("Error generating map URL:", err);
        setError(t("maps.generateError", "Failed to generate map image"));
        setIsGeneratingMap(false);
      }
    }
  }, [address, apiKey, existingImageUrl, onMapImageGenerated, t, mapUrl]);

  // Update map image
  const updateMapImage = () => {
    if (!address || !apiKey) {
      setError(t("maps.missingData", "Address or API key is missing"));
      return;
    }

    try {
      setIsGeneratingMap(true);
      const url = generateStaticMapUrl(address);

      // Test the image URL by loading it first
      const img = new Image();
      img.onload = () => {
        setMapUrl(url);
        onMapImageGenerated(url);
        setError(null);
        setIsGeneratingMap(false);
      };

      img.onerror = () => {
        setError(t("maps.updateError", "Failed to update map image"));
        setIsGeneratingMap(false);
      };

      img.src = url;
    } catch (err) {
      console.error("Error updating map image:", err);
      setError(t("maps.updateError", "Failed to update map image"));
      setIsGeneratingMap(false);
    }
  };

  return (
    <div className="w-full">
      <div className="w-full rounded-lg border border-gray-300 overflow-hidden p-4 bg-gray-50">
        {error ? (
          <div className="flex items-center justify-center h-64 bg-red-50 rounded-lg border border-red-200">
            <div className="text-center p-4">
              <svg
                className="h-8 w-8 text-red-500 mx-auto mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                ></path>
              </svg>
              <p className="text-red-600">{error}</p>
              <button
                onClick={updateMapImage}
                className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
              >
                {t("maps.retry", "Retry")}
              </button>
            </div>
          </div>
        ) : (
          <>
            {isGeneratingMap ? (
              <div className="flex flex-col items-center justify-center h-64">
                <div className="h-10 w-10 border-t-2 border-b-2 border-blue-500 rounded-full animate-spin mb-4"></div>
                <p className="text-gray-600">
                  {t("maps.generating", "Generating map...")}
                </p>
              </div>
            ) : mapUrl ? (
              <>
                {/* Mit fixierten Abmessungen um sicherzustellen, dass das Seitenverhältnis erhalten bleibt */}
                <div
                  className="w-full mb-4 overflow-hidden rounded-lg"
                  style={{
                    width: "100%",
                    position: "relative",
                    /* Erzwinge das 16:9 Verhältnis als Container */
                    paddingBottom: "56.25%" /* 9/16 = 0.5625 = 56.25% */,
                  }}
                >
                  <img
                    src={mapUrl}
                    alt={t("maps.locationMap", "Property Location Map")}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={updateMapImage}
                    className="px-3 py-1.5 bg-white rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 border border-gray-300"
                  >
                    {t("maps.updateImage", "Update Map")}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-64">
                <p className="text-gray-600 mb-3">
                  {t("maps.noMap", "No map available yet")}
                </p>
                <button
                  onClick={updateMapImage}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  {t("maps.generateMap", "Generate Map")}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default GoogleMapsLocationComponent;
