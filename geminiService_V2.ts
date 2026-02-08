
import { GoogleGenAI, Type } from "@google/genai";
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, RecapData, MixingPreset, PerformanceEvent } from "./types_V2";

// Fix: Strictly following the guideline to use process.env.API_KEY exclusively.
const getApiKey = () => {
  return process.env.API_KEY;
};

const withTimeout = async <T>(promise: Promise<T>, ms: number, label: string) => {
  let timer: number | undefined;
  const timeout = new Promise<T>((_, reject) => {
    timer = window.setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
  });
  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer) window.clearTimeout(timer);
  }
};

export const generateBlueprint = async (instrument: InstrumentType): Promise<InstrumentBlueprint> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a "blueprint" for a hand-drawn ${instrument}. 
    Drum parts: kick, snare, hihat, crash, high tom, mid tom, floor tom.
    Piano notes: c4, d4, e4, f4, g4, a4, b4, c5. Use '#' for sharps if needed (e.g. c#4).
    Harp strings: c4, d4, e4, f4, g4, a4, b4, c5, d5, e5, f5, g5.
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `You are a precision-focused computer vision model. Your task is to detect hand-drawn musical instruments.
    CRITICAL COORDINATE RULES:
    1. x and y MUST be the TOP-LEFT corner of the bounding box (not the center).
    2. Values are 0-100 relative to the image width and height.
    3. The bounding box must ENCLOSE the drawn pencil/pen lines perfectly. Do not leave gaps.
    4. Ignore all background noise (hands, furniture, shadows). Only detect the drawn instrument parts.
    5. Ensure the box strictly follows the orientation and tilt of the drawing.
    6. Return a JSON array.`;

  const pianoPrompt = `Detect each INDIVIDUAL piano key. 
    1. Distinguish white keys from black keys.
    2. White keys (longer): c4, d4, e4, f4, g4, a4, b4, c5.
    3. Black keys (shorter, usually drawn between white keys): c#4, d#4, f#4, g#4, a#4.
    Ensure the boxes are long and narrow, matching the drawn key outlines.`;
    
  const drumPrompt = `Detect parts of this drum kit: kick, snare, hihat, crash, tom_hi, tom_mid, tom_low.
    Draw circles or ellipses that cover the drawn drum heads.`;
    
  const harpPrompt = `Detect strings of this harp. Each string is a vertical line. 
    Identify them from left to right as c4, d4, etc.
    Boxes should be very narrow but cover the full height of the drawn string.`;
    
  const genericPrompt = `Identify the interactive components of this: ${instrument}. 
    Map drawing parts to logical sound names using top-left x,y coordinates.`;

  let userPrompt = instrument === 'Piano' ? pianoPrompt : drumPrompt;
  if (instrument === 'Harp') userPrompt = harpPrompt;
  if (!['Piano', 'Drum', 'Harp'].includes(instrument)) userPrompt = genericPrompt;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } },
        { text: userPrompt }
      ]
    },
    config: {
      systemInstruction,
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const intensityLabel = stats.intensity > 4 ? "Extremely High (Shredding/Rapid)" : 
                        stats.intensity > 1.5 ? "Moderate (Groovy/Rhythmic)" : "Low (Calm/Minimalist)";
  const varietyLabel = stats.uniqueNotesCount > 10 ? "Very High (Experimental/Orchestral)" :
                      stats.uniqueNotesCount > 4 ? "Good (Balanced)" : "Focused (Minimal)";

  const prompt = `Act as an encouraging music critic for a kid playing a paper ${stats.instrument}.
  PERFORMANCE DATA:
  - Duration: ${stats.durationSeconds}s
  - Intensity: ${intensityLabel}
  - Sound Variety: ${varietyLabel}
  
  TASK:
  1. Find 8 REAL, popular songs on YouTube Music that match this vibe.
  2. For each song, get the EXACT YouTube Music URL and the REAL high-quality album art cover URL.
  3. Return a valid JSON object with: criticQuote, artistComparison, performanceStyle, and recommendedSongs.`;

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
          performanceStyle: { type: Type.STRING },
          recommendedSongs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                youtubeMusicUrl: { type: Type.STRING },
                coverImageUrl: { type: Type.STRING }
              },
              required: ["title", "artist", "youtubeMusicUrl", "coverImageUrl"]
            }
          }
        },
        required: ["criticQuote", "artistComparison", "performanceStyle", "recommendedSongs"]
      }
    }
  });

  const recap = JSON.parse(response.text.trim());
  return recap;
};

export const generateAlbumJacket = async (stats: SessionStats, recap: RecapData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const title = recap.trackTitle || "Doodle Symphony";
  const genre = recap.genre || "bright pop";
  const prompt = `Create a vibrant, kid-safe album cover for a ${genre} track titled "${title}". 
  The instrument is ${stats.instrument}. Use playful shapes, bold colors, and a polished studio look. 
  No dark or scary themes.`;

  const response = await withTimeout(
    ai.models.generateImages({
      model: "imagen-4.0-generate-001",
      prompt,
      config: {
        numberOfImages: 1
      }
    }),
    20000,
    "Album jacket generation"
  );

  const bytes = (response as any)?.generatedImages?.[0]?.image?.imageBytes;
  if (!bytes) {
    throw new Error("Album jacket image bytes missing.");
  }

  return `data:image/png;base64,${bytes}`;
};

export const generateMixSettings = async (eventLog: PerformanceEvent[], instrument: InstrumentType): Promise<{
  genre: string;
  trackTitle: string;
  mix: MixingPreset;
  extendedEventLog: PerformanceEvent[];
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this performance sequence for a ${instrument}: ${JSON.stringify(eventLog.slice(0, 50))}.
    Determine a professional-sounding genre. 
    Create a COOL, ENERGETIC, and KID-SAFE track title (e.g., 'Neon Skyline', 'Electric Pulse', 'Solar Beat'). Suggest audio mixing settings. Return JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          genre: { type: Type.STRING },
          trackTitle: { type: Type.STRING },
          mix: {
            type: Type.OBJECT,
            properties: {
              reverbAmount: { type: Type.NUMBER },
              compressionThreshold: { type: Type.NUMBER },
              bassBoost: { type: Type.NUMBER },
              midBoost: { type: Type.NUMBER },
              trebleBoost: { type: Type.NUMBER },
              distortionAmount: { type: Type.NUMBER }
            },
            required: ["reverbAmount", "compressionThreshold", "bassBoost", "midBoost", "trebleBoost", "distortionAmount"]
          },
          extendedEventLog: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                timestamp: { type: Type.NUMBER },
                sound: { type: Type.STRING }
              },
              required: ["timestamp", "sound"]
            }
          }
        },
        required: ["genre", "trackTitle", "mix", "extendedEventLog"]
      }
    }
  });

  return JSON.parse(response.text.trim());
};
