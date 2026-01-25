
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
        <div className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest mb-6 shadow-md">
          The Gemini Critic Says:
        </div>
        
        <blockquote className="text-2xl md:text-3xl font-black text-gray-800 text-center mb-8 leading-tight italic">
          "{recap.criticQuote}"
        </blockquote>
        
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-px bg-blue-300" />
          <p className="text-lg font-bold text-blue-600 text-center uppercase tracking-tighter">
            {recap.artistComparison}
          </p>
          <div className="w-12 h-px bg-blue-300" />
        </div>

        <div className="w-full bg-white rounded-3xl p-6 shadow-lg border-2 border-indigo-100 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center text-3xl">🎧</div>
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Recommended Track</p>
              <h4 className="text-xl font-black text-gray-800">{recap.recommendedSong.title}</h4>
              <p className="text-gray-600 font-bold">{recap.recommendedSong.artist}</p>
            </div>
          </div>
          
          <a
            href={recap.recommendedSong.youtubeMusicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-sm transition-colors shadow-md flex items-center gap-2 whitespace-nowrap"
          >
            PLAY ON YOUTUBE MUSIC ⏯️
          </a>
        </div>
      </div>
    </div>
  );
};

export default RecapCard;
