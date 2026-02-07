import React from 'react';
import { RecapData } from '../../services/types';

interface Props {
  recap: RecapData;
}

const VinylRecord: React.FC<{ imageUrl: string, isSpinning?: boolean }> = ({ imageUrl, isSpinning = true }) => {
  return (
    <div className="relative w-28 h-28 md:w-44 md:h-44 flex-shrink-0 group perspective-1000">
      {/* Vinyl Disk - Slides out and spins */}
      <div className={`absolute top-0 left-0 w-28 h-28 md:w-44 md:h-44 bg-[#121212] rounded-full shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-700 ease-in-out transform group-hover:translate-x-1/2 group-hover:rotate-[360deg] ${isSpinning ? 'animate-spin' : ''}`} 
           style={{ animationDuration: '4s' }}>
        
        {/* Vinyl Grooves Texture */}
        <div className="absolute inset-0 rounded-full border-[1px] border-white/5 opacity-40"></div>
        <div className="absolute inset-2 rounded-full border-[1px] border-white/5 opacity-40"></div>
        <div className="absolute inset-4 rounded-full border-[1px] border-white/5 opacity-40"></div>
        <div className="absolute inset-6 rounded-full border-[1px] border-white/5 opacity-40"></div>
        <div className="absolute inset-8 rounded-full border-[1px] border-white/5 opacity-40"></div>
        <div className="absolute inset-10 rounded-full border-[1px] border-white/5 opacity-40"></div>
        
        {/* Center Label (Album Art) */}
        <div className="absolute inset-[32%] rounded-full overflow-hidden bg-gray-800 border-2 border-black/80 shadow-inner z-20">
          <img src={imageUrl} alt="label" className="w-full h-full object-cover" onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400';
          }} />
          {/* Glossy overlay for the label */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
        </div>
        
        {/* Center Hole */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 md:w-3 h-2 md:h-3 bg-white rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] z-30"></div>
        
        {/* High Gloss Shine on Record */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 via-transparent to-black/30 pointer-events-none"></div>
      </div>
      
      {/* Album Sleeve (Front) */}
      <div className="absolute inset-0 bg-[#282828] rounded-xl shadow-2xl z-40 overflow-hidden border border-white/5 transition-transform duration-500 group-hover:-translate-x-2">
        <img src={imageUrl} alt="sleeve" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400';
        }} />
        {/* Sleeve Texture & Depth */}
        <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10"></div>
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black/20 shadow-[2px_0_10px_rgba(0,0,0,0.3)]"></div>
      </div>
    </div>
  );
};

const RecapCard: React.FC<Props> = ({ recap }) => {
  return (
    <div className="w-full bg-[#1e1e1e] border-4 border-sky-400/30 rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-10 shadow-2xl relative overflow-hidden text-white">
      {/* Background decoration */}
      <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 blur-[100px] rounded-full"></div>
      <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-indigo-500/10 blur-[100px] rounded-full"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        <div className="bg-sky-500 text-white px-6 md:px-8 py-2 rounded-full text-[10px] md:text-sm font-black uppercase tracking-[0.3em] mb-6 md:mb-8 shadow-[0_0_20px_rgba(14,165,233,0.4)] border border-sky-400">
          GEMINI AI STUDIO
        </div>
        
        {recap.genre && (
          <div className="mb-4 md:mb-6 text-sky-400 font-black px-4 md:px-6 py-2 bg-black/40 backdrop-blur-md rounded-2xl border border-sky-400/20 shadow-xl text-sm md:text-lg uppercase tracking-[0.2em] animate-pulse">
            Genre: {recap.genre}
          </div>
        )}

        <div className="text-center mb-8 md:mb-10">
          <p className="text-sky-300 font-black text-lg md:text-2xl mb-2 md:mb-4 uppercase tracking-tighter leading-none italic opacity-80">
            "{recap.performanceStyle}"
          </p>
          <blockquote className="text-2xl md:text-5xl font-black text-white text-center leading-tight drop-shadow-lg max-w-2xl mx-auto">
            {recap.criticQuote}
          </blockquote>
        </div>
        
        <div className="flex items-center gap-3 md:gap-6 mb-8 md:mb-12 w-full max-w-lg px-4">
          <div className="flex-1 h-[2px] bg-gradient-to-r from-transparent to-sky-400/40" />
          <p className="text-xs md:text-xl font-bold text-sky-200 text-center uppercase tracking-widest whitespace-nowrap">
            Future {recap.artistComparison}
          </p>
          <div className="flex-1 h-[2px] bg-gradient-to-l from-transparent to-sky-400/40" />
        </div>

        <div className="w-full space-y-6 md:space-y-10">
          <div className="flex items-center gap-4 mb-2 md:mb-4">
             <span className="text-[10px] md:text-sm font-black text-sky-400 uppercase tracking-[0.4em] pl-2 whitespace-nowrap">Studio Picks</span>
             <div className="h-[1px] flex-1 bg-gradient-to-r from-sky-400/40 to-transparent" />
          </div>
          
          <div className="grid grid-cols-1 gap-6 md:gap-12">
            {recap.recommendedSongs.map((song, idx) => (
              <div 
                key={idx}
                className="w-full bg-white/5 backdrop-blur-md rounded-[2rem] md:rounded-[2.5rem] p-4 md:p-6 md:pr-10 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-12 group hover:bg-white/10 hover:border-sky-400/50 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] transition-all duration-500"
              >
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10 overflow-visible w-full">
                  <VinylRecord imageUrl={song.coverImageUrl} />
                  
                  <div className="flex flex-col justify-center text-center md:text-left overflow-hidden flex-1">
                    <div className="flex items-center justify-center md:justify-start gap-2 md:gap-3 mb-1 md:mb-2">
                       <span className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-sky-500 text-black flex items-center justify-center font-black text-[10px] md:text-xs">0{idx + 1}</span>
                       <span className="text-sky-400 text-[8px] md:text-xs font-black uppercase tracking-widest">Selected Track</span>
                    </div>
                    <h4 className="text-xl md:text-3xl font-black text-white truncate leading-tight group-hover:text-sky-300 transition-colors mb-0.5 md:mb-1">{song.title}</h4>
                    <p className="text-gray-400 font-bold text-sm md:text-lg truncate mb-3 md:mb-4">{song.artist}</p>
                    
                    <div className="flex items-center justify-center md:justify-start gap-2">
                      <div className="h-1 w-8 md:w-12 bg-sky-500 rounded-full"></div>
                      <div className="h-1 w-3 md:w-4 bg-sky-500/40 rounded-full"></div>
                      <div className="h-1 w-1 md:w-2 bg-sky-500/20 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <a
                  href={song.youtubeMusicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-14 h-14 md:w-20 md:h-20 flex-shrink-0 bg-red-600 text-white rounded-full transition-all flex items-center justify-center shadow-[0_10px_25px_rgba(220,38,38,0.4)] hover:bg-red-500 hover:scale-110 active:scale-95 group-hover:rotate-[360deg] duration-700"
                  title="Play on YouTube Music"
                >
                  <span className="text-2xl md:text-4xl pl-1">▶</span>
                </a>
              </div>
            ))}
          </div>
        </div>

      </div>
      
      {/* Decorative footer line */}
      <div className="mt-12 md:mt-16 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mt-4 text-center text-sky-500/40 text-[8px] md:text-[10px] font-black tracking-[0.5em] uppercase">
        Powered by Google Gemini 3.0
      </div>
    </div>
  );
};

export default RecapCard;
