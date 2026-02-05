import React, { useEffect, useState } from 'react';
import { InstrumentType, InstrumentBlueprint, HitZone, SessionStats, PerformanceEvent } from './services/types';
import { INSTRUMENTS, PRESET_ZONES, getInstrumentIcon } from './services/constants';
import { generateBlueprint, scanDrawing } from './services/geminiService';
import BlueprintDisplay from './components/BlueprintDisplay';
import CameraScanner from './components/CameraScanner';
import InstrumentPlayer from './components/InstrumentPlayer_V2';
import ResultScreen from './components/ResultScreen_V2';
import GalleryPage from './components/GalleryPage';
import SettingsPage from './components/SettingsPage';
import YourJamPage from './components/YourJamPage';
import ExplorePage from './components/ExplorePage';

// --- Decorative Doodle Components ---

const ScribbleDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="144" height="222" viewBox="0 0 144 222" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M128.359 31.8455C67.7629 92.9191 29.1767 130.036 15.1443 142.563C8.16068 148.797 2.74953 157.351 1.43438 161.43C-3.76225 177.545 38.9288 158.654 62.1053 162.064C79.7131 164.655 104.24 168.935 128.26 166.091C135.689 165.211 145.531 165.508 142.404 157.591C139.278 149.674 122.9 133.84 105.046 118.332C68.8889 86.9248 46.4971 71.8415 41.9561 68.9969C39.747 67.613 38.234 65.0213 38.2091 72.9039C38.1271 98.9776 41.5094 150.326 42.3283 201.717C42.625 220.34 44.7849 223.703 48.9041 219.23C61.6731 205.366 74.5124 161.224 88.5573 108.77C103.52 38.7685 109.327 21.598 111.386 14.7607C112.627 11.3163 114.265 7.92329 115.952 1.00024" stroke="#131313" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const WaveDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="688" height="171" viewBox="0 0 688 171" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M899.001 47.8983C781.054 54.0966 663.108 60.2948 600.136 59.0605C537.165 57.8263 532.742 48.9716 525.671 30.2426C518.601 11.5136 509.018 -16.8214 499.29 -40.2729C481.748 -82.5611 466.419 -103.222 458.992 -109.474C452.185 -115.203 427.863 -111.352 390.335 -96.2319C371.614 -88.6895 357.967 -68.7153 345.58 -52.9647C333.193 -37.2141 323.61 -23.0466 314.619 -6.00799C305.628 11.0306 297.519 30.5109 290.025 52.5C274.59 97.786 264.637 133.655 256.461 151.525C253.04 159.003 249.76 162.312 247.135 164.579C242.668 168.438 217.168 169.529 171.855 169.986C149.392 170.212 128.016 167.785 107.052 162.003C86.0871 156.221 66.1837 144.48 51.1388 135.707C36.094 124.934 26.5108 113.423 19.3626 98.6383C12.2143 83.8537 7.79133 66.1443 1.00049 42.5318" stroke="#020A20" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const GreenPlantDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="88" height="73" viewBox="0 0 88 73" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M31.2481 42.2816C29.4847 43.1562 25.2118 45.5407 20.0969 50.3178C16.8186 53.3797 14.5106 59.2482 12.9029 62.3439C11.2952 65.4397 11.5784 65.6973 11.9819 65.9845C12.8532 66.6048 13.7149 67.1572 15.0725 67.7541C20.0542 69.9444 30.9668 67.2907 37.4488 66.4573C38.7245 66.2933 40.1764 65.8931 41.2707 65.3485C45.6067 63.1904 47.7886 59.9319 50.6859 56.8373C52.5178 54.8807 52.5966 53.3287 52.8832 51.8189C53.3154 49.5425 52.6878 46.5713 52.4645 42.9927C52.2914 40.2185 56.3293 38.0522 56.4841 36.4129C56.7214 33.9008 55.188 30.7199 54.5619 29.5491C53.8989 28.3092 52.0129 27.7528 51.2225 27.2321C50.5492 26.7885 48.3977 27.4313 46.5483 27.9994C43.5221 28.9289 41.7165 30.8504 38.9605 32.693C36.7534 34.1687 34.5386 35.8297 32.7904 37.3147C32.4089 38.0137 32.1705 38.8476 31.9473 39.7291C31.8285 40.1476 31.6985 40.5077 31.5646 40.8786" stroke="#327919" strokeWidth="2" strokeLinecap="round"/>
    <path d="M48.9654 25.3037C52.196 21.4229 54.4603 17.987 55.3571 16.7133C56.3982 15.2345 57.6166 13.7803 59.4084 11.6272C60.0906 10.8074 60.9402 10.1942 61.4506 9.5726C63.0095 7.67369 59.4445 5.93309 59.9357 4.81953C60.5752 3.37004 63.955 2.71147 65.2944 2.32452C66.8642 1.87105 68.7496 1.51863 70.6756 1.70134C73.3789 1.9578 74.4597 3.07862 75.5308 4.24826C77.1903 6.06056 69.626 7.59561 67.4699 8.78944C65.4046 9.93305 62.0883 13.7503 58.4197 16.9368C56.0709 18.9771 55.0571 21.2494 54.2921 22.6527C54.1601 23.0182 54.0302 23.3783 53.8077 23.8209C53.5852 24.2635 53.2742 24.7777 52.4051 25.7748" stroke="#327919" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// --- Fix: Added missing BrownPianoDoodle component definition ---
const BrownPianoDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="220" height="150" viewBox="0 0 220 150" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M20 40C20 30 30 25 190 35C200 36 205 45 200 130C200 140 190 145 30 140C20 139 15 130 20 40Z" fill="#8B4513" stroke="#131313" strokeWidth="2" strokeLinecap="round"/>
    <rect x="40" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="52" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="64" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="76" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="88" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="100" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="112" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="124" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="136" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="148" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="160" y="50" width="12" height="70" rx="2" fill="white" stroke="#131313" strokeWidth="1"/>
    <rect x="48" y="50" width="7" height="40" rx="1" fill="#131313"/>
    <rect x="60" y="50" width="7" height="40" rx="1" fill="#131313"/>
    <rect x="84" y="50" width="7" height="40" rx="1" fill="#131313"/>
    <rect x="96" y="50" width="7" height="40" rx="1" fill="#131313"/>
    <rect x="108" y="50" width="7" height="40" rx="1" fill="#131313"/>
    <rect x="132" y="50" width="7" height="40" rx="1" fill="#131313"/>
    <rect x="144" y="50" width="7" height="40" rx="1" fill="#131313"/>
    <rect x="156" y="50" width="7" height="40" rx="1" fill="#131313"/>
  </svg>
);

const BackgroundElements: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-[1] bg-animate">
    <div className="absolute inset-0 dot-grid opacity-20" />
    <div className="absolute top-[-10%] left-[-15%] w-[80vw] h-[80vw] bg-white/30 rounded-full blur-[140px] animate-float opacity-40" />
    <div className="absolute bottom-[-15%] right-[-10%] w-[90vw] h-[90vw] bg-yellow-200/20 rounded-full blur-[160px] animate-float opacity-30" style={{ animationDelay: '-6s' }} />
    {[...Array(8)].map((_, i) => (
      <div key={`note-${i}`} className="absolute text-white/10 select-none animate-float text-6xl"
        style={{ left: Math.random() * 100 + '%', top: Math.random() * 100 + '%', animationDuration: (10 + i * 2) + 's' }}>
        {['♪', '♫', '♬'][i % 3]}
      </div>
    ))}
  </div>
);

