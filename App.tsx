<<<<<<< Updated upstream:App.tsx

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
=======
import React from 'react';
import { useAppFlow } from './components/app/useAppFlow.tsx';
>>>>>>> Stashed changes:App_V2.tsx

import { BackgroundElements } from './components/layout/BackgroundElements.tsx';
import { GlobalHeader } from './components/layout/GlobalHeader.tsx';
import { RedMonster } from './components/layout/RedMonster.tsx';

// --- Doodles ---
import { 
  ScribbleDoodle, 
  WaveDoodle, 
  GreenPlantDoodle, 
  BrownPianoDoodle, 
  PurpleClusterDoodle 
} from './components/decor/doodles.tsx';
import { 
  MessySun, 
  ShakyStar, 
  CrayonSpiral, 
  ShakyHeart 
} from './components/decor/crayonDoodles.tsx';

// --- Screens ---
import { LandingScreen } from './components/screens/LandingScreen.tsx';
import { PickScreen } from './components/screens/PickScreen.tsx';
import { ProvideScreen } from './components/screens/ProvideScreen.tsx';
import { StoryScreen } from './components/header/StoryScreen.tsx';
import { SettingsPage } from './components/header/SettingsPage.tsx';

import { GalleryScreen } from './components/header/GalleryPage.tsx';
import { YourJamScreen } from './components/header/YourJamPage.tsx';
import { ExploreScreen } from './components/screens/ExplorePage.tsx';
import { INSTRUMENTS, getInstrumentIcon } from './services/constants.tsx';

