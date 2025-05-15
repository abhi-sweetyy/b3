import { useState, useEffect, RefObject } from 'react';
import Konva from 'konva';
import { EditorState } from '../types';
import { applyBlurToRegion, dataURLtoFile } from '../utils/imageProcessing';

interface UseImageEditorProps {
  image: string;
  canvasRef: RefObject<HTMLDivElement>;
  onSave: (file: File) => Promise<void>;
  index: number;
}

// Calculate dimensions for the image to fit within the canvas
const calculateDimensions = (img: HTMLImageElement, maxWidth: number, maxHeight: number) => {
  let width = img.width;
  let height = img.height;
  
  // Scale down if image is larger than max dimensions
  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const ratio = Math.min(widthRatio, heightRatio);
    
    width *= ratio;
    height *= ratio;
  }
  
  return { width, height };
};

// Setup image filters like brightness, contrast, etc.
const setupImageFilters = (image: Konva.Image) => {
  // Set initial filter values
  image.cache();
  image.filters([Konva.Filters.Brighten, Konva.Filters.Contrast, Konva.Filters.Blur]);
  image.brightness(0);
  image.contrast(1);
  image.blurRadius(0);
};

// Setup handlers for drawing blur regions
const setupBlurDrawingHandlers = (stage: Konva.Stage, blurLayer: Konva.Layer) => {
  let isDrawing = false;
  let startPoint = { x: 0, y: 0 };
  let currentRect: Konva.Rect | null = null;
  
  // Mouse down handler
  stage.on('mousedown touchstart', (e) => {
    // Only handle if we're in blur drawing mode
    // (This will be checked in the actual component logic)
    startPoint = stage.getPointerPosition() || { x: 0, y: 0 };
    isDrawing = true;
    
    // Create a new rectangle for the blur region
    currentRect = new Konva.Rect({
      x: startPoint.x,
      y: startPoint.y,
      width: 0,
      height: 0,
      fill: 'rgba(0, 0, 255, 0.3)',
      stroke: 'rgba(0, 0, 255, 0.7)',
      strokeWidth: 1,
    });
    
    blurLayer.add(currentRect);
  });
  
  // Mouse move handler
  stage.on('mousemove touchmove', () => {
    if (!isDrawing || !currentRect) return;
    
    const pos = stage.getPointerPosition() || { x: 0, y: 0 };
    
    // Update rectangle size
    const width = pos.x - startPoint.x;
    const height = pos.y - startPoint.y;
    
    currentRect.width(width);
    currentRect.height(height);
    blurLayer.batchDraw();
  });
  
  // Mouse up handler
  stage.on('mouseup touchend', () => {
    if (!isDrawing || !currentRect) return;
    
    isDrawing = false;
    
    // If rectangle is too small, remove it
    if (Math.abs(currentRect.width()) < 5 || Math.abs(currentRect.height()) < 5) {
      currentRect.destroy();
      blurLayer.batchDraw();
      return;
    }
    
    // Normalize rectangle coordinates if dimensions are negative
    let x = currentRect.x();
    let y = currentRect.y();
    let width = currentRect.width();
    let height = currentRect.height();
    
    if (width < 0) {
      x += width;
      width = Math.abs(width);
    }
    
    if (height < 0) {
      y += height;
      height = Math.abs(height);
    }
    
    currentRect.x(x);
    currentRect.y(y);
    currentRect.width(width);
    currentRect.height(height);
    
    blurLayer.batchDraw();
    currentRect = null;
  });
};

