import React, { useMemo, useEffect, useState, useRef } from 'react';
import { SessionStats, RecapData, PerformanceEvent } from '../../services/types';
import { generateSessionRecap, generateMixSettings, generateAlbumJacket } from '../../services/geminiService';
import { toneService } from '../../services/toneService';
import { concatUint8Arrays, encodeWavFromPcm16 } from '../../services/lyriaStudio';
import { filterPlayableTracks } from '../../services/youtubeAvailability';
import { startLyriaComposer } from '../../services/aiComposer';
import RecapCard from './RecapCard_V2';

interface Props {
  recording: Blob | null;
  onRestart: () => void;
  stats: SessionStats | null;
}

const PersonalJacket: React.FC<{ imageUrl: string, title: string, genre: string }> = ({ imageUrl, title, genre }) => {
  return (
    <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-700 w-full max-w-full overflow-visible">
      <div className="relative group w-full flex justify-center">
        {/* Glow Effect */}
        <div className="absolute -inset-6 md:-inset-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-sky-400 rounded-[4rem] blur-3xl opacity-40 group-hover:opacity-70 transition-opacity animate-pulse"></div>
        
        {/* Main Cover Container - Significantly Bigger */}
        <div className="relative w-full aspect-square max-w-[360px] md:max-w-[760px] bg-[#282828] rounded-[3.5rem] md:rounded-[6rem] overflow-hidden border-[12px] md:border-[32px] border-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] transform hover:scale-[1.02] transition-transform duration-500">
          <img src={imageUrl} alt="AI Generated Jacket" className="w-full h-full object-cover" />
          
          {/* Text Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-8 left-8 right-8 md:bottom-16 md:left-16 md:right-16">
             <p className="text-white font-black text-3xl md:text-5xl uppercase tracking-tighter truncate drop-shadow-2xl mb-1 md:mb-3">{title}</p>
             <p className="text-sky-300 font-black text-base md:text-2xl uppercase tracking-widest opacity-95 drop-shadow-md">{genre}</p>
          </div>
        </div>

        {/* Playful Sticker Badge - Scaled up */}
        <div className="absolute -top-6 -right-6 md:-top-12 md:-right-12 bg-yellow-400 text-[#1e3a8a] w-24 h-24 md:w-48 md:h-48 rounded-full flex items-center justify-center font-black text-[12px] md:text-2xl uppercase tracking-tighter text-center leading-none p-4 shadow-2xl rotate-12 border-4 md:border-[12px] border-white animate-bounce">
          Doodle Master!
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm px-10 py-4 rounded-full border-4 border-white shadow-xl -rotate-1">
         <span className="text-sm md:text-lg font-black text-[#1e3a8a] uppercase tracking-[0.4em]">✨ Legendary AI Collection ✨</span>
      </div>
    </div>
  );
};

