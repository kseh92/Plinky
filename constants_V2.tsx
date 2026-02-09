import React from 'react';
import { InstrumentType, HitZone } from './types.ts';

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

export interface PresetKey {
  note: string;
  color: string;
  rect: { x: number; y: number; w: number; h: number };
  isBlack?: boolean;
}

export const PIANO_KEYS: PresetKey[] = [
  { note: 'c4', color: '#93c5fd', rect: { x: 0.145, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'd4', color: '#93c5fd', rect: { x: 0.196, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'e4', color: '#93c5fd', rect: { x: 0.247, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'f4', color: '#93c5fd', rect: { x: 0.298, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'g4', color: '#93c5fd', rect: { x: 0.349, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'a4', color: '#93c5fd', rect: { x: 0.4, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'b4', color: '#93c5fd', rect: { x: 0.451, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'c5', color: '#93c5fd', rect: { x: 0.502, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'd5', color: '#93c5fd', rect: { x: 0.553, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'e5', color: '#93c5fd', rect: { x: 0.604, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'f5', color: '#93c5fd', rect: { x: 0.655, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'g5', color: '#93c5fd', rect: { x: 0.706, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'a5', color: '#93c5fd', rect: { x: 0.757, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'b5', color: '#93c5fd', rect: { x: 0.808, y: 0.34, w: 0.051, h: 0.44 } },
  { note: 'c#4', color: '#1f2937', rect: { x: 0.175, y: 0.34, w: 0.04, h: 0.26 }, isBlack: true },
  { note: 'd#4', color: '#1f2937', rect: { x: 0.225, y: 0.34, w: 0.04, h: 0.26 }, isBlack: true },
  { note: 'f#4', color: '#1f2937', rect: { x: 0.325, y: 0.34, w: 0.04, h: 0.26 }, isBlack: true },
  { note: 'g#4', color: '#1f2937', rect: { x: 0.375, y: 0.34, w: 0.04, h: 0.26 }, isBlack: true },
  { note: 'a#4', color: '#1f2937', rect: { x: 0.425, y: 0.34, w: 0.04, h: 0.26 }, isBlack: true },
  { note: 'c#5', color: '#1f2937', rect: { x: 0.53, y: 0.34, w: 0.04, h: 0.26 }, isBlack: true },
  { note: 'd#5', color: '#1f2937', rect: { x: 0.58, y: 0.34, w: 0.04, h: 0.26 }, isBlack: true },
  { note: 'f#5', color: '#1f2937', rect: { x: 0.68, y: 0.34, w: 0.04, h: 0.26 }, isBlack: true },
  { note: 'g#5', color: '#1f2937', rect: { x: 0.73, y: 0.34, w: 0.04, h: 0.26 }, isBlack: true },
  { note: 'a#5', color: '#1f2937', rect: { x: 0.78, y: 0.34, w: 0.04, h: 0.26 }, isBlack: true }
];

export const HARP_STRINGS: PresetKey[] = [
  { note: 'c4', color: '#22d3ee', rect: { x: 0.2, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'd4', color: '#a78bfa', rect: { x: 0.25, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'e4', color: '#fbbf24', rect: { x: 0.3, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'f4', color: '#34d399', rect: { x: 0.35, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'g4', color: '#22d3ee', rect: { x: 0.4, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'a4', color: '#a78bfa', rect: { x: 0.45, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'b4', color: '#fbbf24', rect: { x: 0.5, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'c5', color: '#34d399', rect: { x: 0.55, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'd5', color: '#22d3ee', rect: { x: 0.6, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'e5', color: '#a78bfa', rect: { x: 0.65, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'f5', color: '#fbbf24', rect: { x: 0.7, y: 0.15, w: 0.025, h: 0.7 } },
  { note: 'g5', color: '#34d399', rect: { x: 0.75, y: 0.15, w: 0.025, h: 0.7 } }
];

export const XYLOPHONE_BARS: PresetKey[] = [
  { note: 'c4', color: '#f87171', rect: { x: 0.20, y: 0.45, w: 0.073, h: 0.30 } },
  { note: 'd4', color: '#fb923c', rect: { x: 0.30, y: 0.43, w: 0.073, h: 0.28 } },
  { note: 'e4', color: '#fbbf24', rect: { x: 0.40, y: 0.29, w: 0.073, h: 0.26 } },
  { note: 'f4', color: '#34d399', rect: { x: 0.50, y: 0.50, w: 0.073, h: 0.24 } },
  { note: 'g4', color: '#60a5fa', rect: { x: 0.60, y: 0.58, w: 0.073, h: 0.26 } },
  { note: 'a4', color: '#a78bfa', rect: { x: 0.70, y: 0.43, w: 0.073, h: 0.28 } },
  { note: 'b4', color: '#f472b6', rect: { x: 0.80, y: 0.30, w: 0.073, h: 0.28 } }
];

// Precisely mapped hit zones for the images provided
export const PRESET_ZONES: Record<InstrumentType, HitZone[]> = {
  'Piano': PIANO_KEYS.map((k) => ({
    sound: k.note,
    label: k.note.replace('4', '').replace('5', '').toUpperCase(),
    x: k.rect.x * 100,
    y: k.rect.y * 100,
    width: k.rect.w * 100,
    height: k.rect.h * 100
  })),
  'Drum': [
    { sound: 'kick', label: 'KICK', x: 38, y: 46, width: 24, height: 35 },
    { sound: 'snare', label: 'SNARE', x: 23, y: 41, width: 15, height: 20 },
    { sound: 'tom_low', label: 'FLOOR', x: 62, y: 41, width: 15, height: 20 },
    { sound: 'tom_hi', label: 'HI TOM', x: 37, y: 25, width: 13, height: 18 },
    { sound: 'tom_mid', label: 'MID TOM', x: 50, y: 25, width: 13, height: 18 },
    { sound: 'crash_l', label: 'CRASH L', x: 22, y: 11, width: 16, height: 20 },
    { sound: 'crash_r', label: 'CRASH R', x: 62, y: 11, width: 16, height: 20 }
  ],
  'Guitar': [],
  'Harp': HARP_STRINGS.map((s) => ({
    sound: s.note,
    label: s.note.toUpperCase(),
    x: s.rect.x * 100,
    y: s.rect.y * 100,
    width: s.rect.w * 100,
    height: s.rect.h * 100
  }))
};
