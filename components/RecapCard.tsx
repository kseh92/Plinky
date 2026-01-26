
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
        <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-2 shadow-md">
          The Gemini Critic Says:
        </div>
        
        <p className="text-blue-500 font-black text-xl mb-6 uppercase tracking-tighter text-center">
          aka "{recap.performanceStyle}"
        </p>
        
        <blockquote className="text-2xl md:text-3xl font-black text-gray-800 text-center mb-8 leading-tight italic max-w-lg">
          "{recap.criticQuote}"
        </blockquote>
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-12 h-px bg-blue-300" />
          <p className="text-lg font-bold text-blue-600 text-center uppercase tracking-tighter">
            {recap.artistComparison}
          </p>
          <div className="w-12 h-px bg-blue-300" />
        </div>

        <div className="w-full space-y-4">
          <div className="flex items-center gap-2 mb-2">
             <span className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em]">Your Custom Mixtape</span>
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
