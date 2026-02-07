import React from 'react';
import { useAppFlow } from './components/app/useAppFlow';

import { BackgroundElements } from './components/layout/BackgroundElements';
import { GlobalHeader } from './components/layout/GlobalHeader';
import { RedMonster } from './components/layout/RedMonster';

// --- Doodles ---
import {
  ScribbleDoodle,
  WaveDoodle,
  GreenPlantDoodle,
  BrownPianoDoodle,
  PurpleClusterDoodle
} from './components/decor/doodles';
import {
  MessySun,
  ShakyStar,
  CrayonSpiral,
  ShakyHeart
} from './components/decor/crayonDoodles';

// --- Screens ---
import { LandingScreen } from './components/screens/LandingScreen';
import { StoryScreen } from './components/header/StoryScreen';
import SettingsPage from './components/header/SettingsPage';
import GalleryPage from './components/header/GalleryPage';
import { YourJamScreen } from './components/header/YourJamPage';
import { ExploreScreen } from './components/screens/ExplorePage';

// --- Player Components ---
import BlueprintDisplay from './components/player/BlueprintDisplay';
import CameraScanner from './components/player/CameraScanner';
import InstrumentPlayer from './components/player/InstrumentPlayer_V2';
import ResultScreen from './components/player/ResultScreen_V2';

import { INSTRUMENTS, getInstrumentIcon } from './services/constants';

