
import React, { useMemo, useEffect, useState } from 'react';
import { SessionStats, RecapData } from '../types';
import { generateSessionRecap } from '../geminiService';
import RecapCard from './RecapCard';

interface Props {
  recording: Blob | null;
  onRestart: () => void;
  stats: SessionStats | null;
}

const ResultScreen: React.FC<Props> = ({ recording, onRestart, stats }) => {
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [isRecapLoading, setIsRecapLoading] = useState(false);

  useEffect(() => {
    const fetchRecap = async () => {
      if (!stats) return;
      setIsRecapLoading(true);
      try {
        const data = await generateSessionRecap(stats);
        setRecap(data);
      } catch (err) {
        console.error("Failed to generate recap", err);
      } finally {
        setIsRecapLoading(false);
      }
    };
    fetchRecap();
  }, [stats]);

  const audioUrl = useMemo(() => {
    if (!recording) return null;
    return URL.createObjectURL(recording);
  }, [recording]);

  const handleDownload = () => {
    if (!audioUrl) return;
    const a = document.createElement('a');
    a.href = audioUrl;
    a.download = `my-paper-instrument-song-${Date.now()}.webm`;
    a.click();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] w-full max-w-3xl mx-auto p-8 bg-white rounded-[4rem] shadow-2xl border-8 border-yellow-300 overflow-hidden mb-12">
      <div className="text-7xl mb-6 animate-bounce">🏆</div>
      <h2 className="text-4xl md:text-5xl font-black text-blue-600 mb-2 text-center">ROCKSTAR!</h2>
      <p className="text-xl text-gray-500 mb-10 font-bold text-center italic">"You just turned paper into music!"</p>

      <div className="w-full flex flex-col gap-8">
        {/* Performance Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-3xl p-6 text-center">
            <p className="text-xs font-black text-blue-400 uppercase tracking-widest mb-1">Instrument</p>
            <p className="text-2xl font-black text-blue-700">{stats?.instrument.toUpperCase()}</p>
          </div>
          <div className="bg-green-50 rounded-3xl p-6 text-center">
            <p className="text-xs font-black text-green-400 uppercase tracking-widest mb-1">Duration</p>
            <p className="text-2xl font-black text-green-700">{stats?.durationSeconds}s</p>
          </div>
        </div>

        {/* AI Recap Card */}
        {isRecapLoading ? (
          <div className="w-full py-12 flex flex-col items-center justify-center bg-gray-50 rounded-[2.5rem] border-4 border-dashed border-gray-200">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-blue-500 font-black animate-pulse uppercase tracking-widest">Calling the Critic...</p>
          </div>
        ) : recap ? (
          <RecapCard recap={recap} />
        ) : null}

        {/* Audio Section */}
        {audioUrl ? (
          <div className="w-full bg-stone-50 p-8 rounded-3xl flex flex-col items-center">
            <p className="text-sm font-bold text-stone-400 uppercase tracking-widest mb-4">Listen to your performance</p>
            <audio controls src={audioUrl} className="w-full mb-6" />
            
            <button
              onClick={handleDownload}
              className="w-full py-5 bg-green-500 hover:bg-green-600 text-white text-xl font-black rounded-full shadow-lg transition-all transform hover:-translate-y-1 active:scale-95"
            >
              💾 DOWNLOAD MY SONG
            </button>
          </div>
        ) : (
          <div className="p-6 bg-red-50 text-red-500 rounded-2xl font-bold text-center">
            Ah! The recorder missed that session. Try playing again!
          </div>
        )}
      </div>

      <button
        onClick={onRestart}
        className="mt-10 text-blue-400 font-black text-lg uppercase tracking-tight hover:text-blue-600 transition-colors py-4 px-8 border-2 border-transparent hover:border-blue-100 rounded-full"
      >
        Play Another Instrument ↺
      </button>
    </div>
  );
};

export default ResultScreen;
