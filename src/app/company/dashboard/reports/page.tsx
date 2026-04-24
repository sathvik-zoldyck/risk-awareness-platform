// ─── FILE: src/app/company/reports/page.tsx ───────────────────────────────────
"use client";

import React, { useState } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Download, FileText, Clock, Users, Shield, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const REPORTS = [
  { title:'Q4 2024 Full Audit',         date:'Jan 14, 2025', employees:1240, score:76, size:'2.4 MB', status:'ready' },
  { title:'Q3 2024 Compliance Report',  date:'Oct 02, 2024', employees:1190, score:71, size:'2.1 MB', status:'ready' },
  { title:'Q2 2024 Security Review',    date:'Jul 08, 2024', employees:1080, score:68, size:'1.9 MB', status:'ready' },
  { title:'Q1 2024 Annual Assessment',  date:'Apr 03, 2024', employees:980,  score:65, size:'1.7 MB', status:'ready' },
];

const scoreColor = (s:number) => s>=80?'#4ADE80':s>=65?'#FBC22D':'#F87171';

export default function CompanyReports() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generate = () => {
    setGenerating(true);
    toast({ title:'Generating Report', description:'Compiling assessment data...' });
    setTimeout(() => {
      setGenerating(false);
      toast({ title:'Report Ready', description:'Q1 2025 report is ready to download.' });
    }, 2000);
  };

  return (
    <div className="flex min-h-screen bg-[#080A0F]" style={{ fontFamily:"'Inter',sans-serif" }}>
      <SidebarNav role="company" />
      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 bg-[#080A0F]"
          style={{ borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>
            Reports
          </p>
          <button onClick={generate} disabled={generating}
            className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold"
            style={{ background:generating?'rgba(0,212,255,0.4)':'#00D4FF', color:'#080A0F', boxShadow:generating?'none':'0 0 14px rgba(0,212,255,0.25)' }}>
            <FileText className="w-3.5 h-3.5" />
            {generating ? 'Generating...' : 'Generate New Report'}
          </button>
        </div>

        <div className="p-6 space-y-5 pb-24 lg:pb-6">
          <div className="animate-fade-up">
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:24, color:'#E8EDF2', letterSpacing:'-0.02em' }}>
              Audit Reports
            </h1>
            <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.4)' }}>
              Download and share comprehensive PDF reports
            </p>
          </div>

          {/* Report cards */}
          <div className="space-y-3 animate-fade-up delay-1">
            {REPORTS.map((r, i) => (
              <div key={i} className="flex items-center gap-5 p-5 rounded-2xl transition-all group"
                style={{ background:'rgba(255,255,255,0.025)', border:'1px solid rgba(255,255,255,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(0,212,255,0.15)'; e.currentTarget.style.background='rgba(0,212,255,0.03)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,0.06)'; e.currentTarget.style.background='rgba(255,255,255,0.025)'; }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.15)' }}>
                  <FileText className="w-5 h-5" style={{ color:'#00D4FF' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ fontWeight:500, fontSize:14, color:'#E8EDF2', marginBottom:3 }}>{r.title}</p>
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>
                      <Clock className="w-3 h-3" />{r.date}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>
                      <Users className="w-3 h-3" />{r.employees} employees
                    </span>
                    <span className="flex items-center gap-1.5 text-xs" style={{ color:'rgba(255,255,255,0.3)' }}>
                      <Shield className="w-3 h-3" />
                      <span style={{ color:scoreColor(r.score) }}>{r.score}% avg score</span>
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span style={{ fontSize:11, color:'rgba(255,255,255,0.25)', fontFamily:"'DM Mono',monospace" }}>
                    {r.size}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase px-2.5 py-1 rounded-full"
                    style={{ background:'rgba(34,197,94,0.1)', color:'#4ADE80', border:'1px solid rgba(34,197,94,0.2)' }}>
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                  <button className="flex items-center gap-1.5 px-3 h-8 rounded-xl text-xs font-semibold transition-all"
                    style={{ background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.2)', color:'#00D4FF' }}
                    onMouseEnter={e2 => { e2.currentTarget.style.background='rgba(0,212,255,0.16)'; }}
                    onMouseLeave={e2 => { e2.currentTarget.style.background='rgba(0,212,255,0.08)'; }}
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
