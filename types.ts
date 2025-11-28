
export enum AspectRatio {
  Square = "1:1",
  Portrait = "3:4",
  Landscape = "4:3",
  Wide = "16:9",
  Tall = "9:16"
}

export enum ModelTier {
  Flash = "gemini-2.5-flash-image", // Nano Banana
  Pro = "gemini-3-pro-image-preview", // Nano Banana Pro
  ImagenFast = "imagen-4.0-fast-generate-001" // Imagen 4 Fast
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
  model: ModelTier;
  aspectRatio: string;
}

export interface GenerationConfig {
  prompt: string;
  aspectRatio: AspectRatio;
  model: ModelTier;
  referenceImage?: string; // base64 string for editing
}
