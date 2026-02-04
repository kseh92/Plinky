import React from 'react';
import { getInstrumentIcon } from '../services/constants';

interface JamItem {
  id: string;
  title: string;
  date: string;
  instrument: string;
  color: string;
  coverUrl: string;
}

const MY_JAMS: JamItem[] = [
  { id: 'j1', title: 'My First Symphony', date: '2023-10-24', instrument: 'Piano', color: 'bg-blue-400', coverUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=400' },
  { id: 'j2', title: 'Doodle Rocker', date: '2023-11-05', instrument: 'Drum', color: 'bg-red-400', coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?q=80&w=400' },
  { id: 'j3', title: 'Sunset Harp', date: '2023-12-12', instrument: 'Harp', color: 'bg-emerald-400', coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=400' },
  { id: 'j4', title: 'Lunchtime Jam', date: '2024-01-20', instrument: 'Piano', color: 'bg-indigo-400', coverUrl: 'https://images.unsplash.com/photo-1496293455970-f8581aae0e3c?q=80&w=400' },
];

const VinylJam: React.FC<{ item: JamItem }> = ({ item }) => {
  return (
    <div className="group relative w-full bg-white/60 backdrop-blur-md rounded-[2.5rem] p-6 border-4 border-white shadow-lg hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 flex flex-col gap-6">
      
      {/* Vinyl Record Visual - Centered and Smaller */}
      <div className="relative w-32 h-32 mx-auto flex-shrink-0 group/record perspective-1000">
        {/* The Record Disc */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-[#121212] rounded-full shadow-xl transition-all duration-700 ease-in-out transform group-hover/record:translate-x-8 group-hover/record:rotate-[360deg]">
          {/* Grooves */}
          <div className="absolute inset-1 rounded-full border border-white/5 opacity-30"></div>
          <div className="absolute inset-3 rounded-full border border-white/5 opacity-30"></div>
          <div className="absolute inset-5 rounded-full border border-white/5 opacity-30"></div>
          {/* Label */}
          <div className="absolute inset-[32%] rounded-full overflow-hidden bg-gray-800 border-[1.5px] border-black/80 z-20">
            <img src={item.coverUrl} alt="label" className="w-full h-full object-cover" />
          </div>
          {/* Center Hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-white rounded-full z-30"></div>
        </div>
        
        {/* The Sleeve */}
        <div className="absolute inset-0 bg-[#282828] rounded-xl shadow-lg z-40 overflow-hidden border border-white/10 transition-transform duration-500 group-hover/record:-translate-x-2">
          <img src={item.coverUrl} alt="sleeve" className="w-full h-full object-cover opacity-80" />
          <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/10"></div>
          <div className="absolute bottom-2 left-2 bg-white/90 w-8 h-8 p-1.5 rounded-full shadow-md">
            {getInstrumentIcon(item.instrument)}
          </div>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1 text-center overflow-hidden flex flex-col">
        <h3 className="text-xl font-black text-[#1e3a8a] truncate mb-0.5">{item.title}</h3>
        <p className="text-[#1e3a8a]/40 font-black uppercase tracking-widest text-[10px] mb-4">Recorded on {item.date}</p>
        
        <div className="mt-auto flex justify-center gap-3">
          <button className="bg-[#1e3a8a] text-white p-3 rounded-full font-black uppercase tracking-widest text-[9px] shadow-[0_3px_0_#020A20] hover:translate-y-0.5 hover:shadow-none transition-all flex items-center justify-center gap-1.5 flex-1">
            <span>▶️</span> Play
          </button>
          <button className="bg-white text-[#1e3a8a] border-2 border-[#1e3a8a] p-3 rounded-full font-black uppercase tracking-widest text-[9px] hover:bg-[#1e3a8a] hover:text-white transition-all flex items-center justify-center gap-1.5 flex-1">
            <span>🔗</span> Share
          </button>
        </div>
      </div>
    </div>
  );
};

const YourJamPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-8 md:p-12 bg-white/20 backdrop-blur-xl rounded-[4rem] shadow-2xl border-[12px] border-white/40 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-4xl md:text-7xl font-black text-[#1e3a8a] uppercase tracking-tighter" style={{ fontFamily: 'Fredoka One' }}>
            Your Jam Jar
          </h2>
          <p className="text-xl text-[#1e3a8a]/60 font-black uppercase tracking-widest mt-2">Personal Collection</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-[#FF6B6B] text-white px-8 py-4 rounded-full font-black text-lg flex items-center justify-center shadow-[0_6px_0_#D64545] hover:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
        >
          New Jam session 🎨
        </button>
      </div>

      {MY_JAMS.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {MY_JAMS.map((item) => (
            <VinylJam key={item.id} item={item} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="text-9xl mb-8">🫙</div>
          <h3 className="text-3xl font-black text-[#1e3a8a] uppercase tracking-widest">Your Jar is Empty!</h3>
          <p className="text-[#1e3a8a]/60 font-bold mt-4 mb-10">Go record some magic melodies to fill it up.</p>
          <button
            onClick={onBack}
            className="bg-[#1e3a8a] text-white px-16 py-6 rounded-full font-black text-2xl uppercase tracking-widest shadow-[0_10px_0_#020A20] hover:translate-y-2 active:shadow-none transition-all"
          >
            Start Jamming
          </button>
        </div>
      )}

      <div className="mt-20 py-8 border-t-8 border-dashed border-[#1e3a8a]/10">
         <p className="text-[#1e3a8a]/30 font-black text-[10px] uppercase tracking-[0.5em]">Plinky Cloud Storage Enabled</p>
      </div>
    </div>
  );
};

export default YourJamPage;