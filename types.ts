
export type InstrumentType = 'Drum' | 'Piano' | 'Guitar';

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
}

export interface RecapData {
  criticQuote: string;
  artistComparison: string;
  recommendedSong: {
    title: string;
    artist: string;
    youtubeMusicUrl: string;
  };
}
