
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClinicalCase } from '../types';
import { generateExamQuestions } from '../services/geminiService';
import { supabase } from '../src/supabase';
import { BookOpen, ChevronLeft, Sparkles, CheckCircle2, HelpCircle, FileText, Brain } from 'lucide-react';

interface Props {
  clinicalCase: ClinicalCase;
  onBack: () => void;
}

interface ExamData {
  section1: {
    title: string;
    questions: string[];
  };
  section2: {
    title: string;
    practiceCase: string;
    analysisQuestions: {
      question: string;
      hint?: string;
      solution: string;
    }[];
  };
}

const QuestionaryView: React.FC<Props> = ({ clinicalCase, onBack }) => {
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revealedSolutions, setRevealedSolutions] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Check cache first
        const cacheKey = `exam_questions_${clinicalCase.id}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
          setExamData(JSON.parse(cachedData));
          setLoading(false);
          return;
        }
        // Fetch from Supabase
        const { data: dbData, error: dbError } = await supabase
          .from('case_questions')
          .select('questions_data')
          .eq('case_id', clinicalCase.id)
          .single();
        if (dbError) {
          console.error('Supabase fetch error:', dbError);
        }
        if (dbData && dbData.questions_data) {
          setExamData(dbData.questions_data as ExamData);
          sessionStorage.setItem(cacheKey, JSON.stringify(dbData.questions_data));
          setLoading(false);
          return;
        }
        // Generate via Gemini if not found
        const aiData = await generateExamQuestions(clinicalCase);
        if (aiData) {
          setExamData(aiData as ExamData);
          sessionStorage.setItem(cacheKey, JSON.stringify(aiData));
          // Save to Supabase
          const { error: insertError } = await supabase
            .from('case_questions')
            .insert([{ case_id: clinicalCase.id, questions_data: aiData }]);
          if (insertError) {
            console.error('Supabase insert error:', insertError);
          }
        } else {
          console.error('No data returned from generateExamQuestions');
        }
      } catch (err) {
        console.error('Error in QuestionaryView fetchData:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [clinicalCase]);

  const toggleSolution = (index: number) => {
    setRevealedSolutions(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="relative w-24 h-24 mb-8">
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 border-4 border-purple-200 border-t-purple-600 rounded-full"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight mb-2">Generating Questionary</h2>
        <p className="text-slate-500 font-medium animate-pulse">Curating university-standard exam questions based on the clinical case...</p>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="p-6 bg-red-50 text-red-600 rounded-3xl border border-red-100 mb-6">
          <HelpCircle className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 mb-4">Failed to Generate Questions</h2>
        <button onClick={onBack} className="px-8 py-4 bg-[#172554] text-white rounded-2xl font-bold uppercase tracking-widest">Return to Case</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-3 text-slate-500 hover:text-purple-600 transition-colors font-bold text-xs uppercase tracking-widest">
            <ChevronLeft className="w-5 h-5" />
            Back to Case
          </button>
          <div className="flex items-center gap-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-slate-900 uppercase tracking-tight">University Questionary</h1>
          </div>
          <div className="w-24"></div> {/* Spacer */}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden"
        >
          {/* Case Context Banner */}
          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-10 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
              <Sparkles className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <span className="px-4 py-1.5 bg-white/10 text-purple-200 border border-white/10 rounded-lg text-[9px] font-black uppercase tracking-widest mb-4 inline-block">
                Academic Module
              </span>
              <h2 className="text-3xl font-black tracking-tight mb-2">{clinicalCase.diseaseName}</h2>
              <p className="text-purple-200/60 font-medium text-sm">Exam preparation and clinical reasoning practice based on Case ID: {clinicalCase.id}</p>
            </div>
          </div>

          <div className="p-10 lg:p-16 space-y-20">
            {/* Section 1: University Exam Questions */}
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-3 h-10 bg-purple-600 rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{examData.section1.title}</h3>
                  <p className="text-[10px] font-black text-purple-600 uppercase tracking-[0.3em] mt-1">Section 1: Theoretical Assessment</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {examData.section1.questions.map((q, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex gap-6 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 hover:border-purple-200 hover:bg-purple-50/30 transition-all group"
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-purple-600 font-black text-lg shadow-sm group-hover:bg-purple-600 group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <p className="text-lg font-bold text-slate-800 leading-relaxed pt-1">
                      {q}
                    </p>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Divider */}
            <div className="h-px bg-slate-100"></div>

            {/* Section 2: Case Analysis for Practice */}
            <section className="space-y-10">
              <div className="flex items-center gap-6">
                <div className="w-3 h-10 bg-emerald-600 rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{examData.section2.title}</h3>
                  <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.3em] mt-1">Section 2: Clinical Practice Test</p>
                </div>
              </div>

              {/* Practice Case Description */}
              <div className="bg-emerald-50/50 p-10 rounded-[3rem] border-2 border-emerald-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                  <FileText className="w-24 h-24 text-emerald-900" />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-2 bg-emerald-600 text-white rounded-lg">
                    <Brain className="w-4 h-4" />
                  </div>
                  <h4 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Practice Scenario</h4>
                </div>
                <p className="text-xl font-medium text-slate-800 leading-relaxed italic">
                  "{examData.section2.practiceCase}"
                </p>
              </div>

              {/* Analysis Questions */}
              <div className="space-y-8">
                {examData.section2.analysisQuestions.map((aq, i) => (
                  <div key={i} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                    <div className="p-8 space-y-6">
                      <div className="flex items-start gap-6">
                        <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 flex-shrink-0">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Analysis Question {i + 1}</p>
                          <p className="text-lg font-black text-slate-900 leading-tight">{aq.question}</p>
                        </div>
                      </div>

                      {aq.hint && !revealedSolutions.includes(i) && (
                        <div className="ml-16 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex items-center gap-3">
                          <Sparkles className="w-4 h-4 text-amber-600" />
                          <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">Hint: {aq.hint}</p>
                        </div>
                      )}

                      <div className="ml-16 pt-4">
                        <button 
                          onClick={() => toggleSolution(i)}
                          className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all flex items-center gap-3 ${
                            revealedSolutions.includes(i) 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-[#172554] text-white hover:bg-blue-900'
                          }`}
                        >
                          {revealedSolutions.includes(i) ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              Solution Revealed
                            </>
                          ) : (
                            <>
                              <Brain className="w-4 h-4" />
                              Solve Analysis
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    <AnimatePresence>
                      {revealedSolutions.includes(i) && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="bg-emerald-50 border-t border-emerald-100"
                        >
                          <div className="p-8 ml-16 space-y-4">
                            <h5 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Clinical Reasoning & Solution</h5>
                            <p className="text-base font-bold text-emerald-900 leading-relaxed">
                              {aq.solution}
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </motion.div>

        {/* Footer Note */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-pulse delay-75"></div>
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse delay-150"></div>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">
            Academic Assessment Module • DocTutorials CCL
          </p>
        </div>
      </main>
    </div>
  );
};

export default QuestionaryView;
