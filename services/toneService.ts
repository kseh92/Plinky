
import * as Tone from 'tone';
import { SOUND_MAP } from '../constants';

class ToneService {
  private drumPlayers: Tone.Players | null = null;
  private pianoSampler: Tone.Sampler | null = null;
  
  // Dedicated Synthesized Engines
  private kickSynth: Tone.MembraneSynth | null = null;
  private snareSynth: Tone.NoiseSynth | null = null;
  private hihatSynth: Tone.MetalSynth | null = null;
  private crashSynth: Tone.MetalSynth | null = null;
  private tomSynth: Tone.MembraneSynth | null = null;
  private pianoFallback: Tone.PolySynth | null = null;
  
  private recorder: Tone.Recorder | null = null;
  private initialized = false;
  private lastPlayTime = 0;

  async init() {
    if (this.initialized) return;
    
    try {
      await Tone.start();

      // 1. Kick: Deep and punchy
      this.kickSynth = new Tone.MembraneSynth({
        pitchDecay: 0.08,
        octaves: 5,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
      }).toDestination();

      // 2. Snare: Crisp white noise
      this.snareSynth = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
      }).toDestination();

      // 3. Toms: Resonant and pitch-varied
      this.tomSynth = new Tone.MembraneSynth({
        pitchDecay: 0.1,
        octaves: 4,
        oscillator: { type: 'square4' },
        envelope: { attack: 0.001, decay: 0.6, sustain: 0.01, release: 1.4 }
      }).toDestination();

      // 4. Cymbals: Metallic and bright
      this.hihatSynth = new Tone.MetalSynth({
        frequency: 250,
        envelope: { attack: 0.001, decay: 0.05, release: 0.05 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 6000,
        octaves: 1.5
      }).toDestination();

      this.crashSynth = new Tone.MetalSynth({
        frequency: 180,
        envelope: { attack: 0.001, decay: 1.2, release: 1.2 },
        harmonicity: 6.2,
        modulationIndex: 40,
        resonance: 4000,
        octaves: 1.2
      }).toDestination();

      // 5. Piano Fallback
      this.pianoFallback = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
      }).toDestination();

      // 6. Samples (Loading in background)
      this.drumPlayers = new Tone.Players({
        kick: SOUND_MAP.kick,
        snare: SOUND_MAP.snare,
        hihat: SOUND_MAP.hihat,
        tom: SOUND_MAP.tom,
        crash: SOUND_MAP.crash,
      }).toDestination();

      this.pianoSampler = new Tone.Sampler({
        urls: {
          'C4': 'C4.mp3',
          'D#4': 'Ds4.mp3',
          'F#4': 'Fs4.mp3',
          'A4': 'A4.mp3',
          'C5': 'C5.mp3'
        },
        baseUrl: 'https://tonejs.github.io/audio/salamander/',
      }).toDestination();

      this.recorder = new Tone.Recorder();
      Tone.getDestination().connect(this.recorder);
      
      this.initialized = true;
      console.log("Premium Audio Engine Initialized");
    } catch (err) {
      console.error("Audio Init Error:", err);
    }
  }

  private isValidNote(note: string): boolean {
    return /^[A-G][#b]?[0-9]$/i.test(note);
  }

  play(soundId: string | undefined | null) {
    if (!this.initialized || !soundId) return;
    
    const now = Tone.now();
    const triggerTime = Math.max(now, this.lastPlayTime + 0.005) + 0.03;
    this.lastPlayTime = triggerTime;

    const id = soundId.toLowerCase().trim();

    try {
      // --- DRUMS ---
      if (id.includes('kick') || id.includes('bass') || id.includes('pedal')) {
        this.drumPlayers?.player('kick').loaded ? this.drumPlayers.player('kick').start(triggerTime) : this.kickSynth?.triggerAttackRelease("C1", "8n", triggerTime);
        return;
      }
      if (id.includes('snare')) {
        this.drumPlayers?.player('snare').loaded ? this.drumPlayers.player('snare').start(triggerTime) : this.snareSynth?.triggerAttackRelease("16n", triggerTime);
        return;
      }
      if (id.includes('hihat') || id.includes('hi-hat')) {
        this.drumPlayers?.player('hihat').loaded ? this.drumPlayers.player('hihat').start(triggerTime) : this.hihatSynth?.triggerAttackRelease("32n", triggerTime, 0.6);
        return;
      }
      if (id.includes('crash') || id.includes('cymbal')) {
        this.drumPlayers?.player('crash').loaded ? this.drumPlayers.player('crash').start(triggerTime) : this.crashSynth?.triggerAttackRelease("4n", triggerTime, 0.9);
        return;
      }
      if (id.includes('tom')) {
        let pitch = id.includes('high') ? "G3" : id.includes('low') ? "G2" : "C3";
        this.tomSynth?.triggerAttackRelease(pitch, "16n", triggerTime);
        return;
      }

      // --- PIANO ---
      // Robust note mapping including sharps
      const noteMap: Record<string, string> = {
        'c4': 'C4', 'cs4': 'C#4', 'c#4': 'C#4', 'd4': 'D4', 'ds4': 'D#4', 'd#4': 'D#4', 'e4': 'E4', 
        'f4': 'F4', 'fs4': 'F#4', 'f#4': 'F#4', 'g4': 'G4', 'gs4': 'G#4', 'g#4': 'G#4', 'a4': 'A4', 'as4': 'A#4', 'a#4': 'A#4', 'b4': 'B4',
        'c5': 'C5', 'cs5': 'C#5', 'c#5': 'C#5', 'd5': 'D5', 'ds5': 'D#5', 'd#5': 'D#5', 'e5': 'E5', 
        'f5': 'F5', 'fs5': 'F#5', 'f#5': 'F#5', 'g5': 'G5', 'gs5': 'G#5', 'g#5': 'G#5', 'a5': 'A5', 'as5': 'A#5', 'a#5': 'A#5', 'b5': 'B5',
      };
      
      let note = noteMap[id];
      
      // Fallback for simple letter names
      if (!note) {
        const simpleMap: Record<string, string> = { 'c': 'C4', 'd': 'D4', 'e': 'E4', 'f': 'F4', 'g': 'G4', 'a': 'A4', 'b': 'B4' };
        note = simpleMap[id] || id.toUpperCase();
      }

      if (!this.isValidNote(note)) note = 'C4';

      if (this.pianoSampler?.loaded) {
        this.pianoSampler.triggerAttackRelease(note, '4n', triggerTime);
      } else {
        this.pianoFallback?.triggerAttackRelease(note, '4n', triggerTime);
      }
    } catch (e) {
      console.warn(`ToneService Error [${id}]:`, e);
    }
  }

  async startRecording() {
    if (this.recorder?.state !== 'started') {
      this.recorder?.start();
    }
  }

  async stopRecording() {
    if (this.recorder?.state === 'started') {
      try {
        await new Promise(r => setTimeout(r, 600));
        return await this.recorder.stop();
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  isReady() { return this.initialized; }
}

export const toneService = new ToneService();
