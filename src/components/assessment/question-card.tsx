"use client";

import React, { useState } from 'react';
import { Question } from '@/lib/types';
import { CheckCircle2, XCircle, BrainCircuit, ArrowRight } from 'lucide-react';
import { explainAssessmentAnswer } from '@/ai/flows/explain-assessment-answer';

interface QuestionCardProps {
  question: Question;
  onAnswer: (selectedId: string, isCorrect: boolean) => void;
  blockMode?: boolean;
  isLast?: boolean;
}

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

export function QuestionCard({ question, onAnswer, blockMode = false, isLast = false }: QuestionCardProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!selected || submitted) return;
    
    const isCorrect = selected === question.correctOptionId;

    if (blockMode) {
      // In block mode, we don't show the answer, we just submit and move on
      onAnswer(selected, isCorrect);
      // reset selected for the next question immediately
      setSelected(null);
      return;
    }

    setSubmitted(true);
    setLoading(true);
    try {
      const res = await explainAssessmentAnswer({
        questionText: question.questionText,
        options: question.options,
        correctOptionId: question.correctOptionId,
        selectedOptionId: selected,
      });
      setExplanation(res);
    } catch {
      setExplanation(question.explanation);
    } finally {
      setLoading(false);
    }
  };

  const isCorrect = selected === question.correctOptionId;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' }}>
        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-white/5" style={{ background: 'rgba(255,255,255,0.015)' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            {question.category.replace('_', ' ')}
          </span>
          <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)' }}>
            {question.difficulty}
          </span>
        </div>

        {/* Question */}
        <div className="p-8">
          <h2 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 18, color: '#E8EDF2', lineHeight: 1.5, marginBottom: 24 }}>
            {question.questionText}
          </h2>

          <div className="space-y-3">
            {question.options.map((opt, i) => {
              const isSelected = selected === opt.id;
              
              const isRight = !blockMode && submitted && opt.id === question.correctOptionId;
              const isWrong = !blockMode && submitted && isSelected && !isRight;
              const isOther = !blockMode && submitted && !isSelected && !isRight;

              let styles = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.7)' };
              
              if (isSelected && (!submitted || blockMode)) {
                styles = { background: 'rgba(0,212,255,0.07)', border: '1px solid #00D4FF', color: '#00D4FF' };
              } else if (isRight) {
                styles = { background: 'rgba(34,197,94,0.07)', border: '1px solid #22C55E', color: '#4ADE80' };
              } else if (isWrong) {
                styles = { background: 'rgba(239,68,68,0.07)', border: '1px solid #EF4444', color: '#F87171' };
              } else if (isOther) {
                styles = { background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', color: 'rgba(255,255,255,0.2)' };
              }

              return (
                <button
                  key={opt.id}
                  disabled={submitted && !blockMode} // in block mode we never freeze it completely before routing away
                  onClick={() => setSelected(opt.id)}
                  className="w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl transition-all"
                  style={{ ...styles }}
                  suppressHydrationWarning
                >
                  <span className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 font-bold" 
                    style={{ background: isSelected || isRight || isWrong ? 'currentColor' : 'rgba(255,255,255,0.05)', color: isSelected || isRight || isWrong ? '#080A0F' : 'rgba(255,255,255,0.2)', fontFamily: "'DM Mono', monospace" }}>
                    {OPTION_LABELS[i]}
                  </span>
                  <span className="flex-1 text-sm">{opt.text}</span>
                  {isRight && <CheckCircle2 className="w-5 h-5 shrink-0" />}
                  {isWrong && <XCircle className="w-5 h-5 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action */}
        <div className="px-8 pb-8">
          {!submitted || blockMode ? (
            <button
              onClick={handleSubmit}
              disabled={!selected}
              className="w-full h-12 rounded-xl font-bold uppercase tracking-widest transition-all"
              style={{ 
                background: selected ? '#00D4FF' : 'rgba(255,255,255,0.04)',
                color: selected ? '#080A0F' : 'rgba(255,255,255,0.2)',
                boxShadow: selected ? '0 0 20px rgba(0,212,255,0.25)' : 'none'
              }}
              suppressHydrationWarning
            >
              {blockMode ? (isLast ? 'Submit' : 'Next Question') : 'Confirm Answer'}
            </button>
          ) : (
            <div className="animate-fade-up">
              <div className="p-5 rounded-xl mb-4" style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <BrainCircuit className="w-4 h-4 text-[#00D4FF]" />
                  <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#00D4FF' }}>AI EXPLANATION</span>
                  <span className="ml-auto px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ background: isCorrect ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', color: isCorrect ? '#4ADE80' : '#F87171' }}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                {loading ? (
                  <div className="space-y-2">
                    <div className="h-3 rounded-full skeleton w-full" />
                    <div className="h-3 rounded-full skeleton w-[80%]" />
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{explanation}</p>
                )}
              </div>
              <button
                onClick={() => onAnswer(selected!, isCorrect)}
                className="w-full h-12 rounded-xl font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all"
                style={{ background: '#7B61FF', color: '#FFFFFF', boxShadow: '0 0 20px rgba(123,97,255,0.2)' }}
                suppressHydrationWarning
              >
                Continue Assessment <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}