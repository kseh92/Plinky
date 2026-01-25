
import React, { useRef, useState, useEffect } from 'react';

interface Props {
  onCapture: (base64: string) => void;
  isScanning: boolean;
}

const CameraScanner: React.FC<Props> = ({ onCapture, isScanning }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

  return (
    <div className="relative w-full max-w-2xl mx-auto rounded-3xl overflow-hidden shadow-2xl bg-black border-8 border-white">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-auto"
      />
      <canvas ref={canvasRef} className="hidden" />
      
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
         <div className="w-4/5 h-4/5 border-4 border-dashed border-white opacity-40 rounded-xl" />
      </div>

      <div className="absolute bottom-6 left-0 right-0 flex justify-center">
        <button
          onClick={handleCapture}
          disabled={isScanning}
          className={`px-8 py-4 rounded-full font-bold text-white shadow-lg transition-transform active:scale-95 ${
            isScanning ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-500 hover:bg-red-600'
          }`}
        >
          {isScanning ? 'Scanning Drawing...' : '📸 SNAP PHOTO'}
        </button>
      </div>
    </div>
  );
};

export default CameraScanner;
