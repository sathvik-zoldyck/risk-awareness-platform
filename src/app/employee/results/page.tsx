"use client";

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { ScoreRing } from '@/components/ui/score-ring';
import { MaturityBadge } from '@/components/ui/maturity-badge';
import {
  Trophy, RotateCcw, Download, Share2, Lock, FileText,
  Settings, LogOut, Key, Edit, ChevronDown, ChevronUp, CheckCircle2, XCircle, Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAuth, signOut, sendPasswordResetEmail } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { generatePersonalRecommendations } from '@/ai/flows/generate-personal-recommendations';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, doc } from 'firebase/firestore';
import jsPDF from 'jspdf';

// ── Module metadata (labels / colors only – no fake scores) ──────────────────
const MODULE_META: Record<string, { label: string; color: string }> = {
  basic:      { label: 'Basic Cybersecurity', color: '#22C55E' },
  role_based: { label: 'Role-Based Security',  color: '#00D4FF' },
  dpdp:       { label: 'DPDP Compliance',       color: '#7B61FF' },
  scenario:   { label: 'Scenario Thinking',     color: '#F59E0B' },
};

// ── Badge definitions (thresholds only – earned state computed from real score) ──
const BADGE_DEFS = [
  { name: 'Basic Shield',   icon: '🛡', module: 'basic',      desc: 'Basic ≥ 80%'    },
  { name: 'DPDP Aware',     icon: '📋', module: 'dpdp',       desc: 'DPDP ≥ 80%'    },
  { name: 'Risk Thinker',   icon: '⚠️', module: 'scenario',   desc: 'Scenario ≥ 80%' },
  { name: 'Role Expert',    icon: '💻', module: 'role_based',  desc: 'Role ≥ 80%'    },
];

