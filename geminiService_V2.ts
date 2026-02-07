
import { GoogleGenAI, Type } from "@google/genai";
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, RecapData, MixingPreset, PerformanceEvent } from "./types_V2";

const getApiKey = () => {
  return import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.GEMINI_API_KEY || "";
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
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const pianoPrompt = `Detect ALL individual keys in this piano drawing (both white and black/sharps).
    Identify keys from left to right. Use standard note names (c4, c#4, d4, d#4, etc.).
    Provide accurate bounding boxes. Return JSON.`;
  const drumPrompt = `Analyze this hand-drawn drum kit. Identify kick, snare, toms, hi-hat, and crash. Return JSON.`;
  const harpPrompt = `Analyze this hand-drawn harp. Identify individual vertical strings (C, D, E, F, G, A, B).
    Strings should be vertical boxes. Return JSON.`;
  let prompt = instrument === 'Piano' ? pianoPrompt : drumPrompt;
  if (instrument === 'Harp') prompt = harpPrompt;

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
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
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
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const title = recap.trackTitle || "Doodle Symphony";
  const genre = recap.genre || "bright pop";
  const prompt = `Create a vibrant, kid-safe album cover for a ${genre} track titled "${title}". 
  The instrument is ${stats.instrument}. Use playful shapes, bold colors, and a polished studio look. 
  No dark or scary themes.`;

  console.info("[AlbumJacket] Generating image...");
  console.time("[AlbumJacket] generateImages");
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
  console.timeEnd("[AlbumJacket] generateImages");

  const bytes = response?.generatedImages?.[0]?.image?.imageBytes;
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
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this performance sequence for a ${instrument}: ${JSON.stringify(eventLog.slice(0, 50))}.
    Determine a professional-sounding genre. 
    Create a COOL, ENERGETIC, and KID-SAFE track title (e.g., 'Neon Skyline', 'Electric Pulse', 'Solar Beat'). 
    CRITICAL: AVOID anything dark, mature, or abstract (No 'Void', 'Shadows', 'Echoes', 'Darkness').
    Suggest audio mixing settings.
    Return JSON.`,
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

/**
 * GENERATE STUDIO MUSIC (Streaming Pipeline)
 */
export async function* generateStudioMusicStream(
  recap: RecapData, 
  stats: SessionStats, 
  eventLog: PerformanceEvent[]
): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Limiting event log even further and simplifying labels to reduce TTS "complexity" error risk.
  const script = eventLog
    .slice(0, 45) // Reduced from 80 to 45
    .map(e => `${Math.round(e.timestamp)}ms:${e.sound.split(':')[1] || e.sound}`)
    .join(' ');

  const prompt = `Perform this musical score as high-fidelity audio:
  Instrument: ${stats.instrument}
  Genre: ${recap.genre}
  Score: ${script}
  
  Style: Upbeat, Professional, Studio-quality. No talking. Start audio immediately.`;

  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' }
          }
        }
      },
    });

    for await (const chunk of result) {
      const audioData = chunk.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (audioData) {
        yield audioData;
      }
    }
  } catch (err) {
    console.error("Studio stream generation failed:", err);
    throw err;
  }

}