<<<<<<< Updated upstream:App.tsx
const BrownPianoDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="85" height="45" viewBox="0 0 85 45" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M3.84506 7.00896C3.68502 8.57175 3.12246 14.0652 2.48532 21.5728C2.01505 27.1141 3.77504 31.0722 3.9075 33.6364C3.95921 34.6373 4.94988 35.0304 5.98775 35.2994C8.25115 35.886 10.9586 36.129 21.7702 37.4755C31.2762 38.6593 49.0174 40.3471 58.5463 41.244C68.8642 42.2151 70.477 42.0662 72.0606 42.1494C77.7294 42.4472 81.2101 35.9968 81.5828 33.7212C81.9659 31.3821 80.1692 28.0805 79.9976 25.821C79.7537 22.6096 80.7631 16.9818 82.0116 13.9083C82.6833 12.2546 82.2092 10.7319 81.5041 9.86289C78.3345 5.95659 61.1025 6.81418 52.4275 5.68414C44.0191 4.58884 32.4026 3.86557 26.7731 4.09063C23.2968 4.22961 19.5883 4.15162 15.4364 4.36529C13.6942 4.50511 12.0743 4.65984 9.95316 4.68189C8.62992 4.62774 6.80551 4.44091 3.29776 4.56023" stroke="#966D6D" strokeWidth="2" strokeLinecap="round"/>
    <path d="M11.2443 4.89538C12.3425 9.6018 15.782 17.6298 16.3368 20.0841C16.4521 20.5943 17.0377 20.955 17.9413 21.2102C20.0525 21.8066 22.5492 21.6869 24.6743 21.6652C25.7348 21.6544 26.7833 21.7999 27.4564 20.5265C28.4016 16.5964 28.4693 13.3636 28.2671 11.4407C28.2776 10.0134 28.5177 7.66921 29.5548 5.33488" stroke="#966D6D" strokeWidth="2" strokeLinecap="round"/>
    <path d="M43.9649 4.89651C43.3797 5.46824 42.3054 10.737 41.7861 18.3404C41.6084 20.9437 43.3428 21.1031 44.397 21.29C45.4513 21.4769 46.2172 21.7133 47.0027 21.875C47.7882 22.0368 48.5701 22.1169 49.4598 21.2605C54.0707 16.8225 53.3903 14.1691 54.8718 12.6388C55.2288 11.802 55.5869 10.8768 56.0865 9.89435C56.2776 9.35402 56.3416 8.72891 56.4075 8.08485" stroke="#966D6D" strokeWidth="2" strokeLinecap="round"/>
    <path d="M70.7689 8.11984C70.6729 9.05751 70.58 12.5365 70.6125 17.4018C70.885 19.9229 70.8955 22.4698 72.038 25.458C73.3725 26.5709 76.2394 26.8645 79.1932 27.167" stroke="#966D6D" strokeWidth="2" strokeLinecap="round"/>
    <path d="M22.3287 21.3438C22.2007 22.594 22.0547 24.0195 21.7791 25.4245C21.5836 26.0481 21.2749 26.4902 20.9639 28.2026C20.6529 29.9151 20.3488 32.8843 19.1487 36.8099" stroke="#966D6D" strokeWidth="2" strokeLinecap="round"/>
    <path d="M41.3045 7.49515C40.8719 11.7194 40.9426 21.3165 40.9366 25.3883C39.7488 27.9082 38.6101 33.8068 37.522 37.9639C37.315 38.6605 37.2189 39.5982 37.12 40.5642" stroke="#966D6D" strokeWidth="2" strokeLinecap="round"/>
    <path d="M62.0813 7.23028C61.2235 10.4635 58.963 16.9507 58.209 20.3787C57.6199 23.0568 55.9088 26.0459 54.9099 29.2144C54.7061 29.9186 54.3975 30.3607 54.1105 31.8387C53.8234 33.3167 53.5674 35.8172 52.4168 39.2596" stroke="#966D6D" strokeWidth="2" strokeLinecap="round"/>
    <path d="M68.3788 23.667C68.2822 24.6094 67.4715 27.3832 66.84 32.1853C66.1353 33.8876 66.1353 35.8094 66.771 38.081C66.5347 39.1024 66.1941 39.8571 65.7946 41.1082" stroke="#966D6D" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PurpleClusterDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="65" height="80" viewBox="0 0 65 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M1.50049 17.6482C2.11037 19.5149 2.72026 21.3817 6.9987 29.5772C11.2771 37.7727 19.2057 52.2403 23.595 60.0433C29.1847 69.9802 30.4424 72.3223 31.2232 74.9139C31.3757 75.6246 31.6806 76.3246 32.1426 76.9186C32.6047 77.5126 33.2146 77.9793 33.8429 78.4601" stroke="#9D9EFF" strokeWidth="3" strokeLinecap="round"/>
    <path d="M3.34863 15.5268C3.34863 15.0601 4.87335 13.6529 7.79341 11.7685C11.8636 9.14179 17.1912 10.1103 21.5066 9.63652C25.3297 9.21681 30.4239 6.34844 37.8211 2.57598C40.1234 1.40183 44.2849 1.38449 49.2102 1.61783C51.1071 1.7077 51.696 2.31788 52.1626 2.90832C54.8451 6.30239 58.7374 12.9105 62.332 17.7471C65.9142 22.5671 60.3453 27.5336 57.878 30.0121C52.6067 35.3072 52.6067 44.264 51.4049 48.8602C50.2539 54.6139 50.1713 58.6538 50.1666 60.0645C50.1491 65.4191 62.7941 66.6654 62.6462 68.4296C62.309 72.4535 53.5811 71.8556 44.6592 73.2699C42.483 73.5103 40.9583 73.5103 39.7154 73.6269C38.4725 73.7436 37.5577 73.977 36.6151 74.2174" stroke="#9D9EFF" strokeWidth="3" strokeLinecap="round"/>
    <path d="M7.96875 19.0624C24.2786 16.941 29.8138 16.4743 37.5066 12.1255C39.4612 11.0207 41.8082 11.2841 43.3652 11.5174C45.9519 11.9051 47.9995 13.6317 49.8476 15.396C51.1592 16.648 50.171 18.3482 49.404 19.7589C47.6634 22.9605 44.3217 25.4122 42.3211 27.8907C37.5303 33.8256 41.8452 44.264 42.3118 49.8007C42.6438 53.7402 43.6933 56.5253 45.0794 59.8276C45.654 61.1965 47.3896 62.1893 48.3136 63.6C48.753 64.2707 48.6278 65.0107 48.1704 65.6047C46.0577 68.3482 41.8636 69.9605 38.3244 71.3854C36.0235 71.8556 33.8519 71.8627 32.1609 71.2758C31.3847 70.9222 30.7748 70.4555 29.2224 69.9747" stroke="#9D9EFF" strokeWidth="3" strokeLinecap="round"/>
    <path d="M16.2852 16.941C19.0481 29.8883 20.9055 35.5382 22.4395 40.1415C23.7923 44.2013 25.8216 50.8402 28.1364 55.7016C29.5271 58.8871 31.061 62.1823 32.5996 64.7703C33.2234 65.9583 33.5283 66.8917 33.8425 68.5605" stroke="#9D9EFF" strokeWidth="3" strokeLinecap="round"/>
    <path d="M29.2227 17.6482C29.5276 30.8359 30.1467 36.4716 31.9856 45.8974C35.6727 53.9161 40.3023 61.0085 41.9933 62.6561C42.7695 63.3703 43.3794 63.837 44.0078 65.0249" stroke="#9D9EFF" strokeWidth="3" strokeLinecap="round"/>
    <path d="M36.6152 14.1126C37.2251 14.1126 37.8442 14.8126 38.4588 16.2233C39.0733 17.634 39.9973 19.0553 41.0739 20.466C41.5405 21.1767 41.8455 21.8767 43.0837 22.598" stroke="#9D9EFF" strokeWidth="3" strokeLinecap="round"/>
  </svg>
);

const CurvedLineDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="279" height="81" viewBox="0 0 279 81" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M1 79.9992C43.6962 71.0328 86.3924 62.0664 114.262 50.0403C142.131 38.0142 153.88 23.2002 160.792 14.789C169.231 4.51901 173.773 2.43212 179.114 1.25078C181.855 0.64442 184.74 0.849122 196.532 5.1374C208.325 9.42568 228.956 18.0022 244.026 25.5392C259.096 33.0762 267.979 39.3137 278 48.1029" stroke="#161616" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SmallCurvedDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="74" height="120" viewBox="0 0 74 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M12.2287 15.3658C13.7339 25.7903 7.03886 49.6949 1.39971 68.7803C-0.650948 75.7207 5.39879 78.2276 14.7337 79.3734C55.3316 84.3565 64.621 78.2725 69.1143 77.1604C81.1359 74.1851 61.6554 46.8641 57.9259 25.5881C56.4344 17.0793 57.162 5.12097 54.5671 3.45844C33.7565 -9.87481 28.7641 34.777 21.2378 47.5156C12.6651 62.0252 10.7459 75.2171 9.61129 84.9788C8.55016 94.1088 6.25252 102.941 4.73602 111.939C4.34163 114.279 7.69039 116.421 11.8018 117.567C15.9132 118.713 21.8444 118.713 26.3827 111.669C33.8866 90.5393 39.1662 69.3533 43.2776 57.7604C45.1648 52.8402 46.6476 49.8746 50.422 42.3258" stroke="#121212" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// --- New Child-drawn Crayon Doodles ---

const MessySun: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <circle cx="50" cy="50" r="20" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 4"/>
    <path d="M50 10V25M50 75V90M10 50H25M75 50H90M22 22L32 32M68 68L78 78M22 78L32 68M68 32L78 22" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const ShakyStar: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M30 5L36 22H55L40 33L46 52L30 40L14 52L20 33L5 22H24L30 5Z" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CrayonSpiral: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M40 40C40 40 45 35 45 30C45 25 40 20 35 20C30 20 25 25 25 32C25 40 32 48 42 48C55 48 65 35 65 25C65 12 50 5 35 5C15 5 5 20 5 40C5 65 25 75 45 75C70 75 80 55 80 35" stroke="#A5B4FC" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

const ShakyHeart: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M25 45C25 45 5 35 5 20C5 10 15 5 25 15C35 5 45 10 45 20C45 35 25 45 25 45Z" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// --- Background Elements ---

const BackgroundElements: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-animate">
    <div className="absolute inset-0 dot-grid opacity-20" />
    
    {/* Large Dynamic Shifting Blobs */}
    <div className="absolute top-[-10%] left-[-15%] w-[80vw] h-[80vw] bg-white/30 rounded-full blur-[140px] animate-float opacity-40" />
    <div className="absolute bottom-[-15%] right-[-10%] w-[90vw] h-[90vw] bg-yellow-200/20 rounded-full blur-[160px] animate-float opacity-30" style={{ animationDelay: '-6s' }} />
    <div className="absolute top-1/4 right-[-20%] w-[60vw] h-[60vw] bg-pink-200/20 rounded-full blur-[120px] animate-pulse opacity-40" />
    <div className="absolute bottom-1/4 left-[-10%] w-[50vw] h-[50vw] bg-blue-200/20 rounded-full blur-[100px] animate-orbit opacity-30" />

    {/* Musical Notes Floating */}
    {[...Array(8)].map((_, i) => (
      <div 
        key={`note-${i}`} 
        className="absolute text-white/20 select-none pointer-events-none animate-float"
        style={{
          fontSize: Math.random() * 40 + 40 + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDuration: (Math.random() * 15 + 10) + 's',
          animationDelay: (Math.random() * -10) + 's',
          transform: `rotate(${Math.random() * 360}deg)`
        }}
      >
        {['♪', '♫', '♬', '♩'][i % 4]}
      </div>
    ))}

    {/* Enhanced Scattered Confetti Particles */}
    {[...Array(25)].map((_, i) => (
      <div 
        key={i} 
        className="absolute rounded-full opacity-60 animate-float"
        style={{
          width: Math.random() * 40 + 10 + 'px',
          height: Math.random() * 40 + 10 + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          backgroundColor: ['#FFFFFF', '#FDE047', '#F472B6', '#4ADE80', '#FB923C', '#A5B4FC'][i % 6],
          animationDuration: (Math.random() * 12 + 8) + 's',
          animationDelay: (Math.random() * -15) + 's',
          filter: 'blur(1px)'
        }}
      />
    ))}
  </div>
);

