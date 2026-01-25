
import { InstrumentType } from './types';

export const INSTRUMENTS: { type: InstrumentType; icon: string; color: string }[] = [
  { type: 'Piano', icon: '🎹', color: 'bg-blue-400' },
  { type: 'Drum', icon: '🥁', color: 'bg-red-400' },
];

export const SOUND_MAP: Record<string, string> = {
  // Using standard Tone.js sample locations
  kick: 'https://tonejs.github.io/audio/drum-samples/808/kick.mp3',
  snare: 'https://tonejs.github.io/audio/drum-samples/808/snare.mp3',
  hihat: 'https://tonejs.github.io/audio/drum-samples/808/hihat.mp3',
  tom: 'https://tonejs.github.io/audio/drum-samples/808/tom1.mp3',
  crash: 'https://tonejs.github.io/audio/drum-samples/808/cowbell.mp3',
};
