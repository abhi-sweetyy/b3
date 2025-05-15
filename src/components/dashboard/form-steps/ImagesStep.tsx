"use client";

import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ImageUploader from "@/components/ImageUploader";
import GoogleMapsLocationComponent from "@/components/GoogleMapsLocationComponent";
import { toast } from "react-hot-toast";

interface ImagesStepProps {
  uploadedImages: any;
  logoUrl?: string;
  setUploadedImages: (images: any) => void;
  setLogoUrl?: (url: string) => void;
  selectedPages?: Record<string, boolean>;
  propertyAddress?: string;
  selectedTemplate?: string;
  onTemplatePageSelection?: (
    type: "interior" | "exterior",
    pages: number[],
  ) => void;
}

export function ImagesStep({
  uploadedImages,
  logoUrl,
  setUploadedImages,
  setLogoUrl,
  selectedPages = {},
  propertyAddress = "",
  selectedTemplate = "",
  onTemplatePageSelection,
}: ImagesStepProps) {
  const { t } = useTranslation();
  const [logo, setLogo] = useState<string>(logoUrl || "");
  const [agent, setAgent] = useState<string>(uploadedImages["{{agent}}"] || "");

  // State for storing interior and exterior images
  const [exteriorImages, setExteriorImages] = useState<string[]>(
    uploadedImages.exteriorImages && Array.isArray(uploadedImages.exteriorImages) 
      ? [...uploadedImages.exteriorImages] 
      : []
  );
  
  const [interiorImages, setInteriorImages] = useState<string[]>(
    uploadedImages.interiorImages && Array.isArray(uploadedImages.interiorImages)
      ? [...uploadedImages.interiorImages]
      : []
  );

  const [exteriorOrientations, setExteriorOrientations] = useState<
    Record<string, string>
  >(uploadedImages.exteriorOrientations || {});
  
  const [interiorOrientations, setInteriorOrientations] = useState<
    Record<string, string>
  >(uploadedImages.interiorOrientations || {});

  // State for storing selected layout pages
  const [exteriorLayoutPages, setExteriorLayoutPages] = useState<number[]>(
    uploadedImages.exteriorLayoutPages && Array.isArray(uploadedImages.exteriorLayoutPages)
      ? [...uploadedImages.exteriorLayoutPages]
      : []
  );
  
  const [interiorLayoutPages, setInteriorLayoutPages] = useState<number[]>(
    uploadedImages.interiorLayoutPages && Array.isArray(uploadedImages.interiorLayoutPages)
      ? [...uploadedImages.interiorLayoutPages]
      : []
  );

  // Debug logging
  console.log("Current uploadedImages:", uploadedImages);
  console.log("Interior images:", interiorImages);
  console.log("Interior orientations:", interiorOrientations);
  console.log("Interior layout pages:", interiorLayoutPages);
  console.log("Exterior images:", exteriorImages);
  console.log("Exterior orientations:", exteriorOrientations);
  console.log("Exterior layout pages:", exteriorLayoutPages);

  // Title image orientation
  const [titleImageOrientation, setTitleImageOrientation] = useState<
    "horizontal" | "vertical" | "square"
  >(uploadedImages.image1_orientation || "horizontal");

  // Initialize images from props on mount or when they change
  useEffect(() => {
    console.log("Initializing from props:", uploadedImages);

    // Check if uploadedImages has a value before proceeding
    if (!uploadedImages) {
      console.log("No uploadedImages provided, skipping initialization");
      return;
    }

    // Update titleImageOrientation from uploadedImages
    if (uploadedImages.image1_orientation) {
      setTitleImageOrientation(uploadedImages.image1_orientation);
    }

    // Update logo from props
    if (logoUrl) {
      setLogo(logoUrl);
    }

    // Update agent photo from uploadedImages
    if (uploadedImages["{{agent}}"]) {
      setAgent(uploadedImages["{{agent}}"]);
    }

    // Initialize exterior images
    const extImgs: string[] = [];

    // First check if there's an exteriorImages array directly
    if (
      uploadedImages.exteriorImages &&
      Array.isArray(uploadedImages.exteriorImages)
    ) {
      extImgs.push(...uploadedImages.exteriorImages);
    } else {
      // Fall back to individual placeholders
      for (let i = 1; i <= 6; i++) {
        const key = `{{exteriorImage${i}}}`;
        if (uploadedImages[key]) {
          extImgs.push(uploadedImages[key]);
        }
      }
    }

    if (extImgs.length > 0) {
      console.log("Found exterior images:", extImgs.length);
      setExteriorImages(extImgs);
    } else {
      // Clear exterior images if none found in props
      setExteriorImages([]);
    }

    // Initialize interior images
    const intImgs: string[] = [];

    // First check if there's an interiorImages array directly
    if (
      uploadedImages.interiorImages &&
      Array.isArray(uploadedImages.interiorImages)
    ) {
      intImgs.push(...uploadedImages.interiorImages);
    } else {
      // Fall back to individual placeholders
      for (let i = 1; i <= 6; i++) {
        const key = `{{interiorImage${i}}}`;
        if (uploadedImages[key]) {
          intImgs.push(uploadedImages[key]);
        }
      }
    }

    if (intImgs.length > 0) {
      console.log("Found interior images:", intImgs.length);
      setInteriorImages(intImgs);
    } else {
      // Clear interior images if none found in props
      setInteriorImages([]);
    }

    // Get existing orientation data if available
    if (uploadedImages.exteriorOrientations) {
      setExteriorOrientations(uploadedImages.exteriorOrientations);
    } else if (extImgs.length > 0) {
      // Reset orientations if not available but we have images
      setExteriorOrientations({});
    }

    if (uploadedImages.interiorOrientations) {
      setInteriorOrientations(uploadedImages.interiorOrientations);
    } else if (intImgs.length > 0) {
      // Reset orientations if not available but we have images
      setInteriorOrientations({});
    }

    // If we have existing layout pages, use those
    if (
      uploadedImages.exteriorLayoutPages &&
      Array.isArray(uploadedImages.exteriorLayoutPages)
    ) {
      setExteriorLayoutPages(uploadedImages.exteriorLayoutPages);
    } else if (extImgs.length > 0) {
      // Reset layout pages if not available but we have images
      setExteriorLayoutPages([]);
    }

    if (
      uploadedImages.interiorLayoutPages &&
      Array.isArray(uploadedImages.interiorLayoutPages)
    ) {
      setInteriorLayoutPages(uploadedImages.interiorLayoutPages);
    } else if (intImgs.length > 0) {
      // Reset layout pages if not available but we have images
      setInteriorLayoutPages([]);
    }

    // If we have existing images but no orientations, detect them
    if (extImgs.length >= 2 && !uploadedImages.exteriorOrientations) {
      console.log("Detecting orientations for exterior images");
      detectOrientationsForImages(extImgs, "exterior", extImgs.length);
    } else if (
      extImgs.length >= 2 &&
      uploadedImages.exteriorOrientations &&
      !uploadedImages.exteriorLayoutPages
    ) {
      // If we have orientations but no layout pages, calculate them
      console.log("Calculating layout pages for exterior images");
      updateTemplatePageSelection(
        "exterior",
        uploadedImages.exteriorOrientations,
        extImgs.length,
      );
    }

    // Same for interior images
    if (intImgs.length >= 2 && !uploadedImages.interiorOrientations) {
      console.log("Detecting orientations for interior images");
      detectOrientationsForImages(intImgs, "interior", intImgs.length);
    } else if (
      intImgs.length >= 2 &&
      uploadedImages.interiorOrientations &&
      !uploadedImages.interiorLayoutPages
    ) {
      // If we have orientations but no layout pages, calculate them
      console.log("Calculating layout pages for interior images");
      updateTemplatePageSelection(
        "interior",
        uploadedImages.interiorOrientations,
        intImgs.length,
      );
    }
  }, [uploadedImages, logoUrl]);

  // Handle clicks on the image uploader to prevent form submission
  const handleImageUploaderClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  // Title image handler (keeping existing functionality)
  const handleTitleImageUpdate = (
    urls: string[],
    orientation: "horizontal" | "vertical" | "square",
  ) => {
    console.log(
      `ImagesStep.handleTitleImageUpdate called with orientation: ${orientation}`,
    );

    // Update the image URL
    if (urls.length === 0) {
      // Clear both the image and orientation information
      const newImages = { ...uploadedImages };
      newImages["{{image1}}"] = "";
      newImages.image1_orientation = "horizontal"; // Reset to default

      // Update parent state
      setUploadedImages(newImages);

      // Also make sure to update local state
      setTitleImageOrientation("horizontal"); // Reset to default
      return;
    }

    const url = urls[0];

    // Extract orientation from URL parameter if present (as a fallback)
    let detectedOrientation = orientation;
    try {
      const urlObj = new URL(url);
      const urlOrientation = urlObj.searchParams.get("orientation");
      if (
        urlOrientation &&
        (urlOrientation === "vertical" ||
          urlOrientation === "horizontal" ||
          urlOrientation === "square")
      ) {
        detectedOrientation = urlOrientation as
          | "horizontal"
          | "vertical"
          | "square";
        console.log(`Extracted orientation from URL: ${detectedOrientation}`);
      }
    } catch (e) {
      console.log("Could not parse URL for orientation parameter");
    }

    // Update local state
    setTitleImageOrientation(detectedOrientation);

    // Create a completely new object for uploaded images
    const newImages = { ...uploadedImages };
    newImages["{{image1}}"] = url;

    // Use a simple string key without double braces for orientation
    newImages.image1_orientation = detectedOrientation;

    // Call the update function with the new object
    setUploadedImages(newImages);
  };

  // Function to detect image orientation
  const detectImageOrientation = (
    imageUrl: string,
  ): Promise<"horizontal" | "vertical" | "square"> => {
    return new Promise((resolve) => {
      const img = new Image();

      img.onload = () => {
        console.log(
          `Detecting orientation for image: ${img.width}x${img.height}`,
        );
        const aspectRatio = img.width / img.height;

        if (aspectRatio > 1.05) {
          resolve("horizontal");
        } else if (aspectRatio < 0.95) {
          resolve("vertical");
        } else {
          resolve("square"); // Default to horizontal for square images
        }
      };

      img.onerror = () => {
        console.error("Failed to load image for orientation detection");
        resolve("horizontal"); // Default fallback
      };

      // Add cache buster
      const cachedUrl = `${imageUrl}${imageUrl.includes("?") ? "&" : "?"}nocache=${Date.now()}`;
      img.src = cachedUrl;
    });
  };

  // Function to detect orientations for multiple images
  const detectOrientationsForImages = async (
    urls: string[],
    type: "interior" | "exterior",
    imageCount: number,
  ) => {
    if (urls.length < 2) {
      console.warn(
        `Not enough ${type} images to process orientations (minimum 2, got ${urls.length})`,
      );
      return;
    }

    console.log(`Detecting orientations for ${urls.length} ${type} images`);
    const orientations: Record<string, string> = {};

    await Promise.all(
      urls.map(async (url, index) => {
        const orientation = await detectImageOrientation(url);
        orientations[`${index}`] = orientation;
        console.log(`${type} image ${index}: ${orientation}`);
      }),
    );

    // Store the orientations in state
    if (type === "exterior") {
      setExteriorOrientations(orientations);

      // Also store in uploadedImages for API
      const newImages = { ...uploadedImages }; // Use shallow clone instead of deep clone
      newImages.exteriorOrientations = { ...orientations };
      setUploadedImages(newImages);
    } else {
      setInteriorOrientations(orientations);

      // Also store in uploadedImages for API
      const newImages = { ...uploadedImages }; // Use shallow clone instead of deep clone
      newImages.interiorOrientations = { ...orientations };
      setUploadedImages(newImages);
    }

    // After detecting orientations, update the template page selection
    updateTemplatePageSelection(type, orientations, imageCount);
  };

  // Handler for exterior images collection
  const handleExteriorImagesUpdate = (urls: string[]) => {
    console.log("Updating exterior images with:", urls);

    // Skip validation if clearing images
    if (urls.length === 0) {
      setExteriorImages([]);

      // Create a completely new object with all required fields explicitly set to empty
      const newImages = { ...uploadedImages };
      newImages.exteriorImages = [];
      newImages.exteriorOrientations = {};
      newImages.exteriorLayoutPages = [];
      
      // Clear the placeholder mapping for exterior pages
      if (newImages.placeholderMapping) {
        const updatedMapping = { ...newImages.placeholderMapping };
        // Remove all exterior page mappings (pages 7-11)
        [7, 8, 9, 10, 11].forEach(pageNum => {
          delete updatedMapping[pageNum.toString()];
        });
        newImages.placeholderMapping = updatedMapping;
      }

      // Clear all exterior image placeholders
      for (let i = 1; i <= 6; i++) {
        newImages[`{{exteriorImage${i}}}`] = "";
      }
      
      // Clear specific exterior placeholders
      const exteriorPlaceholders = [
        "{{{{ext_a_himg1}}}}", "{{{{ext_a_himg2}}}}",
        "{{{{ext_b_vimg1}}}}", "{{{{ext_b_vimg2}}}}", "{{{{ext_b_vimg3}}}}", "{{{{ext_b_vimg4}}}}",
        "{{{{ext_c_himg}}}}", "{{{{ext_c_vimg1}}}}", "{{{{ext_c_vimg2}}}}",
        "{{{{ext_d_vimg}}}}",
        "{{{{ext_e_himg}}}}"
      ];
      
      exteriorPlaceholders.forEach(placeholder => {
        newImages[placeholder] = "";
      });

      // Update parent state with completely new object
      setUploadedImages(newImages);
      return;
    }

    // Validate constraints
    if (urls.length < 2) {
      toast.error(t("imagesStep.minimumImagesRequired", { count: 2 }));
      return;
    }

    if (urls.length > 6) {
      urls = urls.slice(0, 6); // Limit to 6 images
      toast.error(t("imagesStep.maximumImagesExceeded", { count: 6 }));
    }

    // Store the exterior images in local state
    setExteriorImages(urls);

    // Create a completely new object to ensure reference changes are detected
    const newImages = { ...uploadedImages };

    // Explicitly set the array as a new array
    newImages.exteriorImages = [...urls];

    // Also add individual placeholders for backward compatibility
    urls.forEach((url, index) => {
      const placeholderKey = `{{exteriorImage${index + 1}}}`;
      newImages[placeholderKey] = url;
      console.log(`Setting exterior image placeholder ${placeholderKey} to ${url.substring(0, 30)}...`);
    });
    
    // Initialize presentation_images array if it doesn't exist
    newImages.presentation_images = newImages.presentation_images || [];
    
    // Add exterior images to presentation_images array
    urls.forEach(url => {
      if (!newImages.presentation_images.includes(url)) {
        newImages.presentation_images.push(url);
      }
    });

    // Log what's being saved
    console.log("Updated uploadedImages exteriorImages:", urls.length);
    console.log("First image URL:", urls[0].substring(0, 50) + "...");
    console.log("Total presentation_images:", newImages.presentation_images.length);

    // Update parent state with the completely new object
    setUploadedImages(newImages);

    // Make sure the section is marked as selected
    if (selectedPages && !selectedPages.exteriorPhotos) {
      const updatedPages = { ...selectedPages, exteriorPhotos: true };
      // If you have a function to update selectedPages, call it here
      // updateSelectedPages(updatedPages);
      console.log("Updated selectedPages to include exteriorPhotos");
    }

    // Detect orientation for each image
    detectOrientationsForImages(urls, "exterior", urls.length);
  };

  // Handler for interior images collection
  const handleInteriorImagesUpdate = (urls: string[]) => {
    console.log("Updating interior images with:", urls);

    // Skip validation if clearing images
    if (urls.length === 0) {
      setInteriorImages([]);

      // Create a completely new object with all required fields explicitly set to empty
      const newImages = { ...uploadedImages };
      newImages.interiorImages = [];
      newImages.interiorOrientations = {};
      newImages.interiorLayoutPages = [];
      
      // Clear the placeholder mapping for interior pages
      if (newImages.placeholderMapping) {
        const updatedMapping = { ...newImages.placeholderMapping };
        // Remove all interior page mappings (pages 12-16)
        [12, 13, 14, 15, 16].forEach(pageNum => {
          delete updatedMapping[pageNum.toString()];
        });
        newImages.placeholderMapping = updatedMapping;
      }
      
      // Clear all interior image placeholders
      for (let i = 1; i <= 6; i++) {
        newImages[`{{interiorImage${i}}}`] = "";
      }
      
      // Clear specific interior placeholders
      const interiorPlaceholders = [
        "{{{{int_a_himg1}}}}", "{{{{int_a_himg2}}}}",
        "{{{{int_b_vimg1}}}}", "{{{{int_b_vimg2}}}}", "{{{{int_b_vimg3}}}}", "{{{{int_b_vimg4}}}}",
        "{{{{int_c_himg}}}}", "{{{{int_c_vimg1}}}}", "{{{{int_c_vimg2}}}}",
        "{{{{int_d_vimg}}}}",
        "{{{{int_e_himg}}}}"
      ];
      
      interiorPlaceholders.forEach(placeholder => {
        newImages[placeholder] = "";
      });

      // Update parent state with completely new object
      setUploadedImages(newImages);
      return;
    }

    // Store the interior images
    setInteriorImages(urls);

    // Create a completely new object to ensure reference changes are detected
    const newImages = { ...uploadedImages };

    // Explicitly set the array as a new array
    newImages.interiorImages = [...urls];

    // Also add individual placeholders for backward compatibility
    urls.forEach((url, index) => {
      const placeholderKey = `{{interiorImage${index + 1}}}`;
      newImages[placeholderKey] = url;
      console.log(`Setting interior image placeholder ${placeholderKey} to ${url.substring(0, 30)}...`);
    });
    
    // Initialize presentation_images array if it doesn't exist
    newImages.presentation_images = newImages.presentation_images || [];
    
    // Add interior images to presentation_images array
    urls.forEach(url => {
      if (!newImages.presentation_images.includes(url)) {
        newImages.presentation_images.push(url);
      }
    });

    // Log what we're saving
    console.log("Updated uploadedImages with interior images:", urls.length);
    console.log("First image URL:", urls[0].substring(0, 50) + "...");
    console.log("Total presentation_images:", newImages.presentation_images.length);

    // Update parent state with the completely new object
    setUploadedImages(newImages);

    // Detect orientation for each image
    detectOrientationsForImages(urls, "interior", urls.length);
  };

  // Function to determine which template pages to use based on image orientations
  const updateTemplatePageSelection = (
    type: "interior" | "exterior",
    orientations: Record<string, string>,
    totalCount: number,
  ) => {
    console.log(
      `Selecting template pages for ${type} images. Count: ${totalCount}, Orientations:`,
      orientations,
    );

    // Get the current images for this type
    const currentImages = type === "exterior" ? exteriorImages : interiorImages;

    // Count horizontal and vertical images
    const horizontalCount = Object.values(orientations).filter(
      (o) => o === "horizontal" || o === "square",
    ).length;
    const verticalCount = Object.values(orientations).filter(
      (o) => o === "vertical",
    ).length;
    
    // Log the image counts (using the totalCount parameter directly)
    console.log(
      `${type} images: ${totalCount} total, ${horizontalCount} horizontal, ${verticalCount} vertical`,
    );

    // Create array of pages to use (page indices in the template)
    const selectedLayoutPages: number[] = [];

    // Define page indices for each template page type
    const pageIndices =
      type === "exterior"
        ? {
            A: 7, // 2 horizontal images
            B: 8, // 4 vertical images
            C: 9, // 1 horizontal + 2 vertical
            D: 10, // 1 vertical image
            E: 11, // 1 horizontal image
          }
        : {
            A: 12, // 2 horizontal images
            B: 13, // 4 vertical images
            C: 14, // 1 horizontal + 2 vertical
            D: 15, // 1 vertical image
            E: 16, // 1 horizontal image
          };

    // Create a mapping object to store placeholder information
    const placeholderMapping: Record<string, string[]> = {};
    const prefix = type === "exterior" ? "ext" : "int";
    
    // Define the exact placeholders for each page as specified by the user
    const exteriorPagePlaceholders: Record<number, string[]> = {
      7: ["{{{{ext_a_himg1}}}}", "{{{{ext_a_himg2}}}}"], // Page 7
      8: ["{{{{ext_b_vimg1}}}}", "{{{{ext_b_vimg2}}}}", "{{{{ext_b_vimg3}}}}", "{{{{ext_b_vimg4}}}}"], // Page 8
      9: ["{{{{ext_c_himg}}}}", "{{{{ext_c_vimg1}}}}", "{{{{ext_c_vimg2}}}}"], // Page 9 - Note: ext_c_vimg1 appears twice as per user spec
      10: ["{{{{ext_d_vimg}}}}"], // Page 10
      11: ["{{{{ext_e_himg}}}}"], // Page 11
    };
    
    const interiorPagePlaceholders: Record<number, string[]> = {
      12: ["{{{{int_a_himg1}}}}", "{{{{int_a_himg2}}}}"], // Page 12
      13: ["{{{{int_b_vimg1}}}}", "{{{{int_b_vimg2}}}}", "{{{{int_b_vimg3}}}}", "{{{{int_b_vimg4}}}}"], // Page 13
      14: ["{{{{int_c_himg}}}}", "{{{{int_c_vimg1}}}}", "{{{{int_c_vimg2}}}}"], // Page 14
      15: ["{{{{int_d_vimg}}}}"], // Page 15
      16: ["{{{{int_e_himg}}}}"], // Page 16
    };
    
    // Special pages for Floor Plan and Energy Certificate
    const specialPages: Record<number, string[]> = {
      17: ["{{{{image7}}}}"], // Floor Plan
      18: ["{{{{image8}}}}"], // Energy Certificate
    };

    // Handle 2 images case
    if (totalCount === 2) {
      if (horizontalCount === 2) {
        // 2 Horizontal → Page 7/12 - A
        selectedLayoutPages.push(pageIndices.A);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`];
      } else if (horizontalCount === 1 && verticalCount === 1) {
        // 1 Horizontal + 1 Vertical → Pages 10/15 & 11/16 - D & E
        selectedLayoutPages.push(pageIndices.D, pageIndices.E);
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`];
        placeholderMapping[`${pageIndices.E}`] = [`{{{{${prefix}_e_himg}}}}`];
      } else if (verticalCount === 2) {
        // 2 Vertical → Pages 10/15 & 10/15 - D & D
        selectedLayoutPages.push(pageIndices.D, pageIndices.D);
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`, `{{{{${prefix}_d_vimg}}}}`];
      }
    }
    // Handle 3 images case
    else if (totalCount === 3) {
      if (horizontalCount === 3) {
        // 3 Horizontal → Pages 7/12 & 11/16 - A & E
        selectedLayoutPages.push(pageIndices.A, pageIndices.E);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`];
        placeholderMapping[`${pageIndices.E}`] = [`{{{{${prefix}_e_himg}}}}`];
      } else if (horizontalCount === 2 && verticalCount === 1) {
        // 2 Horizontal + 1 Vertical → Pages 7/12 & 10/15 - A & D
        selectedLayoutPages.push(pageIndices.A, pageIndices.D);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`];
      } else if (horizontalCount === 1 && verticalCount === 2) {
        // 1 Horizontal + 2 Vertical → Page 9/14 - C
        selectedLayoutPages.push(pageIndices.C);
        placeholderMapping[`${pageIndices.C}`] = [`{{{{${prefix}_c_himg}}}}`, `{{{{${prefix}_c_vimg1}}}}`, `{{{{${prefix}_c_vimg2}}}}`];
      } else if (verticalCount === 3) {
        // 3 Vertical → Pages 10/15, 10/15, 10/15 - D, D, D
        selectedLayoutPages.push(pageIndices.D, pageIndices.D, pageIndices.D);
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`, `{{{{${prefix}_d_vimg}}}}`, `{{{{${prefix}_d_vimg}}}}`];
      }
    }
    // Handle 4 images case
    else if (totalCount === 4) {
      if (horizontalCount === 4) {
        // 4 Horizontal → Pages 7/12 & 7/12 - A & A
        selectedLayoutPages.push(pageIndices.A, pageIndices.A);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`, `{{{{${prefix}_a_himg3}}}}`, `{{{{${prefix}_a_himg4}}}}`];
      } else if (horizontalCount === 3 && verticalCount === 1) {
        // 3 Horizontal + 1 Vertical → Pages 7/12, 10/15 & 11/16 - A, D, E
        selectedLayoutPages.push(pageIndices.A, pageIndices.D, pageIndices.E);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`];
        placeholderMapping[`${pageIndices.E}`] = [`{{{{${prefix}_e_himg}}}}`];
      } else if (horizontalCount === 2 && verticalCount === 2) {
        // 2 Horizontal + 2 Vertical → Pages 9/14 & 11/16 - C & E
        selectedLayoutPages.push(pageIndices.C, pageIndices.E);
        placeholderMapping[`${pageIndices.C}`] = [`{{{{${prefix}_c_himg}}}}`, `{{{{${prefix}_c_vimg1}}}}`, `{{{{${prefix}_c_vimg2}}}}`];
        placeholderMapping[`${pageIndices.E}`] = [`{{{{${prefix}_e_himg}}}}`];
      } else if (horizontalCount === 1 && verticalCount === 3) {
        // 1 Horizontal + 3 Vertical → Pages 9/14 & 10/15 - C & D
        selectedLayoutPages.push(pageIndices.C, pageIndices.D);
        placeholderMapping[`${pageIndices.C}`] = [`{{{{${prefix}_c_himg}}}}`, `{{{{${prefix}_c_vimg1}}}}`, `{{{{${prefix}_c_vimg2}}}}`];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`];
      } else if (verticalCount === 4) {
        // 4 Vertical → Page 8/13 - B
        selectedLayoutPages.push(pageIndices.B);
        placeholderMapping[`${pageIndices.B}`] = [
          `{{{{${prefix}_b_vimg1}}}}`, 
          `{{{{${prefix}_b_vimg2}}}}`, 
          `{{{{${prefix}_b_vimg3}}}}`, 
          `{{{{${prefix}_b_vimg4}}}}`
        ];
      }
    }
    // Handle 5 images case
    else if (totalCount === 5) {
      if (horizontalCount === 5) {
        // 5 Horizontal → Pages 7/12, 7/12 & 11/16 - A, A, E
        selectedLayoutPages.push(pageIndices.A, pageIndices.A, pageIndices.E);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`, `{{{{${prefix}_a_himg3}}}}`, `{{{{${prefix}_a_himg4}}}}`];
        placeholderMapping[`${pageIndices.E}`] = [`{{{{${prefix}_e_himg}}}}`];
      } else if (horizontalCount === 4 && verticalCount === 1) {
        // 4 Horizontal + 1 Vertical → Pages 7/12, 7/12 & 10/15 - A, A, D
        selectedLayoutPages.push(pageIndices.A, pageIndices.A, pageIndices.D);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`, `{{{{${prefix}_a_himg3}}}}`, `{{{{${prefix}_a_himg4}}}}`];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`];
      } else if (horizontalCount === 3 && verticalCount === 2) {
        // 3 Horizontal + 2 Vertical → Pages 7/12 & 9/14 - A & C
        selectedLayoutPages.push(pageIndices.A, pageIndices.C);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`, `{{{{${prefix}_a_himg3}}}}`];
        placeholderMapping[`${pageIndices.C}`] = [`{{{{${prefix}_c_vimg1}}}}`, `{{{{${prefix}_c_vimg2}}}}`];
      } else if (horizontalCount === 2 && verticalCount === 3) {
        // 2 Horizontal + 3 Vertical → Pages 9/14, 10/15 & 11/16 - C, D, E
        selectedLayoutPages.push(pageIndices.C, pageIndices.D, pageIndices.E);
        placeholderMapping[`${pageIndices.C}`] = [`{{{{${prefix}_c_himg}}}}`, `{{{{${prefix}_c_vimg1}}}}`, `{{{{${prefix}_c_vimg2}}}}`];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`];
        placeholderMapping[`${pageIndices.E}`] = [`{{{{${prefix}_e_himg}}}}`];
      } else if (horizontalCount === 1 && verticalCount === 4) {
        // 1 Horizontal + 4 Vertical → Pages 8/13 & 11/16 - B & E
        selectedLayoutPages.push(pageIndices.B, pageIndices.E);
        placeholderMapping[`${pageIndices.B}`] = [
          `{{{{${prefix}_b_vimg1}}}}`, 
          `{{{{${prefix}_b_vimg2}}}}`, 
          `{{{{${prefix}_b_vimg3}}}}`, 
          `{{{{${prefix}_b_vimg4}}}}`
        ];
        placeholderMapping[`${pageIndices.E}`] = [`{{{{${prefix}_e_himg}}}}`];
      } else if (verticalCount === 5) {
        // 5 Vertical → Pages 8/13 & 10/15 - B & D
        selectedLayoutPages.push(pageIndices.B, pageIndices.D);
        placeholderMapping[`${pageIndices.B}`] = [
          `{{{{${prefix}_b_vimg1}}}}`, 
          `{{{{${prefix}_b_vimg2}}}}`, 
          `{{{{${prefix}_b_vimg3}}}}`, 
          `{{{{${prefix}_b_vimg4}}}}`
        ];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`];
      }
    }
    // Handle 6 images case
    else if (totalCount === 6) {
      if (horizontalCount === 6) {
        // 6 Horizontal → Pages 7/12, 7/12, 7/12 - A, A, A
        selectedLayoutPages.push(pageIndices.A, pageIndices.A, pageIndices.A);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`, `{{{{${prefix}_a_himg3}}}}`, `{{{{${prefix}_a_himg4}}}}`, `{{{{${prefix}_a_himg5}}}}`, `{{{{${prefix}_a_himg6}}}}`];
      } else if (horizontalCount === 5 && verticalCount === 1) {
        // 5 Horizontal + 1 Vertical → Pages 7/12, 7/12, 10/15 & 11/16 - A, A, D, E
        selectedLayoutPages.push(pageIndices.A, pageIndices.A, pageIndices.D, pageIndices.E);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`, `{{{{${prefix}_a_himg3}}}}`, `{{{{${prefix}_a_himg4}}}}`, `{{{{${prefix}_a_himg5}}}}`];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`];
        placeholderMapping[`${pageIndices.E}`] = [`{{{{${prefix}_e_himg}}}}`];
      } else if (horizontalCount === 4 && verticalCount === 2) {
        // 4 Horizontal + 2 Vertical → Pages 7/12, 7/12 & 10/15 - A, A, D, D
        selectedLayoutPages.push(pageIndices.A, pageIndices.A, pageIndices.D, pageIndices.D);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`, `{{{{${prefix}_a_himg3}}}}`, `{{{{${prefix}_a_himg4}}}}`];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`, `{{{{${prefix}_d_vimg}}}}`];
      } else if (horizontalCount === 3 && verticalCount === 3) {
        // 3 Horizontal + 3 Vertical → Pages 7/12 & 9/14 - A, C, D
        selectedLayoutPages.push(pageIndices.A, pageIndices.C, pageIndices.D);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`, `{{{{${prefix}_a_himg3}}}}`];
        placeholderMapping[`${pageIndices.C}`] = [`{{{{${prefix}_c_vimg1}}}}`, `{{{{${prefix}_c_vimg2}}}}`];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`];
      } else if (horizontalCount === 2 && verticalCount === 4) {
        // 2 Horizontal + 4 Vertical → Pages 7/12 & 8/13 - A, B
        selectedLayoutPages.push(pageIndices.A, pageIndices.B);
        placeholderMapping[`${pageIndices.A}`] = [`{{{{${prefix}_a_himg1}}}}`, `{{{{${prefix}_a_himg2}}}}`];
        placeholderMapping[`${pageIndices.B}`] = [
          `{{{{${prefix}_b_vimg1}}}}`, 
          `{{{{${prefix}_b_vimg2}}}}`, 
          `{{{{${prefix}_b_vimg3}}}}`, 
          `{{{{${prefix}_b_vimg4}}}}`
        ];
      } else if (horizontalCount === 1 && verticalCount === 5) {
        // 1 Horizontal + 5 Vertical → Pages 8/13, 10/15 & 11/16 - B, D, E
        selectedLayoutPages.push(pageIndices.B, pageIndices.D, pageIndices.E);
        placeholderMapping[`${pageIndices.B}`] = [
          `{{{{${prefix}_b_vimg1}}}}`, 
          `{{{{${prefix}_b_vimg2}}}}`, 
          `{{{{${prefix}_b_vimg3}}}}`, 
          `{{{{${prefix}_b_vimg4}}}}`
        ];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`];
        placeholderMapping[`${pageIndices.E}`] = [`{{{{${prefix}_e_himg}}}}`];
      } else if (verticalCount === 6) {
        // 6 Vertical → Pages 8/13, 10/15 & 10/15 - B, D, D
        selectedLayoutPages.push(pageIndices.B, pageIndices.D, pageIndices.D);
        placeholderMapping[`${pageIndices.B}`] = [
          `{{{{${prefix}_b_vimg1}}}}`, 
          `{{{{${prefix}_b_vimg2}}}}`, 
          `{{{{${prefix}_b_vimg3}}}}`, 
          `{{{{${prefix}_b_vimg4}}}}`
        ];
        placeholderMapping[`${pageIndices.D}`] = [`{{{{${prefix}_d_vimg}}}}`, `{{{{${prefix}_d_vimg}}}}`];
      }
    }

    console.log(
      `IMPORTANT: Selected ${selectedLayoutPages.length} layout pages for ${type} images:`,
      selectedLayoutPages,
    );

    // Store the selectedLayoutPages in component state
    if (type === "exterior") {
      setExteriorLayoutPages(selectedLayoutPages);

      // IMPORTANT CHANGE: Create shallow clone instead of deep clone
      const newImages = { ...uploadedImages };
      newImages.exteriorLayoutPages = [...selectedLayoutPages]; // Create new array
      newImages.exteriorOrientations = { ...orientations }; // Ensure orientations are also stored
      newImages.exteriorImages = [...currentImages]; // Re-store images

      // Also mark the section as selected
      if (selectedPages && typeof selectedPages === "object") {
        selectedPages.exteriorPhotos = true;
      }

      // Update the state with the new object
      setUploadedImages(newImages);
      console.log(
        `Set exteriorLayoutPages in uploadedImages:`,
        selectedLayoutPages,
      );
    } else {
      setInteriorLayoutPages(selectedLayoutPages);

      // IMPORTANT CHANGE: Create shallow clone instead of deep clone
      const newImages = { ...uploadedImages };
      newImages.interiorLayoutPages = [...selectedLayoutPages]; // Create new array
      newImages.interiorOrientations = { ...orientations }; // Ensure orientations are also stored
      newImages.interiorImages = [...currentImages]; // Re-store images

      // Also mark the section as selected
      if (selectedPages && typeof selectedPages === "object") {
        selectedPages.interiorPhotos = true;
      }

      // Update the state with the new object
      setUploadedImages(newImages);
      console.log(
        `Set interiorLayoutPages in uploadedImages:`,
        selectedLayoutPages,
      );
    }

    // Make sure the section is marked as selected
    if (selectedPages) {
      if (type === "exterior" && !selectedPages.exteriorPhotos) {
        console.log("Ensuring exteriorPhotos is selected in selectedPages");
        // If you have a function to update selectedPages, uncomment and call it here
        // updateSelectedPages({...selectedPages, exteriorPhotos: true});
      } else if (type === "interior" && !selectedPages.interiorPhotos) {
        console.log("Ensuring interiorPhotos is selected in selectedPages");
        // If you have a function to update selectedPages, uncomment and call it here
        // updateSelectedPages({...selectedPages, interiorPhotos: true});
      }
    }

    // Save the placeholderMapping to the uploadedImages object
    const newImages = { ...uploadedImages };
    
    // Initialize placeholderMapping if it doesn't exist
    newImages.placeholderMapping = newImages.placeholderMapping || {};
    
    // Initialize presentation_images array if it doesn't exist
    newImages.presentation_images = newImages.presentation_images || [];
    
    if (type === "exterior") {
      // Save the layout pages
      newImages.exteriorLayoutPages = [...selectedLayoutPages];
      
      // Add the predefined exterior placeholders for all selected pages
      selectedLayoutPages.forEach(pageIndex => {
        const pageNumber = pageIndex + 1; // Convert from 0-based to 1-based
        if (exteriorPagePlaceholders[pageNumber]) {
          newImages.placeholderMapping[pageNumber.toString()] = exteriorPagePlaceholders[pageNumber];
          console.log(`Saved exterior placeholders for page ${pageNumber}:`, exteriorPagePlaceholders[pageNumber]);
          
          // Map the exterior images to their specific placeholders
          if (newImages.exteriorImages && newImages.exteriorImages.length > 0) {
            const placeholders = exteriorPagePlaceholders[pageNumber];
            placeholders.forEach((placeholder, idx) => {
              if (idx < newImages.exteriorImages.length) {
                const imageUrl = newImages.exteriorImages[idx];
                newImages[placeholder] = imageUrl;
                console.log(`Mapped ${placeholder} to ${imageUrl.substring(0, 30)}...`);
                
                // Add to presentation_images array if not already there
                if (!newImages.presentation_images.includes(imageUrl)) {
                  newImages.presentation_images.push(imageUrl);
                }
              }
            });
          }
        }
      });
      
      // Also add the dynamic placeholders we calculated
      Object.entries(placeholderMapping).forEach(([pageNum, placeholders]) => {
        newImages.placeholderMapping[pageNum] = placeholders;
      });
    } else {
      // Save the layout pages
      newImages.interiorLayoutPages = [...selectedLayoutPages];
      
      // Add the predefined interior placeholders for all selected pages
      selectedLayoutPages.forEach(pageIndex => {
        const pageNumber = pageIndex + 1; // Convert from 0-based to 1-based
        if (interiorPagePlaceholders[pageNumber]) {
          newImages.placeholderMapping[pageNumber.toString()] = interiorPagePlaceholders[pageNumber];
          console.log(`Saved interior placeholders for page ${pageNumber}:`, interiorPagePlaceholders[pageNumber]);
          
          // Map the interior images to their specific placeholders
          if (newImages.interiorImages && newImages.interiorImages.length > 0) {
            const placeholders = interiorPagePlaceholders[pageNumber];
            placeholders.forEach((placeholder, idx) => {
              if (idx < newImages.interiorImages.length) {
                const imageUrl = newImages.interiorImages[idx];
                newImages[placeholder] = imageUrl;
                console.log(`Mapped ${placeholder} to ${imageUrl.substring(0, 30)}...`);
                
                // Add to presentation_images array if not already there
                if (!newImages.presentation_images.includes(imageUrl)) {
                  newImages.presentation_images.push(imageUrl);
                }
              }
            });
          }
        }
      });
      
      // Also add the dynamic placeholders we calculated
      Object.entries(placeholderMapping).forEach(([pageNum, placeholders]) => {
        newImages.placeholderMapping[pageNum] = placeholders;
      });
    }
    
    // Always add the special pages (Floor Plan and Energy Certificate)
    Object.entries(specialPages).forEach(([pageNum, placeholders]) => {
      newImages.placeholderMapping[pageNum] = placeholders;
      
      // Add specific mappings for special pages
      if (pageNum === '17') {
        // Floor Plan - page 17 - image7
        newImages['{{image7}}'] = newImages['floorPlanImage'] || ''; // Ensure we have a value
        console.log(`Saved Floor Plan placeholder for page ${pageNum}:`, placeholders);
      } else if (pageNum === '18') {
        // Energy Certificate - page 18 - image8
        newImages['{{image8}}'] = newImages['energyCertificateImage'] || ''; // Ensure we have a value
        console.log(`Saved Energy Certificate placeholder for page ${pageNum}:`, placeholders);
      }
      
      console.log(`Saved special page placeholders for page ${pageNum}:`, placeholders);
    });
    
    // Update the state with the new mapping
    setUploadedImages(newImages);
    
    // Log the complete placeholder mapping
    console.log("Complete placeholder mapping:", newImages.placeholderMapping);
    
    // Pass this information up to parent component if callback exists
    if (onTemplatePageSelection) {
      onTemplatePageSelection(type, selectedLayoutPages);
    }
  };

  // Exterior Photos Section with Dynamic Layout
  const renderExteriorPhotosSection = () => {
    return (
      <div key="exterior" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("imagesStep.exteriorPhotos")}
        </h3>
        <p className="text-gray-700 mb-4">
          {t("imagesStep.exteriorPhotosDesc")}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                {t("imagesStep.dynamicLayoutInfo")}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {t("imagesStep.uploadBetween2And6Images")}.{" "}
                {t("imagesStep.layoutAdaptInfo")}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">
              {t("imagesStep.uploadExtImages")} (2-6)
            </p>
            <div className="text-xs text-gray-500">
              {exteriorImages.length > 0 ? (
                <span>
                  {exteriorImages.length} {t("imagesStep.imagesUploaded")}(
                  {
                    Object.values(exteriorOrientations).filter(
                      (o) => o === "horizontal",
                    ).length
                  }{" "}
                  {t("imagesStep.horizontal")},
                  {
                    Object.values(exteriorOrientations).filter(
                      (o) => o === "vertical",
                    ).length
                  }{" "}
                  {t("imagesStep.vertical")})
                </span>
              ) : (
                <span>{t("imagesStep.noImagesYet")}</span>
              )}
            </div>
          </div>
        </div>

        <ImageUploader
          existingImages={exteriorImages}
          onImagesUploaded={handleExteriorImagesUpdate}
          limit={6}
          onClick={handleImageUploaderClick}
          skipEditing={true} // Add this prop
        />

        {exteriorLayoutPages.length > 0 && (
          <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">
                {t("imagesStep.selectedLayouts")}:
              </span>{" "}
              {exteriorLayoutPages
                .map((pageIndex) => {
                  const pageType = getPageTypeFromIndex(pageIndex);
                  return pageType;
                })
                .join(", ")}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Interior Photos Section with Dynamic Layout
  const renderInteriorPhotosSection = () => {
    return (
      <div key="interior" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("imagesStep.interiorPhotos")}
        </h3>
        <p className="text-gray-700 mb-4">
          {t("imagesStep.interiorPhotosDesc")}
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                  clipRule="evenodd"
                ></path>
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-medium text-blue-800">
                {t("imagesStep.dynamicLayoutInfo")}
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                {t("imagesStep.uploadBetween2And6Images")}.{" "}
                {t("imagesStep.layoutAdaptInfo")}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-2">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium text-gray-700">
              {t("imagesStep.uploadIntImages")} (2-6)
            </p>
            <div className="text-xs text-gray-500">
              {interiorImages.length > 0 ? (
                <span>
                  {interiorImages.length} {t("imagesStep.imagesUploaded")}(
                  {
                    Object.values(interiorOrientations).filter(
                      (o) => o === "horizontal",
                    ).length
                  }{" "}
                  {t("imagesStep.horizontal")},
                  {
                    Object.values(interiorOrientations).filter(
                      (o) => o === "vertical",
                    ).length
                  }{" "}
                  {t("imagesStep.vertical")})
                </span>
              ) : (
                <span>{t("imagesStep.noImagesYet")}</span>
              )}
            </div>
          </div>
        </div>

        <ImageUploader
          existingImages={interiorImages}
          onImagesUploaded={handleInteriorImagesUpdate}
          limit={6}
          onClick={handleImageUploaderClick}
          skipEditing={true} // Add this prop
        />

        {interiorLayoutPages.length > 0 && (
          <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
            <p className="text-sm text-gray-700">
              <span className="font-medium">
                {t("imagesStep.selectedLayouts")}:
              </span>{" "}
              {interiorLayoutPages
                .map((pageIndex) => {
                  const pageType = getPageTypeFromIndex(pageIndex);
                  return pageType;
                })
                .join(", ")}
            </p>
          </div>
        )}
      </div>
    );
  };

  // Helper function to get page type name from index
  const getPageTypeFromIndex = (index: number): string => {
    // For exterior pages
    if (index === 7) return "2 Horizontal";
    if (index === 8) return "4 Vertical";
    if (index === 9) return "1 Horizontal + 2 Vertical";
    if (index === 10) return "1 Vertical";
    if (index === 11) return "1 Horizontal";

    // For interior pages
    if (index === 12) return "2 Horizontal";
    if (index === 13) return "4 Vertical";
    if (index === 14) return "1 Horizontal + 2 Vertical";
    if (index === 15) return "1 Vertical";
    if (index === 16) return "1 Horizontal";

    return `Page ${index}`;
  };

  // Handle Google Maps image generation
  const handleMapImageGenerated = (imageUrl: string) => {
    handleImageUpdate("{{image2}}", [imageUrl]);
  };
  
  // Handler for floor plan image
  const handleFloorPlanUpdate = (urls: string[]) => {
    console.log("Updating floor plan image with:", urls);

    // Create a completely new object to ensure reference changes are detected
    const newImages = JSON.parse(JSON.stringify(uploadedImages));

    if (urls.length === 0) {
      // Clear the image
      newImages["{{image7}}"] = "";
      newImages.floorPlanImage = "";
      
      // Clear from placeholder mapping if it exists
      if (newImages.placeholderMapping && newImages.placeholderMapping['17']) {
        console.log("Clearing floor plan image from placeholder mapping");
      }
      
      setUploadedImages(newImages);
      return;
    }

    const url = urls[0];
    console.log(`Setting floor plan image to: ${url.substring(0, 30)}...`);

    // Update with both formats for backward compatibility
    newImages["{{image7}}"] = url;
    newImages.floorPlanImage = url;
    
    // Ensure the placeholder mapping exists and contains the floor plan page
    newImages.placeholderMapping = newImages.placeholderMapping || {};
    newImages.placeholderMapping['17'] = ["{{{{image7}}}}"];
    
    console.log("Updated floor plan in placeholder mapping", newImages.placeholderMapping['17']);

    // Update parent state
    setUploadedImages(newImages);
  };
  
  // Handler for energy certificate image
  const handleEnergyCertificateUpdate = (urls: string[]) => {
    console.log("Updating energy certificate image with:", urls);

    // Create a completely new object to ensure reference changes are detected
    const newImages = JSON.parse(JSON.stringify(uploadedImages));

    if (urls.length === 0) {
      // Clear the image
      newImages["{{image8}}"] = "";
      newImages.energyCertificateImage = "";
      
      // Clear from placeholder mapping if it exists
      if (newImages.placeholderMapping && newImages.placeholderMapping['18']) {
        console.log("Clearing energy certificate image from placeholder mapping");
      }
      
      setUploadedImages(newImages);
      return;
    }

    const url = urls[0];
    console.log(`Setting energy certificate image to: ${url.substring(0, 30)}...`);

    // Update with both formats for backward compatibility
    newImages["{{image8}}"] = url;
    newImages.energyCertificateImage = url;
    
    // Ensure the placeholder mapping exists and contains the energy certificate page
    newImages.placeholderMapping = newImages.placeholderMapping || {};
    newImages.placeholderMapping['18'] = ["{{{{image8}}}}"];
    
    console.log("Updated energy certificate in placeholder mapping", newImages.placeholderMapping['18']);

    // Update parent state
    setUploadedImages(newImages);
  };

  // Original handleImageUpdate for backward compatibility
  const handleImageUpdate = (placeholder: string, urls: string[]) => {
    if (urls.length === 0) {
      // If urls is empty, it means the image was removed
      console.log(`Clearing image for placeholder: ${placeholder}`);

      // Update local state for specific placeholders
      if (placeholder === "{{logo}}" && setLogoUrl) {
        setLogo("");
        setLogoUrl("");
      } else if (placeholder === "{{agent}}") {
        setAgent("");
      } else if (placeholder === "{{image7}}") {
        // Handle floor plan specifically
        handleFloorPlanUpdate([]);
        return;
      } else if (placeholder === "{{image8}}") {
        // Handle energy certificate specifically
        handleEnergyCertificateUpdate([]);
        return;
      }

      // Update parent state by removing the image URL
      const newImages = JSON.parse(JSON.stringify(uploadedImages)); // Deep clone for reference change
      newImages[placeholder] = "";
      setUploadedImages(newImages);

      return;
    }

    const url = urls[0];
    console.log(
      `Updating image for placeholder: ${placeholder} with URL: ${url}`,
    );

    // Update local state for specific placeholders
    if (placeholder === "{{logo}}" && setLogoUrl) {
      setLogo(url);
      setLogoUrl(url);
    } else if (placeholder === "{{agent}}") {
      setAgent(url);
    } else if (placeholder === "{{image7}}") {
      // Handle floor plan specifically
      handleFloorPlanUpdate(urls);
      return;
    } else if (placeholder === "{{image8}}") {
      // Handle energy certificate specifically
      handleEnergyCertificateUpdate(urls);
      return;
    }

    // Update parent state
    const newImages = JSON.parse(JSON.stringify(uploadedImages)); // Deep clone for reference change
    newImages[placeholder] = url;
    setUploadedImages(newImages);
  };

  // Get image sections
  const getImageSections = () => {
    const sections: JSX.Element[] = [];

    // Company Logo - Always shown
    sections.push(
      <div key="logo" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("imagesStep.companyLogo")}
        </h3>
        <p className="text-gray-700 mb-4">{t("imagesStep.companyLogoDesc")}</p>
        <ImageUploader
          existingImages={logoUrl ? [logoUrl] : []}
          onImagesUploaded={(urls) => {
            handleImageUpdate("{{logo}}", urls);
          }}
          limit={1}
          onClick={handleImageUploaderClick}
        />
      </div>,
    );

    // Agent Photo - Always shown
    sections.push(
      <div key="agent" className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {t("imagesStep.agentPhoto")}
        </h3>
        <p className="text-gray-700 mb-4">{t("imagesStep.agentPhotoDesc")}</p>
        <ImageUploader
          existingImages={
            uploadedImages["{{agent}}"] ? [uploadedImages["{{agent}}"]] : []
          }
          onImagesUploaded={(urls) => {
            handleImageUpdate("{{agent}}", urls);
          }}
          limit={1}
          onClick={handleImageUploaderClick}
        />
      </div>,
    );

    // Project Overview Images - UPDATED WITH ORIENTATION DETECTION
    if (selectedPages.projectOverview) {
      sections.push(
        <div key="overview">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("imagesStep.projectOverview")}
          </h3>
          <p className="text-gray-700 mb-4">
            {t("imagesStep.projectOverviewDesc")}
          </p>
          <ImageUploader
            existingImages={
              uploadedImages["{{image1}}"] ? [uploadedImages["{{image1}}"]] : []
            }
            onImagesUploaded={(urls) =>
              handleTitleImageUpdate(urls, "horizontal")
            }
            limit={1}
            onClick={handleImageUploaderClick}
          />
        </div>,
      );
    }

    // Building Layout Plan with Google Maps
    if (selectedPages.buildingLayout) {
      sections.push(
        <div key="layout" className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("imagesStep.buildingLayout")}
          </h3>
          <p className="text-gray-700 mb-4">
            {t("imagesStep.buildingLayoutMapDesc")}
          </p>

          {/* Google Maps Component */}
          <div className="space-y-4">
            <GoogleMapsLocationComponent
              address={propertyAddress}
              onMapImageGenerated={handleMapImageGenerated}
              existingImageUrl={uploadedImages["{{image2}}"]} // Use image2 for maps
              apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
            />

            {/* Show manual upload option if no map is present */}
            {!uploadedImages["{{image2}}"] && (
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  {t("imagesStep.orUploadManually")}
                </p>
                <ImageUploader
                  existingImages={[]}
                  onImagesUploaded={(urls: string[]) =>
                    handleImageUpdate("{{image2}}", urls)
                  }
                  limit={1}
                  onClick={handleImageUploaderClick}
                />
              </div>
            )}
          </div>
        </div>,
      );
    }

    // NEW EXTERIOR PHOTOS SECTION WITH DYNAMIC LAYOUT
    if (selectedPages.exteriorPhotos) {
      sections.push(renderExteriorPhotosSection());
    }

    // NEW INTERIOR PHOTOS SECTION WITH DYNAMIC LAYOUT
    if (selectedPages.interiorPhotos) {
      sections.push(renderInteriorPhotosSection());
    }

    // Floor Plan
    if (selectedPages.floorPlan) {
      sections.push(
        <div key="floorplan" className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("imagesStep.floorPlan")}
          </h3>
          <p className="text-gray-700 mb-4">{t("imagesStep.floorPlanDesc")}</p>
          <ImageUploader
            existingImages={
              uploadedImages["{{image7}}"] ? [uploadedImages["{{image7}}"]] : []
            }
            onImagesUploaded={(urls: string[]) =>
              handleImageUpdate("{{image7}}", urls)
            }
            limit={1}
            onClick={handleImageUploaderClick}
          />
        </div>,
      );
    }

    // Energy Certificate
    if (selectedPages.energyCertificate) {
      sections.push(
        <div key="energy" className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("imagesStep.energyCertificate")}
          </h3>
          <p className="text-gray-700 mb-4">
            {t("imagesStep.energyCertificateDesc")}
          </p>
          <ImageUploader
            existingImages={
              uploadedImages["{{image8}}"] ? [uploadedImages["{{image8}}"]] : []
            }
            onImagesUploaded={(urls: string[]) =>
              handleImageUpdate("{{image8}}", urls)
            }
            limit={1}
            onClick={handleImageUploaderClick}
          />
        </div>,
      );
    }

    return sections;
  };

  return (
    <div className="space-y-8">
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
        <p className="text-blue-700">{t("imagesStep.uploadInfo")}</p>
      </div>
      {getImageSections()}
    </div>
  );
}
