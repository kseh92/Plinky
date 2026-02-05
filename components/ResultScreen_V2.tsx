import React, { useMemo, useEffect, useState, useRef } from 'react';
import { SessionStats, RecapData } from '../services/types';
import { generateSessionRecap, generateMixSettings, generateAlbumJacket } from '../services/geminiService';
import { toneService } from '../services/toneService';
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
             <p className="text-white font-black text-3xl md:text-7xl uppercase tracking-tighter truncate drop-shadow-2xl mb-1 md:mb-3">{title}</p>
             <p className="text-sky-300 font-black text-base md:text-3xl uppercase tracking-widest opacity-95 drop-shadow-md">{genre}</p>
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
  const [recapError, setRecapError] = useState<string | null>(null);
  const [recapErrorDetails, setRecapErrorDetails] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Studio Mix states
  const [isPlayingMix, setIsPlayingMix] = useState(false);
  const [studioMixBlob, setStudioMixBlob] = useState<Blob | null>(null);
  const [recordingProgress, setRecordingProgress] = useState(0);
  const progressIntervalRef = useRef<number | null>(null);

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
    const fetchAIAssistance = async () => {
      if (!stats || isMeasuring || accurateDuration === null) return;
      setIsRecapLoading(true);
      setIsMixing(true);
      setRecapError(null);
      setRecapErrorDetails(null);
      try {
        const recapData = await generateSessionRecap({ ...stats, durationSeconds: accurateDuration, intensity: stats.noteCount / (accurateDuration || 1) });
        const finalRecap: RecapData = { ...recapData };

        try {
          const mixData = await generateMixSettings(stats.eventLog || [], stats.instrument);
          finalRecap.genre = mixData.genre;
          finalRecap.trackTitle = mixData.trackTitle;
          finalRecap.mixingSuggestion = mixData.mix;
          finalRecap.extendedEventLog = mixData.extendedEventLog;
          toneService.applyMixingPreset(mixData.mix);
        } catch (err) {
          console.warn("Mix settings generation failed", err);
        }

        try {
          const jacketUrl = await generateAlbumJacket({ ...stats }, finalRecap);
          finalRecap.personalJacketUrl = jacketUrl;
        } catch (err) {
          console.warn("Album jacket generation failed", err);
        }

        setRecap(finalRecap);
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
    a.download = `studio_${recap?.trackTitle || 'mix'}.webm`;
    a.click();
  };

  const handleReplayStudioMix = async () => {
    if (recap?.extendedEventLog) {
      setIsPlayingMix(true);
      setRecordingProgress(0);
      setStudioMixBlob(null);

      // Start recording the studio session
      await toneService.init();
      await toneService.startRecording();
      toneService.replayEventLog(recap.extendedEventLog);

      const startTime = Date.now();
      const durationMs = 60000;

      progressIntervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(100, (elapsed / durationMs) * 100);
        setRecordingProgress(progress);
        
        if (elapsed >= durationMs) {
          stopStudioMix();
        }
      }, 100);
    }
  };

  const stopStudioMix = async () => {
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    toneService.stopAll();
    const result = await toneService.stopRecording();
    if (result) {
      setStudioMixBlob(result.blob);
    }
    setIsPlayingMix(false);
    setRecordingProgress(0);
  };

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

        <div className="w-full bg-[#1e3a8a]/5 p-8 md:p-14 rounded-[4rem] md:rounded-[5rem] flex flex-col items-center border-[6px] md:border-[8px] border-white shadow-inner relative overflow-hidden">
          {isPlayingMix && (
            <div className="absolute top-0 left-0 h-3 bg-[#FF6B6B] transition-all duration-100 shadow-[0_0_20px_#FF6B6B]" style={{ width: `${recordingProgress}%` }} />
          )}
          
          <div className="flex flex-col gap-8 md:gap-12 w-full">
               {!isPlayingMix ? (
                 <div className="flex flex-col gap-6 w-full">
                   <button
                      onClick={handleReplayStudioMix}
                      disabled={!recap?.extendedEventLog}
                      className="group relative w-full py-8 md:py-12 bg-[#1e3a8a] hover:bg-[#2a4db3] text-white text-2xl md:text-5xl font-black rounded-full shadow-[0_10px_0_#020A20] md:shadow-[0_16px_0_#020A20] hover:translate-y-[4px] md:hover:translate-y-[8px] active:shadow-none active:translate-y-[10px] md:active:translate-y-[16px] transition-all duration-150 transform hover:scale-102 flex items-center justify-center gap-6"
                    >
                      <span className="text-3xl md:text-6xl">🎧</span> PLAY STUDIO MIX (1m)
                    </button>
                    
                    <button
                      onClick={() => setShowShareModal(true)}
                      className="w-full py-6 md:py-8 bg-emerald-500 hover:bg-emerald-600 text-white text-xl md:text-3xl font-black rounded-full shadow-[0_8px_0_#065f46] md:shadow-[0_12px_0_#065f46] hover:translate-y-[4px] active:shadow-none active:translate-y-[8px] md:active:translate-y-[12px] transition-all duration-150 flex items-center justify-center gap-4"
                    >
                      <span className="text-2xl md:text-4xl">🌍</span> SHARE WITH THE WORLD
                    </button>
                 </div>
               ) : (
                 <button
                    onClick={stopStudioMix}
                    className="w-full py-8 md:py-12 bg-[#FF6B6B] hover:bg-[#D64545] text-white text-2xl md:text-5xl font-black rounded-full shadow-[0_10px_0_#D64545] animate-pulse flex items-center justify-center gap-6"
                  >
                    <span>⏹️</span> RECORDING... {Math.round(recordingProgress)}%
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
                      <span>🌟</span> {studioMixBlob ? 'DOWNLOAD STUDIO' : 'MIX NOT READY'}
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
      </div>

      <button
        onClick={onRestart}
        className="mt-16 md:mt-24 text-[#1e3a8a] font-black text-xl md:text-3xl uppercase tracking-[0.2em] hover:text-[#FF6B6B] transition-colors py-6 px-12 md:px-20 border-4 border-transparent hover:border-[#FF6B6B]/20 rounded-full"
      >
        ↺ New Jam
      </button>

      {/* Share Confirmation Popup */}
      {showShareModal && (
        <div className="fixed inset-0 bg-[#1e3a8a]/80 backdrop-blur-xl z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
           <div className="bg-white rounded-[4rem] p-10 md:p-16 max-w-2xl w-full shadow-[0_40px_100px_rgba(0,0,0,0.5)] border-[12px] border-white/60 text-center animate-in zoom-in-95 duration-300">
              <div className="text-8xl mb-8 animate-bounce">📢</div>
              <h3 className="text-4xl md:text-6xl font-black text-[#1e3a8a] uppercase tracking-tighter leading-tight mb-6" style={{ fontFamily: 'Fredoka One' }}>
                Ready to Debut?
              </h3>
              <p className="text-xl md:text-3xl text-gray-500 font-bold mb-12 leading-relaxed">
                Are you ready to show your doodle masterpiece to the world?
              </p>
              
              <div className="flex flex-col md:flex-row gap-6">
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-4 rounded-full uppercase tracking-widest transition-colors"
                >
                  Confirm Share
                </button>
                <button 
                  onClick={() => setShowShareModal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-black py-4 rounded-full uppercase tracking-widest transition-colors"
                >
                  Cancel
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ResultScreen;
