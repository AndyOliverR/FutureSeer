'use client';

import { useMemo } from 'react';

interface TemperamentGaugeProps {
  label: string;
  value: number;
  maxValue?: number;
  description?: string;
}

export function TemperamentGauge({ label, value, maxValue = 100, description }: TemperamentGaugeProps) {
  const normalizedValue = Math.min(Math.max(value, 0), maxValue);
  const percentage = (normalizedValue / maxValue) * 100;

  const { color, bgColor } = useMemo(() => {
    if (percentage <= 30) return { color: '#10b981', bgColor: 'text-emerald-400' };
    if (percentage <= 60) return { color: '#f59e0b', bgColor: 'text-amber-400' };
    return { color: '#ef4444', bgColor: 'text-red-400' };
  }, [percentage]);

  const radius = 55;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const arcLength = (percentage / 100) * circumference;

  const centerX = 75;
  const centerY = 70;

  const needleAngle = -180 + (percentage / 100) * 180;
  const needleLength = radius - 12;
  const needleRad = (needleAngle * Math.PI) / 180;
  const needleX = centerX + needleLength * Math.cos(needleRad);
  const needleY = centerY + needleLength * Math.sin(needleRad);

  return (
    <div className="flex flex-col items-center w-[150px]">
      <svg viewBox="0 0 150 90" className="w-full h-auto">
        {/* Background arc */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke="#334155"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${circumference}`}
          className="transition-all duration-700 ease-out"
        />
        {/* Needle */}
        <line
          x1={centerX}
          y1={centerY}
          x2={needleX}
          y2={needleY}
          stroke="#e2e8f0"
          strokeWidth={2}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
        <circle cx={centerX} cy={centerY} r={4} fill="#e2e8f0" />
        {/* Value text */}
        <text
          x={centerX}
          y={centerY - 12}
          textAnchor="middle"
          className={`text-lg font-bold fill-current ${bgColor}`}
          style={{ fontSize: '20px' }}
        >
          {normalizedValue}
        </text>
      </svg>
      <p className="text-xs font-medium text-slate-300 text-center mt-1">{label}</p>
      {description && (
        <p className="text-[10px] text-slate-500 text-center mt-0.5 leading-tight">{description}</p>
      )}
    </div>
  );
}
