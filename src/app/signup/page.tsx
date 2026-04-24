"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Lock, Eye, EyeOff, Mail, User, Briefcase, Hash, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AuthCard } from '@/components/auth/AuthCard';
import { AuthInput } from '@/components/auth/AuthInput';
import { RoleSelector, Role } from '@/components/auth/RoleSelector';
import { Navbar } from '@/components/landing/Navbar';
import { Logo } from '@/components/common/Logo';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDocs, setDoc, query, collection, where, serverTimestamp } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase/index';

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [role, setRole] = useState<Role>('employee');
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Employee specifics
  const [jobRole, setJobRole] = useState('developer');
  const [joinCode, setJoinCode] = useState('');
  
  // Company specifics
  const [companyName, setCompanyName] = useState('');

  const generateJoinCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const { auth, firestore } = initializeFirebase();
      let finalCompanyId = '';

      if (role === 'employee') {
        const q = query(collection(firestore, 'companies'), where('joinCode', '==', joinCode));
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
          throw new Error('Invalid join code. Company not found.');
        }
        finalCompanyId = snapshot.docs[0].id;
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      if (role === 'company') {
        const newJoinCode = generateJoinCode();
        const companyRef = doc(collection(firestore, 'companies'));
        finalCompanyId = companyRef.id;
        
        await setDoc(companyRef, {
          name: companyName,
          adminUid: uid,
          joinCode: newJoinCode,
          employeeCount: 0,
          createdAt: serverTimestamp()
        });
        
        await setDoc(doc(firestore, 'users', uid), {
          name: fullName,
          email: email,
          role: 'company',
          companyId: finalCompanyId,
          createdAt: serverTimestamp()
        });
        
        router.push('/company/dashboard');
      } else if (role === 'employee') {
        await setDoc(doc(firestore, 'users', uid), {
          name: fullName,
          email: email,
          role: 'employee',
          jobRole: jobRole,
          companyId: finalCompanyId,
          createdAt: serverTimestamp()
        });
        
        router.push('/employee/dashboard');
      }
      
      toast({ title: 'Account created', description: 'Welcome to Alcyone Secure.' });
    } catch (error: any) {
      setIsLoading(false);
      toast({ title: 'Signup Failed', description: error.message || 'An error occurred', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col pt-20">
      <Navbar />

      <main className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 w-full overflow-hidden">
        
        {/* Dynamic Glow */}
        <div className="absolute top-[40%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-accent/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[20%] right-[30%] translate-x-1/2 translate-y-1/2 w-[500px] h-[400px] bg-[#7B61FF]/5 rounded-full blur-[140px] pointer-events-none" />

        <AuthCard className="z-10 animate-fade-up max-w-lg mb-10 w-full">
          <div className="flex flex-col items-center mb-6 text-center">
            <Link href="/" className="flex items-center justify-center mb-8 hover:scale-105 transition-transform">
              <Logo size={52} />
            </Link>
            <h1 className="font-headline font-bold text-2xl text-white tracking-tight">Create an Account</h1>
            <p className="text-sm text-textSecondary mt-2">Join to secure your compliance ecosystem</p>
          </div>

          <div className="mb-6">
            <RoleSelector activeRole={role} onChange={setRole} />
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider ml-1">Full Name</label>
              <AuthInput
                type="text"
                placeholder="Jane Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider ml-1">Business Email</label>
              <AuthInput
                type="email"
                placeholder="jane@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-4 h-4" />}
                required
              />
            </div>

            {/* Dynamic Rendering */}
            <div className={`transition-all duration-500 overflow-hidden space-y-4 ${role === 'company' ? 'max-h-[100px] opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider ml-1">Company Name</label>
                <AuthInput
                  type="text"
                  placeholder="Acme Corp"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  icon={<Briefcase className="w-4 h-4" />}
                  required={role === 'company'}
                />
              </div>
            </div>

            <div className={`transition-all duration-500 overflow-hidden space-y-4 ${role === 'employee' ? 'max-h-[200px] opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider ml-1">Job Role</label>
                  <Select value={jobRole} onValueChange={setJobRole} required={role === 'employee'}>
                    <SelectTrigger className="flex h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-[#E8EDF2] focus:border-[#00D4FF] focus:ring-1 focus:ring-[#00D4FF]/20 hover:bg-white/10 transition-all duration-300">
                      <SelectValue placeholder="Select Job Role" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0B0F17] border border-white/10 text-white">
                      <SelectItem className="focus:bg-cyan-500/20 focus:text-white hover:bg-cyan-500/20" value="developer">Developer</SelectItem>
                      <SelectItem className="focus:bg-cyan-500/20 focus:text-white hover:bg-cyan-500/20" value="hr">HR</SelectItem>
                      <SelectItem className="focus:bg-cyan-500/20 focus:text-white hover:bg-cyan-500/20" value="management">Management</SelectItem>
                      <SelectItem className="focus:bg-cyan-500/20 focus:text-white hover:bg-cyan-500/20" value="sales">Sales</SelectItem>
                      <SelectItem className="focus:bg-cyan-500/20 focus:text-white hover:bg-cyan-500/20" value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider ml-1">Join Code</label>
                  <AuthInput
                    type="text"
                    placeholder="XYZ-123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value)}
                    icon={<Hash className="w-4 h-4" />}
                    required={role === 'employee'}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="relative w-full space-y-1.5">
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider ml-1">Password</label>
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

              <div className="relative w-full space-y-1.5">
                <label className="text-[11px] font-bold text-textSecondary uppercase tracking-wider ml-1">Confirm</label>
                <div className="relative w-full">
                  <AuthInput
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 mt-6 rounded-xl font-bold text-sm tracking-widest uppercase transition-all duration-300 flex items-center justify-center gap-2 bg-[#00D4FF] text-[#080A0F] hover:shadow-[0_0_16px_rgba(0,212,255,0.25)] hover:scale-[1.01] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Create Account <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-border pt-6">
            <p className="text-xs text-textSecondary">
              Already have an account?{' '}
              <Link href="/login" className="text-[#00D4FF] font-semibold hover:underline">
                Log in here
              </Link>
            </p>
          </div>
        </AuthCard>
      </main>
    </div>
  );
}
