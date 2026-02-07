import React from 'react';

// --- Header Component ---

export const GlobalHeader: React.FC<{ onHome: () => void; onStory: () => void; onGallery: () => void; onYourJam: () => void; onSettings: () => void; onExplore: () => void; currentStep: string }> = ({ onHome, onStory, onGallery, onYourJam, onSettings, onExplore, currentStep }) => (
  <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-6 pointer-events-none">
    <nav className="flex items-center gap-6 md:gap-12 bg-white/20 backdrop-blur-md px-6 md:px-10 py-3 rounded-full border border-white/40 shadow-xl pointer-events-auto">
      <div 
        onClick={onHome} 
        className="text-xl md:text-2xl text-white font-black cursor-pointer hover:scale-110 transition-transform select-none drop-shadow-[0_2px_2px_rgba(0,0,0,0.1)]" 
        style={{ fontFamily: 'Fredoka One' }}
      >
        PLINKY
      </div>
      <div className="flex items-center gap-4 md:gap-8 text-[9px] md:text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest">
        <button 
          onClick={onStory} 
          className={`hover:text-white transition-colors ${currentStep === 'story' ? 'text-white' : ''}`}
        >
          Story
        </button>
        <button 
          onClick={onYourJam}
          className={`hover:text-white transition-colors ${currentStep === 'yourJam' ? 'text-white' : ''}`}
        >
          Your Jam
        </button>
        <button 
          onClick={onGallery}
          className={`hover:text-white transition-colors ${currentStep === 'gallery' ? 'text-white' : ''}`}
        >
          Gallery
        </button>
        <button 
          onClick={onSettings}
          className={`hover:text-white transition-colors ${currentStep === 'settings' ? 'text-white' : ''}`}
        >
          Settings
        </button>
      </div>
    </nav>
  </header>
);