
import React, { useState, useRef } from 'react';
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, PerformanceEvent } from './types';
import { INSTRUMENTS, PRESET_ZONES } from './constants';
import { generateBlueprint, scanDrawing } from './geminiService';
import BlueprintDisplay from './components/BlueprintDisplay';
import CameraScanner from './components/CameraScanner';
import InstrumentPlayer from './components/InstrumentPlayer';
import ResultScreen from './components/ResultScreen';

const App: React.FC = () => {
  const [step, setStep] = useState<'pick' | 'blueprint' | 'provide' | 'scan' | 'play' | 'result'>('pick');
  const [selectedType, setSelectedType] = useState<InstrumentType | null>(null);
  const [blueprint, setBlueprint] = useState<InstrumentBlueprint | null>(null);
  const [hitZones, setHitZones] = useState<HitZone[]>([]);
  const [recording, setRecording] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);

  const handlePick = (type: InstrumentType) => {
    setSelectedType(type);
    setStep('provide');
  };

  const handleShowBlueprint = async () => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const bp = await generateBlueprint(selectedType);
      setBlueprint(bp);
      setStep('blueprint');
    } catch (err) {
      setError("Oops! Gemini is busy. Try again?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = () => {
    if (!selectedType) return;
    setHitZones(PRESET_ZONES[selectedType]);
    setStep('play');
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      handleCapture(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleCapture = async (base64: string) => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const zones = await scanDrawing(selectedType, base64);
      setHitZones(zones);
      setStep('play');
    } catch (err) {
      setError("We couldn't read your drawing. Make sure it's bright and clear!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishedPlaying = (blob: Blob | null, stats: { noteCount: number; uniqueNotes: Set<string>; duration: number; eventLog: PerformanceEvent[] }) => {
    const roundedDuration = Math.max(1, Math.round(stats.duration));
    if (selectedType) {
      setSessionStats({
        instrument: selectedType,
        durationSeconds: roundedDuration,
        noteCount: stats.noteCount,
        uniqueNotesCount: stats.uniqueNotes.size,
        intensity: stats.noteCount / stats.duration,
        eventLog: stats.eventLog
      });
    }
    setRecording(blob);
    setStep('result');
  };

  const reset = () => {
    setStep('pick');
    setBlueprint(null);
    setSelectedType(null);
    setHitZones([]);
    setRecording(null);
    setSessionStats(null);
  };

  return (
    <div className="min-h-screen p-6 md:p-12 flex flex-col items-center">
      <header className="mb-12 text-center">
        <h1 className="text-5xl md:text-7xl text-blue-600 mb-2">Paper Instruments</h1>
        <p className="text-xl text-blue-400 font-semibold tracking-wide uppercase">Draw • Upload • Play</p>
      </header>

      {error && (
        <div className="bg-red-100 border-2 border-red-200 text-red-600 p-4 rounded-2xl mb-8 flex items-center gap-3 animate-bounce">
          <span>⚠️ {error}</span>
        </div>
      )}

      {step === 'pick' && (
        <div className="flex flex-wrap md:flex-nowrap justify-center gap-8 w-full max-w-5xl">
          {INSTRUMENTS.map((inst) => (
            <button
              key={inst.type}
              onClick={() => handlePick(inst.type)}
              className={`${inst.color} p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2 flex flex-col items-center min-w-[220px] md:min-w-0 flex-1`}
            >
              <span className="text-7xl mb-4" role="img" aria-label={inst.type}>{inst.icon}</span>
              <span className="text-2xl font-bold text-white uppercase tracking-wider">{inst.type}</span>
            </button>
          ))}
        </div>
      )}

      {step === 'provide' && selectedType && (
        <div className="flex flex-col items-center gap-8 w-full max-w-2xl">
          <h2 className="text-3xl font-bold text-blue-800 text-center">Ready to play your {selectedType}?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
            <button
              onClick={() => setStep('scan')}
              className="bg-white border-4 border-blue-400 p-8 rounded-3xl shadow-lg hover:bg-blue-50 transition-colors flex flex-col items-center gap-4"
            >
              <span className="text-5xl">📷</span>
              <span className="font-bold text-blue-600">Scan Paper Drawing</span>
            </button>
            
            <button
              onClick={handleQuickStart}
              className="bg-yellow-400 border-4 border-yellow-600 p-8 rounded-3xl shadow-lg hover:bg-yellow-300 transition-colors flex flex-col items-center gap-4 group"
            >
              <span className="text-5xl group-hover:scale-110 transition-transform">⚡</span>
              <span className="font-bold text-yellow-900">Instant Demo Mode</span>
              <span className="text-xs text-yellow-800 opacity-60">Use pre-baked hit zones</span>
            </button>
          </div>

          <div className="w-full h-px bg-gray-200 my-4" />

          <div className="flex flex-col items-center gap-4">
            <label className="cursor-pointer text-green-600 font-bold hover:underline">
              <input 
                type="file" 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileUpload}
              />
              📁 Upload an image instead
            </label>

            <button
              onClick={handleShowBlueprint}
              className="text-blue-500 font-bold hover:underline"
            >
              Wait, I need a blueprint guide!
            </button>
          </div>
          
          <button onClick={reset} className="text-gray-400 font-bold uppercase tracking-widest text-sm">Cancel</button>
        </div>
      )}

      {step === 'blueprint' && blueprint && (
        <div className="flex flex-col items-center gap-8 w-full">
          <BlueprintDisplay blueprint={blueprint} />
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setStep('scan')}
              className="px-12 py-5 bg-blue-500 text-white rounded-full text-xl font-black shadow-xl hover:bg-blue-600 transition-all"
            >
              OPEN CAMERA 📸
            </button>
            <button
              onClick={handleQuickStart}
              className="px-12 py-5 bg-yellow-500 text-white rounded-full text-xl font-black shadow-xl hover:bg-yellow-600 transition-all"
            >
              TRY DEMO ⚡
            </button>
          </div>
          <button onClick={reset} className="text-gray-400 font-bold uppercase tracking-widest text-sm">Back to Start</button>
        </div>
      )}

      {step === 'scan' && (
        <div className="w-full flex flex-col items-center gap-6">
          <h2 className="text-2xl font-bold text-blue-800">Scan Your Paper</h2>
          <CameraScanner onCapture={handleCapture} isScanning={isLoading} />
          <button onClick={() => setStep('provide')} className="text-gray-400 font-bold uppercase tracking-widest text-sm">Go Back</button>
        </div>
      )}

      {step === 'play' && hitZones.length > 0 && selectedType && (
        <InstrumentPlayer instrumentType={selectedType} hitZones={hitZones} onExit={handleFinishedPlaying} />
      )}

      {step === 'result' && (
        <ResultScreen recording={recording} onRestart={reset} stats={sessionStats} />
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <div className="w-20 h-20 border-8 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-2xl font-bold text-blue-600 animate-pulse text-center px-4">
            {step === 'pick' || step === 'provide' ? 'Preparing the blueprint...' : 'Gemini is reading your drawing...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
