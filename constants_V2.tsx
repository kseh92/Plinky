import React from 'react';
import { InstrumentType, HitZone } from './types_V2';

// --- Doodle Icons ---

export const DoodlePiano = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 35C15 30 20 28 85 32C90 33 92 38 90 85C90 92 85 94 15 90C10 89 8 85 15 35Z" fill="white" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
    <path d="M30 34V88M45 35V89M60 36V90M75 37V91" stroke="#1e3a8a" strokeWidth="3" strokeLinecap="round" />
    <path d="M25 34V60H35V34H25Z" fill="#1e3a8a" stroke="#1e3a8a" strokeWidth="1" />
    <path d="M40 35V61H50V35H40Z" fill="#1e3a8a" stroke="#1e3a8a" strokeWidth="1" />
    <path d="M55 36V62H65V36H55Z" fill="#1e3a8a" stroke="#1e3a8a" strokeWidth="1" />
    <path d="M70 37V63H80V37H70Z" fill="#1e3a8a" stroke="#1e3a8a" strokeWidth="1" />
  </svg>
);

export const DoodleDrum = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="50" cy="35" rx="38" ry="12" fill="#fff" stroke="#991b1b" strokeWidth="4" />
    <path d="M12 35V75C12 85 50 92 88 75V35" fill="#ef4444" stroke="#991b1b" strokeWidth="4" strokeLinejoin="round" />
    <path d="M25 25L45 38M75 25L55 38" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
  </svg>
);

export const DoodleHarp = () => (
  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M25 15C35 5 75 15 85 85L25 85V15Z" fill="#10b981" fillOpacity="0.2" stroke="#065f46" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M25 15V85" stroke="#065f46" strokeWidth="6" strokeLinecap="round" />
    <path d="M35 18V85M45 20V85M55 25V85M65 35V85M75 55V85" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export const INSTRUMENTS: { type: InstrumentType; icon: React.ReactNode; color: string }[] = [
  { type: 'Piano', icon: <DoodlePiano />, color: 'bg-blue-400' },
  { type: 'Drum', icon: <DoodleDrum />, color: 'bg-red-400' },
  { type: 'Harp', icon: <DoodleHarp />, color: 'bg-emerald-400' },
];

export const getInstrumentIcon = (type: string) => {
  switch (type) {
    case 'Piano': return <DoodlePiano />;
    case 'Drum': return <DoodleDrum />;
    case 'Harp': return <DoodleHarp />;
    default: return <DoodlePiano />;
  }
};

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
  'Guitar': '',
  'Harp': 'https://raw.githubusercontent.com/google-gemini/cookbook/main/samples/inputs/paper_instruments/piano_drawing.png'
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
    { sound: 'c#4', label: 'C#', x: 17.5, y: 34, width: 4, height: 26 },
    { sound: 'd#4', label: 'D#', x: 22.5, y: 34, width: 4, height: 26 },
    { sound: 'f#4', label: 'F#', x: 32.5, y: 34, width: 4, height: 26 },
    { sound: 'g#4', label: 'G#', x: 37.5, y: 34, width: 4, height: 26 },
    { sound: 'a#4', label: 'A#', x: 42.5, y: 34, width: 4, height: 26 },
    // Octave 5 Sharps
    { sound: 'c#5', label: 'C#', x: 53.0, y: 34, width: 4, height: 26 },
    { sound: 'd#5', label: 'D#', x: 58.0, y: 34, width: 4, height: 26 },
    { sound: 'f#5', label: 'F#', x: 68.0, y: 34, width: 4, height: 26 },
    { sound: 'g#5', label: 'G#', x: 73.0, y: 34, width: 4, height: 26 },
    { sound: 'a#5', label: 'A#', x: 78.0, y: 34, width: 4, height: 26 },
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
  'Guitar': [],
  'Harp': [
    { sound: 'c4', label: 'C', x: 20, y: 15, width: 2.5, height: 70 },
    { sound: 'd4', label: 'D', x: 25, y: 15, width: 2.5, height: 70 },
    { sound: 'e4', label: 'E', x: 30, y: 15, width: 2.5, height: 70 },
    { sound: 'f4', label: 'F', x: 35, y: 15, width: 2.5, height: 70 },
    { sound: 'g4', label: 'G', x: 40, y: 15, width: 2.5, height: 70 },
    { sound: 'a4', label: 'A', x: 45, y: 15, width: 2.5, height: 70 },
    { sound: 'b4', label: 'B', x: 50, y: 15, width: 2.5, height: 70 },
    { sound: 'c5', label: 'C', x: 55, y: 15, width: 2.5, height: 70 },
    { sound: 'd5', label: 'D', x: 60, y: 15, width: 2.5, height: 70 },
    { sound: 'e5', label: 'E', x: 65, y: 15, width: 2.5, height: 70 },
    { sound: 'f5', label: 'F', x: 70, y: 15, width: 2.5, height: 70 },
    { sound: 'g5', label: 'G', x: 75, y: 15, width: 2.5, height: 70 },
  ]
};
