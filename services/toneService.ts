
import * as Tone from 'tone';
import { MixingPreset, PerformanceEvent } from '../types_V2';

class ToneService {
  // Synthesized Engines
  private kick: Tone.MembraneSynth | null = null;
  private snare: Tone.NoiseSynth | null = null;
  private hihat: Tone.MetalSynth | null = null;
  private crash: Tone.MetalSynth | null = null;
  private tomHi: Tone.MembraneSynth | null = null;
  private tomMid: Tone.MembraneSynth | null = null;
  private tomLow: Tone.MembraneSynth | null = null;
  private piano: Tone.PolySynth | null = null;

  // Master FX Chain
  private masterEQ: Tone.EQ3 | null = null;
  private masterCompressor: Tone.Compressor | null = null;
  private masterDistortion: Tone.Distortion | null = null;
  private masterReverb: Tone.Reverb | null = null;
  private masterOutput: Tone.Gain | null = null;

  private recorder: Tone.Recorder | null = null;
  private initialized = false;
  private lastPlayTime = 0;
  
  // Tracking
  private _recordingStart = 0;
  private eventLog: PerformanceEvent[] = [];
  private scheduledEvents: number[] = [];

  async init() {
    if (this.initialized) return;
    
    try {
      await Tone.start();

      // Setup Master Chain
      this.masterEQ = new Tone.EQ3(0, 0, 0);
      this.masterCompressor = new Tone.Compressor(-24, 4);
      this.masterDistortion = new Tone.Distortion(0);
      this.masterReverb = new Tone.Reverb({ decay: 1.5, wet: 0.2 });
      this.masterOutput = new Tone.Gain(1);

      this.masterEQ.chain(
        this.masterDistortion, 
        this.masterCompressor, 
        this.masterReverb, 
        this.masterOutput, 
        Tone.getDestination()
      );

      const output = this.masterEQ;

      this.kick = new Tone.MembraneSynth({
        pitchDecay: 0.05, octaves: 6, oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.01, release: 1.4 }
      }).connect(output);

      this.snare = new Tone.NoiseSynth({
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
      }).connect(output);

      this.hihat = new Tone.MetalSynth({
        envelope: { attack: 0.001, decay: 0.05, release: 0.05 },
        harmonicity: 5.1, modulationIndex: 32, resonance: 4000, octaves: 1.5
      }).connect(output);
      if (this.hihat) this.hihat.frequency.value = 450;

      this.crash = new Tone.MetalSynth({
        envelope: { attack: 0.005, decay: 1.2, release: 1.2 },
        harmonicity: 6.5, modulationIndex: 40, resonance: 2500, octaves: 1.0
      }).connect(output);
      if (this.crash) this.crash.frequency.value = 200;

      this.tomHi = new Tone.MembraneSynth({
        pitchDecay: 0.03, octaves: 2.0, oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.18, sustain: 0.01, release: 0.08 }
      }).connect(output);

