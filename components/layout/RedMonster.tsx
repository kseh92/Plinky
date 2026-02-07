// --- Red Monster (Hand-drawn "Doodle" features) ---
import React from 'react';

export const RedMonster: React.FC<{ className?: string }> = ({ className }) => (
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