// --- Red Monster (Hand-drawn "Doodle" features) ---

const RedMonster: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="0 0 1514 770" fill="none" xmlns="http://www.w3.org/2000/svg" className={`${className} monster-bounce overflow-visible`}>
    <g>
      {/* Body */}
      <ellipse cx="747.5" cy="1092.21" rx="820.5" ry="952.792" fill="#E37474"/>
      
      {/* Eyes */}
      <ellipse cx="701.448" cy="358.378" rx="86.613" ry="72.553" fill="white"/>
      <ellipse cx="701.024" cy="358.378" rx="40.5602" ry="34.1426" fill="#131212"/>
      <ellipse cx="970.158" cy="358.497" rx="86.613" ry="72.553" fill="white"/>
      <ellipse cx="969.737" cy="358.497" rx="40.5602" ry="34.1426" fill="#131212"/>
      
      {/* Horns / Features */}
      <path d="M414.317 140.111C421.595 123.282 444.116 119.276 458.86 132.188L535.805 199.569C553.599 215.151 546.918 242.682 524.369 246.693L409.444 267.137C386.896 271.148 367.554 248.247 376.337 227.937L414.317 140.111Z" fill="#E37474"/>
      <ellipse cx="64.6086" cy="158.988" rx="64.6086" ry="158.988" transform="matrix(0.877264 0.480009 -0.611184 0.791489 1062.68 0)" fill="#E37474"/>
      <ellipse cx="47.8791" cy="97.5086" rx="47.8791" ry="97.5086" transform="matrix(0.872422 -0.488753 0.6202 0.784444 1061.84 51.0203)" fill="#E37474"/>
      
      {/* Face Details */}
      <path d="M677.507 285.711C677.507 283.964 676.469 279.568 674.897 272.961C674.362 269.85 674.362 267.229 673.324 265.004C672.286 262.78 670.209 261.032 668.07 253.936" stroke="black" strokeWidth="4" strokeLinecap="round"/>
      <path d="M705.818 277.767C706.856 277.767 707.894 277.767 709.467 276.02C711.04 274.272 713.116 270.777 714.185 267.665C715.255 264.554 715.255 261.933 718.401 253.936" stroke="black" strokeWidth="4" strokeLinecap="round"/>
      <path d="M958.27 261.999V283.183" stroke="black" strokeWidth="4" strokeLinecap="round"/>
      <path d="M989.728 280.535C991.804 277.04 994.95 272.618 998.614 267.335C1000.2 264.674 1001.24 262.052 1002.81 259.391C1004.39 256.73 1006.46 254.108 1011.75 246.111" stroke="black" strokeWidth="4" strokeLinecap="round"/>
      
      {/* Mouth (Multiple Jittery Strokes for Doodle Effect) */}
      <path d="M608.919 443.331C625.703 454.752 649.59 469.058 676.097 481.308C690.347 487.894 709.626 493.558 724.828 497.5C740.03 501.442 751.441 503.063 781.02 504.506C810.599 505.949 858 507.165 894.708 505.562C931.416 503.96 955.994 499.502 972.167 495.584C996.875 489.599 1013.13 478.195 1029.53 467.149" stroke="#FBD52C" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M612 446C630 458 655 472 680 484C715 500 750 508 785 508C820 508 865 508 900 506C935 504 960 499 975 496C1000 490 1015 480 1032 468" stroke="#FBD52C" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" transform="translate(2, 2)"/>
      
      {/* Front Teeth - Jittery Doodle Boxes with White Fill */}
      <path d="M821.719 504.733C822.597 516.989 824.379 526.789 830.537 533.371C841.078 544.64 876.621 530.94 884.654 527.876C884.681 523.166 881.143 518.266 877.592 513.348C876.701 512.114 875.823 510.898 872.259 508.417" stroke="#FBD52C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M850.978 507.189C850.978 510.431 850.978 513.673 851.417 515.951C851.856 518.229 852.733 519.445 853.624 521.085C854.516 522.724 855.393 524.75 858.958 529.294L865 528L863 510" stroke="#FBD52C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
    </g>
  </svg>
);

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

