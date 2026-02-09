
import { GoogleGenAI, Type } from "@google/genai";
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, RecapData, MixingPreset, PerformanceEvent } from "./types_V2";
import { PRESET_ZONES } from "./constants_V2";

const getApiKey = () => {
  return process.env.API_KEY || import.meta.env.GEMINI_API_KEY || "";
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
  console.info(`[Blueprint] Starting generation for ${instrument}`);
  const start = performance.now();
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

  console.info(`[Blueprint] Generation completed in ${Math.round(performance.now() - start)}ms`);
  return JSON.parse(response.text.trim());
};

export const scanDrawing = async (instrument: InstrumentType, base64Image: string): Promise<HitZone[]> => {
  console.info(`[Scan] Starting scan for ${instrument}`);
  const start = performance.now();
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const pianoPrompt = `Detect ALL individual keys in this piano drawing (both white and black/sharps).
    Identify keys from left to right. Use standard note names (c4, c#4, d4, d#4, etc.).
    Provide accurate bounding boxes as percentages (0-100) of the image. Return JSON.`;
  const drumPrompt = `Analyze this hand-drawn drum kit. Identify kick, snare, toms, hi-hat, and crash.
    Provide accurate bounding boxes as percentages (0-100) of the image. Return JSON.`;
  const harpPrompt = `Analyze this hand-drawn harp. Identify strings from left to right as individual vertical strings (C, D, E, F, G, A, B).
    Strings should be vertical boxes. Provide bounding boxes as percentages (0-100) of the image. Return JSON.`;
  let prompt = instrument === 'Piano' ? pianoPrompt : drumPrompt;
  if (instrument === 'Harp') prompt = harpPrompt;

  const [meta, data] = base64Image.split(',');
  const mimeMatch = meta?.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';
  if (!data) {
    throw new Error('Invalid image data (missing base64 payload).');
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data, mimeType } },
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

  const zones = JSON.parse(response.text.trim());
  if (!Array.isArray(zones) || zones.length === 0) {
    throw new Error('No hit zones detected.');
  }
  console.info(`[Scan] Found ${zones.length} zones in ${Math.round(performance.now() - start)}ms`);
  if (instrument === 'Harp') {
    return zones.map((zone: HitZone) => {
      const raw = String(zone.sound || '').trim().toLowerCase();
      const base = raw.replace(/[^a-g0-9#]/g, '');
      const normalized = /^[a-g]$/.test(base) ? `${base}4` : base;
      const label = normalized.replace(/[^A-G#]/g, '').toUpperCase();
      return { ...zone, sound: normalized || 'c4', label: label || 'C' };
    });
  }
  if (instrument === 'Drum') {
    const preset = PRESET_ZONES['Drum'];
    if (preset?.length) {
      const shuffled = [...preset];
      for (let i = shuffled.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      return zones.map((zone: HitZone, idx: number) => {
        const sound = shuffled[idx % shuffled.length];
        return { ...zone, sound: sound.sound, label: sound.label };
      });
    }
  }
  return zones;
};

export const detectImageKeyword = async (base64Image: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const [meta, data] = base64Image.split(',');
  const mimeMatch = meta?.match(/data:(.*?);base64/);
  const mimeType = mimeMatch?.[1] || 'image/jpeg';
  if (!data) {
    return null;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: {
      parts: [
        { inlineData: { data, mimeType } },
        { text: "Look at this drawing and return one simple, kid-friendly object or theme (1-2 words). If none, return an empty string." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          keyword: { type: Type.STRING }
        },
        required: ["keyword"]
      }
    }
  });

  try {
    const result = JSON.parse(response.text.trim());
    const keyword = String(result?.keyword || '').trim();
    return keyword || null;
  } catch {
    return null;
  }
};

export const generateSessionRecap = async (stats: SessionStats): Promise<RecapData> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const intensityLabel = stats.intensity > 4 ? "Extremely High (Shredding/Rapid)" : 
                        stats.intensity > 1.5 ? "Moderate (Groovy/Rhythmic)" : "Low (Calm/Minimalist)";
  const varietyLabel = stats.uniqueNotesCount > 10 ? "Very High (Experimental/Orchestral)" :
                      stats.uniqueNotesCount > 4 ? "Good (Balanced)" : "Focused (Minimal)";

  const prompt = `Act as an encouraging, playful music buddy for a 6-year-old playing a paper ${stats.instrument}.
  PERFORMANCE DATA:
  - Duration: ${stats.durationSeconds}s
  - Intensity: ${intensityLabel}
  - Sound Variety: ${varietyLabel}
  
  TASK:
  1. Find 8 REAL, popular songs on YouTube Music that match this vibe.
  2. Keep recommendations diverse but still on-vibe: at least 6 distinct artists, no artist repeated more than once.
  3. For each song, get the EXACT YouTube Music URL and the REAL high-quality album art cover URL.
  4. Return a valid JSON object with: criticQuote, artistComparison, performanceStyle, and recommendedSongs.
  5. Make criticQuote one to two short, cheerful sentence (max 20 words), using simple kid-friendly language and exactly one emoji.
  6. Make artistComparison a short artist name only (1-3 words). Artist should not be controversial one. Include that artist as recommendedSongs[0].`;

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
  const normalizeArtist = (value: string | undefined) =>
    (value || '')
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

  if (recap?.recommendedSongs?.length) {
    const targetArtist = normalizeArtist(recap.artistComparison);
    if (targetArtist) {
      const idx = recap.recommendedSongs.findIndex((song: any) => {
        const artist = normalizeArtist(song?.artist);
        return artist && (artist.includes(targetArtist) || targetArtist.includes(artist));
      });
      if (idx > 0) {
        const [match] = recap.recommendedSongs.splice(idx, 1);
        recap.recommendedSongs.unshift(match);
      } else if (idx < 0) {
        // Option B: insert a new recommendation for the artistComparison
        recap.recommendedSongs.unshift({
          title: `${recap.artistComparison} Pick`,
          artist: recap.artistComparison,
          youtubeMusicUrl: `https://music.youtube.com/search?q=${encodeURIComponent(recap.artistComparison)}`,
          coverImageUrl: ''
        });
      }
    }
  }

  return recap;
};

export const generateAlbumJacket = async (stats: SessionStats, recap: RecapData): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const title = recap.trackTitle || "Doodle Symphony";
  const genre = recap.genre || "bright pop";
  const keyword = stats.jacketKeyword ? ` Include a playful ${stats.jacketKeyword} motif.` : "";
  const prompt = `Create a vibrant, kid-safe album cover for a ${genre} track titled "${title}". 
  The instrument is ${stats.instrument}. Use playful shapes, bold colors, and a polished studio look. 
  No dark or scary themes.${keyword}`;

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



export const generateMixSettings = async (
  eventLog: PerformanceEvent[],
  instrument: InstrumentType,
  jacketKeyword?: string
): Promise<{
  genre: string;
  trackTitle: string;
  mix: MixingPreset;
  extendedEventLog: PerformanceEvent[];
}> => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  const keywordNote = jacketKeyword ? ` Include the theme "${jacketKeyword}" in the title if it fits naturally.` : "";
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this performance sequence for a ${instrument}: ${JSON.stringify(eventLog.slice(0, 50))}.
    Determine a professional-sounding genre. 
    Create a COOL, ENERGETIC, and KID-SAFE track title (e.g., 'Neon Skyline', 'Electric Pulse', 'Solar Beat').${keywordNote}
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
