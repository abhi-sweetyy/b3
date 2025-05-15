"use client";

import React, { useState, useEffect } from "react";

interface ImageOrientationDetectorProps {
  imageUrl: string;
  onOrientationDetected: (
    orientation: "horizontal" | "vertical" | "square",
  ) => void;
}

/**
 * Component that detects the orientation of an image and reports it
 * This runs when the image source changes and notifies the parent component
 */
const ImageOrientationDetector: React.FC<ImageOrientationDetectorProps> = ({
  imageUrl,
  onOrientationDetected,
}) => {
  const [orientation, setOrientation] = useState<
    "horizontal" | "vertical" | "square" | null
  >(null);

  useEffect(() => {
    if (!imageUrl) {
      console.log("ImageOrientationDetector: No image URL provided");
      return;
    }

    console.log(
      `ImageOrientationDetector: Will detect orientation for image: ${imageUrl.substring(0, 100)}...`,
    );

    // Create an image element to load the image and get its dimensions
    const img = new Image();

    img.onload = () => {
      // Force log the dimensions to see what we're actually getting
      console.log(
        `ImageOrientationDetector: Image loaded with dimensions: ${img.width}x${img.height}`,
      );

      // Determine orientation based on aspect ratio
      let detectedOrientation: "horizontal" | "vertical" | "square";

      // Calculate aspect ratio for more precise detection
      const aspectRatio = img.width / img.height;
      console.log(
        `ImageOrientationDetector: Image aspect ratio: ${aspectRatio}`,
      );

      if (aspectRatio > 1.05) {
        detectedOrientation = "horizontal";
      } else if (aspectRatio < 0.95) {
        detectedOrientation = "vertical";
      } else {
        detectedOrientation = "square";
      }

      console.log(
        `ImageOrientationDetector: Final detected orientation: ${detectedOrientation}`,
      );

      // Update local state
      setOrientation(detectedOrientation);

      // IMPORTANT: Ensure this callback actually runs by adding an explicit check
      console.log(
        `ImageOrientationDetector: Calling onOrientationDetected with: ${detectedOrientation}`,
      );
      onOrientationDetected(detectedOrientation);

      // Double check that the function exists
      if (typeof onOrientationDetected !== "function") {
        console.error(
          "ImageOrientationDetector: onOrientationDetected is not a function!",
        );
      }
    };

    img.onerror = (error) => {
      console.error(
        "ImageOrientationDetector: Failed to load image for orientation detection",
        error,
      );
    };

    // Force a random parameter to prevent caching which might be causing issues
    const cachedUrl = `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}nocache=${Date.now()}`;
    console.log(
      `ImageOrientationDetector: Loading image with cache-busting: ${cachedUrl.substring(0, 100)}...`,
    );
    img.src = cachedUrl;

    // Cleanup
    return () => {
      console.log("ImageOrientationDetector: Cleaning up image load handlers");
      img.onload = null;
      img.onerror = null;
    };
  }, [imageUrl, onOrientationDetected]);

  // For debugging - render information in a small visible element
  return (
    <div className="text-xs text-gray-500 mb-1">
      Detected orientation: {orientation || "detecting..."}
    </div>
  );
};

export default ImageOrientationDetector;
