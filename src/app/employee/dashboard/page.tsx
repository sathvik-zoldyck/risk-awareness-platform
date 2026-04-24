"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Shield, BrainCircuit, Trophy,
  Play, Info, Zap, Settings, LogOut, Key, Edit, Loader2
} from 'lucide-react';
import { getAuth, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { StatCard } from '@/components/dashboard/stat-card';
import { ScoreRing } from '@/components/ui/score-ring';
import { MaturityBadge } from '@/components/ui/maturity-badge';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DPDPBot } from '@/components/chat/dpdp-chat';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, collection, query, where } from 'firebase/firestore';
import { generatePersonalRecommendations } from '@/ai/flows/generate-personal-recommendations';

const MODULE_META: Record<string, { label: string; icon: any; color: string }> = {
  basic:      { label: 'Basic Awareness',  icon: Shield,      color: '#22C55E' },
  role_based: { label: 'Secure Coding',    icon: BrainCircuit, color: '#00D4FF' },
  dpdp:       { label: 'DPDP Readiness',   icon: Info,        color: '#F59E0B' },
  scenario:   { label: 'Risk Decisions',   icon: Zap,         color: '#7B61FF' },
};

const BADGE_DEFS = [
  { name: 'Phishing Expert', icon: '🛡', target: 'basic'  },
  { name: 'Password Master', icon: '🔐', target: 'role_based'  },
  { name: 'DPDP Aware',      icon: '📋', target: 'dpdp'  },
  { name: 'Risk Thinker',    icon: '⚠️', target: 'scenario'  },
];

