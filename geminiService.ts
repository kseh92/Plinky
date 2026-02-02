
import { GoogleGenAI, Type } from "@google/genai";
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, RecapData, MixingPreset, PerformanceEvent } from "./types";

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
  const intensityLabel = stats.intensity > 4 ? "Extremely High (Shredding/Rapid)" : 
                        stats.intensity > 1.5 ? "Moderate (Groovy/Rhythmic)" : "Low (Calm/Minimalist)";
  const varietyLabel = stats.uniqueNotesCount > 10 ? "Very High (Experimental/Orchestral)" :
                      stats.uniqueNotesCount > 4 ? "Good (Balanced)" : "Focused (Minimal)";

  const prompt = `Act as an encouraging music critic for a kid playing a paper ${stats.instrument}.
  PERFORMANCE DATA:
  - Duration: ${stats.durationSeconds}s
  - Intensity: ${intensityLabel}
  - Sound Variety: ${varietyLabel}
  
  Return JSON with criticQuote, artistComparison, performanceStyle, and 3 recommendedSongs. Link to YouTube Music.`;

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

export const generateMixSettings = async (events: PerformanceEvent[], instrument: string): Promise<{ 
  mix: MixingPreset, 
  genre: string, 
  trackTitle: string,
  extendedEventLog: PerformanceEvent[]
}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const eventSummary = events.slice(0, 30).map(e => `${e.sound}@${Math.round(e.timestamp)}ms`).join(', ');

  const prompt = `You are a world-class Music Producer and Orchestrator. 
  The user performed on a paper ${instrument}. 
  Rhythm/Style DNA: [${eventSummary}].
  
  TASK:
  1. Identify a sophisticated Genre (e.g. Dream Pop, Lo-fi Hip Hop, Synthwave, Modern Jazz).
  2. Orchestrate a FULL BAND 60-second arrangement (100-150 events).
  3. SOUND PALETTE (Use these prefixes):
     - drum: [kick, snare, hihat, crash_l, crash_r, tom_hi, tom_mid, tom_low]
     - bass: [c1, cs1, d1, ds1, e1, f1, fs1, g1, gs1, a1, as1, b1, c2] (Deep bass)
     - keys: [c4, d4, e4, f4, g4, a4, b4, c5] (Piano/Lead)
     - pad: [c3, e3, g3, b3] (Atmospheric background chords)
     
  STRUCTURE:
  - 0-15s: Build up (Atmospheric Pads + light percussion)
  - 15-45s: Main Groove (Bassline + Full Drums + Chords)
  - 45-60s: Climax and Outro.
     
  Return JSON with genre, trackTitle, mix settings, and the orchestrated event log "log" with objects {t: timestamp_ms, s: sound_id}.`;

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
