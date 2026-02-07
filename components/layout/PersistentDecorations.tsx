
import React from 'react';
import { ScribbleDoodle, WaveDoodle, GreenPlantDoodle } from '../decor/doodles';
import { MessySun, ShakyStar } from '../decor/crayonDoodles';

// --- PersistentDecorations: Background doodles visible on most screens ---
export const PersistentDecorations: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <ScribbleDoodle className="absolute top-[15%] left-[5%] w-32 h-32 opacity-20 rotate-12 animate-float" />
      <WaveDoodle className="absolute bottom-[10%] left-[-10%] w-[120%] opacity-10" />
      <GreenPlantDoodle className="absolute bottom-[5%] right-[5%] w-24 h-24 opacity-30 -rotate-12" />
      <MessySun className="absolute top-[10%] right-[10%] w-40 h-40 opacity-15 animate-orbit" />
      <ShakyStar className="absolute top-[40%] left-[8%] w-12 h-12 opacity-40 animate-pulse text-pink-300" />
      <ShakyStar className="absolute bottom-[40%] right-[12%] w-16 h-16 opacity-30 animate-pulse text-sky-300" style={{ animationDelay: '2s' }} />
    </div>
  );
};
