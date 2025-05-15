import { NextResponse } from "next/server";
import { google } from "googleapis";
import { GoogleAuth } from "google-auth-library";
import {
  PropertyPlaceholders,
  defaultPlaceholders,
} from "@/types/placeholders";

// Define a type for valid orientation values
type ImageOrientation = "horizontal" | "vertical" | "square";

// Create a JWT client using the service account credentials
let auth: GoogleAuth | undefined;
try {
  // Try to parse the service account key
  const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    console.error(
      "GOOGLE_SERVICE_ACCOUNT_KEY is not defined in environment variables",
    );
  } else {
    console.log("Service account key found, attempting to parse...");

    // For debugging, log a small part of the key to verify it's being read
    console.log("Key starts with:", serviceAccountKey.substring(0, 20) + "...");

    const credentials = JSON.parse(serviceAccountKey);

    auth = new google.auth.GoogleAuth({
      credentials,
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/presentations",
      ],
    });

    console.log("Google Auth initialized successfully");
  }
} catch (error) {
  console.error("Error parsing service account key:", error);
  // We'll handle this in the route handler
}

// Define slide mappings based on the new structure
// IMPORTANT: These indices match the actual Google Slides template!
// Slide indices start from 0, so slide 1 is index 0, slide 2 is index 1, etc.
const pageToSlideMapping: Record<string, number[]> = {
  projectOverview: [0, 1], // Both horizontal (0) and vertical (1) title slides
  cityDescription: [2], // Slide 3 (index 2)
  buildingLayout: [3], // Slide 4 (index 3)
  amenities: [4], // Slide 5 (index 4)
  description: [5], // Slide 6 (index 5)
  exteriorPhotos: [6, 7, 8, 9, 10], // All exterior photo layouts (indices 6-10 for pages 7-11)
  interiorPhotos: [11, 12, 13, 14, 15], // All interior photo layouts (indices 11-15 for pages 12-16)
  floorPlan: [16], // Slide 17 (index 16)
  energyCertificate: [17], // Slide 18 (index 17)
  termsConditions: [18], // Slide 19 (index 18)
};

// Define the exact placeholders for each page as provided by the user
const exteriorPagePlaceholders: Record<number, string[]> = {
  6: ["{{{{ext_a_himg1}}}}", "{{{{ext_a_himg2}}}}"], // Page 7 (index 6)
  7: ["{{{{ext_b_vimg1}}}}", "{{{{ext_b_vimg2}}}}", "{{{{ext_b_vimg3}}}}", "{{{{ext_b_vimg4}}}}"], // Page 8 (index 7)
  8: ["{{{{ext_c_himg}}}}", "{{{{ext_c_vimg1}}}}", "{{{{ext_c_vimg2}}}}"], // Page 9 (index 8)
  9: ["{{{{ext_d_vimg}}}}"], // Page 10 (index 9)
  10: ["{{{{ext_e_himg}}}}"], // Page 11 (index 10)
};

const interiorPagePlaceholders: Record<number, string[]> = {
  11: ["{{{{int_a_himg1}}}}", "{{{{int_a_himg2}}}}"], // Page 12 (index 11)
  12: ["{{{{int_b_vimg1}}}}", "{{{{int_b_vimg2}}}}", "{{{{int_b_vimg3}}}}", "{{{{int_b_vimg4}}}}"], // Page 13 (index 12)
  13: ["{{{{int_c_himg}}}}", "{{{{int_c_vimg1}}}}", "{{{{int_c_vimg2}}}}"], // Page 14 (index 13)
  14: ["{{{{int_d_vimg}}}}"], // Page 15 (index 14)
  15: ["{{{{int_e_himg}}}}"], // Page 16 (index 15)
};

// Additional placeholders for pages with more than 2 horizontal images or special cases
const extraExteriorPlaceholders: Record<number, string[]> = {
  6: ["{{{{ext_a_himg3}}}}", "{{{{ext_a_himg4}}}}", "{{{{ext_a_himg5}}}}", "{{{{ext_a_himg6}}}}"], // Extra placeholders for page 7
};

const extraInteriorPlaceholders: Record<number, string[]> = {
  11: ["{{{{int_a_himg3}}}}", "{{{{int_a_himg4}}}}", "{{{{int_a_himg5}}}}", "{{{{int_a_himg6}}}}"], // Extra placeholders for page 12
};

// Define the title page slide indices for both orientations with proper typing
const titlePageSlideMapping: Record<ImageOrientation, number> = {
  horizontal: 0, // Index of horizontal title page slide (slide 1)
  vertical: 1,   // Index of vertical title page slide (slide 2)
  square: 0,     // Default to horizontal for square images
};

// Helper function to map image URLs to their corresponding placeholders
const mapImageUrlsToPlaceholders = (
  imageUrls: string[],
  placeholderKeys: string[],
): Record<string, string> => {
  const imageMapping: Record<string, string> = {};
  
  // Map each image URL to its corresponding placeholder
  placeholderKeys.forEach((placeholder, index) => {
    if (index < imageUrls.length) {
      imageMapping[placeholder] = imageUrls[index];
    }
  });
  
  return imageMapping;
};