const ResultScreen: React.FC<Props> = ({ recording, onRestart, stats }) => {
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [isRecapLoading, setIsRecapLoading] = useState(false);
  const [accurateDuration, setAccurateDuration] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const [isMixing, setIsMixing] = useState(false);
  const [recapStage, setRecapStage] = useState<string>('');
  const [recapError, setRecapError] = useState<string | null>(null);
  const [recapErrorDetails, setRecapErrorDetails] = useState<string | null>(null);
  const hasRecapRef = useRef(false);

  // Studio Mix states
  const [isComposing, setIsComposing] = useState(false);
  const [studioMixBlob, setStudioMixBlob] = useState<Blob | null>(null);
  const [composerProgress, setComposerProgress] = useState(0);
  const [composerError, setComposerError] = useState<string | null>(null);
  const composerChunksRef = useRef<Uint8Array[]>([]);
  const composerLiveRef = useRef<any>(null);
  const composerTimerRef = useRef<number | null>(null);
  const composerStoppingRef = useRef(false);

  const audioUrl = useMemo(() => {
    if (!recording) return null;
    return URL.createObjectURL(recording);
  }, [recording]);

  const studioMixUrl = useMemo(() => {
    if (!studioMixBlob) return null;
    return URL.createObjectURL(studioMixBlob);
  }, [studioMixBlob]);

  useEffect(() => {
    if (!audioUrl) {
      setIsMeasuring(false);
      return;
    }
    const tempAudio = new Audio(audioUrl);
    const handleLoadedMetadata = () => {
      if (tempAudio.duration === Infinity) {
        tempAudio.currentTime = 1e10;
        tempAudio.ontimeupdate = () => {
          tempAudio.ontimeupdate = null;
          setAccurateDuration(Math.round(tempAudio.duration));
          tempAudio.currentTime = 0;
          setIsMeasuring(false);
        };
      } else {
        setAccurateDuration(Math.round(tempAudio.duration));
        setIsMeasuring(false);
      }
    };
    tempAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
    const timer = setTimeout(() => { if (isMeasuring) { setAccurateDuration(stats?.durationSeconds || 0); setIsMeasuring(false); } }, 2000);
    return () => { tempAudio.removeEventListener('loadedmetadata', handleLoadedMetadata); clearTimeout(timer); };
  }, [audioUrl, stats]);

  useEffect(() => {
    if (hasRecapRef.current) return;
    const fetchAIAssistance = async () => {
      if (!stats || isMeasuring || accurateDuration === null) return;
      hasRecapRef.current = true;
      setIsRecapLoading(true);
      setIsMixing(true);
      setRecapStage('Generating recap...');
      setRecapError(null);
      setRecapErrorDetails(null);
      try {
        const start = performance.now();
        console.info('[Result] Recap generation started');

        const recapPromise = generateSessionRecap({
          ...stats,
          durationSeconds: accurateDuration,
          intensity: stats.noteCount / (accurateDuration || 1)
        });

        setRecapStage('Analyzing mix...');
        const mixPromise = generateMixSettings(stats.eventLog || [], stats.instrument, stats.jacketKeyword);

        const recapData = await recapPromise;
        console.info('[Result] Recap data received');
        const finalRecap: RecapData = { ...recapData };

        try {
          const mixData = await mixPromise;
          console.info('[Result] Mix settings received');
          finalRecap.genre = mixData.genre;
          finalRecap.trackTitle = mixData.trackTitle;
          finalRecap.mixingSuggestion = mixData.mix;
          finalRecap.extendedEventLog = mixData.extendedEventLog;
          toneService.applyMixingPreset(mixData.mix);
        } catch (err) {
          console.warn('[Result] Mix settings generation failed', err);
        }

        try {
          setRecapStage('Checking YouTube Music availability...');
          finalRecap.recommendedSongs = await filterPlayableTracks(finalRecap.recommendedSongs || []);
          console.info('[Result] Availability check complete');
        } catch (err) {
          console.warn('[Result] Availability check failed', err);
        }

        // Show recap ASAP; jacket loads lazily after recap is visible.
        setRecap(finalRecap);
        console.info('[Result] Recap rendered');

        try {
          setRecapStage('Generating album jacket...');
          const jacketUrl = await generateAlbumJacket({ ...stats }, finalRecap);
          finalRecap.personalJacketUrl = jacketUrl;
          setRecap({ ...finalRecap });
          console.info('[Result] Album jacket received');
        } catch (err) {
          console.warn('[Result] Album jacket generation failed', err);
        }

        console.info(`[Result] Recap flow finished in ${Math.round(performance.now() - start)}ms`);
      } catch (err: any) {
        console.error("Studio processing failed", err);
        const details =
          err?.message ||
          err?.toString?.() ||
          (typeof err === 'object' ? JSON.stringify(err) : String(err));
        setRecapError("Recap generation failed. Please try again.");
        setRecapErrorDetails(details);
      } finally {
        setIsRecapLoading(false); 
        setIsMixing(false); 
        setRecapStage('');
      }
    };
    fetchAIAssistance();
  }, [stats, accurateDuration, isMeasuring]);

  const handleDownloadOriginal = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `session_${recap?.trackTitle || 'raw'}.webm`;
    a.click();
  };

  const handleDownloadStudio = () => {
    if (!studioMixUrl) return;
    const a = document.createElement('a');
    a.href = studioMixUrl;
    a.download = `studio_${recap?.trackTitle || 'mix'}.wav`;
    a.click();
  };

  const handleShare = async () => {
    const title = recap?.trackTitle || 'My Studio Mix';
    const text = `Check out my studio mix: ${title}`;
    const shareUrl = studioMixUrl || audioUrl || window.location.href;

    try {
      if (studioMixBlob && navigator.canShare?.({ files: [new File([studioMixBlob], `${title}.wav`, { type: 'audio/wav' })] })) {
        const file = new File([studioMixBlob], `${title}.wav`, { type: 'audio/wav' });
        await navigator.share({ title, text, files: [file] });
        return;
      }

      if (navigator.share) {
        await navigator.share({ title, text, url: shareUrl });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        return;
      }
    } catch (err) {
      console.warn('Share failed', err);
    }
  };

  const clamp = (val: number, min: number, max: number) => Math.min(Math.max(val, min), max);

  const finalizeComposer = () => {
    const pcm = concatUint8Arrays(composerChunksRef.current);
    if (!pcm.length) {
      console.warn('[Composer] No audio chunks received');
      setComposerError('No audio was generated. Please try again.');
      return;
    }
    console.info(`[Composer] Finalizing WAV with ${pcm.length} bytes`);
    const sampleRate = 48000;
    const wavBuffer = encodeWavFromPcm16(pcm, sampleRate, 2);
    const blob = new Blob([wavBuffer], { type: 'audio/wav' });
    setStudioMixBlob(blob);
  };

  const stopAIComposer = () => {
    if (composerTimerRef.current) {
      clearInterval(composerTimerRef.current);
      composerTimerRef.current = null;
    }

    const live = composerLiveRef.current;
    if (live && typeof live.stop === 'function') {
      try {
        composerStoppingRef.current = true;
        live.stop();
        if (typeof live.close === 'function') {
          live.close();
        }
      } catch (err) {
        console.warn('[Composer][SDK] Stop failed', err);
      }
    }

    setIsComposing(false);
    setComposerProgress(0);
    composerLiveRef.current = null;

    window.setTimeout(finalizeComposer, 150);
  };

  const startAIComposer = () => {
    if (!stats || !recap || isComposing) return;

    setComposerError(null);
    setStudioMixBlob(null);
    setIsComposing(true);
    setComposerProgress(0);
    composerChunksRef.current = [];
    composerStoppingRef.current = false;

    const durationSec = clamp(Math.round(accurateDuration || stats.durationSeconds || 30), 30, 60);
    const apiKey = process.env.API_KEY || import.meta.env.GEMINI_API_KEY || "";
    if (!apiKey) {
      setComposerError('Missing GEMINI_API_KEY. Set it to use the AI composer.');
      setIsComposing(false);
      return;
    }

    console.info('[Composer] Connecting via SDK live client');
    (async () => {
      try {
        const live = await startLyriaComposer(stats, recap, stats.eventLog || [], {
          apiKey,
          onChunk: (chunk) => {
            composerChunksRef.current.push(chunk);
          },
          onMessage: (message) => {
            console.debug('[Composer][SDK] Message', message);
          },
          onError: (err) => {
            if (composerStoppingRef.current) return;
            console.error('[Composer][SDK] Error', err);
            setComposerError('Composer connection failed.');
            stopAIComposer();
          },
          onClose: () => {
            if (composerStoppingRef.current) return;
            console.warn('[Composer][SDK] Closed');
          }
        });

        composerLiveRef.current = live;
        console.info('[Composer][SDK] Connected and playing');
      } catch (err) {
        console.error('[Composer][SDK] Init failed', err);
        setComposerError('Composer connection failed.');
        stopAIComposer();
        return;
      }
    })();

    // Raw WebSocket path is intentionally disabled; SDK is the source of truth.

    const startTime = Date.now();
    composerTimerRef.current = window.setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / (durationSec * 1000)) * 100);
      setComposerProgress(progress);
      if (elapsed >= durationSec * 1000) {
        stopAIComposer();
      }
    }, 100);
  };

  const isComposerReady = Boolean(recap) && !isRecapLoading && !isMeasuring && !isMixing;

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-6 md:p-16 bg-white/40 backdrop-blur-xl rounded-[4rem] md:rounded-[6rem] shadow-2xl border-[8px] md:border-[16px] border-white/60 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-7xl md:text-9xl mb-8 md:mb-12 animate-bounce">🏆</div>
      
      <h2 className="text-5xl md:text-8xl font-black text-[#1e3a8a] mb-4 text-center uppercase tracking-tighter leading-tight drop-shadow-sm" style={{ fontFamily: 'Fredoka One' }}>
        {recap?.trackTitle || 'ROCKSTAR!'}
      </h2>

      {/* GIANT Personal Album Jacket Section */}
      {recap?.personalJacketUrl && (
        <div className="mt-12 md:mt-20 mb-16 md:mb-24 w-full flex justify-center">
          <PersonalJacket 
            imageUrl={recap.personalJacketUrl} 
            title={recap.trackTitle || 'MASTERPIECE'} 
            genre={recap.genre || 'Doodle Symphony'}
          />
        </div>
      )}
      
      <p className="text-xl md:text-3xl text-[#1e3a8a]/60 mb-10 md:mb-16 font-black uppercase tracking-[0.2em] text-center">
        {recap?.genre ? `${recap.genre} Mastery` : 'You Turned Art into Sound!'}
      </p>

      <div className="w-full flex flex-col gap-8 md:gap-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10">
          <div className="bg-white/60 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 text-center border-4 border-white shadow-xl">
            <p className="text-[12px] font-black text-[#1e3a8a]/50 uppercase tracking-widest mb-2">Instrument</p>
            <p className="text-3xl md:text-5xl font-black text-[#1e3a8a]">{stats?.instrument.toUpperCase()}</p>
          </div>
          <div className="bg-white/60 rounded-[2.5rem] md:rounded-[3.5rem] p-8 md:p-12 text-center border-4 border-white shadow-xl">
            <p className="text-[12px] font-black text-[#1e3a8a]/50 uppercase tracking-widest mb-2">Session length</p>
            <p className="text-3xl md:text-5xl font-black text-[#1e3a8a]">
              {isMeasuring ? '...' : `${accurateDuration}s`}
            </p>
          </div>
        </div>

        {isRecapLoading || isMeasuring ? (
          <div className="w-full py-16 md:py-24 flex flex-col items-center justify-center bg-white/20 rounded-[3rem] md:rounded-[4rem] border-8 border-dashed border-white/40">
            <div className="w-14 h-14 md:w-20 md:h-20 border-[8px] md:border-[10px] border-[#1e3a8a] border-t-transparent rounded-full animate-spin mb-8" />
            <p className="text-[#1e3a8a] font-black animate-pulse uppercase tracking-[0.3em] text-center px-8 text-base md:text-xl">
              {isMeasuring ? 'Syncing Your Vibe...' : 'Magically generating your album jacket...'}
            </p>
            {recapStage && !isMeasuring && (
              <p className="mt-4 text-[#1e3a8a]/70 font-black uppercase tracking-[0.2em] text-xs md:text-sm text-center">
                {recapStage}
              </p>
            )}
          </div>
        ) : recap ? (
          <div className="animate-in fade-in duration-1000">
            <RecapCard recap={recap} />
          </div>
        ) : recapError ? (
          <div className="w-full py-10 md:py-16 text-center bg-white/40 rounded-[3rem] md:rounded-[4rem] border-4 border-red-200 text-red-600 font-black uppercase tracking-widest">
            {recapError}
            {recapErrorDetails && (
              <div className="mt-4 px-6 text-xs md:text-sm font-mono text-red-500 uppercase tracking-normal break-words">
                {recapErrorDetails}
              </div>
            )}
          </div>
        ) : null}

        {recap && !recapError && !isRecapLoading && !isMeasuring && (
        <div className="w-full bg-[#1e3a8a]/5 p-8 md:p-14 rounded-[4rem] md:rounded-[5rem] flex flex-col items-center border-[6px] md:border-[8px] border-white shadow-inner relative overflow-hidden">
          {isComposing && (
            <div
              className="absolute top-0 left-0 h-3 bg-[#FF6B6B] transition-all duration-100 shadow-[0_0_20px_#FF6B6B]"
              style={{ width: `${composerProgress}%` }}
            />
          )}

          <div className="flex flex-col gap-8 md:gap-12 w-full">
            {!isComposing ? (
              <div className="flex flex-col gap-6 w-full">
                {!studioMixBlob && (
                  <button
                    onClick={startAIComposer}
                    disabled={!isComposerReady}
                    className={`group relative w-full py-8 md:py-12 text-white text-2xl md:text-5xl font-black rounded-full shadow-[0_10px_0_#020A20] md:shadow-[0_16px_0_#020A20] transition-all duration-150 transform flex items-center justify-center gap-6 ${
                      isComposerReady
                        ? 'bg-[#1e3a8a] hover:bg-[#2a4db3] hover:translate-y-[4px] md:hover:translate-y-[8px] active:shadow-none active:translate-y-[10px] md:active:translate-y-[16px] hover:scale-102'
                        : 'bg-[#1e3a8a]/40 cursor-not-allowed'
                    }`}
                  >
                    <span className="text-3xl md:text-6xl">🎧</span> AI COMPOSER
                  </button>
                )}

                {studioMixBlob && (
                  <button
                    onClick={startAIComposer}
                    className="self-center px-6 py-3 bg-white/70 hover:bg-white text-[#1e3a8a] text-xs md:text-sm font-black uppercase tracking-[0.3em] rounded-full border-4 border-white shadow-lg transition-all active:scale-95"
                  >
                    Retry Mix
                  </button>
                )}

                {!isComposerReady && (
                  <p className="text-center text-[#1e3a8a]/60 font-black uppercase tracking-[0.2em] text-xs md:text-sm">
                    AI composer unlocks after studio analysis and recommendations finish.
                  </p>
                )}

                {composerError && (
                  <div className="w-full text-center bg-white/40 rounded-[2rem] border-4 border-red-200 text-red-600 font-black uppercase tracking-widest py-4">
                    {composerError}
                  </div>
                )}

                {studioMixBlob && (
                  <button
                    onClick={handleShare}
                    className="w-full py-6 md:py-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xl md:text-3xl font-black rounded-full shadow-[0_8px_0_#065f46] md:shadow-[0_12px_0_#065f46] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] md:active:translate-y-[12px] transition-all duration-150 flex items-center justify-center gap-4"
                  >
                    <span className="text-2xl md:text-4xl">🌍</span> SHARE WITH THE WORLD
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={stopAIComposer}
                className="w-full py-8 md:py-12 bg-[#FF6B6B] hover:bg-[#D64545] text-white text-2xl md:text-5xl font-black rounded-full shadow-[0_10px_0_#D64545] animate-pulse flex items-center justify-center gap-6"
              >
                <span>⏹️</span> COMPOSING... {Math.round(composerProgress)}%
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
              <div className="flex flex-col gap-4 md:gap-6">
                <button
                  onClick={handleDownloadOriginal}
                  disabled={!audioUrl}
                  className="w-full py-6 md:py-8 bg-white/80 hover:bg-white text-[#1e3a8a] text-base md:text-2xl font-black rounded-[2rem] md:rounded-[3rem] border-4 border-white shadow-lg transition-all active:scale-95 flex items-center justify-center gap-4"
                >
                  <span>💾</span> SAVE RAW
                </button>
                {audioUrl && (
                  <div className="flex items-center justify-center bg-white/40 rounded-3xl border-2 border-white p-3">
                    <audio controls src={audioUrl} className="w-full h-10" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4 md:gap-6">
                    <button
                      onClick={handleDownloadStudio}
                      disabled={!studioMixBlob}
                      className={`w-full py-6 md:py-8 text-base md:text-2xl font-black rounded-[2rem] md:rounded-[3rem] border-4 border-white shadow-lg transition-all flex items-center justify-center gap-4 ${
                        studioMixBlob
                          ? 'bg-[#FF6B6B] text-white hover:bg-[#D64545] animate-bounce shadow-[0_8px_0_#D64545]'
                          : 'bg-white/20 text-[#1e3a8a]/30 cursor-not-allowed grayscale'
                      }`}
                    >
                      <span>🌟</span>{' '}
                      {studioMixBlob ? `DOWNLOAD ${recap?.trackTitle || 'STUDIO MIX'}` : 'MIX NOT READY'}
                    </button>
                {studioMixUrl && (
                  <div className="flex items-center justify-center bg-white/60 rounded-3xl border-2 border-white p-3">
                    <audio controls src={studioMixUrl} className="w-full h-10" />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}
      </div>

      <button
        onClick={onRestart}
        className="mt-16 md:mt-24 text-[#1e3a8a] font-black text-xl md:text-3xl uppercase tracking-[0.2em] hover:text-[#FF6B6B] transition-colors py-6 px-12 md:px-20 border-4 border-transparent hover:border-[#FF6B6B]/20 rounded-full"
      >
        ↺ New Jam
      </button>

    </div>
  );
};

export default ResultScreen;
