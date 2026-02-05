import React, { useMemo, useEffect, useState } from 'react';
import { SessionStats, RecapData, PerformanceEvent } from '../services/types';
import { generateSessionRecap, generateMixSettings, generateAlbumJacket, generateStudioMusicStream } from '../services/geminiService';
import { decodeBase64ToUint8Array, decodeAudioData, audioBufferToWav } from '../services/audioUtils';
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
        <div className="absolute -inset-6 md:-inset-12 bg-gradient-to-tr from-yellow-400 via-pink-500 to-sky-400 rounded-[4rem] blur-3xl opacity-40 group-hover:opacity-70 transition-opacity animate-pulse"></div>
        <div className="relative w-full aspect-square max-w-[360px] md:max-w-[700px] bg-[#1a1a1a] rounded-[3.5rem] md:rounded-[5rem] overflow-hidden border-[12px] md:border-[24px] border-white shadow-[0_40px_80px_-15px_rgba(0,0,0,0.6)] transform hover:scale-[1.02] transition-transform duration-500">
          <img src={imageUrl} alt="AI Generated Jacket" className="w-full h-full object-cover opacity-90" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent pointer-events-none"></div>
          <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 text-left">
             <p className="text-white font-black text-3xl md:text-6xl uppercase tracking-tighter truncate drop-shadow-2xl mb-1">{title}</p>
             <p className="text-sky-400 font-black text-sm md:text-2xl uppercase tracking-widest opacity-95">{genre}</p>
          </div>
        </div>
        <div className="absolute -top-6 -right-6 md:-top-10 md:-right-10 bg-yellow-400 text-[#1e3a8a] w-24 h-24 md:w-44 md:h-44 rounded-full flex items-center justify-center font-black text-[12px] md:text-xl uppercase tracking-tighter text-center leading-none p-4 shadow-2xl rotate-12 border-4 md:border-[12px] border-white animate-bounce">
          Certified Platinum!
        </div>
      </div>
    </div>
  );
};

