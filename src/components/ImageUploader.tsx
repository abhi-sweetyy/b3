"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { createBrowserClient } from "@supabase/ssr";
import Konva from "konva";
import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { toast } from "react-hot-toast";
interface ImageUploaderProps {
  // Props for project page
  images?: string[];
  onUpload?: (urls: string[]) => void;
  onRemove?: (index: number) => void;
  skipEditing?: boolean;

  // Props for ImagesStep
  existingImages?: string[];
  onImagesUploaded?: (urls: string[]) => void;

  // Common props
  uploading?: boolean;
  limit?: number;

  // Custom upload text
  customUploadText?: string;

  // Event handler to stop form propagation
  onClick?: (e: React.MouseEvent) => void;
}
// Add new interfaces for our editor
interface EditorState {
  brightness: number;
  contrast: number;
  blur: number;
  isDrawingBlur: boolean;
  blurBrushSize: number;
  blurBrushStrength: number;
  blurRectangles: Array<{
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    blur: number;
  }>;
}

export default function ImageUploader({
  images = [],
  existingImages = [],
  onUpload,
  onRemove,
  onImagesUploaded,
  uploading = false,
  limit = 10,
  customUploadText,
  onClick,
  skipEditing = false, // Add default value
}: ImageUploaderProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropAreaRef = useRef<HTMLDivElement>(null);
  const [replaceIndex, setReplaceIndex] = useState<number | null>(null);
  const [isUploading, setIsUploading] = useState(uploading);
  const [isDragging, setIsDragging] = useState(false);
  const [supabase] = useState(() =>
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    ),
  );
  const [session, setSession] = useState<Session | null>(null);

  // Use either images or existingImages based on which is provided
  // Make a deep copy to ensure we don't lose references
  const displayImages = images.length > 0 ? [...images] : [...existingImages];
  console.log("ImageUploader initialized with", displayImages.length, "images");

  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [tempFileToEdit, setTempFileToEdit] = useState<File | null>(null);
  const [editorState, setEditorState] = useState<EditorState>({
    brightness: 0,
    contrast: 0,
    blur: 0,
    isDrawingBlur: false,
    blurBrushSize: 20,
    blurBrushStrength: 5,
    blurRectangles: [],
  });

  // Remove all blur-related state variables
  const canvasRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage | null>(null);
  const imageLayerRef = useRef<Konva.Layer | null>(null);
  const konvaImageRef = useRef<Konva.Image | null>(null);

  // Add a layer reference for blur shapes
  const blurLayerRef = useRef<Konva.Layer | null>(null);

  // Add animation state for enhance effect
  const [showEnhanceAnimation, setShowEnhanceAnimation] = useState(false);

  // Add state for tracking save in progress
  const [isSaving, setIsSaving] = useState(false);

  // Detect mobile devices
  const [isMobile, setIsMobile] = useState(false);

  // Check if device is mobile on mount and window resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    // Check immediately
    checkMobile();

    // Add resize listener
    window.addEventListener("resize", checkMobile);

    // Cleanup
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch session
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
      },
    );

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      if (!session) {
        // Set initial session only if not already set by listener
        setSession(initialSession);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  // Function to delete an image from Supabase storage
  const deleteImageFromStorage = async (url: string): Promise<boolean> => {
    try {
      console.log("🔥 Attempting to delete image at URL:", url);

      // Extract just the filename from the URL
      const urlParts = url.split("/");
      const filenameWithParams = urlParts[urlParts.length - 1];
      const filename = filenameWithParams.split("?")[0]; // Remove any query parameters

      console.log("📝 Extracted filename:", filename);

      // Check if the URL contains a templateID folder
      let templateId = null;
      const templateMatch = url.match(/\/([^\/]+?)\/[^\/]+$/);
      if (templateMatch && templateMatch[1] && templateMatch[1] !== "uploads") {
        templateId = templateMatch[1];
        console.log("📂 Detected templateId folder:", templateId);
      }

      // Determine which folders to check based on the URL
      const foldersToCheck = [];

      // Add templateId folder if found
      if (templateId) {
        foldersToCheck.push(templateId);
      }

      // Always check uploads folder too
      foldersToCheck.push("uploads");

      // For root-level files
      foldersToCheck.push("");

      console.log("📂 Will check these folders:", foldersToCheck);

      // Try each folder
      for (const folder of foldersToCheck) {
        // Get the list of files in the folder
        const folderPath = folder ? folder : "";
        console.log(`📂 Listing files in folder: ${folderPath || "root"}`);

        const { data: folderFiles, error: listError } = await supabase.storage
          .from("docx")
          .list(folderPath);

        if (listError) {
          console.error(
            `❌ Error listing files in folder ${folderPath}:`,
            listError,
          );
          continue;
        }

        if (!folderFiles || folderFiles.length === 0) {
          console.log(`📂 No files found in folder: ${folderPath || "root"}`);
          continue;
        }

        console.log(
          `📋 Files in folder ${folderPath || "root"}:`,
          folderFiles.map((f) => f.name),
        );

        // Look for files that match our filename
        const matchingFiles = folderFiles.filter((file) => {
          // Direct name match
          if (file.name === filename) return true;

          // URL contains the filename
          if (url.includes(file.name)) return true;

          // For very long filenames, check if the first part matches
          if (
            filename.length > 20 &&
            file.name.startsWith(filename.substring(0, 20))
          )
            return true;

          return false;
        });

        console.log(
          `🎯 Matching files in ${folderPath || "root"}:`,
          matchingFiles.map((f) => f.name),
        );

        // Try to delete each matching file
        for (const file of matchingFiles) {
          const filePath = folder ? `${folder}/${file.name}` : file.name;
          console.log(`⚡ Attempting to delete file: ${filePath}`);

          const { data, error } = await supabase.storage
            .from("docx")
            .remove([filePath]);

          console.log("Deletion response:", { data, error });

          if (!error) {
            console.log(`✅ Successfully deleted file: ${filePath}`);
            return true;
          } else {
            console.error(`❌ Failed to delete file ${filePath}:`, error);
          }
        }

        // If no direct matches, try a more aggressive approach with the current folder
        if (matchingFiles.length === 0) {
          console.log(
            `🔍 No exact matches found in ${folderPath || "root"}, trying to get public URLs`,
          );

          // Get public URLs for all files and compare with our target URL
          for (const file of folderFiles) {
            const filePath = folder ? `${folder}/${file.name}` : file.name;

            const { data: urlData } = supabase.storage
              .from("docx")
              .getPublicUrl(filePath);

            const fileUrl = urlData.publicUrl;

            // Debug log comparing URLs
            console.log(`Is�� Comparing:\nFile: ${fileUrl}\nTarget: ${url}`);

            // Check if URLs are similar
            if (
              fileUrl === url ||
              url.includes(file.name) ||
              fileUrl.includes(filename)
            ) {
              console.log(`🎯 Found matching URL for file: ${filePath}`);

              // Try to delete this file
              const { data, error } = await supabase.storage
                .from("docx")
                .remove([filePath]);

              if (!error) {
                console.log(`✅ Successfully deleted file: ${filePath}`);
                return true;
              } else {
                console.error(`❌ Failed to delete file ${filePath}:`, error);
              }
            }
          }
        }
      }

      console.log("❌ Could not find or delete the file in any folder");
      return false;
    } catch (error) {
      console.error("💥 Error in deleteImageFromStorage:", error);
      return false;
    }
  };

  // New function to check image orientation
  const checkImageOrientation = (file: File) => {
    // Create an object URL for the file
    const objectUrl = URL.createObjectURL(file);

    // Create an image element to check dimensions
    const img = new Image();
    img.onload = () => {
      // Determine orientation
      let orientation = "horizontal";
      if (img.height > img.width) {
        orientation = "vertical";
      }

      console.log(
        `Detected image orientation: ${orientation} (${img.width}x${img.height})`,
      );

      // Revoke the object URL to avoid memory leaks
      URL.revokeObjectURL(objectUrl);

      // Store orientation in a custom property on the file object for later use
      (file as any).detectedOrientation = orientation;

      // Continue with the file selection/upload process
      handleFileSelect(file);
    };

    // Set the source to trigger the load event
    img.src = objectUrl;
  };

  // Improved upload function that stores files in the correct folder
  const uploadFile = async (
    file: File,
    oldUrl?: string,
    isEdited: boolean = false,
  ): Promise<string> => {
    console.log("📤 Uploading file to Supabase:", file.name);

    // Check for session before proceeding
    if (!session?.user?.id) {
      console.error("❌ User not authenticated for upload.");
      throw new Error("User not authenticated");
    }

    // Create a truly unique filename
    const fileExt = file.name.split(".").pop();
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileName = `${timestamp}_${randomString}.${fileExt}`;

    // Use user ID in the path
    const userId = session.user.id;
    const filePath = `${userId}/${fileName}`;

    console.log(`📝 Determined file path: ${filePath}`);

    try {
      // Upload the new file
      const { error: uploadError } = await supabase.storage
        .from("docx")
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        console.error("❌ Upload error:", uploadError);
        throw uploadError;
      }

      console.log("✅ Upload successful");

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("docx")
        .getPublicUrl(filePath);

      let newUrl = urlData.publicUrl;

      // Check if the file has orientation data and append it to the URL
      if ((file as any).detectedOrientation) {
        const orientation = (file as any).detectedOrientation;
        const urlObj = new URL(newUrl);
        urlObj.searchParams.set("orientation", orientation);
        newUrl = urlObj.toString();
        console.log(`Added orientation parameter to URL: ${orientation}`);
      }

      console.log("🔗 New public URL:", newUrl);

      // Delete the old file if provided
      if (oldUrl) {
        console.log("🗑️ Now attempting to delete old file:", oldUrl);
        const deleteResult = await deleteImageFromStorage(oldUrl);
        console.log(
          `${deleteResult ? "✅" : "❌"} Old file deletion result:`,
          deleteResult,
        );
      }

      return newUrl;
    } catch (error) {
      console.error("💥 Error in uploadFile:", error);
      throw error;
    }
  };

  // Modified to open the editor first when a file is selected
  const handleFileSelect = async (file: File) => {
    try {
      setIsUploading(true);

      // Create an image URL from the file for editing
      const imageURL = URL.createObjectURL(file);
      setTempFileToEdit(file);
      setEditingImage(imageURL);
      setEditingIndex(-1); // Use -1 to indicate this is a new image
    } catch (error) {
      console.error("💥 Error handling file:", error);
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Modified saveEditedImage to handle URL returns
  const saveEditedImage = async () => {
    if (!editingImage || !konvaImageRef.current) return;

    // Set saving state to true
    setIsSaving(true);

    try {
      // Get the updated image as a file
      const imageFile = applyFiltersAndGetFile();

      if (!imageFile) {
        console.error("Failed to get edited image file");
        setIsSaving(false);
        return;
      }

      // Preserve orientation if available on the original file
      if (tempFileToEdit && (tempFileToEdit as any).detectedOrientation) {
        (imageFile as any).detectedOrientation = (
          tempFileToEdit as any
        ).detectedOrientation;
      }

      // Upload the file and get URL
      const result = await uploadFile(imageFile);

      if (result) {
        if (editingIndex !== null && editingIndex >= 0) {
          // If editing an existing image
          const oldUrl = displayImages[editingIndex];

          // Create a new array with the updated image URL
          const newImages = [...displayImages];
          newImages[editingIndex] = result;

          // Notify parent component
          if (onImagesUploaded) {
            onImagesUploaded(newImages);
          }

          // Try to delete the old file
          if (oldUrl) {
            await deleteImageFromStorage(oldUrl);
          }
        } else {
          // If this is a new image
          if (onImagesUploaded) {
            onImagesUploaded([...displayImages, result]);
          } else if (onUpload) {
            onUpload([result]);
          }
        }

        // Clear editing state
        setTempFileToEdit(null);
        setEditingImage(null);
        setEditingIndex(null);
      }
    } catch (error) {
      console.error("Error saving edited image:", error);
    } finally {
      // Reset saving state
      setIsSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Handle multiple files
    const fileArray = Array.from(files);
    const totalFiles = existingImages.length + fileArray.length;

    // Check if we'd exceed the limit
    if (limit && totalFiles > limit) {
      toast.error(`You can only upload up to ${limit} images`);
      return;
    }

    if (skipEditing) {
      // Skip the editor completely and upload all files directly
      const toastId = toast.loading(t("imageUploader.uploadingMultiple"));
      setIsUploading(true);
      
      // Store the current display images to ensure they're preserved
      const currentImages = [...displayImages];
      console.log("Current images before upload:", currentImages.length);

      // Process all files at once using Promise.all
      Promise.all(
        fileArray.map(async (file) => {
          try {
            // Detect orientation
            const orientation = await new Promise<string>((resolve) => {
              const img = new Image();
              const objectUrl = URL.createObjectURL(file);

              img.onload = () => {
                // Determine orientation
                let orientation = "horizontal";
                if (img.height > img.width) {
                  orientation = "vertical";
                }
                console.log(
                  `Detected image orientation: ${orientation} (${img.width}x${img.height})`,
                );
                URL.revokeObjectURL(objectUrl);
                resolve(orientation);
              };

              img.src = objectUrl;
            });

            // Set orientation on file
            (file as any).detectedOrientation = orientation;

            // Upload file directly
            return await uploadFile(file);
          } catch (error) {
            console.error("Error uploading file:", error);
            return null;
          }
        }),
      )
        .then((urls) => {
          // Filter out any failed uploads
          const validUrls = urls.filter((url) => url !== null) as string[];
          console.log("Successfully uploaded images:", validUrls.length);

          if (validUrls.length > 0) {
            // Create a completely new array with all images (existing + new)
            const allImages = [...currentImages, ...validUrls];
            console.log("Total images after upload:", allImages.length);
            
            // Notify parent of all the new URLs
            if (onImagesUploaded) {
              console.log("Calling onImagesUploaded with all images");
              onImagesUploaded(allImages);
            } else if (onUpload) {
              console.log("Calling onUpload with new images");
              onUpload(validUrls);
            }

            toast.success(t("imageUploader.multipleUploadsComplete"), {
              id: toastId,
            });
          } else {
            toast.error(t("imageUploader.uploadFailed"), { id: toastId });
          }

          setIsUploading(false);

          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        })
        .catch((error) => {
          console.error("Error in bulk upload:", error);
          toast.error(t("imageUploader.uploadFailed"));
          setIsUploading(false);

          // Reset the file input
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        });
    } else {
      // Process one file at a time with editing - existing behavior
      fileArray.forEach((file) => {
        handleImageUpload(file);
      });
    }
  };

  // Add this new function to handle multiple file uploads directly
  const uploadMultipleFiles = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];

    // Show a single toast for the batch upload
    const toastId = toast.loading(t("imageUploader.uploadingMultiple"));

    try {
      // Process files in parallel with Promise.all
      const uploadPromises = files.map(async (file) => {
        try {
          // Check orientation first
          const img = new Image();
          const objectUrl = URL.createObjectURL(file);

          const orientation = await new Promise<string>((resolve) => {
            img.onload = () => {
              // Determine orientation
              let orientation = "horizontal";
              if (img.height > img.width) {
                orientation = "vertical";
              }
              console.log(
                `Detected image orientation: ${orientation} (${img.width}x${img.height})`,
              );
              URL.revokeObjectURL(objectUrl);
              resolve(orientation);
            };
            img.src = objectUrl;
          });

          // Set orientation on file
          (file as any).detectedOrientation = orientation;

          // Upload the file
          const url = await uploadFile(file);
          return url;
        } catch (error) {
          console.error("Error uploading file:", error);
          return null;
        }
      });

      // Wait for all uploads to complete
      const results = await Promise.all(uploadPromises);

      // Filter out any failed uploads
      urls.push(...(results.filter((url) => url !== null) as string[]));

      toast.success(t("imageUploader.multipleUploadsComplete"), {
        id: toastId,
      });
      return urls;
    } catch (error) {
      toast.error(t("imageUploader.uploadFailed"), { id: toastId });
      return urls; // Return any successful uploads
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      // Check if orientation can be detected
      checkImageOrientation(file);
    } catch (error) {
      console.error("Error handling file upload:", error);
      toast.error(t("imageUploader.uploadFailed"));

      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAreaClick = (e: React.MouseEvent) => {
    // Only prevent default at the current level, but allow click to continue
    // for file input clicks
    e.stopPropagation();

    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      checkImageOrientation(files[0]);
    }
  };

  const handleReplaceClick = (index: number, e: React.MouseEvent) => {
    // Prevent the event from bubbling up to parent elements (especially form)
    // but don't prevent default actions on the button itself
    e.stopPropagation();

    setReplaceIndex(index);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Function to dataURL to File
  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  // Function to apply filters and get the result as a file
  const applyFiltersAndGetFile = () => {
    if (!stageRef.current) return null;

    try {
      // Apply brightness and contrast manually
      const stage = stageRef.current;

      // Get the dataURL of the canvas
      const dataURL = stage.toDataURL({
        mimeType: "image/png",
        quality: 1,
        pixelRatio: 1,
      });

      // Convert the dataURL to a File object
      const file = dataURLtoFile(dataURL, `edited_image_${Date.now()}.png`);

      return file;
    } catch (error) {
      console.error("Error applying filters and getting file:", error);
      alert(
        "There was an error processing the image. Please try again with a different image.",
      );
      return null;
    }
  };

  // Function to enhance the image (increase brightness and contrast by 10%)
  const enhanceImage = () => {
    if (!konvaImageRef.current) return;

    // Show animation effect
    setShowEnhanceAnimation(true);

    // Store the current image state
    const currentBrightness = editorState.brightness;
    const currentContrast = editorState.contrast;

    // Calculate new values (for later application)
    const newBrightness = Math.min(currentBrightness + 10, 100);
    const newContrast = Math.min(currentContrast + 10, 100);

    // Keep the original image visible during animation
    // Apply changes after animation completes (2 seconds)
    setTimeout(() => {
      if (!konvaImageRef.current) {
        setShowEnhanceAnimation(false);
        return;
      }

      // First update the state
      setEditorState((prevState) => ({
        ...prevState,
        brightness: newBrightness,
        contrast: newContrast,
      }));

      // Then update the image with the new values
      konvaImageRef.current.brightness(newBrightness / 100);
      konvaImageRef.current.contrast(1 + newContrast / 25);
      konvaImageRef.current.getLayer()?.batchDraw();

      // Hide animation after changes are complete
      setShowEnhanceAnimation(false);
    }, 2000); // Show animation for 2 seconds
  };

  // Initialize the Konva stage and image
  useEffect(() => {
    if (editingImage && canvasRef.current) {
      try {
        // Clean up any existing stage
        if (stageRef.current) {
          stageRef.current.destroy();
          stageRef.current = null;
        }

        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = editingImage;

        img.onload = () => {
          // Get the container dimensions first to ensure stability
          const container = canvasRef.current;
          if (!container) return;

          // Fix the container dimensions explicitly before creating the stage
          // Use getBoundingClientRect to get accurate container size
          const containerRect = container.getBoundingClientRect();
          const containerWidth = containerRect.width;
          const containerHeight = containerRect.height;

          // Lock container dimensions
          container.style.width = `${containerWidth}px`;
          container.style.height = `${containerHeight}px`;
          container.style.position = "relative";
          container.style.touchAction = "none";
          container.style.backgroundColor = "transparent"; // Set transparent background

          // Calculate image dimensions while maintaining aspect ratio
          const imgAspectRatio = img.width / img.height;
          const containerAspectRatio = containerWidth / containerHeight;

          let imageWidth: number, imageHeight: number;
          let offsetX = 0,
            offsetY = 0;

          // Determine if we need to fit by width or height
          if (imgAspectRatio > containerAspectRatio) {
            // Fit by width
            imageWidth = containerWidth * 0.95; // 95% of container width to add some padding
            imageHeight = imageWidth / imgAspectRatio;
            offsetY = (containerHeight - imageHeight) / 2;
          } else {
            // Fit by height
            imageHeight = containerHeight * 0.95; // 95% of container height to add some padding
            imageWidth = imageHeight * imgAspectRatio;
            offsetX = (containerWidth - imageWidth) / 2;
          }

          // Create new stage with fixed container dimensions
          const stage = new Konva.Stage({
            container: container,
            width: containerWidth,
            height: containerHeight,
          });

          // Set a background color for the stage that matches the editor
          stage.container().style.backgroundColor = "transparent";

          // Fix to prevent scaling/shifting
          stage.scale({ x: 1, y: 1 });
          stage.offset({ x: 0, y: 0 });
          stage.position({ x: 0, y: 0 });

          stageRef.current = stage;

          // Create layers
          const imageLayer = new Konva.Layer();
          const blurLayer = new Konva.Layer();
          const effectsLayer = new Konva.Layer(); // Layer for animations

          imageLayerRef.current = imageLayer;
          blurLayerRef.current = blurLayer;

          stage.add(imageLayer);
          stage.add(blurLayer);
          stage.add(effectsLayer);

          // Create and add the image - center it in the stage
          const konvaImage = new Konva.Image({
            x: offsetX,
            y: offsetY,
            image: img,
            width: imageWidth,
            height: imageHeight,
            listening: false, // Disable mouse events on the image to prevent shifting
          });

          konvaImageRef.current = konvaImage;

          // Add image to layer
          konvaImage.cache(); // Cache image for better performance
          konvaImage.filters([
            Konva.Filters.Brighten,
            Konva.Filters.Contrast,
            Konva.Filters.Blur,
          ]);
          konvaImage.brightness(editorState.brightness / 100);
          konvaImage.contrast(1 + editorState.contrast / 25);
          konvaImage.blurRadius(editorState.blur);

          imageLayer.add(konvaImage);
          imageLayer.batchDraw();

          // Disable stage dragging to prevent jumps
          stage.draggable(false);

          // Store the original stage dimensions to maintain stability
          const originalWidth = stage.width();
          const originalHeight = stage.height();

          // Draw existing blur rectangles
          editorState.blurRectangles.forEach((rect) => {
            const { id, x, y, width, height, blur } = rect;

            // Create a rectangle for the blur region
            const blurRect = new Konva.Rect({
              x: offsetX + x * imageWidth,
              y: offsetY + y * imageHeight,
              width: width * imageWidth,
              height: height * imageHeight,
              stroke: "transparent",
              strokeWidth: 0,
              name: "blurRect",
              id: id,
            });

            // Create the blurred image inside the rectangle boundaries
            const clipGroup = new Konva.Group({
              clip: {
                x: offsetX + x * imageWidth,
                y: offsetY + y * imageHeight,
                width: width * imageWidth,
                height: height * imageHeight,
              },
            });

            // Clone the image for blurring
            const blurredImage = new Konva.Image({
              x: offsetX,
              y: offsetY,
              image: img,
              width: imageWidth,
              height: imageHeight,
              name: "blurredImage",
            });

            // Apply blur to the cloned image
            blurredImage.cache();
            blurredImage.filters([Konva.Filters.Blur]);
            blurredImage.blurRadius(blur);

            // Add to layers
            clipGroup.add(blurredImage);
            blurLayer.add(clipGroup);
            blurLayer.add(blurRect);
            blurLayer.batchDraw();

            // Enable drag and resize for rect
            blurRect.draggable(true);

            // Handle drag
            blurRect.on("dragmove", () => {
              // Update clip region to follow the rectangle
              clipGroup.clip({
                x: blurRect.x(),
                y: blurRect.y(),
                width: blurRect.width(),
                height: blurRect.height(),
              });

              // Update state with normalized coordinates (0-1 range)
              setEditorState({
                ...editorState,
                blurRectangles: editorState.blurRectangles.map((r) => {
                  if (r.id === id) {
                    return {
                      ...r,
                      x: (blurRect.x() - offsetX) / imageWidth,
                      y: (blurRect.y() - offsetY) / imageHeight,
                    };
                  }
                  return r;
                }),
              });

              blurLayer.batchDraw();
            });

            // Add double-click listener to remove rectangle
            blurRect.on("dblclick dbltap", () => {
              // Remove from state
              setEditorState({
                ...editorState,
                blurRectangles: editorState.blurRectangles.filter(
                  (r) => r.id !== id,
                ),
              });

              // Remove from layer
              blurRect.destroy();
              clipGroup.destroy();
              blurLayer.batchDraw();
            });
          });

          // Variables for drawing blur regions
          let isDrawing = false;
          let startX = 0;
          let startY = 0;
          let selectionRect: Konva.Rect | null = null;

          // Handle mouse down
          stage.on("mousedown touchstart", (e) => {
            if (!editorState.isDrawingBlur) return;

            // Prevent default to stop unwanted behaviors
            e.evt.preventDefault();
            e.evt.stopPropagation();

            // Fix stage dimensions at the start of drawing
            stage.width(originalWidth);
            stage.height(originalHeight);
            container.style.width = `${originalWidth}px`;
            container.style.height = `${originalHeight}px`;

            // Start drawing
            isDrawing = true;

            // Get position relative to the stage
            const pos = stage.getPointerPosition();
            if (!pos) return;

            startX = pos.x;
            startY = pos.y;

            // Create a new selection rectangle
            selectionRect = new Konva.Rect({
              x: startX,
              y: startY,
              width: 0,
              height: 0,
              fill: "rgba(0, 0, 0, 0.1)",
              stroke: "rgba(255, 255, 255, 0.3)",
              strokeWidth: 1,
              dash: [4, 4],
            });

            blurLayer.add(selectionRect);
            blurLayer.batchDraw();
          });

          // Handle mouse move
          stage.on("mousemove touchmove", (e) => {
            if (!isDrawing || !selectionRect || !editorState.isDrawingBlur)
              return;

            // Prevent default behaviors
            e.evt.preventDefault();
            e.evt.stopPropagation();

            // Get current pointer position
            const pos = stage.getPointerPosition();
            if (!pos) return;

            // Calculate new width and height
            const rectWidth = pos.x - startX;
            const rectHeight = pos.y - startY;

            // Update the selection rectangle
            selectionRect.width(rectWidth);
            selectionRect.height(rectHeight);
            blurLayer.batchDraw();
          });

          // Handle mouse up
          stage.on("mouseup touchend", (e) => {
            if (!isDrawing || !selectionRect || !editorState.isDrawingBlur) {
              isDrawing = false;
              return;
            }

            // Prevent default behavior
            e.evt.preventDefault();
            e.evt.stopPropagation();

            // Finalize the selection
            isDrawing = false;

            // Get the final rectangle dimensions
            let rect = {
              x: selectionRect.x(),
              y: selectionRect.y(),
              width: selectionRect.width(),
              height: selectionRect.height(),
            };

            // Normalize negative width/height
            if (rect.width < 0) {
              rect.x += rect.width;
              rect.width = Math.abs(rect.width);
            }

            if (rect.height < 0) {
              rect.y += rect.height;
              rect.height = Math.abs(rect.height);
            }

            // Only create rectangles with meaningful dimensions
            if (rect.width > 5 && rect.height > 5) {
              // Remove selection rectangle
              selectionRect.destroy();

              // Create a unique ID
              const rectId = `rect-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

              // Store in normalized coordinates (0-1 range)
              const normalizedRect = {
                id: rectId,
                x: (rect.x - offsetX) / imageWidth,
                y: (rect.y - offsetY) / imageHeight,
                width: rect.width / imageWidth,
                height: rect.height / imageHeight,
                blur: editorState.blurBrushStrength,
              };

              // Update state with the new rectangle
              setEditorState({
                ...editorState,
                blurRectangles: [...editorState.blurRectangles, normalizedRect],
              });

              // Create a rectangle for the blur region
              const blurRect = new Konva.Rect({
                x: rect.x,
                y: rect.y,
                width: rect.width,
                height: rect.height,
                stroke: "transparent",
                strokeWidth: 0,
                name: "blurRect",
                id: rectId,
                draggable: true,
              });

              // Create the blur effect using a clipping group
              const clipGroup = new Konva.Group({
                clip: {
                  x: rect.x,
                  y: rect.y,
                  width: rect.width,
                  height: rect.height,
                },
              });

              // Clone the original image for blurring
              const blurredImage = new Konva.Image({
                x: offsetX,
                y: offsetY,
                image: img,
                width: imageWidth,
                height: imageHeight,
                name: "blurredImage",
              });

              // Apply blur filter
              blurredImage.cache();
              blurredImage.filters([Konva.Filters.Blur]);
              blurredImage.blurRadius(editorState.blurBrushStrength);

              // Add to layers
              clipGroup.add(blurredImage);
              blurLayer.add(clipGroup);
              blurLayer.add(blurRect);
              blurLayer.batchDraw();

              // Update clip on drag
              blurRect.on("dragmove", () => {
                // Update clip region to follow the rectangle
                clipGroup.clip({
                  x: blurRect.x(),
                  y: blurRect.y(),
                  width: blurRect.width(),
                  height: blurRect.height(),
                });

                // Update state with new position
                setEditorState({
                  ...editorState,
                  blurRectangles: editorState.blurRectangles.map((r) => {
                    if (r.id === rectId) {
                      return {
                        ...r,
                        x: (blurRect.x() - offsetX) / imageWidth,
                        y: (blurRect.y() - offsetY) / imageHeight,
                      };
                    }
                    return r;
                  }),
                });

                blurLayer.batchDraw();
              });

              // Add double-click listener to remove rectangle
              blurRect.on("dblclick dbltap", () => {
                // Remove from state
                setEditorState({
                  ...editorState,
                  blurRectangles: editorState.blurRectangles.filter(
                    (r) => r.id !== rectId,
                  ),
                });

                // Remove from layer
                blurRect.destroy();
                clipGroup.destroy();
                blurLayer.batchDraw();
              });
            } else {
              // If it's too small, just remove it
              selectionRect.destroy();
            }

            blurLayer.batchDraw();
            selectionRect = null;
          });
        };
      } catch (error) {
        console.error("Error initializing stage:", error);
      }
    }
  }, [
    editingImage,
    editorState.brightness,
    editorState.contrast,
    editorState.blur,
    editorState.isDrawingBlur,
    editorState.blurBrushStrength,
    editorState.blurRectangles,
  ]);

  // Update the ImageEditorModal component to handle both new uploads and edits
  const ImageEditorModal = () => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
        <div
          className="editor-modal relative bg-[#171e2e] rounded-lg overflow-hidden"
          style={{
            width: "90vw",
            height: "90vh",
            maxWidth: "1200px",
            maxHeight: "800px",
          }}
        >
          {/* Close button */}
          <button
            className="absolute top-2 right-2 z-10 bg-[#1d2436] hover:bg-[#252c43] rounded-full p-1 text-white transition-colors"
            onClick={() => {
              setEditingImage(null);
              setEditingIndex(null);
              setTempFileToEdit(null);
              setEditorState({
                brightness: 0,
                contrast: 0,
                blur: 0,
                isDrawingBlur: false,
                blurBrushSize: 20,
                blurBrushStrength: 5,
                blurRectangles: [],
              });

              // Reset the file input
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
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

          {/* Editor title und Speichern-Button */}
          <div className="text-white font-semibold p-4 border-b border-gray-800 bg-[#171e2e] relative">
            {/* Titel auf der linken Seite */}
            <div>{t("imageUploader.editBeforeUpload")}</div>

            {/* Absolut positionierter Button im rot markierten Bereich */}
            <div
              className="absolute"
              style={{
                top: "50%",
                right: "5rem",
                transform: "translateY(-50%)",
              }}
            >
              <button
                type="button"
                onClick={saveEditedImage}
                disabled={isSaving}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 rounded transition-colors disabled:opacity-70 flex items-center text-sm"
              >
                {isSaving ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin mr-1"></div>
                    {t("imageUploader.saving")}
                  </>
                ) : (
                  <>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    {t("imageUploader.saveButton")}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor grid - Changes to column on mobile */}
          <div
            className="image-editor-grid relative"
            style={{ height: "calc(100% - 120px)" }}
          >
            {/* Canvas area - Fixed width on desktop, top 50% on mobile */}
            <div
              className="editor-canvas-area flex items-center justify-center"
              style={{
                width: "75%",
                height: "100%",
                position: "absolute",
                left: 0,
                padding: "12px",
                boxSizing: "border-box",
                backgroundColor: "#1a2234", // Slightly lighter background for contrast
              }}
            >
              <div
                ref={canvasRef}
                className="canvas-container"
                style={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                  border: "none",
                  borderRadius: "0",
                  overflow: "hidden",
                  cursor: editorState.isDrawingBlur ? "crosshair" : "default",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {/* Enhancement animation overlay */}
                {showEnhanceAnimation && (
                  <div
                    className="enhance-animation"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: "none",
                      zIndex: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <div
                      className="animation-container"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "20px",
                      }}
                    >
                      {/* Simple spinner */}
                      <div
                        className="spinner"
                        style={{
                          width: "50px",
                          height: "50px",
                          border: "4px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "50%",
                          borderTop: "4px solid white",
                          animation: "spin 1s linear infinite",
                        }}
                      ></div>

                      {/* Text */}
                      <div
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        {t("imageUploader.enhancing")}
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading indicator for image saving */}
                {isSaving && (
                  <div
                    className="saving-animation"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      pointerEvents: "none",
                      zIndex: 10,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <div
                      className="animation-container"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "20px",
                      }}
                    >
                      {/* Simple spinner */}
                      <div
                        className="spinner"
                        style={{
                          width: "50px",
                          height: "50px",
                          border: "4px solid rgba(255, 255, 255, 0.3)",
                          borderRadius: "50%",
                          borderTop: "4px solid white",
                          animation: "spin 1s linear infinite",
                        }}
                      ></div>

                      {/* Text */}
                      <div
                        style={{
                          color: "white",
                          fontWeight: "bold",
                          fontSize: "18px",
                        }}
                      >
                        {t("imageUploader.saving")}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Controls sidebar - Fixed width on desktop, bottom 50% on mobile */}
            <div
              className="editor-controls-area bg-[#1f2937]"
              style={{
                width: "25%",
                height: "100%",
                position: "absolute",
                right: 0,
                overflowY: "auto",
                padding: "12px",
                boxSizing: "border-box",
              }}
            >
              <div className="bg-[#222A38] rounded-lg p-3 mb-3">
                <h3 className="text-base font-medium text-white mb-3">
                  {t("imageUploader.adjustments")}
                </h3>

                {/* Add brightness and contrast sliders back */}
                <div className="mb-3">
                  <div className="flex justify-between">
                    <label className="text-xs text-gray-400 block mb-1">
                      {t("imageUploader.brightness")}
                    </label>
                    <span className="text-xs text-gray-500">
                      {editorState.brightness}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={editorState.brightness}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value);
                      setEditorState({
                        ...editorState,
                        brightness: newValue,
                      });

                      if (konvaImageRef.current) {
                        konvaImageRef.current.brightness(newValue / 100);
                        konvaImageRef.current.getLayer()?.batchDraw();
                      }
                    }}
                    className="w-full range-slider"
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                      height: "10px",
                      background:
                        "linear-gradient(to right, #4488ff 0%, #4488ff " +
                        ((editorState.brightness + 50) / 150) * 100 +
                        "%, #374151 " +
                        ((editorState.brightness + 50) / 150) * 100 +
                        "%, #374151 100%)",
                      borderRadius: "5px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  />
                </div>
                <div className="mb-4">
                  <div className="flex justify-between">
                    <label className="text-xs text-gray-400 block mb-1">
                      {t("imageUploader.contrast")}
                    </label>
                    <span className="text-xs text-gray-500">
                      {editorState.contrast}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="-50"
                    max="100"
                    value={editorState.contrast}
                    onChange={(e) => {
                      const newValue = parseFloat(e.target.value);
                      setEditorState({
                        ...editorState,
                        contrast: newValue,
                      });

                      if (konvaImageRef.current) {
                        konvaImageRef.current.contrast(1 + newValue / 25);
                        konvaImageRef.current.getLayer()?.batchDraw();
                      }
                    }}
                    className="w-full range-slider"
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                      height: "10px",
                      background:
                        "linear-gradient(to right, #4488ff 0%, #4488ff " +
                        ((editorState.contrast + 50) / 150) * 100 +
                        "%, #374151 " +
                        ((editorState.contrast + 50) / 150) * 100 +
                        "%, #374151 100%)",
                      borderRadius: "5px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  />
                </div>

                {/* Replace brightness, contrast and blur sliders with a single enhance button */}
                <div className="mb-4">
                  <button
                    type="button"
                    onClick={enhanceImage}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium px-4 py-2 rounded-md hover:from-blue-600 hover:to-purple-700 transition-all"
                  >
                    {t("imageUploader.enhanceImage")}
                  </button>
                  <p className="text-xs text-gray-400 mt-2 text-center">
                    {t("imageUploader.enhanceTip")}
                  </p>
                </div>
              </div>

              {/* Blur controls */}
              <div className="bg-[#222A38] rounded-lg p-3 mb-3">
                <div className="flex items-center mb-3">
                  <label className="text-sm font-medium text-gray-300">
                    {t("imageUploader.blurAreas")}
                  </label>
                  <div className="flex-1"></div>
                  <button
                    type="button"
                    className={`px-3 py-1 text-xs rounded-md ${
                      editorState.isDrawingBlur
                        ? "bg-purple-600 text-white"
                        : "bg-gray-700 text-gray-300"
                    }`}
                    onClick={() => {
                      setEditorState({
                        ...editorState,
                        isDrawingBlur: !editorState.isDrawingBlur,
                      });
                    }}
                  >
                    {editorState.isDrawingBlur
                      ? t("imageUploader.drawingMode")
                      : t("imageUploader.selectMode")}
                  </button>
                </div>

                <div className="mb-3">
                  <div className="flex justify-between">
                    <label className="text-xs text-gray-400 block mb-1">
                      {t("imageUploader.blurStrength")}
                    </label>
                    <span className="text-xs text-gray-500">
                      {editorState.blurBrushStrength}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.1"
                    value={editorState.blurBrushStrength}
                    onChange={(e) => {
                      setEditorState({
                        ...editorState,
                        blurBrushStrength: parseFloat(e.target.value),
                      });
                    }}
                    className="w-full range-slider"
                    style={{
                      WebkitAppearance: "none",
                      appearance: "none",
                      height: "10px",
                      background:
                        "linear-gradient(to right, #4488ff 0%, #4488ff " +
                        (editorState.blurBrushStrength / 20) * 100 +
                        "%, #374151 " +
                        (editorState.blurBrushStrength / 20) * 100 +
                        "%, #374151 100%)",
                      borderRadius: "5px",
                      outline: "none",
                      cursor: "pointer",
                    }}
                  />
                </div>

                <div className="text-xs text-gray-500 italic mt-1 mb-3">
                  <p>{t("imageUploader.blurInstructions1")}</p>
                  <p>{t("imageUploader.blurInstructions2")}</p>
                </div>

                {editorState.blurRectangles.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditorState({
                        ...editorState,
                        blurRectangles: [],
                      });

                      // Remove all blur rectangles from the layer
                      if (blurLayerRef.current) {
                        blurLayerRef.current.destroyChildren();
                        blurLayerRef.current.batchDraw();
                      }
                    }}
                    className="w-full text-xs bg-red-800 hover:bg-red-700 text-white px-3 py-2 rounded-md"
                  >
                    {t("imageUploader.clearBlur")}
                  </button>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  type="button"
                  onClick={saveEditedImage}
                  disabled={isSaving}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md transition-colors disabled:opacity-70 flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      {t("imageUploader.saving")}
                    </>
                  ) : (
                    t("imageUploader.saveChanges")
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditorState({
                      brightness: 0,
                      contrast: 0,
                      blur: 0,
                      isDrawingBlur: false,
                      blurBrushSize: 20,
                      blurBrushStrength: 5,
                      blurRectangles: [],
                    });

                    // Reset the image to its original state
                    if (konvaImageRef.current) {
                      konvaImageRef.current.brightness(0);
                      konvaImageRef.current.contrast(1);
                      konvaImageRef.current.blurRadius(0);
                      konvaImageRef.current.getLayer()?.batchDraw();
                    }

                    // Clear blur rectangles
                    if (blurLayerRef.current) {
                      blurLayerRef.current.destroyChildren();
                      blurLayerRef.current.batchDraw();
                    }
                  }}
                  disabled={isSaving}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 px-4 py-2 rounded-md transition-colors disabled:opacity-50"
                >
                  {t("imageUploader.reset")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Function to handle image edit
  const handleEditClick = (index: number, e: React.MouseEvent) => {
    // Prevent the event from bubbling up to parent elements (especially form)
    // but don't prevent default actions on the button itself
    e.stopPropagation();

    try {
      // Create a new object URL or use the existing image URL
      const imageURL = displayImages[index];
      console.log("Opening editor for image:", imageURL);

      // Set editing state
      setEditingImage(imageURL);
      setEditingIndex(index);

      // For existing images, we don't need to set tempFileToEdit
      // as we'll be fetching the image directly from the URL
    } catch (error) {
      console.error("💥 Error handling image edit:", error);
    }
  };

  // Function to apply localized blur to specific regions
  const applyActualBlurToRegion = (
    x: number,
    y: number,
    width: number,
    height: number,
    blurStrength: number,
  ) => {
    if (!konvaImageRef.current || !stageRef.current) return null;

    try {
      // Create a temporary offscreen canvas
      const offscreenCanvas = document.createElement("canvas");
      const stageWidth = stageRef.current.width();
      const stageHeight = stageRef.current.height();
      offscreenCanvas.width = stageWidth;
      offscreenCanvas.height = stageHeight;
      const ctx = offscreenCanvas.getContext("2d");
      if (!ctx) return null;

      // Draw the full source image to the canvas
      ctx.drawImage(
        konvaImageRef.current.image() as HTMLImageElement,
        0,
        0,
        stageWidth,
        stageHeight,
      );

      // Apply a blur to just the region we want
      ctx.save();
      // Only blur the region we care about
      ctx.beginPath();
      ctx.rect(x, y, width, height);
      ctx.clip();

      // Use built-in canvas blur if available
      if (typeof ctx.filter !== "undefined") {
        ctx.filter = `blur(${blurStrength}px)`;
        // We need to redraw the image with the filter applied
        ctx.drawImage(
          konvaImageRef.current.image() as HTMLImageElement,
          0,
          0,
          stageWidth,
          stageHeight,
        );
      } else {
        // Fallback - simple box blur
        const pixelData = ctx.getImageData(x, y, width, height);
        const blurredData = simpleBoxBlur(
          pixelData.data,
          width,
          height,
          blurStrength,
        );
        ctx.putImageData(new ImageData(blurredData, width, height), x, y);
      }

      ctx.restore();

      // Create a new image from the result
      const blurredImage = new Image();
      blurredImage.src = offscreenCanvas.toDataURL();

      return blurredImage;
    } catch (error) {
      console.error("Error applying blur:", error);
      return null;
    }
  };

  // Simple box blur that doesn't use the complex stack algorithm
  function simpleBoxBlur(
    pixels: Uint8ClampedArray,
    width: number,
    height: number,
    radius: number,
  ): Uint8ClampedArray {
    const result = new Uint8ClampedArray(pixels.length);
    const size = radius * 2 + 1;
    const divisor = size * size;

    // For each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0,
          g = 0,
          b = 0,
          a = 0;
        let count = 0;

        // Sample the surrounding pixels
        for (let ky = -radius; ky <= radius; ky++) {
          for (let kx = -radius; kx <= radius; kx++) {
            const px = Math.min(width - 1, Math.max(0, x + kx));
            const py = Math.min(height - 1, Math.max(0, y + ky));

            const i = (py * width + px) * 4;
            r += pixels[i];
            g += pixels[i + 1];
            b += pixels[i + 2];
            a += pixels[i + 3];
            count++;
          }
        }

        // Set the pixel in the result
        const i = (y * width + x) * 4;
        result[i] = r / count;
        result[i + 1] = g / count;
        result[i + 2] = b / count;
        result[i + 3] = a / count;
      }
    }

    return result;
  }

  // Handle image removal
  const handleRemoveImage = async (index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (onRemove) {
      onRemove(index);
    }
  };

  // Add CSS animation styles to document
  useEffect(() => {
    // Create a style element
    const styleElement = document.createElement("style");

    // Define animations
    styleElement.textContent = `
                @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
                }

                /* Improved range slider styling */
                input[type=range].range-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                appearance: none;
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                transition: all 0.2s;
                }

                input[type=range].range-slider::-webkit-slider-thumb:hover {
                transform: scale(1.1);
                }

                input[type=range].range-slider::-webkit-slider-thumb:active {
                transform: scale(1.2);
                background: #f0f0f0;
                }

                input[type=range].range-slider::-moz-range-thumb {
                width: 20px;
                height: 20px;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                border: none;
                transition: all 0.2s;
                }

                input[type=range].range-slider::-moz-range-thumb:hover {
                transform: scale(1.1);
                }

                input[type=range].range-slider::-moz-range-thumb:active {
                transform: scale(1.2);
                background: #f0f0f0;
                }

                /* Mobile-specific styles */
                @media (max-width: 768px) {
                .editor-modal {
                width: 100% !important;
                height: 100% !important;
                max-width: 100vw !important;
                max-height: 100vh !important;
                border-radius: 0 !important;
                margin: 0 !important;
                }

                .image-editor-grid {
                flex-direction: column !important;
                }

                .editor-canvas-area {
                width: 100% !important;
                height: 50% !important;
                position: relative !important;
                left: auto !important;
                }

                .editor-controls-area {
                  width: 100% !important;
                  height: 50% !important;
                  position: relative !important;
                  right: auto !important;
                  bottom: 0 !important;
                }
              }
              `;

    // Add the style element to the head
    document.head.appendChild(styleElement);

    // Clean up function
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  return (
    <div className="w-full" onClick={onClick}>
      {/* Image editor modal */}
      {editingImage && <ImageEditorModal />}

      {displayImages.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {displayImages.map((image, index) => (
            <div key={index} className="relative group">
              <img
                src={image}
                alt={`Uploaded image ${index + 1}`}
                className="w-full aspect-video object-cover rounded-lg border border-[#2A3441]"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => handleEditClick(index, e)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    {t("imageUploader.edit")}
                  </button>
                  <button
                    type="button"
                    onClick={(e) => handleRemoveImage(index, e)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md text-sm"
                  >
                    {t("imageUploader.remove")}
                  </button>
                </div>
              </div>
            </div>
          ))}

          {displayImages.length < limit && (
            <div
              ref={dropAreaRef}
              className={`flex flex-col items-center justify-center min-h-[240px] border-2 border-dashed rounded-lg cursor-pointer transition-all ${
                isDragging
                  ? "border-purple-500 bg-purple-500/10 scale-105"
                  : "border-[#2A3441] hover:border-purple-500/50 hover:bg-[#1D2839]/50"
              }`}
              onClick={(e) => handleAreaClick(e)}
              onDragEnter={handleDragEnter}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              role="button"
              tabIndex={0}
              aria-label="Upload image"
            >
              <div className="p-6 flex flex-col items-center w-full text-center">
                <svg
                  className="w-12 h-12 text-purple-500 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>

                <p className="text-base font-medium text-gray-300 mb-2 break-words">
                  {isUploading
                    ? t("imageUploader.uploading")
                    : customUploadText || t("imageUploader.uploadImages")}
                </p>

                <p className="text-sm text-gray-500 break-words">
                  {t("imageUploader.dragAndDrop")}
                </p>

                <p className="text-xs text-gray-600 mt-3 break-words">
                  {t("imageUploader.supportedFormats")}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          ref={dropAreaRef}
          className={`flex flex-col items-center justify-center min-h-[240px] border-2 border-dashed rounded-lg cursor-pointer transition-all ${
            isDragging
              ? "border-purple-500 bg-purple-500/10 scale-105"
              : "border-[#2A3441] hover:border-purple-500/50 hover:bg-[#1D2839]/50"
          }`}
          onClick={(e) => handleAreaClick(e)}
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          aria-label="Upload image"
        >
          <div className="p-6 flex flex-col items-center w-full text-center">
            <svg
              className="w-12 h-12 text-purple-500 mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>

            <p className="text-base font-medium text-gray-300 mb-2 break-words">
              {isUploading
                ? t("imageUploader.uploading")
                : customUploadText || t("imageUploader.uploadImages")}
            </p>

            <p className="text-sm text-gray-500 break-words">
              {t("imageUploader.dragAndDrop")}
            </p>

            <p className="text-xs text-gray-600 mt-3 break-words">
              {t("imageUploader.supportedFormats")}
            </p>
          </div>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        onChange={(e) => handleFileChange(e)}
        accept="image/*"
        className="hidden"
        multiple={limit > 1}
        // Ensure this doesn't prevent file selection
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
