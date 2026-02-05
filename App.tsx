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

// --- Decorative Doodle Components ---

const ScribbleDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="144" height="222" viewBox="0 0 144 222" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M128.359 31.8455C67.7629 92.9191 29.1767 130.036 15.1443 142.563C8.16068 148.797 2.74953 157.351 1.43438 161.43C-3.76225 177.545 38.9288 158.654 62.1053 162.064C79.7131 164.655 104.24 168.935 128.26 166.091C135.689 165.211 145.531 165.508 142.404 157.591C139.278 149.674 122.9 133.84 105.046 118.332C68.8889 86.9248 46.4971 71.8415 41.9561 68.9969C39.747 67.613 38.234 65.0213 38.2091 72.9039C38.1271 98.9776 41.5094 150.326 42.3283 201.717C42.625 220.34 44.7849 223.703 48.9041 219.23C61.6731 205.366 74.5124 161.224 88.5573 108.77C103.52 38.7685 109.327 21.598 111.386 14.7607C112.627 11.3163 114.265 7.92329 115.952 1.00024" stroke="#131313" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const WaveDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="688" height="171" viewBox="0 0 688 171" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M899.001 47.8983C781.054 54.0966 663.108 60.2948 600.136 59.0605C537.165 57.8263 532.742 48.9716 525.671 30.2426C518.601 11.5136 509.018 -16.8214 499.29 -40.2729C481.748 -82.5611 466.419 -103.222 458.992 -109.474C452.185 -115.203 427.863 -111.352 390.335 -96.2319C371.614 -88.6895 357.967 -68.7153 345.58 -52.9647C333.193 -37.2141 323.61 -23.0466 314.619 -6.00799C305.628 11.0306 297.519 30.5109 290.025 52.5C274.59 97.786 264.637 133.655 256.461 151.525C253.04 159.003 249.76 162.312 247.135 164.579C242.668 168.438 217.168 169.529 171.855 169.986C149.392 170.212 128.016 167.785 107.052 162.003C86.0871 156.221 66.1837 144.48 51.1388 135.707C36.094 124.934 26.5108 113.423 19.3626 98.6383C12.2143 83.8537 7.79133 66.1443 1.00049 42.5318" stroke="#020A20" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const GreenPlantDoodle: React.FC<{ className?: string; style?: React.CSSProperties }> = ({ className, style }) => (
  <svg width="88" height="73" viewBox="0 0 88 73" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M31.2481 42.2816C29.4847 43.1562 25.2118 45.5407 20.0969 50.3178C16.8186 53.3797 14.5106 59.2482 12.9029 62.3439C11.2952 65.4397 11.5784 65.6973 11.9819 65.9845C12.8532 66.6048 13.7149 67.1572 15.0725 67.7541C20.0542 69.9444 30.9668 67.2907 37.4488 66.4573C38.7245 66.2933 40.1764 65.8931 41.2707 65.3485C45.6067 63.1904 47.7886 59.9319 50.6859 56.8373C52.5178 54.8807 52.5966 53.3287 52.8832 51.8189C53.3154 49.5425 52.6878 46.5713 52.4645 42.9927C52.2914 40.2185 56.3293 38.0522 56.4841 36.4129C56.7214 33.9008 55.188 30.7199 54.5619 29.5491C53.8989 28.3092 52.0129 27.7528 51.2225 27.2321C50.5492 26.7885 48.3977 27.4313 46.5483 27.9994C43.5221 28.9289 41.7165 30.8504 38.9605 32.693C36.7534 34.1687 34.5386 35.8297 32.7904 37.3147C32.4089 38.0137 32.1705 38.8476 31.9473 39.7291C31.8285 40.1476 31.6985 40.5077 31.5646 40.8786" stroke="#327919" strokeWidth="2" strokeLinecap="round"/>
    <path d="M48.9654 25.3037C52.196 21.4229 54.4603 17.987 55.3571 16.7133C56.3982 15.2345 57.6166 13.7803 59.4084 11.6272C60.0906 10.8074 60.9402 10.1942 61.4506 9.5726C63.0095 7.67369 59.4445 5.93309 59.9357 4.81953C60.5752 3.37004 63.955 2.71147 65.2944 2.32452C66.8642 1.87105 68.7496 1.51863 70.6756 1.70134C73.3789 1.9578 74.4597 3.07862 75.5308 4.24826C77.1903 6.06056 69.626 7.59561 67.4699 8.78944C65.4046 9.93305 62.0883 13.7503 58.4197 16.9368C56.0709 18.9771 55.0571 21.2494 54.2921 22.6527C54.1601 23.0182 54.0302 23.3783 53.8077 23.8209C53.5852 24.2635 53.2742 24.7777 52.4051 25.7748" stroke="#327919" strokeWidth="2" strokeLinecap="round"/>
    <path d="M33.8158 47.2735C31.8914 48.4098 29.385 50.7899 26.9915 53.2098C26.1636 54.0468 25.953 54.8498 25.5069 55.7303C24.9774 56.7755 26.1719 57.5536 27.3009 58.0997C28.4 58.6312 30.2314 58.755 31.8317 58.9639C33.0441 59.1222 34.9176 58.9201 37.4836 58.1196C39.6277 57.4507 40.8499 56.0179 41.9866 54.8005C43.915 52.7352 42.536 51.1892 42.2451 49.5479C42.1203 48.8439 41.1927 48.4266 40.4282 48.0103C39.9469 47.8516 39.2761 47.7995 37.8975 48.0289C36.519 48.2584 34.4531 48.7709 32.2472 48.9871" stroke="#327919" strokeWidth="2" strokeLinecap="round"/>
    <path d="M31.6073 54.4436C31.4277 53.72 31.3781 51.7522 31.3317 50.2125C31.2907 48.8496 32.6882 47.2287 33.9862 44.867C35.4592 42.1872 36.5937 40.6309 38.3444 37.4417C39.7317 34.9144 42.0041 32.1167 43.5131 30.5785C45.0796 28.9817 46.6834 26.8699 48.1545 25.1788C48.7867 23.6958 49.3872 22.5535 50.0782 21.7762C50.4326 21.4101 50.7947 21.1017 51.0904 20.4721" stroke="#327919" strokeWidth="2" strokeLinecap="round"/>
    <path d="M35.1313 52.576C35.7069 51.3339 37.994 46.3825 40.4299 42.7138C41.4699 41.1473 42.0924 39.5978 43.4025 37.7265C44.4625 36.2123 45.5753 33.118 47.2669 30.0925C47.5726 29.5167 47.6771 29.0537 48.2496 27.8124C48.8222 26.571 49.8597 24.5653 51.4773 22.0317" stroke="#327919" strokeWidth="2" strokeLinecap="round"/>
    <path d="M38.4936 52.7352C39.354 51.7569 41.6451 46.7946 43.3739 42.9817C45.2913 38.7531 47.7074 37.2115 48.5211 35.1339C49.1165 33.6135 49.4391 31.7092 50.6966 29.6258C51.6709 28.1689 51.5935 26.9729 52.062 26.1961C52.4005 25.7793 52.9437 25.3168 53.4259 24.5283" stroke="#327919" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

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
    <path d="M3.34863 15.5268C3.34863 15.0601 4.87335 13.6529 7.79341 11.7685C11.8636 9.14179 17.1912 10.1103 21.5066 9.63652C25.3297 9.21681 30.4239 6.34844 37.8211 2.57598C40.1234 1.40183 44.2849 1.38449 49.2102 1.61783C51.1071 1.7077 51.696 2.31788 52.1626 2.90832C54.8451 6.30239 58.7374 12.9105 62.332 17.7471C65.9142 22.5671 60.3453 27.5336 57.878 30.0121C52.6067 35.3072 52.3243 44.264 51.4049 48.8602C50.2539 54.6139 50.1713 58.6538 50.1666 60.0645C50.1491 65.4191 62.7941 66.6654 62.6462 68.4296C62.309 72.4535 53.5811 71.8556 44.6592 73.2699C42.483 73.5103 40.9583 73.5103 39.7154 73.6269C38.4725 73.7436 37.5577 73.977 36.6151 74.2174" stroke="#9D9EFF" strokeWidth="3" strokeLinecap="round"/>
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
          Plinky was born from a simple dream: <span className="text-[#FF6B6B]">to turn the drawings on our fridges into real, playable magic.</span>
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

