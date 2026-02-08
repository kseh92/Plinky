
import React from 'react';
import { HitZone, InstrumentType } from '../../services/types';

interface Props {
  image: string;
  hitZones: HitZone[];
  instrumentType: InstrumentType;
  onConfirm: () => void;
  onRetry: () => void;
}

const ScanConfirmationScreen: React.FC<Props> = ({ image, hitZones, instrumentType, onConfirm, onRetry }) => {
  const isPiano = instrumentType === 'Piano';
  const isDrum = instrumentType === 'Drum';
  const isHarp = instrumentType === 'Harp';

  // Calculate overall bounds for harp body decoration
  const getHarpBounds = () => {
    if (!isHarp || hitZones.length === 0) return null;
    const minX = Math.min(...hitZones.map(z => z.x));
    const minY = Math.min(...hitZones.map(z => z.y));
    const maxX = Math.max(...hitZones.map(z => z.x + z.width));
    const maxY = Math.max(...hitZones.map(z => z.y + z.height));
    return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
  };

  const harpBounds = getHarpBounds();

  const renderZone = (zone: HitZone, idx: number) => {
    const isSharp = zone.sound.includes('#') || zone.sound.includes('s');
    
    // Smooth lumpy radius for hand-drawn marker effect
    const pianoDoodleRadius = `${10 + Math.random() * 8}px ${8 + Math.random() * 8}px ${12 + Math.random() * 10}px ${6 + Math.random() * 10}px / ${8 + Math.random() * 8}px ${12 + Math.random() * 10}px ${10 + Math.random() * 8}px ${11 + Math.random() * 10}px`;
    
    const genericDoodleRadius = `${15 + Math.random() * 10}px ${8 + Math.random() * 8}px ${12 + Math.random() * 10}px ${10 + Math.random() * 8}px / ${10 + Math.random() * 8}px ${15 + Math.random() * 10}px ${12 + Math.random() * 8}px ${15 + Math.random() * 10}px`;
    
    const circleDoodleRadius = "45% 55% 48% 52% / 52% 48% 55% 45%";

    const baseStyle: React.CSSProperties = {
      left: `${zone.x}%`,
      top: `${zone.y}%`,
      width: `${zone.width}%`,
      height: `${zone.height}%`,
      position: 'absolute',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box',
      zIndex: 10,
    };

    if (isPiano) {
      if (isSharp) {
        return (
          <div
            key={idx}
            style={{
              ...baseStyle,
              backgroundColor: '#000', // Opaque black as requested
              border: `2px solid black`,
              borderRadius: '4px 4px 8px 8px',
              zIndex: 20,
              boxShadow: '1px 1px 3px rgba(0,0,0,0.4)', // Subtle drop shadow
              transform: `rotate(${(Math.random() - 0.5) * 3}deg)`, 
            }}
          />
        );
      } else {
        return (
          <div
            key={idx}
            style={{
              ...baseStyle,
              backgroundColor: 'rgba(255, 255, 255, 0.4)', // Semi-transparent white (0.4) as requested
              border: `4px solid black`, // Thick black marker outline
              borderRadius: pianoDoodleRadius,
              zIndex: 10,
              boxShadow: '2px 2px 5px rgba(0,0,0,0.15)', // Subtle paper shadow
              transform: `rotate(${(Math.random() - 0.5) * 2}deg) translateX(${(Math.random() - 0.5) * 2}px)`, 
            }}
          />
        );
      }
    }

    if (isDrum) {
      const isCymbal = zone.sound.includes('crash') || zone.sound.includes('hihat');
      return (
        <div
          key={idx}
          style={{
            ...baseStyle,
            backgroundColor: isCymbal ? 'rgba(251, 191, 36, 0.5)' : 'rgba(239, 68, 68, 0.4)',
            border: `${4 + Math.random() * 2}px solid ${isCymbal ? 'rgba(217, 119, 6, 0.6)' : 'rgba(185, 28, 28, 0.6)'}`,
            borderRadius: circleDoodleRadius,
            filter: 'drop-shadow(3px 3px 6px rgba(0,0,0,0.2))',
            transform: `rotate(${Math.sin(idx) * 4}deg) scale(${0.95 + Math.random() * 0.05})`,
          }}
        />
      );
    }

    if (isHarp) {
      return (
        <div key={idx} style={baseStyle}>
          <div 
            className="h-full w-2 relative"
            style={{ 
              backgroundColor: 'rgba(251, 191, 36, 0.85)', 
              boxShadow: '0 0 15px rgba(251, 191, 36, 0.6)',
              borderRadius: '15px',
              transform: `rotate(${(Math.random() - 0.5) * 2}deg) translateX(${(Math.random() - 0.5) * 2}px)`,
            }}
          />
        </div>
      );
    }

    return (
      <div
        key={idx}
        className="border-[6px] border-sky-500/60 bg-sky-200/40"
        style={{
          ...baseStyle,
          borderRadius: genericDoodleRadius,
          transform: `rotate(${(Math.random() - 0.5) * 4}deg)`,
        }}
      />
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center gap-10 py-12 animate-in zoom-in-95 duration-500">
      <div className="text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-xl uppercase tracking-tighter mb-2" style={{ fontFamily: 'Fredoka One' }}>
          Check Your Magic!
        </h2>
        <p className="text-xl text-white/70 font-black uppercase tracking-widest">
          Gemini turned your doodle into a {instrumentType}!
        </p>
      </div>

      <div className="relative w-full max-w-2xl bg-white rounded-[3rem] overflow-hidden border-[16px] border-white shadow-2xl group transform -rotate-1">
        <div className="relative w-full h-full">
           <img 
             src={image} 
             alt="Scanned Drawing" 
             className="w-full h-auto block opacity-80 group-hover:opacity-100 transition-opacity grayscale-[10%]" 
           />
           
           <div className="absolute inset-0 pointer-events-none">
             {/* Render more solid, stable Harp body decoration behind strings */}
             {isHarp && harpBounds && (
               <div 
                 className="absolute border-[16px] border-emerald-600/60 rounded-l-[4rem] rounded-r-[1rem]"
                 style={{
                   left: `${harpBounds.x - 3}%`,
                   top: `${harpBounds.y - 4}%`,
                   width: `${harpBounds.w + 6}%`,
                   height: `${harpBounds.h + 8}%`,
                   zIndex: 5,
                   boxShadow: 'inset 0 0 30px rgba(5, 150, 105, 0.3)',
                 }}
               />
             )}
             {hitZones.map((zone, idx) => renderZone(zone, idx))}
           </div>

           <div className="absolute inset-0 pointer-events-none overflow-hidden">
             <div className="w-full h-1 bg-sky-400/30 shadow-[0_0_10px_#38bdf8] absolute top-0 animate-[scan_4s_linear_infinite]" />
           </div>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-8 w-full mt-4">
        <button
          onClick={onRetry}
          className="px-10 py-6 bg-white/20 backdrop-blur-md text-white border-4 border-white rounded-full font-black text-xl hover:bg-white/30 transition-all uppercase tracking-widest shadow-xl flex items-center gap-3"
        >
          <span>✏️</span> Fix Drawing
        </button>
        <button
          onClick={onConfirm}
          className="px-14 py-6 bg-emerald-500 text-white rounded-full font-black text-2xl shadow-[0_10px_0_#065f46] hover:translate-y-1 active:shadow-none transition-all uppercase tracking-[0.1em] flex items-center gap-4 animate-pulse hover:animate-none"
        >
          <span>🎵</span> START THE SHOW!
        </button>
      </div>
      
      <div className="mt-4 flex items-center gap-2 bg-black/10 px-6 py-2 rounded-full border border-white/10">
         <span className="text-white/40 text-xs font-black uppercase tracking-widest italic">AI Interpretation is active</span>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; opacity: 0; }
          10%, 90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default ScanConfirmationScreen;
