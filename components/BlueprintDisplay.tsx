
import React from 'react';
import { InstrumentBlueprint } from '../types';

interface Props {
  blueprint: InstrumentBlueprint;
}

const BlueprintDisplay: React.FC<Props> = ({ blueprint }) => {
  return (
    <div className="bg-white p-6 rounded-3xl shadow-xl border-4 border-dashed border-gray-300 w-full max-w-md mx-auto">
      <h3 className="text-xl font-bold text-center mb-2 text-gray-800">{blueprint.instrument} Blueprint</h3>
      <p className="text-sm text-gray-600 mb-6 text-center italic">"{blueprint.description}"</p>
      
      <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {blueprint.shapes?.map((shape) => (
            <g key={shape.id}>
              {shape.type === 'circle' ? (
                <circle
                  cx={shape.x}
                  cy={shape.y}
                  r={shape.radius || 10}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
              ) : (
                <rect
                  x={shape.x - (shape.width || 10) / 2}
                  y={shape.y - (shape.height || 10) / 2}
                  width={shape.width || 10}
                  height={shape.height || 10}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="0.5"
                  strokeDasharray="2,2"
                />
              )}
              <text
                x={shape.x}
                y={shape.y}
                fontSize="4"
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="#3b82f6"
                className="font-bold pointer-events-none select-none"
              >
                {shape.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      
      <div className="mt-6 text-center text-sm text-gray-500 font-medium">
        Draw these parts on your paper, then scan it!
      </div>
    </div>
  );
};

export default BlueprintDisplay;
