
import React, { useRef, useEffect, useState } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { HitZone, PerformanceEvent } from '../types';
import { toneService } from '../services/toneService';

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
  hitZones: HitZone[];
  onExit: (recording: Blob | null, stats: { noteCount: number; uniqueNotes: Set<string>; duration: number; eventLog: PerformanceEvent[] }) => void;
}

const InstrumentPlayer: React.FC<Props> = ({ hitZones, onExit }) => {
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
            video: { facingMode: 'user', width: 640, height: 480 } 
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
    // Apply a default "Pro" mixing preset on start
    // Fix: Added missing distortionAmount to comply with MixingPreset type
    toneService.applyMixingPreset({
      reverbAmount: 0.2,
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
              toneService.play(sound);
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
            ctx.fillStyle = isActive ? 'rgba(239, 68, 68, 0.5)' : 'rgba(59, 130, 246, 0.2)';
            ctx.strokeStyle = isActive ? '#ef4444' : 'rgba(59, 130, 246, 0.6)';
            ctx.lineWidth = isActive ? 10 : 4;
            ctx.lineJoin = 'round';
            ctx.strokeRect(rectX, rectY, rectW, rectH);
            ctx.fillRect(rectX, rectY, rectW, rectH);
            ctx.fillStyle = isActive ? '#fff' : '#1e3a8a';
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
  }, [landmarker, hitZones, hasStarted]);

  return (
    <div className="fixed inset-0 bg-stone-100 flex flex-col items-center justify-center z-50 overflow-hidden text-center">
      <div className="relative w-full h-full max-w-5xl max-h-[90vh] flex flex-col items-center">
        <div className="relative w-full h-full shadow-inner overflow-hidden rounded-[2rem] border-[12px] border-stone-800 bg-white">
          <video
            ref={videoRef}
            className="absolute inset-0 w-full h-full object-contain -scale-x-100"
            autoPlay
            muted
            playsInline
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute inset-0 w-full h-full object-contain -scale-x-100 z-10"
          />
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-blue-600 font-bold text-2xl z-20">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <h2 className="text-3xl font-black mb-2">Preparing the stage...</h2>
                <p className="animate-pulse">Loading AI Vision magic 🖐️</p>
              </div>
            </div>
          )}
          {!hasStarted && !isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/60 backdrop-blur-sm z-30 transition-all">
              <div className="text-center p-12 bg-white rounded-[4rem] shadow-2xl max-w-md mx-4 border-8 border-yellow-400">
                <div className="text-6xl mb-4">🎨</div>
                <h3 className="text-5xl font-black text-blue-600 mb-6 leading-tight uppercase">Ready to Rock?</h3>
                <p className="text-gray-600 mb-10 font-bold text-lg">Your drawing zones are mapped. Touch the squares with your fingers!</p>
                <button
                  onClick={handleStart}
                  disabled={isAudioLoading}
                  className="w-full py-8 bg-red-500 hover:bg-red-600 text-white text-4xl font-black rounded-full shadow-[0_10px_0_rgb(185,28,28)] transition-all active:translate-y-2 active:shadow-none"
                >
                  {isAudioLoading ? 'Warming up...' : 'LET\'S ROCK!'}
                </button>
              </div>
            </div>
          )}
        </div>
        {hasStarted && (
          <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-4 z-40 px-6">
            <button
              onClick={handleStop}
              className="flex-1 max-w-[200px] py-4 bg-white text-red-600 border-4 border-red-600 rounded-full font-black text-lg shadow-xl hover:bg-red-50 transition-all active:scale-95"
            >
              ⏹️ FINISH SHOW
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstrumentPlayer;
