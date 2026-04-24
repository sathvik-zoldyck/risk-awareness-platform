"use client";

import React from 'react';
import Link from 'next/link';
import { Shield, Brain, FileCheck, Users, BarChart, Lock, ArrowRight } from 'lucide-react';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { HeroCanvas } from '@/components/landing/HeroCanvas';
import { RevealOnScroll } from '@/components/landing/RevealOnScroll';
import { FeatureCard } from '@/components/landing/FeatureCard';
import { StepCard } from '@/components/landing/StepCard';

export default function LandingPage() {
  const features = [
    {
      title: 'AI-Powered Assessments',
      description: 'Dynamic cybersecurity tests that adapt to employee skill levels, with instant Gemini-driven explanations for incorrect answers.',
      icon: Brain,
    },
    {
      title: 'Role-Based Dashboards',
      description: 'Isolated environments for Employees, Company Admins, and Platform Managers ensuring strict data boundaries.',
      icon: Users,
    },
    {
      title: 'Compliance Reporting',
      description: 'One-click PDF generation to prove organizational readiness against the DPDP 2023 framework.',
      icon: FileCheck,
    },
    {
      title: 'Real-Time Analytics',
      description: 'Track organization-wide vulnerabilities, completion rates, and average security scores instantly.',
      icon: BarChart,
    },
    {
      title: 'End-to-End Encryption',
      description: 'All assessment results and user data are secured using industry-standard AES-256 protocols.',
      icon: Lock,
    },
    {
      title: 'Interactive Chatbot',
      description: 'A dedicated Gemini AI tutor available 24/7 to answer employee questions regarding security policies.',
      icon: Shield,
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Company Registration',
      description: 'Admins create an organization profile and generate secure join codes for their workforce.'
    },
    {
      number: '02',
      title: 'Employee Onboarding',
      description: 'Staff members join their organization using the secure code and access their personalized training portal.'
    },
    {
      number: '03',
      title: 'Continuous Assessment',
      description: 'Employees complete gamified, role-specific tests augmented by AI tutorials.'
    },
    {
      number: '04',
      title: 'Automated Compliance',
      description: 'Admins monitor real-time aggregates and export compliance PDFs for audits.'
    }
  ];

  return (
    <div className="min-h-screen bg-bg flex flex-col font-body selection:bg-accent/30 selection:text-white">
      <Navbar />

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative min-h-[90vh] flex items-center justify-center pt-20 overflow-hidden">
          <HeroCanvas />
          
          <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center animate-fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/10 text-[#00D4FF] mb-8 shadow-[0_0_20px_rgba(0,212,255,0.15)]">
              <Shield className="w-4 h-4" /> 
              <span className="text-xs font-bold tracking-widest uppercase">Next-Gen Security Training</span>
            </div>
            
            <h1 className="font-headline text-5xl md:text-7xl font-bold tracking-tight text-white mb-6">
              Secure Your Human <span className="text-[#00D4FF]">Firewall.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-textSecondary max-w-2xl mx-auto mb-10 leading-relaxed font-light">
              AI-powered cybersecurity awareness, role-based assessments, and automated DPDP compliance auditing for modern enterprises.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="h-14 px-8 bg-[#00D4FF] text-[#080A0F] rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:shadow-[0_0_16px_rgba(0,212,255,0.25)] transition-all hover:-translate-y-1 w-full sm:w-auto uppercase tracking-wider">
                Start Free Trial <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/login" className="h-14 px-8 border border-border bg-card/50 hover:bg-white/5 text-white rounded-xl font-bold text-sm flex items-center justify-center transition-all w-full sm:w-auto uppercase tracking-wider">
                Access Portal
              </Link>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-32 px-6 relative">
          <div className="max-w-7xl mx-auto">
            <RevealOnScroll className="text-center mb-20">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">Enterprise-Grade Architecture</h2>
              <p className="text-textSecondary max-w-xl mx-auto">Everything you need to assess risk, track progress, and maintain uncompromised compliance standards.</p>
            </RevealOnScroll>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feat, idx) => (
                <RevealOnScroll key={feat.title} delay={idx * 100}>
                  <FeatureCard {...feat} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="platform" className="py-32 px-6 bg-card/10 border-y border-border relative overflow-hidden">
          {/* subtle background glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[300px] bg-accent/5 blur-[150px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto relative z-10">
            <RevealOnScroll className="text-center mb-20">
              <h2 className="font-headline text-3xl md:text-4xl font-bold text-white mb-4">How Alcyone Works</h2>
              <p className="text-textSecondary max-w-xl mx-auto">A streamlined pipeline transforming vulnerable organizations into compliant, educated forces.</p>
            </RevealOnScroll>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
              {steps.map((step, idx) => (
                <RevealOnScroll key={step.number} delay={idx * 150}>
                  <StepCard {...step} />
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        {/* CTA BANNER */}
        <section className="py-32 px-6 relative hidden sm:block">
          <RevealOnScroll>
            <div className="max-w-5xl mx-auto bg-card border border-border rounded-[2rem] p-12 md:p-20 text-center relative overflow-hidden shadow-[0_20px_50px_-20px_rgba(0,0,0,0.5)]">
              <div className="absolute top-0 right-0 w-64 h-64 bg-accent/10 blur-[100px]" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent/10 blur-[100px]" />
              
              <div className="relative z-10">
                <h2 className="font-headline text-3xl md:text-5xl font-bold text-white mb-6">Ready to fortify your team?</h2>
                <p className="text-textSecondary max-w-2xl mx-auto mb-10 text-lg">
                  Join forward-thinking organizations currently trusting Alcyone Secure to automate their cybersecurity and compliance lifecycle.
                </p>
                <Link href="/signup" className="inline-flex h-14 px-10 bg-[#00D4FF] text-[#080A0F] rounded-xl font-bold text-sm items-center justify-center gap-2 hover:shadow-[0_0_16px_rgba(0,212,255,0.25)] transition-all hover:-translate-y-1 uppercase tracking-wider">
                  Deploy Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </RevealOnScroll>
        </section>

      </main>

      <Footer />
    </div>
  );
}