"use client";

import React, { useState } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Search, Plus, Mail, MoreVertical, UserCheck, UserX, Download } from 'lucide-react';

const EMPLOYEES = [
  { name: 'Priya Sharma', email: 'priya@democorp.com', role: 'Developer', score: 94, maturity: 5, status: 'completed', joined: 'Dec 2024' },
  { name: 'Rahul Mehta', email: 'rahul@democorp.com', role: 'HR', score: 61, maturity: 2, status: 'completed', joined: 'Dec 2024' },
  { name: 'Ananya Patel', email: 'ananya@democorp.com', role: 'Manager', score: 78, maturity: 3, status: 'completed', joined: 'Nov 2024' },
  { name: 'Kiran Rao', email: 'kiran@democorp.com', role: 'IT Staff', score: 88, maturity: 4, status: 'completed', joined: 'Nov 2024' },
  { name: 'Deepak Singh', email: 'deepak@democorp.com', role: 'Developer', score: 45, maturity: 2, status: 'in_progress', joined: 'Jan 2025' },
  { name: 'Meera Nair', email: 'meera@democorp.com', role: 'Network Eng', score: 91, maturity: 5, status: 'completed', joined: 'Oct 2024' },
  { name: 'Arjun Kumar', email: 'arjun@democorp.com', role: 'General', score: 0, maturity: 1, status: 'not_started', joined: 'Jan 2025' },
  { name: 'Sneha Gupta', email: 'sneha@democorp.com', role: 'HR', score: 73, maturity: 3, status: 'completed', joined: 'Sep 2024' },
];

const STATUS_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  completed: { label: 'Completed', color: '#4ADE80', bg: 'rgba(34,197,94,0.1)' },
  in_progress: { label: 'In Progress', color: '#FBC22D', bg: 'rgba(245,158,11,0.1)' },
  not_started: { label: 'Not Started', color: '#F87171', bg: 'rgba(239,68,68,0.1)' },
};

const MATURITY_LABEL: Record<number, { label: string; color: string }> = {
  1: { label: 'Basic', color: '#F87171' }, 2: { label: 'Aware', color: '#FBC22D' },
  3: { label: 'Secure', color: '#00D4FF' }, 4: { label: 'Advanced', color: '#9B87FF' },
  5: { label: 'Enterprise', color: '#4ADE80' },
};

const scoreColor = (s: number) => s === 0 ? 'rgba(255,255,255,0.2)' : s >= 80 ? '#4ADE80' : s >= 65 ? '#FBC22D' : '#F87171';

export default function CompanyEmployees() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = EMPLOYEES.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || e.status === filter;
    return matchSearch && matchFilter;
  });

  const completed = EMPLOYEES.filter(e => e.status === 'completed').length;
  const inProgress = EMPLOYEES.filter(e => e.status === 'in_progress').length;
  const notStarted = EMPLOYEES.filter(e => e.status === 'not_started').length;

  return (
    <div className="flex min-h-screen bg-[#080A0F]" style={{ fontFamily: "'Inter',sans-serif" }}>
      <SidebarNav role="company" />

      <main className="flex-1 overflow-auto">
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 bg-[#080A0F]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Employee Management
          </p>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 h-8 rounded-xl text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}>
              <Download className="w-3.5 h-3.5" /> Export CSV
            </button>
            <button className="flex items-center gap-2 px-3 h-8 rounded-xl text-xs font-semibold"
              style={{ background: '#00D4FF', color: '#080A0F', boxShadow: '0 0 14px rgba(0,212,255,0.25)' }}>
              <Plus className="w-3.5 h-3.5" /> Invite Employee
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 pb-24 lg:pb-6">

          <div className="animate-fade-up">
            <h1 style={{ fontFamily: "'Sora',sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EDF2', letterSpacing: '-0.02em' }}>
              Employees
            </h1>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {EMPLOYEES.length} total employees • Demo Corp
            </p>
          </div>

          {/* Status cards */}
          <div className="grid grid-cols-3 gap-4 animate-fade-up delay-1">
            {[
              { label: 'Completed', value: completed, color: '#22C55E', status: 'completed' },
              { label: 'In Progress', value: inProgress, color: '#F59E0B', status: 'in_progress' },
              { label: 'Not Started', value: notStarted, color: '#EF4444', status: 'not_started' },
            ].map(({ label, value, color, status: s }) => (
              <button key={s} onClick={() => setFilter(filter === s ? 'all' : s)}
                className="p-5 rounded-2xl text-left transition-all"
                style={{
                  background: filter === s ? `${color}10` : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${filter === s ? `${color}35` : 'rgba(255,255,255,0.06)'}`,
                }}>
                <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 8 }}>
                  {label}
                </p>
                <p style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500, fontSize: 28, color }}>
                  {value}
                </p>
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative animate-fade-up delay-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'rgba(255,255,255,0.25)' }} />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full h-10 pl-10 pr-4 rounded-xl text-sm"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#E8EDF2', outline: 'none' }}
              onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.3)'; }}
              onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.07)'; }}
            />
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden animate-fade-up delay-3"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="data-table">
              <thead><tr>
                <th>Employee</th><th>Role</th><th>Score</th><th>Maturity</th>
                <th>Status</th><th>Joined</th><th style={{ textAlign: 'right' }}>Actions</th>
              </tr></thead>
              <tbody>
                {filtered.map((e, i) => {
                  const st = STATUS_STYLE[e.status];
                  const ml = MATURITY_LABEL[e.maturity];
                  return (
                    <tr key={i} className="table-row-hover">
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold"
                            style={{ background: 'rgba(0,212,255,0.1)', color: '#00D4FF' }}>
                            {e.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 500, color: '#E8EDF2' }}>{e.name}</p>
                            <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{e.email}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.45)' }}>{e.role}</td>
                      <td>
                        <span style={{ fontFamily: "'DM Mono',monospace", fontWeight: 500, color: scoreColor(e.score) }}>
                          {e.score > 0 ? `${e.score}%` : '—'}
                        </span>
                      </td>
                      <td>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{ background: `${ml.color}12`, color: ml.color }}>
                          {ml.label}
                        </span>
                      </td>
                      <td>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{ background: st.bg, color: st.color }}>
                          {st.label}
                        </span>
                      </td>
                      <td style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{e.joined}</td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          {e.status === 'not_started' && (
                            <button className="flex items-center gap-1.5 px-2.5 h-7 rounded-lg text-[10px] font-semibold transition-all"
                              style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
                              <Mail className="w-3 h-3" /> Remind
                            </button>
                          )}
                          <button className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ color: 'rgba(255,255,255,0.25)' }}
                            onMouseEnter={e2 => { e2.currentTarget.style.color = '#F87171'; e2.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
                            onMouseLeave={e2 => { e2.currentTarget.style.color = 'rgba(255,255,255,0.25)'; e2.currentTarget.style.background = ''; }}
                          >
                            <UserX className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
