
// src/app/useAppFlow.ts
import * as React from 'react';
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, PerformanceEvent } from '../../services/types.ts';
import { PRESET_ZONES } from '../../services/constants';
import { generateBlueprint, scanDrawing } from '../../services/geminiService';

export type Step =
  | 'landing' | 'pick' | 'provide' | 'scan' | 'confirmScan' | 'play' | 'result' | 'blueprint'
  | 'story' | 'gallery' | 'settings' | 'yourJam' | 'explore';

export function useAppFlow() {
  const [step, setStep] = React.useState<Step>('landing');
  const [selectedType, setSelectedType] = React.useState<InstrumentType | null>(null);
  const [blueprint, setBlueprint] = React.useState<InstrumentBlueprint | null>(null);
  const [hitZones, setHitZones] = React.useState<HitZone[]>([]);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [recording, setRecording] = React.useState<Blob | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionStats, setSessionStats] = React.useState<SessionStats | null>(null);

  // Handle side effects on step change
  React.useEffect(() => {
    // Landscape mode management
    if (step === 'scan' || step === 'play') {
      document.body.classList.add('needs-landscape');
    } else {
      document.body.classList.remove('needs-landscape');
    }
    
    // BUG FIX: Clear any existing error messages whenever the user moves to a new screen.
    // This prevents the "Make sure your drawing is clear" message from persisting
    // once the user has decided to navigate away or retry a different path.
    setError(null);

    return () => document.body.classList.remove('needs-landscape');
  }, [step]);

  const handlePick = (type: InstrumentType) => {
    setSelectedType(type);
    setStep('provide');
  };

  const handleCreateCustom = (name: string) => {
    setSelectedType(name);
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
    } catch {
      setError('Gemini is composing... try again!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = () => {
    if (!selectedType) return;
    const zones = PRESET_ZONES[selectedType] || PRESET_ZONES['Piano'];
    setHitZones(zones);
    setCapturedImage(null); // No background image for quick start
    setStep('play');
  };

  const handleCapture = async (base64: string) => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const zones = await scanDrawing(selectedType, base64);
      setHitZones(zones);
      setCapturedImage(base64);
      setStep('confirmScan');
    } catch (err) {
      console.error("Scan Error:", err);
      setError('Make sure your drawing is clear and has enough light!');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmZones = () => {
    setStep('play');
  };

  const handleFinishedPlaying = (
    blob: Blob | null,
    stats: { noteCount: number; uniqueNotes: Set<string>; duration: number; eventLog: PerformanceEvent[] }
  ) => {
    if (selectedType) {
      setSessionStats({
        instrument: selectedType,
        durationSeconds: Math.round(stats.duration),
        noteCount: stats.noteCount,
        uniqueNotesCount: stats.uniqueNotes.size,
        intensity: stats.noteCount / (stats.duration || 1),
        eventLog: stats.eventLog
      });
    }
    setRecording(blob);
    setStep('result');
  };

  const goHome = () => {
    setStep('landing');
    setSelectedType(null);
    setCapturedImage(null);
  };

  return {
    step, setStep,
    selectedType, blueprint, hitZones, capturedImage, recording,
    isLoading, error, sessionStats,
    handlePick, handleCreateCustom,
    handleShowBlueprint, handleQuickStart,
    handleCapture, handleConfirmZones, handleFinishedPlaying,
    goHome
  };
}
