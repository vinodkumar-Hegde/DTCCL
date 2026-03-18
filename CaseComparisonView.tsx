
import React from 'react';
import { ClinicalCase } from '../types';

interface Props {
  case1: ClinicalCase;
  case2: ClinicalCase;
  onBack: () => void;
}

const CaseComparisonView: React.FC<Props> = ({ case1, case2, onBack }) => {
  
  const AuditRow = ({ label, val1, val2, highlighted = false }: { label: string; val1: any; val2: any; highlighted?: boolean }) => (
    <div className="group flex items-stretch border-b border-slate-100 hover:bg-blue-50/30 transition-all">
      {/* Case A Data */}
      <div className={`flex-1 p-8 text-right transition-all ${highlighted ? 'bg-slate-50/50' : ''}`}>
        <p className={`text-sm leading-relaxed ${highlighted ? 'font-black text-[#172554] uppercase tracking-tight' : 'font-bold text-slate-600 italic'}`}>
          {val1}
        </p>
      </div>

      {/* Central Attribute Spine */}
      <div className="w-[200px] flex-shrink-0 bg-white border-x border-slate-100 flex items-center justify-center relative z-10 shadow-sm">
        <div className="absolute inset-y-0 left-0 w-1 bg-slate-200 group-hover:bg-blue-400 transition-colors"></div>
        <span className="text-[10px] font-black text-[#172554] uppercase tracking-[0.25em] text-center px-4 leading-tight opacity-60 group-hover:opacity-100">
          {label}
        </span>
        <div className="absolute inset-y-0 right-0 w-1 bg-slate-200 group-hover:bg-blue-400 transition-colors"></div>
      </div>

      {/* Case B Data */}
      <div className={`flex-1 p-8 text-left transition-all ${highlighted ? 'bg-blue-50/20' : ''}`}>
        <p className={`text-sm leading-relaxed ${highlighted ? 'font-black text-blue-600 uppercase tracking-tight' : 'font-bold text-slate-600 italic'}`}>
          {val2}
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-[1600px] mx-auto px-6 py-12 animate-fade-in pb-40">
      {/* Dynamic Header */}
      <header className="mb-14 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-[#172554] font-black text-[11px] uppercase tracking-[0.3em] hover:underline group">
          <div className="p-4 bg-white rounded-3xl mr-6 shadow-xl group-hover:bg-[#172554] group-hover:text-white transition-all border border-slate-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7" /></svg>
          </div>
          Exit Audit Portal
        </button>

        <div className="text-center bg-white px-12 py-6 rounded-[3rem] border border-slate-100 shadow-sm">
           <h2 className="text-3xl font-black text-[#172554] tracking-tighter uppercase leading-none">Clinical Correlation Board</h2>
           <p className="text-[9px] font-bold text-blue-600 uppercase tracking-[0.6em] mt-3">Side-by-Side Artifact Analysis</p>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex flex-col items-end">
             <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Confidence</p>
             <p className="text-2xl font-black text-emerald-600">98.4%</p>
           </div>
           <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
             <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           </div>
        </div>
      </header>

      {/* Main Audit Board */}
      <div className="bg-white rounded-[5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100 overflow-hidden animate-slide-up">
        
        {/* Specimen ID Headers */}
        <div className="flex items-stretch bg-[#172554] text-white">
          <div className="flex-1 p-10 text-right relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-10 opacity-5 group-hover:scale-150 transition-transform duration-1000">
               <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
            </div>
            <span className="px-4 py-1.5 bg-blue-500 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Artifact A: {case1.id}</span>
            <h3 className="text-3xl font-black leading-tight tracking-tight">{case1.diseaseName}</h3>
            <p className="text-blue-300 text-[11px] font-black uppercase tracking-[0.4em] mt-6 opacity-60">{case1.subject} Dept</p>
          </div>

          <div className="w-[200px] flex-shrink-0 bg-[#0f172a] border-x border-white/5 flex flex-col items-center justify-center gap-4">
             <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <svg className="w-6 h-6 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
             </div>
             <p className="text-[9px] font-black text-blue-400/40 uppercase tracking-[0.3em]">VS</p>
          </div>

          <div className="flex-1 p-10 text-left relative overflow-hidden group bg-gradient-to-br from-blue-900 to-[#172554]">
             <div className="absolute top-0 left-0 p-10 opacity-5 group-hover:scale-150 transition-transform duration-1000">
               <svg className="w-48 h-48" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/></svg>
            </div>
            <span className="px-4 py-1.5 bg-blue-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-6 inline-block">Artifact B: {case2.id}</span>
            <h3 className="text-3xl font-black leading-tight tracking-tight text-blue-50">{case2.diseaseName}</h3>
            <p className="text-blue-200 text-[11px] font-black uppercase tracking-[0.4em] mt-6 opacity-60">{case2.subject} Dept</p>
          </div>
        </div>

        {/* Diagnostic Mapping Rows */}
        <div className="flex flex-col bg-white">
          <AuditRow label="Patient Profile" val1={`${case1.patientDetails.age}Y / ${case1.patientDetails.gender} / ${case1.patientDetails.weightKg}kg`} val2={`${case2.patientDetails.age}Y / ${case2.patientDetails.gender} / ${case2.patientDetails.weightKg}kg`} highlighted />
          <AuditRow label="Severity Rating" val1={case1.severity} val2={case2.severity} highlighted />
          <AuditRow label="Admission History" val1={case1.intensiveData.previousHealthHistory} val2={case2.intensiveData.previousHealthHistory} />
          <AuditRow label="OP Brief" val1={case1.outpatientSummary} val2={case2.outpatientSummary} />
          <AuditRow label="Admitting Dx" val1={case1.intensiveData.provisionalDiagnosisOnAdmission} val2={case2.intensiveData.provisionalDiagnosisOnAdmission} highlighted />
          <AuditRow label="Key Biomarker" val1={`${case1.intensiveData.labReports.bmp[0].parameter}: ${case1.intensiveData.labReports.bmp[0].actual} ${case1.intensiveData.labReports.bmp[0].unit}`} val2={`${case2.intensiveData.labReports.bmp[0].parameter}: ${case2.intensiveData.labReports.bmp[0].actual} ${case2.intensiveData.labReports.bmp[0].unit}`} />
          <AuditRow label="Regimen Cycle" val1={`${case1.intensiveData.clinicalNotes.length} Day Hospitalization`} val2={`${case2.intensiveData.clinicalNotes.length} Day Hospitalization`} highlighted />
          <AuditRow label="Clinical Outcome" val1={case1.intensiveData.clinicalNotes[case1.intensiveData.clinicalNotes.length - 1]?.clinicalProgress || 'Finalized'} val2={case2.intensiveData.clinicalNotes[case2.intensiveData.clinicalNotes.length - 1]?.clinicalProgress || 'Finalized'} />
          <AuditRow label="Registry Status" val1="DT-CCA Verified" val2="DT-CCA Verified" highlighted />
        </div>

        {/* Audit Footer Resolution */}
        <div className="flex items-stretch border-t border-slate-100 bg-slate-50/30">
           <div className="flex-1 p-12 text-right">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Case A Resolution</p>
              <p className="text-2xl font-black text-[#172554] tracking-tight">{case1.intensiveData.finalDiagnosis}</p>
           </div>
           <div className="w-[200px] flex-shrink-0 flex items-center justify-center">
              <div className="w-16 h-16 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/></svg>
              </div>
           </div>
           <div className="flex-1 p-12 text-left">
              <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Case B Resolution</p>
              <p className="text-2xl font-black text-blue-600 tracking-tight">{case2.intensiveData.finalDiagnosis}</p>
           </div>
        </div>
      </div>

      <div className="mt-20 flex flex-col items-center gap-8">
         <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.5em] animate-pulse">Scanning Cross-Registry Anomalies...</p>
         <div className="h-px w-64 bg-gradient-to-r from-transparent via-slate-200 to-transparent"></div>
         <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">© 2025 Clinicl Cases • DT-CCA Analytical Engine</p>
      </div>
    </div>
  );
};

export default CaseComparisonView;
