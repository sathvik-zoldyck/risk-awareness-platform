"use client";

import React, { useState, useMemo } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Search, ArrowUpRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { StatCard } from '@/components/dashboard/stat-card';
import { MaturityBadge } from '@/components/ui/maturity-badge';
import { useRouter } from 'next/navigation';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection } from 'firebase/firestore';

const getScoreColor = (s: number) => s >= 80 ? '#4ADE80' : s >= 65 ? '#FBC22D' : '#F87171';

export default function AdminCompanies() {
  const [search, setSearch] = useState('');
  const router = useRouter();
  const firestore = useFirestore();

  const companiesColRef = useMemoFirebase(() => collection(firestore, 'companies'), [firestore]);
  const { data: realCompanies } = useCollection(companiesColRef);

  const usersColRef = useMemoFirebase(() => collection(firestore, 'users'), [firestore]);
  const { data: realUsers } = useCollection(usersColRef);

  const displayCompanies = useMemo(() => {
    return (realCompanies || []).map((c: any) => {
      const companyEmployees = (realUsers || []).filter((u: any) => u.companyId === c.id && u.role === 'employee');
      const staffCount = companyEmployees.length;
      let avgHealth = 0;
      let completedCount = 0;
      if (staffCount > 0) {
         const totalScore = companyEmployees.reduce((sum: number, emp: any) => sum + (emp.score || 0), 0);
         avgHealth = Math.round(totalScore / staffCount);
         completedCount = companyEmployees.filter((emp: any) => (emp.score || 0) > 0).length;
      }
      
      const completionRate = staffCount > 0 ? Math.round((completedCount / staffCount) * 100) : 0;
      let maturityLevel = 1;
      if (avgHealth >= 90) maturityLevel = 5;
      else if (avgHealth >= 80) maturityLevel = 4;
      else if (avgHealth >= 65) maturityLevel = 3;
      else if (avgHealth >= 40) maturityLevel = 2;

      return {
          id: c.id,
          name: c.name || 'Unknown',
          industry: c.industry || 'Tech',
          staff: staffCount,
          score: avgHealth,
          completed: completionRate,
          maturity: maturityLevel,
          joined: c.createdAt?.seconds ? new Date(c.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Recent'
      };
    });
  }, [realCompanies, realUsers]);

  const filtered = displayCompanies.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || c.industry.toLowerCase().includes(search.toLowerCase())
  );

  const totalEntities = displayCompanies.length;
  const globalStaff = displayCompanies.reduce((sum, c) => sum + c.staff, 0);
  const avgGlobalScore = totalEntities > 0 
    ? Math.round(displayCompanies.reduce((sum, c) => sum + c.score, 0) / totalEntities)
    : 0;

  return (
    <div className="flex min-h-screen bg-[#080A0F] bg-grid">
      <SidebarNav role="admin" />

      <main className="flex-1 overflow-auto p-6 space-y-5 pb-24 lg:pb-6">
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-[#080A0F]/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5 mb-6">
          <p className="section-label">Global Control • Companies</p>
        </div>

        <div className="animate-fade-up">
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24 }}>Company Management</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Monitoring {totalEntities} active enterprise accounts.</p>
        </div>

        {/* Global Stats */}
        <div className="grid grid-cols-3 gap-4 animate-fade-up delay-1">
          <StatCard label="Total Entities" value={totalEntities} />
          <StatCard label="Global Staff" value={globalStaff} />
          <StatCard label="Avg Score" value={`${avgGlobalScore}%`} trend={0} />
        </div>

        {/* Search */}
        <div className="relative animate-fade-up delay-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name, domain or industry..."
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-[#0B0F17] border border-white/10 outline-none focus:ring-[#00D4FF] text-[#E8EDF2]"
          />
        </div>

        {/* Grid of Company Cards */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5 animate-fade-up delay-3">
          {filtered.map((c, i) => (
            <Card key={c.id} className="p-6 transition-all group cursor-pointer" 
              style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.18)'; e.currentTarget.style.background = 'rgba(0,212,255,0.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; }}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)' }}>
                    {c.name.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 700, fontSize: 16, color: '#E8EDF2' }}>{c.name}</h4>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{c.industry}</p>
                  </div>
                </div>
                <button 
                  onClick={() => router.push(`/admin/companies/${c.id}`)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all text-[#00D4FF] bg-[#00D4FF]/10 z-10"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-6">
                {[
                  { label: 'Staff', value: c.staff, color: '#E8EDF2' },
                  { label: 'Completion', value: `${c.completed}%`, color: c.completed >= 80 ? '#4ADE80' : '#FBC22D' },
                  { label: 'Avg Score', value: `${c.score}%`, color: getScoreColor(c.score) },
                  { label: 'Joined', value: c.joined, color: 'rgba(255,255,255,0.3)' },
                ].map((stat, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/2 border border-white/5">
                    <p style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>{stat.label}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, color: stat.color, fontWeight: 700 }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.2)', textTransform: 'uppercase' }}>Health Status</span>
                  <MaturityBadge level={c.maturity as any} className="px-2 py-1 scale-75 origin-right" />
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${c.score}%`, background: getScoreColor(c.score) }} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}