const App: React.FC = () => {
  const flow = useAppFlow();
  const {
    step,
    setStep,
    goHome,
    selectedType,
    isLoading,
    error,
    blueprint,
    hitZones,
    recording,
    sessionStats,
    handlePick,
    handleCreateCustom,
    handleShowBlueprint,
    handleQuickStart,
    handleCapture,
    handleFinishedPlaying
  } = flow;

  const isSubPage = [
    'story',
    'gallery',
    'settings',
    'yourJam',
    'explore',
    'pick',
    'provide',
    'result',
    'blueprint',
    'scan'
  ].includes(step);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        handleCapture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative text-center">
      <BackgroundElements />

      <GlobalHeader
        onHome={goHome}
        onStory={() => setStep('story')}
        onGallery={() => setStep('gallery')}
        onYourJam={() => setStep('yourJam')}
        onSettings={() => setStep('settings')}
        onExplore={() => setStep('explore')}
        currentStep={step}
      />

      {/* Persistent Decorative Elements */}
      {(step === 'landing' ||
        step === 'pick' ||
        step === 'result' ||
        step === 'story' ||
        step === 'gallery' ||
        step === 'settings' ||
        step === 'yourJam' ||
        step === 'explore') && (
        <div className="absolute inset-0 pointer-events-none z-0">
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
        </div>
      )}

      <main className={`flex-1 w-full flex flex-col items-center ${isSubPage ? 'pt-40 pb-32' : ''}`}>
        {/* Red Monster Positioning: Default peeking behavior for generic scan/play/result sub-pages */}
        {isSubPage && !['story', 'gallery', 'yourJam', 'settings', 'pick', 'provide', 'explore', 'landing', 'result'].includes(step) && (
          <div className="w-full flex justify-center mb-0 mt-4 animate-in fade-in slide-in-from-top-4 duration-700 relative z-0">
            <div className="w-24 md:w-40 h-16 md:h-28 overflow-hidden flex items-start justify-center">
              <div className="w-32 md:w-56 aspect-[1514/770] drop-shadow-xl transform -translate-y-2">
                <RedMonster className="w-full h-full" />
              </div>
            </div>
          </div>
        )}

        <div className="relative z-10 w-full flex flex-col items-center px-4">
          {error && (
            <div className="bg-red-100 border-4 border-red-200 text-red-600 p-6 rounded-[2rem] mb-12 flex items-center gap-3 animate-bounce shadow-xl font-black uppercase tracking-widest max-w-2xl">
              <span>⚠️ {error}</span>
            </div>
          )}

          {step === 'landing' && <LandingScreen onStart={() => setStep('pick')} />}

          {step === 'pick' && (
            <div className="flex flex-col items-center w-full min-h-[calc(100vh-200px)] justify-start pb-48">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 w-full max-w-4xl py-12 animate-in slide-in-from-bottom-10 duration-700 relative z-50 grid-auto-rows-fr">
                {INSTRUMENTS.map((inst) => (
                  <button
                    key={inst.type}
                    onClick={() => handlePick(inst.type)}
                    className={`${inst.color} h-full p-12 rounded-[4rem] shadow-[0_20px_0_rgba(0,0,0,0.1)] hover:-translate-y-4 hover:scale-105 transition-all flex flex-col items-center border-[12px] border-white/30 group`}
                  >
                    <div className="w-40 h-40 mb-6 drop-shadow-2xl group-hover:animate-wobble flex items-center justify-center">
                      {inst.icon}
                    </div>
                    <span className="text-4xl font-black text-white uppercase tracking-widest mt-auto">{inst.type}</span>
                  </button>
                ))}

                <button
                  onClick={() => {
                    setStep('explore');
                  }}
                  className="bg-orange-400 h-full p-12 rounded-[4rem] shadow-[0_20px_0_rgba(0,0,0,0.1)] hover:-translate-y-4 hover:scale-105 transition-all flex flex-col items-center border-[12px] border-white/30 group"
                >
                  <div className="w-40 h-40 mb-6 drop-shadow-2xl group-hover:animate-pulse flex items-center justify-center">
                    <span className="text-[120px]">🧭</span>
                  </div>
                  <span className="text-4xl font-black text-white uppercase tracking-widest mt-auto">Explore</span>
                </button>
              </div>

              <div className="fixed bottom-0 left-0 right-0 h-[30vh] overflow-hidden pointer-events-none z-10 opacity-80 translate-y-[15%]">
                <RedMonster className="w-full h-full" />
              </div>
            </div>
          )}

          {step === 'provide' && selectedType && (
            <div className="flex flex-col items-center gap-12 py-12 animate-in fade-in duration-500 relative w-full max-w-4xl">
              <button
                onClick={() => setStep('pick')}
                className="bg-white/40 backdrop-blur-md text-[#1e3a8a] px-8 py-3 rounded-full font-black uppercase tracking-widest text-sm flex items-center gap-2 shadow-lg hover:scale-110 transition-transform border-4 border-white mb-2"
              >
                <span>←</span> Change Instrument
              </button>

              <div className="w-32 h-32 md:w-48 md:h-48 drop-shadow-2xl animate-wobble -mb-4">
                {getInstrumentIcon(selectedType)}
              </div>

              <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-xl uppercase tracking-tighter text-center">
                Choose Your Path: {selectedType}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-2xl">
                <button
                  onClick={() => setStep('scan')}
                  className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 hover:scale-110 transition-transform border-[8px] border-sky-200 group"
                >
                  <span className="text-8xl group-hover:scale-125 transition-transform">📷</span>
                  <span className="text-2xl font-black text-sky-600 uppercase tracking-widest">Scan Drawing</span>
                </button>
                <button
                  onClick={handleQuickStart}
                  className="bg-yellow-400 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 hover:scale-110 transition-transform border-[8px] border-yellow-200 group"
                >
                  <span className="text-8xl group-hover:animate-bounce">⚡</span>
                  <span className="text-2xl font-black text-yellow-900 uppercase tracking-widest">Instant Magic</span>
                </button>
              </div>

              <div className="w-full h-1 bg-white/20 my-4 rounded-full max-w-xl" />

              <div className="flex flex-col items-center gap-6 mb-12">
                <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-[0_6px_0_#065f46] transition-all hover:translate-y-1 active:shadow-none flex items-center gap-3">
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  <span>📁</span> Upload Drawing Instead
                </label>

                <button
                  onClick={handleShowBlueprint}
                  className="text-white text-xl underline font-black uppercase tracking-[0.2em] hover:text-[#1e3a8a] transition-colors py-4"
                >
                  Wait, I need a blueprint guide!
                </button>
              </div>
            </div>
          )}

          {step === 'blueprint' && blueprint && (
            <div className="flex flex-col items-center gap-12 w-full max-w-4xl py-12 animate-in zoom-in-95 duration-500">
              <BlueprintDisplay blueprint={blueprint} />

              <div className="flex flex-wrap justify-center gap-8">
                <button
                  onClick={() => setStep('scan')}
                  className="px-12 py-7 bg-blue-500 text-white rounded-full text-2xl font-black shadow-[0_10px_0_#1e3a8a] hover:bg-blue-600 transition-all hover:translate-y-1 active:shadow-none uppercase tracking-widest flex items-center gap-4"
                >
                  <span>📸</span> OPEN CAMERA
                </button>
                <button
                  onClick={handleQuickStart}
                  className="px-12 py-7 bg-yellow-500 text-white rounded-full text-2xl font-black shadow-[0_10px_0_#ca8a04] hover:bg-yellow-600 transition-all hover:translate-y-1 active:shadow-none uppercase tracking-widest flex items-center gap-4"
                >
                  <span>⚡</span> TRY DEMO
                </button>
              </div>

              <button onClick={goHome} className="text-[#1e3a8a] font-black uppercase tracking-[0.3em] text-sm hover:underline">
                Back to Start
              </button>
            </div>
          )}

          {step === 'story' && (
            <div className="w-full flex flex-col items-center pb-24 relative">
              <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
                <RedMonster className="w-full h-full" />
              </div>
              <StoryScreen onBack={goHome} />
            </div>
          )}

          {step === 'gallery' && (
            <div className="w-full flex flex-col items-center pb-24 relative">
              <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
                <RedMonster className="w-full h-full" />
              </div>
              <div className="relative z-10 w-full flex justify-center">
                <GalleryPage onBack={goHome} />
              </div>
            </div>
          )}

          {step === 'yourJam' && (
            <div className="w-full flex flex-col items-center pb-24 relative">
              <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
                <RedMonster className="w-full h-full" />
              </div>
              <div className="relative z-10 w-full flex justify-center">
                <YourJamScreen onBack={goHome} />
              </div>
            </div>
          )}

          {step === 'explore' && (
            <div className="w-full flex flex-col items-center pb-24 relative">
              <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
                <RedMonster className="w-full h-full" />
              </div>
              <ExploreScreen onBack={() => setStep('pick')} onCreateCustom={handleCreateCustom} />
            </div>
          )}

          {step === 'settings' && (
            <div className="w-full flex flex-col items-center pb-24 relative">
              <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
                <RedMonster className="w-full h-full" />
              </div>
              <SettingsPage onBack={() => setStep('landing')} />
            </div>
          )}

          {step === 'scan' && (
            <div className="w-full flex flex-col items-center gap-10 py-12">
              <h2 className="text-4xl md:text-6xl font-black text-white drop-shadow-xl uppercase tracking-tighter">Scan Your Paper</h2>
              <CameraScanner onCapture={handleCapture} isScanning={isLoading} />
              <button
                onClick={() => setStep('provide')}
                className="text-white/60 font-black uppercase tracking-widest text-lg hover:text-white transition-colors"
              >
                Go Back
              </button>
            </div>
          )}

          {step === 'play' && hitZones.length > 0 && selectedType && (
            <InstrumentPlayer instrumentType={selectedType} hitZones={hitZones} onExit={handleFinishedPlaying} />
          )}

          {step === 'result' && <ResultScreen recording={recording} onRestart={goHome} stats={sessionStats} />}
        </div>
      </main>

      {isLoading && (
        <div className="fixed inset-0 bg-[#1e3a8a]/70 backdrop-blur-2xl z-[200] flex flex-col items-center justify-center p-6 text-center">
          <div className="w-32 h-32 border-[12px] border-white border-t-transparent rounded-full animate-spin mb-8" />
          <p className="text-white font-black animate-pulse text-4xl uppercase tracking-[0.3em] max-w-3xl">
            {step === 'pick' || step === 'provide' ? 'Preparing the blueprint...' : 'Gemini is reading your drawing...'}
          </p>
        </div>
      )}
    </div>
  );
};

export default App;
