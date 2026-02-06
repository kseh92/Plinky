
import React, { useEffect } from 'react';
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
import BackgroundElements from './components/BackgroundElements';
import StoryPage from './components/StoryPage';
import {
  ScribbleDoodle,
  WaveDoodle,
  GreenPlantDoodle,
  BrownPianoDoodle,
  PurpleClusterDoodle,
  CurvedLineDoodle,
  SmallCurvedDoodle,
  MessySun,
  ShakyStar,
  CrayonSpiral,
  ShakyHeart,
  RedMonster
} from './components/DecorativeDoodles';

// --- Header Component ---

const GlobalHeader: React.FC<{ onHome: () => void; onStory: () => void; onGallery: () => void; onYourJam: () => void; onSettings: () => void; currentStep: string }> = ({ onHome, onStory, onGallery, onYourJam, onSettings, currentStep }) => (
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
          The Library
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

// --- Main App Component ---

const App: React.FC = () => {
  const [step, setStep] = React.useState<'landing' | 'pick' | 'provide' | 'scan' | 'play' | 'result' | 'blueprint' | 'story' | 'gallery' | 'settings' | 'yourJam' | 'explore'>('landing');
  const [selectedType, setSelectedType] = React.useState<InstrumentType | null>(null);
  const [blueprint, setBlueprint] = React.useState<InstrumentBlueprint | null>(null);
  const [hitZones, setHitZones] = React.useState<HitZone[]>([]);
  const [recording, setRecording] = React.useState<Blob | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionStats, setSessionStats] = React.useState<SessionStats | null>(null);

  // Toggle orientation classes on the body based on the current step
  useEffect(() => {
    // Only screens that use the camera should enforce landscape mode
    if (step === 'scan' || step === 'play') {
      document.body.classList.add('needs-landscape');
    } else {
      document.body.classList.remove('needs-landscape');
    }
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('needs-landscape');
    };
  }, [step]);

  const handlePick = (type: InstrumentType) => {
    setSelectedType(type);
    setStep('provide');
  };

  const handleCreateCustom = (name: string) => {
    setSelectedType(name);
    setStep('provide');
  };

  const handleShowBlueprint = async () => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const bp = await generateBlueprint(selectedType);
      setBlueprint(bp);
      setStep('blueprint');
    } catch (err) {
      setError("Gemini is composing... try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = () => {
    if (!selectedType) return;
    // For custom instruments, PRESET_ZONES might be empty, so we default to a generic set if needed or require scanning
    const zones = PRESET_ZONES[selectedType] || PRESET_ZONES['Piano']; 
    setHitZones(zones);
    setStep('play');
  };

  const handleCapture = async (base64: string) => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const zones = await scanDrawing(selectedType, base64);
      setHitZones(zones);
      setStep('play');
    } catch (err) {
      setError("Make sure your drawing is clear!");
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

  const goHome = () => {
    setStep('landing');
    setSelectedType(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative text-center">
      <BackgroundElements />
      <GlobalHeader 
        onHome={goHome} 
        onStory={() => setStep('story')} 
        onGallery={() => { setStep('gallery'); }}
        onYourJam={() => setStep('yourJam')}
        onSettings={() => setStep('settings')}
        currentStep={step} 
      />
      
      {/* Persistent Decorative Elements */}
      {(step === 'landing' || step === 'pick' || step === 'result' || step === 'story' || step === 'gallery' || step === 'settings' || step === 'yourJam' || step === 'explore') && (
        <div className="absolute inset-0 pointer-events-none z-30">
          <ScribbleDoodle className="absolute left-[5%] top-[12%] w-[180px] opacity-60 animate-float" style={{ animationDuration: '12s' }} />
          <WaveDoodle className="absolute right-[-10%] top-[10%] w-[600px] opacity-40 animate-drift" />
          <GreenPlantDoodle className="absolute left-[10%] bottom-[45%] w-[150px] opacity-80 animate-wobble" />
          <BrownPianoDoodle className="absolute right-[12%] bottom-[50%] w-[220px] opacity-70 rotate-[15deg] animate-float" />
          <PurpleClusterDoodle className="absolute left-[20%] top-[35%] w-[110px] opacity-70 animate-pulse" style={{ animationDuration: '4s' }} />
          <GreenPlantDoodle className="absolute right-[25%] top-[35%] w-[90px] opacity-40 -rotate-12 animate-float" />
          
          <MessySun className="absolute right-[5%] top-[5%] opacity-60 animate-pulse" />
          <ShakyStar className="absolute left-[15%] top-[45%] opacity-50 animate-orbit" style={{ animationDuration: '15s' }} />
          <CrayonSpiral className="absolute right-[10%] bottom-[15%] opacity-40 animate-float" style={{ animationDuration: '20s' }} />
          <ShakyHeart className="absolute left-[8%] top-[25%] opacity-60 animate-wobble" />
          <ShakyStar className="absolute right-[20%] top-[40%] opacity-40 rotate-45 animate-float" style={{ animationDuration: '10s' }} />
          <MessySun className="absolute left-[5%] bottom-[5%] opacity-40 rotate-180 animate-pulse" style={{ animationDuration: '5s' }} />
          <ShakyHeart className="absolute right-[25%] bottom-[30%] opacity-50 -rotate-12 animate-orbit" style={{ animationDuration: '25s' }} />
          <CrayonSpiral className="absolute left-[30%] top-[10%] opacity-30 animate-drift" />
        </div>
      )}

      {step === 'landing' && (
        <div className="w-full min-h-screen flex flex-col items-center justify-between relative overflow-hidden">
          <CurvedLineDoodle className="absolute left-[-5%] top-[30%] w-[500px] opacity-[0.07] -rotate-12 pointer-events-none z-0" />
          <CurvedLineDoodle className="absolute right-[-10%] top-[60%] w-[600px] opacity-[0.05] rotate-[160deg] pointer-events-none z-0" />
          <SmallCurvedDoodle className="absolute left-[12%] top-[5%] w-[100px] opacity-[0.12] rotate-12 pointer-events-none z-0" />
          <SmallCurvedDoodle className="absolute right-[15%] top-[8%] w-[80px] opacity-[0.08] -rotate-[15deg] pointer-events-none z-0" />
          
          <div className="h-4 md:h-12" />

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
              onClick={() => setStep('pick')}
              className="group relative bg-[#FF6B6B] text-white mt-12 px-16 py-8 md:px-28 md:py-10 rounded-full text-5xl md:text-7xl font-black shadow-[0_15px_0_#D64545] hover:shadow-[0_8px_0_#D64545] hover:translate-y-2 active:shadow-none active:translate-y-[15px] transition-all duration-150 transform hover:scale-105 active:scale-95"
            >
              START
              <div className="absolute -inset-8 bg-white/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
          </div>
          
          <div className="relative w-full max-w-[2000px] aspect-[1514/770] scale-125 origin-bottom transition-all duration-700 ease-out overflow-visible pointer-events-none z-20">
            <RedMonster className="w-full h-full" />
          </div>
        </div>
      )}

      {/* Main App Content Area */}
      <div className={`relative z-40 w-full flex flex-col items-center px-6 ${step === 'landing' ? 'hidden' : 'pt-32'}`}>
        {step !== 'landing' && step !== 'story' && step !== 'gallery' && step !== 'settings' && step !== 'yourJam' && step !== 'explore' && (
          <header className="mb-8 text-center animate-in fade-in duration-500">
             <p className="text-[8px] md:text-[10px] font-black text-[#1e3a8a]/50 uppercase tracking-[0.4em]">Doodle Symphony for Kids</p>
          </header>
        )}

        {error && (
          <div className="bg-red-100 text-red-600 p-6 rounded-[2rem] mb-8 animate-bounce shadow-2xl border-4 border-red-200 font-black">⚠️ {error}</div>
        )}

        {step === 'story' && (
          <div className="w-full flex flex-col items-center pb-24 relative">
             <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
               <RedMonster className="w-full h-full" />
             </div>
             <div className="relative z-10 w-full flex justify-center">
               <StoryPage onBack={() => setStep('landing')} />
             </div>
          </div>
        )}

        {step === 'gallery' && (
          <div className="w-full flex flex-col items-center pb-24 relative">
             <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
               <RedMonster className="w-full h-full" />
             </div>
             <div className="relative z-10 w-full flex justify-center">
               <GalleryPage onBack={() => setStep('landing')} />
             </div>
          </div>
        )}

        {step === 'explore' && (
          <div className="w-full flex flex-col items-center pb-24 relative">
             <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
               <RedMonster className="w-full h-full" />
             </div>
             <div className="relative z-10 w-full flex justify-center">
               <ExplorePage onBack={() => setStep('pick')} onCreateCustom={handleCreateCustom} />
             </div>
          </div>
        )}

        {step === 'yourJam' && (
          <div className="w-full flex flex-col items-center pb-24 relative">
             <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
               <RedMonster className="w-full h-full" />
             </div>
             <div className="relative z-10 w-full flex justify-center">
               <YourJamPage onBack={() => setStep('landing')} />
             </div>
          </div>
        )}

        {step === 'settings' && (
          <div className="w-full flex flex-col items-center pb-64 relative">
             <SettingsPage onBack={() => setStep('landing')} />
             <div className="absolute bottom-0 left-0 right-0 h-[400px] overflow-hidden pointer-events-none z-0 translate-y-[20%] opacity-90 scale-110 origin-bottom">
               <RedMonster className="w-full h-full" />
             </div>
          </div>
        )}

        {step === 'pick' && (
          <div className="flex flex-col items-center w-full min-h-[calc(100vh-200px)] justify-start pb-48">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-4xl py-12 animate-in slide-in-from-bottom-10 duration-700 relative z-50">
              {INSTRUMENTS.map((inst) => (
                <button
                  key={inst.type}
                  onClick={() => handlePick(inst.type)}
                  className={`${inst.color} p-12 rounded-[4rem] shadow-[0_20px_0_rgba(0,0,0,0.1)] hover:-translate-y-4 hover:scale-105 transition-all flex flex-col items-center border-[12px] border-white/30 group`}
                >
                  <div className="w-40 h-40 mb-6 drop-shadow-2xl group-hover:animate-wobble">
                    {inst.icon}
                  </div>
                  <span className="text-4xl font-black text-white uppercase tracking-widest">{inst.type}</span>
                </button>
              ))}
              
              <button
                onClick={() => { setStep('explore'); }}
                className={`bg-orange-400 p-12 rounded-[4rem] shadow-[0_20px_0_rgba(0,0,0,0.1)] hover:-translate-y-4 hover:scale-105 transition-all flex flex-col items-center border-[12px] border-white/30 group`}
              >
                <span className="text-[120px] mb-6 drop-shadow-2xl group-hover:animate-pulse">🧭</span>
                <span className="text-4xl font-black text-white uppercase tracking-widest">Explore</span>
              </button>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 h-[30vh] overflow-hidden pointer-events-none z-10 opacity-80 translate-y-[15%]">
              <RedMonster className="w-full h-full" />
            </div>
          </div>
        )}

        {step === 'provide' && selectedType && (
          <div className="flex flex-col items-center gap-12 py-12 animate-in fade-in duration-500 relative">
            <button 
              onClick={() => setStep('pick')}
              className="bg-white/40 backdrop-blur-md text-[#1e3a8a] px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-2 shadow-lg hover:scale-110 transition-transform border-4 border-white mb-2"
            >
              <span>←</span> Change Instrument
            </button>
            <div className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl animate-wobble -mb-4">
               {getInstrumentIcon(selectedType)}
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-xl uppercase tracking-tighter text-center">Choose Your Path: {selectedType}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-2xl">
              <button onClick={() => setStep('scan')} className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 hover:scale-110 transition-transform border-[8px] border-sky-200 group">
                <span className="text-8xl group-hover:scale-125 transition-transform">📷</span>
                <span className="text-2xl font-black text-sky-600 uppercase tracking-widest">Scan Drawing</span>
              </button>
              <button onClick={handleQuickStart} className="bg-yellow-400 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 hover:scale-110 transition-transform border-[8px] border-yellow-200 group">
                <span className="text-8xl group-hover:animate-bounce">⚡</span>
                <span className="text-2xl font-black text-yellow-900 uppercase tracking-widest">Instant Magic</span>
              </button>
            </div>
            <button onClick={handleShowBlueprint} className="text-white text-xl underline font-black uppercase tracking-[0.2em] hover:text-sky-900 transition-colors py-4">How do I draw it?</button>
          </div>
        )}

        {step === 'blueprint' && blueprint && <BlueprintDisplay blueprint={blueprint} />}
        {step === 'scan' && <CameraScanner onCapture={handleCapture} isScanning={isLoading} />}
        {step === 'play' && hitZones.length > 0 && selectedType && (
          <InstrumentPlayer instrumentType={selectedType} hitZones={hitZones} onExit={handleFinishedPlaying} />
        )}
        
        {step === 'result' && (
          <div className="w-full flex flex-col items-center pb-24 relative">
             <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
               <RedMonster className="w-full h-full" />
             </div>
             <div className="relative z-10 w-full flex justify-center">
               <ResultScreen recording={recording} onRestart={() => setStep('pick')} stats={sessionStats} />
             </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-[#1e3a8a]/70 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center">
          <div className="w-32 h-32 border-[12px] border-white border-t-transparent rounded-full animate-spin mb-8" />
          <p className="text-white font-black animate-pulse text-4xl uppercase tracking-[0.3em]">Magical things are happening...</p>
        </div>
      )}
    </div>
  );
};

export default App;
