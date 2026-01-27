
import React, { useMemo, useEffect, useState, useRef } from 'react';
import { SessionStats, RecapData } from '../types';
import { generateSessionRecap, generateMixSettings } from '../geminiService';
import { toneService } from '../services/toneService';
import RecapCard from './RecapCard';

interface Props {
  recording: Blob | null;
  onRestart: () => void;
  stats: SessionStats | null;
}

const ResultScreen: React.FC<Props> = ({ recording, onRestart, stats }) => {
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [isRecapLoading, setIsRecapLoading] = useState(false);
  const [accurateDuration, setAccurateDuration] = useState<number | null>(null);
  const [isMeasuring, setIsMeasuring] = useState(true);
  const [isMixing, setIsMixing] = useState(false);
  
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
      try {
        const [recapData, mixData] = await Promise.all([
          generateSessionRecap({ ...stats, durationSeconds: accurateDuration, intensity: stats.noteCount / (accurateDuration || 1) }),
          generateMixSettings(stats.eventLog || [], stats.instrument)
        ]);
        toneService.applyMixingPreset(mixData.mix);
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
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-3xl mx-auto p-8 bg-white rounded-[4rem] shadow-2xl border-8 border-yellow-300 overflow-hidden mb-12">
      <div className="text-7xl mb-6 animate-bounce">🏆</div>
      <h2 className="text-4xl md:text-5xl font-black text-blue-600 mb-2 text-center uppercase tracking-tighter leading-tight">
        {recap?.trackTitle || 'ROCKSTAR!'}
      </h2>
      <p className="text-xl text-gray-500 mb-10 font-bold text-center italic">
        {recap?.genre ? `A ${recap.genre} masterpiece` : '"You just turned paper into music!"'}
      </p>

      <div className="w-full flex flex-col gap-8">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-3xl p-6 text-center">
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Instrument</p>
            <p className="text-2xl font-black text-blue-700">{stats?.instrument.toUpperCase()}</p>
          </div>
          <div className="bg-green-50 rounded-3xl p-6 text-center">
            <p className="text-xs font-black text-green-400 uppercase tracking-widest mb-1">Original Session</p>
            <p className="text-2xl font-black text-green-700">
              {isMeasuring ? '...' : `${accurateDuration}s`}
            </p>
          </div>
        </div>

        {isRecapLoading || isMeasuring ? (
          <div className="w-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-200">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-blue-500 font-black animate-pulse uppercase tracking-widest text-center px-6">
              {isMeasuring ? 'Syncing Audio...' : 'AI Studio is generating a 1-minute arrangement...'}
            </p>
          </div>
        ) : recap ? (
          <RecapCard recap={recap} />
        ) : null}

        <div className="w-full bg-stone-50 p-8 rounded-[3rem] flex flex-col items-center border-2 border-stone-100 shadow-inner relative overflow-hidden">
          {isPlayingMix && (
            <div className="absolute top-0 left-0 h-1 bg-blue-500 transition-all duration-100" style={{ width: `${recordingProgress}%` }} />
          )}
          
          <div className="flex flex-col gap-4 w-full">
               {!isPlayingMix ? (
                 <button
                    onClick={handleReplayStudioMix}
                    disabled={!recap?.extendedEventLog}
                    className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white text-2xl font-black rounded-full shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3"
                  >
                    <span>🎧</span> PLAY & RECORD STUDIO MIX (1m)
                  </button>
               ) : (
                 <button
                    onClick={stopStudioMix}
                    className="w-full py-6 bg-red-500 hover:bg-red-600 text-white text-2xl font-black rounded-full shadow-lg transition-all animate-pulse flex items-center justify-center gap-3"
                  >
                    <span>⏹️</span> RECORDING... {Math.round(recordingProgress)}%
                  </button>
               )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Original Download */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleDownloadOriginal}
                      disabled={!audioUrl}
                      className="w-full py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm font-black rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <span>💾</span> SAVE RAW SESSION
                    </button>
                    {audioUrl && (
                       <div className="flex items-center justify-center bg-white rounded-xl border border-stone-200 px-3 py-1">
                        <audio controls src={audioUrl} className="w-full h-6" />
                      </div>
                    )}
                  </div>

                  {/* Studio Download */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={handleDownloadStudio}
                      disabled={!studioMixBlob}
                      className={`w-full py-4 text-sm font-black rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 ${
                        studioMixBlob 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white animate-bounce' 
                          : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <span>🌟</span> {studioMixBlob ? 'DOWNLOAD STUDIO MIX' : 'MIX NOT RECORDED'}
                    </button>
                    {studioMixUrl && (
                       <div className="flex items-center justify-center bg-indigo-50 rounded-xl border border-indigo-200 px-3 py-1">
                        <audio controls src={studioMixUrl} className="w-full h-6" />
                      </div>
                    )}
                  </div>
                </div>
            </div>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-4">
              {studioMixBlob ? 'Studio Mix Captured! Share your masterpiece.' : 'Play the Studio Mix to record and save it!'}
            </p>
        </div>
      </div>

      <button
        onClick={onRestart}
        className="mt-10 text-blue-400 font-black text-lg uppercase tracking-tight hover:text-blue-600 transition-colors py-4 px-8"
      >
        Play Another Instrument ↺
      </button>
    </div>
  );
};

export default ResultScreen;
