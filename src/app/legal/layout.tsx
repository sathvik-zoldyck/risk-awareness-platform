import React from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';

export default function LegalLayout({ children }: { readonly children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex flex-col font-body selection:bg-accent/30 selection:text-white">
      <Navbar />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-32 pt-40">
         {children}
      </main>
      <Footer />
    </div>
  );
}