const App: React.FC = () => {
  const [step, setStep] = React.useState<'landing' | 'pick' | 'provide' | 'scan' | 'play' | 'result' | 'blueprint' | 'story' | 'gallery' | 'settings' | 'yourJam' | 'explore'>('landing');
  const [selectedType, setSelectedType] = React.useState<InstrumentType | null>(null);
  const [blueprint, setBlueprint] = React.useState<InstrumentBlueprint | null>(null);
  const [hitZones, setHitZones] = React.useState<HitZone[]>([]);
  const [recording, setRecording] = React.useState<Blob | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sessionStats, setSessionStats] = React.useState<SessionStats | null>(null);

  // Toggle orientation classes on the body based on the current step
  useEffect(() => {
    // Only screens that use the camera should enforce landscape mode
    if (step === 'scan' || step === 'play') {
      document.body.classList.add('needs-landscape');
    } else {
      document.body.classList.remove('needs-landscape');
    }
    // Cleanup on unmount
    return () => {
      document.body.classList.remove('needs-landscape');
    };
  }, [step]);

  const handlePick = (type: InstrumentType) => {
    setSelectedType(type);
    setStep('provide');
  };

  const handleCreateCustom = (name: string) => {
    setSelectedType(name);
    setStep('provide');
  };

  const handleShowBlueprint = async () => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const bp = await generateBlueprint(selectedType);
      setBlueprint(bp);
      setStep('blueprint');
    } catch (err) {
      setError("Gemini is composing... try again!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickStart = () => {
    if (!selectedType) return;
    // For custom instruments, PRESET_ZONES might be empty, so we default to a generic set if needed or require scanning
    const zones = PRESET_ZONES[selectedType] || PRESET_ZONES['Piano']; 
    setHitZones(zones);
    setStep('play');
  };

  const handleCapture = async (base64: string) => {
    if (!selectedType) return;
    setIsLoading(true);
    setError(null);
    try {
      const zones = await scanDrawing(selectedType, base64);
      setHitZones(zones);
      setStep('play');
    } catch (err) {
      setError("Make sure your drawing is clear!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFinishedPlaying = (blob: Blob | null, stats: { noteCount: number; uniqueNotes: Set<string>; duration: number; eventLog: PerformanceEvent[] }) => {
    if (selectedType) {
      setSessionStats({
        instrument: selectedType,
        durationSeconds: Math.round(stats.duration),
        noteCount: stats.noteCount,
        uniqueNotesCount: stats.uniqueNotes.size,
        intensity: stats.noteCount / (stats.duration || 1),
        eventLog: stats.eventLog
      });
    }
    setRecording(blob);
    setStep('result');
  };

  const goHome = () => {
    setStep('landing');
    setSelectedType(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center overflow-x-hidden relative text-center">
      <BackgroundElements />
      <GlobalHeader 
        onHome={goHome} 
        onStory={() => setStep('story')} 
        onGallery={() => { setStep('gallery'); }}
        onYourJam={() => setStep('yourJam')}
        onSettings={() => setStep('settings')}
        currentStep={step} 
      />
      
      {/* Persistent Decorative Elements */}
      {(step === 'landing' || step === 'pick' || step === 'result' || step === 'story' || step === 'gallery' || step === 'settings' || step === 'yourJam' || step === 'explore') && (
        <div className="absolute inset-0 pointer-events-none z-30">
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
          <ShakyStar className="absolute right-[20%] top-[40%] opacity-40 rotate-45 animate-float" style={{ animationDuration: '10s' }} />
          <MessySun className="absolute left-[5%] bottom-[5%] opacity-40 rotate-180 animate-pulse" style={{ animationDuration: '5s' }} />
          <ShakyHeart className="absolute right-[25%] bottom-[30%] opacity-50 -rotate-12 animate-orbit" style={{ animationDuration: '25s' }} />
          <CrayonSpiral className="absolute left-[30%] top-[10%] opacity-30 animate-drift" />
        </div>
      )}

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
        
        {step === 'result' && (
          <div className="w-full flex flex-col items-center pb-24 relative">
             <div className="w-full max-w-[1200px] h-[280px] overflow-hidden pointer-events-none z-0 -mb-16 scale-110 origin-bottom">
               <RedMonster className="w-full h-full" />
             </div>
             <div className="relative z-10 w-full flex justify-center">
               <ResultScreen recording={recording} onRestart={() => setStep('pick')} stats={sessionStats} />
             </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-[#1e3a8a]/70 backdrop-blur-2xl z-[100] flex flex-col items-center justify-center">
          <div className="w-32 h-32 border-[12px] border-white border-t-transparent rounded-full animate-spin mb-8" />
          <p className="text-white font-black animate-pulse text-4xl uppercase tracking-[0.3em]">Magical things are happening...</p>
        </div>
      )}
    </div>
  );
};

export default App;
