import React from 'react';
import Image from 'next/image';
import owlLogo from '@/assets/owl.png';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 32, className = '' }: LogoProps) {
  return (
    <Image 
      src={owlLogo} 
      alt="Alcyone Secure Logo" 
      width={size} 
      height={size} 
      className={`object-contain ${className}`}
    />
  );
}
