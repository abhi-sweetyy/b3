export interface ImagePlaceholders {
  '{{logo}}': string;
  '{{image3}}': string;
  '{{image1}}': string;
  '{{image2}}': string;
  '{{image4}}': string;
}

export interface ImageUploaderProps {
  images?: string[];
  onUpload?: (file: File) => Promise<void>;
  onReplace?: (index: number, file: File) => Promise<void>;
  existingImages?: string[];
  onImagesUploaded?: (urls: string[]) => void;
  uploading?: boolean;
  limit?: number;
}

export interface EditorProps {
  image: string;
  index: number;
  onSave: (file: File) => Promise<void>;
  onClose: () => void;
}

export interface EditorState {
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