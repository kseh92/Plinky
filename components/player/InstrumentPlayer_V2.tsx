
import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as Tone from 'tone';
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
  type: string; // 'star' | 'note'
  rotation: number;
  rotationSpeed: number;
}

interface Props {
  instrumentType: InstrumentType;
  hitZones: HitZone[];
  onExit: (recording: Blob | null, stats: { noteCount: number; uniqueNotes: Set<string>; duration: number; eventLog: PerformanceEvent[] }) => void;
  showDebugHud?: boolean;
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

const InstrumentPlayer: React.FC<Props> = ({ instrumentType, hitZones, onExit, showDebugHud = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [zoneScale, setZoneScale] = useState(1.0); 
  const [debugInfo, setDebugInfo] = useState({
    hitZones: 0,
    landmarks: 0,
    lastHit: '—',
    audioState: 'unknown'
  });
  
  const noteCountRef = useRef(0);
  const uniqueNotesRef = useRef<Set<string>>(new Set());
  const activeHitsRef = useRef<Set<string>>(new Set());
  const particlesRef = useRef<Particle[]>([]);
  const pointerDownRef = useRef(false);
  const lastTouchTimeRef = useRef<Map<string, number>>(new Map());
  const roiSupportedRef = useRef<boolean | null>(null);

  const instrumentCenter = useMemo(() => {
    if (hitZones.length === 0) return { x: 50, y: 50 };
    const minX = Math.min(...hitZones.map(z => z.x));
    const minY = Math.min(...hitZones.map(z => z.y));
    const maxX = Math.max(...hitZones.map(z => z.x + z.width));
    const maxY = Math.max(...hitZones.map(z => z.y + z.height));
    return {
      x: (minX + maxX) / 2,
      y: (minY + maxY) / 2
    };
  }, [hitZones]);

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
      toneService.stopAll(); 
    };
  }, []);

  const handleStart = async () => {
    setIsAudioLoading(true);
    await toneService.init(); 
    toneService.applyMixingPreset({
      reverbAmount: instrumentType === 'Harp' ? 0.3 : 0.15,
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
    const symbols = ['⭐', '♪', '♫', '♬', '✨', '🎈'];
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 20,
        vy: (Math.random() * -15) - 5,
        life: 1.0,
        color,
        size: Math.random() * 20 + 15,
        type: symbols[Math.floor(Math.random() * symbols.length)],
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.2
      });
    }
  };

  const getScaledZones = () => {
    return hitZones.map(zone => {
      const sW = zone.width * zoneScale;
      const sH = zone.height * zoneScale;
      const sX_raw = instrumentCenter.x + (zone.x - instrumentCenter.x) * zoneScale;
      const sY = instrumentCenter.y + (zone.y - instrumentCenter.y) * zoneScale;
      const sX = instrumentType === 'Piano' ? (100 - (sX_raw + sW)) : sX_raw;
      return { ...zone, sX, sY, sW, sH };
    });
  };

  const handleTouchPlay = (clientX: number, clientY: number) => {
    if (!hasStarted || !canvasRef.current) return;
    if (instrumentType !== 'Harp' && instrumentType !== 'Drum' && instrumentType !== 'Piano') return;
    const rect = canvasRef.current.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;
    let tx = (clientX - rect.left) / rect.width;
    let ty = (clientY - rect.top) / rect.height;
    if (tx < 0 || tx > 1 || ty < 0 || ty > 1) return;

    // Canvas is mirrored via CSS scaleX(-1)
    tx = 1 - tx;

    const scaledZones = getScaledZones();
    const hitZone = scaledZones.find((zone) =>
      tx >= zone.sX / 100 && tx <= (zone.sX + zone.sW) / 100 &&
      ty >= zone.sY / 100 && ty <= (zone.sY + zone.sH) / 100
    );

    if (!hitZone) {
      return;
    }

    const now = Date.now();
    const lastTime = lastTouchTimeRef.current.get(hitZone.sound) || 0;
    if (now - lastTime < 40) return;
    lastTouchTimeRef.current.set(hitZone.sound, now);

    const taggedSound = instrumentType === 'Harp' ? `harp:${hitZone.sound}` : hitZone.sound;
    toneService.play(taggedSound, undefined, instrumentType);
    if (instrumentType === 'Harp' || instrumentType === 'Piano') {
      window.setTimeout(() => toneService.release(taggedSound, undefined, instrumentType), 200);
    }
    noteCountRef.current += 1;
    uniqueNotesRef.current.add(hitZone.sound);
    const px = ((hitZone.sX + hitZone.sW / 2) / 100) * canvasRef.current.width;
    const py = ((hitZone.sY + hitZone.sH / 2) / 100) * canvasRef.current.height;
    const pColor = instrumentType === 'Drum' ? '#f87171' : instrumentType === 'Piano' ? '#ffffff' : '#fbbf24';
    spawnParticles(px, py, pColor);
  };

  const drawWobblyPath = (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number, jitter: number = 3.5) => {
    const segments = 4;
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;

    let cx = x1;
    let cy = y1;
    ctx.moveTo(x1, y1);

    for (let i = 1; i <= segments; i++) {
      const nextX = x1 + dx * i;
      const nextY = y1 + dy * i;
      const midX = (cx + nextX) / 2 + (Math.random() - 0.5) * jitter * 2.0;
      const midY = (cy + nextY) / 2 + (Math.random() - 0.5) * jitter * 2.0;
      ctx.quadraticCurveTo(midX, midY, nextX, nextY);
      cx = nextX;
      cy = nextY;
    }
  };

  const drawRoughRect = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number, jitter: number = 3.5, isOpaque: boolean = false) => {
    const passes = 3; 
    const oldAlpha = ctx.globalAlpha;
    const oldShadowBlur = ctx.shadowBlur;
    const oldShadowColor = ctx.shadowColor;

    // Apply a subtle paper-style drop shadow for marker depth
    ctx.shadowBlur = 4;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;
    
    for (let p = 0; p < passes; p++) {
      ctx.beginPath();
      const ox = x + (Math.random() - 0.5) * jitter * 0.5;
      const oy = y + (Math.random() - 0.5) * jitter * 0.5;
      const ow = w + (Math.random() - 0.5) * jitter * 0.4;
      const oh = h + (Math.random() - 0.5) * jitter * 0.4;

      drawWobblyPath(ctx, ox + r, oy, ox + ow - r, oy, jitter);
      drawWobblyPath(ctx, ox + ow, oy + r, ox + ow, oy + oh - r, jitter);
      drawWobblyPath(ctx, ox + ow - r, oy + oh, ox + r, oy + oh, jitter);
      drawWobblyPath(ctx, ox, oy + oh - r, ox, oy + r, jitter);
      ctx.closePath();
      
      if (p === 0) {
        if (isOpaque) ctx.globalAlpha = 1.0;
        ctx.fill();
        ctx.globalAlpha = oldAlpha;
      }
      // Outlines are always opaque black marker
      ctx.stroke();
    }
    
    ctx.shadowBlur = oldShadowBlur;
    ctx.shadowColor = oldShadowColor;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  };

  const drawRoughEllipse = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number) => {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const rx = w / 2;
    const ry = h / 2;
    
    ctx.beginPath();
    for (let i = 0; i <= 360; i += 15) {
        const angle = (i * Math.PI) / 180;
        const jitterX = (Math.random() - 0.5) * 6;
        const jitterY = (Math.random() - 0.5) * 6;
        const px = cx + rx * Math.cos(angle) + jitterX;
        const py = cy + ry * Math.sin(angle) + jitterY;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  };

  const drawRoundedRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) => {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rr, y);
    ctx.lineTo(x + w - rr, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
    ctx.lineTo(x + w, y + h - rr);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
    ctx.lineTo(x + rr, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
    ctx.lineTo(x, y + rr);
    ctx.quadraticCurveTo(x, y, x + rr, y);
  };

  const drawDoodleRect = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    options: { fillStyle: string; outlineColor?: string; outlineWidth?: number; jitter?: number; passes?: number; fillAlpha?: number }
  ) => {
    const {
      fillStyle,
      outlineColor = '#111',
      outlineWidth = 4,
      jitter = 4.5,
      passes = 3,
      fillAlpha = 1
    } = options;

    const oldAlpha = ctx.globalAlpha;
    const oldLineWidth = ctx.lineWidth;
    const oldStrokeStyle = ctx.strokeStyle;
    const oldLineJoin = ctx.lineJoin;
    const oldLineCap = ctx.lineCap;

    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    ctx.beginPath();
    drawRoundedRectPath(ctx, x, y, w, h, r);
    ctx.fillStyle = fillStyle;
    ctx.globalAlpha = fillAlpha;
    ctx.fill();
    ctx.globalAlpha = oldAlpha;

    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    for (let p = 0; p < passes; p++) {
      ctx.beginPath();
      const ox = x + (Math.random() - 0.5) * jitter * 0.6;
      const oy = y + (Math.random() - 0.5) * jitter * 0.6;
      const ow = w + (Math.random() - 0.5) * jitter * 0.5;
      const oh = h + (Math.random() - 0.5) * jitter * 0.5;

      drawWobblyPath(ctx, ox + r, oy, ox + ow - r, oy, jitter);
      drawWobblyPath(ctx, ox + ow, oy + r, ox + ow, oy + oh - r, jitter);
      drawWobblyPath(ctx, ox + ow - r, oy + oh, ox + r, oy + oh, jitter);
      drawWobblyPath(ctx, ox, oy + oh - r, ox, oy + r, jitter);
      ctx.closePath();
      ctx.stroke();
    }

    ctx.lineWidth = oldLineWidth;
    ctx.strokeStyle = oldStrokeStyle;
    ctx.lineJoin = oldLineJoin;
    ctx.lineCap = oldLineCap;
  };

  const drawDoodleStar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) => {
    const spikes = 5;
    const step = Math.PI / spikes;
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? r : r * 0.45;
      const angle = i * step - Math.PI / 2;
      const jitterX = (Math.random() - 0.5) * 2.5;
      const jitterY = (Math.random() - 0.5) * 2.5;
      const x = cx + Math.cos(angle) * radius + jitterX;
      const y = cy + Math.sin(angle) * radius + jitterY;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();
  };

  useEffect(() => {
    if (!hasStarted || !landmarker) return;

    let animationId: number;
    const render = () => {
      if (videoRef.current && canvasRef.current && videoRef.current.readyState === 4) {
        const vw = videoRef.current.videoWidth;
        const vh = videoRef.current.videoHeight;
        if (!vw || !vh) {
          animationId = requestAnimationFrame(render);
          return;
        }
        const aspect = vw / vh;
        const roi = aspect >= 1
          ? { left: (1 - (vh / vw)) / 2, top: 0, right: 1 - (1 - (vh / vw)) / 2, bottom: 1 }
          : { left: 0, top: (1 - (vw / vh)) / 2, right: 1, bottom: 1 - (1 - (vw / vh)) / 2 };
        let results;
        if (roiSupportedRef.current !== false) {
          try {
            results = landmarker.detectForVideo(videoRef.current, performance.now(), {
              regionOfInterest: roi,
              rotationDegrees: 0
            });
            roiSupportedRef.current = true;
          } catch (err) {
            roiSupportedRef.current = false;
            if (showDebugHud) {
              console.warn('[InstrumentPlayer] ROI not supported, retrying without ROI.', err);
            }
            results = landmarker.detectForVideo(videoRef.current, performance.now());
          }
        } else {
          results = landmarker.detectForVideo(videoRef.current, performance.now());
        }
        const landmarksCount = results?.landmarks ? results.landmarks.length : 0;
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = vw;
          canvasRef.current.height = vh;
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          
          const scaledZones = hitZones.map(zone => {
            const sW = zone.width * zoneScale;
            const sH = zone.height * zoneScale;
            const sX_raw = instrumentCenter.x + (zone.x - instrumentCenter.x) * zoneScale;
            const sY = instrumentCenter.y + (zone.y - instrumentCenter.y) * zoneScale;
            const sX = instrumentType === 'Piano' ? (100 - (sX_raw + sW)) : sX_raw;
            return { ...zone, sX, sY, sW, sH };
          });

          const frameHits = new Set<string>();
          const tipMarkers: { x: number; y: number; isIndex: boolean }[] = [];

          if (results.landmarks) {
            results.landmarks.forEach(landmarks => {
              [8, 4].forEach(tipIndex => {
                const tip = landmarks[tipIndex];
                scaledZones.forEach(zone => {
                  const sW = zone.sW;
                  const sH = zone.sH;
                  const sX = zone.sX;
                  const sY = zone.sY;

                  if (tip.x >= sX/100 && tip.x <= (sX + sW)/100 && 
                      tip.y >= sY/100 && tip.y <= (sY + sH)/100) {
                    frameHits.add(zone.sound);
                  }
                });
                tipMarkers.push({ x: tip.x, y: tip.y, isIndex: tipIndex === 8 });
              });
            });
          }

          frameHits.forEach(sound => {
            if (!activeHitsRef.current.has(sound)) {
              const taggedSound = instrumentType === 'Harp' ? `harp:${sound}` : sound;
              toneService.play(taggedSound, undefined, instrumentType);
              noteCountRef.current += 1;
              uniqueNotesRef.current.add(sound);
              setDebugInfo((prev) => ({
                ...prev,
                lastHit: sound
              }));
              const zone = hitZones.find(z => z.sound === sound);
              if (zone) {
                const scaled = scaledZones.find(z => z.sound === sound);
                const sW = scaled ? scaled.sW : zone.width * zoneScale;
                const sH = scaled ? scaled.sH : zone.height * zoneScale;
                const sX = scaled ? scaled.sX : instrumentCenter.x + (zone.x - instrumentCenter.x) * zoneScale;
                const sY = scaled ? scaled.sY : instrumentCenter.y + (zone.y - instrumentCenter.y) * zoneScale;
                const px = (sX + sW / 2) / 100 * canvasRef.current.width;
                const py = (sY + sH / 2) / 100 * canvasRef.current.height;
                const pColor = instrumentType === 'Piano' ? '#fff' : instrumentType === 'Drum' ? '#f87171' : '#fbbf24';
                spawnParticles(px, py, pColor);
              }
            }
          });

          activeHitsRef.current.forEach(sound => {
            if (!frameHits.has(sound)) {
              const taggedSound = instrumentType === 'Harp' ? `harp:${sound}` : sound;
              toneService.release(taggedSound, undefined, instrumentType);
            }
          });
          activeHitsRef.current = frameHits;
          setDebugInfo((prev) => ({
            ...prev,
            hitZones: hitZones.length,
            landmarks: landmarksCount,
            audioState: (Tone.getContext().state || 'unknown')
          }));

          if (instrumentType === 'Piano' && scaledZones.length > 0) {
            const minX = Math.min(...scaledZones.map(z => z.sX));
            const minY = Math.min(...scaledZones.map(z => z.sY));
            const maxX = Math.max(...scaledZones.map(z => z.sX + z.sW));
            const maxY = Math.max(...scaledZones.map(z => z.sY + z.sH));

            const frameX = (minX / 100) * canvasRef.current.width;
            const frameY = (minY / 100) * canvasRef.current.height;
            const frameW = ((maxX - minX) / 100) * canvasRef.current.width;
            const frameH = ((maxY - minY) / 100) * canvasRef.current.height;

            const pad = Math.min(frameW, frameH) * 0.06;
            ctx.strokeStyle = '#111';
            ctx.lineWidth = 4;
            drawDoodleRect(
              ctx,
              frameX - pad,
              frameY - pad * 1.2,
              frameW + pad * 2,
              frameH + pad * 2.2,
              24,
              { fillStyle: 'rgba(255, 248, 227, 0.45)', outlineColor: '#111', outlineWidth: 4, jitter: 5, passes: 2 }
            );

            const standW = frameW * 0.45;
            const standH = Math.max(18, frameH * 0.18);
            const standX = frameX + frameW * 0.275;
            const standY = frameY - standH * 0.6;
            drawDoodleRect(
              ctx,
              standX,
              standY,
              standW,
              standH,
              14,
              { fillStyle: 'rgba(255, 255, 255, 0.35)', outlineColor: '#111', outlineWidth: 3, jitter: 4, passes: 2 }
            );

            ctx.strokeStyle = '#111';
            ctx.lineWidth = 3;
            drawDoodleStar(ctx, frameX + frameW * 0.08, frameY - pad * 0.2, 10);
            drawDoodleStar(ctx, frameX + frameW * 0.92, frameY - pad * 0.1, 8);
          }

          const pianoZones = instrumentType === 'Piano' ? scaledZones : [];
          const whiteKeys = instrumentType === 'Piano' ? pianoZones.filter(z => !(z.sound.includes('#') || z.sound.includes('s'))) : [];
          const blackKeys = instrumentType === 'Piano' ? pianoZones.filter(z => z.sound.includes('#') || z.sound.includes('s')) : [];

          const drawZone = (zone: HitZone & { sX: number; sY: number; sW: number; sH: number }) => {
            const isActive = frameHits.has(zone.sound);

            const rectX = (zone.sX / 100) * canvasRef.current.width;
            const rectY = (zone.sY / 100) * canvasRef.current.height;
            const rectW = (zone.sW / 100) * canvasRef.current.width;
            const rectH = (zone.sH / 100) * canvasRef.current.height;

            if (instrumentType === 'Piano') {
              const isSharp = zone.sound.includes('#') || zone.sound.includes('s');
              const outlineWidth = isActive ? 5 : 4;
              if (isSharp) {
                drawDoodleRect(ctx, rectX, rectY, rectW, rectH, 6, {
                  fillStyle: '#111',
                  outlineColor: '#111',
                  outlineWidth,
                  jitter: 4.5,
                  passes: 3
                });
              } else {
                drawDoodleRect(ctx, rectX, rectY, rectW, rectH, 10, {
                  fillStyle: 'rgba(255, 255, 255, 0.55)',
                  outlineColor: '#111',
                  outlineWidth,
                  jitter: 5,
                  passes: 3
                });
              }
            } else if (instrumentType === 'Drum') {
              const isCymbal = zone.sound.includes('crash') || zone.sound.includes('hihat');
              ctx.fillStyle = isCymbal ? (isActive ? 'rgba(252, 211, 77, 0.75)' : 'rgba(251, 191, 36, 0.5)') : (isActive ? 'rgba(248, 113, 113, 0.75)' : 'rgba(239, 68, 68, 0.5)');
              ctx.strokeStyle = '#fff';
              ctx.lineWidth = isActive ? 10 : 8;
              drawRoughEllipse(ctx, rectX, rectY, rectW, rectH);
            } else if (instrumentType === 'Harp') {
              ctx.strokeStyle = isActive ? 'rgba(255, 255, 255, 0.95)' : 'rgba(251, 191, 36, 0.75)';
              ctx.lineWidth = isActive ? 12 : 6;
              ctx.beginPath();
              drawWobblyPath(ctx, rectX + rectW/2, rectY, rectX + rectW/2, rectY + rectH, 2);
              ctx.stroke();
            } else {
              ctx.strokeStyle = isActive ? 'rgba(255, 255, 255, 0.8)' : 'rgba(255, 255, 255, 0.45)';
              ctx.lineWidth = isActive ? 10 : 8;
              drawRoughRect(ctx, rectX, rectY, rectW, rectH, 15);
            }
          };

          if (instrumentType === 'Piano') {
            whiteKeys.forEach(drawZone);
            blackKeys.forEach(drawZone);
          } else {
            scaledZones.forEach(drawZone);
          }

          tipMarkers.forEach(marker => {
            ctx.beginPath();
            ctx.arc(marker.x * canvasRef.current.width, marker.y * canvasRef.current.height, 15, 0, 2 * Math.PI);
            ctx.fillStyle = marker.isIndex ? 'rgba(239, 68, 68, 0.85)' : 'rgba(59, 130, 246, 0.85)';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 4;
            ctx.stroke();
          });

          particlesRef.current = particlesRef.current.filter(p => {
            p.x += p.vx; p.y += p.vy; p.vy += 0.8; p.vx *= 0.98; p.rotation += p.rotationSpeed; p.life -= 0.04;
            if (p.life > 0) {
              ctx.save();
              ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
              ctx.globalAlpha = p.life; ctx.shadowBlur = 10; ctx.shadowColor = p.color;
              ctx.fillStyle = p.color; ctx.font = `${p.size * p.life}px Arial`;
              ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
              ctx.fillText(p.type, 0, 0);
              ctx.restore();
              return true;
            }
            return false;
          });
        }
      }
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [landmarker, hitZones, hasStarted, instrumentType, zoneScale, instrumentCenter]);

  return (
    <div className="fixed inset-0 bg-black z-50 overflow-hidden">
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
          className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-10"
          onPointerDown={(e) => {
            pointerDownRef.current = true;
            handleTouchPlay(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (!pointerDownRef.current) return;
            handleTouchPlay(e.clientX, e.clientY);
          }}
          onPointerUp={() => { pointerDownRef.current = false; }}
          onPointerLeave={() => { pointerDownRef.current = false; }}
        />
      </div>

      {hasStarted && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col items-center gap-6 bg-white/20 backdrop-blur-md p-8 rounded-[3rem] border-[6px] border-white/40 shadow-2xl animate-in slide-in-from-right-10 duration-500">
           <div className="flex flex-col items-center gap-2">
             <span className="text-white font-black uppercase tracking-widest text-[10px]">Instrument Size</span>
             <span className="text-white font-black text-2xl">{Math.round(zoneScale * 100)}%</span>
           </div>
           
           <div className="h-48 flex items-center">
             <input 
               type="range" 
               min="0.5" 
               max="2.5" 
               step="0.1" 
               value={zoneScale} 
               onChange={(e) => setZoneScale(parseFloat(e.target.value))}
               className="h-40 w-4 appearance-none bg-white/30 rounded-full outline-none cursor-pointer"
               style={{ 
                 WebkitAppearance: 'slider-vertical',
                 accentColor: '#FF6B6B'
               }}
             />
           </div>

           <div className="flex flex-col gap-2">
             <button 
               onClick={() => setZoneScale(prev => Math.min(2.5, prev + 0.2))}
               className="w-10 h-10 bg-white/40 hover:bg-white/60 rounded-full text-white font-black text-xl transition-all shadow-md"
             >
               +
             </button>
             <button 
               onClick={() => setZoneScale(prev => Math.max(0.5, prev - 0.2))}
               className="w-10 h-10 bg-white/40 hover:bg-white/60 rounded-full text-white font-black text-xl transition-all shadow-md"
             >
               -
             </button>
           </div>
        </div>
      )}

      {hasStarted && showDebugHud && (
        <div className="absolute left-6 top-6 z-40 bg-black/60 text-white text-xs font-mono px-3 py-2 rounded-lg border border-white/10">
          <div>Zones: {debugInfo.hitZones}</div>
          <div>Landmarks: {debugInfo.landmarks}</div>
          <div>Last Hit: {debugInfo.lastHit}</div>
          <div>Audio: {debugInfo.audioState}</div>
        </div>
      )}

      <div className="absolute left-[2%] bottom-[-5%] w-[150px] md:w-[250px] z-20 pointer-events-none animate-float">
         <MascotPlayer className="w-full h-full opacity-80 drop-shadow-2xl" />
      </div>

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/90 text-blue-600 font-bold text-2xl z-[100]">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-3xl font-black mb-2">Preparing the stage...</h2>
            <p className="animate-pulse">Loading AI Vision magic 🖐️</p>
          </div>
        </div>
      )}
      {!hasStarted && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#1e3a8a]/60 backdrop-blur-md z-[60] p-4">
          <div className="bg-white/95 rounded-[4rem] shadow-2xl border-[12px] border-white/60 p-2 max-w-md w-full animate-in zoom-in-95 duration-300">
            <div className="bg-white rounded-[3rem] p-10 flex flex-col items-center text-center shadow-xl">
              <div className="text-7xl mb-6">🎨</div>
              <h3 className="text-4xl font-black text-[#1e3a8a] mb-4 uppercase tracking-tighter">Ready to Rock?</h3>
              <p className="text-gray-500 mb-10 font-bold text-lg">Your drawing is ready. Move your fingers into the zones to play!</p>
              <button
                onClick={handleStart}
                disabled={isAudioLoading}
                className="w-full py-8 bg-[#FF6B6B] text-white text-3xl font-black rounded-full shadow-[0_12px_0_#D64545] hover:translate-y-1 transition-all uppercase tracking-widest"
              >
                {isAudioLoading ? 'Warming up...' : "LET'S ROCK!"}
              </button>
            </div>
          </div>
        </div>
      )}
      {hasStarted && (
        <div className="absolute bottom-8 left-0 right-0 flex justify-center z-40 px-6">
          <button
            onClick={handleStop}
            className="max-w-[280px] w-full py-5 bg-white/90 text-red-600 border-4 border-red-600 rounded-full font-black text-xl shadow-2xl hover:scale-105 active:scale-95 transition-all uppercase"
          >
            ⏹️ FINISH SHOW
          </button>
        </div>
      )}
    </div>
  );
};

export default InstrumentPlayer;
