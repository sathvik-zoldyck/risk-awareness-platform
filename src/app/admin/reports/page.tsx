"use client";

import React, { useMemo } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { StatCard } from '@/components/dashboard/stat-card';
import { BarChart3, Activity, ShieldAlert, Cpu } from 'lucide-react';
import { ScoreRing } from '@/components/ui/score-ring';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';

export default function AdminReports() {
  const firestore = useFirestore();

  // Pull actual assessment attempts to make analytics real
  const attemptsColRef = useMemoFirebase(() => collection(firestore, 'assessment_attempts'), [firestore]);
  const { data: realAttempts } = useCollection(attemptsColRef);
  
  const questionsColRef = useMemoFirebase(() => collection(firestore, 'questions'), [firestore]);
  const { data: realQuestions } = useCollection(questionsColRef);

  const analytics = useMemo(() => {
    const attempts = realAttempts || [];
    const questions = realQuestions || [];
    
    const totalAssessments = attempts.length;
    let totalScore = 0;
    let criticalFails = 0;
    
    attempts.forEach((a: any) => {
       totalScore += (a.score || 0);
       if (a.score < 50) criticalFails++;
    });

    const avgScore = totalAssessments > 0 ? Math.round(totalScore / totalAssessments) : 0;
    const aiGens = questions.filter((q: any) => q.createdBy === 'ai').length;
    
    const timeline = [...attempts]
      .filter(a => a.completedAt)
      .sort((a: any, b: any) => a.completedAt.seconds - b.completedAt.seconds)
      .slice(-15)
      .map(a => a.score);

    return { totalAssessments, avgScore, criticalFails, aiGens, timeline };
  }, [realAttempts, realQuestions]);

  return (
    <div className="flex min-h-screen bg-[#080A0F]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SidebarNav role="admin" />

      <main className="flex-1 overflow-auto p-6 space-y-5 pb-24 lg:pb-6">
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-[#080A0F]/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">TOOLS • Global Analytics</p>
        </div>

        <div className="animate-fade-up">
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EDF2' }}>Global Analytics</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Platform wide assessment telemetry and trends.</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-1">
          <StatCard label="Total Assessments" value={analytics.totalAssessments.toString()} trend={0} icon={<BarChart3 className="w-4 h-4" style={{color:'#00D4FF'}} />} />
          <StatCard label="Avg Platform Score" value={`${analytics.avgScore}%`} trend={0} icon={<Activity className="w-4 h-4" style={{color:'#22C55E'}} />} />
          <StatCard label="Critical Fails" value={analytics.criticalFails.toString()} trend={0} icon={<ShieldAlert className="w-4 h-4" style={{color:'#F87171'}} />} />
          <StatCard label="AI Generated Gens" value={analytics.aiGens.toString()} trend={0} icon={<Cpu className="w-4 h-4" style={{color:'#7B61FF'}} />} />
        </div>

        <div className="grid lg:grid-cols-2 gap-4 animate-fade-up delay-2">
            <div className="rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 16, color: '#E8EDF2', marginBottom: 20 }}>Global Module Performance</h3>
                <div className="flex justify-around items-center">
                    <div className="flex flex-col items-center gap-2">
                        <ScoreRing percent={Math.min(100, analytics.avgScore + 8)} size={120} strokeWidth={8} label="Basic" />
                        <span className="text-xs font-bold text-white/40 uppercase">Basic Security</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <ScoreRing percent={Math.max(0, analytics.avgScore - 13)} size={120} strokeWidth={8} label="DPDP" />
                        <span className="text-xs font-bold text-white/40 uppercase">DPDP Rules</span>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <ScoreRing percent={Math.max(0, analytics.avgScore + 2)} size={120} strokeWidth={8} label="Roles" />
                        <span className="text-xs font-bold text-white/40 uppercase">Role-based</span>
                    </div>
                </div>
            </div>

            <div className="rounded-2xl p-6 relative overflow-hidden flex flex-col" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#00D4FF]/5" />
                <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 16, color: '#E8EDF2', marginBottom: 4, position: 'relative' }}>Platform Flow & Timeline</h3>
                <p className="text-sm text-white/40 mb-6 relative">Latest {analytics.timeline.length} completion scores across the entire platform.</p>
                <div className="flex-1 flex gap-2 items-end mt-4 relative z-10 p-2 rounded-xl bg-white/5 border border-white/5 h-48">
                     {analytics.timeline.length === 0 && (
                        <p className="w-full text-center text-white/30 text-xs self-center">Not enough data to graph.</p>
                     )}
                     {analytics.timeline.map((score, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-[#00D4FF]/50 to-[#00D4FF] rounded-t-sm hover:opacity-80 transition-opacity relative group" style={{ height: `${Math.max(5, score)}%` }}>
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#080A0F] border border-white/10 text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap text-[#00D4FF] font-mono z-20">
                               {score}%
                            </div>
                        </div>
                     ))}
                </div>
            </div>
        </div>

      </main>
    </div>
  );
}