export default function EmployeeDashboard() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [profileOpen, setProfileOpen] = useState(false);
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  // Firestore Docs
  const userDocRef = useMemoFirebase(() => {
    return user ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  const companyDocRef = useMemoFirebase(() => {
    return userDoc?.companyId ? doc(firestore, 'companies', userDoc.companyId) : null;
  }, [userDoc?.companyId, firestore]);
  const { data: companyDoc } = useDoc(companyDocRef);

  const attemptsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'assessment_attempts'), where('userId', '==', user.uid));
  }, [user, firestore]);
  const { data: attemptsRaw } = useCollection(attemptsQuery);

  const attempts = useMemo(() => attemptsRaw || [], [attemptsRaw]);

  // Derived Analytics
  const analytics = useMemo(() => {
     let totalScore = 0;
     let totalCorrect = 0;
     let totalQ = 0;
     let totalTime = 0;
     
     const moduleBest: Record<string, number> = {};
     
     attempts.forEach((a: any) => {
        totalScore += a.score;
        totalCorrect += a.correctCount || 0;
        totalQ += a.totalQuestions || 0;
        totalTime += a.durationSeconds || 0;
        
        if (!moduleBest[a.moduleType] || a.score > moduleBest[a.moduleType]) {
           moduleBest[a.moduleType] = a.score;
        }
     });

     const len = attempts.length;
     return {
        hasAttempts: len > 0,
        avgScore: len > 0 ? Math.round(totalScore / len) : 0,
        accuracy: totalQ > 0 ? Math.round((totalCorrect / totalQ) * 100) : 0,
        avgTime: len > 0 ? Math.round(totalTime / len) : 0,
        moduleBest
     };
  }, [attempts]);

  // AI recommendations hook
  useEffect(() => {
    if (attempts.length === 0) return;
    const latest = attempts.sort((a: any, b: any) => b.completedAt?.seconds - a.completedAt?.seconds)[0] as any;
    
    setAiLoading(true);
    const scorePayload = {
      moduleType: latest.moduleType,
      score: latest.score,
      correctCount: latest.correctCount,
      totalQuestions: latest.totalQuestions,
      wrongQuestions: latest.responses?.filter((r: any) => !r.isCorrect).map((r: any) => r.questionText) || []
    };

    generatePersonalRecommendations({ scores: scorePayload })
      .then(res => setAiRecs(res.recommendations ?? []))
      .catch(() => setAiRecs([]))
      .finally(() => setAiLoading(false));
  }, [attempts]);

  const userName = userDoc?.name ? userDoc.name.split(' ')[0] : 'User';
  const roleName = userDoc?.jobRole || 'Employee';
  const companyName = companyDoc?.name || 'Demo Corp';

  const handleResetPassword = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(getAuth(), user.email);
      toast({ title: 'Password Reset', description: `Instructions sent to ${user.email}` });
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  const handleSignOut = async () => {
    await signOut(getAuth());
    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-[#080A0F] bg-grid">
      <SidebarNav role="employee" />

      <main className="flex-1 overflow-auto p-6 space-y-5 pb-24 lg:pb-6">
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-[#080A0F]/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5 mb-6">
          <p className="section-label">Employee Portal • Dashboard</p>
          <div className="flex items-center gap-4">
            <MaturityBadge level={(userDoc?.maturity as any) || 1} className="h-9 py-0" />
            <div className="relative">
              <button onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:scale-105"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
                <Settings className="w-4 h-4" />
              </button>
              
              {profileOpen && (
                <div className="absolute right-0 top-12 w-64 rounded-2xl p-5 animate-fade-up z-50 shadow-2xl glass"
                  style={{ background: '#0C0F16', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="flex items-center gap-4 mb-4 pb-4 border-b border-white/5">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shrink-0 uppercase">
                      {userName.charAt(0)}
                    </div>
                    <div className="min-w-0 pr-2">
                       <p className="font-semibold text-[15px] text-[#E8EDF2] truncate">{userName}</p>
                       <p className="text-xs text-white/40 truncate capitalize">{roleName}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <button onClick={handleResetPassword} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left">
                      <Key className="w-4 h-4 text-white/40" /> Change Password
                    </button>
                    <div className="pt-2 border-t border-white/5 mt-2">
                      <button onClick={handleSignOut} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#F87171] hover:bg-[#EF4444]/10 transition-colors text-left font-medium">
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#00D4FF]/5 rounded-full blur-[120px]" />
        </div>

        <div className="animate-fade-up">
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EDF2' }}>Welcome back, {userName}</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Role: <span style={{ color: '#7B61FF', fontWeight: 600, textTransform: 'capitalize' }}>{roleName}</span> • {companyName}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          <Card className="lg:col-span-2 p-8 relative overflow-hidden group flex flex-col justify-between" 
            style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="absolute -top-12 -right-12 opacity-5 group-hover:opacity-10 transition-opacity">
              <Shield className="w-48 h-48 text-[#00D4FF]" />
            </div>
            
            <div className="space-y-4">
              <div className="badge badge-cyan animate-breathe">Assessment Active</div>
              <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 28 }}>2025 Cybersecurity Audit</h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 460 }}>
                Evaluate your awareness of DPDP compliance, role-specific security practices, and risk mitigation strategies.
              </p>
            </div>

            <div className="flex gap-4 mt-8">
              <Link href="/employee/assessment">
                <Button style={{ background: '#00D4FF', color: '#080A0F', fontWeight: 700, borderRadius: 12 }}>
                  START ASSESSMENT <Play className="ml-2 w-3.5 h-3.5 fill-current" />
                </Button>
              </Link>
              <Link href="/employee/history">
                <Button variant="ghost" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  VIEW HISTORY
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center space-y-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
             <p className="section-label">Aggregate Score</p>
             <ScoreRing percent={analytics.avgScore} size={150} strokeWidth={12} label={analytics.avgScore > 0 ? `${analytics.avgScore}%` : "No Data"} />
             <div className="grid grid-cols-2 gap-3 w-full">
               <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                 <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Accuracy</p>
                 <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, color: '#00D4FF' }}>{analytics.accuracy}%</p>
               </div>
               <div className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)' }}>
                 <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>Avg Time</p>
                 <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 18, color: '#00D4FF' }}>{analytics.avgTime}s</p>
               </div>
             </div>
          </Card>
        </div>

        {/* Section Scores */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-1">
          {Object.entries(MODULE_META).map(([key, meta]) => {
             const val = analytics.moduleBest[key];
             const str = val !== undefined ? `${val}%` : '---';
             return (
               <StatCard key={key} label={meta.label} value={str} icon={<meta.icon className="w-4 h-4" style={{ color: meta.color }} />} />
             )
          })}
        </div>

        {/* Recommendations & Badges */}
        <div className="grid lg:grid-cols-3 gap-5 animate-fade-up delay-2">
          <Card className="lg:col-span-2 p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16 }}>Personal Recommendations</h3>
              <Zap className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="space-y-3">
              {aiLoading && <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-[#00D4FF] mb-2" /><p className="text-sm text-white/40">AI is analyzing latest attempt...</p></div>}
              {!aiLoading && !analytics.hasAttempts && <p className="text-sm text-white/30 text-center py-4">Complete an assessment to view AI recommendations.</p>}
              {!aiLoading && analytics.hasAttempts && aiRecs.map((r, i) => (
                <div key={i} className="flex gap-4 p-4 rounded-xl border border-white/5 bg-white/2 hover:bg-white/3 transition-all">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5" style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: 12, fontWeight: 700 }}>{i + 1}</div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>{r}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16 }}>Achievements</h3>
              <Trophy className="w-4 h-4 text-[#7B61FF]" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {BADGE_DEFS.map((b, i) => {
                 const earned = (analytics.moduleBest[b.target] ?? 0) === 100;
                 return (
                   <div key={i} className="p-4 rounded-xl border border-white/5 flex flex-col items-center text-center transition-all"
                     style={{ background: earned ? 'rgba(34,197,94,0.05)' : 'rgba(255,255,255,0.02)', opacity: earned ? 1 : 0.4 }}>
                     <span style={{ fontSize: 24, marginBottom: 8, filter: earned ? 'none' : 'grayscale(100%)' }}>{b.icon}</span>
                     <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: earned ? '#4ADE80' : 'rgba(255,255,255,0.4)' }}>{b.name}</p>
                   </div>
                 )
              })}
            </div>
          </Card>
        </div>
      </main>

      <DPDPBot />
    </div>
  );
}