const GlobalHeader: React.FC<{ onHome: () => void; onStory: () => void; onGallery: () => void; onYourJam: () => void; onSettings: () => void; currentStep: string }> = ({ onHome, onStory, onGallery, onYourJam, onSettings, currentStep }) => (
  <header className="fixed top-0 left-0 right-0 z-[100] flex justify-center p-6 pointer-events-none">
    <nav className="flex items-center gap-6 md:gap-12 bg-white/20 backdrop-blur-md px-6 md:px-10 py-3 rounded-full border border-white/40 shadow-xl pointer-events-auto">
      <div onClick={onHome} className="text-xl md:text-2xl text-white font-black cursor-pointer hover:scale-110 transition-transform select-none" style={{ fontFamily: 'Fredoka One' }}>
        PLINKY
      </div>
      <div className="flex items-center gap-4 md:gap-8 text-[9px] md:text-[11px] font-black text-[#1e3a8a] uppercase tracking-widest">
        <button onClick={onStory} className={`hover:text-white transition-colors ${currentStep === 'story' ? 'text-white' : ''}`}>Story</button>
        <button onClick={onYourJam} className={`hover:text-white transition-colors ${currentStep === 'yourJam' ? 'text-white' : ''}`}>Your Jam</button>
        <button onClick={onGallery} className={`hover:text-white transition-colors ${currentStep === 'gallery' ? 'text-white' : ''}`}>The Library</button>
        <button onClick={onSettings} className={`hover:text-white transition-colors ${currentStep === 'settings' ? 'text-white' : ''}`}>Settings</button>
      </div>
    </nav>
  </header>
);

const RedMonster: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 1514 770" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} monster-bounce overflow-visible`}>
    <g>
      <ellipse cx="747.5" cy="1092.21" rx="820.5" ry="952.792" fill="#E37474"/>
      <ellipse cx="701.448" cy="358.378" rx="86.613" ry="72.553" fill="white"/>
      <ellipse cx="701.024" cy="358.378" rx="40.5602" ry="34.1426" fill="#131212"/>
      <ellipse cx="970.158" cy="358.497" rx="86.613" ry="72.553" fill="white"/>
      <ellipse cx="969.737" cy="358.497" rx="40.5602" ry="34.1426" fill="#131212"/>
      <path d="M414.317 140.111C421.595 123.282 444.116 119.276 458.86 132.188L535.805 199.569C553.599 215.151 546.918 242.682 524.369 246.693L409.444 267.137C386.896 271.148 367.554 248.247 376.337 227.937L414.317 140.111Z" fill="#E37474"/>
      <path d="M608.919 443.331C625.703 454.752 649.59 469.058 676.097 481.308C690.347 487.894 709.626 493.558 724.828 497.5C740.03 501.442 751.441 503.063 781.02 504.506C810.599 505.949 858 507.165 894.708 505.562C931.416 503.96 955.994 499.502 972.167 495.584C996.875 489.599 1013.13 478.195 1029.53 467.149" stroke="#FBD52C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  </svg>
);

const StoryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div className="w-full max-w-4xl mx-auto p-8 md:p-12 bg-white/40 backdrop-blur-xl rounded-[4rem] shadow-2xl border-[12px] border-white/60 mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
    <div className="flex justify-between items-center mb-8">
      <h2 className="text-4xl md:text-6xl font-black text-[#1e3a8a] uppercase tracking-tighter" style={{ fontFamily: 'Fredoka One' }}>
        The Plinky Story
      </h2>
      <button onClick={onBack} className="w-12 h-12 bg-[#FF6B6B] text-white rounded-full font-black text-xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform">✕</button>
    </div>
    <div className="space-y-12 text-left">
      <section>
        <h3 className="text-2xl font-black text-[#FF6B6B] uppercase tracking-widest mb-4">Why we created Plinky 🎨</h3>
        <p className="text-xl md:text-2xl text-[#1e3a8a] leading-relaxed font-bold">
          We believe that every child is an artist, and every doodle holds a hidden melody. 
          Plinky was born from a simple dream: <span className="text-[#FF6B6B]">to turn the drawings on our fridges into real, playable magic.</span>
        </p>
      </section>
    </div>
    <div className="mt-12 flex justify-center">
      <button onClick={onBack} className="bg-[#1e3a8a] text-white px-16 py-6 rounded-full font-black uppercase tracking-widest shadow-[0_8px_0_#020A20] hover:translate-y-1 active:shadow-none transition-all text-xl">LET'S GO!</button>
    </div>
  </div>
);

