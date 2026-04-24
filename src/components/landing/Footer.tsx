import React from 'react';
import { Logo } from '@/components/common/Logo';

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="flex items-center gap-3">
            <Logo size={24} className="opacity-50 grayscale" />
            <span className="font-headline font-bold text-lg text-white">Alcyone<span className="text-textSecondary font-normal">Secure</span></span>
          </div>
          <p className="text-sm text-textSecondary max-w-sm leading-relaxed">
            Next-generation DPDP compliance and cybersecurity awareness training. Protect your human firewall with AI-driven insights.
          </p>
        </div>
        
        <div>
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Platform</h4>
          <ul className="space-y-3 text-sm text-textSecondary">
            <li><a href="/#features" className="hover:text-accent transition-colors">Features</a></li>
            <li><a href="/#platform" className="hover:text-accent transition-colors">How it Works</a></li>
            <li><a href="/login" className="hover:text-accent transition-colors">Access Portal</a></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-widest">Legal</h4>
          <ul className="space-y-3 text-sm text-textSecondary">
            <li><a href="/legal/privacy" className="hover:text-accent transition-colors">Privacy Policy</a></li>
            <li><a href="/legal/terms" className="hover:text-accent transition-colors">Terms of Service</a></li>
            <li><a href="/legal/dpdp" className="hover:text-accent transition-colors">DPDP Framework</a></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-xs text-textSecondary uppercase tracking-widest">
          © {new Date().getFullYear()} Alcyone Secure Systems. All rights reserved.
        </p>
        <p className="text-xs text-textSecondary">
          Protected via AES-256 Encryption
        </p>
      </div>
    </footer>
  );
}
