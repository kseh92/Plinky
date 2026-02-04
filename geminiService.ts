import { GoogleGenAI, Type } from "@google/genai";
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, RecapData, MixingPreset, PerformanceEvent } from "./types";

export const generateBlueprint = async (instrument: InstrumentType): Promise<InstrumentBlueprint> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a "blueprint" for a hand-drawn ${instrument}. 
    Drum parts: kick, snare, hihat, crash, high tom, mid tom, floor tom.
    Piano notes: c4, d4, e4, f4, g4, a4, b4, c5. Use '#' for sharps if needed (e.g. c#4).
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
  const pianoPrompt = `Detect ALL individual keys in this piano drawing (both white and black/sharps).
    Identify keys from left to right. Use standard note names (c4, c#4, d4, d#4, etc.).
    Provide accurate bounding boxes. Return JSON.`;
  const drumPrompt = `Analyze this hand-drawn drum kit. Identify kick, snare, toms, hi-hat, and crash. Return JSON.`;
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const intensityLabel = stats.intensity > 4 ? "Extremely High (Shredding/Rapid)" : 
                        stats.intensity > 1.5 ? "Moderate (Groovy/Rhythmic)" : "Low (Calm/Minimalist)";
  const varietyLabel = stats.uniqueNotesCount > 10 ? "Very High (Experimental/Orchestral)" :
                      stats.uniqueNotesCount > 4 ? "Good (Balanced)" : "Focused (Minimal)";

  const prompt = `Use Google Search Grounding to act as an encouraging music critic for a kid playing a paper ${stats.instrument}.
  PERFORMANCE DATA:
  - Duration: ${stats.durationSeconds}s
  - Intensity: ${intensityLabel}
  - Sound Variety: ${varietyLabel}
  
  TASK:
  1. Find 3 REAL, popular songs on YouTube Music that match this vibe.
  2. For each song, get the EXACT YouTube Music URL and the REAL high-quality album art cover URL.
  3. Return a valid JSON object with: criticQuote, artistComparison, performanceStyle, and recommendedSongs.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      tools: [{ googleSearch: {} }],
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
  const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (groundingChunks) {
    recap.groundingChunks = groundingChunks;
  }

  return recap;
};

export const generateAlbumJacket = async (stats: SessionStats, recap: RecapData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A vibrant, high-quality child-drawn album cover for a music track titled "${recap.trackTitle || 'My Jam'}". 
  The album is for a ${stats.instrument} performance in the genre of ${recap.genre || 'Magic Pop'}. 
  Style: ${recap.performanceStyle}. 
  Artistic details: hand-drawn crayon scribbles, bright colors, stars, musical notes, and a cute interpretation of a ${stats.instrument}. 
  Vibe: Energetic, fun, and magical. 
  The words "${recap.trackTitle || 'PLINKY'}" should be visible in messy, playful letters.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  
  throw new Error("Failed to generate jacket image");
};

export const generateMixSettings = async (events: PerformanceEvent[], instrument: string): Promise<{ 
  mix: MixingPreset, 
  genre: string, 
  trackTitle: string,
  extendedEventLog: PerformanceEvent[]
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const eventSummary = events.slice(0, 30).map(e => `${e.sound}@${Math.round(e.timestamp)}ms`).join(', ');

  const prompt = `You are a professional Music Producer. 
  The user played a ${instrument}. Their rhythm DNA (first 30 events): [${eventSummary}].
  
  TASK:
  1. Identify Genre.
  2. Define Mix.
  3. CREATE A 60-SECOND STUDIO ARRANGEMENT.
     
  Return JSON. For the log, use key "log" with objects {t: timestamp_ms, s: sound_id}.`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
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
          log: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                t: { type: Type.NUMBER },
                s: { type: Type.STRING }
              },
              required: ["t", "s"]
            }
          }
        },
        required: ["genre", "trackTitle", "mix", "log"]
      }
    }
  });

  const raw = JSON.parse(response.text.trim());
  return {
    mix: raw.mix,
    genre: raw.genre,
    trackTitle: raw.trackTitle,
    extendedEventLog: raw.log.map((e: any) => ({ timestamp: e.t, sound: e.s }))
  };
};