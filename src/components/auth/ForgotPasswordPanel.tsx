import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { AuthInput } from './AuthInput';
import { Mail, ArrowRight, CheckCircle2, XCircle } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { initializeFirebase } from '@/firebase/index';

interface ForgotPasswordPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ForgotPasswordPanel({ isOpen, onClose }: ForgotPasswordPanelProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    if (!email) return;

    setLoading(true);
    setStatus('idle');
    try {
      const { auth } = initializeFirebase();
      await sendPasswordResetEmail(auth, email);
      setStatus('success');
      setMessage('Reset link sent to your email.');
    } catch (error) {
      setStatus('error');
      setMessage('Failed to send reset link.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden transition-all duration-500 ease-in-out",
        isOpen ? "max-h-[300px] opacity-100 mt-4" : "max-h-0 opacity-0 mt-0"
      )}
    >
      <div className="p-5 rounded-2xl bg-card border border-border backdrop-blur-md">
        <h3 className="text-sm font-semibold text-textPrimary mb-1">Reset Password</h3>
        <p className="text-xs text-white/40 mb-4">Enter your email to receive a secure reset link.</p>

        <div className="space-y-3">
          <AuthInput
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail className="w-4 h-4" />}
            required
            disabled={loading || status === 'success'}
          />

          {status !== 'idle' && (
            <div className={cn(
              "flex items-center gap-2 text-xs font-medium p-2 rounded-lg",
              status === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            )}>
              {status === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              {message}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs font-semibold text-white/40 hover:text-[#E8EDF2] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || status === 'success'}
              className="flex-1 py-2 bg-[#00D4FF] text-[#080A0F] hover:shadow-[0_0_16px_rgba(0,212,255,0.25)] rounded-xl text-xs font-semibold tracking-wider uppercase transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Send <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