      this.tomMid = new Tone.MembraneSynth({
        pitchDecay: 0.04, octaves: 2.2, oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.22, sustain: 0.01, release: 0.10 }
      }).connect(output);

      this.tomLow = new Tone.MembraneSynth({
        pitchDecay: 0.05, octaves: 2.6, oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.28, sustain: 0.01, release: 0.12 }
      }).connect(output);

      this.piano = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
      }).connect(output);

      this.recorder = new Tone.Recorder();
      this.masterOutput.connect(this.recorder);
      
      this.initialized = true;
    } catch (err) {
      console.error("ToneService Init Error:", err);
    }
  }

  stopAll() {
    Tone.Transport.stop();
    Tone.Transport.cancel();
    this.scheduledEvents.forEach(id => Tone.getTransport().clear(id));
    this.scheduledEvents = [];
    
    // Hard silent release for all synths
    [this.kick, this.snare, this.hihat, this.crash, this.tomHi, this.tomMid, this.tomLow, this.piano].forEach(s => {
       if (s) s.releaseAll ? s.releaseAll() : null;
    });
  }

  applyMixingPreset(preset: MixingPreset) {
    if (!this.initialized) return;
    if (this.masterReverb) this.masterReverb.wet.value = preset.reverbAmount;
    if (this.masterCompressor) this.masterCompressor.threshold.value = preset.compressionThreshold;
    if (this.masterDistortion) this.masterDistortion.distortion = preset.distortionAmount;
    if (this.masterEQ) {
      this.masterEQ.low.value = preset.bassBoost;
      this.masterEQ.mid.value = preset.midBoost;
      this.masterEQ.high.value = preset.trebleBoost;
    }
  }

  private isValidNote(note: string): boolean {
    return /^[A-G][#b]?[0-9]$/i.test(note);
  }

  play(soundId: string | undefined | null, time?: number) {
    if (!this.initialized || !soundId) return;
    
    const triggerTime = time !== undefined ? time : Tone.now();
    const id = soundId.toLowerCase().trim();

    if (time === undefined && this._recordingStart > 0) {
      this.eventLog.push({
        timestamp: performance.now() - this._recordingStart,
        sound: id
      });
    }

    try {
      if (id.includes('kick') || id.includes('bass')) {
        this.kick?.triggerAttackRelease("C1", "8n", triggerTime);
      } else if (id.includes('snare')) {
        this.snare?.triggerAttackRelease("16n", triggerTime);
      } else if (id.includes('hihat') || id.includes('hi-hat')) {
        this.hihat?.triggerAttackRelease("32n", triggerTime, 0.4);
      } else if (id.includes('crash')) {
        const pitch = id.includes('_l') ? "C3" : "E3";
        this.crash?.triggerAttackRelease(pitch, "1n", triggerTime, 0.6);
      } else if (id.includes('tom')) {
        if (id.includes('hi')) {
          this.tomHi?.triggerAttackRelease(220, "16n", triggerTime);
        } else if (id.includes('mid')) {
          this.tomMid?.triggerAttackRelease(150, "16n", triggerTime);
        } else {
          this.tomLow?.triggerAttackRelease(95, "16n", triggerTime);
        }
      } else {
        const noteMap: Record<string, string> = {
          'c4': 'C4', 'cs4': 'C#4', 'c#4': 'C#4', 'd4': 'D4', 'ds4': 'D#4', 'd#4': 'D#4', 'e4': 'E4', 
          'f4': 'F4', 'fs4': 'F#4', 'f#4': 'F#4', 'g4': 'G4', 'gs4': 'G#4', 'g#4': 'G#4', 'a4': 'A4', 'as4': 'A#4', 'a#4': 'A#4', 'b4': 'B4',
          'c5': 'C5', 'cs5': 'C#5', 'c#5': 'C#5', 'd5': 'D5', 'ds5': 'D#5', 'd#5': 'D#5', 'e5': 'E5', 
          'f5': 'F5', 'fs5': 'F#5', 'f#5': 'F#5', 'g5': 'G5', 'gs5': 'G#5', 'g#5': 'G#5', 'a5': 'A5', 'as5': 'A#5', 'a#5': 'A#5', 'b5': 'B5',
        };
        let note = noteMap[id] || id.toUpperCase();
        if (!this.isValidNote(note)) note = 'C4';
        this.piano?.triggerAttackRelease(note, '2n', triggerTime);
      }
    } catch (e) {
      console.warn(`Playback Error [${id}]:`, e);
    }
  }

  async replayEventLog(log: PerformanceEvent[]) {
    this.stopAll();
    if (!this.initialized) await this.init();
    
    const now = Tone.now() + 0.1;
    Tone.getTransport().start();
    
    log.forEach(event => {
      const eventId = Tone.getTransport().schedule((time) => {
        this.play(event.sound, time);
      }, (event.timestamp / 1000));
      this.scheduledEvents.push(eventId);
    });
  }

  async startRecording() {
    if (this.recorder?.state !== 'started') {
      this.eventLog = [];
      this._recordingStart = performance.now();
      this.recorder?.start();
    }
  }

  async stopRecording(): Promise<{ blob: Blob; duration: number; eventLog: PerformanceEvent[] } | null> {
    if (this.recorder?.state === 'started') {
      try {
        await new Promise(r => setTimeout(r, 800));
        const blob = await this.recorder.stop();
        const duration = (performance.now() - this._recordingStart) / 1000;
        const log = [...this.eventLog];
        this._recordingStart = 0;
        return { blob, duration, eventLog: log };
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  isReady() { return this.initialized; }
}

export const toneService = new ToneService();