// Mark this route as dynamic to prevent static generation errors
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    console.log("Process presentation API called");

    const rawBody = await request.text();
    console.log("Raw request body:", rawBody.substring(0, 500) + "...");

    // Check if auth was initialized properly
    if (!auth) {
      throw new Error(
        "Failed to initialize Google authentication. Check your service account key.",
      );
    }

    // Parse the request body
    let body;
    try {
      body = JSON.parse(rawBody);
      console.log("Request body parsed successfully");
      console.log("Image data received:", {
        exteriorImages: body.placeholders?.exteriorImages?.length || 0,
        interiorImages: body.placeholders?.interiorImages?.length || 0,
        exteriorLayoutPages: body.placeholders?.exteriorLayoutPages,
        interiorLayoutPages: body.placeholders?.interiorLayoutPages,
      });
    } catch (error) {
      console.error("Failed to parse request body:", error);
      return NextResponse.json(
        { message: "Invalid request body" },
        { status: 400 },
      );
    }

    const { templateId, placeholders, images, selectedPages, language } = body;

    // ==== ORIENTATION DEBUG ====
    console.log("==== ORIENTATION DEBUG ====");
    console.log(
      "Raw request body:",
      JSON.stringify(body).substring(0, 1000) + "...",
    );

    // Direct check for orientation key with different formats
    if (placeholders) {
      const keys = Object.keys(placeholders);
      console.log("All placeholders keys:", keys);

      // Check multiple possible formats for the orientation key
      const possibleKeys = [
        "image1_orientation",
        "{{image1_orientation}}",
        "{{image1}}_orientation",
      ];

      possibleKeys.forEach((key) => {
        if (key in placeholders) {
          console.log(
            `FOUND orientation with key: ${key} = ${placeholders[key]}`,
          );
        } else {
          console.log(`Key ${key} NOT found in placeholders`);
        }
      });

      // Check if any key contains "orientation"
      const orientationKeys = keys.filter((k) =>
        k.toLowerCase().includes("orientation"),
      );
      if (orientationKeys.length > 0) {
        console.log("Found keys containing 'orientation':", orientationKeys);
        orientationKeys.forEach((key) => {
          console.log(`${key} = ${placeholders[key]}`);
        });
      } else {
        console.log("No keys containing 'orientation' found");
      }
    }

    // Enhanced logging for title image orientation
    console.log("API: Checking for image1_orientation in placeholders");
    if (placeholders && "image1_orientation" in placeholders) {
      console.log(
        `API: Found image1_orientation = ${placeholders.image1_orientation}`,
      );
    } else {
      console.log("API: image1_orientation NOT found in placeholders");

      // Debug what keys are actually present
      if (placeholders) {
        console.log(
          "API: Keys present in placeholders:",
          Object.keys(placeholders),
        );

        // Check for any keys that might contain 'orientation'
        const orientationKeys = Object.keys(placeholders).filter((key) =>
          key.toLowerCase().includes("orientation"),
        );

        if (orientationKeys.length > 0) {
          console.log(
            "API: Found these orientation-related keys:",
            orientationKeys,
          );
          orientationKeys.forEach((key) => {
            console.log(`API: ${key} = ${placeholders[key]}`);
          });
        }
      }
    }

    // Get the language or default to 'en'
    const userLanguage = language || "en";
    console.log(`Using language: ${userLanguage}`);

    if (!templateId) {
      return NextResponse.json(
        { message: "Template ID is required" },
        { status: 400 },
      );
    }

    if (!placeholders || typeof placeholders !== "object") {
      return NextResponse.json(
        { message: "Placeholders must be an object" },
        { status: 400 },
      );
    }

    console.log("Creating Drive and Slides clients");

    // Create Drive and Slides clients
    const drive = google.drive({ version: "v3", auth });
    const slides = google.slides({ version: "v1", auth });

    console.log("Copying template presentation:", templateId);

    // Step 1: Create a copy of the template
    const copyResponse = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name:
          userLanguage === "de"
            ? `Immobilien-Präsentation - ${new Date().toISOString()}`
            : `Property Presentation - ${new Date().toISOString()}`,
        properties: {
          language: userLanguage,
          preferredLanguage: userLanguage,
          locale: userLanguage === "de" ? "de_DE" : "en_US",
        },
      },
    });

    console.log("Copy response:", copyResponse.data);

    const newPresentationId = copyResponse.data.id;

    if (!newPresentationId) {
      throw new Error("Failed to create presentation copy");
    }

    console.log("Making presentation publicly accessible:", newPresentationId);

    // Make the presentation publicly accessible with editing permissions and set language again
    await drive.permissions.create({
      fileId: newPresentationId,
      requestBody: {
        role: "writer",
        type: "anyone",
      },
    });

    // Set language property on file metadata (may help with language settings)
    console.log(`Setting language property to ${userLanguage} on presentation`);
    await drive.files.update({
      fileId: newPresentationId,
      requestBody: {
        properties: {
          language: userLanguage,
          preferredLanguage: userLanguage,
          locale: userLanguage === "de" ? "de_DE" : "en_US",
          ui_language: userLanguage,
        },
      },
    });

    // Get the presentation content
    console.log("Fetching presentation content:", newPresentationId);
    const presentation = await slides.presentations.get({
      presentationId: newPresentationId,
    });

    console.log("Presentation content retrieved");

    // Check template placeholders
    console.log("CHECKING TEMPLATE FOR IMAGE PLACEHOLDERS:");
    let foundPlaceholders = new Set<string>();
    presentation.data.slides?.forEach((slide, slideIndex) => {
      // Check each slide for image elements
      slide.pageElements?.forEach((element) => {
        if (element.image && element.title) {
          foundPlaceholders.add(element.title);
          console.log(
            `Slide ${slideIndex + 1}: Found image placeholder '${element.title}'`,
          );
        }
      });
    });

    // Compare with the expected placeholders for the selected pages
    if (
      placeholders.interiorLayoutPages &&
      Array.isArray(placeholders.interiorLayoutPages)
    ) {
      placeholders.interiorLayoutPages.forEach((pageIndex: number | string) => {
        // <-- UPDATED with type annotation
        let pageType = "";
        if (pageIndex === 12)
          pageType = "A"; // 2 horizontal
        else if (pageIndex === 13)
          pageType = "B"; // 4 vertical
        else if (pageIndex === 14)
          pageType = "C"; // 1 horizontal + 2 vertical
        else if (pageIndex === 15)
          pageType = "D"; // 1 vertical
        else if (pageIndex === 16) pageType = "E"; // 1 horizontal

        // Check for all expected placeholders for this page type
        if (pageType) {
          const prefix = "int";
          const expectedPlaceholders = [];

          switch (pageType) {
            case "A":
              expectedPlaceholders.push(
                `{{{{${prefix}_a_himg1}}}}`,
                `{{{{${prefix}_a_himg2}}}}`,
                `{{{{${prefix}_a_himg3}}}}`,
                `{{{{${prefix}_a_himg4}}}}`,
                `{{{{${prefix}_a_himg5}}}}`,
                `{{{{${prefix}_a_himg6}}}}`,
              );
              break;
            case "B":
              expectedPlaceholders.push(
                `{{{{${prefix}_b_vimg1}}}}`,
                `{{{{${prefix}_b_vimg2}}}}`,
                `{{{{${prefix}_b_vimg3}}}}`,
                `{{{{${prefix}_b_vimg4}}}}`,
              );
              break;
            case "C":
              expectedPlaceholders.push(
                `{{{{${prefix}_c_himg}}}}`,
                `{{{{${prefix}_c_vimg1}}}}`,
                `{{{{${prefix}_c_vimg2}}}}`,
              );
              break;
            case "D":
              expectedPlaceholders.push(`{{{{${prefix}_d_vimg}}}}`);
              break;
            case "E":
              expectedPlaceholders.push(`{{{{${prefix}_e_himg}}}}`);
              break;
          }

          // Check if all expected placeholders exist in the template
          expectedPlaceholders.forEach((placeholder) => {
            if (foundPlaceholders.has(placeholder)) {
              console.log(
                `✅ Found expected placeholder in template: ${placeholder}`,
              );
            } else {
              console.log(
                `❌ MISSING expected placeholder in template: ${placeholder}`,
              );
            }
          });
        }
      });
    }

    // Get the list of all valid placeholder keys from the imported defaults
    const allPlaceholderKeys = Object.keys(defaultPlaceholders) as Array<
      keyof PropertyPlaceholders
    >;

    // Initialize with defaults to ensure all keys and types exist
    const processedPlaceholders: Partial<PropertyPlaceholders> = {
      ...defaultPlaceholders,
    };

    // Process only the placeholders provided in the request body
    if (placeholders && typeof placeholders === "object") {
      for (const key in placeholders) {
        // Check if the key is a valid PropertyPlaceholders key
        if (key in processedPlaceholders) {
          const typedKey = key as keyof PropertyPlaceholders;
          const value = placeholders[key];

          if (value !== undefined && value !== null) {
            if (typedKey === "selected_pages") {
              // Assign only if it's a valid object, otherwise keep default
              if (typeof value === "object" && !Array.isArray(value)) {
                processedPlaceholders[typedKey] = value as Record<
                  string,
                  boolean
                >;
              } // else: keep the default {} from initialization
            } else {
              // Assign other string values
              // Cast target to allow string assignment
              (
                processedPlaceholders as Record<
                  keyof PropertyPlaceholders,
                  string | Record<string, boolean>
                >
              )[typedKey] = String(value);
            }
          } // else: keep the default value if incoming value is null/undefined
        }
      }
    }

    // Create the map for replacing text in Google Slides.
    // Include ONLY string placeholders.
    const placeholderMap: Record<string, string> = {};
    allPlaceholderKeys.forEach((key) => {
      const value = processedPlaceholders[key];
      // Only include if the value is a string
      if (typeof value === "string") {
        const templateKey = `{${key}}`;
        placeholderMap[templateKey] = value;
      }
    });

    // For each placeholder, create a replace text request
    const requests = [];
    for (const [placeholder, value] of Object.entries(placeholderMap)) {
      // Only add request if placeholder is not empty to avoid replacing with empty strings if not intended
      if (placeholder && placeholder !== "{}") {
        // Avoid empty key placeholders
        console.log(`Creating replacement request for ${placeholder}`);
        requests.push({
          replaceAllText: {
            containsText: {
              text: placeholder,
              matchCase: false, // Typically better not to match case for placeholders
            },
            replaceText: String(value), // Ensure value is a string
          },
        });
      }
    }

    // Get the exterior and interior layout pages as numbers
    let exteriorPageNumbers: number[] = [];
    let interiorPageNumbers: number[] = [];

    if (
      placeholders.exteriorLayoutPages &&
      Array.isArray(placeholders.exteriorLayoutPages)
    ) {
      // Convert to page numbers (not slide indices)
      exteriorPageNumbers = placeholders.exteriorLayoutPages.map(
        (page: number | string) =>
          typeof page === "string" ? parseInt(page, 10) : page,
      );
      console.log("Exterior page numbers:", exteriorPageNumbers);
    }

    if (
      placeholders.interiorLayoutPages &&
      Array.isArray(placeholders.interiorLayoutPages)
    ) {
      // Convert to page numbers (not slide indices)
      interiorPageNumbers = placeholders.interiorLayoutPages.map(
        (page: number | string) =>
          typeof page === "string" ? parseInt(page, 10) : page,
      );
      console.log("Interior page numbers:", interiorPageNumbers);
    }

    // Process image replacements if provided
    if (
      images &&
      typeof images === "object" &&
      Object.keys(images).length > 0
    ) {
      // First, we need to find all image elements in the presentation
      const imageElements: any[] = [];

      // Iterate through all slides
      presentation.data.slides?.forEach((slide, slideIndex) => {
        // Iterate through all page elements on the slide
        slide.pageElements?.forEach((element) => {
          // Check if this is an image element
          if (element.image && element.objectId) {
            // Store additional information about the image element
            imageElements.push({
              objectId: element.objectId,
              title: element.title || "",
              description: element.description || "", // Also check description field
              slideIndex,
              slideNumber: slideIndex + 1, // 1-based slide number for easier reference
            });
          }
        });
      });

      console.log(
        `Found ${imageElements.length} image elements in the presentation`,
      );

      // Log all image elements for debugging
      console.log("DEBUG - All image elements:");
      imageElements.forEach((img, idx) => {
        console.log(`  [${idx}] "${img.title}" on slide ${img.slideIndex + 1}`);
      });

      // Process dynamic layout images for exterior and interior photos
      if (
        placeholders.exteriorImages &&
        Array.isArray(placeholders.exteriorImages) &&
        placeholders.exteriorOrientations &&
        placeholders.exteriorLayoutPages &&
        Array.isArray(placeholders.exteriorLayoutPages)
      ) {
        console.log("Processing exterior images for dynamic layout");

        // Define the exact mapping of page numbers to their placeholder IDs
        const exactExteriorPlaceholders: Record<number, { horizontal: string[], vertical: string[] }> = {
          7: { 
              horizontal: ["{{{{ext_a_himg1}}}}", "{{{{ext_a_himg2}}}}"],
              vertical: []
          },
          8: { 
              horizontal: [],
              vertical: ["{{{{ext_b_vimg1}}}}", "{{{{ext_b_vimg2}}}}", "{{{{ext_b_vimg3}}}}", "{{{{ext_b_vimg4}}}}"]
          },
          9: { 
              horizontal: ["{{{{ext_c_himg}}}}"],
              vertical: ["{{{{ext_c_vimg1}}}}", "{{{{ext_c_vimg2}}}}"]
          },
          10: { 
              horizontal: [],
              vertical: ["{{{{ext_d_vimg}}}}"]
          },
          11: { 
              horizontal: ["{{{{ext_e_himg}}}}"],
              vertical: []
          }
        };

        // Sort images by orientation strictly
        const horizontalImages: string[] = [];
        const verticalImages: string[] = [];
        
        placeholders.exteriorImages.forEach((imageUrl: string, index: number) => {
          const orientation = placeholders.exteriorOrientations[index.toString()] || "horizontal";
          if (orientation === "horizontal" || orientation === "square") {
            horizontalImages.push(imageUrl);
          } else if (orientation === "vertical") {
            verticalImages.push(imageUrl);
          }
        });
        
        console.log(`Exterior images sorted: ${horizontalImages.length} horizontal, ${verticalImages.length} vertical`);
        
        // Count occurrences of each page to handle duplicates
        const pageOccurrences: Record<number, number> = {};
        placeholders.exteriorLayoutPages.forEach((page: number | string) => {
            const pageNum = typeof page === "string" ? parseInt(page, 10) : page;
          pageOccurrences[pageNum] = (pageOccurrences[pageNum] || 0) + 1;
        });
        
        console.log("Page occurrences in exteriorLayoutPages:", pageOccurrences);
        
        // Separate counters for horizontal and vertical images
        let horizontalCounter = 0;
        let verticalCounter = 0;
        
        // Create the mapping object to store final placeholder to image URL mappings
        const exteriorImageMapping: Record<string, string> = {};
        
        // Track which instance of each page we're processing
        const pageInstanceTracking: Record<number, number> = {};
        
        // Process each page in order of appearance
        placeholders.exteriorLayoutPages.forEach((pageNum: number | string) => {
          const page = typeof pageNum === "string" ? parseInt(pageNum, 10) : pageNum;
          
          // Track which instance of this page we're on
          pageInstanceTracking[page] = (pageInstanceTracking[page] || 0) + 1;
          const currentInstance = pageInstanceTracking[page];
          
          console.log(`Processing page ${page} (instance #${currentInstance} of ${pageOccurrences[page]})`);
          
          // Get the placeholders for this page
          const placeholders = exactExteriorPlaceholders[page];
          if (!placeholders) {
            console.log(`No placeholders defined for page ${page}`);
            return;
          }
          
          // Calculate the starting indices for this page instance
          // Different logic based on page type and current instance
          let hStartIndex = 0;
          let vStartIndex = 0;
          
          if (page === 7) { // 2 horizontal images
            hStartIndex = (currentInstance - 1) * 2; // Each instance uses 2 horizontal images
          } else if (page === 8) { // 4 vertical images
            vStartIndex = (currentInstance - 1) * 4; // Each instance uses 4 vertical images
          } else if (page === 9) { // 1 horizontal + 2 vertical
            hStartIndex = (currentInstance - 1) * 1; // Each instance uses 1 horizontal image
            vStartIndex = (currentInstance - 1) * 2; // Each instance uses 2 vertical images
          } else if (page === 10) { // 1 vertical image
            vStartIndex = (currentInstance - 1) * 1; // Each instance uses 1 vertical image
          } else if (page === 11) { // 1 horizontal image
            hStartIndex = (currentInstance - 1) * 1; // Each instance uses 1 horizontal image
          }
          
          // Process horizontal placeholders
          placeholders.horizontal.forEach((placeholder, idx) => {
            const imageIndex = hStartIndex + idx;
            if (imageIndex < horizontalImages.length) {
              exteriorImageMapping[placeholder] = horizontalImages[imageIndex];
              console.log(`Mapped horizontal placeholder ${placeholder} to image #${imageIndex}: ${horizontalImages[imageIndex].substring(0, 30)}...`);
                } else {
              console.log(`No horizontal image available for ${placeholder} (would need image #${imageIndex})`);
            }
          });
          
          // Process vertical placeholders
          placeholders.vertical.forEach((placeholder, idx) => {
            const imageIndex = vStartIndex + idx;
            if (imageIndex < verticalImages.length) {
              exteriorImageMapping[placeholder] = verticalImages[imageIndex];
              console.log(`Mapped vertical placeholder ${placeholder} to image #${imageIndex}: ${verticalImages[imageIndex].substring(0, 30)}...`);
            } else {
              console.log(`No vertical image available for ${placeholder} (would need image #${imageIndex})`);
            }
          });
        });

        // Add exterior image mappings to the images object
        Object.entries(exteriorImageMapping).forEach(([placeholder, url]) => {
          images[placeholder] = url;
        });

        // For debugging: Log the complete mapping
        console.log(`Added ${Object.keys(exteriorImageMapping).length} exterior image mappings`);
      }

      if (
        placeholders.interiorImages &&
        Array.isArray(placeholders.interiorImages) &&
        placeholders.interiorOrientations &&
        placeholders.interiorLayoutPages &&
        Array.isArray(placeholders.interiorLayoutPages)
      ) {
        console.log("Processing interior images for dynamic layout");

        // Define the exact mapping of page numbers to their placeholder IDs, separated by orientation
        const exactInteriorPlaceholders: Record<number, { horizontal: string[], vertical: string[] }> = {
          12: { 
              horizontal: ["{{{{int_a_himg1}}}}", "{{{{int_a_himg2}}}}"],
              vertical: []
          },
          13: { 
              horizontal: [],
              vertical: ["{{{{int_b_vimg1}}}}", "{{{{int_b_vimg2}}}}", "{{{{int_b_vimg3}}}}", "{{{{int_b_vimg4}}}}"]
          },
          14: { 
              horizontal: ["{{{{int_c_himg}}}}"],
              vertical: ["{{{{int_c_vimg1}}}}", "{{{{int_c_vimg2}}}}"]
          },
          15: { 
              horizontal: [],
              vertical: ["{{{{int_d_vimg}}}}"]
          },
          16: { 
              horizontal: ["{{{{int_e_himg}}}}"],
              vertical: []
          }
        };

        // Sort images by orientation strictly
        const horizontalImages: string[] = [];
        const verticalImages: string[] = [];
        
        placeholders.interiorImages.forEach((imageUrl: string, index: number) => {
          const orientation = placeholders.interiorOrientations[index.toString()] || "horizontal";
          if (orientation === "horizontal" || orientation === "square") {
            horizontalImages.push(imageUrl);
          } else if (orientation === "vertical") {
            verticalImages.push(imageUrl);
          }
        });
        
        console.log(`Interior images sorted: ${horizontalImages.length} horizontal, ${verticalImages.length} vertical`);
        
        // Count occurrences of each page to handle duplicates
        const pageOccurrences: Record<number, number> = {};
        placeholders.interiorLayoutPages.forEach((page: number | string) => {
            const pageNum = typeof page === "string" ? parseInt(page, 10) : page;
          pageOccurrences[pageNum] = (pageOccurrences[pageNum] || 0) + 1;
        });
        
        console.log("Page occurrences in interiorLayoutPages:", pageOccurrences);
        
        // Create the mapping object to store final placeholder to image URL mappings
        const interiorImageMapping: Record<string, string> = {};
        
        // Track which instance of each page we're processing
        const pageInstanceTracking: Record<number, number> = {};
        
        // Process each page in order of appearance
        placeholders.interiorLayoutPages.forEach((pageNum: number | string) => {
          const page = typeof pageNum === "string" ? parseInt(pageNum, 10) : pageNum;
          
          // Track which instance of this page we're on
          pageInstanceTracking[page] = (pageInstanceTracking[page] || 0) + 1;
          const currentInstance = pageInstanceTracking[page];
          
          console.log(`Processing page ${page} (instance #${currentInstance} of ${pageOccurrences[page]})`);
          
          // Get the placeholders for this page
          const placeholders = exactInteriorPlaceholders[page];
          if (!placeholders) {
            console.log(`No placeholders defined for page ${page}`);
            return;
          }
          
          // Calculate the starting indices for this page instance
          // Different logic based on page type and current instance
          let hStartIndex = 0;
          let vStartIndex = 0;
          
          if (page === 12) { // 2 horizontal images
            hStartIndex = (currentInstance - 1) * 2; // Each instance uses 2 horizontal images
          } else if (page === 13) { // 4 vertical images
            vStartIndex = (currentInstance - 1) * 4; // Each instance uses 4 vertical images
          } else if (page === 14) { // 1 horizontal + 2 vertical
            hStartIndex = (currentInstance - 1) * 1; // Each instance uses 1 horizontal image
            vStartIndex = (currentInstance - 1) * 2; // Each instance uses 2 vertical images
          } else if (page === 15) { // 1 vertical image
            vStartIndex = (currentInstance - 1) * 1; // Each instance uses 1 vertical image
          } else if (page === 16) { // 1 horizontal image
            hStartIndex = (currentInstance - 1) * 1; // Each instance uses 1 horizontal image
          }
          
          // Process horizontal placeholders
          placeholders.horizontal.forEach((placeholder, idx) => {
            const imageIndex = hStartIndex + idx;
            if (imageIndex < horizontalImages.length) {
              interiorImageMapping[placeholder] = horizontalImages[imageIndex];
              console.log(`Mapped horizontal placeholder ${placeholder} to image #${imageIndex}: ${horizontalImages[imageIndex].substring(0, 30)}...`);
                } else {
              console.log(`No horizontal image available for ${placeholder} (would need image #${imageIndex})`);
            }
          });
          
          // Process vertical placeholders
          placeholders.vertical.forEach((placeholder, idx) => {
            const imageIndex = vStartIndex + idx;
            if (imageIndex < verticalImages.length) {
              interiorImageMapping[placeholder] = verticalImages[imageIndex];
              console.log(`Mapped vertical placeholder ${placeholder} to image #${imageIndex}: ${verticalImages[imageIndex].substring(0, 30)}...`);
            } else {
              console.log(`No vertical image available for ${placeholder} (would need image #${imageIndex})`);
            }
          });
        });

        // Add interior image mappings to the images object
        Object.entries(interiorImageMapping).forEach(([placeholder, url]) => {
          images[placeholder] = url;
        });

        // For debugging: Log the complete mapping
        console.log(`Added ${Object.keys(interiorImageMapping).length} interior image mappings`);
      }

      // Add page 17 and 18 image mappings if they exist
      // These are special cases for image7 and image8
      if (placeholders['{{image7}}'] || placeholders['image7'] || placeholders.floorPlanImage) {
        // Use the first available value
        const floorPlanImage = placeholders['{{image7}}'] || placeholders['image7'] || placeholders.floorPlanImage || '';
        if (floorPlanImage && typeof floorPlanImage === 'string') {
        // Make sure to use the correct format with both 2 and 4 curly braces for maximum compatibility
          images['{{{{image7}}}}'] = floorPlanImage;
          images['{{image7}}'] = floorPlanImage;
          images['image7'] = floorPlanImage;
          console.log(`Added page 17 (Floor Plan) image mapping: {{{{image7}}}} -> ${floorPlanImage.substring(0, 30)}...`);
        }
      }
      
      if (placeholders['{{image8}}'] || placeholders['image8'] || placeholders.energyCertificateImage) {
        // Use the first available value
        const energyCertImage = placeholders['{{image8}}'] || placeholders['image8'] || placeholders.energyCertificateImage || '';
        if (energyCertImage && typeof energyCertImage === 'string') {
        // Make sure to use the correct format with both 2 and 4 curly braces for maximum compatibility
          images['{{{{image8}}}}'] = energyCertImage;
          images['{{image8}}'] = energyCertImage;
          images['image8'] = energyCertImage;
          console.log(`Added page 18 (Energy Certificate) image mapping: {{{{image8}}}} -> ${energyCertImage.substring(0, 30)}...`);
        }
      }
      
      // Also check for direct image7 and image8 keys (without braces)
      if (placeholders['image7'] && typeof placeholders['image7'] === 'string') {
        images['{{{{image7}}}}'] = placeholders['image7'];
        images['{{image7}}'] = placeholders['image7'];
        images['image7'] = placeholders['image7'];
        console.log(`Added page 17 image mapping from direct key: image7 -> ${placeholders['image7'].substring(0, 30)}...`);
      }
      
      if (placeholders['image8'] && typeof placeholders['image8'] === 'string') {
        images['{{{{image8}}}}'] = placeholders['image8'];
        images['{{image8}}'] = placeholders['image8'];
        images['image8'] = placeholders['image8'];
        console.log(`Added page 18 image mapping from direct key: image8 -> ${placeholders['image8'].substring(0, 30)}...`);
      }
      
      // Add explicit mappings for Floor Plan and Energy Certificate
      // Map image7 (Floor Plan) to page 17
      console.log("Adding explicit mapping for Floor Plan (image7) on page 17");
      // Check all possible sources for the Floor Plan image
      const floorPlanImage = 
        (placeholders['{{image7}}'] && typeof placeholders['{{image7}}'] === 'string' ? placeholders['{{image7}}'] : null) ||
        (placeholders['image7'] && typeof placeholders['image7'] === 'string' ? placeholders['image7'] : null) ||
        (placeholders.floorPlanImage && typeof placeholders.floorPlanImage === 'string' ? placeholders.floorPlanImage : null);
      
      if (floorPlanImage) {
        // Add to image mappings with all possible formats
        images['{{{{image7}}}}'] = floorPlanImage;
        images['image7'] = floorPlanImage;
        // Also map directly to page 17
        const pageIndex = 16; // Page 17 (0-indexed)
        if (presentation.data.slides && presentation.data.slides[pageIndex]) {
          const slideId = presentation.data.slides[pageIndex].objectId;
          console.log(`Found slide ID for page 17: ${slideId}`);
          // Find all image elements on this slide
          const page17Images = imageElements.filter(img => img.slideIndex === pageIndex);
          console.log(`Found ${page17Images.length} images on page 17`);
          // Map the image to all image elements on page 17
          page17Images.forEach(img => {
            console.log(`Explicitly mapping Floor Plan image to element ${img.objectId} on page 17`);
            requests.push({
              replaceImage: {
                imageObjectId: img.objectId,
                url: floorPlanImage,
                imageReplaceMethod: "CENTER_INSIDE",
              },
            });
          });
        }
      }
      
      // Map image8 (Energy Certificate) to page 18
      console.log("Adding explicit mapping for Energy Certificate (image8) on page 18");
      // Check all possible sources for the Energy Certificate image
      const energyCertificateImage = 
        (placeholders['{{image8}}'] && typeof placeholders['{{image8}}'] === 'string' ? placeholders['{{image8}}'] : null) ||
        (placeholders['image8'] && typeof placeholders['image8'] === 'string' ? placeholders['image8'] : null) ||
        (placeholders.energyCertificateImage && typeof placeholders.energyCertificateImage === 'string' ? placeholders.energyCertificateImage : null);
      
      if (energyCertificateImage) {
        // Add to image mappings with all possible formats
        images['{{{{image8}}}}'] = energyCertificateImage;
        images['image8'] = energyCertificateImage;
        // Also map directly to page 18
        const pageIndex = 17; // Page 18 (0-indexed)
        if (presentation.data.slides && presentation.data.slides[pageIndex]) {
          const slideId = presentation.data.slides[pageIndex].objectId;
          console.log(`Found slide ID for page 18: ${slideId}`);
          // Find all image elements on this slide
          const page18Images = imageElements.filter(img => img.slideIndex === pageIndex);
          console.log(`Found ${page18Images.length} images on page 18`);
          // Map the image to all image elements on page 18
          page18Images.forEach(img => {
            console.log(`Explicitly mapping Energy Certificate image to element ${img.objectId} on page 18`);
            requests.push({
              replaceImage: {
                imageObjectId: img.objectId,
                url: energyCertificateImage,
                imageReplaceMethod: "CENTER_INSIDE",
              },
            });
          });
        }
      }
      
      // IMPORTANT: Make sure image7 (Floor Plan) and image8 (Energy Certificate) are in the images object
      // These are special cases that need to be handled explicitly
      
      // Floor Plan (image7) - Page 17
      const floorPlanSrc = placeholders['{{image7}}'] || 
                         placeholders['image7'] || 
                         (placeholders.floorPlanImage ? placeholders.floorPlanImage : null);
      
      if (floorPlanSrc && typeof floorPlanSrc === 'string') {
        // Add with exact placeholder format - using both 2 and 4 brace formats for compatibility
        images['{{{{image7}}}}'] = floorPlanSrc;
        images['image7'] = floorPlanSrc;
        console.log(`FORCED: Added Floor Plan {{{{image7}}}} -> ${floorPlanSrc.substring(0, 30)}...`);
      }
      
      // Energy Certificate (image8) - Page 18
      const energyCertSrc = placeholders['{{image8}}'] || 
                          placeholders['image8'] || 
                          (placeholders.energyCertificateImage ? placeholders.energyCertificateImage : null);
      
      if (energyCertSrc && typeof energyCertSrc === 'string') {
        // Add with exact placeholder format - using both 2 and 4 brace formats for compatibility
        images['{{{{image8}}}}'] = energyCertSrc;
        images['image8'] = energyCertSrc;
        console.log(`FORCED: Added Energy Certificate {{{{image8}}}} -> ${energyCertSrc.substring(0, 30)}...`);
      }
      
      // Double check the image mappings
      console.log("ALL FINAL IMAGE MAPPINGS:");
      Object.entries(images).forEach(([key, url]) => {
        if (typeof url === "string") {
          console.log(`${key} -> ${url.substring(0, 30)}...`);
        } else {
          console.log(`${key} -> (non-string value)`);
        }
      });
      
      // Extra check for image7 and image8 - log them explicitly
      if (images['{{{{image7}}}}']) {
        console.log(`VERIFIED: {{{{image7}}}} is in the images object: ${images['{{{{image7}}}}'].substring(0, 30)}...`);
      } else {
        console.log('WARNING: {{{{image7}}}} is NOT in the images object!');
      }
      
      if (images['{{{{image8}}}}']) {
        console.log(`VERIFIED: {{{{image8}}}} is in the images object: ${images['{{{{image8}}}}'].substring(0, 30)}...`);
      } else {
        console.log('WARNING: {{{{image8}}}} is NOT in the images object!');  
      }

      // CRITICAL: Process all images based on the placeholderMapping
      // This is the most reliable way to ensure all images are replaced correctly
      console.log("Using placeholderMapping from ImagesStep.tsx for ALL image replacements");
      
      // First, process special pages (Floor Plan and Energy Certificate)
      // Floor Plan (image7) - Page 17
      if (images['{{{{image7}}}}'] && typeof images['{{{{image7}}}}'] === 'string') {
        const floorPlanUrl = images['{{{{image7}}}}'];
        console.log(`PRIORITY PROCESSING: Floor Plan image ({{{{image7}}}}) -> ${floorPlanUrl.substring(0, 30)}...`);
        
        // Find all images on page 17 (index 16)
        const page17Images = imageElements.filter(img => img.slideIndex === 16);
        console.log(`Found ${page17Images.length} images on page 17 for Floor Plan replacement`);
        
        if (page17Images.length > 0) {
          // Create replacement requests for all images on page 17
          page17Images.forEach(img => {
            console.log(`Creating DIRECT replacement for Floor Plan on page 17, element ID: ${img.objectId}`);
            requests.push({
              replaceImage: {
                imageObjectId: img.objectId,
                url: floorPlanUrl,
                imageReplaceMethod: "CENTER_INSIDE",
              },
            });
          });
        } else {
          console.log("WARNING: No images found on page 17 for Floor Plan replacement");
        }
      } else {
        console.log("WARNING: No Floor Plan image ({{{{image7}}}}) found in images object");
      }
      
      // Energy Certificate (image8) - Page 18
      if (images['{{{{image8}}}}'] && typeof images['{{{{image8}}}}'] === 'string') {
        const energyCertUrl = images['{{{{image8}}}}'];
        console.log(`PRIORITY PROCESSING: Energy Certificate image ({{{{image8}}}}) -> ${energyCertUrl.substring(0, 30)}...`);
        
        // Find all images on page 18 (index 17)
        const page18Images = imageElements.filter(img => img.slideIndex === 17);
        console.log(`Found ${page18Images.length} images on page 18 for Energy Certificate replacement`);
        
        if (page18Images.length > 0) {
          // Create replacement requests for all images on page 18
          page18Images.forEach(img => {
            console.log(`Creating DIRECT replacement for Energy Certificate on page 18, element ID: ${img.objectId}`);
            requests.push({
              replaceImage: {
                imageObjectId: img.objectId,
                url: energyCertUrl,
                imageReplaceMethod: "CENTER_INSIDE",
              },
            });
          });
        } else {
          console.log("WARNING: No images found on page 18 for Energy Certificate replacement");
        }
      } else {
        console.log("WARNING: No Energy Certificate image ({{{{image8}}}}) found in images object");
      }
      
      // Now process all placeholders from the placeholderMapping
      if (placeholders.placeholderMapping && typeof placeholders.placeholderMapping === 'object') {
        console.log("Processing ALL placeholders from placeholderMapping");
        
        // First, make sure all placeholders from uploadedImages are in the images object
        // This ensures we have all the image URLs properly mapped to their placeholders
        Object.keys(placeholders).forEach(key => {
          if (key.includes('{{{{') && placeholders[key] && typeof placeholders[key] === 'string') {
            // This is a placeholder with 4 braces
            images[key] = placeholders[key];
            console.log(`Added placeholder from uploadedImages: ${key} -> ${placeholders[key].substring(0, 30)}...`);
          } else if (key.startsWith('ext_') || key.startsWith('int_')) {
            // This might be an exterior or interior placeholder
            const placeholder = `{{{{${key}}}}}`;
            if (placeholders[key] && typeof placeholders[key] === 'string') {
              images[placeholder] = placeholders[key];
              console.log(`Added formatted placeholder: ${placeholder} -> ${placeholders[key].substring(0, 30)}...`);
            }
          }
        });
        
        // Also add all presentation_images to ensure we have all images available
        if (placeholders.presentation_images && Array.isArray(placeholders.presentation_images)) {
          console.log(`Found ${placeholders.presentation_images.length} images in presentation_images array`);
          
          // Store these for later use in case we need to match by page number
          const presentationImages = placeholders.presentation_images;
          
          // Make sure exteriorImages and interiorImages are available
          const exteriorImages = placeholders.exteriorImages || [];
          const interiorImages = placeholders.interiorImages || [];
          
          console.log(`Exterior images: ${exteriorImages.length}, Interior images: ${interiorImages.length}`);
        }
        
        // Iterate through each page in the placeholderMapping
        Object.entries(placeholders.placeholderMapping).forEach(([pageNumStr, pagePlaceholders]) => {
          const pageNum = parseInt(pageNumStr, 10);
          const slideIndex = pageNum - 1; // Convert from 1-based to 0-based
          
          console.log(`Processing placeholders for page ${pageNum} (slide index ${slideIndex})`);
          console.log(`Placeholders for this page:`, pagePlaceholders);
          
          // Skip pages 17 and 18 as we've already processed them
          if (pageNum === 17 || pageNum === 18) {
            console.log(`Skipping page ${pageNum} as it was already processed directly`);
            return;
          }
          
          // Process each placeholder for this page
          if (Array.isArray(pagePlaceholders)) {
            pagePlaceholders.forEach(placeholder => {
              // First try to find the image URL directly from placeholders object
              let imageUrl = placeholders[placeholder];
              
              // If not found, try the images object
              if (!imageUrl && images[placeholder] && typeof images[placeholder] === 'string') {
                imageUrl = images[placeholder];
              }
              
              // If we have an image URL, process it
              if (imageUrl && typeof imageUrl === 'string') {
                console.log(`Found image for placeholder ${placeholder} on page ${pageNum}: ${imageUrl.substring(0, 30)}...`);
                
                // Find all image elements on this page with this placeholder
                const matchingImages = imageElements.filter(img => 
                  img.slideIndex === slideIndex && 
                  (img.title.includes(placeholder) || 
                   (img.description && img.description.includes(placeholder)))
                );
                
                console.log(`Found ${matchingImages.length} matching images for ${placeholder} on page ${pageNum}`);
                
                // Create replacement requests for all matching images
                matchingImages.forEach(img => {
                  console.log(`Creating replacement for ${placeholder} on page ${pageNum}, element ID: ${img.objectId}`);
                  requests.push({
                    replaceImage: {
                      imageObjectId: img.objectId,
                      url: imageUrl,
                      imageReplaceMethod: "CENTER_INSIDE",
                    },
                  });
                });
              } else {
                console.log(`No image found for placeholder ${placeholder} on page ${pageNum}`);
              }
            });
          }
          
          // If no matching images were found by placeholder, try to use images by page number
          // This is a fallback mechanism for pages that don't have proper placeholder matching
          if (pageNum >= 7 && pageNum <= 11 && placeholders.exteriorImages && placeholders.exteriorImages.length > 0) {
            // This is an exterior page
            const pageImages = imageElements.filter(img => img.slideIndex === slideIndex);
            if (pageImages.length > 0 && placeholders.exteriorImages.length > 0) {
              console.log(`Fallback: Using exterior images for page ${pageNum}`);
              pageImages.forEach((img, idx) => {
                if (idx < placeholders.exteriorImages.length) {
                  const imageUrl = placeholders.exteriorImages[idx];
                  console.log(`Fallback replacement for page ${pageNum}, element ID: ${img.objectId}`);
                  requests.push({
                    replaceImage: {
                      imageObjectId: img.objectId,
                      url: imageUrl,
                      imageReplaceMethod: "CENTER_INSIDE",
                    },
                  });
                }
              });
            }
          } else if (pageNum >= 12 && pageNum <= 16 && placeholders.interiorImages && placeholders.interiorImages.length > 0) {
            // This is an interior page
            const pageImages = imageElements.filter(img => img.slideIndex === slideIndex);
            if (pageImages.length > 0 && placeholders.interiorImages.length > 0) {
              console.log(`Fallback: Using interior images for page ${pageNum}`);
              pageImages.forEach((img, idx) => {
                if (idx < placeholders.interiorImages.length) {
                  const imageUrl = placeholders.interiorImages[idx];
                  console.log(`Fallback replacement for page ${pageNum}, element ID: ${img.objectId}`);
                  requests.push({
                    replaceImage: {
                      imageObjectId: img.objectId,
                      url: imageUrl,
                      imageReplaceMethod: "CENTER_INSIDE",
                    },
                  });
                }
              });
            }
          }
        });
      } else {
        console.log("WARNING: No placeholderMapping found in placeholders object");
        
        // Fallback: If no placeholderMapping exists, try to use exteriorImages and interiorImages directly
        if (placeholders.exteriorImages && placeholders.exteriorImages.length > 0) {
          console.log("Fallback: Using exteriorImages directly");
          
          // Map exterior images to pages 7-11
          for (let pageNum = 7; pageNum <= 11; pageNum++) {
            const slideIndex = pageNum - 1;
            const pageImages = imageElements.filter(img => img.slideIndex === slideIndex);
            
            if (pageImages.length > 0) {
              console.log(`Fallback: Processing page ${pageNum} with ${pageImages.length} images`);
              pageImages.forEach((img, idx) => {
                if (idx < placeholders.exteriorImages.length) {
                  const imageUrl = placeholders.exteriorImages[idx];
                  console.log(`Fallback replacement for page ${pageNum}, element ID: ${img.objectId}`);
                  requests.push({
                    replaceImage: {
                      imageObjectId: img.objectId,
                      url: imageUrl,
                      imageReplaceMethod: "CENTER_INSIDE",
                    },
                  });
                }
              });
            }
          }
        }
        
        if (placeholders.interiorImages && placeholders.interiorImages.length > 0) {
          console.log("Fallback: Using interiorImages directly");
          
          // Map interior images to pages 12-16
          for (let pageNum = 12; pageNum <= 16; pageNum++) {
            const slideIndex = pageNum - 1;
            const pageImages = imageElements.filter(img => img.slideIndex === slideIndex);
            
            if (pageImages.length > 0) {
              console.log(`Fallback: Processing page ${pageNum} with ${pageImages.length} images`);
              pageImages.forEach((img, idx) => {
                if (idx < placeholders.interiorImages.length) {
                  const imageUrl = placeholders.interiorImages[idx];
                  console.log(`Fallback replacement for page ${pageNum}, element ID: ${img.objectId}`);
                  requests.push({
                    replaceImage: {
                      imageObjectId: img.objectId,
                      url: imageUrl,
                      imageReplaceMethod: "CENTER_INSIDE",
                    },
                  });
                }
              });
            }
          }
        }
      }
      
      // Match image elements with provided image URLs
      Object.entries(images).forEach(([key, imageUrl]) => {
        // Skip image7 and image8 as we've already processed them
        if (key === '{{{{image7}}}}' || key === '{{{{image8}}}}') {
          console.log(`Skipping regular processing for ${key} as it was handled directly`);
          return;
        }
        
        // Make sure we're working with a string for the image URL
        const imgUrl = String(imageUrl);

        // Skip empty URLs
        if (!imgUrl.trim()) {
          console.log(`Skipping empty URL for key: ${key}`);
          return;
        }

        console.log(`Looking for image elements with title containing: ${key}`);

        // Find image elements with a title or description matching the placeholder
        // We check both fields and also try different formats of the key
        let matchingImages = imageElements.filter((img) => {
          // Create variations of the key to check against
          const keyWithoutBraces = key.replace(/[{}]/g, '');
          const keyWithTwoBraces = `{{${keyWithoutBraces}}}`;
          const keyWithFourBraces = `{{{{${keyWithoutBraces}}}}}`;
          
          // Check if any variation of the key is in the title or description
          return (
            img.title.includes(key) || 
            img.title.includes(keyWithoutBraces) || 
            img.title.includes(keyWithTwoBraces) || 
            img.title.includes(keyWithFourBraces) ||
            (img.description && (
              img.description.includes(key) || 
              img.description.includes(keyWithoutBraces) || 
              img.description.includes(keyWithTwoBraces) || 
              img.description.includes(keyWithFourBraces)
            ))
          );
        });

        // Special handling for image7 (Floor Plan) and image8 (Energy Certificate)
        if (key.includes('image7') || key === 'image7' || key === '{{{{image7}}}}') {
          // For image7 (Floor Plan), we know it's on page 17 (slide index 16)
          matchingImages = imageElements.filter(img => img.slideNumber === 17);
          console.log(`Special handling for Floor Plan ({{{{image7}}}}): Found ${matchingImages.length} images on page 17`);
          
          // If no matches found by slide number, try to find by title containing 'floor' or 'plan'
          if (matchingImages.length === 0) {
            matchingImages = imageElements.filter(img => 
              img.title.toLowerCase().includes('floor') || 
              img.title.toLowerCase().includes('plan') ||
              img.title.toLowerCase().includes('image7') ||
              (img.description && (
                img.description.toLowerCase().includes('floor') || 
                img.description.toLowerCase().includes('plan') ||
                img.description.toLowerCase().includes('image7')
              ))
            );
            console.log(`Fallback for Floor Plan: Found ${matchingImages.length} images by title/description`);
          }
        } else if (key.includes('image8') || key === 'image8' || key === '{{{{image8}}}}') {
          // For image8 (Energy Certificate), we know it's on page 18 (slide index 17)
          matchingImages = imageElements.filter(img => img.slideNumber === 18);
          console.log(`Special handling for Energy Certificate ({{{{image8}}}}): Found ${matchingImages.length} images on page 18`);
          
          // If no matches found by slide number, try to find by title containing 'energy' or 'certificate'
          if (matchingImages.length === 0) {
            matchingImages = imageElements.filter(img => 
              img.title.toLowerCase().includes('energy') || 
              img.title.toLowerCase().includes('certificate') ||
              img.title.toLowerCase().includes('image8') ||
              (img.description && (
                img.description.toLowerCase().includes('energy') || 
                img.description.toLowerCase().includes('certificate') ||
                img.description.toLowerCase().includes('image8')
              ))
            );
            console.log(`Fallback for Energy Certificate: Found ${matchingImages.length} images by title/description`);
          }
        }
        // For exterior and interior images, only replace images on selected pages
        else if (key.includes('ext_')) {
          // Only keep matches on selected exterior pages
          matchingImages = matchingImages.filter(img => {
            // Check if this image is on a selected exterior page
            return exteriorPageNumbers.includes(img.slideIndex);
          });
        } else if (key.includes('int_')) {
          // Only keep matches on selected interior pages
          matchingImages = matchingImages.filter(img => {
            // Check if this image is on a selected interior page
            return interiorPageNumbers.includes(img.slideIndex);
          });
        }
        // Don't filter for other special images - allow them to be replaced on any page

        console.log(
          `Found ${matchingImages.length} matching image elements for ${key} on selected pages`,
        );

        // Für Stadtbilder (auf Slide 2, Index 2) immer CENTER_INSIDE verwenden
        if (
          key === "cityimg1" ||
          key === "cityimg2" ||
          key === "cityimg3" ||
          key === "cityimg4"
        ) {
          matchingImages.forEach((img) => {
            console.log(
              `Creating image replacement for: ${img.objectId} -> ${imgUrl.substring(0, 30)}...`,
            );

            // Stadtbilder immer mit CENTER_INSIDE ersetzen
            requests.push({
              replaceImage: {
                imageObjectId: img.objectId,
                url: imgUrl,
                imageReplaceMethod: "CENTER_INSIDE",
              },
            });
          });
        } else {
          // Für alle anderen Bilder die bestehende Logik verwenden
          matchingImages.forEach((img) => {
            let replacementMethod = "CENTER_CROP"; // Standard-Methode

            // Für Logo und Agent CENTER_INSIDE verwenden
            if (
              key === "{{logo}}" ||
              key === "logo" ||
              key === "{{agent}}" ||
              key === "agent" ||
              key === "{{image7}}" ||
              key === "image7" ||
              key === "{{image8}}" ||
              key === "image8"
            ) {
              replacementMethod = "CENTER_INSIDE";
            }

            // New handling for dynamic layout placeholders
            // For dynamic layout vertical images, use CENTER_INSIDE
            if (
              key.includes("_d_vimg") || // Vertical images
              key.includes("_c_vimg") || // Vertical images in mixed layout
              key.includes("_b_vimg") // Vertical images in B layout
            ) {
              replacementMethod = "CENTER_INSIDE";
            }

            // For exterior and interior horizontal images, use CENTER_CROP
            if (
              key.includes("_a_himg") || // Horizontal images in A layout
              key.includes("_c_himg") || // Horizontal image in C layout
              key.includes("_e_himg") // Horizontal image in E layout
            ) {
              replacementMethod = "CENTER_CROP";
            }

            console.log(
              `Creating image replacement for: ${img.objectId} -> ${key} with method ${replacementMethod}`,
            );

            // Add a request to replace the image
            requests.push({
              replaceImage: {
                imageObjectId: img.objectId,
                url: imgUrl,
                imageReplaceMethod: replacementMethod,
              },
            });
          });
        }
      });
    }

    // Handle slide deletion for unchecked pages
    if (selectedPages && typeof selectedPages === "object") {
      console.log(
        "Processing selectedPages to remove unchecked slides:",
        selectedPages,
      );

      // We already have exteriorPageNumbers and interiorPageNumbers from earlier
      console.log("Exterior pages as numbers:", exteriorPageNumbers);
      console.log("Interior pages as numbers:", interiorPageNumbers);

      // Check if exterior/interior photo sections are selected
      const keepExteriorPhotos = selectedPages.exteriorPhotos === true;
      const keepInteriorPhotos = selectedPages.interiorPhotos === true;

      // DIRECT SLIDE HANDLING APPROACH
      console.log("DIRECT SLIDE HANDLING APPROACH:");

      // First, keep track of ALL slides we want to delete
      const slidesToDelete = new Set<string>();

      if (presentation.data.slides) {
        // Use the page indices from the pageToSlideMapping for consistency
        const exteriorIndices = pageToSlideMapping.exteriorPhotos; // [7, 8, 9, 10, 11]
        const interiorIndices = pageToSlideMapping.interiorPhotos; // [12, 13, 14, 15, 16]

        // For exterior pages, keep ONLY the ones explicitly in exteriorLayoutPages
        exteriorIndices.forEach(i => {
          // Convert selected page numbers to slide indices (subtract 1)
          const adjustedExteriorPageNumbers = exteriorPageNumbers.map(num => num - 1);
          
          // If exterior photos section is not selected, delete all exterior pages
          if (!keepExteriorPhotos) {
            if (presentation.data.slides && i < presentation.data.slides.length && 
                presentation.data.slides[i] && presentation.data.slides[i].objectId) {
              const slideId = presentation.data.slides[i].objectId || "";
              if (slideId) {
                slidesToDelete.add(slideId);
                console.log(`DELETE exterior slide ${i} (page ${i+1}) - section not selected`);
              }
            }
            return;
          }

          // If this slide should be kept, skip
          if (adjustedExteriorPageNumbers.includes(i)) {
            console.log(`KEEP exterior slide ${i} (page ${i+1}) - explicitly selected`);
            return; // Skip this iteration
          }

          // Otherwise mark for deletion
          if (
            presentation.data.slides && 
            i < presentation.data.slides.length &&
            presentation.data.slides[i] && 
            presentation.data.slides[i].objectId
          ) {
            const slideId = presentation.data.slides[i].objectId || "";
            if (slideId) {
              slidesToDelete.add(slideId);
              console.log(`DELETE exterior slide ${i} (page ${i+1}) - not selected`);
            }
          }
        });

        // For interior pages, keep ONLY the ones explicitly in interiorLayoutPages
        interiorIndices.forEach(i => {
          // Convert selected page numbers to slide indices (subtract 1)
          const adjustedInteriorPageNumbers = interiorPageNumbers.map(num => num - 1);
          
          // If interior photos section is not selected, delete all interior pages
          if (!keepInteriorPhotos) {
            if (presentation.data.slides && i < presentation.data.slides.length && 
                presentation.data.slides[i] && presentation.data.slides[i].objectId) {
              const slideId = presentation.data.slides[i].objectId || "";
              if (slideId) {
                slidesToDelete.add(slideId);
                console.log(`DELETE interior slide ${i} (page ${i+1}) - section not selected`);
              }
            }
            return;
          }

          // If this slide should be kept, skip
          if (adjustedInteriorPageNumbers.includes(i)) {
            console.log(`KEEP interior slide ${i} (page ${i+1}) - explicitly selected`);
            return; // Skip this iteration
          }

          // Otherwise mark for deletion
          if (
            presentation.data.slides && 
            i < presentation.data.slides.length &&
            presentation.data.slides[i] && 
            presentation.data.slides[i].objectId
          ) {
            const slideId = presentation.data.slides[i].objectId || "";
            if (slideId) {
              slidesToDelete.add(slideId);
              console.log(`DELETE interior slide ${i} (page ${i+1}) - not selected`);
            }
          }
        });
      }

      // Handle title page orientation selection
      if (presentation.data.slides && selectedPages.projectOverview) {
        // Handle title page orientation selection
        console.log("=== TITLE PAGE SELECTION ===");

        // Default orientation
        let titleImageOrientation: ImageOrientation = "horizontal";
        let orientationSource = "default";

        // First check if orientation is explicitly set in placeholders
        if (placeholders && placeholders.image1_orientation) {
          titleImageOrientation = placeholders.image1_orientation as ImageOrientation;
          orientationSource = "placeholders.image1_orientation";
          console.log(`Found orientation in placeholders: ${titleImageOrientation}`);
        }
        // Then check if orientation is present in the image URL
        else if (images && (images["image1"] || images["{{image1}}"]) && typeof (images["image1"] || images["{{image1}}"]) === 'string') {
          try {
            const imageUrl = images["image1"] || images["{{image1}}"];
            console.log(`Checking URL for orientation: ${imageUrl}`);

            if (imageUrl.includes("orientation=")) {
              // Extract the orientation from the URL parameters
              const url = new URL(imageUrl);
              const urlOrientation = url.searchParams.get("orientation");

              if (
                urlOrientation &&
                (urlOrientation === "vertical" ||
                  urlOrientation === "horizontal" ||
                  urlOrientation === "square")
              ) {
                titleImageOrientation = urlOrientation as ImageOrientation;
                orientationSource = "URL parameter";
                console.log(`Found orientation in URL: ${titleImageOrientation}`);
              }
            }
          } catch (e) {
            console.log("Could not extract orientation from URL:", e);
          }
        }

        // Also check project_details for orientation information
        if (placeholders && placeholders.project_details) {
          try {
            // Try to parse project_details if it's a string
            let projectDetails: any;
            if (typeof placeholders.project_details === 'string') {
              projectDetails = JSON.parse(placeholders.project_details);
            } else if (typeof placeholders.project_details === 'object') {
              projectDetails = placeholders.project_details;
            }
            
            if (projectDetails && projectDetails.image1_orientation) {
              titleImageOrientation = projectDetails.image1_orientation as ImageOrientation;
              orientationSource = "project_details.image1_orientation";
              console.log(`Found orientation in project_details: ${titleImageOrientation}`);
            }
          } catch (e) {
            console.log("Error parsing project_details:", e);
          }
        }

        // IMPORTANT: Force check for orientation keyword in placeholders
        const orientationKeys = Object.keys(placeholders).filter(
          (k) => k.includes("orient") || (k.includes("image") && k.includes("orientation"))
        );

        if (orientationKeys.length > 0) {
          console.log("Found keys that might contain orientation:", orientationKeys);

          for (const key of orientationKeys) {
            const value = String(placeholders[key]).toLowerCase();
            if (
              (key === "image1_orientation" || key.includes("image1_orientation")) && 
              (value === "vertical" || value === "horizontal" || value === "square")
            ) {
              titleImageOrientation = value as ImageOrientation;
              orientationSource = `placeholders[${key}]`;
              console.log(`Using orientation from key ${key}: ${value}`);
              break;
            }
          }
        }

        // Final safety check - extract from URL again
        if (images) {
          for (const [key, url] of Object.entries(images)) {
            if (
              typeof url === "string" &&
              key.includes("image1") &&
              url.includes("orientation=")
            ) {
              try {
                const urlObj = new URL(url);
                const urlOrientation = urlObj.searchParams.get("orientation");
                if (
                  urlOrientation &&
                  (urlOrientation === "vertical" ||
                   urlOrientation === "horizontal" ||
                   urlOrientation === "square")
                ) {
                  titleImageOrientation = urlOrientation as ImageOrientation;
              orientationSource = `URL parameter in ${key}`;
                  console.log(`Found orientation in image URL for ${key}: ${urlOrientation}`);
              break;
                }
              } catch (e) {
                // Ignore URL parsing errors
              }
            }
          }
        }

        console.log(`Final orientation (from ${orientationSource}): ${titleImageOrientation}`);
        console.log(`Using slide index: ${titlePageSlideMapping[titleImageOrientation]}`);

        // Select the appropriate title page slide
        const titlePageIndex = titlePageSlideMapping[titleImageOrientation];

        // Keep the selected title page slide, remove the other one
        Object.entries(titlePageSlideMapping).forEach(
          ([orientationKey, index]) => {
            const orientation = orientationKey as ImageOrientation;
            // Skip the same index we want to keep
            if (index !== titlePageIndex) {
              const slideId = presentation.data.slides![index].objectId;
              if (slideId && !slidesToDelete.has(slideId)) {
                console.log(
                  `Adding alternate title page slide (${orientation}) to delete list:`,
                  slideId
                );
                slidesToDelete.add(slideId);
              }
            } else {
              console.log(
                `Keeping title page slide for ${orientation} orientation (index ${index})`
              );
            }
          }
        );
      } else if (presentation.data.slides) {
        // If project overview is not selected, remove both title page slides
        Object.values(titlePageSlideMapping).forEach((index) => {
          if (index < presentation.data.slides!.length) {
            const slideId = presentation.data.slides![index].objectId;
            if (slideId && !slidesToDelete.has(slideId)) {
              slidesToDelete.add(slideId);
              console.log(
                `Deleting title page at index ${index} (not selected)`,
              );
            }
          }
        });
      }

      // Process each remaining page in our mapping to see if it should be removed
      if (presentation.data.slides) {
        Object.entries(pageToSlideMapping).forEach(([pageId, slideIndices]) => {
          // Skip the projectOverview page and image pages since we've already handled them
          if (
            pageId === "projectOverview" ||
            pageId === "exteriorPhotos" ||
            pageId === "interiorPhotos"
          ) {
            return;
          }

          const isPageSelected = selectedPages[pageId] === true;
          console.log(
            `Page "${pageId}" - Selected: ${isPageSelected}, Mapped to slides:`,
            slideIndices,
          );

          // If this page is NOT selected, queue its slides for deletion
          if (!isPageSelected) {
            slideIndices.forEach((slideIndex) => {
              // Verify the slide index is valid
              if (
                slideIndex >= 0 &&
                slideIndex < presentation.data.slides!.length
              ) {
                const slideId = presentation.data.slides![slideIndex].objectId;
                if (slideId && !slidesToDelete.has(slideId)) {
                  slidesToDelete.add(slideId);
                  console.log(
                    `WILL DELETE: Slide #${slideIndex + 1} (index ${slideIndex}) for unchecked page "${pageId}" - ID: ${slideId}`,
                  );
                }
              } else {
                console.log(
                  `WARNING: Invalid slide index ${slideIndex} for page "${pageId}"`,
                );
              }
            });
          }
        });
      }

      // Convert the Set to an array for the delete requests
      const slideIdsToDelete = Array.from(slidesToDelete);
      console.log("Final slides to delete:", slideIdsToDelete);

      // Add delete requests for each slide to be removed
      slideIdsToDelete.forEach((slideId) => {
        requests.push({
          deleteObject: {
            objectId: slideId,
          },
        });
      });

      console.log(
        `Added ${slideIdsToDelete.length} slide deletion requests for slides:`,
        slideIdsToDelete,
      );
    }

    console.log(`Created ${requests.length} update requests`);

    // Inspect the presentation content (Update the placeholder to check if needed)
    console.log(
      "Inspecting presentation for text elements containing '{descriptionextralarge}'",
    );
    let foundTextPlaceholders: { slideIndex: number; text: string }[] = [];
    presentation.data.slides?.forEach((slide, slideIndex) => {
      slide.pageElements?.forEach((element) => {
        if (element.shape?.text) {
          const textContent = element.shape.text.textElements
            ?.map((textElement) => textElement.textRun?.content || "")
            .join("");
          if (textContent && textContent.includes("{descriptionextralarge}")) {
            console.log(
              `Found '{descriptionextralarge}' on slide ${slideIndex + 1}: "${textContent.substring(0, 100)}..."`,
            );
            foundTextPlaceholders.push({
              slideIndex,
              text: textContent.substring(0, 100),
            });
          }
        }
      });
    });
    console.log(
      `Found ${foundTextPlaceholders.length} instances of '{descriptionextralarge}'`,
    );
    console.log("Placeholder text found:", foundTextPlaceholders);

    if (requests.length > 0) {
      console.log(`Sending batch update with ${requests.length} replacements`);

      try {
        const updateResponse = await slides.presentations.batchUpdate({
          presentationId: newPresentationId,
          requestBody: {
            requests: requests,
          },
        });

        console.log("Batch update response:", updateResponse.data);

        // Check if there are any replies to examine
        console.log("Checking batch update results...");
        if (updateResponse.data.replies) {
          // Use type assertion to safely iterate through responses
          updateResponse.data.replies.forEach((reply: any, index) => {
            // Log success/failure in a type-safe way
            if (reply && "error" in reply) {
              console.error(`Request ${index} failed:`, reply.error);
            } else {
              console.log(`Request ${index} appears successful`);
            }
          });
        }
      } catch (error) {
        console.error("Error during batch update:", error);
        // Continue execution even if batch update fails
      }
    }

    console.log("Presentation processed successfully");

    // Build URLs with explicit language parameters - make language the primary parameter
    const userLang = userLanguage === "de" ? "de" : "en";

    // For German, create a URL that forces German interface
    let editUrl = "";
    if (userLang === "de") {
      // For German, use these specific parameters that are known to force German UI
      editUrl = `https://docs.google.com/presentation/d/${newPresentationId}/edit?hl=de&usp=sharing&ui=2&authuser=0`;
    } else {
      // For English, use standard parameters
      editUrl = `https://docs.google.com/presentation/d/${newPresentationId}/edit?hl=en&usp=sharing`;
    }

    const viewUrl = `https://docs.google.com/presentation/d/${newPresentationId}/view?hl=${userLang}`;

    // Collect all image URLs to save to the database
    const presentationImages: Record<string, string> = {};
    
    // Save all image URLs from the images object
    if (images && typeof images === 'object') {
      Object.entries(images).forEach(([key, url]) => {
        if (typeof url === 'string' && url.trim() !== '') {
          // Store with the exact key format used in the template
          presentationImages[key] = url;
        }
      });
    }
    
    // Also save the original uploaded images from placeholders
    if (placeholders) {
      // Save Floor Plan (image7) and Energy Certificate (image8) explicitly
      if (placeholders['{{image7}}'] && typeof placeholders['{{image7}}'] === 'string') {
        presentationImages['{{image7}}'] = placeholders['{{image7}}'];
      }
      
      if (placeholders['{{image8}}'] && typeof placeholders['{{image8}}'] === 'string') {
        presentationImages['{{image8}}'] = placeholders['{{image8}}'];
      }
      
      // Save exterior and interior images
      if (Array.isArray(placeholders.exteriorImages)) {
        placeholders.exteriorImages.forEach((url: string, index: number) => {
          if (typeof url === 'string' && url.trim() !== '') {
            presentationImages[`exteriorImage${index + 1}`] = url;
          }
        });
      }
      
      if (Array.isArray(placeholders.interiorImages)) {
        placeholders.interiorImages.forEach((url: string, index: number) => {
          if (typeof url === 'string' && url.trim() !== '') {
            presentationImages[`interiorImage${index + 1}`] = url;
          }
        });
      }
    }
    
    console.log("Saving presentation images to database:", Object.keys(presentationImages).length, "images");
    
    return NextResponse.json({
      documentId: newPresentationId,
      viewUrl: viewUrl,
      editUrl: editUrl,
      language: userLanguage,
      presentation_images: presentationImages, // Add the images to the response
    });
  } catch (error: any) {
    console.error("Error processing presentation:", error);

    // Ensure we return a proper JSON response even for unexpected errors
    return NextResponse.json(
      {
        message: error.message || "Failed to process presentation",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
        details: error.response?.data || error.details || undefined,
      },
      { status: 500 },
    );
  }
}
