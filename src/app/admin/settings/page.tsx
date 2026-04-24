"use client";

import React, { useState, useEffect } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Card } from '@/components/ui/card';
import { Settings as SettingsIcon, Key, ShieldCheck, Mail, Database, Server, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScoreRing } from '@/components/ui/score-ring';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useDoc } from '@/firebase/firestore/use-doc';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_GLOBAL_SETTINGS = {
  minPassingScore: 65,
  maturityLv5Qualifier: 90,
  maxAttempts: 3,
  sessionTimeout: 45
};

export default function AdminSettings() {
  const { toast } = useToast();
  const firestore = useFirestore();
  
  const settingsDocRef = useMemoFirebase(() => doc(firestore, 'settings', 'global'), [firestore]);
  const { data: globalSettingsRaw } = useDoc(settingsDocRef);

  const [settings, setSettings] = useState(DEFAULT_GLOBAL_SETTINGS);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_GLOBAL_SETTINGS);

  useEffect(() => {
    if (globalSettingsRaw) {
      setSettings(globalSettingsRaw as any);
      setFormData(globalSettingsRaw as any);
    }
  }, [globalSettingsRaw]);

  // Read API Key from environment
  const rawApiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
  const apiKeyObscured = rawApiKey.length > 8 ? `${rawApiKey.substring(0, 4)}......${rawApiKey.substring(rawApiKey.length - 4)}` : 'UNKNOWN/MISING_KEY';

  const handleSaveParameters = async () => {
    try {
      if (globalSettingsRaw) {
        await updateDoc(settingsDocRef, formData);
      } else {
        await setDoc(settingsDocRef, formData);
      }
      toast({ title: 'Settings Saved', description: 'Platform threshold settings updated.' });
      setIsEditing(false);
    } catch(err) {
      toast({ title: 'Save Failed', description: 'Could not update threshold settings.', variant: 'destructive' });
      console.error(err);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080A0F]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SidebarNav role="admin" />

      <main className="flex-1 overflow-auto p-6 space-y-5 pb-24 lg:pb-6 relative z-10">
        <div className="sticky top-0 z-30 flex items-center justify-between h-14 bg-[#080A0F]/80 backdrop-blur-md -mx-6 px-6 border-b border-white/5 mb-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">TOOLS • Settings</p>
        </div>

        <div className="animate-fade-up">
          <h1 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 24, color: '#E8EDF2' }}>System Architecture</h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>Manage API quotas, thresholds, and infrastructure limits.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-5 animate-fade-up delay-1">
            {/* API Key Status */}
            <Card className="p-6 relative overflow-hidden" style={{ background: 'rgba(0,212,255,0.02)', border: '1px solid rgba(0,212,255,0.1)' }}>
               <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-[#00D4FF]/10 flex items-center justify-center">
                     <Key className="w-5 h-5 text-[#00D4FF]" />
                  </div>
                  <div>
                      <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 16, color: '#E8EDF2' }}>GenAI API Status</h3>
                      <p className="text-xs text-[#00D4FF]">gemini-2.5-flash-preview</p>
                  </div>
               </div>

               <div className="flex flex-col gap-6 mb-6">
                   <div className="flex items-center gap-8">
                       <ScoreRing percent={14} size={100} strokeWidth={8} label="Active" />
                       <div className="space-y-3 flex-1 px-4">
                          <div>
                              <p className="text-[10px] font-bold text-[#00D4FF] uppercase tracking-wider mb-1">Current Key</p>
                              <code className="font-mono text-sm text-white bg-white/5 px-2 py-1 rounded select-all break-all border border-white/10">{apiKeyObscured}</code>
                          </div>
                       </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <p className="text-xs font-bold text-white/40 uppercase">Assumed Quota</p>
                          <p className="font-mono text-xl text-white">--- <span className="text-sm text-white/30">/ 10,000</span></p>
                      </div>
                      <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                          <p className="text-xs font-bold text-white/40 uppercase">Billing Tier</p>
                          <p className="text-sm font-bold text-[#4ADE80] mt-1.5">Free Trial</p>
                      </div>
                   </div>
               </div>

               <div className="p-3 bg-white/5 rounded-xl border border-white/10 flex items-center justify-between">
                   <div className="space-y-1 w-full">
                       <p className="text-[10px] font-bold text-white/40 text-center uppercase tracking-widest py-2">API config is securely managed via deployment `.env` variables</p>
                   </div>
               </div>
            </Card>

            {/* Assessment Thresholds */}
            <Card className="p-6" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
               <div className="flex items-center justify-between mb-6">
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#22C55E]/10 flex items-center justify-center">
                       <ShieldCheck className="w-5 h-5 text-[#4ADE80]" />
                    </div>
                    <div>
                        <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 16, color: '#E8EDF2' }}>Platform Thresholds</h3>
                        <p className="text-xs text-white/40">Global passing rates and limits</p>
                    </div>
                 </div>
                 {!isEditing && (
                    <Button onClick={() => setIsEditing(true)} size="sm" variant="ghost" className="text-white/60 hover:text-white">Edit</Button>
                 )}
               </div>

               <div className="space-y-3">
                   {/* Fields */}
                   <div className="flex justify-between items-center p-3 rounded-lg border border-white/5">
                        <span className="text-sm text-white/60 font-medium">Minimum Passing Score</span>
                        {isEditing ? (
                          <div className="flex items-center"><input type="number" value={formData.minPassingScore} onChange={e => setFormData({...formData, minPassingScore: parseInt(e.target.value)||0})} className="w-16 bg-[#080B12] border border-[#00D4FF] text-[#00D4FF] text-right rounded px-2 py-1 text-sm font-mono focus:outline-none" /> <span className="text-white/30 ml-2">%</span></div>
                        ) : (
                          <span className="font-mono text-sm font-bold text-white">{settings.minPassingScore}%</span>
                        )}
                   </div>
                   <div className="flex justify-between items-center p-3 rounded-lg border border-white/5">
                        <span className="text-sm text-white/60 font-medium">Maturity Lv. 5 Qualifier</span>
                        {isEditing ? (
                          <div className="flex items-center"><input type="number" value={formData.maturityLv5Qualifier} onChange={e => setFormData({...formData, maturityLv5Qualifier: parseInt(e.target.value)||0})} className="w-16 bg-[#080B12] border border-[#00D4FF] text-[#00D4FF] text-right rounded px-2 py-1 text-sm font-mono focus:outline-none" /> <span className="text-white/30 ml-2">%</span></div>
                        ) : (
                          <span className="font-mono text-sm font-bold text-white">{settings.maturityLv5Qualifier}%</span>
                        )}
                   </div>
                   <div className="flex justify-between items-center p-3 rounded-lg border border-white/5">
                        <span className="text-sm text-white/60 font-medium">Max Attempts per Module</span>
                        {isEditing ? (
                           <input type="number" value={formData.maxAttempts} onChange={e => setFormData({...formData, maxAttempts: parseInt(e.target.value)||0})} className="w-16 bg-[#080B12] border border-[#00D4FF] text-[#00D4FF] text-right rounded px-2 py-1 text-sm font-mono focus:outline-none" />
                        ) : (
                          <span className="font-mono text-sm font-bold text-white">{settings.maxAttempts}</span>
                        )}
                   </div>
                   <div className="flex justify-between items-center p-3 rounded-lg border border-white/5">
                        <span className="text-sm text-white/60 font-medium">Session Timeout (mins)</span>
                        {isEditing ? (
                           <input type="number" value={formData.sessionTimeout} onChange={e => setFormData({...formData, sessionTimeout: parseInt(e.target.value)||0})} className="w-16 bg-[#080B12] border border-[#00D4FF] text-[#00D4FF] text-right rounded px-2 py-1 text-sm font-mono focus:outline-none" />
                        ) : (
                          <span className="font-mono text-sm font-bold text-white">{settings.sessionTimeout}</span>
                        )}
                   </div>
               </div>

               {isEditing && (
                 <div className="flex items-center gap-2 mt-4">
                    <Button onClick={() => { setIsEditing(false); setFormData(settings); }} variant="outline" className="flex-1 bg-transparent border-white/10 text-white/60 hover:text-white">Cancel</Button>
                    <Button onClick={handleSaveParameters} className="flex-1 bg-[#00D4FF] text-[#080A0F] font-bold"><Save className="w-4 h-4 mr-2"/> Save Changes</Button>
                 </div>
               )}
            </Card>
        </div>

        {/* System Infra mock */}
        <div className="grid lg:grid-cols-3 gap-4 animate-fade-up delay-2">
             {[
                 { title: "Authentication", icon: <Mail className="w-4 h-4 text-[#F59E0B]" />, status: "Operational", sub: "Firebase Auth" },
                 { title: "Database", icon: <Database className="w-4 h-4 text-[#7B61FF]" />, status: "Operational", sub: "Firestore DB" },
                 { title: "Edge Functions", icon: <Server className="w-4 h-4 text-[#F87171]" />, status: "Degraded", sub: "Latency Spike Detected" },
             ].map((sys, i) => (
                 <div key={i} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex gap-4 items-center">
                     <div className="p-3 rounded-xl bg-white/5 border border-white/5">{sys.icon}</div>
                     <div>
                         <p className="text-sm font-bold text-white mb-0.5">{sys.title}</p>
                         <p className="text-xs text-white/40 mb-1">{sys.sub}</p>
                         <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${sys.status === 'Operational' ? 'bg-[#4ADE80]/10 text-[#4ADE80]' : 'bg-[#F87171]/10 text-[#F87171]'}`}>
                            {sys.status}
                         </span>
                     </div>
                 </div>
             ))}
        </div>
        
         {/* Seed Database Control */}
         <div className="mt-8 p-6 rounded-2xl border border-white/10 relative overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)' }}>
            <h3 style={{ fontFamily: "'Sora', sans-serif", fontWeight: 600, fontSize: 16, color: '#E8EDF2', marginBottom: 8 }}>Database Controls</h3>
            <p className="text-sm text-white/40 mb-6">Use this to initialize an empty database with default question sets.</p>
            <Button onClick={async () => {
                 try {
                    const { mockQuestions } = await import('@/lib/mock-data');
                    const { collection, addDoc, serverTimestamp, getFirestore } = await import('firebase/firestore');
                    const { getApps, initializeApp } = await import('firebase/app');
                    const { firebaseConfig } = await import('@/firebase/config');
                    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
                    const db = getFirestore(app);
                    
                    for (const q of mockQuestions) {
                       const payload = { ...q, createdAt: serverTimestamp(), createdBy: 'admin' };
                       if ('id' in payload) delete (payload as any).id;
                       await addDoc(collection(db, 'questions'), payload);
                    }
                    alert('Database seeded with questions successfully!');
                 } catch(e) {
                    alert('Error seeding database');
                    console.error(e);
                 }
            }} 
            className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
               Seed Default Database Questions
            </Button>
         </div>
      </main>
    </div>
  );
}
