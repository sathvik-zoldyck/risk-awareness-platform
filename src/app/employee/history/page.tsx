"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { StatCard } from '@/components/dashboard/stat-card';
import {
  ArrowUpRight, TrendingUp, TrendingDown, Minus, Clock, Calendar, Settings, LogOut, Key, Edit, Loader2, ClipboardList
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { getAuth, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { doc, collection, query, where } from 'firebase/firestore';

// ── Module label mapping ─────────────────────────────────────────────────────
const MODULE_LABELS: Record<string, string> = {
  basic:      'Basic Cybersecurity',
  role_based: 'Role-Based Security',
  dpdp:       'DPDP Compliance',
  scenario:   'Scenario Thinking',
};

const MATURITY_COLORS: Record<number, string> = {
  1: '#F87171', 2: '#FBC22D', 3: '#00D4FF', 4: '#9B87FF', 5: '#4ADE80',
};

const getScoreColor = (s: number) => s >= 80 ? '#4ADE80' : s >= 65 ? '#FBC22D' : '#F87171';

function formatDate(ts: any): string {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

// ── Attempt document type ────────────────────────────────────────────────────
interface AttemptDoc {
  id: string;
  userId: string;
  moduleType: string;
  completedAt: any;
  durationSeconds: number;
  totalQuestions: number;
  correctCount: number;
  score: number;
  maturityLevel: number;
}

export default function EmployeeHistory() {
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);

  // ── User doc ──────────────────────────────────────────────────────────────
  const userDocRef = useMemoFirebase(() => {
    return user ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  const userName = userDoc?.name ? userDoc.name.split(' ')[0] : 'User';
  const roleName = userDoc?.jobRole || 'Employee';

  // ── Assessment attempts — live collection listener ────────────────────────
  const attemptsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(
      collection(firestore, 'assessment_attempts'),
      where('userId', '==', user.uid)
    );
  }, [user, firestore]);

  const { data: attemptsRaw, isLoading: attemptsLoading } = useCollection<AttemptDoc>(attemptsQuery);
  // Sort client-side newest first (avoids needing a composite Firestore index)
  const attempts = [...(attemptsRaw ?? [])].sort((a, b) => {
    const ta = a.completedAt?.toMillis?.() ?? 0;
    const tb = b.completedAt?.toMillis?.() ?? 0;
    return tb - ta;
  }) as AttemptDoc[];

  // ── Compute stats from real data ──────────────────────────────────────────
  const best = attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0;
  const avg  = attempts.length > 0 ? Math.round(attempts.reduce((s, a) => s + a.score, 0) / attempts.length) : 0;

  // ── Per-row delta: compare score vs previous attempt of same moduleType ───
  const getDelta = (attempt: AttemptDoc, idx: number): number | null => {
    const prev = attempts.slice(idx + 1).find(a => a.moduleType === attempt.moduleType);
    if (!prev) return null;
    return attempt.score - prev.score;
  };

  // ── Auth handlers ─────────────────────────────────────────────────────────
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
        {/* ── Top bar ───────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-[#080A0F]/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5 mb-6">
          <p className="section-label">Employee Portal • Assessment History</p>
          <div className="flex items-center gap-4">
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
                    <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/70 hover:text-white hover:bg-white/5 transition-colors text-left">
                      <Edit className="w-4 h-4 text-white/40" /> Edit Profile (Soon)
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

        <div className="animate-fade-up">
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24 }}>History</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
            {attemptsLoading ? 'Loading...' : `${attempts.length} assessment${attempts.length !== 1 ? 's' : ''} archived`}
          </p>
        </div>

        {/* ── Top Stats ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 animate-fade-up delay-1">
          <StatCard label="Best Score"   value={attempts.length > 0 ? `${best}%` : '—'} />
          <StatCard label="Average"      value={attempts.length > 0 ? `${avg}%`  : '—'} />
          <StatCard label="Total Taken"  value={attempts.length} />
        </div>

        {/* ── Loading skeleton ──────────────────────────────────────────── */}
        {attemptsLoading && (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-up">
            <Loader2 className="w-8 h-8 text-[#00D4FF] animate-spin mb-3" />
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>Fetching your assessment history...</p>
          </div>
        )}

        {/* ── Empty state ───────────────────────────────────────────────── */}
        {!attemptsLoading && attempts.length === 0 && (
          <Card className="p-12 flex flex-col items-center justify-center text-center animate-fade-up"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <ClipboardList className="w-12 h-12 text-white/10 mb-4" />
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18, color: '#E8EDF2', marginBottom: 8 }}>
              No Assessments Yet
            </h3>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.35)', lineHeight: 1.6, maxWidth: 360 }}>
              Complete your first assessment module and your full history will appear here automatically.
            </p>
            <Link href="/employee/assessment" className="mt-6">
              <button className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:opacity-80"
                style={{ background: '#00D4FF', color: '#080A0F' }}>
                Start an Assessment
              </button>
            </Link>
          </Card>
        )}

        {/* ── History Table ─────────────────────────────────────────────── */}
        {!attemptsLoading && attempts.length > 0 && (
          <div className="rounded-2xl overflow-hidden animate-fade-up delay-2"
            style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Module</th>
                  <th>Score</th>
                  <th>Maturity</th>
                  <th>Duration</th>
                  <th>Trend</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {attempts.map((h, i) => {
                  const delta = getDelta(h, i);
                  return (
                    <tr key={h.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 opacity-30" />
                          <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: 500 }}>{formatDate(h.completedAt)}</span>
                        </div>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>
                        {MODULE_LABELS[h.moduleType] ?? h.moduleType}
                      </td>
                      <td>
                        <span style={{ fontFamily: "'DM Mono', monospace", color: getScoreColor(h.score), fontWeight: 700 }}>
                          {h.score}%
                        </span>
                      </td>
                      <td>
                        <span className="badge"
                          style={{
                            background: `${MATURITY_COLORS[h.maturityLevel as keyof typeof MATURITY_COLORS] ?? '#00D4FF'}15`,
                            color: MATURITY_COLORS[h.maturityLevel as keyof typeof MATURITY_COLORS] ?? '#00D4FF'
                          }}>
                          Level {h.maturityLevel}
                        </span>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 opacity-20" />
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>{formatDuration(h.durationSeconds)}</span>
                        </div>
                      </td>
                      <td>
                        {delta === null ? (
                          <span className="text-white/10">—</span>
                        ) : (
                          <div className={`flex items-center gap-1.5 text-[11px] font-bold ${delta >= 0 ? 'text-[#4ADE80]' : 'text-[#F87171]'}`}>
                            {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
                            {delta > 0 ? '+' : ''}{delta}%
                          </div>
                        )}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <Link href={`/employee/results?attemptId=${h.id}`}>
                          <button className="w-8 h-8 rounded-lg flex items-center justify-center transition-all text-white/20 hover:text-[#00D4FF] hover:bg-[#00D4FF]/10">
                            <ArrowUpRight className="w-4 h-4" />
                          </button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}