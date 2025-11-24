import { GoogleGenAI } from "@google/genai";

// Helper to strip the Data URL header
const cleanBase64 = (dataUrl: string) => {
  return dataUrl.split(',')[1] || dataUrl;
};

// Helper to fetch and convert URL to base64 if needed (for preset images)
export const urlToBase64 = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting URL to base64", error);
    throw error;
  }
};

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment variables");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Generate a new outfit image based on text description.
 * Model: gemini-2.5-flash-image (Nano Banana)
 */
export const generateOutfitImage = async (prompt: string): Promise<string> => {
  const ai = getClient();
  
  const fullPrompt = `A high-quality, professional fashion photography shot of the following clothing item on a plain neutral background: ${prompt}. Flat lay or mannequin style. Full view of the garment.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: fullPrompt }]
      },
      config: {
        imageConfig: {
            aspectRatio: "3:4", 
            // Nano Banana doesn't support 'imageSize' param usually, keeping it simple
        }
      }
    });

    // Extract image
    for (const part of response.candidates?.[0]?.content?.parts || []) {
        if (part.inlineData && part.inlineData.data) {
            return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
    }
    throw new Error("No image data returned from Gemini.");
  } catch (error) {
    console.error("Gemini Outfit Gen Error:", error);
    throw error;
  }
};

/**
 * Generate the Try-On result.
 * Mixes Person Image + Outfit Image using prompts.
 * Model: gemini-2.5-flash-image
 */
export const generateTryOnResult = async (personImage: string, outfitImage: string): Promise<string> => {
    const ai = getClient();
    
    // Ensure we have clean base64 strings
    const personB64 = cleanBase64(personImage);
    const outfitB64 = cleanBase64(outfitImage);

    // Prompt engineering for virtual try-on simulation
    const prompt = `
      Act as an expert fashion AI.
      Create a photorealistic full-body image of the person shown in the first image, wearing the outfit shown in the second image.
      
      Requirements:
      1. PRESERVE the person's identity, facial features, skin tone, and body pose exactly from the first image.
      2. REPLACE the original clothing with the new outfit from the second image.
      3. Fit the new outfit naturally onto the person's body, respecting physics, lighting, and wrinkles.
      4. Maintain the background of the person image if possible, or use a high-quality studio background.
      5. Output a high-resolution full-body shot.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        mimeType: 'image/png', // Assuming PNG/JPEG, Gemini handles detection usually
                        data: personB64
                    }
                },
                {
                    inlineData: {
                        mimeType: 'image/png',
                        data: outfitB64
                    }
                },
                { text: prompt }
            ]
        },
        config: {
            imageConfig: {
                aspectRatio: "3:4" 
            }
        }
      });
  
      for (const part of response.candidates?.[0]?.content?.parts || []) {
          if (part.inlineData && part.inlineData.data) {
              return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
      }
      throw new Error("No try-on result returned from Gemini.");
    } catch (error) {
      console.error("Gemini Try-On Gen Error:", error);
      throw error;
    }
};