const ResultScreen: React.FC<Props> = ({ recording, onRestart, stats }) => {
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [isRecapLoading, setIsRecapLoading] = useState(false);
  const [accurateDuration, setAccurateDuration] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const [recapError, setRecapError] = useState<string | null>(null);

  // Studio Audio State
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);
  const [studioAudioUrl, setStudioAudioUrl] = useState<string | null>(null);

  const audioUrl = useMemo(() => {
    if (!recording) return null;
    return URL.createObjectURL(recording);
  }, [recording]);

  useEffect(() => {
    if (!audioUrl) {
      setIsMeasuring(false);
      return;
    }
    const tempAudio = new Audio(audioUrl);
    const handleLoadedMetadata = () => {
      setAccurateDuration(Math.round(tempAudio.duration === Infinity ? (stats?.durationSeconds || 0) : tempAudio.duration));
      setIsMeasuring(false);
    };
    tempAudio.addEventListener('loadedmetadata', handleLoadedMetadata);
    return () => tempAudio.removeEventListener('loadedmetadata', handleLoadedMetadata);
  }, [audioUrl]);

  useEffect(() => {
    const fetchAIAssistance = async () => {
      if (!stats || isMeasuring || accurateDuration === null) return;
      setIsRecapLoading(true);
      setRecapError(null);
      try {
        const recapData = await generateSessionRecap({ ...stats, durationSeconds: accurateDuration });
        const finalRecap: RecapData = { ...recapData };

        try {
          const mixData = await generateMixSettings(stats.eventLog || [], stats.instrument);
          finalRecap.genre = mixData.genre;
          finalRecap.trackTitle = mixData.trackTitle;
          finalRecap.mixingSuggestion = mixData.mix;
          finalRecap.extendedEventLog = mixData.extendedEventLog;
        } catch (err) { console.warn("Mix failed", err); }

        try {
          const jacketUrl = await generateAlbumJacket({ ...stats }, finalRecap);
          finalRecap.personalJacketUrl = jacketUrl;
        } catch (err) { console.warn("Jacket failed", err); }

        setRecap(finalRecap);
      } catch (err: any) {
        setRecapError("Studio Analysis is currently taking a break. But your session was epic!");
      } finally {
        setIsRecapLoading(false);
      }
    };
    fetchAIAssistance();
  }, [stats, accurateDuration, isMeasuring]);

  const handleGenerateStudioTrack = async () => {
    if (!stats || !recap) return;
    setIsGeneratingAudio(true);
    setRenderProgress(0);
    setStudioAudioUrl(null);
    
    try {
      const chunks: Uint8Array[] = [];
      const stream = generateStudioMusicStream(recap, stats, stats.eventLog || []);
      
      let totalBytes = 0;
      for await (const base64Data of stream) {
        if (!base64Data) continue;
        const uint8 = decodeBase64ToUint8Array(base64Data);
        chunks.push(uint8);
        totalBytes += uint8.length;
        
        // Progress for 30s track
        const estimatedFullSize = 1440000; 
        setRenderProgress(Math.min((totalBytes / estimatedFullSize) * 100, 99));
      }

      if (chunks.length === 0) {
        throw new Error("The AI model didn't send any audio. Try a different performance!");
      }

      const combined = new Uint8Array(totalBytes);
      let offset = 0;
      for (const chunk of chunks) {
        combined.set(chunk, offset);
        offset += chunk.length;
      }

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const audioBuffer = await decodeAudioData(combined, audioCtx, 24000, 1);
      const wavBlob = audioBufferToWav(audioBuffer);
      
      setStudioAudioUrl(URL.createObjectURL(wavBlob));
      setRenderProgress(100);
    } catch (err: any) {
      console.error("Studio Mix Error:", err);
      const msg = err.message?.includes('CANCELLED') 
        ? "The Studio is currently overloaded with rockstars! Please wait 3 seconds and try again." 
        : "The Magic Studio is having trouble mixing this specific rhythm. Let's try once more!";
      alert(msg);
    } finally {
      setIsGeneratingAudio(false);
    }
  };

  const downloadStudioTrack = () => {
    if (!studioAudioUrl) return;
    const a = document.createElement('a');
    a.href = studioAudioUrl;
    a.download = `${recap?.trackTitle || 'Studio_Mix'}.wav`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-5xl mx-auto p-6 md:p-16 bg-white/40 backdrop-blur-xl rounded-[4rem] md:rounded-[6rem] shadow-2xl border-[8px] md:border-[16px] border-white/60 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="text-8xl mb-8">💎</div>
      <h2 className="text-5xl md:text-8xl font-black text-[#1e3a8a] mb-8 text-center uppercase tracking-tighter" style={{ fontFamily: 'Fredoka One' }}>
        {recap?.trackTitle || 'SESSION ENDED'}
      </h2>

      {recap?.personalJacketUrl && (
        <div className="mb-20 w-full flex justify-center">
          <PersonalJacket 
            imageUrl={recap.personalJacketUrl} 
            title={recap.trackTitle || 'MASTERPIECE'} 
            genre={recap.genre || 'Studio Mix'} 
          />
        </div>
      )}

      {isRecapLoading ? (
        <div className="w-full py-12 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#1e3a8a] border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-[#1e3a8a] font-black uppercase tracking-widest animate-pulse">Analyzing Performance Soul...</p>
        </div>
      ) : recap ? (
        <div className="w-full flex flex-col gap-12">
          <RecapCard recap={recap} />

          {/* EXTENDED STUDIO MIX SECTION */}
          <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] p-8 md:p-14 rounded-[4rem] text-white shadow-2xl relative overflow-hidden border-4 border-sky-500/20">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="flex items-center gap-3 mb-6">
                <span className={`w-3 h-3 rounded-full ${isGeneratingAudio ? 'bg-red-500 animate-ping' : 'bg-green-500'}`}></span>
                <span className="text-sky-400 font-black uppercase tracking-[0.3em] text-xs">AI Studio Synthesis • 30s Instrumental Master</span>
              </div>
              
              <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4" style={{ fontFamily: 'Fredoka One' }}>Lyria Studio Mix</h3>
              <p className="text-gray-400 text-lg md:text-xl font-bold mb-10 max-w-2xl leading-relaxed">
                Transform your rhythm into a <span className="text-white font-black italic">high-fidelity instrumental track</span>. No vocals, just pure synthesized magic.
              </p>

              {!studioAudioUrl ? (
                <div className="w-full max-w-lg flex flex-col items-center gap-6">
                  <button
                    onClick={handleGenerateStudioTrack}
                    disabled={isGeneratingAudio}
                    className="w-full py-8 bg-sky-500 hover:bg-sky-400 text-white text-3xl font-black rounded-full shadow-[0_12px_0_#0369a1] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-6 disabled:bg-gray-700 disabled:shadow-none disabled:cursor-not-allowed group"
                  >
                    {isGeneratingAudio ? (
                      <>
                        <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
                        SYNTHESIZING...
                      </>
                    ) : (
                      <span className="group-hover:scale-110 transition-transform">🚀 GENERATE INSTRUMENTAL MIX</span>
                    )}
                  </button>
                  
                  {isGeneratingAudio && (
                    <div className="w-full space-y-4">
                      <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
                        <div 
                          className="h-full bg-gradient-to-r from-sky-400 via-indigo-500 to-sky-400 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(56,189,248,0.5)]" 
                          style={{ width: `${renderProgress}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[9px] font-black text-sky-400/60 uppercase tracking-widest px-1">
                         <span>Capturing Vibe</span>
                         <span>Synthesizing Pads</span>
                         <span>Finalizing WAV</span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
                  <div className="w-full bg-black/40 backdrop-blur-2xl p-8 rounded-[3rem] border-2 border-white/10 flex flex-col md:flex-row items-center gap-8 shadow-inner">
                    <div className="flex-1 w-full">
                      <div className="flex items-center justify-between mb-4 px-4">
                        <p className="text-sky-400 text-[10px] font-black uppercase tracking-[0.2em]">Studio Master Output (WAV)</p>
                        <div className="flex gap-1">
                          {[...Array(8)].map((_, i) => (
                            <div key={i} className="w-1 h-3 bg-sky-500/40 rounded-full animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
                          ))}
                        </div>
                      </div>
                      <audio controls src={studioAudioUrl} className="w-full h-12 brightness-110 contrast-125" />
                    </div>
                    <button
                      onClick={downloadStudioTrack}
                      className="bg-white text-[#1a1a1a] px-12 py-6 rounded-full font-black uppercase tracking-widest shadow-[0_8px_0_#d1d5db] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all flex items-center gap-3 whitespace-nowrap group"
                    >
                      <span className="text-2xl group-hover:rotate-12 transition-transform">💾</span> DOWNLOAD
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : recapError ? (
        <div className="text-red-500 font-black text-xl bg-red-50 p-8 rounded-3xl border-4 border-red-200">
           {recapError}
        </div>
      ) : null}

      <button onClick={onRestart} className="mt-16 text-[#1e3a8a] font-black text-2xl uppercase tracking-widest hover:text-[#FF6B6B] transition-colors py-4 px-12 rounded-full border-4 border-transparent hover:border-[#FF6B6B]/10">
        ↺ Start New Session
      </button>
    </div>
  );
};

export default ResultScreen;
