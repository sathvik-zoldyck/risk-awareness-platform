"use client";

import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: number;
  className?: string;
}

export function StatCard({ label, value, icon, trend, className }: StatCardProps) {
  const isPositive = trend !== undefined && trend > 0;
  const isNegative = trend !== undefined && trend < 0;

  return (
    <Card 
      className={cn('rounded-2xl p-5 transition-all duration-300 group', className)}
      style={{ 
        background: 'rgba(255,255,255,0.025)', 
        border: '1px solid rgba(255,255,255,0.06)' 
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(0,212,255,0.12)';
        e.currentTarget.style.background = 'rgba(0,212,255,0.03)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
        e.currentTarget.style.background = 'rgba(255,255,255,0.025)';
      }}
    >
      <div className="flex items-start justify-between mb-4">
        <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
          {label}
        </p>
        {icon && (
          <div className="w-8 h-8 rounded-lg bg-white/4 flex items-center justify-center transition-colors group-hover:bg-white/8">
            {icon}
          </div>
        )}
      </div>
      
      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 500, color: '#E8EDF2' }}>
        {value}
      </p>

      {trend !== undefined && (
        <div className={cn(
          'flex items-center gap-1 mt-2 text-[10px] font-bold uppercase tracking-wide',
          isPositive ? 'text-[#4ADE80]' : isNegative ? 'text-[#F87171]' : 'text-white/30'
        )}>
          {isPositive ? <TrendingUp className="w-3 h-3" /> : isNegative ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
          {trend === 0 ? 'No change' : `${Math.abs(trend)}% vs last period`}
        </div>
      )}
    </Card>
  );
}