"use client";

import React from 'react';
import { Shield } from 'lucide-react';
import { cn } from '@/lib/utils';

const LEVELS: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: 'Basic',      color: '#F87171', bg: 'rgba(248,113,113,0.1)',    border: 'rgba(248,113,113,0.25)'  },
  2: { label: 'Aware',      color: '#FBC22D', bg: 'rgba(251,194,45,0.1)',   border: 'rgba(251,194,45,0.25)' },
  3: { label: 'Secure',     color: '#00D4FF', bg: 'rgba(0,212,255,0.1)',    border: 'rgba(0,212,255,0.25)'  },
  4: { label: 'Advanced',   color: '#9B87FF', bg: 'rgba(155,135,255,0.1)',   border: 'rgba(155,135,255,0.25)' },
  5: { label: 'Enterprise', color: '#4ADE80', bg: 'rgba(74,222,128,0.1)',    border: 'rgba(74,222,128,0.25)'  },
};

interface MaturityBadgeProps {
  level: 1 | 2 | 3 | 4 | 5;
  className?: string;
}

export function MaturityBadge({ level, className }: MaturityBadgeProps) {
  const config = LEVELS[level] ?? LEVELS[1];

  return (
    <div
      className={cn('flex items-center gap-2.5 px-4 py-2.5 rounded-xl border transition-all', className)}
      style={{ 
        background: config.bg, 
        borderColor: config.border,
        boxShadow: `0 0 16px ${config.color}15`
      }}
    >
      <Shield className="w-4 h-4" style={{ color: config.color }} />
      <div className="text-right">
        <p style={{ fontSize: 9, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>MATURITY INDEX</p>
        <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 14, color: config.color, lineHeight: 1.1 }}>
          {config.label}
        </p>
      </div>
    </div>
  );
}