// src/screens/LandingScreen.tsx
import React from 'react';
import { CurvedLineDoodle, SmallCurvedDoodle } from '../decor/doodles';
import { RedMonster } from '../layout/RedMonster';

// --- LandingScreen: Entry point for the app ---
export const LandingScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="w-full min-h-screen flex flex-col items-center justify-between relative overflow-hidden">
   
   
    {/* Decorative background doodles */}
    <CurvedLineDoodle className="absolute left-[-5%] top-[30%] w-[500px] opacity-[0.07] -rotate-12 pointer-events-none z-0" />
    <CurvedLineDoodle className="absolute right-[-10%] top-[60%] w-[600px] opacity-[0.05] rotate-[160deg] pointer-events-none z-0" />
    <SmallCurvedDoodle className="absolute left-[12%] top-[5%] w-[100px] opacity-[0.12] rotate-12 pointer-events-none z-0" />
    <SmallCurvedDoodle className="absolute right-[15%] top-[8%] w-[80px] opacity-[0.08] -rotate-[15deg] pointer-events-none z-0" />

    <div className="h-4 md:h-12" />

    {/* Content Area */}
    <div className="relative z-50 flex flex-col items-center w-full px-6 pt-24">
      <div className="flex flex-col items-center pointer-events-none animate-in fade-in slide-in-from-bottom-10 duration-1000">
        <h1 className="text-[90px] md:text-[210px] text-white font-black drop-shadow-[0_12px_12px_rgba(0,0,0,0.1)] leading-none select-none" style={{ fontFamily: 'Fredoka One' }}>
          Plinky
           </h1>
              <p className="text-xs md:text-base text-[#1e3a8a]/70 font-black uppercase tracking-[0.4em] drop-shadow-sm -mt-2 mb-8 md:mb-12">
          Doodle Symphony for Kids
        </p>
      </div>

      <button
        onClick={onStart}
        className="group relative bg-[#FF6B6B] text-white mt-12 px-16 py-8 md:px-28 md:py-10 rounded-full text-5xl md:text-7xl font-black shadow-[0_15px_0_#D64545] hover:shadow-[0_8px_0_#D64545] hover:translate-y-2 active:shadow-none active:translate-y-[15px] transition-all duration-150 transform hover:scale-105 active:scale-95"
      >
        START
        <div className="absolute -inset-8 bg-white/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </button>
    </div>

    {/* The Red Monster character at the bottom */}
    <div className="relative w-full max-w-[2000px] aspect-[1514/770] scale-125 origin-bottom transition-all duration-700 ease-out overflow-visible pointer-events-none z-20">
      <RedMonster className="w-full h-full" />
    </div>
  </div>
);
