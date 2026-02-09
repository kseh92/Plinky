
export type InstrumentType = 'Drum' | 'Piano' | 'Guitar' | 'Harp' | string;

export enum AppMode {
  PIANO = 'PIANO',
  XYLOPHONE = 'XYLOPHONE',
  HARP = 'HARP'
}

export interface PerformanceEvent {
  timestamp: number; // ms relative to recording start
  sound: string;
}

export interface MixingPreset {
  reverbAmount: number; // 0 to 1
  compressionThreshold: number; // -100 to 0
  bassBoost: number; // dB
  midBoost: number; // dB
  trebleBoost: number; // dB
  distortionAmount: number; // 0 to 1
}

export interface BlueprintShape {
  type: 'circle' | 'rect';
  id: string;
  label: string;
  x: number; // 0-100
  y: number; // 0-100
  width?: number; // for rect
  height?: number; // for rect
  radius?: number; // for circle
  sound: string;
}

export interface HitZone {
  sound: string;
  label: string;
  x: number; // 0-100 relative to image
  y: number; 
  width: number;
  height: number;
}

export interface InstrumentBlueprint {
  instrument: InstrumentType;
  shapes: BlueprintShape[];
  description: string;
}

export interface SessionStats {
  instrument: InstrumentType;
  durationSeconds: number;
  noteCount: number;
  uniqueNotesCount: number;
  intensity: number; // notes per second
  eventLog?: PerformanceEvent[];
  jacketKeyword?: string;
}

export interface RecommendedTrack {
  title: string;
  artist: string;
  youtubeMusicUrl: string;
  coverImageUrl: string;
}

export interface RecapData {
  criticQuote: string;
  artistComparison: string;
  performanceStyle: string;
  recommendedSongs: RecommendedTrack[];
  mixingSuggestion?: MixingPreset;
  genre?: string;
  trackTitle?: string;
  extendedEventLog?: PerformanceEvent[];
  personalJacketUrl?: string; // AI Generated album cover for the child
}
