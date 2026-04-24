import React from 'react';
import { cn } from '@/lib/utils';

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function AuthCard({ children, className, ...props }: AuthCardProps) {
  return (
    <div
      className={cn(
        "relative w-full max-w-md mx-auto p-10 rounded-[28px] overflow-hidden transition-all duration-500",
        "bg-card border border-border backdrop-blur-xl transition-all duration-300 hover:border-[#00D4FF]/30 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)]",
        "hover:shadow-[0_0_40px_-10px_rgba(82,167,255,0.15)] hover:-translate-y-1",
        className
      )}
      {...props}
    >
      {/* Top highlight line */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent to-transparent opacity-30" />
      
      {/* Decorative ambient blobs */}
      <div className="absolute -top-32 -right-32 w-64 h-64 bg-accent/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-accent/5 rounded-full blur-[80px] pointer-events-none" />
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
