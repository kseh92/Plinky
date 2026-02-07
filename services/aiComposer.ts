import { GoogleGenAI } from '@google/genai';
import { PerformanceEvent, SessionStats, RecapData } from '../types_V2';
import { base64ToUint8Array } from './lyriaStudio';

export interface ComposerConfig {
  apiKey: string;
  model?: string;
  onChunk: (chunk: Uint8Array) => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
}

export const estimateBpm = (events: PerformanceEvent[] | undefined) => {
  if (!events || events.length < 2) return 90;
  const timestamps = events.map((e) => e.timestamp).sort((a, b) => a - b);
  const intervals: number[] = [];
  for (let i = 1; i < timestamps.length; i += 1) {
    const delta = (timestamps[i] - timestamps[i - 1]) / 1000;
    if (delta > 0.05 && delta < 2.5) intervals.push(delta);
  }
  if (intervals.length === 0) return 90;
  intervals.sort((a, b) => a - b);
  const median = intervals[Math.floor(intervals.length / 2)];
  const bpm = Math.round(60 / median);
  return Math.min(Math.max(bpm, 60), 160);
};

export const buildWeightedPrompts = (recap: RecapData | null, stats: SessionStats | null) => {
  const instrument = stats?.instrument || 'instrument';
  const genre = recap?.genre ? `${recap.genre}` : 'cinematic pop';
  return [
    { text: `Instrumental ${genre} track led by ${instrument} with clear lead and no vocals`, weight: 1.0 },
    { text: 'Follow the lead rhythm and timing closely; add tasteful bassline and percussion that supports the performance', weight: 0.9 },
    { text: 'Polished studio mix, warm low end, crisp highs, dynamic but not harsh', weight: 0.7 }
  ];
};

export async function startLyriaComposer(
  stats: SessionStats,
  recap: RecapData,
  eventLog: PerformanceEvent[],
  config: ComposerConfig
) {
  const ai = new GoogleGenAI({ apiKey: config.apiKey, apiVersion: 'v1alpha' });
  const model = config.model || 'models/lyria-realtime-exp';

  const bpm = estimateBpm(eventLog);
  const notesPerSecond = stats.noteCount / Math.max(1, stats.durationSeconds || 1);
  const density = Math.min(Math.max(notesPerSecond / 6, 0.2), 0.9);
  const brightness = stats.instrument === 'Harp' ? 0.65 : 0.55;

  const live = await ai.live.music.connect({
    model,
    callbacks: {
      onmessage: (message: any) => {
        config.onMessage?.(message);
        const chunks = message?.serverContent?.audioChunks || [];
        chunks.forEach((chunk: any) => {
          const payload = chunk?.data ?? chunk?.bytes;
          if (typeof payload === 'string') {
            config.onChunk(base64ToUint8Array(payload));
          }
        });
      },
      onerror: (err: any) => {
        config.onError?.(err);
      },
      onclose: () => {
        config.onClose?.();
      }
    }
  });

  await live.setWeightedPrompts({ weightedPrompts: buildWeightedPrompts(recap, stats) });
  await live.setMusicGenerationConfig({
    musicGenerationConfig: {
      bpm,
      density,
      brightness,
      guidance: 4.5
    }
  });

  live.play();
  return live;
}
