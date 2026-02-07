import React from 'react';

// --- StoryScreen: The background of Plinky ---
export const StoryScreen: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="w-full max-w-4xl mx-auto p-8 md:p-12 bg-white/40 backdrop-blur-xl rounded-[4rem] shadow-2xl border-[12px] border-white/60 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-4xl md:text-6xl font-black text-[#1e3a8a] uppercase tracking-tighter" style={{ fontFamily: 'Fredoka One' }}>
        The Plinky Story
      </h2>
      <button 
        onClick={onBack}
        className="w-12 h-12 bg-[#FF6B6B] text-white rounded-full font-black text-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        ✕
      </button>
    </div>
    
    <div className="space-y-12 text-left">
      <section>
        <h3 className="text-2xl font-black text-[#FF6B6B] uppercase tracking-widest mb-4">Why we created Plinky 🎨</h3>
        <p className="text-xl md:text-2xl text-[#1e3a8a] leading-relaxed font-bold">
          We believe that every child is an artist, and every doodle holds a hidden melody. 
          Plinky was born from a simple dream: <span className="text-[#FF6B6B]">to turn the drawings on our fridges into real, playable magic.</span>
          We wanted to bridge the gap between static sketches and interactive digital performance, making creativity truly audible.
        </p>
      </section>

      <section className="bg-white/60 p-10 rounded-[3rem] border-4 border-white shadow-xl">
        <h3 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-widest mb-6 text-center">Our Value to You ✨</h3>
        <ul className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <li className="flex flex-col items-center text-center gap-4">
            <span className="text-5xl">🚀</span>
            <div>
              <p className="text-xl font-black text-[#1e3a8a] mb-2">Creative Confidence</p>
              <p className="text-lg text-[#1e3a8a]/70 font-medium">Empowering kids to see themselves as inventors and musicians through their own art.</p>
            </div>
          </li>
          <li className="flex flex-col items-center text-center gap-4">
            <span className="text-5xl">🧩</span>
            <div>
              <p className="text-xl font-black text-[#1e3a8a] mb-2">Learning Through Play</p>
              <p className="text-lg text-[#1e3a8a]/70 font-medium">Introducing complex musical concepts like notes, scales, and mixing without the steep learning curve.</p>
            </div>
          </li>
          <li className="flex flex-col items-center text-center gap-4">
            <span className="text-5xl">🤖</span>
            <div>
              <p className="text-xl font-black text-[#1e3a8a] mb-2">AI for Good</p>
              <p className="text-lg text-[#1e3a8a]/70 font-medium">Using Gemini AI to act as a magical interpreter that celebrates child-like imagination.</p>
            </div>
          </li>
        </ul>
      </section>
    </div>
    
    <div className="mt-12 flex justify-center">
      <button
        onClick={onBack}
        className="bg-[#1e3a8a] text-white px-16 py-6 rounded-full font-black uppercase tracking-widest shadow-[0_8px_0_#020A20] hover:translate-y-1 active:shadow-none transition-all text-xl"
      >
        LET'S GO!
      </button>
    </div>
  </div>
);