"use client";

import React, { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, ArrowLeft, BrainCircuit, Info, MessageSquare, Clock, Lock } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { QuestionCard } from '@/components/assessment/question-card';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useUser, useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';

const SECTIONS: Record<string, any> = {
  basic:      { id: 'basic',      name: 'Basic Cybersecurity', short: 'Basic',    icon: Shield,        color: '#22C55E' },
  role_based: { id: 'role_based', name: 'Role-Based Security', short: 'Role',     icon: BrainCircuit,  color: '#00D4FF' },
  dpdp:       { id: 'dpdp',       name: 'DPDP Compliance',     short: 'DPDP',     icon: Info,          color: '#7B61FF' },
  scenario:   { id: 'scenario',   name: 'Scenario Thinking',   short: 'Scenario', icon: MessageSquare, color: '#F59E0B' },
};

function deriveMaturityLevel(pct: number): number {
  if (pct >= 90) return 5;
  if (pct >= 75) return 4;
  if (pct >= 60) return 3;
  if (pct >= 40) return 2;
  return 1;
}

function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const secondsRef = useRef(0);
  useEffect(() => {
    const id = setInterval(() => {
      secondsRef.current += 1;
      setSeconds(secondsRef.current);
    }, 1000);
    return () => clearInterval(id);
  }, []);
  const m = String(Math.floor(seconds / 60)).padStart(2, '0');
  const s = String(seconds % 60).padStart(2, '0');
  return { display: `${m}:${s}`, totalSeconds: secondsRef };
}

