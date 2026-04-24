"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Eye, EyeOff, Mail, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { ForgotPasswordPanel } from '@/components/auth/ForgotPasswordPanel';
import { Logo } from '@/components/common/Logo';
import { Navbar } from '@/components/landing/Navbar';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/index';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPanel, setShowForgotPanel] = useState(false);

  // Exact untouched logic from original implementation
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Missing credentials', description: 'Please enter email and password.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    
    try {
      const { auth, firestore } = initializeFirebase();
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      const userDocRef = doc(firestore, 'users', uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        await signOut(auth);
        throw new Error('User profile not found');
      }
      
      const userData = userDocSnap.data();
      const role = userData.role;
      
      if (role === 'admin') router.push('/admin/dashboard');
      else if (role === 'company') router.push('/company/dashboard');
      else if (role === 'employee') router.push('/employee/dashboard');
      else throw new Error('Invalid user role');
      
      toast({ title: 'Authenticated', description: 'Welcome back to Alcyone Secure.' });
    } catch (error: any) {
      setIsLoading(false);
      toast({ title: 'Login Failed', description: error.message || 'Invalid credentials', variant: 'destructive' });
    }
  };



  return (
    <div className="min-h-screen bg-bg flex flex-col pt-20">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full overflow-hidden">
        
        {/* Dynamic Glow blob behind the card */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/5 rounded-full blur-[150px] pointer-events-none" />

        <AuthCard className="z-10 animate-fade-up">
          <div className="flex flex-col items-center mb-8 text-center">
            <Link href="/" className="flex items-center justify-center mb-8 hover:scale-105 transition-transform">
              <Logo size={52} />
            </Link>
            <h1 className="font-headline font-bold text-2xl text-white tracking-tight">Welcome Back</h1>
            <p className="text-sm text-textSecondary mt-2">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider ml-1">Work Email</label>
              <AuthInput
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider">Password</label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotPanel(!showForgotPanel)}
                  className="text-[10px] font-bold text-[#00D4FF] hover:underline uppercase tracking-wide"
                >
                  Forgot?
                </button>
              </div>
              <div className="relative w-full">
                <AuthInput
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  icon={<Lock className="w-4 h-4" />}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute inset-y-0 right-3 flex items-center text-white/40 hover:text-white"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>



            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 bg-[#00D4FF] text-[#080A0F] hover:shadow-[0_0_16px_rgba(0,212,255,0.25)] hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Log in secure <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <ForgotPasswordPanel
            isOpen={showForgotPanel}
            onClose={() => setShowForgotPanel(false)}
          />

          <div className="mt-8 text-center border-t border-border pt-6">
            <p className="text-xs text-textSecondary">
              Don't have an account?{' '}
              <Link href="/signup" className="text-[#00D4FF] font-semibold hover:underline">
                Sign up here
              </Link>
            </p>
          </div>
        </AuthCard>
      </main>
    </div>
  );
}
