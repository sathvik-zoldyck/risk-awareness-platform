"use client";

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface ScoreRingProps {
  percent: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  className?: string;
}

const getScoreColor = (p: number) => {
  if (p >= 85) return '#22C55E';
  if (p >= 70) return '#00D4FF';
  if (p >= 55) return '#F59E0B';
  return '#EF4444';
};

export function ScoreRing({ percent, size = 120, strokeWidth = 10, label, className }: ScoreRingProps) {
  const [displayed, setDisplayed] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;
  const color = getScoreColor(percent);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayed(percent), 150);
    return () => clearTimeout(timer);
  }, [percent]);

  return (
    <div className={cn('relative flex items-center justify-center', className)} style={{ width: size, height: size }}>
      {/* Outer decorative ring */}
      <div className="absolute rounded-full" style={{ width: size + 8, height: size + 8, border: '1px solid rgba(255,255,255,0.025)' }} />
      
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ 
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)',
            filter: `drop-shadow(0 0 6px ${color}40)`
          }}
        />
      </svg>

      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontFamily: "'DM Mono', monospace", fontSize: size * 0.22, fontWeight: 700, color }}>
          {displayed}%
        </span>
        {label && (
          <span
            style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginTop: 2 }}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}