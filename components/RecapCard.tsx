
import React from 'react';
import { RecapData } from '../types';

interface Props {
  recap: RecapData;
}

const RecapCard: React.FC<Props> = ({ recap }) => {
  return (
    <div className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 border-4 border-blue-200 rounded-[2.5rem] p-8 shadow-inner relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 text-blue-200 text-6xl opacity-20 pointer-events-none">✨</div>
      <div className="absolute bottom-0 left-0 p-4 text-indigo-200 text-6xl opacity-20 pointer-events-none">🎵</div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest mb-4 shadow-md">
          Gemini AI Studio
        </div>
        
        {recap.genre && (
          <div className="mb-4 text-indigo-600 font-black px-4 py-1 bg-white/60 backdrop-blur-md rounded-lg border border-indigo-100 shadow-sm text-sm uppercase tracking-[0.2em]">
            Genre: {recap.genre}
          </div>
        )}

        <p className="text-blue-500 font-black text-xl mb-4 uppercase tracking-tighter text-center leading-none">
          "{recap.performanceStyle}"
        </p>
        
        <blockquote className="text-2xl md:text-3xl font-black text-gray-800 text-center mb-6 leading-tight italic max-w-lg">
          "{recap.criticQuote}"
        </blockquote>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-px bg-blue-300" />
          <p className="text-lg font-bold text-blue-600 text-center uppercase tracking-tighter">
            Like a young {recap.artistComparison}
          </p>
          <div className="w-12 h-px bg-blue-300" />
        </div>

        {recap.mixingSuggestion && (
          <div className="w-full bg-white/40 p-4 rounded-2xl border border-blue-100 mb-8 grid grid-cols-2 md:grid-cols-3 gap-2 text-[10px] font-bold uppercase text-blue-400 tracking-wider">
             <div className="flex flex-col items-center p-2 bg-white/80 rounded-xl shadow-sm">
                <span>Reverb</span>
                <span className="text-blue-600 text-sm">{Math.round(recap.mixingSuggestion.reverbAmount * 100)}%</span>
             </div>
             <div className="flex flex-col items-center p-2 bg-white/80 rounded-xl shadow-sm">
                <span>Distortion</span>
                <span className="text-blue-600 text-sm">{Math.round(recap.mixingSuggestion.distortionAmount * 100)}%</span>
             </div>
             <div className="flex flex-col items-center p-2 bg-white/80 rounded-xl shadow-sm">
                <span>Compressor</span>
                <span className="text-blue-600 text-sm">{recap.mixingSuggestion.compressionThreshold}dB</span>
             </div>
          </div>
        )}

        <div className="w-full space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-xs font-black text-indigo-400 uppercase tracking-[0.2em]">Studio Recommendations</span>
             <div className="h-px flex-1 bg-indigo-100" />
          </div>
          
          {recap.recommendedSongs.map((song, idx) => (
            <div 
              key={idx}
              className="w-full bg-white rounded-[2rem] p-5 shadow-sm border-2 border-indigo-50 flex items-center justify-between gap-4 group hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="w-12 h-12 flex-shrink-0 bg-blue-100 rounded-2xl flex items-center justify-center text-2xl font-black text-blue-600">
                  {idx + 1}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-lg font-black text-gray-800 truncate leading-tight">{song.title}</h4>
                  <p className="text-gray-500 font-bold text-sm truncate">{song.artist}</p>
                </div>
              </div>
              
              <a
                href={song.youtubeMusicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 flex-shrink-0 bg-red-100 group-hover:bg-red-500 text-red-600 group-hover:text-white rounded-2xl transition-all flex items-center justify-center shadow-sm"
                title="Play on YouTube Music"
              >
                <span className="text-xl">▶️</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RecapCard;
