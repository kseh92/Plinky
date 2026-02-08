import React, { useRef, useEffect, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HitZone, PerformanceEvent, InstrumentType } from '../../services/types';
import { toneService } from '../../services/toneService';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface Props {
  instrumentType: InstrumentType;
  hitZones: HitZone[];
  onExit: (recording: Blob | null, stats: { noteCount: number; uniqueNotes: Set<string>; duration: number; eventLog: PerformanceEvent[] }) => void;
}

const MascotPlayer: React.FC<{ className?: string }> = ({ className }) => (
  <svg width="384" height="1038" viewBox="0 0 384 1038" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <g filter="url(#filter0_d_81_178_mascot)">
      <rect x="40.1475" y="116.992" width="339.166" height="912.393" rx="50" fill="#FFE0A3"/>
      <ellipse cx="211.818" cy="169.311" rx="31.3151" ry="38.4186" fill="white"/>
      <ellipse cx="223.167" cy="169.118" rx="11.5089" ry="14.2863" fill="#131212"/>
      <rect x="281.462" y="48.6499" width="76.0866" height="86.1039" rx="38.0433" fill="#FFE0A3"/>
      <rect width="58.5196" height="179.469" rx="29.2598" transform="matrix(0.59319 -0.805062 0.684549 0.728967 0 47.1118)" fill="#FFE0A3"/>
      <path d="M211.589 214.842C212.613 217.141 217.385 223.146 225.399 231.474C231.605 237.925 238.487 240.607 245.182 243.442C259.116 249.343 263.699 246.865 268.34 246.414C275.862 245.684 285.025 243.075 291.149 240.669C296.583 238.533 301.618 233.719 303.666 231.826C306.4 229.299 306.468 223.134 306.251 220.101C306.165 218.044 305.915 216.103 305.499 214.658C305.273 213.977 305.017 213.403 304.754 212.811" stroke="#737783" strokeWidth="2" strokeLinecap="round"/>
      <path d="M232.46 236.205C225.792 248.85 223.325 255.854 225.243 256.937C226.213 257.485 227.095 258.209 228.529 259.05C229.962 259.891 231.898 260.871 234.141 258.447C238.874 250.163 241.896 243.467 242.686 242.185C243.02 241.561 243.217 240.994 243.42 240.409" stroke="#737783" strokeWidth="2" strokeLinecap="round"/>
      <path d="M318.941 150.584C296.331 161.855 283.855 167.993 283.016 168.827C282.039 169.796 294.058 172.664 308.814 176.009C315.298 178.028 317.538 179.042 319.76 179.545C320.88 179.715 321.983 179.715 323.119 179.715" stroke="#111112" strokeWidth="2" strokeLinecap="round"/>
    </g>
    <defs>
      <filter id="filter0_d_81_178_mascot" x="6.88232" y="13.1074" width="376.432" height="1024.28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
        <feOffset dy="4"/>
        <feGaussianBlur stdDeviation="2"/>
        <feComposite in2="hardAlpha" operator="out"/>
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_81_178"/>
        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_81_178" result="shape"/>
      </filter>
    </defs>
  </svg>
);

