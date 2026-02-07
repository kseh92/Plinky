import React from 'react';
import { InstrumentType } from '../../services/types';
import { INSTRUMENTS } from '../../services/constants';

interface PickScreenProps {
  onPick: (type: InstrumentType) => void;
  onExplore: () => void;
}

// --- PickScreen: Initial choice for the child ---
export const PickScreen: React.FC<PickScreenProps> = ({ onPick, onExplore }) => {
  return (
    <div className="w-full max-w-5xl mx-auto p-6 md:p-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <h2 className="text-4xl md:text-6xl font-black text-[#1e3a8a] mb-12 uppercase tracking-tighter" style={{ fontFamily: 'Fredoka One' }}>
        Pick Your Instrument
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16 grid-auto-rows-fr">
        {INSTRUMENTS.map((inst) => (
          <button
            key={inst.type}
            onClick={() => onPick(inst.type)}
            className={`${inst.color} h-full p-10 rounded-[3rem] shadow-[0_12px_0_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-105 transition-all flex flex-col items-center border-[10px] border-white/30 group`}
          >
            <div className="w-24 h-24 md:w-32 md:h-32 mb-6 group-hover:rotate-12 transition-transform duration-300 flex items-center justify-center">
              {inst.icon}
            </div>
            <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mt-auto">{inst.type}</span>
          </button>
        ))}
        
        {/* New Explore Card in Grid */}
        <button
          onClick={onExplore}
          className="bg-purple-500 h-full p-10 rounded-[3rem] shadow-[0_12px_0_rgba(0,0,0,0.1)] hover:-translate-y-2 hover:scale-105 transition-all flex flex-col items-center border-[10px] border-white/30 group"
        >
          <div className="w-24 h-24 md:w-32 md:h-32 mb-6 group-hover:scale-110 group-hover:rotate-[20deg] transition-transform duration-300 flex items-center justify-center text-6xl md:text-8xl">
            🪄
          </div>
          <span className="text-xl md:text-2xl font-black text-white uppercase tracking-tighter mt-auto">Explore</span>
        </button>
      </div>
      
      <p className="text-[#1e3a8a]/40 font-black uppercase tracking-[0.3em] text-sm">
        Ready to create something magical?
      </p>
    </div>
  );
};