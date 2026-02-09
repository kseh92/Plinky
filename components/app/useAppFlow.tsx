
// src/app/useAppFlow.ts
import * as React from 'react';
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, PerformanceEvent, AppMode } from '../../services/types.ts';
import { PRESET_ZONES } from '../../services/constants';
import { generateBlueprint, scanDrawing, detectImageKeyword, generateInstrumentOverlay, generateInstrumentTexture } from '../../services/geminiService';

export type Step =
  | 'landing' | 'pick' | 'provide' | 'scan' | 'confirmScan' | 'play' | 'result' | 'blueprint'
  | 'story' | 'gallery' | 'settings' | 'yourJam' | 'explore' | 'explorePreset';

export function useAppFlow() {
  const [step, setStep] = React.useState<Step>('landing');
  const [selectedType, setSelectedType] = React.useState<InstrumentType | null>(null);
  const [exploreMode, setExploreMode] = React.useState<AppMode | null>(null);
  const [exploreOverlayUrl, setExploreOverlayUrl] = React.useState<string | null>(null);
  const [exploreTextureUrl, setExploreTextureUrl] = React.useState<string | null>(null);
  const [exploreOverlayLoading, setExploreOverlayLoading] = React.useState(false);
  const [blueprint, setBlueprint] = React.useState<InstrumentBlueprint | null>(null);
  const [hitZones, setHitZones] = React.useState<HitZone[]>([]);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [recording, setRecording] = React.useState<Blob | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionStats, setSessionStats] = React.useState<SessionStats | null>(null);
  const [jacketKeyword, setJacketKeyword] = React.useState<string | null>(null);
  const [showDebugHud, setShowDebugHud] = React.useState(false);

  const extractKeywordFromName = (name: string) => {
    const cleaned = name.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
    const tokens = cleaned.split(/\s+/).filter(Boolean);
    const stop = new Set(['with', 'and', 'the', 'a', 'an', 'of', 'for', 'to', 'my', 'your', 'paper']);
    const instrumentWords = new Set(['piano', 'drum', 'drums', 'harp', 'guitar']);
    const keyword = tokens.find(t => !stop.has(t) && !instrumentWords.has(t));
    return keyword || null;
  };

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
    const lower = name.toLowerCase();
    const mode =
      lower.includes('drum') || lower.includes('drums')
        ? AppMode.DRUM
        : lower.includes('xylophone')
          ? AppMode.XYLOPHONE
          : lower.includes('harp')
            ? AppMode.HARP
            : AppMode.PIANO;
    setExploreMode(mode);
    setSelectedType(name);
    setJacketKeyword(extractKeywordFromName(name));
    setExploreOverlayUrl(null);
    setExploreTextureUrl(null);
    setExploreOverlayLoading(true);
    setStep('explorePreset');
    Promise.all([
      generateInstrumentOverlay(name, mode).catch((err) => {
        console.error('[Overlay] Generation failed', err);
        return null;
      }),
      generateInstrumentTexture(name).catch((err) => {
        console.error('[Texture] Generation failed', err);
        return null;
      })
    ])
      .then(([overlay, texture]) => {
        if (overlay) setExploreOverlayUrl(overlay);
        if (texture) setExploreTextureUrl(texture);
      })
      .finally(() => setExploreOverlayLoading(false));
  };

  const handlePickPreset = (mode: AppMode, name: string) => {
    setExploreMode(mode);
    setSelectedType(name);
    setJacketKeyword(extractKeywordFromName(name));
    setCapturedImage(null);
    setHitZones([]);
    setRecording(null);
    setSessionStats(null);
    setError(null);
    setExploreOverlayUrl(null);
    setExploreTextureUrl(null);
    setExploreOverlayLoading(false);
    setStep('explorePreset');
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
    setJacketKeyword(null);
    setStep('play');
  };

  const handleCapture = async (base64: string) => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const timeoutMs = 60000;
      const zones = await Promise.race([
        scanDrawing(selectedType, base64),
        new Promise<never>((_, reject) =>
          window.setTimeout(() => reject(new Error('Scan timed out.')), timeoutMs)
        )
      ]);
      if (!zones.length) {
        throw new Error('No zones detected.');
      }
      setHitZones(zones);
      setCapturedImage(base64);
      try {
        const keyword = await Promise.race([
          detectImageKeyword(base64),
          new Promise<null>((resolve) => window.setTimeout(() => resolve(null), 5000))
        ]);
        setJacketKeyword(keyword);
      } catch {
        setJacketKeyword(null);
      }
      setStep('confirmScan');
    } catch (err) {
      console.error("Scan Error:", err);
      const fallback = PRESET_ZONES[selectedType] || PRESET_ZONES['Piano'];
      if (fallback?.length) {
        setHitZones(fallback);
        setCapturedImage(base64);
        setJacketKeyword(null);
        setStep('confirmScan');
      } else {
        setError('Make sure your drawing is clear and has enough light!');
      }
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
        eventLog: stats.eventLog,
        jacketKeyword: jacketKeyword || undefined
      });
    }
    setRecording(blob);
    setStep('result');
  };

  const goHome = () => {
    setStep('landing');
    setSelectedType(null);
    setCapturedImage(null);
    setJacketKeyword(null);
    setExploreMode(null);
    setExploreOverlayUrl(null);
    setExploreTextureUrl(null);
    setExploreOverlayLoading(false);
  };

  return {
    step, setStep,
    selectedType, blueprint, hitZones, capturedImage, recording, exploreMode,
    exploreOverlayUrl, exploreTextureUrl, exploreOverlayLoading,
    isLoading, error, sessionStats,
    showDebugHud, setShowDebugHud,
    handlePick, handleCreateCustom, handlePickPreset,
    handleOpenPreset: handlePickPreset,
    handleShowBlueprint, handleQuickStart,
    handleCapture, handleConfirmZones, handleFinishedPlaying,
    goHome
  };
}
