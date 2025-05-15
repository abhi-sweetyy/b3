"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ImageUploader from "@/components/ImageUploader";

interface ProjectOverviewSectionProps {
  image: string;
  onImageUpdate: (
    urls: string[],
    orientation: "horizontal" | "vertical" | "square",
  ) => void;
  onClick?: (e: React.MouseEvent) => void;
}

const ProjectOverviewSection: React.FC<ProjectOverviewSectionProps> = ({
  image,
  onImageUpdate,
  onClick,
}) => {
  const { t } = useTranslation();
  // Fix the useState initialization
  const [imageOrientation, setImageOrientation] = useState("horizontal");

  // Debug: Log when component renders/updates but don't display to user
  console.log(
    "ProjectOverviewSection rendered/updated, image:",
    image ? "present" : "none",
  );

  // Force orientation detection when image changes (keep this for functionality)
  useEffect(() => {
    if (image) {
      // Create a new Image element to check dimensions
      const img = new Image();
      img.onload = () => {
        let orientation: "horizontal" | "vertical" | "square";
        const aspectRatio = img.width / img.height;

        if (aspectRatio > 1.05) {
          orientation = "horizontal";
        } else if (aspectRatio < 0.95) {
          orientation = "vertical";
        } else {
          orientation = "square";
        }

        setImageOrientation(orientation);
        onImageUpdate([image], orientation);
      };

      // Add cache buster
      const cachedUrl = `${image}${image.includes("?") ? "&" : "?"}nocache=${Date.now()}`;
      img.src = cachedUrl;
    }
  }, [image, onImageUpdate]);

  // Handle image upload
  const handleImageUploaded = (urls: string[]) => {
    if (urls.length === 0) {
      onImageUpdate([], "horizontal");
      return;
    }

    // Force manual orientation detection here
    if (urls[0]) {
      const img = new Image();
      img.onload = () => {
        let orientation: "horizontal" | "vertical" | "square";
        const aspectRatio = img.width / img.height;

        if (aspectRatio > 1.05) {
          orientation = "horizontal";
        } else if (aspectRatio < 0.95) {
          orientation = "vertical";
        } else {
          orientation = "square";
        }

        setImageOrientation(orientation);
        onImageUpdate(urls, orientation);
      };

      const cachedUrl = `${urls[0]}${urls[0].includes("?") ? "&" : "?"}nocache=${Date.now()}`;
      img.src = cachedUrl;
    }
  };

  return (
    <div className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {t("imagesStep.projectOverview")}
      </h3>

      <p className="text-gray-700 mb-4">
        {t("imagesStep.projectOverviewDesc")}
      </p>

      <ImageUploader
        existingImages={image ? [image] : []}
        onImagesUploaded={handleImageUploaded}
        limit={1}
        onClick={onClick}
      />
    </div>
  );
};

export default ProjectOverviewSection;
