
import React, { useState, useRef, useMemo } from 'react';
import { ClinicalCase, Subject } from '../types';
import { analyzeClinicalCaseMultiModal } from '../services/geminiService';
import { SUBJECT_ICONS } from '../constants';
import { analyzeMedicalImage } from '../services/geminiService';
import { Brain, Sparkles, X, Search, ZoomIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { supabase } from '../src/supabase';

interface Props {
  cases: ClinicalCase[];
  onAddCase: (c: ClinicalCase) => void;
  onClose: () => void;
}

const AdminDashboard: React.FC<Props> = ({ cases, onAddCase, onClose }) => {
  const [activeTab, setActiveTab] = useState<'ingest' | 'repository'>('ingest');
  const [files, setFiles] = useState<{ file: File; preview: string | null; title: string; type: 'artifact' | 'lab' }[]>([]);
  const [formStep, setFormStep] = useState<number>(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editableData, setEditableData] = useState<any>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);
  const [analysisResults, setAnalysisResults] = useState<{ [key: string]: string }>({});
  const [analyzingImageId, setAnalyzingImageId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const departments: Subject[] = ['Medicine', 'Surgery', 'ENT', 'OBG', 'Pediatrics'];
  const steps = ["Extracted Bio-data", "Clinical Journey", "Audit & Flowchart"];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length > 0) {
      const newFiles = selectedFiles.map(file => {
        const isLab = /lab|report|blood|urine|scan|test|investigation|pathology|biochemistry|hematology/i.test(file.name);
        const defaultType: 'artifact' | 'lab' = isLab ? 'lab' : 'artifact';

        if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
          return new Promise<{ file: File; preview: string | null; title: string; type: 'artifact' | 'lab' }>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve({ file, preview: reader.result as string, title: file.name, type: defaultType });
            reader.readAsDataURL(file);
          });
        }
        return Promise.resolve({ file, preview: null, title: file.name, type: defaultType });
      });

      Promise.all(newFiles).then(results => {
        setFiles(prev => [...prev, ...results]);
        setEditableData(null);
        setSaveStatus(null);
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const updateFileTitle = (index: number, newTitle: string) => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, title: newTitle } : f));
  };

  const updateFileType = (index: number, type: 'artifact' | 'lab') => {
    setFiles(prev => prev.map((f, i) => i === index ? { ...f, type } : f));
  };

  const handleAnalyze = async () => {
    if (files.length === 0) return;
    setIsAnalyzing(true);

    const fileDataPromises = files.map(({ file }) => {
      return new Promise<{ base64: string; mimeType: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(',')[1];
          resolve({ base64, mimeType: file.type });
        };
        reader.readAsDataURL(file);
      });
    });

    const fileData = await Promise.all(fileDataPromises);
    const result = await analyzeClinicalCaseMultiModal(fileData);

    if (result) {
      setEditableData({
        ...result,
        superSpeciality: result.superSpeciality || "General",
        disease: result.disease || result.diseaseName || result.finalDiagnosis || "Unknown"
      });
      setFormStep(0);
    } else {
      alert("Deep Audit failed to extract valid data. Please ensure the documents are clear.");
    }
    setIsAnalyzing(false);
  };

  const updateField = (path: string, value: any) => {
    setEditableData((prev: any) => {
      const newData = { ...prev };
      const keys = path.split('.');
      let current = newData;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) current[keys[i]] = {};
        current = current[keys[i]];
      }
      current[keys[keys.length - 1]] = value;
      return newData;
    });
  };

  const handleFinalize = async () => {
    if (!editableData) return;
    setIsSaving(true);
    
    const newCase: ClinicalCase = {
      id: `DT-ADMIN-${Math.floor(Math.random() * 90000) + 10000}`,
      diseaseName: editableData.diseaseName || editableData.finalDiagnosis || "Unknown",
      subject: (editableData.subject as Subject) || "Medicine",
      superSpeciality: editableData.superSpeciality || "General",
      disease: editableData.disease || editableData.diseaseName || "Unknown",
      severity: "Normal",
      createdAt: new Date().toISOString(),
      patientDetails: {
        age: Number(editableData.age) || 0,
        gender: editableData.gender || "Other",
        weightKg: 0,
        heightCm: 0
      },
      outpatientSummary: editableData.diseaseName || "Clinical summary pending.",
      inpatientSummary: editableData.inPatientRecordSummary || "",
      intensiveData: {
        department: editableData.superSpeciality || editableData.subject || "General",
        provisionalDiagnosisOnAdmission: editableData.provisionalDiagnosis || "N/A",
        finalDiagnosis: editableData.finalDiagnosis || editableData.diseaseName || "N/A",
        previousHealthHistory: editableData.clinicalHistorySummary || "Cloud-ingested history artifact.",
        labReports: {
          bmp: (editableData.investigations || []).map((inv: any) => ({
            parameter: inv.testName,
            actual: inv.result,
            unit: inv.unit || '',
            status: 'Normal',
            specimen: inv.specimen,
            biologicalReferences: inv.biologicalReferences,
            method: inv.method
          })),
          cbc: [],
          labImages: files.filter(f => f.preview && f.type === 'lab').map(f => ({
            title: f.title || f.file.name,
            patientData: `Age: ${editableData.age}`,
            monaiAnalysis: "Lab report artifact",
            imageUrl: f.preview || undefined
          }))
        },
        imaging: {
          gallery: files.filter(f => f.preview && f.file.type.startsWith('image/') && f.type === 'artifact').map(f => ({
            title: f.title || f.file.name,
            patientData: `Age: ${editableData.age}`,
            monaiAnalysis: "Neural highlight pending",
            imageUrl: f.preview || undefined
          })),
          videos: files.filter(f => f.file.type.startsWith('video/')).map(f => ({
            title: f.title || f.file.name,
            videoUrl: f.preview || '',
            description: "Clinical video artifact"
          }))
        },
        clinicalNotes: (editableData.progress || []).map((p: any, idx: number) => ({
          day: `Day ${idx + 1}`,
          date: p.date || new Date().toISOString().split('T')[0],
          vitals: p.vitals || "Vitals mapping pending",
          medicines: p.medicines || [],
          fluids: "Maintenance IV",
          testResults: "Standard mapping",
          clinicalProgress: p.status || "Clinical progression synchronized."
        })),
        flowchart: editableData.flowchart,
        secondOpinion: {
          missedChecklist: [],
          suggestions: editableData.deepAnalysisReasoning || "AI Synthesis ready for review.",
          confidenceScore: 98
        }
      }
    };

    try {
      const { error } = await supabase
        .from('clinical_cases')
        .insert([{
          id: newCase.id,
          disease_name: newCase.diseaseName,
          subject: newCase.subject,
          super_speciality: newCase.superSpeciality,
          severity: newCase.severity,
          data: newCase
        }]);

      if (error) throw error;

      onAddCase(newCase);
      setSaveStatus({ type: 'success', message: 'Registry record finalized and saved to Supabase.' });
      setTimeout(() => { 
        resetForm();
        setActiveTab('repository'); 
      }, 2000);
    } catch (err) {
      console.error('Error saving case to Supabase:', err);
      setSaveStatus({ type: 'error', message: 'Failed to save to cloud registry.' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyzeImage = async (imageUrl: string, title: string) => {
    if (analysisResults[imageUrl]) return;
    setAnalyzingImageId(imageUrl);
    try {
      const base64 = imageUrl.split(',')[1];
      const mimeType = imageUrl.split(';')[0].split(':')[1];
      const result = await analyzeMedicalImage(base64, mimeType);
      setAnalysisResults(prev => ({ ...prev, [imageUrl]: result || "Analysis failed." }));
    } catch (error) {
      console.error("Image analysis failed:", error);
    } finally {
      setAnalyzingImageId(null);
    }
  };

  const resetForm = () => {
    setEditableData(null);
    setFiles([]);
    setFormStep(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in pb-32">
      <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden min-h-[85vh] flex flex-col">
        
        {/* Admin Branding */}
        <AnimatePresence>
          {zoomedImage && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
            >
              <div className="absolute top-8 right-8">
                <button 
                  onClick={() => setZoomedImage(null)} 
                  className="p-4 bg-white/10 hover:bg-red-500/20 text-white rounded-2xl transition-all border border-white/10"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="w-full h-full flex items-center justify-center p-20">
                <img src={zoomedImage.url} className="max-w-full max-h-full object-contain shadow-2xl rounded-lg" />
              </div>
              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/10 px-8 py-4 rounded-full text-white font-black text-xs uppercase tracking-[0.3em]">
                {zoomedImage.title}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="bg-[#172554] p-8 text-white flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Clinical Ingestion Hub</h2>
              <p className="text-blue-400 font-bold text-[10px] tracking-widest uppercase opacity-70">Multi-Modal AI Audit & Registry Engine</p>
            </div>
          </div>
          
          <button onClick={onClose} className="bg-white/10 p-4 rounded-2xl hover:bg-white/20 transition-all">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Local Navigation */}
        <div className="flex bg-slate-50 border-b border-slate-200">
          <button onClick={() => setActiveTab('ingest')} className={`flex-1 py-6 text-[10px] font-black tracking-[0.2em] uppercase transition-all ${activeTab === 'ingest' ? 'text-blue-600 border-b-4 border-blue-600 bg-white' : 'text-black'}`}>Deep AI Audit</button>
          <button onClick={() => setActiveTab('repository')} className={`flex-1 py-6 text-[10px] font-black tracking-[0.2em] uppercase transition-all ${activeTab === 'repository' ? 'text-blue-600 border-b-4 border-blue-600 bg-white' : 'text-black'}`}>Cloud Registry</button>
        </div>

        <div className="flex-1 p-8 lg:p-12 overflow-y-auto custom-scrollbar">
          {activeTab === 'repository' ? (
            <div className="space-y-12">
               <div className="bg-white rounded-[2rem] border border-slate-200 overflow-hidden shadow-sm">
                 <table className="w-full text-left">
                   <thead className="bg-slate-50 border-b border-slate-200">
                     <tr className="text-[9px] font-black text-black uppercase tracking-widest">
                       <th className="px-10 py-6">ID Reference</th>
                       <th className="px-10 py-6">Department</th>
                       <th className="px-10 py-6">Clinical Diagnosis</th>
                       <th className="px-10 py-6">Timestamp</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {cases.map((c) => (
                       <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-10 py-5 text-xs font-black text-blue-600">#{c.id}</td>
                         <td className="px-10 py-5 text-xs font-bold text-black">{c.subject}</td>
                         <td className="px-10 py-5 text-xs font-black text-black">{c.diseaseName}</td>
                         <td className="px-10 py-5 text-xs font-bold text-black">{new Date(c.createdAt).toLocaleString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            </div>
          ) : (
            <div className="h-full">
               {!editableData ? (
                <div className="max-w-4xl mx-auto space-y-12 py-10 animate-fade-in">
                  <div className="text-center space-y-4">
                    <h3 className="text-2xl font-black text-black">Multi-Modal Clinical Audit</h3>
                    <p className="text-sm font-medium text-black">Upload PDF case sheets and medical images (X-rays, CTs) together for a combined AI analysis.</p>
                  </div>

                  <div 
                    onClick={() => fileInputRef.current?.click()} 
                    className="h-80 border-4 border-dashed border-slate-200 rounded-[3rem] bg-slate-50 hover:bg-blue-50 transition-all flex flex-col items-center justify-center cursor-pointer group shadow-inner relative overflow-hidden"
                  >
                    <input type="file" ref={fileInputRef} className="hidden" multiple accept=".pdf,image/*,video/*" onChange={handleFileChange} />
                    <div className="w-20 h-20 bg-white text-blue-600 rounded-[2rem] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
                      <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    </div>
                    <p className="font-black text-xs text-black uppercase tracking-widest">Drop PDF, Images & Videos here</p>
                  </div>

                  {files.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {files.map((f, i) => (
                        <div key={i} className="relative group bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                          {f.preview ? (
                            f.file.type.startsWith('video/') ? (
                              <div className="w-full h-24 bg-slate-900 rounded-xl mb-2 flex items-center justify-center text-white">
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                              </div>
                            ) : (
                              <div className="relative h-24 rounded-xl mb-2 overflow-hidden group/img">
                                <img src={f.preview} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                  <button onClick={() => setZoomedImage({ url: f.preview!, title: f.title })} className="p-2 bg-white/20 hover:bg-white/40 rounded-lg text-white">
                                    <ZoomIn className="w-4 h-4" />
                                  </button>
                                  <button onClick={() => handleAnalyzeImage(f.preview!, f.title)} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
                                    {analyzingImageId === f.preview ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Brain className="w-4 h-4" />}
                                  </button>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="w-full h-24 bg-slate-100 rounded-xl mb-2 flex items-center justify-center text-slate-400">
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            </div>
                          )}
                          
                          {analysisResults[f.preview || ''] && (
                            <div className="absolute -top-20 left-0 right-0 z-10 bg-blue-600 text-white p-3 rounded-xl text-[8px] font-bold shadow-xl animate-slide-up">
                              {analysisResults[f.preview || '']}
                            </div>
                          )}
                          <div className="space-y-2">
                            <div className="flex gap-1">
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateFileType(i, 'artifact'); }}
                                className={`flex-1 py-1 rounded text-[7px] font-black uppercase tracking-tighter transition-all ${f.type === 'artifact' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-black'}`}
                              >
                                Artifact
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); updateFileType(i, 'lab'); }}
                                className={`flex-1 py-1 rounded text-[7px] font-black uppercase tracking-tighter transition-all ${f.type === 'lab' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-black'}`}
                              >
                                Lab Report
                              </button>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[7px] font-black text-blue-500 uppercase tracking-tighter ml-1">Assign Headline</label>
                              <input 
                                type="text" 
                                value={f.title} 
                                onChange={(e) => updateFileTitle(i, e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                                className="text-[10px] font-bold text-black w-full bg-slate-100 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1.5 transition-all"
                                placeholder="e.g. Chest X-Ray..."
                              />
                            </div>
                          </div>
                          <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <button 
                    onClick={handleAnalyze} 
                    disabled={files.length === 0 || isAnalyzing} 
                    className="w-full py-7 bg-[#172554] text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.4em] shadow-2xl hover:bg-blue-900 transition-all disabled:opacity-30 flex items-center justify-center gap-4"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="w-5 h-5 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                        Neural Audit in Progress...
                      </>
                    ) : "Start Multi-Modal Audit"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col h-full animate-fade-in">
                   <div className="flex gap-4 mb-12 overflow-x-auto no-scrollbar pb-2">
                     {steps.map((s, i) => (
                       <button key={i} onClick={() => setFormStep(i)} className={`px-8 py-3 rounded-full text-[9px] font-black uppercase tracking-widest transition-all ${formStep === i ? 'bg-[#172554] text-white shadow-lg' : 'bg-slate-100 text-slate-400'}`}>
                         {i+1}. {s}
                       </button>
                     ))}
                   </div>

                   <div className="flex-1 space-y-12 max-w-4xl">
                     {formStep === 0 && (
                        <div className="grid grid-cols-2 gap-8">
                           <div className="col-span-2">
                             <div className="bg-blue-50 p-8 rounded-[2rem] border border-blue-100 flex items-center justify-between">
                                 <div>
                                 <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Auto-Categorized Department</p>
                                 <p className="text-2xl font-black text-black">{editableData.subject}</p>
                               </div>
                               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-black shadow-sm">
                                 {SUBJECT_ICONS[editableData.subject as Subject] || SUBJECT_ICONS['Medicine']}
                               </div>
                             </div>
                           </div>
                           <EditableField label="Patient Age" value={editableData.age} onChange={(v: any) => updateField('age', v)} />
                           <EditableField label="Gender" value={editableData.gender} onChange={(v: any) => updateField('gender', v)} />
                           <EditableField label="Super Speciality" value={editableData.superSpeciality} onChange={(v: any) => updateField('superSpeciality', v)} />
                           <EditableField label="Disease Profile" value={editableData.disease} onChange={(v: any) => updateField('disease', v)} />
                           <div className="col-span-2">
                             <EditableField label="Detected Diagnosis (Full Name)" value={editableData.diseaseName || editableData.finalDiagnosis} onChange={(v: any) => updateField('diseaseName', v)} />
                           </div>
                        </div>
                     )}
                     {formStep === 1 && (
                        <div className="space-y-8">
                           <EditableTextarea label="Clinical Journey Summary" value={editableData.inPatientRecordSummary} onChange={(v: any) => updateField('inPatientRecordSummary', v)} />
                           <div className="space-y-4">
                              <p className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Extracted Lab Ledger</p>
                              <div className="bg-slate-50 rounded-[2rem] border border-slate-200 overflow-hidden">
                                <div className="grid grid-cols-5 bg-slate-100 p-4 text-[9px] font-black uppercase tracking-widest text-black border-b border-slate-200">
                                  <span>Parameter</span>
                                  <span>Result</span>
                                  <span>Specimen</span>
                                  <span>Ref. Range</span>
                                  <span>Method</span>
                                </div>
                                {editableData.investigations?.map((inv: any, i: number) => (
                                  <div key={i} className="grid grid-cols-5 gap-4 p-4 border-b border-slate-100 last:border-0 items-center">
                                    <span className="text-[11px] font-bold text-black">{inv.testName}</span>
                                    <span className="text-[11px] font-black text-blue-600">{inv.result} {inv.unit}</span>
                                    <span className="text-[11px] text-black">{inv.specimen || 'N/A'}</span>
                                    <span className="text-[11px] text-black">{inv.biologicalReferences || 'N/A'}</span>
                                    <span className="text-[11px] text-black">{inv.method || 'N/A'}</span>
                                  </div>
                                ))}
                              </div>
                           </div>
                        </div>
                     )}
                     {formStep === 2 && (
                        <div className="space-y-12">
                           <div className="bg-[#172554] p-10 rounded-[3rem] text-white shadow-xl relative overflow-hidden">
                              <h4 className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-4">Deep AI Clinical Analysis</h4>
                              <p className="text-lg font-medium italic leading-relaxed">
                                "{editableData.deepAnalysisReasoning}"
                              </p>
                           </div>

                           <div className="space-y-6">
                              <p className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Clinical Flowchart Map</p>
                              <div className="bg-slate-50 p-8 rounded-[3rem] border border-slate-200 min-h-[300px] flex flex-col items-center justify-center gap-6">
                                {editableData.flowchart?.nodes.map((node: any, i: number) => (
                                  <React.Fragment key={node.id}>
                                    <div className={`px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-sm border ${
                                      node.type === 'symptom' ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                      node.type === 'test' ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                      node.type === 'diagnosis' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                      'bg-purple-50 text-purple-600 border-purple-200'
                                    }`}>
                                      {node.label}
                                    </div>
                                    {i < editableData.flowchart.nodes.length - 1 && (
                                      <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                    )}
                                  </React.Fragment>
                                ))}
                              </div>
                           </div>
                        </div>
                     )}
                   </div>

                   <div className="mt-12 pt-8 border-t border-slate-200 flex justify-between items-center">
                      <button onClick={resetForm} className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:underline">Discard Artifacts</button>
                      <div className="flex items-center gap-8">
                         {saveStatus && <p className="text-[10px] font-black text-emerald-600 uppercase">{saveStatus.message}</p>}
                         <button onClick={handleFinalize} disabled={isSaving} className="px-16 py-6 bg-blue-600 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-700 transition-all disabled:opacity-30">
                           {isSaving ? "Synchronizing..." : "Finalize & Publish Registry"}
                         </button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const EditableField = ({ label, value, onChange }: any) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-black uppercase ml-2 tracking-widest">{label}</label>
    <input value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-6 py-4 text-xs font-bold text-black outline-none shadow-inner focus:bg-white focus:border-blue-500 transition-all" />
  </div>
);

const EditableTextarea = ({ label, value, onChange }: any) => (
  <div className="space-y-2 flex-1">
    <label className="text-[9px] font-black text-black uppercase ml-2 tracking-widest">{label}</label>
    <textarea rows={6} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-[2.5rem] px-8 py-6 text-xs font-medium text-black leading-relaxed outline-none shadow-inner focus:bg-white focus:border-blue-500 transition-all" />
  </div>
);

export default AdminDashboard;
