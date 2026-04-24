"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, BrainCircuit, Info, MessageSquare, ArrowRight, Play } from 'lucide-react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card } from '@/components/ui/card';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc } from 'firebase/firestore';

const MODULES = [
  { 
    id: 'basic', 
    title: 'Basic Cybersecurity', 
    desc: 'Passwords, phishing, malware, and device security fundamentals.',
    icon: Shield,
    color: '#22C55E' 
  },
  { 
    id: 'role_based', 
    title: 'Role-Based Security', 
    desc: 'Deep security nuances tailored perfectly for your specific job role.',
    icon: BrainCircuit,
    color: '#00D4FF',
    tailored: true
  },
  { 
    id: 'dpdp', 
    title: 'DPDP Compliance', 
    desc: "India's Digital Personal Data Protection Act 2023 regulations.",
    icon: Info,
    color: '#7B61FF' 
  },
  { 
    id: 'scenario', 
    title: 'Scenario-Based', 
    desc: 'Real-world incident simulation and threat response decisions.',
    icon: MessageSquare,
    color: '#F59E0B' 
  },
];

export default function AssessmentSelectorPage() {
  const { user } = useUser();
  const firestore = useFirestore();
  const userDocRef = useMemoFirebase(() => {
    return user ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  const roleName = userDoc?.jobRole || 'Employee';

  return (
    <div className="flex min-h-screen bg-[#080A0F] bg-grid">
      <SidebarNav role="employee" />

      <main className="flex-1 overflow-auto p-6 pb-24 lg:pb-6 relative">
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-[#080A0F]/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5 mb-8">
          <p className="section-label">Employee Portal • Assessment Engine</p>
        </div>

        <div className="animate-fade-up">
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 32, color: '#E8EDF2', letterSpacing: '-0.02em' }}>Available Assessments</h1>
          <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>Click any card to begin your testing modules • 0/4 complete</p>
        </div>

        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-4 gap-5 animate-fade-up delay-1">
          {MODULES.map((mod) => (
            <Card key={mod.id} className="relative group overflow-hidden flex flex-col justify-between"
              style={{
                background: 'rgba(255,255,255,0.02)', 
                border: '1px solid rgba(255,255,255,0.05)',
                minHeight: 280,
                padding: '24px'
              }}>
              
              {/* Background Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-700 pointer-events-none" 
                   style={{ background: mod.color }} />
              
              <div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-6"
                  style={{ background: `${mod.color}15`, border: `1px solid ${mod.color}30` }}>
                  <mod.icon className="w-6 h-6" style={{ color: mod.color }} />
                </div>
                
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18, color: '#E8EDF2', marginBottom: 8 }}>
                  {mod.title}
                </h3>
                <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
                  {mod.desc}
                </p>

                {mod.tailored && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                    style={{ background: `${mod.color}10`, color: mod.color, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    <BrainCircuit className="w-3 h-3" /> Tailored for {roleName}
                  </div>
                )}
              </div>

              <div className="mt-8 pt-4 border-t border-white/5">
                <Link href={`/employee/assessment/take?type=${mod.id}`} className="block">
                  <button className="w-full flex items-center justify-between px-4 py-3 rounded-xl font-bold uppercase transition-all"
                    style={{ background: `${mod.color}15`, color: mod.color, fontSize: 12, letterSpacing: '0.05em' }}>
                    Start Module <ArrowRight className="w-4 h-4 opacity-50" />
                  </button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}