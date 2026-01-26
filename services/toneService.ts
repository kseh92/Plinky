
import * as Tone from 'tone';

class ToneService {
  // Synthesized Engines
  private kick: Tone.MembraneSynth | null = null;
  private snare: Tone.NoiseSynth | null = null;
  private hihat: Tone.MetalSynth | null = null;
  private crash: Tone.MetalSynth | null = null;
  
  // Custom Triple Tom Set
  private tomHi: Tone.MembraneSynth | null = null;
  private tomMid: Tone.MembraneSynth | null = null;
  private tomLow: Tone.MembraneSynth | null = null;
  
  private piano: Tone.PolySynth | null = null;
  
  private recorder: Tone.Recorder | null = null;
  private initialized = false;
  private lastPlayTime = 0;

  async init() {
    if (this.initialized) return;
    
    try {
      await Tone.start();

      // 1. KICK: Deep "thump"
      this.kick = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 6,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
      }).toDestination();

      // 2. SNARE: Sharp snap
      this.snare = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
      }).toDestination();

      // 3. HI-HAT: Metallic chick
      this.hihat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.05, release: 0.05 },
        harmonicity: 5.1,
        modulationIndex: 32,
        resonance: 4000,
        octaves: 1.5
      }).toDestination();
      if (this.hihat) this.hihat.frequency.value = 450;

      // 4. CRASH: Shimmering brass
      this.crash = new Tone.MetalSynth({
        envelope: { attack: 0.005, decay: 1.2, release: 1.2 },
        harmonicity: 6.5,
        modulationIndex: 40,
        resonance: 2500,
        octaves: 1.0
      }).toDestination();
      if (this.crash) this.crash.frequency.value = 200;

      // 5. TOMS: High, Mid, Low specific settings
      this.tomHi = new Tone.MembraneSynth({
        pitchDecay: 0.03,
        octaves: 2.0,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.18, sustain: 0.01, release: 0.08 }
      }).toDestination();

      this.tomMid = new Tone.MembraneSynth({
        pitchDecay: 0.04,
        octaves: 2.2,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.22, sustain: 0.01, release: 0.10 }
      }).toDestination();

      this.tomLow = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 2.6,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.28, sustain: 0.01, release: 0.12 }
      }).toDestination();

      // 6. PIANO: Polyphonic synth
      this.piano = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
      }).toDestination();

      this.recorder = new Tone.Recorder();
      Tone.getDestination().connect(this.recorder);
      
      this.initialized = true;
      console.log("Audio Engine Ready: Customized Triple-Tom Engine Active.");
    } catch (err) {
      console.error("ToneService Init Error:", err);
    }
  }

  private isValidNote(note: string): boolean {
    return /^[A-G][#b]?[0-9]$/i.test(note);
  }

  play(soundId: string | undefined | null) {
    if (!this.initialized || !soundId) return;
    
    const now = Tone.now();
    const triggerTime = Math.max(now, this.lastPlayTime + 0.005);
    this.lastPlayTime = triggerTime;

    const id = soundId.toLowerCase().trim();

    try {
      if (id.includes('kick') || id.includes('bass')) {
        this.kick?.triggerAttackRelease("C1", "8n", triggerTime);
        return;
      }
      if (id.includes('snare')) {
        this.snare?.triggerAttackRelease("16n", triggerTime);
        return;
      }
      if (id.includes('hihat') || id.includes('hi-hat')) {
        this.hihat?.triggerAttackRelease("32n", triggerTime, 0.4);
        return;
      }
      if (id.includes('crash')) {
        const pitch = id.includes('_l') ? "C3" : "E3";
        this.crash?.triggerAttackRelease(pitch, "1n", triggerTime, 0.6);
        return;
      }
      
      // Triple Tom Routing
      if (id.includes('tom')) {
        if (id.includes('hi')) {
          this.tomHi?.triggerAttackRelease(220, "16n", triggerTime);
        } else if (id.includes('mid')) {
          this.tomMid?.triggerAttackRelease(150, "16n", triggerTime);
        } else {
          // Low tom or Floor tom
          this.tomLow?.triggerAttackRelease(95, "16n", triggerTime);
        }
        return;
      }

      // Piano Notes
      const noteMap: Record<string, string> = {
        'c4': 'C4', 'cs4': 'C#4', 'c#4': 'C#4', 'd4': 'D4', 'ds4': 'D#4', 'd#4': 'D#4', 'e4': 'E4', 
        'f4': 'F4', 'fs4': 'F#4', 'f#4': 'F#4', 'g4': 'G4', 'gs4': 'G#4', 'g#4': 'G#4', 'a4': 'A4', 'as4': 'A#4', 'a#4': 'A#4', 'b4': 'B4',
        'c5': 'C5', 'cs5': 'C#5', 'c#5': 'C#5', 'd5': 'D5', 'ds5': 'D#5', 'd#5': 'D#5', 'e5': 'E5', 
        'f5': 'F5', 'fs5': 'F#5', 'f#5': 'F#5', 'g5': 'G5', 'gs5': 'G#5', 'g#5': 'G#5', 'a5': 'A5', 'as5': 'A#5', 'a#5': 'A#5', 'b5': 'B5',
      };
      
      let note = noteMap[id] || id.toUpperCase();
      if (!this.isValidNote(note)) note = 'C4';

      this.piano?.triggerAttackRelease(note, '2n', triggerTime);
    } catch (e) {
      console.warn(`Playback Error [${id}]:`, e);
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
        // Short delay to capture the ring out of the last note
        await new Promise(r => setTimeout(r, 800));
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
