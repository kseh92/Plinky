
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { SessionStats, RecapData } from '../types';
import { generateSessionRecap, generateMixSettings, generateStudioMusicStream } from '../geminiService';
import RecapCard from './RecapCard';

interface Props {
  recording: Blob | null;
  onRestart: () => void;
  stats: SessionStats | null;
}

/**
 * Creates a standard WAV header for Mono 16-bit PCM data.
 */
function createWavHeader(pcmLength: number, sampleRate: number): ArrayBuffer {
  const header = new ArrayBuffer(44);
  const view = new DataView(header);
  
  view.setUint32(0, 0x52494646, false); // "RIFF"
  view.setUint32(4, 36 + pcmLength, true); 
  view.setUint32(8, 0x57415645, false); // "WAVE"
  
  view.setUint32(12, 0x666d7420, false); // "fmt "
  view.setUint32(16, 16, true); 
  view.setUint16(20, 1, true); // PCM format
  view.setUint16(22, 1, true); // Mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true); 
  view.setUint16(32, 2, true); 
  view.setUint16(34, 16, true); 
  
  view.setUint32(36, 0x64617461, false); // "data"
  view.setUint32(40, pcmLength, true);
  
  return header;
}

async function decodeBase64ToAudioBuffer(base64: string, ctx: AudioContext): Promise<{ buffer: AudioBuffer, raw: Uint8Array }> {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  const dataInt16 = new Int16Array(bytes.buffer);
  const frameCount = dataInt16.length;
  const buffer = ctx.createBuffer(1, frameCount, 24000); 

  const channelData = buffer.getChannelData(0);
  for (let i = 0; i < frameCount; i++) {
    channelData[i] = dataInt16[i] / 32768.0;
  }
  return { buffer, raw: bytes };
}

