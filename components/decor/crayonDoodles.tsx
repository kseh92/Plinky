import React from 'react';

export const MessySun: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <circle cx="50" cy="50" r="20" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 4" />
    <path d="M50 10V25M50 75V90M10 50H25M75 50H90M22 22L32 32M68 68L78 78M22 78L32 68M68 32L78 22" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const ShakyStar: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M30 5L36 22H55L40 33L46 52L30 40L14 52L20 33L5 22H24L30 5Z" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const CrayonSpiral: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M40 40C40 40 45 35 45 30C45 25 40 20 35 20C30 20 25 25 25 32C25 40 32 48 42 48C55 48 65 35 65 25C65 12 50 5 35 5C15 5 5 20 5 40C5 65 25 75 45 75C70 75 80 55 80 35" stroke="#A5B4FC" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const ShakyHeart: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M25 45C25 45 5 35 5 20C5 10 15 5 25 15C35 5 45 10 45 20C45 35 25 45 25 45Z" stroke="#FB923C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
