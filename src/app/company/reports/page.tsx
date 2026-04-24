"use client";

import React, { useState } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Download, FileDown, ShieldCheck, Activity, Users, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, collection, query, where } from 'firebase/firestore';


export default function CompanyReports() {
  const { toast } = useToast();
  const [generating, setGen] = useState(false);

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

  const displayEmployees = (realEmployees || []).map((e: any) => ({
      name: e.name || 'Unknown',
      jobRole: e.jobRole || 'Employee',
      email: e.email || 'N/A',
      score: e.score || 0,
      maturity: e.maturity || 1,
      status: (e.score || 0) > 0 ? 'completed' : 'pending'
  }));

  const totalEmployees = displayEmployees.length;
  const completedAssessments = displayEmployees.filter((e: any) => e.score > 0).length;
  const completionRate = totalEmployees > 0 ? Math.round((completedAssessments / totalEmployees) * 100) : 0;
  const avgScore = completedAssessments > 0 
    ? Math.round(displayEmployees.reduce((acc: number, e: any) => acc + e.score, 0) / completedAssessments)
    : 0;

  const departmentMap: Record<string, { count: number; score: number }> = {};
  displayEmployees.forEach((e: any) => {
      const dbRole = e.jobRole || 'General';
      if (!departmentMap[dbRole]) departmentMap[dbRole] = { count: 0, score: 0 };
      departmentMap[dbRole].count++;
      departmentMap[dbRole].score += e.score;
  });

  const departmentScores = Object.keys(departmentMap).map(role => ({
      dep: role,
      score: departmentMap[role].count > 0 ? Math.round(departmentMap[role].score / departmentMap[role].count) : 0
  })).sort((a,b) => b.score - a.score).slice(0, 5);

  const handleGenerate = () => {
    if (!companyDoc) {
      toast({ title: 'Mock Mode', description: 'Generating preview schema using demo corporate entity.', variant: 'default' });
    }

    setGen(true);
    toast({ title: 'Synthesizing Data', description: 'Generating comprehensive PDF report...' });
    
    setTimeout(() => {
      try {
        const docPDF = new jsPDF();
        
        docPDF.setFontSize(22);
        docPDF.setTextColor(0, 212, 255);
        docPDF.text('Alcyone Secure', 14, 20);
        
        docPDF.setFontSize(16);
        docPDF.setTextColor(40, 40, 40);
        docPDF.text(`Cybersecurity Audit Report: ${companyDoc?.name || 'Demo Corp'}`, 14, 30);
        
        docPDF.setFontSize(10);
        docPDF.setTextColor(100, 100, 100);
        docPDF.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
        docPDF.text(`Total Staff Enrolled: ${totalEmployees}`, 14, 44);
        docPDF.text(`Overall Completion Rate: ${completionRate}%`, 14, 50);
        docPDF.text(`Average Compliance Score: ${avgScore}%`, 14, 56);
        
        const tableData = displayEmployees.map((e: any) => [
          e.name || 'Unknown',
          e.jobRole || 'Employee',
          e.email || 'N/A',
          e.score > 0 ? `${e.score}%` : 'Not Started',
          e.score > 0 ? 'Completed' : 'Pending'
        ]);

        autoTable(docPDF, {
          startY: 65,
          head: [['Employee Name', 'Role', 'Email', 'Score', 'Status']],
          body: tableData,
          theme: 'grid',
          headStyles: { fillColor: [0, 212, 255] as any },
          styles: { fontSize: 9 }
        });
        
        const filename = `Alcyone_Report_${companyDoc?.name?.replace(/\s+/g, '_') || 'DemoCorp'}_${new Date().getFullYear()}.pdf`;
        docPDF.save(filename);
        toast({ title: 'Report Downloaded', description: 'Your PDF has been successfully generated.' });
      } catch (err) {
        toast({ title: 'Generation Failed', description: 'An error occurred creating the PDF.', variant: 'destructive' });
      } finally {
        setGen(false);
      }
    }, 1500);
  };

  return (
    <div className="flex min-h-screen bg-[#080A0F] bg-grid">
      <SidebarNav role="company" />

      <main className="flex-1 overflow-auto p-6 space-y-5 pb-24 lg:pb-6">
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-[#080A0F]/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5 mb-6">
          <p className="section-label">Audit Intelligence • Reports</p>
        </div>

        <div className="animate-fade-up">
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24 }}>Organization Health</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Real-time compliance analytics for {companyDoc?.name || 'your organization'}.</p>
        </div>

        {/* Live Stat Overview */}
        <div className="grid lg:grid-cols-3 gap-5 animate-fade-up delay-1">
          <Card className="p-6 flex flex-col justify-center relative overflow-hidden group" style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.1)' }}>
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-32 h-32 text-[#00D4FF]" />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(0,212,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Average Org Score</p>
            <p className="font-mono text-5xl font-bold text-[#00D4FF]">{avgScore}%</p>
          </Card>

          <Card className="p-6 flex flex-col justify-center relative overflow-hidden group" style={{ background: 'rgba(34,197,94,0.03)', border: '1px solid rgba(34,197,94,0.1)' }}>
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Activity className="w-32 h-32 text-[#22C55E]" />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(34,197,94,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Completion Rate</p>
            <p className="font-mono text-5xl font-bold text-[#4ADE80]">{completionRate}%</p>
          </Card>

          <Card className="p-6 flex flex-col justify-center relative overflow-hidden group" style={{ background: 'rgba(123,97,255,0.03)', border: '1px solid rgba(123,97,255,0.1)' }}>
            <div className="absolute -right-4 -top-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
              <Users className="w-32 h-32 text-[#7B61FF]" />
            </div>
            <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(123,97,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Active Trainees</p>
            <p className="font-mono text-5xl font-bold text-[#9B87FF]">{totalEmployees}</p>
          </Card>
        </div>

        {/* Action Center */}
        <div className="animate-fade-up delay-2">
          <Card className="p-8 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div>
              <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18, color: '#E8EDF2', marginBottom: 6 }}>Export Assessment Archive</h3>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', maxWidth: 500 }}>
                Synthesize all organizational cybersecurity metrics, individual employee progress, and risk factors into a comprehensive executive PDF summary.
              </p>
            </div>
            <Button onClick={handleGenerate} disabled={generating} className="h-12 px-6 shadow-[0_0_24px_rgba(0,212,255,0.2)] hover:shadow-[0_0_32px_rgba(0,212,255,0.3)] transition-all" style={{ background: '#00D4FF', color: '#080A0F', fontWeight: 800 }}>
              <Download className="w-4 h-4 mr-2" />
              {generating ? 'SYNTHESIZING FILE...' : 'GENERATE PDF'}
            </Button>
          </Card>
        </div>
        {/* Comprehensive Breakdown */}
        <div className="grid lg:grid-cols-2 gap-5 animate-fade-up delay-3">
          <Card className="p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14, color: '#E8EDF2', marginBottom: 16 }}>Compliance by Department</h4>
            <div className="space-y-4">
              {departmentScores.length === 0 && <p className="text-sm py-4 text-white/30 text-center">No reports active yet.</p>}
              {departmentScores.map((d: any) => (
                <div key={d.dep}>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-white/60 font-medium">{d.dep}</span>
                    <span className="font-mono font-bold" style={{ color: d.score >= 80 ? '#4ADE80' : d.score >= 70 ? '#FBC22D' : '#F87171' }}>{d.score}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${d.score}%`, background: d.score >= 80 ? '#4ADE80' : d.score >= 70 ? '#FBC22D' : '#F87171' }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <h4 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 14, color: '#E8EDF2', marginBottom: 16 }}>Security Audit Timeline</h4>
            <div className="space-y-5 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#080A0F] bg-[#00D4FF] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-col" />
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-white/10 bg-white/5">
                  <span className="text-[10px] uppercase font-bold text-[#00D4FF] mb-1 block">Present</span>
                  <p className="text-sm font-medium text-white/90">Continuous Monitoring</p>
                </div>
              </div>
              <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-[#080A0F] bg-[#22C55E] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow flex-col" />
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-white/5 bg-white/2">
                  <span className="text-[10px] uppercase font-bold text-white/40 mb-1 block">Jan 2025</span>
                  <p className="text-sm font-medium text-white/60">DPDP Act Enforcement</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}