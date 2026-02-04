import * as Tone from 'tone';
import { PerformanceEvent, MixingPreset } from './types';

class ToneService {
  private initialized = false;
  private recorder: Tone.Recorder | null = null;
  private startTime: number = 0;
  private eventLog: PerformanceEvent[] = [];
  
  // Synths
  private piano: Tone.Sampler | null = null;
  // Changed to any to avoid union type argument mismatch on triggerAttackRelease
  private drumKit: any = {};
  
  // Effects
  private reverb: Tone.Reverb | null = null;
  private compressor: Tone.Compressor | null = null;
  private distortion: Tone.Distortion | null = null;
  private eq: Tone.EQ3 | null = null;

  async init() {
    if (this.initialized) return;

    await Tone.start();
    
    // Setup Effects Chain
    this.reverb = new Tone.Reverb(0.5).toDestination();
    this.compressor = new Tone.Compressor(-24, 3).connect(this.reverb);
    this.distortion = new Tone.Distortion(0).connect(this.compressor);
    this.eq = new Tone.EQ3(0, 0, 0).connect(this.distortion);

    // Piano setup (Synthesized piano-ish sound for simplicity)
    this.piano = new Tone.Sampler({
      urls: {
        C4: "https://tonejs.github.io/audio/salamander/C4.mp3",
        "D#4": "https://tonejs.github.io/audio/salamander/Ds4.mp3",
        "F#4": "https://tonejs.github.io/audio/salamander/Fs4.mp3",
        A4: "https://tonejs.github.io/audio/salamander/A4.mp3",
      },
      release: 1,
    }).connect(this.eq);

    // Drum setup
    this.drumKit = {
      kick: new Tone.MembraneSynth({ envelope: { decay: 0.2 } }).connect(this.eq),
      snare: new Tone.NoiseSynth({ noise: { type: 'white' }, envelope: { decay: 0.1 } }).connect(this.eq),
      hihat: new Tone.MetalSynth({ envelope: { decay: 0.05 } }).connect(this.eq),
      crash: new Tone.MetalSynth({ envelope: { decay: 0.5 } }).connect(this.eq),
      tom: new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4 }).connect(this.eq)
    };

    this.recorder = new Tone.Recorder();
    Tone.Destination.connect(this.recorder);

    // CRITICAL: Wait for all buffers (like the piano sampler) to finish loading
    await Tone.loaded();

    this.initialized = true;
  }

  applyMixingPreset(preset: MixingPreset) {
    if (!this.initialized) return;

    const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);
    
    // Handle cases where AI might return percentages (0-100) instead of normalized (0-1)
    let rev = preset.reverbAmount;
    if (rev > 1) rev = rev / 100;
    
    let dist = preset.distortionAmount;
    if (dist > 1) dist = dist / 100;

    if (this.reverb) this.reverb.wet.value = clamp(rev, 0, 1);
    if (this.compressor) this.compressor.threshold.value = clamp(preset.compressionThreshold, -100, 0);
    if (this.distortion) this.distortion.distortion = clamp(dist, 0, 1);
    
    if (this.eq) {
      this.eq.low.value = clamp(preset.bassBoost, -20, 20);
      this.eq.mid.value = clamp(preset.midBoost, -20, 20);
      this.eq.high.value = clamp(preset.trebleBoost, -20, 20);
    }
  }

  async startRecording() {
    if (!this.initialized || !this.recorder) return;
    this.eventLog = [];
    this.startTime = Date.now();
    this.recorder.start();
  }

  async stopRecording(): Promise<{ blob: Blob, duration: number, eventLog: PerformanceEvent[] } | null> {
    if (!this.recorder || this.recorder.state !== 'started') return null;
    const duration = (Date.now() - this.startTime) / 1000;
    const blob = await this.recorder.stop();
    return { blob, duration, eventLog: [...this.eventLog] };
  }

  play(soundId: any) {
    if (!this.initialized || !soundId || soundId === "NaN") return;
    
    const sid = String(soundId);
    const timestamp = Date.now() - this.startTime;
    this.eventLog.push({ timestamp, sound: sid });

    // Routing logic
    // Updated regex to support # (standard Tone.js sharp notation)
    if (sid.match(/^[a-g][0-9#b]+$/i)) {
      if (this.piano && this.piano.loaded) {
        try {
          this.piano.triggerAttackRelease(sid.toUpperCase(), "8n");
        } catch (e) {
          console.warn("Sampler could not play note:", sid);
        }
      }
    } else {
      const drum = sid.toLowerCase();
      if (drum.includes('kick')) this.drumKit.kick.triggerAttackRelease("C1", "8n");
      else if (drum.includes('snare')) this.drumKit.snare.triggerAttackRelease("8n");
      else if (drum.includes('hihat')) this.drumKit.hihat.triggerAttackRelease("C3", "32n");
      else if (drum.includes('crash')) this.drumKit.crash.triggerAttackRelease("C4", "4n");
      else if (drum.includes('tom')) this.drumKit.tom.triggerAttackRelease("G2", "8n");
    }
  }

  replayEventLog(events: PerformanceEvent[]) {
    if (!this.initialized) return;
    events.forEach(event => {
      if (event && !isNaN(event.timestamp)) {
        setTimeout(() => {
          this.play(event.sound);
        }, event.timestamp);
      }
    });
  }

  stopAll() {
    Tone.Transport.stop();
  }
}

export const toneService = new ToneService();