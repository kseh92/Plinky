
import { GoogleGenAI, Modality, Type, GenerateContentResponse } from "@google/genai";
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, RecapData, PerformanceEvent, MixingPreset } from "./types";

export const generateBlueprint = async (instrument: InstrumentType): Promise<InstrumentBlueprint> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
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
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const pianoPrompt = `Detect ALL individual keys in this piano drawing (both white and black/sharps).
    Identify keys from left to right. Provide accurate bounding boxes. Return JSON.`;
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
  const intensityLabel = stats.intensity > 4 ? "High Energy" : 
                        stats.intensity > 1.5 ? "Groovy" : "Chill";

  const prompt = `Act as an enthusiastic and professional Music Producer reviewing a young talent's ${stats.instrument} session. 
  The session lasted ${stats.durationSeconds}s with a ${intensityLabel} vibe.
  
  TASK:
  - Create an encouraging, professional-sounding quote about their skill.
  - Compare them to a COOL, CLEAN, and POPULAR artist (e.g., Taylor Swift, Ed Sheeran, Bruno Mars, Coldplay, Dua Lipa).
  - Recommend 3 CLEAN (non-explicit) popular songs that have a similar vibe. These should be real radio hits, not nursery rhymes.
  
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
          performanceStyle: { type: Type.STRING },
          recommendedSongs: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                youtubeMusicUrl: { type: Type.STRING }
              },
              required: ["title", "artist", "youtubeMusicUrl"]
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
  
  const script = eventLog
    .slice(0, 80)
    .map(e => `${Math.round(e.timestamp)}ms: ${e.sound}`)
    .join(', ');

  const prompt = `You are a Professional AI Studio Producer for young talent.
  
  TASK: Perform a 30-second High-Fidelity Studio Master of this performance score.
  
  SCORE: [${script}]
  GENRE: ${recap.genre}
  STYLE: Professional, Energetic, Bright
  
  PERFORMANCE RULES:
  1. Follow the timing of the score exactly.
  2. Use high-quality, professional instruments (Modern Synths, Crisp Percussion, Electric Bass).
  3. The vibe should be upbeat and vibrant.
  4. ABSOLUTELY NO dark, moody, or explicit tones.
  
  OUTPUT RULES:
  - NO TALKING. NO SPEECH. 
  - ONLY INSTRUMENTAL MUSIC.
  - Start immediately.`;

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
    console.error("Stream synthesis failed:", err);
    throw err;
  }
}
