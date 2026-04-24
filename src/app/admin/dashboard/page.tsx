"use client";

import React from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { StatCard }   from '@/components/dashboard/stat-card';
import {
  Users, Building2, ClipboardCheck, TrendingUp,
  ArrowUpRight, AlertTriangle, ShieldCheck, Activity, Settings, LogOut,
} from 'lucide-react';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { useDoc } from '@/firebase/firestore/use-doc';
import { collection, doc } from 'firebase/firestore';
import { getAuth, signOut } from 'firebase/auth';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

const HEALTH_COLOR = (n: number) => n >= 80 ? '#4ADE80' : n >= 65 ? '#FBC22D' : '#F87171';
const ALERT_STYLE: Record<string, { bg: string; border: string; color: string }> = {
  danger:  { bg: 'rgba(239,68,68,0.07)',   border: 'rgba(239,68,68,0.2)',   color: '#F87171' },
  warning: { bg: 'rgba(245,158,11,0.07)',  border: 'rgba(245,158,11,0.2)',  color: '#FBC22D' },
  info:    { bg: 'rgba(0,212,255,0.06)',   border: 'rgba(0,212,255,0.15)',  color: '#00D4FF' },
};

function timeAgo(date: Date) {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  let interval = seconds / 31536000;
  if (interval > 1) return Math.floor(interval) + "y ago";
  interval = seconds / 2592000;
  if (interval > 1) return Math.floor(interval) + "mo ago";
  interval = seconds / 86400;
  if (interval > 1) return Math.floor(interval) + "d ago";
  interval = seconds / 3600;
  if (interval > 1) return Math.floor(interval) + "h ago";
  interval = seconds / 60;
  if (interval > 1) return Math.floor(interval) + "m ago";
  return Math.floor(seconds) + "s ago";
}

