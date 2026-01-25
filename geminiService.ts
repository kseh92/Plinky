
import { GoogleGenAI, Type } from "@google/genai";
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, RecapData } from "./types";

const API_KEY = process.env.API_KEY || "";

export const generateBlueprint = async (instrument: InstrumentType): Promise<InstrumentBlueprint> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a "blueprint" for a hand-drawn ${instrument}. 
    Drum parts: kick, snare, hihat, crash, high tom, mid tom, floor tom.
    Piano notes: c4, d4, e4, f4, g4, a4, b4, c5.
    Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instrument: { type: Type.STRING },
          description: { type: Type.STRING },
          shapes: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING, enum: ["circle", "rect"] },
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                x: { type: Type.NUMBER },
                y: { type: Type.NUMBER },
                width: { type: Type.NUMBER },
                height: { type: Type.NUMBER },
                radius: { type: Type.NUMBER },
                sound: { type: Type.STRING }
              },
              required: ["type", "id", "label", "x", "y", "sound"]
            }
          }
        },
        required: ["instrument", "shapes", "description"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};

export const scanDrawing = async (instrument: InstrumentType, base64Image: string): Promise<HitZone[]> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  const pianoPrompt = `Detect ALL individual keys in this piano drawing (both white and black/sharps).
    
    Identify keys from left to right:
    - White keys: c4, d4, e4, f4, g4, a4, b4, c5, d5, e5, f5, g5, a5, b5.
    - Black keys (sharps) based on their position:
      * Between C4/D4 -> cs4 (C#4)
      * Between D4/E4 -> ds4 (D#4)
      * Between F4/G4 -> fs4 (F#4)
      * Between G4/A4 -> gs4 (G#4)
      * Between A4/B4 -> as4 (A#4)
      * Repeat for octave 5 (cs5, ds5, fs5, gs5, as5).

    IMPORTANT: Provide an accurate bounding box for EVERY individual key. Black keys are usually thinner and higher up.
    Return a JSON array of objects with {sound, label, x, y, width, height}. 
    Coordinates: percentages (0-100) relative to the image.`;

  const drumPrompt = `Analyze this hand-drawn drum kit. Use size, color, and position to identify parts:
       
       MAPPING RULES:
       - Yellow/Gold circles (top left/right) -> sound: "crash cymbal"
       - Small yellow circles -> sound: "hi-hat"
       - Large central circle (bottom) -> sound: "kick drum"
       - Medium red-rimmed circle -> sound: "snare drum"
       - Blue-rimmed top drum -> sound: "high tom"
       - Yellow-rimmed top drum -> sound: "mid tom"
       - Large side drums -> sound: "floor tom"
       
       BE SPECIFIC WITH LABELS. Use "high tom", "mid tom", "floor tom", "crash", "kick".
       Return a JSON array of objects with {sound, label, x, y, width, height}. 
       Coordinates: percentages (0-100).`;

  const prompt = instrument === 'Piano' ? pianoPrompt : drumPrompt;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: prompt }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sound: { type: Type.STRING },
            label: { type: Type.STRING },
            x: { type: Type.NUMBER },
            y: { type: Type.NUMBER },
            width: { type: Type.NUMBER },
            height: { type: Type.NUMBER }
          },
          required: ["sound", "label", "x", "y", "width", "height"]
        }
      }
    }
  });

  return JSON.parse(response.text.trim());
};

export const generateSessionRecap = async (stats: SessionStats): Promise<RecapData> => {
  const ai = new GoogleGenAI({ apiKey: API_KEY });
  const prompt = `Act as an encouraging, playful music critic for a kid. 
  The kid just played a paper-drawn ${stats.instrument} for ${stats.durationSeconds} seconds.
  
  1. Write a short, exciting quote about their performance.
  2. Compare their vibe to a famous real artist (e.g., "energy of Sheila E.", "soul of Elton John").
  3. Suggest a real, popular song for them to check out next on YouTube Music.
  
  Return JSON.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          criticQuote: { type: Type.STRING },
          artistComparison: { type: Type.STRING },
          recommendedSong: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              artist: { type: Type.STRING },
              youtubeMusicUrl: { type: Type.STRING }
            },
            required: ["title", "artist", "youtubeMusicUrl"]
          }
        },
        required: ["criticQuote", "artistComparison", "recommendedSong"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};
