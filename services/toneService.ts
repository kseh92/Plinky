import * as Tone from 'tone';
<<<<<<< Updated upstream
import { MixingPreset, PerformanceEvent, InstrumentType } from './types';

class ToneService {
  // Drum Engines
  private kick: Tone.MembraneSynth | null = null;
  private snare: Tone.NoiseSynth | null = null;
  private hihat: Tone.MetalSynth | null = null;
  private crash: Tone.MetalSynth | null = null;
  private tomHi: Tone.MembraneSynth | null = null;
  private tomMid: Tone.MembraneSynth | null = null;
  private tomLow: Tone.MembraneSynth | null = null;
  
  // Melodic Engines
  private piano: Tone.PolySynth | null = null;
  private harp: Tone.PolySynth | null = null;
  private bassSynth: Tone.MonoSynth | null = null;
  private padSynth: Tone.PolySynth | null = null;

  // Master FX Chain
  private masterEQ: Tone.EQ3 | null = null;
  private masterCompressor: Tone.Compressor | null = null;
  private masterDistortion: Tone.Distortion | null = null;
  private masterReverb: Tone.Reverb | null = null;
  private masterLimiter: Tone.Limiter | null = null;
  private masterOutput: Tone.Gain | null = null;

  private recorder: Tone.Recorder | null = null;
  private initialized = false;
  
  // Tracking
  private _recordingStart = 0;
=======
import { PerformanceEvent, MixingPreset } from './types.ts';

class ToneService {
  private initialized = false;
  private recorder: Tone.Recorder | null = null;
  private startTime: number = 0;
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
      // Setup Master Chain
      this.masterEQ = new Tone.EQ3(0, 0, 0);
      this.masterCompressor = new Tone.Compressor({
        threshold: -24,
        ratio: 4,
        attack: 0.003,
        release: 0.25
      });
      this.masterDistortion = new Tone.Distortion(0);
      this.masterReverb = new Tone.Reverb({ decay: 2.5, wet: 0.2 });
      this.masterLimiter = new Tone.Limiter(-1); 
      this.masterOutput = new Tone.Gain(1);

      this.masterEQ.chain(
        this.masterDistortion, 
        this.masterCompressor, 
        this.masterReverb, 
        this.masterLimiter,
        this.masterOutput, 
        Tone.getDestination()
      );
=======
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
>>>>>>> Stashed changes

    this.recorder = new Tone.Recorder();
    Tone.Destination.connect(this.recorder);

<<<<<<< Updated upstream
      // --- Drums ---
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

      this.crash = new Tone.MetalSynth({
        envelope: { attack: 0.005, decay: 1.2, release: 1.2 },
        harmonicity: 6.5, modulationIndex: 40, resonance: 2500, octaves: 1.0
      }).connect(output);

      this.tomHi = new Tone.MembraneSynth({ pitchDecay: 0.03, octaves: 2 }).connect(output);
      this.tomMid = new Tone.MembraneSynth({ pitchDecay: 0.04, octaves: 2.2 }).connect(output);
      this.tomLow = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 2.6 }).connect(output);

      // --- Melodic ---
      // Tone.PolySynth requires a Monophonic class (Synth, FMSynth, AMSynth, etc.)
      // PluckSynth is often not compatible with PolySynth in some Tone.js versions.
      // We use FMSynth with plucky settings to simulate a Harp effectively.
      this.piano = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.02, decay: 0.1, sustain: 0.3, release: 1 }
      }).connect(output);
      this.piano.maxPolyphony = 32;

      this.harp = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 2,
        modulationIndex: 7,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 1.8 },
        modulationEnvelope: { attack: 0.002, decay: 0.2, sustain: 0, release: 0.2 }
      }).connect(output);
      this.harp.maxPolyphony = 48; // Harps need lots of ringing polyphony

      this.bassSynth = new Tone.MonoSynth({
        oscillator: { type: 'fmsquare' },
        envelope: { attack: 0.05, decay: 0.3, sustain: 0.4, release: 0.8 },
        filterEnvelope: { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.8, baseFrequency: 200, octaves: 2.6 }
      }).connect(output);

      this.padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.5, decay: 0.5, sustain: 1, release: 2 }
      }).connect(new Tone.Gain(0.3).connect(output)); 
      this.padSynth.maxPolyphony = 16;

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
    
    [this.kick, this.snare, this.hihat, this.crash, this.tomHi, this.tomMid, this.tomLow, this.piano, this.harp, this.bassSynth, this.padSynth].forEach(s => {
       if (s) {
         if ("releaseAll" in s) (s as any).releaseAll();
         else if ("triggerRelease" in s) (s as any).triggerRelease();
       }
    });
=======
    // CRITICAL: Wait for all buffers (like the piano sampler) to finish loading
    await Tone.loaded();

    this.initialized = true;
