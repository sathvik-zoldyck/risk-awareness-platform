"use client";

import React, { use, useMemo } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { StatCard } from '@/components/dashboard/stat-card';
import { ScoreRing } from '@/components/ui/score-ring';
import { MaturityBadge } from '@/components/ui/maturity-badge';
import { Users, ClipboardCheck, ArrowLeft, Shield, TrendingUp, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, collection, query, where } from 'firebase/firestore';

const SCORE_COLOR = (s: number) => s >= 80 ? '#4ADE80' : s >= 65 ? '#FBC22D' : '#F87171';

export default function CompanyAnalytics({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const firestore = useFirestore();
  const { id } = use(params);

  // Get specific company
  const companyDocRef = useMemoFirebase(() => doc(firestore, 'companies', id), [firestore, id]);
  const { data: companyDoc } = useDoc(companyDocRef);

  // Get employees for this company
  const usersColRef = useMemoFirebase(() => 
    query(collection(firestore, 'users'), where('companyId', '==', id), where('role', '==', 'employee')), 
  [firestore, id]);
  const { data: realEmps } = useCollection(usersColRef);

  const displayId = companyDoc?.name || id;

  const employees = useMemo(() => {
    return (realEmps || []).map((e: any) => ({
      name: e.name || 'Unknown',
      role: e.jobRole || 'Employee',
      score: e.score || 0,
      maturity: e.maturity || 1,
      status: (e.score || 0) > 0 ? 'completed' : 'in_progress'
    }));
  }, [realEmps]);

  const analytics = useMemo(() => {
    const staff = employees.length;
    let completedCount = 0;
    let totalScore = 0;
    let highRiskCount = 0;

    employees.forEach(e => {
        if (e.score > 0) completedCount++;
        totalScore += e.score;
        if (e.maturity <= 2 || e.score < 50) highRiskCount++;
    });

    const completion = staff > 0 ? Math.round((completedCount / staff) * 100) : 0;
    const score = staff > 0 ? Math.round(totalScore / staff) : 0;

    let maturity = 1;
    if (score >= 90) maturity = 5;
    else if (score >= 80) maturity = 4;
    else if (score >= 65) maturity = 3;
    else if (score >= 40) maturity = 2;

    return { staff, completion, score, maturity, highRisk: highRiskCount };
  }, [employees]);

  return (
    <div className="flex min-h-screen bg-[#080A0F]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SidebarNav role="admin" />

      <main className="flex-1 overflow-auto p-6 space-y-5 pb-24 lg:pb-6">
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-[#080A0F]/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5 mb-6">
          <div className="flex items-center gap-3">
             <button onClick={() => router.back()}
              className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-white/5 transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <ArrowLeft className="w-4 h-4 text-white/60" />
             </button>
             <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">Company Analytics / {displayId}</p>
          </div>
        </div>

        <div className="animate-fade-up">
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EDF2' }}>
            {displayId}
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Detailed compliance and maturity breakdown.</p>
        </div>

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-1">
          <StatCard label="Enrolled Staff"    value={analytics.staff.toString()} icon={<Users className="w-4 h-4" style={{color:'#00D4FF'}} />} />
          <StatCard label="Completion Rate"   value={`${analytics.completion}%`} trend={2} icon={<ClipboardCheck className="w-4 h-4" style={{color:'#7B61FF'}} />} />
          <StatCard label="Avg Cyber Score"   value={`${analytics.score}%`}      trend={1} icon={<Shield className="w-4 h-4" style={{color:'#22C55E'}} />} />
          <StatCard label="High Risk Staff"   value={analytics.highRisk.toString()} trend={-2} icon={<AlertTriangle className="w-4 h-4" style={{color:'#F87171'}} />} />
        </div>

        {/* Maturity Breakdown */}
        <div className="grid lg:grid-cols-3 gap-4 animate-fade-up delay-2">
          <div className="lg:col-span-2 rounded-2xl p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
             <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:15, color:'#E8EDF2' }}>Health Matrix</h3>
                  <p className="text-xs mt-0.5" style={{ color:'rgba(255,255,255,0.3)' }}>Module-level performance estimates</p>
                </div>
                <MaturityBadge level={analytics.maturity as any} />
             </div>
             
             <div className="grid grid-cols-3 gap-4">
                {[
                  { pct: Math.min(100, analytics.score + 5), label: 'Core Security', sub: 'Basic', color: '#00D4FF' },
                  { pct: Math.max(0, analytics.score - 5), label: 'DPDP 2023', sub: 'Privacy', color: '#7B61FF' },
                  { pct: Math.min(100, analytics.score + 8), label: 'Practical', sub: 'Scenario', color: '#22C55E' },
                ].map(({ pct, label, sub, color }) => (
                  <div key={label} className="flex flex-col items-center gap-3">
                    <ScoreRing percent={pct} size={100} strokeWidth={8} label={label} />
                    <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
                      {sub}
                    </p>
                  </div>
                ))}
             </div>
          </div>

          <div className="rounded-2xl p-6" style={{ background: 'rgba(0,212,255,0.02)', border: '1px solid rgba(0,212,255,0.1)' }}>
             <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 15, color: '#E8EDF2', marginBottom: 16 }}>Growth Opportunities</h3>
             <ul className="space-y-4 mt-6">
               <li className="flex items-start gap-3">
                 <span className="w-1.5 h-1.5 rounded-full mt-1.5 bg-[#F87171] shadow-[0_0_8px_#F87171]" />
                 <p className="text-sm text-white/50"><strong className="text-white/70">DPDP Retention:</strong> Focus training heavily on data retention bounds and clauses.</p>
               </li>
               <li className="flex items-start gap-3">
                 <span className="w-1.5 h-1.5 rounded-full mt-1.5 bg-[#FBC22D] shadow-[0_0_8px_#FBC22D]" />
                 <p className="text-sm text-white/50"><strong className="text-white/70">Role-based:</strong> Discrepancies noted in specific non-technical departments.</p>
               </li>
             </ul>
          </div>
        </div>

        {/* Top Employees List */}
        <div className="rounded-2xl overflow-hidden animate-fade-up delay-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 15, color: '#E8EDF2' }}>Enrolled Employees</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Employee</th><th>Role</th><th>Score</th><th>Maturity</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 && (
                   <tr><td colSpan={5} className="text-center py-6 text-white/30">No employees linked to this company yet.</td></tr>
                )}
                {employees.map((e, i) => (
                  <tr key={i} className="table-row-hover">
                    <td style={{ fontWeight: 500, color: '#E8EDF2' }}>{e.name}</td>
                    <td style={{ color: 'rgba(255,255,255,0.45)' }}>{e.role}</td>
                    <td><span style={{ fontFamily: "'DM Mono', monospace", color: SCORE_COLOR(e.score) }}>{e.score}%</span></td>
                    <td>
                       <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{
                            background: e.maturity >= 4 ? 'rgba(34,197,94,0.1)' : e.maturity === 3 ? 'rgba(0,212,255,0.1)' : 'rgba(239,68,68,0.1)',
                            color:      e.maturity >= 4 ? '#4ADE80'              : e.maturity === 3 ? '#00D4FF'             : '#F87171',
                          }}>
                          Lv.{e.maturity}
                        </span>
                    </td>
                    <td>
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                        style={{
                          background: e.status === 'completed' ? 'rgba(34,197,94,0.08)' : 'rgba(245,158,11,0.08)',
                          color:      e.status === 'completed' ? '#4ADE80'              : '#FBC22D',
                        }}>
                        {e.status === 'completed' ? 'Done' : 'In Progress'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </main>
    </div>
  );
}
