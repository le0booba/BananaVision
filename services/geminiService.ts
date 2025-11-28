
import { GoogleGenAI } from "@google/genai";
import { GenerationConfig, ModelTier } from "../types";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates or edits an image using the Gemini API.
 * Uses 'gemini-2.5-flash-image' (Nano Banana), 'gemini-3-pro-image-preview', or 'imagen-4.0-fast-generate-001'.
 */
export const generateImageContent = async (config: GenerationConfig): Promise<string> => {
  const { prompt, aspectRatio, model, referenceImage } = config;

  try {
    // Handle Imagen models separately using generateImages
    if (model === ModelTier.ImagenFast) {
      const response = await ai.models.generateImages({
        model: model,
        prompt: prompt,
        config: {
          numberOfImages: 1,
          outputMimeType: 'image/png',
          aspectRatio: aspectRatio,
        },
      });

      if (!response.generatedImages || response.generatedImages.length === 0) {
        throw new Error("No images returned from Imagen model.");
      }
      
      const imageBytes = response.generatedImages[0].image?.imageBytes;
      if (!imageBytes) {
         throw new Error("Image data is missing in the response.");
      }

      return `data:image/png;base64,${imageBytes}`;
    }

    // Existing logic for Gemini (Nano Banana) models using generateContent
    const parts: any[] = [];

    // If we have a reference image, we add it to the request parts first (for editing/variation)
    if (referenceImage) {
      // Extract base64 data from data URL if present
      const base64Data = referenceImage.split(',')[1] || referenceImage;
      parts.push({
        inlineData: {
          mimeType: 'image/png', // Assuming PNG for simplicity, though API supports others
          data: base64Data
        }
      });
    }

    // Add the text prompt
    parts.push({ text: prompt });

    // Configure the request
    const response = await ai.models.generateContent({
      model: model,
      contents: {
        parts: parts
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          // imageSize is only supported on Pro models, defaulting to model's choice if Flash
          ...(model === ModelTier.Pro ? { imageSize: "1K" } : {})
        }
      }
    });

    // Parse the response to find the image
    const candidates = response.candidates;
    if (!candidates || candidates.length === 0) {
      throw new Error("No candidates returned from the model.");
    }

    const contentParts = candidates[0].content?.parts;
    if (!contentParts) {
      throw new Error("No content parts returned.");
    }

    // Iterate to find the inlineData (image)
    for (const part of contentParts) {
      if (part.inlineData && part.inlineData.data) {
        // Construct the data URL
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }

    // Fallback if no image found but text exists (e.g., refusal or error description)
    const textPart = contentParts.find(p => p.text);
    if (textPart && textPart.text) {
      throw new Error(`Model returned text instead of image: ${textPart.text}`);
    }

    throw new Error("Model response did not contain an image.");

  } catch (error: any) {
    console.error("Image Generation Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};
