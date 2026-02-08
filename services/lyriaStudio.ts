export type WeightedPrompt = { text: string; weight?: number };

export interface LyriaStartPayload {
  weightedPrompts: WeightedPrompt[];
  musicGenerationConfig: {
    bpm: number;
    density: number;
    brightness: number;
    guidance: number;
    audioFormat: 'PCM_16' | 'pcm16' | string;
    sampleRateHz: number;
  };
}

export const defaultLyriaWsUrl = () => {
  const apiKey = process.env.API_KEY || import.meta.env.GEMINI_API_KEY || "";
  if (!apiKey) return '';
  return `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateMusic?key=${apiKey}`;
};

export const base64ToUint8Array = (base64: string) => {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
};

export const concatUint8Arrays = (chunks: Uint8Array[]) => {
  const totalLength = chunks.reduce((sum, c) => sum + c.length, 0);
  const out = new Uint8Array(totalLength);
  let offset = 0;
  chunks.forEach((c) => {
    out.set(c, offset);
    offset += c.length;
  });
  return out;
};

export const encodeWavFromPcm16 = (pcmData: Uint8Array, sampleRate: number, channels: number) => {
  const bytesPerSample = 2;
  const blockAlign = channels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = pcmData.length;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i += 1) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // PCM chunk size
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, channels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // bits per sample
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  new Uint8Array(buffer, 44).set(pcmData);
  return buffer;
};
