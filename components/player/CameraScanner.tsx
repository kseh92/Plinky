
import React, { useRef, useState, useEffect } from 'react';
import { InstrumentBlueprint } from '../../services/types';

interface Props {
  onCapture: (base64: string) => void;
  isScanning: boolean;
  blueprint?: InstrumentBlueprint | null;
}

const CameraScanner: React.FC<Props> = ({ onCapture, isScanning, blueprint }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment', width: 1280, height: 720 } 
        });
        setStream(s);
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
      } catch (err) {
        console.error("Camera access denied", err);
      }
    };
    startCamera();
    return () => {
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL('image/jpeg');
      onCapture(dataUrl);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        onCapture(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative w-full rounded-[3rem] overflow-hidden shadow-2xl bg-black border-[12px] border-white">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-auto -scale-x-100"
        />
        <canvas ref={canvasRef} className="hidden" />
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileUpload} 
        />
        
        {/* Visual Guide Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
           <div className="w-[85%] h-[80%] border-4 border-dashed border-white/60 rounded-[2rem] relative">
              <div className="absolute top-0 left-0 right-0 p-4 bg-black/40 text-white font-black text-xs uppercase tracking-widest text-center rounded-t-[1.7rem]">
                Fill this area with your drawing
              </div>
           </div>
        </div>

        {blueprint?.shapes && (
          <div className="absolute inset-0 pointer-events-none">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {blueprint.shapes.map((shape) => {
                const interactive = shape.isInteractive !== false;
                const stroke = interactive ? 'rgba(34,197,94,0.9)' : 'rgba(255,255,255,0.45)';
                const dash = interactive ? '3,3' : '6,6';
                return (
                  <g key={shape.id}>
                    {shape.type === 'circle' ? (
                      <circle
                        cx={shape.x}
                        cy={shape.y}
                        r={shape.radius || 10}
                        fill="none"
                        stroke={stroke}
                        strokeWidth="0.6"
                        strokeDasharray={dash}
                      />
                    ) : (
                      <rect
                        x={shape.x - (shape.width || 10) / 2}
                        y={shape.y - (shape.height || 10) / 2}
                        width={shape.width || 10}
                        height={shape.height || 10}
                        fill="none"
                        stroke={stroke}
                        strokeWidth="0.6"
                        strokeDasharray={dash}
                      />
                    )}
                    {interactive && (
                      <text
                        x={shape.x}
                        y={shape.y}
                        fontSize="4"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        fill="rgba(34,197,94,0.9)"
                        className="font-bold"
                      >
                        {shape.label}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-4 md:gap-6">
        <button
          onClick={handleCapture}
          disabled={isScanning}
          className={`group px-8 md:px-12 py-4 md:py-5 rounded-full font-black text-white shadow-[0_10px_0_#991b1b] transition-all transform active:translate-y-2 active:shadow-none hover:-translate-y-1 uppercase tracking-widest text-lg md:text-xl flex items-center gap-4 ${
            isScanning ? 'bg-gray-500 cursor-not-allowed shadow-[0_10px_0_#374151]' : 'bg-red-500 hover:bg-red-400'
          }`}
        >
          {isScanning ? (
            <>
              <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ANALYZING...
            </>
          ) : (
            <>
              <span className="text-2xl md:text-3xl group-hover:scale-125 transition-transform">📸</span> 
              SNAP PHOTO
            </>
          )}
        </button>

        {!isScanning && (
          <button
            onClick={triggerUpload}
            className="group px-8 md:px-12 py-4 md:py-5 bg-sky-500 hover:bg-sky-400 rounded-full font-black text-white shadow-[0_10px_0_#0369a1] transition-all transform active:translate-y-2 active:shadow-none hover:-translate-y-1 uppercase tracking-widest text-lg md:text-xl flex items-center gap-4"
          >
            <span className="text-2xl md:text-3xl group-hover:animate-bounce">📁</span> 
            UPLOAD
          </button>
        )}
      </div>
    </div>
  );
};

export default CameraScanner;