function TakeAssessmentImpl() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { display: timerDisplay, totalSeconds } = useTimer();

  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    return user ? doc(firestore, 'users', user.uid) : null;
  }, [user, firestore]);
  const { data: userDoc } = useDoc(userDocRef);

  const typeParam = searchParams.get('type') || 'basic';
  const section = SECTIONS[typeParam] || SECTIONS['basic'];

  const questionsColRef = useMemoFirebase(() => collection(firestore, 'questions'), [firestore]);
  const { data: realQuestions } = useCollection(questionsColRef);

  const blockQuestions = useMemo(() => {
     return (realQuestions || []).filter((q: any) => q.category === section.id);
  }, [realQuestions, section.id]);

  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, { selectedId: string; isCorrect: boolean }>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalQ = blockQuestions.length;

  if (totalQ === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#080A0F]">
        <Lock className="w-12 h-12 text-white/20 mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Module Locked</h2>
        <p className="text-white/40 mb-6">No questions have been configured for this module yet.</p>
        <button onClick={() => router.back()} className="px-6 py-2 bg-white/5 rounded-xl text-white/60 hover:text-white border border-white/10 hover:bg-white/10 transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  const pct = Math.round(((qIdx) / totalQ) * 100);
  const currentQuestion = blockQuestions[qIdx];

  const handleAnswer = async (selId: string, isCorrect: boolean) => {
    const updatedAnswers = { ...answers, [currentQuestion.id]: { selectedId: selId, isCorrect } };
    setAnswers(updatedAnswers);

    const isLastQuestion = qIdx >= totalQ - 1;

    if (!isLastQuestion) {
      setTimeout(() => setQIdx(q => q + 1), 400);
      return;
    }

    // ── Final question: write to Firestore ──
    setIsSubmitting(true);
    toast({ title: 'Module Completed!', description: 'Saving your results...', duration: 3000 });

    const correctCount = Object.values(updatedAnswers).filter((a: any) => a.isCorrect).length;
    const scorePct = Math.round((correctCount / totalQ) * 100);
    const maturityLevel = deriveMaturityLevel(scorePct);

    const responses = blockQuestions.map((q: any) => ({
      questionId: q.id,
      questionText: q.questionText,
      correctOptionId: q.correctOptionId,
      selectedOptionId: (updatedAnswers as any)[q.id]?.selectedId ?? '',
      isCorrect: (updatedAnswers as any)[q.id]?.isCorrect ?? false,
    }));

    try {
      const attemptDoc = {
        userId: user?.uid ?? '',
        companyId: userDoc?.companyId ?? '',
        moduleType: typeParam,
        completedAt: serverTimestamp(),
        durationSeconds: totalSeconds.current,
        totalQuestions: totalQ,
        correctCount,
        score: scorePct,
        maturityLevel,
        responses,
      };

      const docRef = await addDoc(collection(firestore, 'assessment_attempts'), attemptDoc);
      
      // Update global user telemetry securely
      if (user) {
        await updateDoc(doc(firestore, 'users', user.uid), {
           score: scorePct,
           maturity: maturityLevel
        });
      }

      router.push(`/employee/results?attemptId=${docRef.id}`);
    } catch (err: any) {
      console.error('Failed to save attempt:', err);
      toast({ title: 'Save Error', description: 'Could not save your results. Please try again.', variant: 'destructive' });
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080A0F] bg-grid" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 flex items-center gap-4 px-5 h-16"
        style={{ background: 'rgba(8,10,15,0.95)', backdropFilter: 'blur(16px)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>

        <div className="flex items-center gap-4 border-r border-white/5 pr-4">
          <button onClick={() => router.back()}
            suppressHydrationWarning
            className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <ArrowLeft className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.6)' }} />
          </button>
          
          <div className="hidden sm:flex items-center gap-2 px-1">
            <Logo size={24} />
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: '-0.02em', color: '#E8EDF2' }}>
              ALCYONE
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center hidden sm:flex"
            style={{ background: `${section.color}15`, border: `1px solid ${section.color}30` }}>
            <section.icon className="w-5 h-5" style={{ color: section.color }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#E8EDF2', lineHeight: 1.2 }}>{section.name}</p>
            <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              Active Module
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="flex-1 max-w-lg mx-auto hidden md:block">
          <div className="flex justify-between mb-1.5">
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Module Progress
            </span>
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 10, color: section.color }}>
              {qIdx}/{totalQ} questions
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-white/5">
            <div className="h-full rounded-full transition-all duration-500 shadow-[0_0_10px_rgba(255,255,255,0.2)]"
              style={{ width: `${pct}%`, background: section.color }} />
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 text-white/50">
            <Clock className="w-4 h-4" />
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 14, fontWeight: 600 }}>{timerDisplay}</span>
          </div>
          {isSubmitting && (
            <div className="flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-bold"
              style={{ background: `${section.color}15`, border: `1px solid ${section.color}30`, color: section.color }}>
              <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              SAVING...
            </div>
          )}
        </div>
      </header>

      <main className="flex flex-col items-center px-4 py-8 pb-32 lg:pb-12 mt-6">
        {/* ── Section heading ── */}
        <div className="w-full max-w-2xl mb-8 flex items-center justify-between animate-fade-up">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
              Question {qIdx + 1}
            </h2>
            <p className="text-white/40 text-sm">Please select the most appropriate protocol.</p>
          </div>
          <div className="text-right">
            <p style={{ fontFamily: "'DM Mono', monospace", fontSize: 24, fontWeight: 700, color: section.color }}>
              {qIdx + 1}
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.2)' }}>/{totalQ}</span>
            </p>
          </div>
        </div>

        {/* ── Question card ── */}
        <div className="w-full max-w-2xl animate-fade-up delay-1">
          <QuestionCard question={currentQuestion} onAnswer={handleAnswer} blockMode={true} isLast={qIdx === totalQ - 1} />
        </div>

        <p className="mt-8 text-center text-xs w-full max-w-md animate-fade-up delay-2" style={{ color: 'rgba(255,255,255,0.2)', lineHeight: 1.6 }}>
          Your answers are strictly confidential and mapped to your overarching cyber maturity index. Answer truthfully based on your standard operating procedures.
        </p>
      </main>
    </div>
  );
}

export default function TakeAssessmentPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080A0F] flex items-center justify-center text-white/50 animate-pulse">Initializing Module...</div>}>
      <TakeAssessmentImpl />
    </Suspense>
  );
}
