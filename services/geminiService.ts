
import { GoogleGenAI, Chat } from "@google/genai";
import { MODEL_CHAT, MODEL_TRANSCRIPTION, SYSTEM_INSTRUCTION } from "../constants";
import { LocationCoords } from "../types";

// Initialize AI Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- Chat Service ---

export const createChatSession = (location?: LocationCoords): Chat => {
  const toolConfig: any = {};
  
  if (location) {
    toolConfig.retrievalConfig = {
      latLng: {
        latitude: location.latitude,
        longitude: location.longitude
      }
    };
  }

  return ai.chats.create({
    model: MODEL_CHAT,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      tools: [
        { googleSearch: {} },
        { googleMaps: {} }
      ],
      toolConfig: toolConfig,
    },
  });
};

export const sendMessage = async (chat: Chat, message: string) => {
  const response = await chat.sendMessage({ message });
  return response;
};

// --- Speech-to-Text (Transcription) Service ---

export const transcribeAudio = async (base64Audio: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: MODEL_TRANSCRIPTION,
    contents: {
      parts: [
        {
          inlineData: {
            mimeType: 'audio/wav', // Adjust if recorder uses different mime
            data: base64Audio,
          },
        },
        {
          text: "Transcribe this audio exactly as spoken in Arabic/English.",
        },
      ],
    },
  });
  return response.text || "";
};
