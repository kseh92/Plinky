
// src/screens/LandingScreen.tsx
import React from 'react';
import { CurvedLineDoodle, SmallCurvedDoodle } from '../decor/doodles';
import { RedMonster } from '../layout/RedMonster';

// --- LandingScreen: Entry point for the app ---
export const LandingScreen: React.FC<{ onStart: () => void }> = ({ onStart }) => (
  <div className="w-full min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-transparent">
   
    {/* Decorative background doodles - subtle enough to keep skyblue dominant */}
    <CurvedLineDoodle className="absolute left-[-5%] top-[10%] w-[500px] opacity-[0.05] -rotate-12 pointer-events-none z-0" />
    <CurvedLineDoodle className="absolute right-[-10%] top-[70%] w-[600px] opacity-[0.05] rotate-[160deg] pointer-events-none z-0" />
    
    {/* Content Area */}
    <div className="relative z-50 flex flex-col items-center w-full px-6 max-w-4xl">
      
      {/* Title Unit */}
      <div className="flex flex-col items-center text-center animate-in fade-in slide-in-from-top-10 duration-1000">
        <h1 className="text-[100px] md:text-[180px] text-white font-black drop-shadow-[0_10px_10px_rgba(0,0,0,0.1)] leading-none select-none" style={{ fontFamily: 'Fredoka One' }}>
          Plinky
        </h1>
        <p className="text-sm md:text-2xl text-[#1e3a8a] font-black uppercase tracking-[0.3em] drop-shadow-sm mt-2 mb-4">
          Doodle Symphony for Kids
        </p>
      </div>

      {/* Red Monster - Positioned "under" the title as requested */}
      <div className="w-full max-w-[400px] md:max-w-[600px] aspect-[1514/770] animate-float my-4 md:my-8 relative">
        <RedMonster className="w-full h-full drop-shadow-2xl" />
        {/* Playful glow behind the monster */}
        <div className="absolute inset-0 bg-white/20 rounded-full blur-[80px] -z-10 scale-75"></div>
      </div>

      {/* Start Action */}
      <div className="animate-in fade-in zoom-in-50 duration-700 delay-500">
        <button
          onClick={onStart}
          className="group relative bg-[#FF6B6B] text-white px-20 py-8 md:px-32 md:py-10 rounded-full text-4xl md:text-6xl font-black shadow-[0_15px_0_#D64545] hover:shadow-[0_8px_0_#D64545] hover:translate-y-2 active:shadow-none active:translate-y-[15px] transition-all duration-150 transform hover:scale-110 active:scale-95 flex items-center gap-4"
        >
          <span>START</span>
          <span className="text-3xl md:text-5xl group-hover:rotate-12 transition-transform">🎵</span>
          <div className="absolute -inset-8 bg-white/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </div>

      {/* Floating Notes for atmosphere */}
      <div className="absolute -left-10 top-1/2 text-white/20 text-6xl rotate-12 animate-wobble">♪</div>
      <div className="absolute -right-10 top-1/3 text-white/20 text-7xl -rotate-12 animate-pulse">♬</div>
    </div>

    <style>{`
      @keyframes float-gentle {
        0%, 100% { transform: translateY(0) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(2deg); }
      }
      .animate-float-gentle {
        animation: float-gentle 5s infinite ease-in-out;
      }
    `}</style>
  </div>
);