>>>>>>> Stashed changes
  }

  applyMixingPreset(preset: MixingPreset) {
    if (!this.initialized) return;

<<<<<<< Updated upstream
  private parseNote(note: string): string {
    const noteMap: Record<string, string> = {
      'c1': 'C1', 'cs1': 'C#1', 'd1': 'D1', 'ds1': 'D#1', 'e1': 'E1', 'f1': 'F1', 'fs1': 'F#1', 'g1': 'G1', 'gs1': 'G#1', 'a1': 'A1', 'as1': 'A#1', 'b1': 'B1', 'c2': 'C2',
      'c3': 'C3', 'cs3': 'C#3', 'd3': 'D3', 'ds3': 'D#3', 'e3': 'E3', 'f3': 'F3', 'fs3': 'F#3', 'g3': 'G3', 'gs3': 'G#3', 'a3': 'A3', 'as3': 'A#3', 'b3': 'B3',
      'c4': 'C4', 'cs4': 'C#4', 'd4': 'D4', 'ds4': 'D#4', 'e4': 'E4', 'f4': 'F4', 'fs4': 'F#4', 'g4': 'G4', 'gs4': 'G#4', 'a4': 'A4', 'as4': 'A#4', 'b4': 'B4',
      'c5': 'C5', 'cs5': 'C#5', 'd5': 'D5', 'ds5': 'D#5', 'e5': 'E5', 'f5': 'F5', 'fs5': 'F#5', 'g5': 'G5', 'gs5': 'G#5', 'a5': 'A5', 'as5': 'A#5', 'b5': 'B5',
      'c6': 'C6', 'd6': 'D6', 'e6': 'E6', 'f6': 'F6', 'g6': 'G6'
    };
    return noteMap[note.toLowerCase()] || note.toUpperCase();
  }

  play(soundId: string | undefined | null, time?: number, currentInstrument?: InstrumentType) {
    if (!this.initialized || !soundId) return;
    const triggerTime = time !== undefined ? time : Tone.now();
    const fullId = soundId.toLowerCase().trim();
    
    const parts = fullId.split(':');
    const prefix = parts.length > 1 ? parts[0] : null;
    const id = parts.length > 1 ? parts[1] : parts[0];

    if (time === undefined && this._recordingStart > 0) {
      this.eventLog.push({ timestamp: performance.now() - this._recordingStart, sound: fullId });
    }

    try {
      if (prefix === 'bass' || id.includes('bass')) {
        this.bassSynth?.triggerAttackRelease(this.parseNote(id), "4n", triggerTime);
      } else if (prefix === 'pad') {
        this.padSynth?.triggerAttackRelease(this.parseNote(id), "1n", triggerTime);
      } else if (currentInstrument === 'Harp' || id.startsWith('harp_')) {
        // Use triggerAttackRelease for PolySynths to ensure cleanup, even with long release.
        this.harp?.triggerAttackRelease(this.parseNote(id.replace('harp_', '')), "1n", triggerTime);
      } else if (prefix === 'drum' || id.includes('kick') || id.includes('snare') || id.includes('hihat') || id.includes('crash') || id.includes('tom')) {
        if (id.includes('kick')) this.kick?.triggerAttackRelease("C1", "8n", triggerTime);
        else if (id.includes('snare')) this.snare?.triggerAttackRelease("16n", triggerTime);
        else if (id.includes('hihat')) this.hihat?.triggerAttackRelease("32n", triggerTime, 0.4);
        else if (id.includes('crash')) this.crash?.triggerAttackRelease(id.includes('_l') ? "C3" : "E3", "1n", triggerTime, 0.6);
        else if (id.includes('tom')) {
           if (id.includes('hi')) this.tomHi?.triggerAttackRelease(220, "16n", triggerTime);
           else if (id.includes('mid')) this.tomMid?.triggerAttackRelease(150, "16n", triggerTime);
           else this.tomLow?.triggerAttackRelease(95, "16n", triggerTime);
        }
      } else {
        this.piano?.triggerAttackRelease(this.parseNote(id), '2n', triggerTime);
      }
    } catch (e) {
      console.warn(`Playback Error [${fullId}]:`, e);
    }
  }

  async replayEventLog(log: PerformanceEvent[]) {
    this.stopAll();
    if (!this.initialized) await this.init();
    Tone.getTransport().start();
    log.forEach(event => {
      const eventId = Tone.getTransport().schedule((time) => {
        this.play(event.sound, time);
      }, (event.timestamp / 1000));
      this.scheduledEvents.push(eventId);
    });
=======
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
>>>>>>> Stashed changes
  }

  async startRecording() {
    if (!this.initialized || !this.recorder) return;
    this.eventLog = [];
    this.startTime = Date.now();
    this.recorder.start();
  }

<<<<<<< Updated upstream
  async stopRecording(): Promise<{ blob: Blob; duration: number; eventLog: PerformanceEvent[] } | null> {
    if (this.recorder?.state === 'started') {
      try {
        await new Promise(r => setTimeout(r, 800));
        const blob = await this.recorder.stop();
        const duration = (performance.now() - this._recordingStart) / 1000;
        const log = [...this.eventLog];
        this._recordingStart = 0;
        return { blob, duration, eventLog: log };
      } catch (e) { return null; }
=======
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
>>>>>>> Stashed changes
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