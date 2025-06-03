
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const API_KEY = process.env.API_KEY;
let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn("API_KEY environment variable not set. Gemini features will be disabled.");
}

export const isGeminiEnabled = (): boolean => !!ai;

export const getGameCommentary = async (resultMessage: string): Promise<string | null> => {
  if (!ai) {
    return "Gemini AI commentary disabled (API key not configured).";
  }

  const prompt = `You are a witty and slightly dramatic commentator for a Tic Tac Toe game. 
The game just ended. The result is: "${resultMessage}".
Provide a short, engaging, and family-friendly comment about this outcome. Make it fun! Maximum 2 concise sentences.`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17", // Use a suitable text generation model
        contents: prompt,
        config: {
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
        }
    });
    const text = response.text;
    return text || "AI couldn't think of anything witty right now!";
  } catch (error) {
    console.error("Error fetching Gemini commentary:", error);
    if (error instanceof Error && error.message.includes("API key not valid")) {
        return "Gemini commentary failed: API key is invalid.";
    }
    return "AI commentary is unavailable due to an error.";
  }
};