function formatDuration(seconds: number): string {
  if (!seconds) return '—';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

function formatDate(ts: any): string {
  if (!ts) return '—';
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Type for an attempt document ─────────────────────────────────────────────
interface AttemptDoc {
  userId: string;
  companyId?: string;
  moduleType: string;
  completedAt: any;
  durationSeconds: number;
  totalQuestions: number;
  correctCount: number;
  score: number;
  maturityLevel: number;
  responses: {
    questionId: string;
    questionText: string;
    selectedOptionId: string;
    correctOptionId: string;
    isCorrect: boolean;
  }[];
}

// ── Per-section breakdown computed from attempt.responses + local question bank ──
function deriveSection(attempt: AttemptDoc) {
  const category = attempt.moduleType;
  const meta = MODULE_META[category] ?? { label: category, color: '#00D4FF' };
  const total = attempt.totalQuestions;
  const correct = attempt.correctCount;
  const pct = attempt.score;
  return [{ label: meta.label, pct, color: meta.color, correct, total }];
}

// ── Wrong-answer breakdown ────────────────────────────────────────────────────
function WrongAnswerCard({ response, questions }: { response: AttemptDoc['responses'][0], questions: any[] }) {
  const [open, setOpen] = useState(false);

  // Look up answer text from question bank
  const question = questions.find(q => q.id === response.questionId);
  const selectedText = question?.options?.find((o: any) => o.id === response.selectedOptionId)?.text ?? response.selectedOptionId;
  const correctText  = question?.options?.find((o: any) => o.id === response.correctOptionId)?.text  ?? response.correctOptionId;

  return (
    <div className="rounded-xl border overflow-hidden transition-all"
      style={{ background: 'rgba(248,113,113,0.04)', borderColor: 'rgba(248,113,113,0.15)' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-start gap-3 p-4 text-left"
      >
        <XCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#F87171' }} />
        <p className="flex-1 text-sm text-white/70 leading-relaxed">{response.questionText}</p>
        {open ? <ChevronUp className="w-4 h-4 shrink-0 text-white/20 mt-0.5" /> : <ChevronDown className="w-4 h-4 shrink-0 text-white/20 mt-0.5" />}
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-2 animate-fade-up">
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(248,113,113,0.08)' }}>
            <XCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#F87171]" />
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>You answered</p>
              <p style={{ fontSize: 13, color: '#F87171' }}>{selectedText}</p>
            </div>
          </div>
          <div className="flex items-start gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(34,197,94,0.08)' }}>
            <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 text-[#22C55E]" />
            <div>
              <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Correct answer</p>
              <p style={{ fontSize: 13, color: '#22C55E' }}>{correctText}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Inner component (uses searchParams) ──────────────────────────────────────
function ResultsImpl() {
  const searchParams = useSearchParams();
  const attemptId = searchParams.get('attemptId');

  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [aiRecs, setAiRecs] = useState<string[]>([]);
  const [aiLoading, setAiLoading] = useState(false);

  const questionsColRef = useMemoFirebase(() => collection(firestore, 'questions'), [firestore]);
  const { data: realQuestions } = useCollection(questionsColRef);
  const questions = realQuestions || [];

  // ── User doc ──────────────────────────────────────────────────────────────
  const userDocRef = useMemoFirebase(() => {
    return user ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  // ── Attempt doc ───────────────────────────────────────────────────────────
  const attemptDocRef = useMemoFirebase(() => {
    return attemptId ? doc(firestore, 'assessment_attempts', attemptId) : null;
  }, [attemptId, firestore]);
  const { data: attemptRaw, isLoading: attemptLoading } = useDoc(attemptDocRef);
  const attempt = attemptRaw as AttemptDoc | null;

  const userName = userDoc?.name ? userDoc.name.split(' ')[0] : 'User';
  const roleName = userDoc?.jobRole || 'Employee';
  const companyName = userDoc?.companyName || '';

  // ── Fetch AI recommendations once attempt is loaded ───────────────────────
  useEffect(() => {
    if (!attempt) return;
    setAiLoading(true);
    const scorePayload = {
      moduleType: attempt.moduleType,
      score: attempt.score,
      correctCount: attempt.correctCount,
      totalQuestions: attempt.totalQuestions,
      wrongQuestions: attempt.responses
        .filter(r => !r.isCorrect)
        .map(r => r.questionText),
    };
    generatePersonalRecommendations({ scores: scorePayload })
      .then(res => setAiRecs(res.recommendations ?? []))
      .catch(() => setAiRecs([]))
      .finally(() => setAiLoading(false));
  }, [attempt?.userId, attempt?.moduleType, attempt?.score]); // eslint-disable-line

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

  const handleShare = async () => {
    try {
      const text = attempt
        ? `I just scored ${attempt.score}% (Maturity Level ${attempt.maturityLevel}) on my ${MODULE_META[attempt.moduleType]?.label ?? attempt.moduleType} assessment!`
        : 'Check out my cybersecurity assessment results!';
      if (navigator.share) {
        await navigator.share({ title: 'Assessment Results', text, url: window.location.origin });
      } else {
        await navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: 'Results summary copied to clipboard.' });
      }
    } catch { /* dismissed */ }
  };

  // ── PDF export ────────────────────────────────────────────────────────────
  const handleExportPDF = () => {
    if (!attempt) return;
    setIsExporting(true);
    toast({ title: 'Generating Certificate', description: 'Please wait...', duration: 2000 });
    setTimeout(() => {
      try {
        const docPDF = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
        docPDF.setFillColor(8, 10, 15);
        docPDF.rect(0, 0, 210, 297, 'F');
        docPDF.setTextColor(255, 255, 255);
        docPDF.setFontSize(24);
        docPDF.text('Alcyone Secure', 20, 30);
        docPDF.setFontSize(14);
        docPDF.setTextColor(0, 212, 255);
        docPDF.text('OFFICIAL COMPLETION CERTIFICATE', 20, 42);
        docPDF.setTextColor(255, 255, 255);
        docPDF.setFontSize(12);
        docPDF.text(`Name: ${userDoc?.name ?? 'Authorized User'}`, 20, 60);
        docPDF.text(`Role: ${roleName}`, 20, 70);
        docPDF.text(`Module: ${MODULE_META[attempt.moduleType]?.label ?? attempt.moduleType}`, 20, 80);
        docPDF.text(`Score: ${attempt.score}% — Maturity Level ${attempt.maturityLevel}`, 20, 90);
        docPDF.text(`Date: ${formatDate(attempt.completedAt)}`, 20, 100);
        docPDF.setDrawColor(255, 255, 255);
        docPDF.setLineWidth(0.5);
        docPDF.line(20, 112, 190, 112);
        docPDF.setFontSize(10);
        docPDF.text('This verifies successful completion of the cybersecurity audit modules.', 20, 122);
        docPDF.save(`Alcyone_Certificate_${userName}.pdf`);
        toast({ title: 'Success', description: 'Certificate downloaded.' });
      } catch (err: any) {
        toast({ title: 'Error', description: err.message, variant: 'destructive' });
      } finally {
        setIsExporting(false);
      }
    }, 800);
  };

  // ── Loading / no attempt state ────────────────────────────────────────────
  const modMeta = attempt ? (MODULE_META[attempt.moduleType] ?? { label: attempt.moduleType, color: '#00D4FF' }) : null;
  const sections = attempt ? deriveSection(attempt) : [];
  const wrongResponses = attempt ? attempt.responses.filter(r => !r.isCorrect) : [];
  const correctResponses = attempt ? attempt.responses.filter(r => r.isCorrect) : [];

  const maturityLabel = (lvl: number) => {
    const m: Record<number, string> = { 1: 'Beginner', 2: 'Developing', 3: 'Proficient', 4: 'Advanced', 5: 'Expert' };
    return m[lvl] ?? 'Proficient';
  };

  const overallLabel = attempt
    ? (attempt.score >= 80 ? 'Strong Performance' : attempt.score >= 60 ? 'Solid Effort' : 'Needs Improvement')
    : '';

  const overallSummary = attempt
    ? (attempt.score >= 80
        ? `Excellent work on the ${modMeta?.label} module. You demonstrated strong command of the material.`
        : attempt.score >= 60
          ? `Good effort on ${modMeta?.label}. A few areas need reinforcement — review the breakdown below.`
          : `Your ${modMeta?.label} score needs improvement. Focus on the missed questions listed below.`)
    : '';

  // Computed badges from real score
  const badges = BADGE_DEFS.map(b => ({
    ...b,
    earned: attempt?.moduleType === b.module ? attempt.score >= 80 : false,
  }));

  return (
    <div className="flex min-h-screen bg-[#080A0F] bg-grid">
      <SidebarNav role="employee" />

      <main className="flex-1 overflow-auto p-6 space-y-5 pb-24 lg:pb-6">
        {/* ── Top bar ────────────────────────────────────────────────────── */}
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-[#080A0F]/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5 mb-6">
          <p className="section-label">Employee Portal • Assessment Results</p>
          <div className="flex items-center gap-4">
            <Button onClick={handleShare} variant="ghost"
              style={{ background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', fontSize: 11 }}
              className="h-9">
              <Share2 className="w-3.5 h-3.5 mr-2" /> SHARE
            </Button>
            <Button onClick={handleExportPDF} disabled={isExporting || !attempt}
              style={{ background: '#00D4FF', color: '#080A0F', fontWeight: 700, fontSize: 11 }}
              className="h-9">
              <Download className="w-3.5 h-3.5 mr-2" /> {isExporting ? 'EXPORTING...' : 'EXPORT PDF'}
            </Button>
            <div className="w-px h-6 bg-white/10 mx-1" />
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

        {/* ── Loading state ─────────────────────────────────────────────── */}
        {(attemptLoading || (!attempt && attemptId)) && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-up">
            <Loader2 className="w-10 h-10 text-[#00D4FF] animate-spin mb-4" />
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14 }}>Loading your results...</p>
          </div>
        )}

        {/* ── No attempt ID (navigated directly) ───────────────────────── */}
        {!attemptId && !attemptLoading && (
          <div className="flex flex-col items-center justify-center py-32 animate-fade-up text-center">
            <Trophy className="w-12 h-12 text-white/10 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">No Results Yet</h2>
            <p className="text-white/40 mb-6 text-sm">Complete an assessment module to see your results here.</p>
            <Link href="/employee/assessment">
              <Button style={{ background: '#00D4FF', color: '#080A0F', fontWeight: 700, fontSize: 12 }}>
                Start an Assessment
              </Button>
            </Link>
          </div>
        )}

        {/* ── Results content ───────────────────────────────────────────── */}
        {attempt && (
          <>
            <div className="animate-fade-up">
              <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24 }}>Your Results</h1>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                {formatDate(attempt.completedAt)} • {roleName} Role{companyName ? ` • ${companyName}` : ''}
              </p>
            </div>

            {/* Hero Score Card */}
            <div className="p-px rounded-2xl animate-fade-up delay-1"
              style={{ background: `linear-gradient(135deg, ${modMeta!.color}30 0%, rgba(123,97,255,0.2) 50%, rgba(34,197,94,0.1) 100%)` }}>
              <Card className="p-8 border-none flex flex-col md:flex-row items-center gap-10" style={{ background: '#0C0F16' }}>
                <ScoreRing percent={attempt.score} size={160} strokeWidth={12} label={maturityLabel(attempt.maturityLevel)} />

                <div className="flex-1 space-y-4 text-center md:text-left">
                  <MaturityBadge level={(Math.min(5, Math.max(1, attempt.maturityLevel)) as 1 | 2 | 3 | 4 | 5)} />
                  <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 28 }}>{overallLabel}</h2>
                  <p style={{ color: 'rgba(255,255,255,0.4)', lineHeight: 1.7, maxWidth: 440 }}>{overallSummary}</p>
                  <Link href="/employee/assessment">
                    <Button variant="ghost" className="mt-2"
                      style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.7)', border: '1px solid rgba(255,255,255,0.1)' }}>
                      <RotateCcw className="w-3.5 h-3.5 mr-2" /> Retake Assessment
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-3 shrink-0">
                  {[
                    { label: 'Module',    value: modMeta!.label.split(' ')[0], color: modMeta!.color },
                    { label: 'Maturity',  value: `Lvl ${attempt.maturityLevel}`, color: '#7B61FF' },
                    { label: 'Correct',   value: `${attempt.correctCount}/${attempt.totalQuestions}`, color: '#22C55E' },
                    { label: 'Time',      value: formatDuration(attempt.durationSeconds), color: '#F59E0B' },
                  ].map((stat, i) => (
                    <div key={i} className="p-4 rounded-xl text-center border"
                      style={{ background: `${stat.color}08`, borderColor: `${stat.color}20`, minWidth: 100 }}>
                      <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase' }}>{stat.label}</p>
                      <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 20, color: stat.color }}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            {/* Section Breakdown (single module) */}
            <div className="grid grid-cols-1 gap-4 animate-fade-up delay-2">
              {sections.map((s, i) => (
                <Card key={i} className="p-5 flex items-center gap-6"
                  style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div>
                    <p style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', marginBottom: 8 }}>{s.label}</p>
                    <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 40, fontWeight: 500, color: s.color, lineHeight: 1 }}>{s.pct}%</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{s.correct}/{s.total} correct</p>
                  </div>
                  <div className="flex-1">
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${s.pct}%`, background: s.color }} />
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Achievements & Recommendations */}
            <div className="grid lg:grid-cols-2 gap-5 animate-fade-up delay-3">
              <Card className="p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16 }}>Achievements</h3>
                  <Trophy className="w-4 h-4 text-[#7B61FF]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {badges.map((b, i) => (
                    <div key={i} className="relative p-4 rounded-xl flex flex-col items-center text-center border transition-all"
                      style={{
                        background: b.earned ? 'rgba(123,97,255,0.06)' : 'rgba(255,255,255,0.02)',
                        borderColor: b.earned ? 'rgba(123,97,255,0.2)' : 'rgba(255,255,255,0.04)',
                        opacity: b.earned ? 1 : 0.4
                      }}>
                      {!b.earned && <Lock className="absolute top-2 right-2 w-2.5 h-2.5 text-white/20" />}
                      <span style={{ fontSize: 24, marginBottom: 8 }}>{b.icon}</span>
                      <p style={{ fontSize: 10, fontWeight: 700, color: '#E8EDF2' }}>{b.name}</p>
                      <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.25)', marginTop: 4 }}>{b.desc}</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16 }}>AI Recommendations</h3>
                  <FileText className="w-4 h-4 text-[#00D4FF]" />
                </div>
                {aiLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-14 rounded-xl animate-pulse" style={{ background: 'rgba(255,255,255,0.04)' }} />
                    ))}
                  </div>
                ) : aiRecs.length > 0 ? (
                  <div className="space-y-3">
                    {aiRecs.map((r, i) => {
                      const colors = ['#F59E0B', '#00D4FF', '#22C55E', '#7B61FF', '#F87171'];
                      const color = colors[i % colors.length];
                      return (
                        <div key={i} className="p-4 rounded-xl flex gap-4 border"
                          style={{ background: `${color}05`, borderColor: `${color}15` }}>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: `${color}15`, color, fontSize: 10, fontWeight: 700 }}>{i + 1}</div>
                          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{r}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>No recommendations generated.</p>
                )}
              </Card>
            </div>

            {/* Wrong Answer Breakdown */}
            {wrongResponses.length > 0 && (
              <div className="animate-fade-up">
                <Card className="p-6" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16 }}>Question Breakdown</h3>
                      <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>
                        {correctResponses.length} correct · {wrongResponses.length} missed — tap a question to expand
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold"
                        style={{ background: 'rgba(34,197,94,0.1)', color: '#22C55E' }}>
                        <CheckCircle2 className="w-3 h-3" /> {correctResponses.length}
                      </span>
                      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold"
                        style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171' }}>
                        <XCircle className="w-3 h-3" /> {wrongResponses.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {wrongResponses.map((r, i) => (
                      <WrongAnswerCard key={i} response={r} questions={questions} />
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {/* Perfect score — no wrong answers */}
            {wrongResponses.length === 0 && attempt && (
              <Card className="p-6 flex items-center gap-4 animate-fade-up"
                style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.15)' }}>
                <CheckCircle2 className="w-8 h-8 text-[#22C55E] shrink-0" />
                <div>
                  <p style={{ fontWeight: 700, color: '#22C55E', fontSize: 15 }}>Perfect Score!</p>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>
                    You answered every question correctly in this module.
                  </p>
                </div>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default function EmployeeResults() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen bg-[#080A0F] items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#00D4FF] animate-spin" />
      </div>
    }>
      <ResultsImpl />
    </Suspense>
  );
}