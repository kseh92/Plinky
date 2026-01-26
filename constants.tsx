
import { InstrumentType, HitZone } from './types';

export const INSTRUMENTS: { type: InstrumentType; icon: string; color: string }[] = [
  { type: 'Piano', icon: '🎹', color: 'bg-blue-400' },
  { type: 'Drum', icon: '🥁', color: 'bg-red-400' },
];

// No external URLs used. Synthesis IDs used for internal routing.
export const SOUND_MAP: Record<string, string> = {
  kick: 'synth_kick',
  snare: 'synth_snare',
  hihat: 'synth_hihat',
  tom_hi: 'synth_tom_hi',
  tom_mid: 'synth_tom_mid',
  tom_low: 'synth_tom_low',
  crash: 'synth_crash',
};

// Preset Coordinates for the provided reference images
export const TEMPLATE_IMAGES: Record<InstrumentType, string> = {
  'Piano': 'https://raw.githubusercontent.com/google-gemini/cookbook/main/samples/inputs/paper_instruments/piano_drawing.png',
  'Drum': 'https://raw.githubusercontent.com/google-gemini/cookbook/main/samples/inputs/paper_instruments/drum_drawing.png',
  'Guitar': ''
};

// Precisely mapped hit zones for the images provided
export const PRESET_ZONES: Record<InstrumentType, HitZone[]> = {
  'Piano': [
    // Octave 4 White Keys
    { sound: 'c4', label: 'C', x: 14.5, y: 34, width: 5.1, height: 44 },
    { sound: 'd4', label: 'D', x: 19.6, y: 34, width: 5.1, height: 44 },
    { sound: 'e4', label: 'E', x: 24.7, y: 34, width: 5.1, height: 44 },
    { sound: 'f4', label: 'F', x: 29.8, y: 34, width: 5.1, height: 44 },
    { sound: 'g4', label: 'G', x: 34.9, y: 34, width: 5.1, height: 44 },
    { sound: 'a4', label: 'A', x: 40.0, y: 34, width: 5.1, height: 44 },
    { sound: 'b4', label: 'B', x: 45.1, y: 34, width: 5.1, height: 44 },
    // Octave 5 White Keys
    { sound: 'c5', label: 'C', x: 50.2, y: 34, width: 5.1, height: 44 },
    { sound: 'd5', label: 'D', x: 55.3, y: 34, width: 5.1, height: 44 },
    { sound: 'e5', label: 'E', x: 60.4, y: 34, width: 5.1, height: 44 },
    { sound: 'f5', label: 'F', x: 65.5, y: 34, width: 5.1, height: 44 },
    { sound: 'g5', label: 'G', x: 70.6, y: 34, width: 5.1, height: 44 },
    { sound: 'a5', label: 'A', x: 75.7, y: 34, width: 5.1, height: 44 },
    { sound: 'b5', label: 'B', x: 80.8, y: 34, width: 5.1, height: 44 },
    // Octave 4 Sharps
    { sound: 'cs4', label: 'C#', x: 17.5, y: 34, width: 4, height: 26 },
    { sound: 'ds4', label: 'D#', x: 22.5, y: 34, width: 4, height: 26 },
    { sound: 'fs4', label: 'F#', x: 32.5, y: 34, width: 4, height: 26 },
    { sound: 'gs4', label: 'G#', x: 37.5, y: 34, width: 4, height: 26 },
    { sound: 'as4', label: 'A#', x: 42.5, y: 34, width: 4, height: 26 },
    // Octave 5 Sharps
    { sound: 'cs5', label: 'C#', x: 53.0, y: 34, width: 4, height: 26 },
    { sound: 'ds5', label: 'D#', x: 58.0, y: 34, width: 4, height: 26 },
    { sound: 'fs5', label: 'F#', x: 68.0, y: 34, width: 4, height: 26 },
    { sound: 'gs5', label: 'G#', x: 73.0, y: 34, width: 4, height: 26 },
    { sound: 'as5', label: 'A#', x: 78.0, y: 34, width: 4, height: 26 },
  ],
  'Drum': [
    { sound: 'kick', label: 'KICK', x: 38, y: 46, width: 24, height: 35 },
    { sound: 'snare', label: 'SNARE', x: 23, y: 41, width: 15, height: 20 },
    { sound: 'tom_low', label: 'FLOOR', x: 62, y: 41, width: 15, height: 20 },
    { sound: 'tom_hi', label: 'HI TOM', x: 37, y: 25, width: 13, height: 18 },
    { sound: 'tom_mid', label: 'MID TOM', x: 50, y: 25, width: 13, height: 18 },
    { sound: 'crash_l', label: 'CRASH L', x: 22, y: 11, width: 16, height: 20 },
    { sound: 'crash_r', label: 'CRASH R', x: 62, y: 11, width: 16, height: 20 },
  ],
  'Guitar': []
};
