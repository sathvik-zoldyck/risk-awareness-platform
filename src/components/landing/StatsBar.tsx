import React from 'react';
import { RevealOnScroll } from './RevealOnScroll';

export function StatsBar() {
  const stats = [
    { value: '500+', label: 'Enterprises' },
    { value: '35K+', label: 'Protected Users' },
    { value: '99.2%', label: 'Compliance Rate' },
  ];

  return (
    <div className="w-full border-y border-border bg-card/30 backdrop-blur-sm py-12 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-border">
        {stats.map((stat, i) => (
          <RevealOnScroll key={stat.label} delay={i * 100} className="md:px-8">
            <p className="font-code text-4xl md:text-5xl font-medium text-[#E8EDF2] mb-2">
              {stat.value}
            </p>
            <p className="text-xs font-bold text-textSecondary uppercase tracking-widest">
              {stat.label}
            </p>
          </RevealOnScroll>
        ))}
      </div>
    </div>
  );
}
