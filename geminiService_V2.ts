import { GoogleGenAI, Type, Modality } from "@google/genai";
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, RecapData, MixingPreset, PerformanceEvent } from "./types_V2";

export const generateBlueprint = async (instrument: InstrumentType): Promise<InstrumentBlueprint> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create a "blueprint" for a hand-drawn ${instrument}. Return JSON.`,
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
  const prompt = `Analyze this hand-drawn ${instrument}. Identify hit zones. Return JSON.`;
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
  const prompt = `Act as an encouraging music producer for a kid playing a ${stats.instrument}. 
  The tone should be professional and inspiring (use words like 'cadence', 'timbre', 'harmonic balance'). Avoid "babyish" language.
  Find REAL popular songs on YouTube Music that match this vibe.
  Ensure 'trackTitle' is cool (e.g., 'Static Fire', 'Neon Horizon') and strictly kid-safe (G/PG). 
  Return JSON.`;
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
  return JSON.parse(response.text.trim());
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
    contents: `Analyze this performance sequence for a ${instrument}: ${JSON.stringify(eventLog.slice(0, 100))}.
    Determine a professional-sounding genre. 
    Create a COOL, ENERGETIC, and KID-SAFE track title (e.g., 'Neon Skyline', 'Electric Pulse', 'Solar Beat'). 
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

export const generateAlbumJacket = async (stats: SessionStats, recap: RecapData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `A professional, cinematic album cover art for a track titled "${recap.trackTitle || 'Neon Beat'}". 
  Style: Modern ${recap.genre || 'Pop'}, vibrant production art, strictly kid-safe (G/PG). No text on the image.`;
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: "1:1" } }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  throw new Error("Failed to generate jacket");
};

/**
 * GENERATE STUDIO MUSIC (Instrumental Soundscape Synthesis)
 * Optimized for stability to prevent RPC::CANCELLED errors.
 */
export async function* generateStudioMusicStream(
  recap: RecapData, 
  stats: SessionStats, 
  eventLog: PerformanceEvent[]
): AsyncGenerator<string> {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Condense the rhythm into a short "Beat Map" to keep the prompt length manageable
  const beatMap = eventLog
    .filter((_, i) => i % 4 === 0) // Down-sample significantly for prompt stability
    .slice(0, 30)
    .map(e => e.sound.split(':')[1] || e.sound)
    .join(' ');

  // Instrumental-only prompt using Kore (which has a rich synthesized texture capability)
  const prompt = `Perform a 30-second High-Fidelity Instrumental Soundscape.
  
  GENRE: ${recap.genre}
  TRACK TITLE: "${recap.trackTitle}"
  RHYTHM SEED: ${beatMap}

  REQUIRED AUDIO PERFORMANCE:
  1. This is a STRICTLY INSTRUMENTAL track. No human voices. No beatboxing.
  2. Use your synthesis engine to mimic high-end studio gear.
  3. Include a deep, analog kick drum and a crisp, electronic snare.
  4. Layer cinematic synthesizer pads and a resonant bassline.
  5. The tempo is a driving 124 BPM.
  6. SUSTAIN the musical energy for exactly 30 seconds.
  
  IMPORTANT: START GENERATING AUDIO IMMEDIATELY. NO SPEECH. NO WORDS. JUST THE INSTRUMENTAL MASTER.`;

  try {
    const result = await ai.models.generateContentStream({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' } // Kore provides the best texture for "electronic music" trickery
          }
        },
      },
    });

    let chunkReceived = false;
    for await (const chunk of result) {
      const part = chunk.candidates?.[0]?.content?.parts?.[0];
      const audioData = part?.inlineData?.data;
      if (audioData) {
        chunkReceived = true;
        yield audioData;
      }
    }

    if (!chunkReceived) {
      throw new Error("The AI engine was unable to synthesize instrumental audio for this performance.");
    }
  } catch (err: any) {
    console.error("Studio stream generation failed:", err);
    throw err;
  }
}
