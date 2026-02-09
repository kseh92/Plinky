import React, { useRef, useEffect, useState, useCallback } from 'react';
import { FilesetResolver, HandLandmarker } from '@mediapipe/tasks-vision';
import { AppMode, PerformanceEvent } from '../../services/types';
import { PIANO_KEYS, XYLOPHONE_BARS, HARP_STRINGS, DRUM_PADS } from '../../services/constants';
import { toneService } from '../../services/toneService';

interface ConfettiParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
}

interface Props {
  mode: AppMode;
  onExit: (recording: Blob | null, stats: { noteCount: number; uniqueNotes: Set<string>; duration: number; eventLog: PerformanceEvent[] }) => void;
  onSwitchPreset?: (mode: AppMode, name: string) => void;
  presetName?: string;
  overlayImage?: string | null;
  overlayTexture?: string | null;
  overlayLoading?: boolean;
}

const ExplorePresets: React.FC<Props> = ({ mode, onExit, onSwitchPreset, presetName, overlayImage, overlayTexture, overlayLoading }) => {
  const TOUCH_DEBOUNCE_MS = 15;
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [landmarker, setLandmarker] = useState<HandLandmarker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisionReady, setIsVisionReady] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [minDelayElapsed, setMinDelayElapsed] = useState(false);
  const [overlayReady, setOverlayReady] = useState(false);
  const overlayImageRef = useRef<HTMLImageElement | null>(null);
  const [textureReady, setTextureReady] = useState(false);
  const textureImageRef = useRef<HTMLImageElement | null>(null);
  const roiSupportedRef = useRef<boolean | null>(null);
  const loadStartRef = useRef<number | null>(null);

  const noteCountRef = useRef(0);
  const uniqueNotesRef = useRef<Set<string>>(new Set());
  const lastHitTimeRef = useRef<Map<string, number>>(new Map());
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const activeHitsRef = useRef<Set<string>>(new Set());
  const lastTouchTimeRef = useRef<Map<string, number>>(new Map());
  const audioReadyRef = useRef(false);
  const pointerDownRef = useRef(false);
  const firstTouchTimeRef = useRef<number | null>(null);

  const presetOptions = [
    { name: 'Piano with wings', mode: AppMode.PIANO, color: 'bg-blue-500', emoji: '🎹🪽' },
    { name: 'Snake-shaped xylophone', mode: AppMode.XYLOPHONE, color: 'bg-emerald-500', emoji: '🐍' },
    { name: 'Neon-harp', mode: AppMode.HARP, color: 'bg-fuchsia-500', emoji: '🎼✨' }
  ];

  const getPrefix = (currentMode: AppMode) => {
    if (currentMode === AppMode.HARP) return 'neon:';
    if (currentMode === AppMode.XYLOPHONE) return 'xylo:';
    if (currentMode === AppMode.DRUM) return 'drum:';
    return '';
  };

  const withPrefix = (currentMode: AppMode, note: string) => {
    const prefix = getPrefix(currentMode);
    return prefix ? `${prefix}${note}` : note;
  };

  const enableAudio = async () => {
    if (audioReadyRef.current) return;
    await toneService.init();
    await toneService.startRecording();
    audioReadyRef.current = true;
  };

  const isCustomDraw = !presetOptions.some((p) => p.name.toLowerCase() === (presetName || '').toLowerCase());

  const getMotif = (text: string) => {
    const value = text.toLowerCase();
    if (value.includes('flower') || value.includes('꽃')) return 'flower';
    if (value.includes('star')) return 'star';
    if (value.includes('heart')) return 'heart';
    if (value.includes('cloud')) return 'cloud';
    if (value.includes('triangle')) return 'triangle';
    if (value.includes('square') || value.includes('box')) return 'square';
    if (value.includes('circle') || value.includes('sun') || value.includes('moon')) return 'circle';
    return 'blob';
  };

  const drawMotif = (ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, motif: string) => {
    ctx.beginPath();
    if (motif === 'flower') {
      const petalCount = 6;
      for (let i = 0; i < petalCount; i++) {
        const angle = (Math.PI * 2 * i) / petalCount;
        const px = cx + Math.cos(angle) * size * 0.75;
        const py = cy + Math.sin(angle) * size * 0.75;
        ctx.ellipse(px, py, size * 0.45, size * 0.7, angle, 0, Math.PI * 2);
      }
      ctx.closePath();
      ctx.moveTo(cx + size * 0.35, cy);
      ctx.arc(cx, cy, size * 0.35, 0, Math.PI * 2);
    } else if (motif === 'star') {
      for (let i = 0; i < 10; i++) {
        const angle = (Math.PI / 5) * i - Math.PI / 2;
        const r = i % 2 === 0 ? size : size * 0.45;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
    } else if (motif === 'heart') {
      ctx.moveTo(cx, cy + size * 0.6);
      ctx.bezierCurveTo(cx - size, cy, cx - size * 0.2, cy - size * 0.7, cx, cy - size * 0.2);
      ctx.bezierCurveTo(cx + size * 0.2, cy - size * 0.7, cx + size, cy, cx, cy + size * 0.6);
      ctx.closePath();
    } else if (motif === 'cloud') {
      const bumps = [
        [-0.9, 0.05, 0.7, 0.5],
        [-0.4, -0.05, 0.8, 0.58],
        [0.1, -0.1, 0.9, 0.65],
        [0.65, 0.05, 0.7, 0.5],
        [-1.2, 0.2, 0.55, 0.4],
        [0.95, 0.2, 0.55, 0.4],
        [-0.1, 0.35, 1.0, 0.55]
      ];
      bumps.forEach(([ox, oy, rw, rh]) => {
        ctx.ellipse(
          cx + size * ox,
          cy + size * oy,
          size * rw,
          size * rh,
          0,
          0,
          Math.PI * 2
        );
      });
    } else if (motif === 'triangle') {
      ctx.moveTo(cx, cy - size);
      ctx.lineTo(cx + size, cy + size);
      ctx.lineTo(cx - size, cy + size);
      ctx.closePath();
    } else if (motif === 'square') {
      ctx.rect(cx - size, cy - size, size * 2, size * 2);
    } else if (motif === 'circle') {
      ctx.arc(cx, cy, size, 0, Math.PI * 2);
    } else {
      ctx.moveTo(cx - size, cy);
      ctx.bezierCurveTo(cx - size * 1.2, cy - size, cx + size * 0.2, cy - size * 1.2, cx + size, cy);
      ctx.bezierCurveTo(cx + size * 1.2, cy + size, cx - size * 0.2, cy + size * 1.2, cx - size, cy);
      ctx.closePath();
    }
  };

  const drawCustomOverlay = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    const name = presetName || '';
    const motif = getMotif(name);
    ctx.save();
    ctx.globalAlpha = 0.85;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';

    if (mode === AppMode.DRUM) {
      const bodyW = w * 0.42;
      const bodyH = h * 0.26;
      const cx = w * 0.5;
      const cy = h * 0.55;
      ctx.beginPath();
      ctx.ellipse(cx, cy, bodyW / 2, bodyH / 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(248, 113, 113, 0.3)';
      ctx.fill();

      if (motif === 'cloud') {
        ctx.save();
        ctx.globalCompositeOperation = 'destination-over';
        DRUM_PADS.forEach((pad) => {
          const padCx = (pad.rect.x + pad.rect.w / 2) * w;
          const padCy = (pad.rect.y + pad.rect.h / 2) * h;
          const padSize = Math.min(pad.rect.w * w, pad.rect.h * h) * 0.9;
          if (textureImageRef.current && textureReady) {
            const img = textureImageRef.current;
            ctx.save();
            ctx.beginPath();
            drawMotif(ctx, padCx, padCy, padSize, motif);
            ctx.clip();
            const scale = Math.max((padSize * 2) / img.width, (padSize * 2) / img.height);
            const drawW = img.width * scale;
            const drawH = img.height * scale;
            ctx.drawImage(img, padCx - drawW / 2, padCy - drawH / 2, drawW, drawH);
            ctx.restore();
          } else {
            ctx.beginPath();
            drawMotif(ctx, padCx, padCy, padSize, motif);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.fill();
          }
        });
        ctx.restore();
      } else {
        const topCy = cy - bodyH * 0.8;
        const r = Math.min(w, h) * 0.06;
        const positions = [
          [cx - bodyW * 0.25, topCy],
          [cx, topCy - r * 0.6],
          [cx + bodyW * 0.25, topCy]
        ];
        positions.forEach(([x, y]) => {
          ctx.beginPath();
          drawMotif(ctx, x, y, r, motif);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
        });
      }
    } else if (mode === AppMode.PIANO) {
      const baseX = w * 0.22;
      const baseY = h * 0.56;
      const baseW = w * 0.56;
      const baseH = h * 0.22;
      ctx.beginPath();
      ctx.roundRect?.(baseX, baseY, baseW, baseH, 24);
      if (!ctx.roundRect) ctx.rect(baseX, baseY, baseW, baseH);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.fill();

      const r = Math.min(w, h) * 0.05;
      const x = w * 0.5;
      const y = h * 0.38;
      ctx.beginPath();
      drawMotif(ctx, x, y, r, motif);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
    } else if (mode === AppMode.HARP) {
      const x = w * 0.5;
      const y = h * 0.32;
      const r = Math.min(w, h) * 0.07;
      ctx.beginPath();
      drawMotif(ctx, x, y, r, motif);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
    } else {
      const x = w * 0.5;
      const y = h * 0.32;
      const r = Math.min(w, h) * 0.07;
      ctx.beginPath();
      drawMotif(ctx, x, y, r, motif);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.fill();
    }
    ctx.restore();
  };

  useEffect(() => {
    if (!overlayImage) {
      overlayImageRef.current = null;
      setOverlayReady(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      overlayImageRef.current = img;
      setOverlayReady(true);
    };
    img.onerror = () => {
      overlayImageRef.current = null;
      setOverlayReady(false);
    };
    img.src = overlayImage;
  }, [overlayImage]);

  useEffect(() => {
    if (!overlayTexture) {
      textureImageRef.current = null;
      setTextureReady(false);
      return;
    }
    const img = new Image();
    img.onload = () => {
      textureImageRef.current = img;
      setTextureReady(true);
    };
    img.onerror = () => {
      textureImageRef.current = null;
      setTextureReady(false);
    };
    img.src = overlayTexture;
  }, [overlayTexture]);

  useEffect(() => {
    loadStartRef.current = performance.now();
    setMinDelayElapsed(false);
    const minTimer = window.setTimeout(() => setMinDelayElapsed(true), 800);

    const initMediaPipe = async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const hl = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 2
        });
        setLandmarker(hl);
        setIsVisionReady(true);
      } catch (err) {
        console.error('MediaPipe Init Error:', err);
        setIsVisionReady(true);
      }
    };
    initMediaPipe();

    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 }
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          const handleLoaded = () => {
            setIsCameraReady(true);
            videoRef.current?.removeEventListener('loadedmetadata', handleLoaded);
          };
          videoRef.current.addEventListener('loadedmetadata', handleLoaded);
        }
      } catch (e) {
        console.error('Camera failed', e);
        setIsCameraReady(true);
      }
    };
    startCamera();

    return () => {
      window.clearTimeout(minTimer);
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  useEffect(() => {
    const ready = isVisionReady && isCameraReady;
    setIsLoading(!(ready && minDelayElapsed));
  }, [isVisionReady, isCameraReady, minDelayElapsed]);

  const spawnConfetti = useCallback((x: number, y: number, color: string) => {
    for (let i = 0; i < 6; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 0.02,
        vy: (Math.random() - 0.8) * 0.02,
        color,
        size: Math.random() * 8 + 4,
        life: 1.0
      });
    }
  }, []);

  const handleFinish = async () => {
    const result = await toneService.stopRecording();
    onExit(result?.blob || null, {
      noteCount: noteCountRef.current,
      uniqueNotes: uniqueNotesRef.current,
      duration: result?.duration || 0,
      eventLog: result?.eventLog || []
    });
  };

  const drawDoodleWing = (ctx: CanvasRenderingContext2D, x: number, y: number, dir: number, isActive: boolean, w: number) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(dir, 1);
    const flutter = isActive ? Math.sin(Date.now() / 100) * 0.12 : Math.sin(Date.now() / 500) * 0.04;
    ctx.rotate(-0.15 + flutter);
    const wingSize = w * 0.15 * (isActive ? 1.15 : 1.0);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-wingSize * 0.2, wingSize * 0.2, 0, wingSize * 0.4);
    ctx.quadraticCurveTo(wingSize * 0.3, wingSize * 0.4, wingSize * 0.3, 0.1 * wingSize);
    ctx.quadraticCurveTo(wingSize * 0.3, -wingSize * 0.1, 0.1 * wingSize, 0);
    ctx.bezierCurveTo(wingSize * 0.2, -wingSize * 0.6, wingSize * 0.6, -wingSize * 0.8, wingSize * 1.0, -wingSize * 0.9);
    ctx.bezierCurveTo(wingSize * 0.85, -wingSize * 0.75, wingSize * 0.75, -wingSize * 0.6, wingSize * 0.85, -wingSize * 0.55);
    ctx.bezierCurveTo(wingSize * 0.7, -wingSize * 0.45, wingSize * 0.7, -wingSize * 0.35, wingSize * 0.9, -wingSize * 0.25);
    ctx.bezierCurveTo(wingSize * 0.75, -wingSize * 0.15, wingSize * 0.75, -wingSize * 0.05, wingSize * 0.95, wingSize * 0.1);
    ctx.bezierCurveTo(wingSize * 0.75, wingSize * 0.2, wingSize * 0.65, wingSize * 0.35, wingSize * 0.45, wingSize * 0.3);
    ctx.lineTo(0.3 * wingSize, 0.1 * wingSize);
    const grad = ctx.createLinearGradient(0, -wingSize, wingSize, wingSize);
    grad.addColorStop(0, isActive ? 'rgba(255, 255, 255, 0.9)' : 'rgba(255, 255, 255, 0.4)');
    grad.addColorStop(1, 'rgba(255, 255, 255, 0.1)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = isActive ? '#fff' : 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  };

  const drawNeonHarpFrame = (ctx: CanvasRenderingContext2D, w: number, h: number) => {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.strokeStyle = '#fff';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00FFFF';
    const startX = 0.15 * w;
    const endX = 0.85 * w;
    const topY = 0.1 * h;
    const bottomY = 0.9 * h;
    ctx.moveTo(startX, bottomY);
    ctx.lineTo(startX, topY);
    ctx.bezierCurveTo(w * 0.3, topY - 20, w * 0.7, topY + 50, endX, topY + 80);
    ctx.lineTo(endX, bottomY);
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  };

  const handleTouchPlay = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    let tx = (clientX - rect.left) / rect.width;
    const ty = (clientY - rect.top) / rect.height;
    if (tx < 0 || tx > 1 || ty < 0 || ty > 1) return;

    // Canvas is mirrored via CSS scaleX(-1)
    tx = 1 - tx;

    const list = mode === AppMode.PIANO
      ? PIANO_KEYS
      : mode === AppMode.XYLOPHONE
        ? XYLOPHONE_BARS
        : mode === AppMode.HARP
          ? HARP_STRINGS
          : DRUM_PADS;
    const hit = list.find((item) =>
      tx >= item.rect.x && tx <= item.rect.x + item.rect.w &&
      ty >= item.rect.y && ty <= item.rect.y + item.rect.h
    );

    if (!hit) {
      return;
    }

    const now = Date.now();
    const lastTime = lastTouchTimeRef.current.get(hit.note) || 0;
    if (now - lastTime < TOUCH_DEBOUNCE_MS) return;
    lastTouchTimeRef.current.set(hit.note, now);

    const soundId = withPrefix(mode, hit.note);
    toneService.play(soundId);
    if (mode === AppMode.HARP) {
      window.setTimeout(() => toneService.release(soundId), 200);
    }
    noteCountRef.current++;
    uniqueNotesRef.current.add(hit.note);
    spawnConfetti(hit.rect.x + hit.rect.w / 2, hit.rect.y + hit.rect.h / 2, hit.color);
    lastHitTimeRef.current.set(hit.note, Date.now());
  };

  useEffect(() => {
    if (!landmarker || !videoRef.current || !canvasRef.current) return;

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
            results = landmarker.detectForVideo(videoRef.current, performance.now());
          }
        } else {
          results = landmarker.detectForVideo(videoRef.current, performance.now());
        }
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          canvasRef.current.width = vw;
          canvasRef.current.height = vh;
          const w = canvasRef.current.width;
          const h = canvasRef.current.height;
          ctx.clearRect(0, 0, w, h);
          const frameHits = new Set<string>();
          const now = Date.now();

          if (results.landmarks) {
            results.landmarks.forEach((landmarks) => {
              const indexTip = landmarks[8];
              const thumbTip = landmarks[4];
              [indexTip, thumbTip].forEach((tip) => {
                const tx = tip.x;
                const ty = tip.y;
                const checkList = mode === AppMode.PIANO
                  ? PIANO_KEYS
                  : mode === AppMode.XYLOPHONE
                    ? XYLOPHONE_BARS
                    : mode === AppMode.HARP
                      ? HARP_STRINGS
                      : DRUM_PADS;
                checkList.forEach((item) => {
                  if (tx >= item.rect.x && tx <= item.rect.x + item.rect.w &&
                      ty >= item.rect.y && ty <= item.rect.y + item.rect.h) {
                    frameHits.add(item.note);
                  }
                });
                ctx.beginPath();
                ctx.arc(tx * w, ty * h, 15, 0, 2 * Math.PI);
                const isIndex = tip === indexTip;
                ctx.fillStyle = isIndex ? 'rgba(239, 68, 68, 0.85)' : 'rgba(59, 130, 246, 0.85)';
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 4;
                ctx.stroke();
              });
            });
          }

          frameHits.forEach((note) => {
            if (!activeHitsRef.current.has(note)) {
              const searchList = mode === AppMode.PIANO
                ? PIANO_KEYS
                : mode === AppMode.XYLOPHONE
                  ? XYLOPHONE_BARS
                  : mode === AppMode.HARP
                    ? HARP_STRINGS
                    : DRUM_PADS;
              const found = searchList.find((k) => k.note === note);
              if (found) {
                if (mode === AppMode.HARP) {
                  const lastHit = lastHitTimeRef.current.get(note) || 0;
                  if (now - lastHit >= 70) {
                    if (firstTouchTimeRef.current === null) {
                      firstTouchTimeRef.current = performance.now();
                      toneService.setRecordingStartNow();
                    }
                    toneService.startNote(withPrefix(mode, note));
                    window.setTimeout(() => toneService.stopNote(withPrefix(mode, note)), 200);
                    noteCountRef.current++;
                    uniqueNotesRef.current.add(note);
                    spawnConfetti(found.rect.x + found.rect.w / 2, found.rect.y + found.rect.h / 2, found.color);
                    lastHitTimeRef.current.set(note, now);
                  }
                } else {
                  if (firstTouchTimeRef.current === null) {
                    firstTouchTimeRef.current = performance.now();
                    toneService.setRecordingStartNow();
                  }
                  toneService.startNote(withPrefix(mode, note));
                  noteCountRef.current++;
                  uniqueNotesRef.current.add(note);
                  spawnConfetti(found.rect.x + found.rect.w / 2, found.rect.y + found.rect.h / 2, found.color);
                  lastHitTimeRef.current.set(note, now);
                }
              }
            }
          });
          if (mode !== AppMode.HARP) {
            activeHitsRef.current.forEach((note) => {
              if (!frameHits.has(note)) {
                toneService.stopNote(withPrefix(mode, note));
              }
            });
          }
          activeHitsRef.current = frameHits;

          if (mode === AppMode.PIANO) {
            const isAnyActive = frameHits.size > 0;
            drawDoodleWing(ctx, w * 0.18, h * 0.6, -1, isAnyActive, w);
            drawDoodleWing(ctx, w * 0.82, h * 0.6, 1, isAnyActive, w);
            PIANO_KEYS.forEach((key) => {
              const kx = key.rect.x * w;
              const ky = key.rect.y * h;
              const kw = key.rect.w * w;
              const kh = key.rect.h * h;
              const isActive = frameHits.has(key.note);
              ctx.fillStyle = isActive ? key.color : (key.isBlack ? '#000' : 'rgba(255,255,255,0.3)');
              ctx.fillRect(kx, ky, kw, kh);
              ctx.strokeStyle = '#fff';
              ctx.strokeRect(kx, ky, kw, kh);
            });
          } else if (mode === AppMode.XYLOPHONE) {
            const drawSnakeHead = () => {
              const firstBar = XYLOPHONE_BARS[0];
              const barLeftX = firstBar.rect.x * w;
              const barCenterY = (firstBar.rect.y + firstBar.rect.h / 2) * h;
              const s = 0.22;
              const headX = barLeftX - (587.5 * s) + 10;
              const headY = barCenterY + Math.sin(now / 200) * 12;
              ctx.save();
              ctx.globalAlpha = 0.6;
              ctx.translate(headX, headY);
              ctx.translate(-587.5 * s, -548.5 * s);
              ctx.beginPath();
              ctx.ellipse(587.5 * s, 548.5 * s, 587.5 * s, 548.5 * s, 0, 0, Math.PI * 2);
              ctx.fillStyle = '#3CDA03';
              ctx.fill();
              ctx.beginPath();
              ctx.ellipse(235.5 * s, 389 * s, 103.5 * s, 101 * s, 0, 0, Math.PI * 2);
              ctx.fillStyle = 'white';
              ctx.fill();
              ctx.beginPath();
              ctx.ellipse(559 * s, 448 * s, 110 * s, 101 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.ellipse(229.5 * s, 409.5 * s, 59.5 * s, 55.5 * s, 0, 0, Math.PI * 2);
              ctx.fillStyle = '#0F0E0E';
              ctx.fill();
              ctx.beginPath();
              ctx.ellipse(559.5 * s, 465.5 * s, 59.5 * s, 55.5 * s, 0, 0, Math.PI * 2);
              ctx.fill();
              ctx.beginPath();
              ctx.moveTo(314.651 * s, 646.556 * s);
              ctx.bezierCurveTo(236.944 * s, 634.977 * s, 194.952 * s, 627.932 * s, 185.674 * s, 637.174 * s);
              ctx.bezierCurveTo(156.447 * s, 666.292 * s, 168.166 * s, 710.312 * s, 157.179 * s, 738.894 * s);
              ctx.bezierCurveTo(154.784 * s, 745.126 * s, 148.495 * s, 747.631 * s, 148.425 * s, 747.683 * s);
              ctx.bezierCurveTo(135.076 * s, 757.695 * s, 178.559 * s, 726.844 * s, 189.023 * s, 726.164 * s);
              ctx.bezierCurveTo(196.178 * s, 725.699 * s, 192.58 * s, 751.956 * s, 194.306 * s, 758.007 * s);
              ctx.bezierCurveTo(199.59 * s, 776.527 * s, 215.808 * s, 730.297 * s, 218.721 * s, 722.188 * s);
              ctx.bezierCurveTo(199.59 * s, 776.527 * s, 215.808 * s, 730.297 * s, 218.721 * s, 722.188 * s);
              ctx.bezierCurveTo(225.866 * s, 702.291 * s, 212.356 * s, 687.293 * s, 212.338 * s, 679.166 * s);
              ctx.bezierCurveTo(212.322 * s, 671.753 * s, 225.086 * s, 669.819 * s, 234.363 * s, 669.226 * s);
              ctx.bezierCurveTo(244.051 * s, 668.607 * s, 251.837 * s, 676.76 * s, 259.946 * s, 680.248 * s);
              ctx.bezierCurveTo(269.571 * s, 684.388 * s, 279.739 * s, 679.132 * s, 286.697 * s, 673.342 * s);
              ctx.bezierCurveTo(294.9 * s, 666.516 * s, 299.514 * s, 657.054 * s, 301.275 * s, 650.096 * s);
              ctx.bezierCurveTo(306.01 * s, 631.395 * s, 269.38 * s, 624.514 * s, 192.318 * s, 594.362 * s);
              ctx.bezierCurveTo(174.06 * s, 587.299 * s, 166.003 * s, 583.847 * s, 160.702 * s, 580.341 * s);
              ctx.bezierCurveTo(155.401 * s, 576.836 * s, 153.099 * s, 573.383 * s, 147.239 * s, 566.338 * s);
              ctx.strokeStyle = '#EE5E5E';
              ctx.lineWidth = 4;
              ctx.lineCap = 'round';
              ctx.stroke();
              ctx.restore();
            };
            const drawSnakeBody = () => {
              ctx.save();
              ctx.beginPath();
              const startX = (XYLOPHONE_BARS[0].rect.x - 0.05) * w;
              const startY = (XYLOPHONE_BARS[0].rect.y + XYLOPHONE_BARS[0].rect.h / 2) * h;
              ctx.moveTo(startX, startY);
              XYLOPHONE_BARS.forEach((bar) => {
                const bx = (bar.rect.x + bar.rect.w / 2) * w;
                const by = (bar.rect.y + bar.rect.h / 2) * h;
                ctx.lineTo(bx, by);
              });
              ctx.strokeStyle = 'rgba(255,255,255,0.02)';
              ctx.lineWidth = 110;
              ctx.stroke();
              XYLOPHONE_BARS.forEach((bar) => {
                const bx = bar.rect.x * w;
                const by = bar.rect.y * h;
                const bw = bar.rect.w * w;
                const bh = bar.rect.h * h;
                const lastHit = lastHitTimeRef.current.get(bar.note) || 0;
                const active = (now - lastHit) < 150;
                ctx.save();
                if (bar.note === 'b4') {
                  ctx.beginPath();
                  ctx.moveTo(bx, by);
                  ctx.lineTo(bx, by + bh);
                  ctx.lineTo(bx + bw, by);
                  ctx.closePath();
                  ctx.clip();
                }
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = bar.color;
                const cornerRadius = bar.note === 'b4' ? Math.min(bw, bh) * 0.45 : Math.min(bw, bh) * 0.28;
                ctx.beginPath();
                if (typeof (ctx as CanvasRenderingContext2D & { roundRect?: Function }).roundRect === 'function') {
                  ctx.roundRect(bx, by, bw, bh, cornerRadius);
                } else {
                  ctx.rect(bx, by, bw, bh);
                }
                ctx.fill();
                if (active) {
                  ctx.globalAlpha = 1.0;
                  ctx.strokeStyle = 'white';
                  ctx.lineWidth = 4;
                  ctx.stroke();
                }
                ctx.restore();
              });
              ctx.restore();
            };
            drawSnakeBody();
            drawSnakeHead();
          } else if (mode === AppMode.HARP) {
            drawNeonHarpFrame(ctx, w, h);
            const neonMap: Record<string, string> = {
              '#22d3ee': '#B8FFF9',
              '#a78bfa': '#E1C5FF',
              '#fbbf24': '#FFF9A6',
              '#34d399': '#B6FFDA'
            };
            HARP_STRINGS.forEach((str) => {
              const sx = (str.rect.x + str.rect.w / 2) * w;
              const isActive = frameHits.has(str.note);
              const vibrate = isActive ? Math.sin(Date.now() / 18) * 10 : 0;
              ctx.save();
              ctx.beginPath();
              ctx.moveTo(sx + vibrate, str.rect.y * h);
              ctx.lineTo(sx + vibrate, (str.rect.y + str.rect.h) * h);
              const neonColor = neonMap[str.color] || str.color;
              // Outer neon glow
              ctx.lineWidth = isActive ? 12 : 8;
              ctx.strokeStyle = neonColor;
              ctx.shadowBlur = isActive ? 36 : 24;
              ctx.shadowColor = neonColor;
              if (!isActive) {
                ctx.globalAlpha = 0.9;
              }
              ctx.stroke();
              // Bright core
              ctx.shadowBlur = 0;
              ctx.globalAlpha = 1;
              ctx.lineWidth = isActive ? 4 : 3;
              ctx.strokeStyle = '#ffffff';
              ctx.stroke();
              ctx.restore();
            });
          } else if (mode === AppMode.DRUM) {
            const drawDrumPads = () => {
              DRUM_PADS.forEach((pad) => {
                const px = pad.rect.x * w;
                const py = pad.rect.y * h;
                const pw = pad.rect.w * w;
                const ph = pad.rect.h * h;
                const isActive = frameHits.has(pad.note);
                ctx.save();
                ctx.beginPath();
                ctx.ellipse(px + pw / 2, py + ph / 2, pw / 2, ph / 2, 0, 0, Math.PI * 2);
                ctx.fillStyle = isActive ? 'rgba(248, 113, 113, 0.85)' : 'rgba(239, 68, 68, 0.55)';
                if (pad.note.includes('crash')) {
                  ctx.fillStyle = isActive ? 'rgba(252, 211, 77, 0.85)' : 'rgba(251, 191, 36, 0.55)';
                }
                ctx.shadowBlur = isActive ? 20 : 10;
                ctx.shadowColor = pad.color;
                ctx.fill();
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = isActive ? 8 : 6;
                ctx.stroke();
                ctx.restore();
              });
            };
            drawDrumPads();
          }

          if (!isCustomDraw && overlayImageRef.current && overlayReady) {
            const img = overlayImageRef.current;
            ctx.save();
            ctx.globalAlpha = 0.9;
            const scale = Math.min(w / img.width, h / img.height);
            const drawW = img.width * scale;
            const drawH = img.height * scale;
            const drawX = (w - drawW) / 2;
            const drawY = (h - drawH) / 2;
            ctx.drawImage(img, drawX, drawY, drawW, drawH);
            ctx.restore();
          }
          if (isCustomDraw) {
            drawCustomOverlay(ctx, w, h);
          }

          particlesRef.current = particlesRef.current.filter((p) => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.001;
            p.life -= 0.02;
            if (p.life > 0) {
              ctx.globalAlpha = p.life;
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
              ctx.fill();
              return true;
            }
            return false;
          });
          ctx.globalAlpha = 1;
        }
      }
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => cancelAnimationFrame(animationId);
  }, [landmarker, mode, spawnConfetti]);

  return (
    <div
      className="relative w-full h-full bg-black overflow-hidden flex flex-col items-center justify-center"
      onPointerDown={enableAudio}
      onClick={enableAudio}
    >
      <video ref={videoRef} className="absolute inset-0 w-full h-full object-cover -scale-x-100" playsInline muted autoPlay />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full object-cover -scale-x-100 z-10"
        onPointerDown={async (e) => {
          pointerDownRef.current = true;
          await enableAudio();
          handleTouchPlay(e.clientX, e.clientY);
        }}
        onPointerMove={(e) => {
          if (!pointerDownRef.current) return;
          if (!audioReadyRef.current) return;
          handleTouchPlay(e.clientX, e.clientY);
        }}
        onPointerUp={() => { pointerDownRef.current = false; }}
        onPointerLeave={() => { pointerDownRef.current = false; }}
      />

      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-[#1e3a8a]/80 backdrop-blur-xl">
          <div className="w-20 h-20 border-8 border-white border-t-transparent rounded-full animate-spin mb-8" />
          <p className="text-white font-black text-2xl uppercase tracking-[0.3em] animate-pulse">Summoning Magic...</p>
        </div>
      )}


      {overlayLoading && !isLoading && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-30 bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/40">
          <span className="text-white font-black uppercase tracking-widest text-xs">Shaping your instrument...</span>
        </div>
      )}

      <div className="absolute top-8 left-8 z-20">
        <div className="bg-white/20 backdrop-blur-md px-6 py-2 rounded-full border border-white/40">
          <span className="text-white font-black uppercase tracking-widest text-sm">
            Preset Mode: {mode}{presetName ? ` - ${presetName}` : ''}
          </span>
        </div>
      </div>

      {onSwitchPreset && (
        <div className="absolute top-8 right-8 z-20 flex items-center gap-3 bg-white/15 backdrop-blur-md px-4 py-3 rounded-full border border-white/30">
          {presetOptions.map((preset) => {
            const isActive = preset.mode === mode;
            return (
              <button
                key={preset.name}
                onClick={() => onSwitchPreset(preset.mode, preset.name)}
                className={`${preset.color} ${isActive ? 'scale-105 ring-4 ring-white/70' : 'opacity-80 hover:opacity-100'} w-11 h-11 rounded-full shadow-lg font-black text-lg transition-all flex items-center justify-center`}
                title={preset.name}
              >
                <span aria-hidden="true">{preset.emoji}</span>
              </button>
            );
          })}
        </div>
      )}

      <button
        onClick={handleFinish}
        className="absolute bottom-10 z-30 bg-[#FF6B6B] hover:bg-[#D64545] text-white px-20 py-6 rounded-full font-black text-2xl uppercase tracking-widest shadow-[0_12px_0_#D64545] transition-all active:translate-y-1 active:shadow-none"
      >
        Finish Session
      </button>
    </div>
  );
};

export default ExplorePresets;

