
import React, { useState } from 'react';
import { AppMode } from '../../services/types';

interface ExploreScreenProps {
  onBack: () => void;
  onCreateCustom: (name: string) => void;
  onPickPreset: (mode: AppMode, name: string) => void;
}

// --- ExploreScreen: Create custom instruments via Gemini ---
export const ExploreScreen: React.FC<ExploreScreenProps> = ({ onBack, onCreateCustom, onPickPreset }) => {
  const [customName, setCustomName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customName.trim()) {
      onCreateCustom(customName.trim());
    }
  };

  const suggestions = [
    { name: 'Piano with wings', icon: '🎹🕊️', color: 'bg-blue-400' },
    { name: 'Snake shaped xylophone', icon: '🐍🎵', color: 'bg-emerald-400' },
    { name: 'Neon harp', icon: '🌈✨', color: 'bg-purple-400' }
  ];

  const presetModes: Record<string, AppMode> = {
    'Piano with wings': AppMode.PIANO,
    'Snake shaped xylophone': AppMode.XYLOPHONE,
    'Neon harp': AppMode.HARP
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 md:p-12 bg-white/40 backdrop-blur-xl rounded-[3rem] md:rounded-[4rem] shadow-2xl border-[8px] md:border-[12px] border-white/60 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-4xl md:text-7xl font-black text-[#1e3a8a] uppercase tracking-tighter" style={{ fontFamily: 'Fredoka One' }}>
            Explore Magic
          </h2>
          <p className="text-lg md:text-xl text-[#1e3a8a]/60 font-black uppercase tracking-widest mt-2">Create something never heard before!</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-[#FF6B6B] text-white px-10 md:px-12 py-5 rounded-full font-black text-xl md:text-2xl flex items-center justify-center shadow-[0_8px_0_#D64545] hover:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
        >
          Back
        </button>
      </div>

      <section className="mb-16 bg-gradient-to-br from-sky-400 via-indigo-500 to-sky-600 p-8 md:p-14 rounded-[3.5rem] md:rounded-[4.5rem] shadow-2xl border-[12px] border-white/30 relative overflow-hidden group">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/natural-paper.png')] opacity-20"></div>
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-white/20 rounded-full blur-[100px] animate-pulse"></div>
        
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto">
          <div className="w-24 h-24 bg-white/90 rounded-full flex items-center justify-center text-5xl shadow-2xl mb-8 group-hover:rotate-12 transition-transform duration-500">🪄</div>
          <h3 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6" style={{ fontFamily: 'Fredoka One' }}>
            Magic Instrument Creator
          </h3>
          <p className="text-white/90 text-xl md:text-2xl font-bold leading-relaxed mb-10 drop-shadow-sm">
            Draw a silly shape and hear it sing! <br /> Try a <span className="text-yellow-200 font-black italic">Star Harp</span> or <span className="text-pink-200 font-black italic">Cloud Drums</span>.
          </p>

          <form onSubmit={handleSubmit} className="w-full flex flex-col md:flex-row gap-5">
            <input 
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="What fun shape should we draw?"
              className="flex-1 px-10 py-7 rounded-full text-2xl font-black bg-white/20 text-white border-4 border-white/40 placeholder-white/60 focus:outline-none focus:border-white focus:bg-white/30 transition-all shadow-inner backdrop-blur-md"
            />
            <button 
              type="submit"
              disabled={!customName.trim()}
              className="bg-yellow-400 hover:bg-yellow-300 disabled:bg-gray-400 disabled:opacity-50 text-[#1e3a8a] px-12 py-7 rounded-full font-black text-2xl uppercase tracking-widest shadow-[0_10px_0_#ca8a04] hover:translate-y-1 active:translate-y-2 active:shadow-none transition-all flex items-center justify-center gap-4"
            >
              <span>🖋️</span> DRAW
            </button>
          </form>
        </div>
      </section>

      <div className="flex flex-col items-center gap-8 mb-12">
        <h4 className="text-3xl md:text-4xl font-black text-[#1e3a8a] uppercase tracking-widest" style={{ fontFamily: 'Fredoka One' }}>
          Do you want to try these?
        </h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {suggestions.map((item) => (
            <button
              key={item.name}
              onClick={() => onPickPreset(presetModes[item.name] || AppMode.PIANO, item.name)}
              className={`${item.color} p-10 rounded-[3rem] shadow-[0_12px_0_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-105 transition-all flex flex-col items-center border-[10px] border-white/30 group`}
            >
              <span className="text-7xl mb-4 group-hover:animate-bounce">{item.icon}</span>
              <span className="text-xl font-black text-white uppercase tracking-tighter text-center leading-tight">{item.name}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="mt-16 py-8 border-t-8 border-dotted border-[#1e3a8a]/10 text-center">
         <p className="text-[#1e3a8a]/30 font-black text-xs uppercase tracking-[0.5em]">Every doodle is a new sound adventure</p>
      </div>
    </div>
  );
};
