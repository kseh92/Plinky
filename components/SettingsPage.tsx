import React, { useState } from 'react';
import { InstrumentType } from '../services/types';
import { INSTRUMENTS } from '../services/constants';

const SettingsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [defaultInstrument, setDefaultInstrument] = useState<InstrumentType>('Piano');
  const [volumeGuard, setVolumeGuard] = useState(true);
  const [playtimeLimit, setPlaytimeLimit] = useState('30m');
  const [privacyMode, setPrivacyMode] = useState(false);
  const [gallerySharing, setGallerySharing] = useState(true);

  return (
    <div className="w-full max-w-4xl mx-auto p-8 md:p-12 bg-white/40 backdrop-blur-xl rounded-[4rem] shadow-2xl border-[12px] border-white/60 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <div className="flex justify-between items-center mb-12">
        <h2 className="text-4xl md:text-7xl font-black text-[#1e3a8a] uppercase tracking-tighter" style={{ fontFamily: 'Fredoka One' }}>
          Settings
        </h2>
        <button 
          onClick={onBack}
          className="w-16 h-16 bg-[#FF6B6B] text-white rounded-full font-black text-3xl flex items-center justify-center shadow-[0_8px_0_#D64545] hover:translate-y-1 active:shadow-none transition-all"
        >
          ✕
        </button>
      </div>

      <div className="space-y-10 text-left">
        {/* Default Instrument Section */}
        <section className="bg-white/60 p-8 md:p-10 rounded-[3rem] border-4 border-white shadow-xl">
          <h3 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-widest mb-6">Default Instrument 🎹</h3>
          <div className="flex flex-wrap gap-4">
            {INSTRUMENTS.map((inst) => (
              <button
                key={inst.type}
                onClick={() => setDefaultInstrument(inst.type)}
                className={`flex-1 min-w-[140px] p-6 rounded-[2rem] border-4 transition-all flex flex-col items-center gap-2 ${
                  defaultInstrument === inst.type 
                    ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white scale-105 shadow-xl' 
                    : 'bg-white/80 border-white text-[#1e3a8a] hover:bg-white'
                }`}
              >
                <span className="text-4xl">{inst.icon}</span>
                <span className="font-black uppercase tracking-wider text-sm">{inst.type}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Parental Controls Section */}
        <section className="bg-[#1e3a8a]/5 p-8 md:p-10 rounded-[4rem] border-[6px] border-white shadow-inner">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl">🛡️</span>
            <h3 className="text-2xl font-black text-[#1e3a8a] uppercase tracking-widest">Parental Controls</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Volume Guard */}
            <div className="bg-white/80 p-6 rounded-[2.5rem] border-2 border-white flex items-center justify-between shadow-md">
              <div className="pr-4">
                <p className="font-black text-[#1e3a8a] uppercase tracking-wider">Hearing Guard</p>
                <p className="text-xs text-[#1e3a8a]/60 font-bold">Limits max volume for safe play</p>
              </div>
              <button 
                onClick={() => setVolumeGuard(!volumeGuard)}
                className={`w-16 h-8 rounded-full relative transition-colors ${volumeGuard ? 'bg-green-400' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${volumeGuard ? 'translate-x-9' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Playtime Limit */}
            <div className="bg-white/80 p-6 rounded-[2.5rem] border-2 border-white flex items-center justify-between shadow-md">
              <div>
                <p className="font-black text-[#1e3a8a] uppercase tracking-wider">Playtime Limit</p>
                <p className="text-xs text-[#1e3a8a]/60 font-bold">Automatic break reminders</p>
              </div>
              <select 
                value={playtimeLimit}
                onChange={(e) => setPlaytimeLimit(e.target.value)}
                className="bg-[#9ECAFF]/20 border-none rounded-xl font-black text-[#1e3a8a] p-2 text-sm focus:ring-2 focus:ring-[#1e3a8a]"
              >
                <option value="15m">15m</option>
                <option value="30m">30m</option>
                <option value="1h">1h</option>
                <option value="off">Off</option>
              </select>
            </div>

            {/* Privacy Mode */}
            <div className="bg-white/80 p-6 rounded-[2.5rem] border-2 border-white flex items-center justify-between shadow-md">
              <div className="pr-4">
                <p className="font-black text-[#1e3a8a] uppercase tracking-wider">Privacy Mode</p>
                <p className="text-xs text-[#1e3a8a]/60 font-bold">Don't save doodle data for AI training</p>
              </div>
              <button 
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`w-16 h-8 rounded-full relative transition-colors ${privacyMode ? 'bg-green-400' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${privacyMode ? 'translate-x-9' : 'translate-x-1'}`} />
              </button>
            </div>

            {/* Social Sharing */}
            <div className="bg-white/80 p-6 rounded-[2.5rem] border-2 border-white flex items-center justify-between shadow-md">
              <div className="pr-4">
                <p className="font-black text-[#1e3a8a] uppercase tracking-wider">Gallery Access</p>
                <p className="text-xs text-[#1e3a8a]/60 font-bold">Allow public jam sharing</p>
              </div>
              <button 
                onClick={() => setGallerySharing(!gallerySharing)}
                className={`w-16 h-8 rounded-full relative transition-colors ${gallerySharing ? 'bg-green-400' : 'bg-gray-300'}`}
              >
                <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${gallerySharing ? 'translate-x-9' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-16 flex flex-col items-center gap-6">
        <button
          onClick={onBack}
          className="bg-[#1e3a8a] text-white px-20 py-6 rounded-full font-black text-2xl uppercase tracking-widest shadow-[0_10px_0_#020A20] hover:translate-y-2 active:shadow-none transition-all"
        >
          Save & Exit
        </button>
        <p className="text-[#1e3a8a]/40 font-black text-xs uppercase tracking-widest">v1.0.4 - Child Safety Compliant</p>
      </div>
    </div>
  );
};

export default SettingsPage;