const ResultScreen: React.FC<Props> = ({ recording, onRestart, stats }) => {
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [isRecapLoading, setIsRecapLoading] = useState(false);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const [accurateDuration, setAccurateDuration] = useState<number | null>(null);
  
  const [isGeneratingMusic, setIsGeneratingMusic] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [hasFinishedGeneration, setHasFinishedGeneration] = useState(false);
  const [isPlayingAiMusic, setIsPlayingAiMusic] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const collectedAudioChunksRef = useRef<Uint8Array[]>([]);
  const fullAudioBufferRef = useRef<AudioBuffer | null>(null);

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
    tempAudio.addEventListener('loadedmetadata', () => {
      setAccurateDuration(Math.round(tempAudio.duration === Infinity ? (stats?.durationSeconds || 0) : tempAudio.duration));
      setIsMeasuring(false);
    });
    const timer = setTimeout(() => { if (isMeasuring) { setAccurateDuration(stats?.durationSeconds || 0); setIsMeasuring(false); } }, 2000);
    return () => clearTimeout(timer);
  }, [audioUrl]);

  useEffect(() => {
    const fetchAIAssistance = async () => {
      if (!stats || isMeasuring || accurateDuration === null) return;
      setIsRecapLoading(true);
      try {
        const [recapData, mixData] = await Promise.all([
          generateSessionRecap({ ...stats, durationSeconds: accurateDuration, intensity: stats.noteCount / (accurateDuration || 1) }),
          generateMixSettings(stats.eventLog || [], stats.instrument)
        ]);
        setRecap({ 
          ...recapData, 
          genre: mixData.genre, 
          trackTitle: mixData.trackTitle, 
          mixingSuggestion: mixData.mix, 
          extendedEventLog: mixData.extendedEventLog 
        });
      } catch (err) { 
        console.error("Studio processing failed", err); 
      } finally { 
        setIsRecapLoading(false); 
      }
    };
    fetchAIAssistance();
  }, [stats, accurateDuration, isMeasuring]);

  const handleGenerateAiStudioTrack = async () => {
    if (!recap || !stats) return;
    
    setIsGeneratingMusic(true);
    setGenerationProgress(0);
    setHasFinishedGeneration(false);
    collectedAudioChunksRef.current = [];
    fullAudioBufferRef.current = null;
    
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    
    nextStartTimeRef.current = audioContextRef.current.currentTime;
    setIsPlayingAiMusic(true);

    try {
      const stream = generateStudioMusicStream(recap, stats, stats.eventLog || []);
      let chunksReceived = 0;
      
      for await (const chunkBase64 of stream) {
        chunksReceived++;
        setGenerationProgress(Math.min(99, Math.round((chunksReceived / 40) * 100)));
        
        const { buffer, raw } = await decodeBase64ToAudioBuffer(chunkBase64, audioContextRef.current);
        collectedAudioChunksRef.current.push(raw);
        scheduleBuffer(buffer);
      }
      
      setGenerationProgress(100);
      setHasFinishedGeneration(true);
      
      if (audioContextRef.current && collectedAudioChunksRef.current.length > 0) {
        const totalSampleCount = collectedAudioChunksRef.current.reduce((acc, curr) => acc + curr.length, 0) / 2;
        const mergedBuffer = audioContextRef.current.createBuffer(1, totalSampleCount, 24000);
        const channelData = mergedBuffer.getChannelData(0);
        let offset = 0;
        for (const chunk of collectedAudioChunksRef.current) {
          const int16 = new Int16Array(chunk.buffer);
          for (let i = 0; i < int16.length; i++) {
            channelData[offset++] = int16[i] / 32768.0;
          }
        }
        fullAudioBufferRef.current = mergedBuffer;
      }
    } catch (err) {
      console.error("Streaming failed", err);
      alert("The AI Studio is resetting. Let's try again!");
      setIsPlayingAiMusic(false);
    } finally {
      setIsGeneratingMusic(false);
    }
  };

  const scheduleBuffer = (buffer: AudioBuffer) => {
    const ctx = audioContextRef.current;
    if (!ctx) return;

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    
    const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime);
    source.start(startTime);
    
    nextStartTimeRef.current = startTime + buffer.duration;
    sourcesRef.current.add(source);
    
    source.onended = () => {
      sourcesRef.current.delete(source);
      if (sourcesRef.current.size === 0 && !isGeneratingMusic) {
        setIsPlayingAiMusic(false);
      }
    };
  };

  const handlePlayAiTrack = () => {
    if (fullAudioBufferRef.current && audioContextRef.current) {
      stopAiMusic();
      const source = audioContextRef.current.createBufferSource();
      source.buffer = fullAudioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlayingAiMusic(false);
      source.start(0);
      sourcesRef.current.add(source);
      setIsPlayingAiMusic(true);
    } else {
      handleGenerateAiStudioTrack();
    }
  };

  const stopAiMusic = () => {
    sourcesRef.current.forEach(s => {
      try { s.stop(); } catch(e) {}
    });
    sourcesRef.current.clear();
    setIsPlayingAiMusic(false);
  };

  const downloadAiMaster = () => {
    if (collectedAudioChunksRef.current.length === 0) return;
    
    const totalLength = collectedAudioChunksRef.current.reduce((acc, curr) => acc + curr.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of collectedAudioChunksRef.current) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }
    
    const header = createWavHeader(totalLength, 24000);
    const wavBlob = new Blob([header, combined], { type: 'audio/wav' });
    const url = URL.createObjectURL(wavBlob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recap?.trackTitle || 'Gemini_Studio_Master'}.wav`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-3xl mx-auto p-8 bg-white rounded-[4rem] shadow-2xl border-8 border-blue-100 overflow-hidden mb-12">
      <div className="text-7xl mb-6 animate-bounce">🎶</div>
      <h2 className="text-4xl md:text-5xl font-black text-blue-600 mb-2 text-center uppercase tracking-tighter leading-tight">
        {recap?.trackTitle || 'YOU ARE A STAR!'}
      </h2>
      <p className="text-xl text-gray-400 mb-10 font-bold text-center italic">
        {recap?.genre ? `Your Official ${recap.genre} Mix` : '"Ready to hear your session?"'}
      </p>

      <div className="w-full flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-3xl p-6 text-center">
            <p className="text-xs font-black text-blue-300 uppercase tracking-widest mb-1">Instrument</p>
            <p className="text-2xl font-black text-blue-700">{stats?.instrument.toUpperCase()}</p>
          </div>
          <div className="bg-green-50 rounded-3xl p-6 text-center">
            <p className="text-xs font-black text-green-300 uppercase tracking-widest mb-1">Take Time</p>
            <p className="text-2xl font-black text-green-700">
              {isMeasuring ? '...' : `${accurateDuration}s`}
            </p>
          </div>
        </div>

        {isRecapLoading || isMeasuring ? (
          <div className="w-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-200">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-blue-500 font-black animate-pulse uppercase tracking-widest text-center px-6">
               Studio Producer is mastering your performance...
            </p>
          </div>
        ) : recap ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000">
             <RecapCard recap={recap} />
          </div>
        ) : null}

        {recap && !isRecapLoading && (
          <div className="w-full bg-gradient-to-br from-blue-950 to-indigo-900 p-8 rounded-[3rem] flex flex-col items-center border-4 border-blue-400/30 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-700 delay-300">
            <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] pointer-events-none" />
            
            <div className="relative z-10 w-full flex flex-col items-center">
              <div className="flex items-center gap-2 mb-6">
                <span className="flex h-3 w-3 relative">
                  <span className={`absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75 ${isPlayingAiMusic ? 'animate-ping' : ''}`}></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500"></span>
                </span>
                <p className="text-xs font-black text-yellow-300 uppercase tracking-[0.3em]">
                  {isGeneratingMusic ? 'AI Studio Mastering' : 'Gemini Studio Composer'}
                </p>
              </div>

              {!hasFinishedGeneration && !isGeneratingMusic ? (
                <button
                  onClick={handleGenerateAiStudioTrack}
                  className="w-full py-8 bg-yellow-400 hover:bg-yellow-300 text-blue-950 text-2xl font-black rounded-full shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-95"
                >
                  <span>✨</span> GENERATE STUDIO HIT
                </button>
              ) : (
                <div className="w-full flex flex-col items-center gap-6">
                  {(isGeneratingMusic || generationProgress < 100) && (
                    <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-yellow-400 transition-all duration-500 shadow-[0_0_15px_rgba(250,204,21,0.5)]" 
                        style={{ width: `${generationProgress}%` }}
                      />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-center gap-4 w-full">
                    <div className="h-16 flex items-end gap-1 px-2">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 bg-yellow-400 rounded-full transition-all duration-300 ${isPlayingAiMusic ? 'animate-bounce' : 'h-2'}`}
                          style={{ height: isPlayingAiMusic ? `${30 + Math.random() * 70}%` : '8px', animationDelay: `${i * 0.1}s` }}
                        />
                      ))}
                    </div>
                    
                    <div className="flex flex-col items-center gap-2">
                      <button
                        onClick={isPlayingAiMusic ? stopAiMusic : handlePlayAiTrack}
                        className={`w-24 h-24 bg-white text-blue-950 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 active:scale-90 transition-all ${isGeneratingMusic ? 'animate-pulse' : ''}`}
                      >
                        <span className="text-4xl">{isPlayingAiMusic ? '⏹️' : '▶️'}</span>
                      </button>
                      <span className="text-[10px] font-black text-yellow-300 uppercase tracking-widest">
                        {isGeneratingMusic ? `PROCESSING... ${generationProgress}%` : isPlayingAiMusic ? 'NOW PLAYING' : 'PLAY HIT'}
                      </span>
                    </div>

                    <div className="h-16 flex items-end gap-1 px-2">
                      {[...Array(8)].map((_, i) => (
                        <div 
                          key={i} 
                          className={`w-1.5 bg-yellow-400 rounded-full transition-all duration-300 ${isPlayingAiMusic ? 'animate-bounce' : 'h-2'}`}
                          style={{ height: isPlayingAiMusic ? `${30 + Math.random() * 70}%` : '8px', animationDelay: `${(8-i) * 0.1}s` }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-yellow-500 font-bold tracking-tight uppercase">HIT SINGLE: {recap?.trackTitle}</p>
                    <p className="text-yellow-400/40 text-[9px] font-black uppercase tracking-[0.2em] mt-1">AI Orchestration & Studio Mastering</p>
                  </div>

                  <div className="w-full h-px bg-white/10 mt-2" />
                  
                  <div className="flex flex-wrap items-center justify-center gap-4">
                    {hasFinishedGeneration && (
                      <button
                        onClick={downloadAiMaster}
                        className="text-xs bg-yellow-400/20 text-yellow-300 border border-yellow-500/50 px-6 py-3 rounded-xl font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-blue-950 transition-all flex items-center gap-2 shadow-lg"
                      >
                        📥 SAVE STUDIO MASTER (.WAV)
                      </button>
                    )}
                    <button
                      onClick={() => { stopAiMusic(); setHasFinishedGeneration(false); setGenerationProgress(0); handleGenerateAiStudioTrack(); }}
                      className="text-xs text-yellow-500/60 font-black uppercase tracking-widest hover:text-white transition-colors py-3 px-4"
                    >
                      Remix Session ↺
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="w-full flex justify-center gap-4">
          <button
            onClick={() => { if (audioUrl) { const a = document.createElement('a'); a.href = audioUrl; a.download = 'raw_session.webm'; a.click(); } }}
            className="flex-1 py-4 bg-gray-50 text-gray-400 font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
          >
            📋 SAVE RAW RECORDING
          </button>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="mt-12 text-blue-500 font-black text-lg uppercase tracking-tight hover:text-blue-700 transition-colors py-4 px-8"
      >
        Start New Session ↺
      </button>
    </div>
  );
};

export default ResultScreen;