export default function AdminDashboard() {
  const [profileOpen, setProfileOpen] = useState(false);
  const { user } = useUser();
  const firestore = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    return user ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  const companiesColRef = useMemoFirebase(() => collection(firestore, 'companies'), [firestore]);
  const { data: realCompanies } = useCollection(companiesColRef);

  const usersColRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: realUsers } = useCollection(usersColRef);

  const attemptsColRef = useMemoFirebase(() => collection(firestore, 'assessment_attempts'), [firestore]);
  const { data: realAttempts } = useCollection(attemptsColRef);
  
  const questionsColRef = useMemoFirebase(() => collection(firestore, 'questions'), [firestore]);
  const { data: realQuestions } = useCollection(questionsColRef);

  const totalCompanies = realCompanies?.length || 0;
  const totalEmployees = realUsers?.filter((u: any) => u.role === 'employee').length || 0;

  const displayCompanies = useMemo(() => {
    return (realCompanies || []).map((c: any) => {
      const companyEmployees = (realUsers || []).filter((u: any) => u.companyId === c.id && u.role === 'employee');
      const staffCount = companyEmployees.length;
      let avgHealth = 0;
      if (staffCount > 0) {
         const totalScore = companyEmployees.reduce((sum: number, emp: any) => sum + (emp.score || 0), 0);
         avgHealth = Math.round(totalScore / staffCount);
      }
      return {
          id: c.id,
          name: c.name || 'Unknown',
          industry: c.industry || 'Tech',
          staff: staffCount,
          health: avgHealth,
          trend: 0
      };
    });
  }, [realCompanies, realUsers]);

  const globalStats = useMemo(() => {
    const attempts = realAttempts || [];
    const avgCompliance = attempts.length > 0 
       ? Math.round(attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / attempts.length)
       : 0;
       
    return {
       audits: attempts.length,
       compliance: avgCompliance
    }
  }, [realAttempts]);

  const dynamicAlerts = useMemo(() => {
    const alerts = [];
    const questions = realQuestions || [];
    if (questions.length > 0 && questions.length < 10) {
       alerts.push({ type: 'danger', title: 'Low Question Pool', body: `Only ${questions.length} questions remaining across all modules.`, icon: AlertTriangle });
    }
    const criticalCompanies = displayCompanies.filter(c => c.health < 60 && c.staff > 0);
    if (criticalCompanies.length > 0) {
       alerts.push({ type: 'warning', title: 'Companies at Risk', body: `${criticalCompanies.length} companies have average compliance below 60%.`, icon: ShieldCheck });
    }
    alerts.push({ type: 'info', title: 'System Status', body: 'Telemetry sync is active. Logging operating normally.', icon: Activity });
    return alerts.slice(0, 3);
  }, [realQuestions, displayCompanies]);

  const dynamicActivity = useMemo(() => {
     const attempts = [...(realAttempts || [])].sort((a, b) => (b.completedAt?.seconds || 0) - (a.completedAt?.seconds || 0)).slice(0, 5);
     if (attempts.length === 0) {
         return [{ event: 'No recent activity.', time: 'Just now', dot: '#22C55E' }];
     }
     return attempts.map(a => {
         let timeStr = 'Recently';
         if (a.completedAt?.seconds) {
            timeStr = timeAgo(new Date(a.completedAt.seconds * 1000));
         }
         const userName = (realUsers || []).find((u:any) => u.id === a.userId)?.name || 'An employee';
         return {
            event: `${userName} completed ${a.moduleType} assessment.`,
            time: timeStr,
            dot: a.score >= 80 ? '#4ADE80' : a.score >= 50 ? '#00D4FF' : '#F87171'
         }
     });
  }, [realAttempts, realUsers]);

  return (
    <div className="flex min-h-screen bg-[#080A0F]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SidebarNav role="admin" />

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 bg-[#080A0F]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-3">
            <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>
              Admin • Global Control
            </p>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:'#4ADE80' }}>All Systems Operational</span>
            </div>
          </div>
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
                    {userDoc?.name?.charAt(0) || 'A'}
                  </div>
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-[15px] text-[#E8EDF2] truncate">{userDoc?.name || 'Admin User'}</p>
                    <p className="text-xs text-white/40 truncate">{userDoc?.email || user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left"
                    onClick={() => { window.location.href = '/admin/settings'; }}>
                    <Settings className="w-4 h-4 text-white/40" /> Settings
                  </button>
                  
                  <div className="pt-2 border-t border-white/5 mt-2">
                    <button onClick={async () => { await signOut(getAuth()); window.location.href = '/'; }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#F87171] hover:bg-[#EF4444]/10 transition-colors text-left font-medium">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-5 pb-24 lg:pb-6">
          <div className="animate-fade-up">
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:24, color:'#E8EDF2', letterSpacing:'-0.02em' }}>
              Global Control Center
            </h1>
            <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.4)' }}>
              {totalCompanies} active companies • {totalEmployees.toLocaleString()} employees • Live Sync
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-1">
            <StatCard label="Total Companies"  value={totalCompanies.toString()} trend={0} icon={<Building2 className="w-4 h-4" style={{color:'#00D4FF'}} />} />
            <StatCard label="Total Employees"  value={totalEmployees.toLocaleString()} trend={0} icon={<Users className="w-4 h-4" style={{color:'#7B61FF'}} />} />
            <StatCard label="Completed Audits" value={globalStats.audits.toString()} trend={0} icon={<ClipboardCheck className="w-4 h-4" style={{color:'#22C55E'}} />} />
            <StatCard label="Avg Compliance"   value={`${globalStats.compliance}%`} trend={0} icon={<TrendingUp className="w-4 h-4" style={{color:'#F59E0B'}} />} />
          </div>

          <div className="grid lg:grid-cols-3 gap-4 animate-fade-up delay-2">
            <div className="lg:col-span-2 rounded-2xl overflow-hidden"
              style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
              <div className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:15, color:'#E8EDF2' }}>Company Overview</h3>
                <a href="/admin/companies" style={{ fontSize:12, color:'#00D4FF', fontWeight:600 }}>View All →</a>
              </div>
              <table className="data-table">
                <thead><tr><th>Company</th><th>Industry</th><th>Staff</th><th>Health Score</th><th /></tr></thead>
                <tbody>
                  {displayCompanies.map((co, i) => (
                    <tr key={i} className="table-row-hover">
                      <td style={{ fontWeight:500, color:'#E8EDF2' }}>{co.name}</td>
                      <td style={{ color:'rgba(255,255,255,0.4)' }}>{co.industry}</td>
                      <td style={{ fontFamily:"'DM Mono',monospace", color:'rgba(255,255,255,0.6)' }}>{co.staff}</td>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-20 h-1 rounded-full" style={{ background:'rgba(255,255,255,0.06)' }}>
                            <div className="h-full rounded-full" style={{ width:`${co.health}%`, background:HEALTH_COLOR(co.health) }} />
                          </div>
                          <span style={{ fontFamily:"'DM Mono',monospace", fontSize:12, color:HEALTH_COLOR(co.health) }}>{co.health}%</span>
                        </div>
                      </td>
                      <td style={{ textAlign:'right' }}>
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center ml-auto transition-all text-white/20 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10"
                          onClick={() => router.push(`/admin/companies/${co.id}`)}>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {displayCompanies.length === 0 && (
                     <tr><td colSpan={5} className="text-center py-6 text-white/30 text-sm">No companies registered yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:14, color:'#E8EDF2', marginBottom:14 }}>System Alerts</h3>
                <div className="space-y-2.5">
                  {dynamicAlerts.map((a, i) => {
                    const s = ALERT_STYLE[a.type] || ALERT_STYLE.info;
                    return (
                      <div key={i} className="flex gap-3 p-3.5 rounded-xl" style={{ background:s.bg, border:`1px solid ${s.border}` }}>
                        <a.icon className="w-4 h-4 shrink-0 mt-0.5" style={{ color:s.color }} />
                        <div>
                          <p style={{ fontSize:12, fontWeight:600, color:s.color, marginBottom:2 }}>{a.title}</p>
                          <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', lineHeight:1.5 }}>{a.body}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl p-5" style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-3.5 h-3.5 text-[#00D4FF]" />
                  <h3 style={{ fontFamily:"'Sora',sans-serif", fontWeight:600, fontSize:14, color:'#E8EDF2' }}>Activity Feed</h3>
                </div>
                <div className="space-y-3">
                  {dynamicActivity.map((a, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background:a.dot }} />
                      <div className="flex-1 min-w-0">
                        <p style={{ fontSize:12, color:'rgba(255,255,255,0.6)', lineHeight:1.5 }}>{a.event}</p>
                      </div>
                      <span style={{ fontSize:10, color:'rgba(255,255,255,0.25)', whiteSpace:'nowrap' }}>{a.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