export function useImageEditor({ 
  image, 
  canvasRef, 
  onSave, 
  index 
}: UseImageEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [stageRef, setStageRef] = useState<Konva.Stage | null>(null);
  const [imageLayerRef, setImageLayerRef] = useState<Konva.Layer | null>(null);
  const [blurLayerRef, setBlurLayerRef] = useState<Konva.Layer | null>(null);
  const [konvaImageRef, setKonvaImageRef] = useState<Konva.Image | null>(null);

  const [editorState, setEditorState] = useState<EditorState>({
    brightness: 0,
    contrast: 0,
    blur: 0,
    isDrawingBlur: false,
    blurBrushSize: 20,
    blurBrushStrength: 5,
    blurRectangles: []
  });

  // Initialize Konva stage
  useEffect(() => {
    if (!image || !canvasRef.current) return;

    const loadImage = async () => {
      try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = image;

        img.onload = () => {
          initializeKonvaStage(img);
        };
      } catch (error) {
        console.error('Error loading image:', error);
      }
    };

    loadImage();

    return () => {
      if (stageRef) {
        stageRef.destroy();
      }
    };
  }, [image]);

  const initializeKonvaStage = (img: HTMLImageElement) => {
    if (!canvasRef.current) return;

    // Calculate dimensions
    const maxWidth = Math.min(window.innerWidth * 0.6, 800);
    const maxHeight = Math.min(window.innerHeight * 0.6, 500);
    const { width, height } = calculateDimensions(img, maxWidth, maxHeight);

    // Create stage and layers
    const stage = new Konva.Stage({
      container: canvasRef.current,
      width,
      height,
    });

    const imageLayer = new Konva.Layer();
    const blurLayer = new Konva.Layer();

    stage.add(imageLayer);
    stage.add(blurLayer);

    // Create and configure main image
    const konvaImage = new Konva.Image({
      image: img,
      width,
      height,
    });

    setupImageFilters(konvaImage);
    imageLayer.add(konvaImage);
    imageLayer.batchDraw();

    // Store references
    setStageRef(stage);
    setImageLayerRef(imageLayer);
    setBlurLayerRef(blurLayer);
    setKonvaImageRef(konvaImage);

    // Setup blur drawing handlers
    setupBlurDrawingHandlers(stage, blurLayer);
  };

  // Handlers for editor controls
  const handleBrightnessChange = (value: number) => {
    setEditorState(prev => ({ ...prev, brightness: value }));
    if (konvaImageRef) {
      konvaImageRef.brightness(value / 100);
      konvaImageRef.getLayer()?.batchDraw();
    }
  };

  const handleContrastChange = (value: number) => {
    setEditorState(prev => ({ ...prev, contrast: value }));
    if (konvaImageRef) {
      konvaImageRef.contrast(1 + value / 25);
      konvaImageRef.getLayer()?.batchDraw();
    }
  };

  const handleBlurChange = (value: number) => {
    setEditorState(prev => ({ ...prev, blur: value }));
    if (konvaImageRef) {
      konvaImageRef.blurRadius(value);
      konvaImageRef.getLayer()?.batchDraw();
    }
  };

  const handleBlurDrawingToggle = () => {
    setEditorState(prev => ({ 
      ...prev, 
      isDrawingBlur: !prev.isDrawingBlur 
    }));
  };

  const handleBlurStrengthChange = (value: number) => {
    setEditorState(prev => ({ 
      ...prev, 
      blurBrushStrength: value 
    }));
  };

  const handleClearBlurRegions = () => {
    setEditorState(prev => ({ ...prev, blurRectangles: [] }));
    if (blurLayerRef) {
      blurLayerRef.destroyChildren();
      blurLayerRef.batchDraw();
    }
  };

  const handleReset = () => {
    setEditorState({
      brightness: 0,
      contrast: 0,
      blur: 0,
      isDrawingBlur: false,
      blurBrushSize: 20,
      blurBrushStrength: 5,
      blurRectangles: []
    });

    if (konvaImageRef) {
      konvaImageRef.brightness(0);
      konvaImageRef.contrast(1);
      konvaImageRef.blurRadius(0);
      konvaImageRef.getLayer()?.batchDraw();
    }

    handleClearBlurRegions();
  };

  const handleSave = async () => {
    if (!stageRef) return;
    
    try {
      setIsUploading(true);
      const dataURL = stageRef.toDataURL();
      const file = dataURLtoFile(dataURL, `edited_image_${Date.now()}.png`);
      await onSave(file);
      setIsUploading(false);
    } catch (error) {
      console.error('Error saving image:', error);
      setIsUploading(false);
    }
  };

  return {
    editorState,
    isUploading,
    handleBrightnessChange,
    handleContrastChange,
    handleBlurChange,
    handleBlurDrawingToggle,
    handleBlurStrengthChange,
    handleClearBlurRegions,
    handleReset,
    handleSave,
  };
} 