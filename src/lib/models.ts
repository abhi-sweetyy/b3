// OpenRouter configuration
export const models = {

  GeminiFlash: "google/gemini-2.0-flash-exp:free"
} as const;

export type ModelType = keyof typeof models;

export function getAvailableModels() {
  return Object.entries(models).map(([key, value]) => ({
    id: key,
    name: value // Use the actual model identifier for clarity
  }));
} 