import React from 'react';
import cosmicSquare from '../../assets/cosmic_square.png';
import marshmallowKeys from '../../assets/marshmallow_keys.png';
import neonHarp from '../../assets/neon_harp.png';
import skyblueJams from '../../assets/skyblue_james.png';
import monsterBeats from '../../assets/monster_beats.png';
import rainbowStrings from '../../assets/rainbow_strings.png';

interface GalleryItem {
  id: string;
  title: string;
  artist: string;
  likes: number;
  color: string;
  instrument: string;
  coverUrl: string;
}

const DUMMY_GALLERY: GalleryItem[] = [
  { id: '1', title: 'Cosmic Snare', artist: '@LittleMozart', likes: 245, color: 'bg-indigo-400', instrument: '🥁', coverUrl: cosmicSquare },
  { id: '2', title: 'Marshmallow Keys', artist: '@DoodleQueen', likes: 189, color: 'bg-pink-400', instrument: '🎹', coverUrl: marshmallowKeys },
  { id: '3', title: 'Neon Harp', artist: '@RockstarKid', likes: 562, color: 'bg-emerald-400', instrument: '🎼', coverUrl: neonHarp },
  { id: '4', title: 'Skyblue Jams', artist: '@PlinkyPro', likes: 1024, color: 'bg-sky-400', instrument: '🎹', coverUrl: skyblueJams },
  { id: '5', title: 'Monster Beats', artist: '@RedMonsterFan', likes: 731, color: 'bg-red-400', instrument: '🥁', coverUrl: monsterBeats },
  { id: '6', title: 'Rainbow Strings', artist: '@Artiste', likes: 412, color: 'bg-yellow-400', instrument: '🎹', coverUrl: rainbowStrings },
];

export const GalleryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  return (
    <div className="w-full max-w-6xl mx-auto p-8 md:p-12 bg-white/40 backdrop-blur-xl rounded-[4rem] shadow-2xl border-[12px] border-white/60 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-4xl md:text-7xl font-black text-[#1e3a8a] uppercase tracking-tighter" style={{ fontFamily: 'Fredoka One' }}>
            Doodle Gallery
          </h2>
          <p className="text-xl text-[#1e3a8a]/60 font-black uppercase tracking-widest mt-2">Creations by Global Rockstars</p>
        </div>
        <button 
          onClick={onBack}
          className="bg-[#FF6B6B] text-white px-10 py-4 rounded-full font-black text-xl flex items-center justify-center shadow-[0_8px_0_#D64545] hover:translate-y-1 active:shadow-none transition-all uppercase tracking-widest"
        >
          Back to Jamming
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
        {DUMMY_GALLERY.map((item) => (
          <div 
            key={item.id} 
            className="group bg-white rounded-[3rem] border-8 border-white shadow-xl overflow-hidden hover:-translate-y-4 hover:scale-102 transition-all duration-300"
          >
            {/* Album Cover */}
            <div className="relative aspect-square overflow-hidden">
              <img 
                src={item.coverUrl} 
                alt={item.title} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-8">
                 <button className="bg-white/90 backdrop-blur-md w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg hover:scale-110 active:scale-95 transition-transform">
                   ▶️
                 </button>
              </div>
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full font-black text-xl shadow-md">
                {item.instrument}
              </div>
            </div>

            {/* Info Section */}
            <div className="p-8 text-left">
              <h3 className="text-2xl font-black text-[#1e3a8a] truncate mb-1">{item.title}</h3>
              <p className="text-[#1e3a8a]/60 font-bold mb-6">{item.artist}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                   <div className="flex -space-x-2">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-sky-200" />
                      ))}
                   </div>
                   <span className="text-xs font-black text-[#1e3a8a]/40 ml-2">Liked by many</span>
                </div>
                
                <button className="flex items-center gap-2 bg-[#9ECAFF]/20 hover:bg-[#9ECAFF]/40 px-5 py-2 rounded-full transition-colors group/btn">
                  <span className="text-xl group-hover/btn:scale-125 transition-transform">👍</span>
                  <span className="font-black text-[#1e3a8a]">{item.likes}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-20 py-10 border-t-8 border-dashed border-[#1e3a8a]/10 flex flex-col items-center">
         <p className="text-2xl font-black text-[#1e3a8a]/30 uppercase tracking-[0.3em] mb-8">Ready to join them?</p>
         <button
          onClick={onBack}
          className="bg-[#1e3a8a] text-white px-16 py-6 rounded-full font-black text-2xl uppercase tracking-widest shadow-[0_10px_0_#020A20] hover:translate-y-2 active:shadow-none transition-all"
        >
          Record My Masterpiece
        </button>
      </div>
    </div>
  );
};

export default GalleryPage;
