
import React from 'react';
import { InstrumentType } from '../../services/types';
import { TEMPLATE_IMAGES } from '../../services/constants';

interface ProvideScreenProps {
  selectedType: InstrumentType;
  isLoading: boolean;
  onBack: () => void;
  onScan: () => void;
  onQuickStart: () => void;
  onShowBlueprint: () => void;
}

// --- ProvideScreen: Decide between scanning or quick start ---
export const ProvideScreen: React.FC<ProvideScreenProps> = ({
  selectedType, isLoading, onBack, onScan, onQuickStart, onShowBlueprint
}) => {
  const templateImg = TEMPLATE_IMAGES[selectedType] || TEMPLATE_IMAGES['Piano'];

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-12 animate-in zoom-in-95 duration-500">
      <button onClick={onBack} className="absolute top-10 left-10 text-[#1e3a8a] font-black text-xl hover:scale-110 transition-transform">← BACK</button>
      
      <h2 className="text-4xl md:text-6xl font-black text-[#1e3a8a] mb-6 uppercase tracking-tighter" style={{ fontFamily: 'Fredoka One' }}>
        {selectedType} Time!
      </h2>
      <p className="text-xl text-[#1e3a8a]/60 font-black mb-12 uppercase tracking-widest">How do you want to start?</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Option 1: Quick Start */}
        <div className="bg-white/80 p-8 rounded-[3rem] border-4 border-white shadow-2xl flex flex-col items-center">
          <div className="text-6xl mb-6">⚡</div>
          <h3 className="text-2xl font-black text-[#1e3a8a] mb-4 uppercase">Quick Start</h3>
          <p className="text-gray-500 font-bold mb-8">Use our reference drawing to start playing immediately!</p>
          {templateImg && (
            <img src={templateImg} alt="Reference" className="w-full h-40 object-contain mb-8 rounded-xl border-2 border-dashed border-gray-200 p-2" />
          )}
          <button
            onClick={onQuickStart}
            className="w-full py-5 bg-[#1e3a8a] text-white rounded-full font-black text-xl shadow-[0_8px_0_#020A20] hover:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
          >
            Go Live!
          </button>
        </div>

        {/* Option 2: Scan Drawing */}
        <div className="bg-white/80 p-8 rounded-[3rem] border-4 border-white shadow-2xl flex flex-col items-center">
          <div className="text-6xl mb-6">🎨</div>
          <h3 className="text-2xl font-black text-[#1e3a8a] mb-4 uppercase">Scan My Doodle</h3>
          <p className="text-gray-500 font-bold mb-8">Draw your own instrument and let Gemini scan it!</p>
          <div className="flex gap-4 mb-8 w-full">
            <button
              onClick={onShowBlueprint}
              disabled={isLoading}
              className="flex-1 py-4 bg-sky-400 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-[0_4px_0_#0ea5e9] hover:translate-y-0.5 active:shadow-none transition-all"
            >
              See Blueprint
            </button>
          </div>
          <button
            onClick={onScan}
            className="w-full py-5 bg-[#FF6B6B] text-white rounded-full font-black text-xl shadow-[0_8px_0_#D64545] hover:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
          >
            Open Camera
          </button>
        </div>
      </div>
    </div>
  );
};
