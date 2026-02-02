
import React from 'react';
import { RecapData } from '../types';

interface Props {
  recap: RecapData;
}

const RecapCard: React.FC<Props> = ({ recap }) => {
  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-blue-100 rounded-[2.5rem] p-8 shadow-inner relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 text-blue-200 text-6xl opacity-10 pointer-events-none">🔊</div>
      <div className="absolute bottom-0 left-0 p-4 text-indigo-200 text-6xl opacity-10 pointer-events-none">🎹</div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-blue-700 text-white px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-4 shadow-md">
          Gemini Producer Report
        </div>
        
        {recap.genre && (
          <div className="mb-4 text-indigo-700 font-black px-4 py-1 bg-white/80 backdrop-blur-md rounded-lg border border-indigo-100 shadow-sm text-sm uppercase tracking-[0.2em]">
            Style: {recap.genre}
          </div>
        )}

        <p className="text-blue-600 font-black text-xl mb-4 uppercase tracking-tighter text-center leading-none">
          "{recap.performanceStyle}"
        </p>
        
        <blockquote className="text-2xl md:text-3xl font-black text-gray-900 text-center mb-6 leading-tight italic max-w-lg">
          "{recap.criticQuote}"
        </blockquote>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-px bg-blue-200" />
          <p className="text-lg font-bold text-blue-700 text-center uppercase tracking-tighter">
            Vibe: {recap.artistComparison}
          </p>
          <div className="w-12 h-px bg-blue-200" />
        </div>

        {recap.mixingSuggestion && (
          <div className="w-full bg-white/60 p-4 rounded-2xl border border-blue-50 mb-8 grid grid-cols-2 md:grid-cols-3 gap-2 text-[9px] font-black uppercase text-blue-400 tracking-[0.2em]">
             <div className="flex flex-col items-center p-2 bg-white rounded-xl shadow-sm">
                <span>Space</span>
                <span className="text-blue-600 text-xs">{Math.round(recap.mixingSuggestion.reverbAmount * 100)}%</span>
             </div>
             <div className="flex flex-col items-center p-2 bg-white rounded-xl shadow-sm">
                <span>Power</span>
                <span className="text-blue-600 text-xs">{Math.round(recap.mixingSuggestion.distortionAmount * 100)}%</span>
             </div>
             <div className="flex flex-col items-center p-2 bg-white rounded-xl shadow-sm">
                <span>Dynamics</span>
                <span className="text-blue-600 text-xs">{recap.mixingSuggestion.compressionThreshold}dB</span>
             </div>
          </div>
        )}

        <div className="w-full space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em]">Studio Playlists</span>
             <div className="h-px flex-1 bg-indigo-100" />
          </div>
          
          {recap.recommendedSongs.map((song, idx) => (
            <div 
              key={idx}
              className="w-full bg-white rounded-[1.5rem] p-4 shadow-sm border-2 border-indigo-50 flex items-center justify-between gap-4 group hover:border-indigo-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-10 h-10 flex-shrink-0 bg-blue-600 rounded-xl flex items-center justify-center text-lg font-black text-white">
                  {idx + 1}
                </div>
                <div className="overflow-hidden text-left">
                  <h4 className="text-base font-black text-gray-900 truncate leading-tight">{song.title}</h4>
                  <p className="text-gray-400 font-bold text-xs truncate">{song.artist}</p>
                </div>
              </div>
              
              <a
                href={song.youtubeMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex-shrink-0 bg-red-50 group-hover:bg-red-600 text-red-500 group-hover:text-white rounded-xl transition-all flex items-center justify-center shadow-sm"
                title="Listen on YouTube Music"
              >
                <span className="text-sm">▶️</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecapCard;