// --- Story Page Component ---

const StoryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => (
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
          Plinky was born from a simple dream: <span className="text-[#FF6B6B]">to turn the drawings on our fridges into real, playable magic. </span>
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

// --- Main App Component ---
=======
// --- Player Components ---
import BlueprintDisplay from './components/player/BlueprintDisplay.tsx';
import CameraScanner from './components/player/CameraScanner.tsx';
import InstrumentPlayer from './components/player/InstrumentPlayer.tsx';
import ResultScreen from './components/player/ResultScreen.tsx';
>>>>>>> Stashed changes:App_V2.tsx

const App: React.FC = () => {
  const flow = useAppFlow();
  const { 
    step, setStep, goHome, 
    selectedType, isLoading, error, 
    blueprint, hitZones, recording, sessionStats,
    handlePick, handleCreateCustom, handleShowBlueprint, 
    handleQuickStart, handleCapture, handleFinishedPlaying 
  } = flow;

  const isSubPage = ['story', 'gallery', 'settings', 'yourJam', 'explore', 'pick', 'provide', 'result', 'blueprint', 'scan'].includes(step);

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
      {(step === 'landing' || step === 'pick' || step === 'result' || step === 'story' || step === 'gallery' || step === 'settings' || step === 'yourJam' || step === 'explore') && (
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

<<<<<<< Updated upstream:App.tsx
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
=======
      <main className={`flex-1 w-full flex flex-col items-center ${isSubPage ? 'pt-40 pb-32' : ''}`}>
>>>>>>> Stashed changes:App_V2.tsx
        
        {/* Red Monster Positioning: Default peeking behavior for generic scan/play/result sub-pages */}
        {isSubPage && !['story', 'gallery', 'yourJam', 'settings', 'pick', 'provide', 'explore', 'landing','result'].includes(step) && (
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
                  onClick={() => { setStep('explore'); }}
                  className={`bg-orange-400 h-full p-12 rounded-[4rem] shadow-[0_20px_0_rgba(0,0,0,0.1)] hover:-translate-y-4 hover:scale-105 transition-all flex flex-col items-center border-[12px] border-white/30 group`}
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
                <button onClick={() => setStep('scan')} className="bg-white p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 hover:scale-110 transition-transform border-[8px] border-sky-200 group">
                  <span className="text-8xl group-hover:scale-125 transition-transform">📷</span>
                  <span className="text-2xl font-black text-sky-600 uppercase tracking-widest">Scan Drawing</span>
                </button>
                <button onClick={handleQuickStart} className="bg-yellow-400 p-12 rounded-[3rem] shadow-2xl flex flex-col items-center gap-6 hover:scale-110 transition-transform border-[8px] border-yellow-200 group">
                  <span className="text-8xl group-hover:animate-bounce">⚡</span>
                  <span className="text-2xl font-black text-yellow-900 uppercase tracking-widest">Instant Magic</span>
                </button>
              </div>

              <div className="w-full h-1 bg-white/20 my-4 rounded-full max-w-xl" />

              <div className="flex flex-col items-center gap-6 mb-12">
                <label className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-10 py-4 rounded-full font-black uppercase tracking-widest shadow-[0_6px_0_#065f46] transition-all hover:translate-y-1 active:shadow-none flex items-center gap-3">
                  <input 
                    type="file" 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileUpload}
                  />
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
              
              <button 
                onClick={goHome} 
                className="text-[#1e3a8a] font-black uppercase tracking-[0.3em] text-sm hover:underline"
              >
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
                 <GalleryScreen onBack={goHome} />
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
          
          {/* Fix: Pass missing required prop instrumentType and ensure selectedType exists */}
          {step === 'play' && hitZones.length > 0 && selectedType && (
            <InstrumentPlayer 
              instrumentType={selectedType} 
              hitZones={hitZones} 
              onExit={handleFinishedPlaying} 
            />
          )}
          
          {step === 'result' && (
            <ResultScreen recording={recording} onRestart={goHome} stats={sessionStats} />
          )}
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
