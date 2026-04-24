"use client";

import React, { useState, useMemo } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import { Search, Plus, Cpu, Sparkles, Edit, Trash2, Filter, ChevronDown, X, Save } from 'lucide-react';
import { generateAssessmentQuestions } from '@/ai/flows/generate-assessment-questions';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useMemoFirebase } from '@/firebase/provider';
import { useCollection } from '@/firebase/firestore/use-collection';
import { collection, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';

const DIFF_STYLE: Record<string, { color: string; bg: string }> = {
  easy:   { color: '#4ADE80', bg: 'rgba(34,197,94,0.1)'  },
  medium: { color: '#FBC22D', bg: 'rgba(245,158,11,0.1)' },
  hard:   { color: '#F87171', bg: 'rgba(239,68,68,0.1)'  },
};
const CAT_COLOR: Record<string, string> = {
  basic: '#00D4FF', role_based: '#7B61FF', dpdp: '#F59E0B', scenario: '#22C55E',
};

export default function QuestionBank() {
  const { toast }     = useToast();
  const firestore = useFirestore();

  const questionsColRef = useMemoFirebase(() => collection(firestore, 'questions'), [firestore]);
  const { data: realQuestions } = useCollection(questionsColRef);

  const questions = useMemo(() => realQuestions || [], [realQuestions]);

  const [search,    setSearch]    = useState('');
  const [generating, setGen]      = useState(false);
  const [catFilter, setCat]       = useState('all');
  const [diffFilter, setDiff]     = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);

  // Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>(null);

  const filtered = questions.filter((q: any) => {
    const matchSearch = q.questionText?.toLowerCase().includes(search.toLowerCase());
    const matchCat    = catFilter === 'all' || q.category === catFilter;
    const matchDiff   = diffFilter === 'all' || q.difficulty === diffFilter;
    return matchSearch && matchCat && matchDiff;
  });

  const handleAI = async () => {
    setGen(true);
    const categoryToGen = (catFilter === 'all' ? 'basic' : catFilter) as 'basic' | 'role_based' | 'dpdp' | 'scenario';
    toast({ title: 'AI Generating', description: `Synthesising questions via Gemini for ${categoryToGen}...` });
    try {
      const result = await generateAssessmentQuestions({ category: categoryToGen, role: 'general', numQuestions: 2 });
      if (result.length === 0) throw new Error("No output generated");
      
      const promises = result.map((q: any) => 
        addDoc(collection(firestore, 'questions'), {
           category: categoryToGen, role: 'all',
           questionText: q.questionText, options: q.options,
           correctOptionId: q.correctOptionId, explanation: q.explanation,
           difficulty: q.difficulty, createdBy: 'ai',
           createdAt: serverTimestamp(),
        })
      );
      await Promise.all(promises);

      toast({ title: `${result.length} Questions Added`, description: 'AI-generated questions saved to bank.' });
    } catch {
      toast({ title: 'Error', description: 'AI generation failed.', variant: 'destructive' });
    } finally {
      setGen(false);
    }
  };

  const deleteQ = async (id: string) => {
    try {
       await deleteDoc(doc(firestore, 'questions', id));
       toast({ title: 'Question Deleted' });
    } catch {
       toast({ title: 'Error', description: 'Failed to delete question.', variant: 'destructive' });
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setFormData({
      questionText: '', category: 'basic', difficulty: 'medium', role: 'all', explanation: '', correctOptionId: 'A',
      options: [{id:'A',text:''},{id:'B',text:''},{id:'C',text:''},{id:'D',text:''}]
    });
    setModalOpen(true);
  };

  const openEdit = (q: any) => {
    setEditingId(q.id);
    setFormData(JSON.parse(JSON.stringify(q)));
    setModalOpen(true);
  };

  const saveQ = async () => {
    if (!formData.questionText) return;
    const payload = { ...formData };
    delete payload.id; // ensure no explicit id in payload since it's firestore

    try {
      if (editingId) {
        await updateDoc(doc(firestore, 'questions', editingId), payload);
        toast({ title: 'Updated successfully' });
      } else {
        await addDoc(collection(firestore, 'questions'), { ...payload, createdBy: 'admin', createdAt: serverTimestamp() });
        toast({ title: 'Question added' });
      }
      setModalOpen(false);
    } catch {
      toast({ title: 'Error', description: 'Failed to save question.', variant: 'destructive' });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080A0F]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <SidebarNav role="admin" />

      <main className="flex-1 overflow-auto relative line-height-1">
        {/* Topbar */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-6 h-14 bg-[#080A0F]"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>
            Question Repository
          </p>
          <div className="flex items-center gap-2">
            <button onClick={handleAI} disabled={generating}
              className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold transition-all"
              style={{ background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.2)', color:'#00D4FF' }}>
              {generating
                ? <><Cpu className="w-3.5 h-3.5 animate-spin" />Processing...</>
                : <><Sparkles className="w-3.5 h-3.5" />AI Synthesise</>}
            </button>
            <button onClick={openAdd} className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold transition-all hover:scale-105"
              style={{ background:'#7B61FF', color:'#fff', boxShadow:'0 0 14px rgba(123,97,255,0.25)' }}>
              <Plus className="w-3.5 h-3.5" /> Manual Add
            </button>
          </div>
        </div>

        <div className="p-6 space-y-5 pb-24 lg:pb-6">

          <div className="animate-fade-up">
            <h1 style={{ fontFamily:"'Sora',sans-serif", fontWeight:700, fontSize:24, color:'#E8EDF2', letterSpacing:'-0.02em' }}>
              Question Bank
            </h1>
            <p className="text-sm mt-1" style={{ color:'rgba(255,255,255,0.4)' }}>
              {questions.length} questions across 4 categories
            </p>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 animate-fade-up delay-1">
            {[
              { label:'Basic',       cat:'basic',      count: questions.filter((q: any)=>q.category==='basic').length      },
              { label:'Role-Based',  cat:'role_based', count: questions.filter((q: any)=>q.category==='role_based').length },
              { label:'DPDP',        cat:'dpdp',       count: questions.filter((q: any)=>q.category==='dpdp').length       },
              { label:'Scenario',    cat:'scenario',   count: questions.filter((q: any)=>q.category==='scenario').length   },
            ].map(({ label, cat, count }) => (
              <button key={cat} onClick={() => setCat(catFilter === cat ? 'all' : cat)}
                className="p-4 rounded-xl text-left transition-all"
                style={{
                  background: catFilter === cat ? `${CAT_COLOR[cat]}12` : 'rgba(255,255,255,0.025)',
                  border: `1px solid ${catFilter === cat ? `${CAT_COLOR[cat]}35` : 'rgba(255,255,255,0.06)'}`,
                }}>
                <p style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.35)', marginBottom:6 }}>
                  {label}
                </p>
                <p style={{ fontFamily:"'DM Mono',monospace", fontWeight:500, fontSize:24, color: CAT_COLOR[cat] }}>
                  {count}
                </p>
              </button>
            ))}
          </div>

          {/* Search + filter */}
          <div className="flex gap-3 animate-fade-up delay-2 relative z-40">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color:'rgba(255,255,255,0.25)' }} />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search questions..."
                className="w-full h-10 pl-10 pr-4 rounded-xl text-sm transition-all"
                style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#E8EDF2', outline:'none' }}
                onFocus={e  => { e.target.style.borderColor='rgba(0,212,255,0.3)'; }}
                onBlur={e   => { e.target.style.borderColor='rgba(255,255,255,0.07)'; }}
              />
            </div>
            
            <button onClick={() => setFilterOpen(!filterOpen)} className="flex items-center gap-2 px-4 h-10 rounded-xl text-xs font-semibold transition-all hover:bg-white/5"
              style={{ background: filterOpen ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'rgba(255,255,255,0.5)' }}>
              <Filter className="w-3.5 h-3.5" /> Filter <ChevronDown className="w-3 h-3" />
            </button>
            
            {filterOpen && (
              <div className="absolute right-0 top-12 w-48 rounded-2xl p-4 bg-[#080B12] border border-white/10 shadow-2xl z-50 animate-fade-up">
                 <p className="text-xs font-bold text-white/40 uppercase mb-3 tracking-wider">Difficulty Filter</p>
                 <div className="flex flex-col gap-2">
                    {['all', 'easy', 'medium', 'hard'].map(d => (
                       <button key={d} onClick={() => setDiff(d)} className="px-3 py-2 rounded-lg text-sm text-left capitalize transition-colors"
                         style={{ background: diffFilter === d ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.05)', color: diffFilter === d ? '#00D4FF' : '#fff' }}>
                         {d}
                       </button>
                    ))}
                 </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden animate-fade-up delay-3"
            style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width:14 }} />
                  <th>Category</th>
                  <th>Question</th>
                  <th>Role</th>
                  <th>Difficulty</th>
                  <th>Source</th>
                  <th style={{ textAlign:'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.25)' }}>
                      No questions match your filter criteria or DB is empty.
                    </td>
                  </tr>
                )}
                {filtered.map((q: any) => {
                  const diff = DIFF_STYLE[q.difficulty] ?? DIFF_STYLE.medium;
                  const catColor = CAT_COLOR[q.category] ?? '#00D4FF';
                  return (
                    <tr key={q.id} className="table-row-hover">
                      <td>
                        <span className="w-2 h-2 rounded-full block"
                          style={{ background:'#22C55E', boxShadow:'0 0 6px rgba(34,197,94,0.5)' }} />
                      </td>
                      <td>
                        <span className="text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg"
                          style={{ background:`${catColor}12`, color:catColor, border:`1px solid ${catColor}25` }}>
                          {q.category?.replace('_', ' ')}
                        </span>
                      </td>
                      <td style={{ maxWidth:320 }}>
                        <p className="text-sm" style={{ color:'rgba(255,255,255,0.7)', lineHeight:1.5,
                          overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                          {q.questionText}
                        </p>
                      </td>
                      <td style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>{q.role}</td>
                      <td>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full"
                          style={{ background:diff.bg, color:diff.color }}>
                          {q.difficulty}
                        </span>
                      </td>
                      <td>
                        {q.createdBy === 'ai' ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold uppercase"
                            style={{ color:'#00D4FF' }}>
                            <Cpu className="w-3 h-3" /> AI
                          </span>
                        ) : (
                          <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>
                            Admin
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(q)} className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ color:'rgba(255,255,255,0.3)' }}
                            onMouseEnter={e => { e.currentTarget.style.color='#00D4FF'; e.currentTarget.style.background='rgba(0,212,255,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.3)'; e.currentTarget.style.background=''; }}
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => deleteQ(q.id)}
                            className="w-7 h-7 rounded-lg flex items-center justify-center transition-all"
                            style={{ color:'rgba(255,255,255,0.3)' }}
                            onMouseEnter={e => { e.currentTarget.style.color='#F87171'; e.currentTarget.style.background='rgba(239,68,68,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color='rgba(255,255,255,0.3)'; e.currentTarget.style.background=''; }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit / Add Modal */}
        {modalOpen && formData && (
          <div className="fixed inset-0 z-50 flex justify-center py-10 px-4 items-start overflow-y-auto" style={{ background: 'rgba(8,10,15,0.8)', backdropFilter: 'blur(8px)' }}>
             <div className="w-full max-w-2xl bg-[#080A0F] border border-white/10 rounded-2xl shadow-2xl relative">
                <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
                   <h2 className="text-lg font-bold text-white">{editingId ? 'Edit Question' : 'Add Question'}</h2>
                   <button onClick={() => setModalOpen(false)} className="text-white/40 hover:text-white p-2"><X className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6 space-y-4">
                   <div>
                      <label className="block text-xs font-bold text-white/50 uppercase mb-2">Question Text</label>
                      <textarea value={formData.questionText} onChange={e => setFormData({...formData, questionText: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#00D4FF]" rows={3} />
                   </div>
                   
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-white/50 uppercase mb-2">Category</label>
                        <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]">
                           <option className="bg-[#080B12]" value="basic">Basic Awareness</option>
                           <option className="bg-[#080B12]" value="role_based">Role Based</option>
                           <option className="bg-[#080B12]" value="dpdp">DPDP</option>
                           <option className="bg-[#080B12]" value="scenario">Scenario</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-white/50 uppercase mb-2">Difficulty</label>
                        <select value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}
                          className="w-full bg-[#080B12] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00D4FF]">
                           <option className="bg-[#080B12]" value="easy">Easy</option>
                           <option className="bg-[#080B12]" value="medium">Medium</option>
                           <option className="bg-[#080B12]" value="hard">Hard</option>
                        </select>
                      </div>
                   </div>

                   <div>
                      <label className="block text-xs font-bold text-white/50 uppercase mb-2">Options</label>
                      <div className="space-y-2">
                        {formData.options.map((opt: any, i: number) => (
                           <div key={opt.id} className="flex gap-3 items-center">
                              <span className="w-6 h-6 flex items-center justify-center bg-white/10 rounded-md text-xs font-bold text-white">{opt.id}</span>
                              <input value={opt.text} onChange={e => {
                                const newOpts = [...formData.options];
                                newOpts[i].text = e.target.value;
                                setFormData({...formData, options: newOpts});
                              }} 
                              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#00D4FF]" />
                              <button onClick={() => setFormData({...formData, correctOptionId: opt.id})}
                                className={`px-3 py-2 rounded-lg text-xs font-bold uppercase transition-all ${formData.correctOptionId === opt.id ? 'bg-[#22C55E]/20 text-[#4ADE80] border border-[#22C55E]/40' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}>
                                {formData.correctOptionId === opt.id ? 'Correct' : 'Mark'}
                              </button>
                           </div>
                        ))}
                      </div>
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-white/50 uppercase mb-2">Explanation</label>
                      <textarea value={formData.explanation} onChange={e => setFormData({...formData, explanation: e.target.value})} 
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#7B61FF]" rows={2} />
                   </div>
                </div>

                <div className="px-6 py-4 border-t border-white/5 flex justify-end gap-3 bg-white/[0.02] rounded-b-2xl">
                   <button onClick={() => setModalOpen(false)} className="px-4 py-2 rounded-xl text-sm font-semibold text-white/50 hover:text-white">Cancel</button>
                   <button onClick={saveQ} className="px-6 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 bg-[#00D4FF] text-[#080A0F] hover:scale-105 transition-all">
                      <Save className="w-4 h-4"/> Save Question
                   </button>
                </div>
             </div>
          </div>
        )}
      </main>
    </div>
  );
}
