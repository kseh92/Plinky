
import { PerformanceEvent, SessionStats, RecapData } from '../types_V2';
import { base64ToUint8Array, defaultLyriaWsUrl } from './lyriaStudio';

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

/**
 * Lyria RealTime requires the BidiGenerateMusic endpoint.
 * We combine weighted_prompts and music_generation_config into one setup message to prevent 'Invalid Argument' errors.
 */
export async function startLyriaComposer(
  stats: SessionStats,
  recap: RecapData,
  eventLog: PerformanceEvent[],
  config: ComposerConfig
) {
  const modelName = config.model || 'lyria-realtime-exp';
  const wsUrl = defaultLyriaWsUrl(modelName);
  
  if (!wsUrl) {
    throw new Error("Lyria WebSocket URL could not be determined. Check API Key.");
  }

  const bpm = estimateBpm(eventLog);
  const notesPerSecond = stats.noteCount / Math.max(1, stats.durationSeconds || 1);
  const density = Math.min(Math.max(notesPerSecond / 6, 0.2), 0.9);
  const brightness = stats.instrument === 'Harp' ? 0.65 : 0.55;

  return new Promise((resolve, reject) => {
    const socket = new WebSocket(wsUrl);
    
    const client = {
      stop: () => {
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      }
    };

    socket.onopen = () => {
      console.info('[Composer] Lyria WebSocket connected to', modelName);
      
      // Send single setup message with both prompts and generation config
      const setupMessage = {
        music_generation_config: {
          weighted_prompts: buildWeightedPrompts(recap, stats),
          bpm,
          density,
          brightness,
          guidance: 4.5,
          audio_format: 'AUDIO_PCM_16', // Standard enum naming
          sample_rate_hz: 48000
        }
      };

      socket.send(JSON.stringify(setupMessage));
      resolve(client);
    };

    socket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        config.onMessage?.(message);

        // Standard Bidi Audio Output fields
        const base64Data = message.server_content?.model_turn?.parts?.[0]?.inline_data?.data 
                         || message.audio_chunks?.[0]?.data;

        if (base64Data) {
          config.onChunk(base64ToUint8Array(base64Data));
        }
      } catch (err) {
        console.warn('[Composer] Failed to parse message', err);
      }
    };

    socket.onerror = (err) => {
      console.error('[Composer] WebSocket Error', err);
      config.onError?.(err);
      reject(err);
    };

    socket.onclose = () => {
      console.info('[Composer] Lyria WebSocket closed');
      config.onClose?.();
    };
  });
}
