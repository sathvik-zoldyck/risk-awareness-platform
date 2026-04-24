"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Shield, Zap } from 'lucide-react';
import { dpdpChat } from '@/ai/flows/dpdp-compliance-chatbot';
import { Logo } from '@/components/common/Logo';

const SUGGESTIONS = [
  'What is the DPDP Act 2023?',
  'Penalty for non-compliance?',
  'Role of Data Fiduciaries?',
  'Employee training rules?'
];

export function DPDPBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMsgs] = useState<{ role: 'user' | 'model'; text: string }[]>([
    { role: 'model', text: "Hello! I'm your DPDP compliance assistant. How can I help you navigate the 2023 Act today?" },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput('');
    setMsgs(p => [...p, { role: 'user', text: msg }]);
    setLoading(true);
    try {
      const res = await dpdpChat({ 
        message: msg, 
        history: messages.slice(-6).map(m => ({ role: m.role, content: m.text })) 
      });
      setMsgs(p => [...p, { role: 'model', text: res.response }]);
    } catch {
      setMsgs(p => [...p, { role: 'model', text: 'I encountered an error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!open && (
        <button 
          onClick={() => setOpen(true)}
          className="w-14 h-14 rounded-2xl flex items-center justify-center transition-all animate-breathe"
          style={{ 
            background: 'linear-gradient(135deg, #00D4FF, #7B61FF)',
            boxShadow: '0 8px 32px rgba(0,212,255,0.3)',
          }}
          suppressHydrationWarning
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}

      {open && (
        <div className="flex flex-col rounded-2xl overflow-hidden glass animate-fade-up"
          style={{ width: 360, height: 520, background: '#0C0F16', boxShadow: '0 24px 64px rgba(0,0,0,0.6)' }}>
          
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-white/5" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center p-1">
                <Logo size={24} />
              </div>
              <div>
                <p style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 13, color: '#E8EDF2' }}>DPDP Expert</p>
                <p style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Online Assistant</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/20 hover:text-white/40" suppressHydrationWarning><X className="w-4 h-4" /></button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-1" style={{ background: m.role === 'user' ? 'rgba(123,97,255,0.2)' : 'rgba(255,255,255,0.05)' }}>
                  {m.role === 'user' ? <User className="w-3 h-3 text-[#9B87FF]" /> : <Bot className="w-3 h-3 text-[#00D4FF]" />}
                </div>
                <div className={`p-3 rounded-2xl text-[13px] leading-relaxed max-w-[80%] ${m.role === 'user' ? 'bg-[#7B61FF]/10 text-white rounded-tr-none border border-[#7B61FF]/20' : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center shrink-0"><Bot className="w-3 h-3 text-[#00D4FF]" /></div>
                <div className="flex gap-1 p-3 bg-white/5 rounded-2xl rounded-tl-none items-center">
                  {[0,1,2].map(d => <span key={d} className="w-1.5 h-1.5 rounded-full bg-[#00D4FF] animate-pulse" style={{ animationDelay: `${d * 0.2}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length < 3 && (
            <div className="px-4 pb-2 flex flex-wrap gap-1.5">
              {SUGGESTIONS.map(s => (
                <button key={s} onClick={() => send(s)} className="text-[10px] px-2.5 py-1.5 rounded-lg font-bold border border-white/5 bg-white/2 hover:bg-white/5 text-[#00D4FF]" suppressHydrationWarning>
                  {s}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t border-white/5">
            <form onSubmit={e => { e.preventDefault(); send(); }} className="relative">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask about compliance..."
                className="w-full h-10 pl-4 pr-12 rounded-xl bg-white/5 border border-white/10 text-sm focus:ring-[#00D4FF] outline-none"
                suppressHydrationWarning
              />
              <button type="submit" disabled={!input.trim()} className={`absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${input.trim() ? 'bg-[#00D4FF] text-[#080A0F]' : 'text-white/10'}`} suppressHydrationWarning>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
