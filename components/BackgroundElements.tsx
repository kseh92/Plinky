import React from 'react';

const BackgroundElements: React.FC = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-animate">
    <div className="absolute inset-0 dot-grid opacity-20" />

    <div className="absolute top-[-10%] left-[-15%] w-[80vw] h-[80vw] bg-white/30 rounded-full blur-[140px] animate-float opacity-40" />
    <div className="absolute bottom-[-15%] right-[-10%] w-[90vw] h-[90vw] bg-yellow-200/20 rounded-full blur-[160px] animate-float opacity-30" style={{ animationDelay: '-6s' }} />
    <div className="absolute top-1/4 right-[-20%] w-[60vw] h-[60vw] bg-pink-200/20 rounded-full blur-[120px] animate-pulse opacity-40" />
    <div className="absolute bottom-1/4 left-[-10%] w-[50vw] h-[50vw] bg-blue-200/20 rounded-full blur-[100px] animate-orbit opacity-30" />

    {[...Array(8)].map((_, i) => (
      <div
        key={`note-${i}`}
        className="absolute text-white/20 select-none pointer-events-none animate-float"
        style={{
          fontSize: Math.random() * 40 + 40 + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animationDuration: Math.random() * 15 + 10 + 's',
          animationDelay: Math.random() * -10 + 's',
          transform: `rotate(${Math.random() * 360}deg)`
        }}
      >
        {['♪', '♫', '♬', '♩'][i % 4]}
      </div>
    ))}

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
          animationDuration: Math.random() * 12 + 8 + 's',
          animationDelay: Math.random() * -15 + 's',
          filter: 'blur(1px)'
        }}
      />
    ))}
  </div>
);

export default BackgroundElements;
