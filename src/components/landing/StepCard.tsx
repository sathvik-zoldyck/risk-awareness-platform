import React from 'react';
import { cn } from '@/lib/utils';

interface StepCardProps {
  number: string;
  title: string;
  description: string;
}

export function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="relative group p-8 bg-card/30 border border-border rounded-2xl transition-all duration-500 hover:bg-card/80 hover:border-[#00D4FF]/30 hover:shadow-lg hover:shadow-[#00D4FF]/5 h-full flex flex-col justify-between">
      <div className="absolute -top-5 left-8 text-6xl font-black text-white/5 group-hover:text-[#00D4FF]/10 transition-colors pointer-events-none select-none z-0">
        {number}
      </div>
      <div className="relative z-10 mt-4 space-y-2">
        <h3 className="font-headline text-lg font-bold text-textPrimary">{title}</h3>
        <p className="text-sm text-textSecondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
