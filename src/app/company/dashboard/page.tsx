"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { StatCard } from '@/components/dashboard/stat-card';
import { ScoreRing } from '@/components/ui/score-ring';
import { MaturityBadge } from '@/components/ui/maturity-badge';
import { 
  Users, AlertTriangle, TrendingUp,
  ArrowUpRight, Copy, LogOut, Key
} from 'lucide-react';
import { getAuth, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, collection, query, where, getDoc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

const SEV: Record<string,{color:string;bg:string;border:string}> = {
  critical: { color:'#F87171', bg:'rgba(239,68,68,0.07)',   border:'rgba(239,68,68,0.2)'  },
  medium:   { color:'#FBC22D', bg:'rgba(245,158,11,0.07)',  border:'rgba(245,158,11,0.2)' },
};

const SCORE_COLOR = (s:number) => s>=80?'#4ADE80':s>=65?'#FBC22D':'#F87171';

export default function CompanyDashboard() {
  const router = useRouter();
  const { toast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);

  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    return user ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  const employeesQuery = useMemoFirebase(() => {
    if (!userDoc?.companyId) return null;
    return query(collection(firestore, 'users'), where('companyId', '==', userDoc.companyId), where('role', '==', 'employee'));
  }, [userDoc?.companyId, firestore]);
  
  const { data: realEmployees } = useCollection(employeesQuery);

  const companyDocRef = useMemoFirebase(() => {
    return userDoc?.companyId ? doc(firestore, 'companies', userDoc.companyId) : null;
  }, [userDoc?.companyId, firestore]);
  const { data: companyDoc } = useDoc(companyDocRef);

  // Companies created before join codes moved to joinCodes/{code} need that
  // lookup document once; the company admin is allowed to create it.
  useEffect(() => {
    const code = (companyDoc as any)?.joinCode;
    if (!code || !userDoc?.companyId || userDoc?.role !== 'company') return;
    const ref = doc(firestore, 'joinCodes', code);
    getDoc(ref)
      .then((snap) => (snap.exists() ? null : setDoc(ref, { companyId: userDoc.companyId })))
      .catch((err) => console.warn('Could not register join code', err));
  }, [companyDoc, userDoc?.companyId, userDoc?.role, firestore]);

  const displayEmployees = useMemo(() => {
     return (realEmployees || []).map((e: any) => ({
        name: e.name || 'Unknown User',
        role: e.jobRole || 'Employee',
        score: e.score || 0,
        maturity: e.maturity || 1,
        status: (e.score || 0) > 0 ? 'completed' : 'in_progress'
      }));
  }, [realEmployees]);

  const analytics = useMemo(() => {
      let totalCompleted = 0;
      let totalScore = 0;
      let highRisk = 0;
      
      const rolesMap: Record<string, { count: number; totalScore: number }> = {};
      
      displayEmployees.forEach(e => {
         if (e.status === 'completed') totalCompleted++;
         totalScore += e.score;
         if (e.maturity <= 2 || e.score < 50) highRisk++;
         
         if (!rolesMap[e.role]) rolesMap[e.role] = { count: 0, totalScore: 0 };
         rolesMap[e.role].count++;
         rolesMap[e.role].totalScore += e.score;
      });
      
      const staff = displayEmployees.length;
      const completion = staff > 0 ? Math.round((totalCompleted / staff) * 100) : 0;
      const score = staff > 0 ? Math.round(totalScore / staff) : 0;
      
      let maturityLevel = 1;
      if (score >= 90) maturityLevel = 5;
      else if (score >= 80) maturityLevel = 4;
      else if (score >= 65) maturityLevel = 3;
      else if (score >= 40) maturityLevel = 2;

      const roleScores = Object.keys(rolesMap).map(role => ({
         role,
         count: rolesMap[role].count,
         score: Math.round(rolesMap[role].totalScore / rolesMap[role].count)
      })).sort((a,b) => b.count - a.count).slice(0, 5);

      const weakAreas = [];
      if (highRisk > 0) {
         weakAreas.push({
            title: 'High Risk Personnel',
            desc: `${highRisk} staff members fell below the safe threshold.`,
            severity: 'critical'
         });
      }
      if (score < 70) {
         weakAreas.push({
             title: 'Overall Cyber Posture',
             desc: 'Company average is significantly low, deploy remedial modules.',
             severity: 'critical'
         });
      } else if (score < 80) {
         weakAreas.push({
             title: 'General Policy Awareness',
             desc: 'Minor gap detected across broad departments.',
             severity: 'medium'
         });
      }

      return { staff, completion, score, maturityLevel, roleScores, weakAreas };
  }, [displayEmployees]);

  const copyJoinCode = () => {
    if (companyDoc?.joinCode) {
      navigator.clipboard.writeText(companyDoc.joinCode);
      toast({ title: 'Copied!', description: 'Join Code copied to clipboard.' });
      setProfileOpen(false);
    }
  };

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
    <div className="flex min-h-screen bg-[#080A0F]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SidebarNav role="company" />

      <main className="flex-1 overflow-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 bg-[#080A0F]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>
            Company Dashboard
          </p>
          <div className="relative">
            <button onClick={() => setProfileOpen(!profileOpen)}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all hover:scale-105"
              style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}>
              <span className="text-xs font-bold">{companyDoc?.name ? companyDoc.name.substring(0, 2).toUpperCase() : 'CO'}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 top-12 w-64 rounded-2xl p-2 z-50 shadow-2xl animate-fade-up"
                style={{ background: '#0C0F16', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div className="px-3 py-3 border-b border-white/5 mb-2">
                  <p className="text-sm font-bold text-white truncate">{companyDoc?.name || 'Company Admin'}</p>
                  <p className="text-xs text-white/40 truncate">{user?.email}</p>
                </div>
                
                <div className="space-y-1 mb-2">
                  <p className="px-3 pt-1 pb-2 text-[10px] font-bold text-white/30 uppercase tracking-wider">Registration</p>
                  <button onClick={copyJoinCode} className="w-full flex items-center justify-between px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                     <span className="flex items-center gap-2"><Key className="w-4 h-4"/> Join Code</span>
                     <span className="font-mono text-xs text-[#00D4FF] bg-[#00D4FF]/10 px-2 py-0.5 rounded-md">{companyDoc?.joinCode || '------'}</span>
                  </button>
                </div>

                <div className="border-t border-white/5 pt-2 space-y-1">
                  <button onClick={handleResetPassword} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors text-left">
                     <Key className="w-4 h-4"/> Reset Password
                  </button>
                  <button onClick={handleSignOut} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-left">
                     <LogOut className="w-4 h-4"/> Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5 pb-24 lg:pb-6">
          <div className="animate-fade-up">
            <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EDF2' }}>
              Welcome back, {companyDoc?.name || 'Admin'}
            </h1>
            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
              Your organization's real-time security posture.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-1">
            <StatCard label="Total Staff" value={analytics.staff.toString()} icon={<Users className="w-4 h-4" style={{color:'#7B61FF'}} />} />
            <StatCard label="Completion"  value={`${analytics.completion}%`} trend={0} icon={<TrendingUp className="w-4 h-4" style={{color:'#00D4FF'}} />} />
            <StatCard label="Avg Score"   value={`${analytics.score}%`}      trend={0} />
            <div className="rounded-2xl p-5 flex flex-col justify-center items-center relative overflow-hidden"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-[#4ADE80]/5" />
              <div className="flex items-center gap-2 mb-2 relative z-10">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#4ADE80', boxShadow:'0 0 8px #4ADE80' }} />
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)' }}>
                  Platform Health
                </p>
              </div>
              <MaturityBadge level={analytics.maturityLevel as any} className="scale-110" />
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-5 animate-fade-up delay-2">
            
            {/* Needs Attention */}
            <div className="lg:col-span-2 rounded-2xl p-6"
              style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-[#F87171]/10 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-[#F87171]" />
                </div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:15, color:'#E8EDF2' }}>
                  Needs Attention
                </h3>
              </div>

              <div className="space-y-3">
                {analytics.weakAreas.length === 0 && (
                   <p className="text-sm py-4 text-white/30 text-center">No critical warnings found. Posture is secure.</p>
                )}
                {analytics.weakAreas.map((w, i) => (
                  <div key={i} className="p-4 rounded-xl flex items-start gap-4 transition-all"
                    style={{ background: SEV[w.severity].bg, border:`1px solid ${SEV[w.severity].border}` }}>
                    <div className="mt-1 flex-1">
                      <p style={{ fontSize:13, fontWeight:600, color:'#E8EDF2' }}>{w.title}</p>
                      <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)', marginTop:2 }}>{w.desc}</p>
                    </div>
                    <button onClick={() => router.push('/company/employees')}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase transition-all hover:opacity-80 rounded-md"
                      style={{ color: SEV[w.severity].color, background:'rgba(0,0,0,0.2)', padding:'4px 8px' }}>
                      Assign Module <ArrowUpRight className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Assessment Progress */}
            <div className="rounded-2xl p-6 flex flex-col justify-between"
              style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:15, color:'#E8EDF2', marginBottom:4 }}>Target Goal</h3>
                <p style={{ fontSize:12, color:'rgba(255,255,255,0.4)', marginBottom:24 }}>Quarterly Compliance</p>
              </div>
              <div className="flex justify-center my-6">
                <ScoreRing percent={analytics.completion} size={160} strokeWidth={12} label={`${analytics.completion}%`} />
              </div>
              <div className="flex items-center justify-between text-xs w-full" style={{ color:'rgba(255,255,255,0.4)', padding: '0 10px' }}>
                <span>0% Minimum</span>
                <span>Target: 100%</span>
              </div>
            </div>

          </div>

          <div className="grid lg:grid-cols-2 gap-5 animate-fade-up delay-3">
            
            {/* Top Employees */}
            <div className="rounded-2xl overflow-hidden"
              style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div className="p-5 flex items-center justify-between border-b border-white/5">
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:15, color:'#E8EDF2' }}>Top Performers</h3>
                <button onClick={() => router.push('/company/employees')} className="text-[10px] font-bold text-[#00D4FF] hover:text-white transition-colors uppercase tracking-wider">
                  View All
                </button>
              </div>
              <table className="data-table">
                <tbody>
                  {displayEmployees.sort((a,b) => b.score - a.score).slice(0, 5).map((e, i) => (
                    <tr key={i}>
                      <td>
                        <p style={{ fontSize:13, fontWeight:600, color:'#E8EDF2' }}>{e.name}</p>
                        <p style={{ fontSize:11, color:'rgba(255,255,255,0.3)' }}>{e.role}</p>
                      </td>
                      <td style={{ textAlign:'right' }}>
                        <span style={{ fontFamily:"'DM Mono',monospace", fontSize:14, fontWeight:700, color:SCORE_COLOR(e.score) }}>
                          {e.score}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {displayEmployees.length === 0 && (
                      <tr><td colSpan={2} className="text-center py-5 text-white/30 text-xs">No employees found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Department Breakdown */}
            <div className="rounded-2xl p-5"
              style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:15, color:'#E8EDF2', marginBottom:20 }}>
                Score by Department
              </h3>
              <div className="space-y-4">
                {analytics.roleScores.map((r, i) => (
                  <div key={i}>
                    <div className="flex items-center justify-between mb-2">
                      <span style={{ fontSize:12, fontWeight:500, color:'#E8EDF2' }}>{r.role} <span className="text-white/30 ml-2">({r.count})</span></span>
                      <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:SCORE_COLOR(r.score) }}>{r.score}%</span>
                    </div>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width:`${r.score}%`, background:SCORE_COLOR(r.score) }} />
                    </div>
                  </div>
                ))}
                {analytics.roleScores.length === 0 && (
                   <p className="text-sm py-4 text-white/30 text-center">No role specific data gathered yet.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
