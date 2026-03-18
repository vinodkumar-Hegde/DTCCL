
import React from 'react';
import { ClinicalCase } from '../types';

interface Props {
  clinicalCase: ClinicalCase;
  onBack: () => void;
}

const QuickSummaryView: React.FC<Props> = ({ clinicalCase, onBack }) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in pb-32">
      <header className="mb-10 flex items-center justify-between">
        <button 
          onClick={onBack} 
          className="flex items-center text-[#1e3a8a] font-black uppercase text-[11px] tracking-widest hover:underline group"
        >
          <div className="p-2 bg-white rounded-lg mr-3 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7" /></svg>
          </div>
          Back to Detail
        </button>
        <button 
          onClick={() => window.print()} 
          className="bg-white text-[#172554] border-2 border-gray-200 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-blue-50 transition-all flex items-center gap-3"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
          Print Summary
        </button>
      </header>

      <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-gray-100">
        <div className="bg-[#172554] p-10 text-white relative">
          <div className="absolute top-0 right-0 p-12 opacity-5">
             <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <div className="relative z-10 text-center md:text-left">
            <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-4 py-1.5 rounded-full text-[9px] font-black tracking-[0.3em] uppercase mb-6 inline-block">
              MONAI CLINICAL BRIEFING
            </span>
            <h3 className="text-2xl font-black uppercase tracking-tight mb-4 leading-tight">
              {clinicalCase.diseaseName}
            </h3>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mt-6">
               <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                 <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1 opacity-60">Classification</p>
                 <p className="text-xs font-black text-white">{clinicalCase.severity}</p>
               </div>
               <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                 <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1 opacity-60">Entry Reference</p>
                 <p className="text-xs font-black text-white"># {clinicalCase.id}</p>
               </div>
               <div className="bg-white/10 px-4 py-2 rounded-xl backdrop-blur-md">
                 <p className="text-[8px] font-black text-blue-300 uppercase tracking-widest mb-1 opacity-60">Specialty</p>
                 <p className="text-xs font-black text-white uppercase">{clinicalCase.subject}</p>
               </div>
            </div>
          </div>
        </div>

        <div className="p-10 md:p-14 space-y-16">
          <SummaryRow 
            number="01" 
            title="Initial Triage & Presentation" 
            content={`The patient, a ${clinicalCase.patientDetails.age}Y ${clinicalCase.patientDetails.gender}, presented with clinical findings detailed in the artifact. Outpatient Summary: ${clinicalCase.outpatientSummary}.`}
          />
          
          <SummaryRow 
            number="02" 
            title="Clinical History & Narrative" 
            content={clinicalCase.inpatientSummary || "Clinical history narrative pending detail."}
          />

          <SummaryRow 
            number="03" 
            title="Diagnostic Findings" 
            content={`Systemic classification is ${clinicalCase.severity} per verified clinical benchmarks. Primary journey findings include specialized evaluation in ${clinicalCase.intensiveData.department}. Diagnosis confirmed as ${clinicalCase.intensiveData.finalDiagnosis || 'yet to be finalized'}.`}
          />

          <SummaryRow 
            number="04" 
            title="Journey Procedure & Progress" 
            content={clinicalCase.intensiveData.clinicalNotes.length > 0 ? 
              `Longitudinal progress mapping: ${clinicalCase.intensiveData.clinicalNotes.map(p => p.clinicalProgress).join(' • ')}.` : 
              `Standard hospital-based clinical monitoring protocol initiated for ${clinicalCase.diseaseName}.`
            }
          />

          <SummaryRow 
            number="05" 
            title="Clinical Artifact Conclusion" 
            content={`Final Clinical Resolution: ${clinicalCase.intensiveData.finalDiagnosis}. The patient's journey has been finalized and synchronized with the DocTutorials CCL repository.`}
          />

          <div className="pt-20 border-t border-gray-100 flex flex-col items-center">
             <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center text-[#172554] mb-6 shadow-inner border border-gray-100">
               <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
             </div>
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] mb-4">Registry Certified Artifact</p>
             <p className="text-xs text-blue-600 font-bold uppercase tracking-widest italic opacity-60">Verified via DocTutorial's DT-CCL Intelligent System</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const SummaryRow: React.FC<{ number: string; title: string; content: string }> = ({ number, title, content }) => (
  <div className="flex gap-10 group">
    <div className="flex-shrink-0">
      <div className="w-16 h-16 bg-blue-50 rounded-[2rem] flex items-center justify-center font-black text-[#1e3a8a] border border-gray-100 shadow-sm group-hover:bg-[#172554] group-hover:text-white transition-all text-lg">
        {number}
      </div>
    </div>
    <div className="pt-2">
      <h4 className="text-[11px] font-black text-blue-600 uppercase tracking-[0.4em] mb-4 flex items-center gap-3">
        <span className="w-1 h-3 bg-blue-600 rounded-full"></span>
        {title}
      </h4>
      <p className="text-base text-gray-700 leading-relaxed font-medium italic border-l-4 border-blue-50 pl-10 py-2 antialiased">
        {content}
      </p>
    </div>
  </div>
);

export default QuickSummaryView;
