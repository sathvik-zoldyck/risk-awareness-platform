"use client";

import React, { useState } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Search, Plus, Mail, UserX, Download, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, collection, query, where, updateDoc } from 'firebase/firestore';

// Mock EMPLOYEES Removed

const STATUS_CONFIG = {
  completed:   { label: 'Completed',   icon: CheckCircle2, color: '#4ADE80' },
  in_progress: { label: 'In Progress', icon: Clock,        color: '#FBC22D' },
  not_started: { label: 'Not Started', icon: AlertTriangle, color: '#F87171' },
};

export default function CompanyEmployees() {
  const { toast } = useToast();
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    return user ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  const companyDocRef = useMemoFirebase(() => {
    return userDoc?.companyId ? doc(firestore, 'companies', userDoc.companyId) : null;
  }, [userDoc?.companyId, firestore]);
  const { data: companyDoc } = useDoc(companyDocRef);

  const employeesQuery = useMemoFirebase(() => {
    if (!userDoc?.companyId) return null;
    return query(collection(firestore, 'users'), where('companyId', '==', userDoc.companyId), where('role', '==', 'employee'));
  }, [userDoc?.companyId, firestore]);
  const { data: realEmployees } = useCollection(employeesQuery);

  const displayEmployees = (realEmployees || []).map((e: any) => ({
      id: e.id,
      name: e.name || 'Unknown User',
      email: e.email || '',
      role: e.jobRole || 'Employee',
      score: e.score || 0,
      maturity: e.maturity || 1,
      status: (e.score || 0) > 0 ? 'completed' : 'not_started',
      joined: e.createdAt?.seconds ? new Date(e.createdAt.seconds * 1000).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'Unknown'
  }));

  const filtered = displayEmployees.filter(e => {
    const matchStatus = filter === 'all' || e.status === filter;
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.email.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleRemove = async (employeeId?: string) => {
    if (!employeeId) {
      toast({ title: 'Mock Mode', description: 'Cannot remove mock data.', variant: 'destructive' });
      return;
    }
    try {
      await updateDoc(doc(firestore, 'users', employeeId), { companyId: null });
      toast({ title: 'Employee Removed', description: 'They have been unlinked from this company.' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to remove employee.', variant: 'destructive' });
    }
  };

  const handleExportCSV = () => {
    if (displayEmployees.length === 0) {
      toast({ title: 'No Employees', description: 'Real export requires registered employees.' });
      return;
    }
    const headers = ['Name,Email,Role,Score,Maturity,Status,Joined Date'];
    const rows = displayEmployees.map(e => `"${e.name}","${e.email}","${e.role}","${e.score}","${e.maturity}","${e.status}","${e.joined}"`);
    const csvContent = headers.concat(rows).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Alcyone_Employees_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInvite = () => {
    const subject = encodeURIComponent(`Join ${companyDoc?.name || 'our company'} on Alcyone Secure`);
    const body = encodeURIComponent(`Hi there,\n\nPlease register on Alcyone Secure to begin your cybersecurity training.\n\nYour explicit Company Join Code is: ${companyDoc?.joinCode || '------'}\n\nThanks,\nManagement`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex min-h-screen bg-[#080A0F] bg-grid">
      <SidebarNav role="company" />

      <main className="flex-1 overflow-auto p-6 space-y-5 pb-24 lg:pb-6">
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-[#080A0F]/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5 mb-6">
          <p className="section-label">Management • Employees</p>
          <div className="flex items-center gap-2">
            <Button onClick={handleExportCSV} variant="ghost" style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}>
              <Download className="w-3.5 h-3.5 mr-2" /> EXPORT CSV
            </Button>
            <Button onClick={handleInvite} style={{ background: '#00D4FF', color: '#080A0F', fontWeight: 700, fontSize: 11 }}>
              <Plus className="w-3.5 h-3.5 mr-2" /> INVITE EMPLOYEE
            </Button>
          </div>
        </div>

        <div className="animate-fade-up">
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24 }}>Employee Directory</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{companyDoc?.name || 'Demo Corp'} • {displayEmployees.length} staff members</p>
        </div>

        {/* Filter Cards */}
        <div className="grid grid-cols-3 gap-4 animate-fade-up delay-1">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const count = displayEmployees.filter(e => e.status === key).length;
            const isActive = filter === key;
            return (
              <Card 
                key={key}
                onClick={() => setFilter(isActive ? 'all' : key)}
                className="p-5 cursor-pointer transition-all"
                style={{ 
                  background: isActive ? `${config.color}08` : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${isActive ? `${config.color}40` : 'rgba(255,255,255,0.06)'}`
                }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <config.icon className="w-3.5 h-3.5" style={{ color: config.color }} />
                  <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{config.label}</p>
                </div>
                <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 28, color: config.color }}>{count}</p>
              </Card>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative animate-fade-up delay-2">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or role..."
            className="w-full h-12 pl-12 pr-4 rounded-xl bg-black/40 border border-black/50 text-white/70 placeholder:text-white/30 outline-none focus:ring-[#00D4FF]"
            style={{ fontSize: 14 }}
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl overflow-hidden animate-fade-up delay-3" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Role</th>
                <th>Score</th>
                <th>Maturity</th>
                <th>Status</th>
                <th>Joined</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((e, i) => (
                <tr key={i}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 font-bold" style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF', fontSize: 12 }}>
                        {e.name.split(' ').map((n: string)=>n[0]).join('')}
                      </div>
                      <div>
                        <p style={{ fontWeight: 600, color: '#E8EDF2' }}>{e.name}</p>
                        <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{e.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>{e.role}</td>
                  <td>
                    <span style={{ fontFamily: "'DM Mono', monospace", color: e.score >= 80 ? '#4ADE80' : e.score >= 65 ? '#FBC22D' : e.score > 0 ? '#F87171' : 'rgba(255,255,255,0.1)', fontWeight: 700 }}>
                      {e.score > 0 ? `${e.score}%` : '—'}
                    </span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: e.maturity >= 4 ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.05)', color: e.maturity >= 4 ? '#4ADE80' : 'rgba(255,255,255,0.4)' }}>
                      Lv.{e.maturity}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: STATUS_CONFIG[e.status as keyof typeof STATUS_CONFIG].color }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: STATUS_CONFIG[e.status as keyof typeof STATUS_CONFIG].color }}>{STATUS_CONFIG[e.status as keyof typeof STATUS_CONFIG].label}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{e.joined}</td>
                  <td style={{ textAlign: 'right' }}>
                    <div className="flex items-center justify-end gap-1">
                      <a href={`mailto:${e.email}`} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10 transition-colors tooltip" title="Message Employee">
                        <Mail className="w-4 h-4" />
                      </a>
                      <button onClick={() => handleRemove(e.id)} className="w-8 h-8 rounded-lg flex items-center justify-center text-white/20 hover:text-[#F87171] hover:bg-[#EF4444]/10 transition-colors tooltip" title="Remove Employee">
                        <UserX className="w-4 h-4" />
                      </button>
                    </div>
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