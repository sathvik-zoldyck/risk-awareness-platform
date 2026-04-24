import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  delay?: number;
}

export function FeatureCard({ title, description, icon: Icon, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className={cn(
        "group relative p-8 rounded-2xl transition-all duration-500",
        "bg-card/50 border border-border backdrop-blur-md",
        "hover:-translate-y-2 hover:bg-card hover:border-[#00D4FF]/30",
        "hover:shadow-[0_0_40px_-10px_rgba(0,212,255,0.15)]"
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
      
      <div className="relative z-10 space-y-4">
        <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#00D4FF]/10 border border-[#00D4FF]/20 text-[#00D4FF] group-hover:scale-110 transition-transform duration-500">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="font-headline text-xl font-bold text-textPrimary">{title}</h3>
        <p className="text-sm text-textSecondary leading-relaxed">{description}</p>
      </div>
    </div>
  );
}
