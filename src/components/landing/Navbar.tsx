import React from 'react';
import Link from 'next/link';
import { Logo } from '@/components/common/Logo';

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 border-b border-border bg-bg/60 backdrop-blur-xl">
      <div className="w-full px-6 h-20 flex items-center justify-between">
        
        {/* Left Side: Logo + Nav Links */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 mr-4">
            <Logo size={42} />
            <span className="text-lg font-semibold text-white">Alcyone Secure</span>
          </Link>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/40">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#platform" className="hover:text-white transition-colors">Platform</Link>
          </div>
        </div>
        
        {/* Right Side: Auth Buttons */}
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-bold text-white/40 hover:text-[#E8EDF2] transition-colors uppercase tracking-wider hidden sm:block">
            Login
          </Link>
          <Link href="/signup" className="h-10 px-6 bg-[#00D4FF] text-[#080A0F] rounded-xl font-semibold text-sm flex items-center justify-center hover:shadow-[0_0_16px_rgba(0,212,255,0.25)] transition-all">
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}