const InstrumentPlayer: React.FC<Props> = ({ instrumentType, hitZones, onExit }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  
  // Stats tracking
  const noteCountRef = useRef(0);
  const uniqueNotesRef = useRef<Set<string>>(new Set());
  
  const activeHitsRef = useRef<Set<string>>(new Set());
  const particlesRef = useRef<Particle[]>([]);

  useEffect(() => {
    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
        );
        const hl = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
            delegate: "GPU"
          },
          runningMode: "VIDEO",
          numHands: 2
        });
        setLandmarker(hl);
        setIsLoading(false);
      } catch (err) {
        console.error("MediaPipe Init Error:", err);
        setIsLoading(false);
      }
    };

    initMediaPipe();

    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'user', width: 1280, height: 720 } 
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (e) {
        console.error("Camera error:", e);
      }
    };
    startCam();

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const handleStart = async () => {
    setIsAudioLoading(true);
    await toneService.init(); 
    toneService.applyMixingPreset({
      reverbAmount: instrumentType === 'Harp' ? 0.4 : 0.2,
      compressionThreshold: -24,
      bassBoost: 2,
      midBoost: 0,
      trebleBoost: 4,
      distortionAmount: 0
    });
    await toneService.startRecording();
    setIsAudioLoading(false);
    setHasStarted(true);
  };

  const handleStop = async () => {
    const result = await toneService.stopRecording();
    
    onExit(result?.blob || null, {
      noteCount: noteCountRef.current,
      uniqueNotes: uniqueNotesRef.current,
      duration: result?.duration || 0,
      eventLog: result?.eventLog || []
    });
  };

  const spawnParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 15; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        life: 1.0,
        color,
        size: Math.random() * 8 + 4
      });
    }
  };

  useEffect(() => {
    if (!hasStarted || !landmarker) return;

    let animationId: number;
    const render = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const results = landmarker.detectForVideo(videoRef.current, performance.now());
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          // Set canvas size to match video element display size
          canvasRef.current.width = videoRef.current.clientWidth;
          canvasRef.current.height = videoRef.current.clientHeight;

          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          const frameHits = new Set<string>();

          if (results.landmarks) {
            results.landmarks.forEach(landmarks => {
              const indexTip = landmarks[8];
              const thumbTip = landmarks[4];
              [indexTip, thumbTip].forEach(tip => {
                const x = tip.x;
                const y = tip.y;
                hitZones.forEach(zone => {
                  const zX = zone.x / 100;
                  const zY = zone.y / 100;
                  const zW = zone.width / 100;
                  const zH = zone.height / 100;
                  if (x >= zX && x <= zX + zW && y >= zY && y <= zY + zH) {
                    frameHits.add(zone.sound);
                  }
                });
                ctx.beginPath();
                ctx.arc(tip.x * canvasRef.current.width, tip.y * canvasRef.current.height, 12, 0, 2 * Math.PI);
                ctx.fillStyle = tip === indexTip ? 'rgba(239, 68, 68, 0.8)' : 'rgba(59, 130, 246, 0.8)';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 3;
                ctx.stroke();
              });
            });
          }

          frameHits.forEach(sound => {
            if (!activeHitsRef.current.has(sound)) {
              const taggedSound = instrumentType === 'Harp' ? `harp:${sound}` : sound;
              toneService.startNote(taggedSound, instrumentType);
              noteCountRef.current += 1;
              uniqueNotesRef.current.add(sound);
              const zone = hitZones.find(z => z.sound === sound);
              if (zone) {
                const px = (zone.x + zone.width / 2) / 100 * canvasRef.current.width;
                const py = (zone.y + zone.height / 2) / 100 * canvasRef.current.height;
                spawnParticles(px, py, '#2563eb');
              }
            }
          });

          activeHitsRef.current.forEach(sound => {
            if (!frameHits.has(sound)) {
              const taggedSound = instrumentType === 'Harp' ? `harp:${sound}` : sound;
              toneService.stopNote(taggedSound, instrumentType);
            }
          });

          activeHitsRef.current = frameHits;

          particlesRef.current = particlesRef.current.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.5;
            p.life -= 0.025;
            if (p.life > 0) {
              ctx.globalAlpha = p.life;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = 1;
              return true;
            }
            return false;
          });

          hitZones.forEach(zone => {
            const isActive = frameHits.has(zone.sound);
            const rectX = (zone.x / 100) * canvasRef.current.width;
            const rectY = (zone.y / 100) * canvasRef.current.height;
            const rectW = (zone.width / 100) * canvasRef.current.width;
            const rectH = (zone.height / 100) * canvasRef.current.height;
            const baseColor = instrumentType === 'Harp' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(59, 130, 246, 0.2)';
            const activeColor = instrumentType === 'Harp' ? 'rgba(251, 191, 36, 0.6)' : 'rgba(239, 68, 68, 0.5)';
            const strokeColor = instrumentType === 'Harp' ? '#fbbf24' : (isActive ? '#ef4444' : 'rgba(59, 130, 246, 0.6)');

            ctx.fillStyle = isActive ? activeColor : baseColor;
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = isActive ? 10 : (instrumentType === 'Harp' ? 2 : 4);
            ctx.lineJoin = 'round';
            ctx.strokeRect(rectX, rectY, rectW, rectH);
            ctx.fillRect(rectX, rectY, rectW, rectH);
            ctx.fillStyle = isActive ? '#fff' : (instrumentType === 'Harp' ? '#92400e' : '#1e3a8a');
            ctx.font = 'bold 18px Fredoka One';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const labelY = zone.height > 30 ? rectY + (rectH * 0.8) : rectY + (rectH / 2);
            ctx.fillText(zone.label.toUpperCase(), rectX + rectW/2, labelY);
          });
        }
      }
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [landmarker, hitZones, hasStarted, instrumentType]);

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
      {/* Full Screen Camera View */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100"
          autoPlay
          muted
          playsInline
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-10 pointer-events-none"
        />
      </div>

      {/* PEeking Mascot Player - Floating over full screen */}
      <div className="absolute left-[2%] bottom-[-5%] w-[150px] md:w-[250px] z-20 pointer-events-none transform transition-transform duration-500 animate-float">
         <MascotPlayer className="w-full h-full opacity-80 drop-shadow-2xl" />
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-blue-600 font-bold text-2xl z-[100]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-3xl font-black mb-2">Preparing the stage...</h2>
            <p className="animate-pulse">Loading AI Vision magic 🖐️</p>
          </div>
        </div>
      )}

      {/* Start Overlay */}
      {!hasStarted && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e3a8a]/60 backdrop-blur-md z-[60] p-4">
          <div className="bg-white/95 rounded-[4rem] shadow-2xl border-[12px] border-white/60 p-2 max-w-md w-full animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[3rem] p-10 flex flex-col items-center text-center shadow-xl">
              <div className="text-7xl mb-6 drop-shadow-lg">🎨</div>
              <h3 className="text-4xl md:text-5xl font-black text-[#1e3a8a] mb-4 leading-tight uppercase tracking-tighter" style={{ fontFamily: 'Fredoka One' }}>
                Ready to Rock?
              </h3>
              <p className="text-gray-500 mb-10 font-bold text-lg leading-relaxed">
                Your drawing zones are mapped. Touch the squares on the screen with your fingers!
              </p>
              <button
                onClick={handleStart}
                disabled={isAudioLoading}
                className="w-full py-8 bg-[#FF6B6B] hover:bg-[#D64545] text-white text-3xl font-black rounded-full shadow-[0_12px_0_#D64545] hover:translate-y-1 hover:shadow-[0_8px_0_#D64545] active:translate-y-[12px] active:shadow-none transition-all duration-150 uppercase tracking-widest"
              >
                {isAudioLoading ? 'Warming up...' : "LET'S ROCK!"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HUD & Exit Control */}
      {hasStarted && (
        <>
          <div className="absolute top-8 left-8 z-40">
             <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/40 shadow-xl">
                <span className="text-white font-black uppercase tracking-widest text-sm">Live Performance</span>
             </div>
          </div>
          
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center z-40 px-6">
            <button
              onClick={handleStop}
              className="max-w-[280px] w-full py-5 bg-white/90 backdrop-blur-md text-red-600 border-4 border-red-600 rounded-full font-black text-xl shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:bg-white transition-all active:scale-95 uppercase tracking-wider"
            >
              ⏹️ FINISH SHOW
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default InstrumentPlayer;