const App: React.FC = () => {
  const [step, setStep] = useState<'landing' | 'pick' | 'provide' | 'scan' | 'play' | 'result' | 'blueprint' | 'story' | 'gallery' | 'settings' | 'yourJam' | 'explore'>('landing');
  const [selectedType, setSelectedType] = useState<InstrumentType | null>(null);
  const [blueprint, setBlueprint] = useState<InstrumentBlueprint | null>(null);
  const [hitZones, setHitZones] = useState<HitZone[]>([]);
  const [recording, setRecording] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionStats, setSessionStats] = useState<SessionStats | null>(null);

  useEffect(() => {
    if (step === 'scan' || step === 'play') {
      document.body.classList.add('needs-landscape');
    } else {
      document.body.classList.remove('needs-landscape');
    }
  }, [step]);

  const handlePick = (type: InstrumentType) => {
    setSelectedType(type);
    setStep('provide');
  };

  const handleCapture = async (base64: string) => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const zones = await scanDrawing(selectedType, base64);
      setHitZones(zones);
      setStep('play');
    } catch (err: any) {
      setError(err.message || "Make sure your drawing is clear!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishedPlaying = (blob: Blob | null, stats: { noteCount: number; uniqueNotes: Set<string>; duration: number; eventLog: PerformanceEvent[] }) => {
    if (selectedType) {
      setSessionStats({
        instrument: selectedType,
        durationSeconds: Math.round(stats.duration),
        noteCount: stats.noteCount,
        uniqueNotesCount: stats.uniqueNotes.size,
        intensity: stats.noteCount / (stats.duration || 1),
        eventLog: stats.eventLog
      });
    }
    setRecording(blob);
    setStep('result');
  };

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative text-center">
      <BackgroundElements />
      <GlobalHeader onHome={() => setStep('landing')} onStory={() => setStep('story')} onGallery={() => setStep('gallery')} onYourJam={() => setStep('yourJam')} onSettings={() => setStep('settings')} currentStep={step} />
      
      {/* PERSISTENT DOODLES */}
      {(step === 'landing' || step === 'pick' || step === 'result') && (
        <div className="absolute inset-0 pointer-events-none z-[5]">
          <ScribbleDoodle className="absolute left-[5%] top-[12%] w-[180px] opacity-60 animate-float" />
          <WaveDoodle className="absolute right-[-10%] top-[10%] w-[600px] opacity-40 animate-drift" />
          <GreenPlantDoodle className="absolute left-[10%] bottom-[45%] w-[150px] opacity-80 animate-wobble" />
          <BrownPianoDoodle className="absolute right-[12%] bottom-[50%] w-[220px] opacity-70 rotate-[15deg] animate-float" />
        </div>
      )}

      {step === 'landing' && (
        <div className="w-full min-h-screen flex flex-col items-center justify-between relative overflow-hidden">
          <div className="relative z-50 flex flex-col items-center w-full px-6 pt-24">
            <h1 className="text-[90px] md:text-[210px] text-white font-black leading-none select-none" style={{ fontFamily: 'Fredoka One' }}>Plinky</h1>
            <p className="text-xs md:text-base text-[#1e3a8a]/70 font-black uppercase tracking-[0.4em] mb-12">Doodle Symphony for Kids</p>
            <button onClick={() => setStep('pick')} className="group relative bg-[#FF6B6B] text-white px-16 py-8 md:px-28 md:py-10 rounded-full text-5xl md:text-7xl font-black shadow-[0_15px_0_#D64545] hover:translate-y-2 active:shadow-none transition-all">START</button>
          </div>
          <div className="relative w-full max-w-[2000px] aspect-[1514/770] scale-125 origin-bottom overflow-visible pointer-events-none z-20">
            <RedMonster className="w-full h-full" />
          </div>
        </div>
      )}

      <div className={`relative z-40 w-full flex flex-col items-center px-6 ${step === 'landing' ? 'hidden' : 'pt-32'}`}>
        {error && <div className="bg-red-100 text-red-600 p-6 rounded-[2rem] mb-8 animate-bounce shadow-2xl border-4 border-red-200 font-black">⚠️ {error}</div>}
        {step === 'pick' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-4xl py-12">
            {INSTRUMENTS.map((inst) => (
              <button key={inst.type} onClick={() => handlePick(inst.type)} className={`${inst.color} p-12 rounded-[4rem] shadow-[0_20px_0_rgba(0,0,0,0.1)] hover:-translate-y-4 transition-all flex flex-col items-center border-[12px] border-white/30 group`}>
                <div className="w-40 h-40 mb-6 drop-shadow-2xl group-hover:animate-wobble">{inst.icon}</div>
                <span className="text-4xl font-black text-white uppercase tracking-widest">{inst.type}</span>
              </button>
            ))}
            {/* RESTORED: Explore Magic Button Card */}
            <button 
              onClick={() => setStep('explore')}
              className="bg-indigo-500 p-12 rounded-[4rem] shadow-[0_20px_0_rgba(0,0,0,0.1)] hover:-translate-y-4 transition-all flex flex-col items-center border-[12px] border-white/30 group"
            >
              <div className="w-40 h-40 mb-6 drop-shadow-2xl flex items-center justify-center text-[100px] group-hover:animate-bounce">🪄</div>
              <span className="text-4xl font-black text-white uppercase tracking-widest">Explore</span>
            </button>
          </div>
        )}
        {step === 'provide' && selectedType && (
          <div className="flex flex-col items-center gap-12 py-12">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">Instrument: {selectedType}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-2xl">
              <button onClick={() => setStep('scan')} className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 hover:scale-110 transition-transform">
                <span className="text-8xl">📷</span>
                <span className="text-2xl font-black text-sky-600 uppercase tracking-widest">Scan Drawing</span>
              </button>
              <button onClick={() => { setHitZones(PRESET_ZONES[selectedType] || PRESET_ZONES['Piano']); setStep('play'); }} className="bg-yellow-400 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 hover:scale-110 transition-transform">
                <span className="text-8xl">⚡</span>
                <span className="text-2xl font-black text-yellow-900 uppercase tracking-widest">Instant Magic</span>
              </button>
            </div>
          </div>
        )}
        {step === 'scan' && <CameraScanner onCapture={handleCapture} isScanning={isLoading} />}
        {step === 'play' && selectedType && hitZones.length > 0 && <InstrumentPlayer instrumentType={selectedType} hitZones={hitZones} onExit={handleFinishedPlaying} />}
        {step === 'result' && <ResultScreen recording={recording} onRestart={() => setStep('pick')} stats={sessionStats} />}
        {step === 'story' && <StoryPage onBack={() => setStep('landing')} />}
        {step === 'gallery' && <GalleryPage onBack={() => setStep('landing')} />}
        {step === 'yourJam' && <YourJamPage onBack={() => setStep('landing')} />}
        {step === 'settings' && <SettingsPage onBack={() => setStep('landing')} />}
        {step === 'explore' && <ExplorePage onBack={() => setStep('pick')} onCreateCustom={(name) => { setSelectedType(name); setStep('provide'); }} />}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-[#1e3a8a]/70 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center">
          <div className="w-32 h-32 border-[12px] border-white border-t-transparent rounded-full animate-spin mb-8" />
          <p className="text-white font-black animate-pulse text-4xl uppercase tracking-[0.3em]">Magic incoming...</p>
        </div>
      )}
    </div>
  );
};

export default App;