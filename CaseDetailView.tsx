
import React, { useState, useEffect, useRef } from 'react';
import { ClinicalCase, LabResult, DailyNote } from '../types';
import { analyzeMedicalImage, queryCaseSheet } from '../services/geminiService';
import { Search, Sparkles, X, Brain, Activity, ClipboardList } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Markdown from 'react-markdown';

interface Props {
  clinicalCase: ClinicalCase;
  onBack: () => void;
  onCompare: (id: string) => void;
  onShowSummary: () => void;
  onOpenAI: () => void; 
  onOpenQuestionary: () => void;
  externalActiveTab?: string;
  onTabChange?: (tab: string) => void;
}

const CaseDetailView: React.FC<Props> = ({ clinicalCase, onBack, onShowSummary, onOpenAI, onOpenQuestionary, externalActiveTab, onTabChange, onCompare }) => {
  const [activeTab, setActiveTab] = useState<'case_summary' | 'labs' | 'imaging' | 'clinical_notes' | 'flowchart'>('case_summary');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const [zoomedImage, setZoomedImage] = useState<{ url: string; title: string } | null>(null);
  const [imageZoom, setImageZoom] = useState(1);
  const [analysisResults, setAnalysisResults] = useState<{ [key: string]: string }>({});
  const [analyzingImageId, setAnalyzingImageId] = useState<string | null>(null);
  const [showOpinionModal, setShowOpinionModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [caseQuery, setCaseQuery] = useState('');
  const [queryResult, setQueryResult] = useState<string | null>(null);
  const [isQuerying, setIsQuerying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const labFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (externalActiveTab) {
      const tabMap: any = { primary_details: 'case_summary', synthesis: 'case_summary', treatment: 'clinical_notes', imaging: 'imaging', labs: 'labs', flowchart: 'flowchart' };
      const normalized = tabMap[externalActiveTab] || externalActiveTab;
      if (['case_summary', 'labs', 'imaging', 'clinical_notes', 'flowchart'].includes(normalized)) {
        setActiveTab(normalized as any);
      }
    }
  }, [externalActiveTab]);

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    if (onTabChange) onTabChange(tab);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setUploadResult(null);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setUploadedImageUrl(reader.result as string);
      const result = await analyzeMedicalImage(base64, file.type);
      setUploadResult(result || "Extraction failed.");
      setIsAnalyzing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleCaseQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseQuery.trim()) return;

    setIsQuerying(true);
    setQueryResult(null);
    const result = await queryCaseSheet(clinicalCase, caseQuery);
    setQueryResult(result || "No information found.");
    setIsQuerying(false);
  };

  // Helper to convert analysis text into points
  const formatPoints = (text: string | null) => {
    if (!text) return [];
    // Split by common list markers and filter out empty strings
    return text.split(/(?:\d+\.|\*|-|\n)/g)
      .map(p => p.trim())
      .filter(p => p.length > 5);
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

  const tabs = ['case_summary', 'labs', 'imaging', 'clinical_notes', 'flowchart'];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in pb-40">
      <AnimatePresence>
        {zoomedImage && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-xl flex flex-col items-center justify-center p-4"
          >
            <div className="absolute top-8 right-8 flex gap-4">
              <div className="flex bg-white/10 rounded-2xl p-1 backdrop-blur-md border border-white/10">
                <button onClick={() => setImageZoom(z => Math.max(0.5, z - 0.25))} className="p-3 hover:bg-white/10 rounded-xl text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                </button>
                <div className="px-4 flex items-center text-white font-black text-[10px] uppercase tracking-widest border-x border-white/10">
                  {Math.round(imageZoom * 100)}%
                </div>
                <button onClick={() => setImageZoom(z => Math.min(3, z + 0.25))} className="p-3 hover:bg-white/10 rounded-xl text-white transition-all">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
              <button 
                onClick={() => { setZoomedImage(null); setImageZoom(1); }} 
                className="p-4 bg-white/10 hover:bg-red-500/20 text-white rounded-2xl transition-all border border-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="w-full h-full flex items-center justify-center overflow-auto p-20 custom-scrollbar">
              <motion.img 
                src={zoomedImage.url} 
                className="max-w-none shadow-2xl rounded-lg"
                style={{ scale: imageZoom }}
                initial={{ scale: 0.8 }}
                animate={{ scale: imageZoom }}
              />
            </div>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/10 px-8 py-4 rounded-full text-white font-black text-xs uppercase tracking-[0.3em]">
              {zoomedImage.title}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <header className="mb-12 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-black font-bold text-xs tracking-widest uppercase hover:underline group">
          <div className="p-3 bg-white rounded-2xl mr-4 shadow-sm group-hover:bg-[#172554] group-hover:text-white transition-all border border-slate-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7" /></svg>
          </div>
          Back to Hub
        </button>
        <div className="flex gap-4">
           <button onClick={onShowSummary} className="bg-white border border-slate-200 text-black px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all transform active:scale-95">Report Synthesis</button>
           <button onClick={onOpenQuestionary} className="bg-purple-600 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl hover:bg-purple-700 transition-all transform active:scale-95">University Questionary</button>
           <button onClick={() => setShowOpinionModal(true)} className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all transform active:scale-95">Clinical Opinion</button>
           <button onClick={() => onCompare(clinicalCase.id)} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-700 transition-all transform active:scale-95">Compare Case</button>
        </div>
      </header>

      {/* Dynamic Intelligence Search Bar */}
      <div className="mb-12">
        <form onSubmit={handleCaseQuery} className="relative group">
          <div className="absolute inset-y-0 left-0 pl-8 flex items-center pointer-events-none">
            <Sparkles className="h-6 w-6 text-blue-500 animate-pulse" />
          </div>
          <input
            type="text"
            value={caseQuery}
            onChange={(e) => setCaseQuery(e.target.value)}
            placeholder="Ask Dr. Deeksha anything about this case sheet... (e.g., 'What was the Hb on Day 2?')"
            className="block w-full pl-20 pr-32 py-8 bg-white border-2 border-slate-100 rounded-[3rem] text-xl font-bold text-black placeholder-slate-300 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 shadow-2xl transition-all"
          />
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center">
            <button
              type="submit"
              disabled={isQuerying || !caseQuery.trim()}
              className="bg-[#172554] text-white px-10 py-4 rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-900 transition-all disabled:opacity-30 flex items-center gap-3"
            >
              {isQuerying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Search className="w-4 h-4" />
              )}
              {isQuerying ? 'Fetching...' : 'Fetch Info'}
            </button>
          </div>
        </form>

        <AnimatePresence>
          {queryResult && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-6 bg-blue-50 border-2 border-blue-100 rounded-[3rem] p-10 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Brain className="w-24 h-24 text-blue-900" />
              </div>
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h5 className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Dynamic Case Insight</h5>
                </div>
                <button onClick={() => setQueryResult(null)} className="p-2 hover:bg-blue-100 rounded-xl transition-all">
                  <X className="w-5 h-5 text-blue-400" />
                </button>
              </div>
              <div className="prose prose-blue max-w-none">
                <div className="text-xl font-bold text-black leading-relaxed">
                  <Markdown>{queryResult}</Markdown>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {showOpinionModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
          <div className="bg-white rounded-[4rem] w-full max-w-2xl shadow-2xl overflow-hidden border border-slate-200 animate-slide-up">
             <div className="bg-emerald-900 text-emerald-50 p-12 flex justify-between items-center">
                <div>
                   <h4 className="text-2xl font-black uppercase tracking-tight">Clinical Opinion Engine</h4>
                   <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-2">DT-CCA Automated Insight</p>
                </div>
                <button onClick={() => setShowOpinionModal(false)} className="p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all">
                   <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
             </div>
             <div className="p-14 space-y-12">
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                      <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">Missed Checklist Items</h5>
                   </div>
                   <div className="grid grid-cols-1 gap-4">
                      {clinicalCase.intensiveData.secondOpinion.missedChecklist.map((item, i) => (
                        <div key={i} className="flex items-center gap-5 text-slate-700 font-bold text-sm bg-emerald-50/50 p-5 rounded-[2rem] border border-emerald-100 shadow-sm transition-all hover:translate-x-2">
                           <div className="w-3 h-3 bg-emerald-400 rounded-full flex-shrink-0"></div>
                           {item}
                        </div>
                      ))}
                   </div>
                </div>
                <div className="space-y-6">
                   <div className="flex items-center gap-4">
                      <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                      <h5 className="text-[11px] font-black text-emerald-600 uppercase tracking-widest">DT Suggestion</h5>
                   </div>
                   <p className="text-xl font-bold text-black leading-relaxed italic border-l-8 border-emerald-500/20 pl-8 bg-slate-50/50 py-8 rounded-r-[3rem]">
                     "{clinicalCase.intensiveData.secondOpinion.suggestions}"
                   </p>
                </div>
                <div className="pt-10 border-t border-slate-100 flex justify-between items-center">
                   <div className="flex flex-col">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Confidence Score</p>
                      <div className="flex items-baseline gap-2">
                         <span className="text-5xl font-black text-emerald-900">{clinicalCase.intensiveData.secondOpinion.confidenceScore}</span>
                         <span className="text-sm font-black text-emerald-600 uppercase">%</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-slate-100 flex flex-col">
        {/* Header Hero */}
        <div className="bg-[#172554] p-8 lg:p-10 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-20 opacity-[0.03] pointer-events-none transform rotate-12">
             <svg className="w-[500px] h-[500px]" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
          </div>
          <div className="relative z-10 animate-slide-up">
            <div className="max-w-4xl">
              <div className="flex gap-3 mb-6">
                <span className="px-4 py-1.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">Case ID: {clinicalCase.id}</span>
                <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-[0.2em] border ${clinicalCase.severity === 'Complicated' ? 'bg-red-500/20 text-red-300 border-red-500/30' : 'bg-white/5 text-slate-300 border-white/10'}`}>{clinicalCase.severity} Severity</span>
              </div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-4 leading-tight text-white/95">{clinicalCase.diseaseName}</h1>
              <div className="flex flex-wrap gap-8 text-blue-300/60 font-bold text-[11px] tracking-wide uppercase">
                 <div className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full animate-pulse"></span> {clinicalCase.subject}</div>
                 <div className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> {clinicalCase.superSpeciality}</div>
                 <div className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> {clinicalCase.patientDetails.age}Y / {clinicalCase.patientDetails.gender}</div>
                 <div className="flex items-center gap-2"><span className="w-1 h-1 bg-blue-500 rounded-full"></span> {clinicalCase.patientDetails.weightKg}kg</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-50 border-b border-slate-200 overflow-x-auto no-scrollbar scroll-smooth">
          {tabs.map(tab => (
            <button 
              key={tab} 
              onClick={() => handleTabChange(tab)} 
              className={`flex-1 min-w-[150px] py-6 text-[11px] font-black uppercase tracking-[0.3em] transition-all border-r border-slate-200/50 ${activeTab === tab ? 'text-blue-600 bg-white border-b-4 border-blue-600 shadow-sm' : 'text-slate-400 hover:text-black hover:bg-white'}`}
            >
              {tab.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="p-6 lg:p-12 bg-white min-h-[700px] animate-fade-in">
          {activeTab === 'case_summary' && (
            <div className="space-y-24 animate-slide-up">
              <div className="space-y-8">
                  <LabelBlock label="Clinical Context" color="red" />
                  <div className="bg-slate-50 p-10 rounded-[3rem] border border-slate-200 shadow-inner">
                      <div className="text-base md:text-xl text-black leading-relaxed font-normal markdown-content">
                        <Markdown 
                          components={{
                            strong: ({node, ...props}) => <span className="text-blue-600 font-bold" {...props} />,
                            li: ({node, ...props}) => <li className="mb-2 list-disc ml-4" {...props} />,
                            ul: ({node, ...props}) => <ul className="space-y-1" {...props} />
                          }}
                        >
                          {clinicalCase.intensiveData.previousHealthHistory}
                        </Markdown>
                      </div>
                  </div>
              </div>

              <div className="grid grid-cols-1 gap-16">
                 <div className="space-y-8">
                    <LabelBlock label="Outpatient Findings" color="blue" />
                    <div className="bg-blue-50/30 p-10 rounded-[3rem] border border-blue-100">
                       <div className="text-lg text-black leading-relaxed font-normal markdown-content">
                         <Markdown
                           components={{
                             strong: ({node, ...props}) => <span className="text-blue-600 font-bold" {...props} />
                           }}
                         >
                           {clinicalCase.outpatientSummary}
                         </Markdown>
                       </div>
                    </div>
                 </div>
                 <div className="space-y-8">
                    <LabelBlock label="Admission Summary" color="indigo" />
                    <div className="bg-indigo-50/20 p-10 rounded-[3rem] border border-indigo-100">
                       <div className="text-lg text-black leading-relaxed font-normal markdown-content">
                         <Markdown
                           components={{
                             strong: ({node, ...props}) => <span className="text-blue-600 font-bold" {...props} />
                           }}
                         >
                           {clinicalCase.inpatientSummary}
                         </Markdown>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="pt-16 border-t border-slate-100">
                 <LabelBlock label="Diagnostic Registry Map" />
                 <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatPanel label="Provisional Diagnosis" value={clinicalCase.intensiveData.provisionalDiagnosisOnAdmission} icon={<ClipboardList className="w-4 h-4" />} />
                    <StatPanel label="Final Resolution" value={clinicalCase.intensiveData.finalDiagnosis} highlighted icon={<Activity className="w-4 h-4" />} />
                    <StatPanel label="Clinical Department" value={clinicalCase.intensiveData.department} icon={<Brain className="w-4 h-4" />} />
                    <StatPanel label="Treatment Duration" value={`${clinicalCase.intensiveData.clinicalNotes.length} Days`} icon={<Sparkles className="w-4 h-4" />} />
                 </div>
              </div>
            </div>
          )}

          {activeTab === 'imaging' && (
             <div className="space-y-16 animate-slide-up">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 border-b border-slate-100 pb-10">
                   <div className="space-y-2">
                     <LabelBlock label="Imaging Intelligence" />
                     <h2 className="text-3xl font-black text-black tracking-tight">Diagnostic Specimen Analysis</h2>
                   </div>
                 </div>

                {/* Gallery Section */}
                {clinicalCase.intensiveData.imaging.gallery && clinicalCase.intensiveData.imaging.gallery.length > 0 && (
                  <div className="space-y-8">
                    <p className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Case Gallery</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
                      {clinicalCase.intensiveData.imaging.gallery.map((img, i) => (
                        <div key={i} className="space-y-3 group">
                          <div className="relative aspect-square bg-slate-100 rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl transition-all cursor-pointer" onClick={() => setZoomedImage({ url: img.imageUrl || '', title: img.title })}>
                            {img.imageUrl ? (
                              <img src={img.imageUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleAnalyzeImage(img.imageUrl || '', img.title); }}
                                className="w-full py-2 bg-blue-600 text-white rounded-xl text-[8px] font-black uppercase tracking-widest shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                              >
                                {analyzingImageId === img.imageUrl ? (
                                  <div className="w-2 h-2 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : <Brain className="w-3 h-3" />}
                                {analyzingImageId === img.imageUrl ? 'Analyzing...' : 'Neural Audit'}
                              </button>
                            </div>
                          </div>
                          <p className="text-[10px] font-black text-black uppercase tracking-widest text-center px-2 line-clamp-1">{img.title}</p>
                          
                          {analysisResults[img.imageUrl || ''] && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 mt-2"
                            >
                              <p className="text-[9px] font-bold text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Sparkles className="w-3 h-3" />
                                AI Observation
                              </p>
                              <p className="text-[11px] font-medium text-black leading-relaxed italic">
                                {analysisResults[img.imageUrl || '']}
                              </p>
                            </motion.div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Gallery Section */}
                {clinicalCase.intensiveData.imaging.videos && clinicalCase.intensiveData.imaging.videos.length > 0 && (
                  <div className="space-y-8">
                    <p className="text-[10px] font-black text-black uppercase tracking-widest ml-2">Clinical Video Artifacts</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                      {clinicalCase.intensiveData.imaging.videos.map((vid, i) => (
                        <div key={i} className="bg-slate-50 rounded-[2.5rem] border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
                          <div className="aspect-video bg-slate-900 relative">
                            <video src={vid.videoUrl} className="w-full h-full object-cover" controls />
                          </div>
                          <div className="p-6">
                            <h5 className="text-sm font-black text-black mb-2">{vid.title}</h5>
                            <p className="text-[11px] font-bold text-black leading-relaxed">{vid.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

             </div>
          )}

          {activeTab === 'flowchart' && (
            <div className="space-y-16 animate-slide-up">
              <div className="space-y-2">
                <LabelBlock label="Clinical Pathway" />
                <h2 className="text-3xl font-black text-black tracking-tight">Diagnostic & Treatment Flow</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Click on any node to view detailed clinical insights</p>
              </div>

              {clinicalCase.intensiveData.flowchart ? (
                <div className="bg-slate-50 p-8 lg:p-16 rounded-[4rem] border border-slate-200 shadow-inner flex flex-col items-center gap-10">
                  {clinicalCase.intensiveData.flowchart.nodes.map((node, i) => (
                    <React.Fragment key={node.id}>
                      <div className="relative w-full max-w-lg">
                        <motion.button 
                          onClick={() => setSelectedNode(selectedNode === node.id ? null : node.id)}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className={`w-full p-10 rounded-[3rem] shadow-xl border-2 flex flex-col items-center text-center gap-4 relative group transition-all ${
                            selectedNode === node.id ? 'scale-105 ring-4 ring-blue-500/20' : 'hover:-translate-y-1'
                          } ${
                            node.type === 'symptom' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                            node.type === 'test' ? 'bg-blue-50 border-blue-200 text-blue-900' :
                            node.type === 'diagnosis' ? 'bg-emerald-50 border-emerald-200 text-emerald-900' :
                            'bg-purple-50 border-purple-200 text-purple-900'
                          }`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">{node.type}</span>
                          <p className="text-2xl font-black tracking-tight">{node.label}</p>
                          
                          <div className={`mt-4 overflow-hidden transition-all duration-300 ${selectedNode === node.id ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                             <div className="pt-4 border-t border-black/5 text-sm font-bold leading-relaxed">
                                {node.type === 'symptom' && "Primary clinical manifestation identified during initial triage. Correlates with systemic inflammatory response."}
                                {node.type === 'test' && "Diagnostic investigation performed to validate physiological markers and rule out differentials."}
                                {node.type === 'diagnosis' && "Confirmed clinical resolution based on multi-modal evidence and neural audit synthesis."}
                                {node.type === 'treatment' && "Therapeutic intervention protocol initiated to stabilize patient and manage progression."}
                             </div>
                          </div>
                        </motion.button>
                      </div>
                      
                      {i < clinicalCase.intensiveData.flowchart.nodes.length - 1 && (
                        <motion.div 
                          initial={{ height: 0 }}
                          animate={{ height: 60 }}
                          transition={{ delay: i * 0.1 + 0.05 }}
                          className="w-1.5 bg-slate-200 rounded-full relative"
                        >
                          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                            <svg className="w-8 h-8 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                          </div>
                        </motion.div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              ) : (
                <div className="py-40 text-center bg-slate-50 rounded-[4rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold italic">No flowchart data available for this case.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'clinical_notes' && (
             <div className="space-y-12 animate-slide-up">
                <div className="flex flex-col md:flex-row justify-between items-end border-b border-slate-100 pb-8 gap-4">
                  <div className="space-y-2">
                    <LabelBlock label="Longitudinal Regimen" />
                    <h2 className="text-3xl font-black text-black tracking-tight">Clinical Notes & Progress Ledger</h2>
                  </div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest italic">Clinical Workflow Mapping</span>
                </div>
                
                <div className="bg-white rounded-[2.5rem] border-2 border-slate-100 shadow-xl overflow-hidden">
                   <div className="overflow-x-auto">
                     <table className="w-full text-left border-collapse min-w-[1000px]">
                        <thead className="bg-[#172554] text-white">
                           <tr className="text-[9px] font-black uppercase tracking-[0.2em]">
                              <th className="px-8 py-6 w-[140px]">Timeline</th>
                              <th className="px-8 py-6 w-[200px]">Vitals</th>
                              <th className="px-8 py-6 w-[300px]">Medications & Fluids</th>
                              <th className="px-8 py-6 w-[350px]">Clinical Progress & Labs</th>
                           </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                           {clinicalCase.intensiveData.clinicalNotes.map((note, idx) => (
                             <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-8 align-top border-r border-slate-50">
                                   <div className="space-y-1">
                                      <p className="text-xl font-black text-black">{note.day}</p>
                                      <p className="text-[10px] font-bold text-black uppercase tracking-widest">{note.date}</p>
                                   </div>
                                </td>
                                <td className="px-8 py-8 align-top border-r border-slate-50">
                                   <div className="bg-slate-100/50 p-4 rounded-xl border border-slate-200">
                                      <p className="text-[12px] font-bold text-black font-mono leading-relaxed">{note.vitals}</p>
                                   </div>
                                </td>
                                <td className="px-8 py-8 align-top border-r border-slate-50">
                                   <div className="space-y-5">
                                      <div className="space-y-2">
                                         <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest opacity-60">Medications</p>
                                         <div className="flex flex-col gap-1.5">
                                            {note.medicines.map((m, i) => (
                                              <div key={i} className="flex gap-2 items-start">
                                                 <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                                                 <p className="text-[11px] font-bold text-black">{m}</p>
                                              </div>
                                            ))}
                                         </div>
                                      </div>
                                      <div className="pt-3 border-t border-slate-100">
                                         <p className="text-[8px] font-black text-indigo-600 uppercase tracking-widest opacity-60">Fluids / Support</p>
                                         <p className="text-[11px] font-bold text-black mt-1">{note.fluids}</p>
                                      </div>
                                   </div>
                                </td>
                                <td className="px-8 py-8 align-top">
                                   <div className="space-y-4">
                                      <div className="bg-blue-50/20 p-6 rounded-2xl border border-blue-100 shadow-sm min-h-[100px]">
                                         <p className="text-[13px] font-bold text-black leading-relaxed italic">"{note.clinicalProgress}"</p>
                                      </div>
                                      {note.testResults && (
                                         <div className="p-4 bg-emerald-50/30 rounded-xl border border-emerald-100">
                                            <p className="text-[8px] font-black text-emerald-600 uppercase tracking-widest opacity-60 mb-1">Lab Observations</p>
                                            <p className="text-[11px] font-black text-emerald-700 italic">{note.testResults}</p>
                                         </div>
                                      )}
                                   </div>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                   </div>
                </div>
             </div>
          )}

          {activeTab === 'labs' && (
             <div className="space-y-16 animate-slide-up">
                <div className="flex flex-col md:flex-row justify-between items-center gap-10 border-b border-slate-100 pb-10">
                   <div className="space-y-2">
                     <LabelBlock label="Digital Lab Ledger" />
                     <h2 className="text-3xl font-black text-black tracking-tight">Comprehensive Investigation Reports</h2>
                   </div>
                 </div>

                 {/* Lab Report Artifacts Hidden as per request - Text extracted below */}

                <div className="grid grid-cols-1 gap-16">
                   {clinicalCase.intensiveData.labReports.bmp.length > 0 && (
                     <LabTable title="Metabolic Profile & Biochemistry" data={clinicalCase.intensiveData.labReports.bmp} />
                   )}
                   {clinicalCase.intensiveData.labReports.cbc.length > 0 && (
                     <LabTable title="Complete Blood Counts & Hematology" data={clinicalCase.intensiveData.labReports.cbc} />
                   )}
                   {clinicalCase.intensiveData.labReports.bmp.length === 0 && clinicalCase.intensiveData.labReports.cbc.length === 0 && (
                     <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                       <p className="text-slate-400 font-bold italic text-lg">No laboratory data extracted for this case.</p>
                       <p className="text-slate-300 text-xs uppercase tracking-widest mt-2">Neural OCR engine found no valid parameters</p>
                     </div>
                   )}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

const LabelBlock = ({ label, color = "slate" }: { label: string; color?: string }) => (
  <div className="flex items-center gap-6">
    <div className={`w-3 h-10 rounded-full ${color === 'blue' ? 'bg-blue-600' : color === 'red' ? 'bg-red-600' : color === 'indigo' ? 'bg-indigo-600' : 'bg-[#172554]'}`}></div>
    <h4 className="text-[11px] font-black uppercase tracking-[0.4em] text-black">{label}</h4>
  </div>
);

const StatPanel = ({ label, value, highlighted = false, icon }: { label: string; value: string; highlighted?: boolean; icon?: React.ReactNode }) => (
  <div className={`p-6 rounded-3xl border transition-all flex flex-col justify-between min-h-[140px] ${highlighted ? 'bg-[#172554] text-white border-[#172554] shadow-xl' : 'bg-slate-50 border-slate-200 text-black shadow-sm hover:shadow-md'}`}>
    <div className="flex justify-between items-start">
      <p className={`text-[9px] font-black uppercase tracking-widest ${highlighted ? 'text-blue-400' : 'text-black'}`}>{label}</p>
      {icon && <div className={`${highlighted ? 'text-blue-400' : 'text-blue-600'} opacity-50`}>{icon}</div>}
    </div>
    <p className="text-lg font-black leading-tight mt-4 line-clamp-2">{value}</p>
  </div>
);

const LabTable = ({ title, data }: { title: string; data: LabResult[] }) => (
  <div className="space-y-8">
    <div className="flex items-center gap-6">
       <div className="w-1.5 h-12 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>
       <div>
         <h6 className="text-[13px] font-black uppercase tracking-[0.3em] text-black">{title}</h6>
         <p className="text-[9px] font-bold text-black uppercase tracking-widest mt-1">Validated Diagnostic Data</p>
       </div>
    </div>
    <div className="bg-white rounded-[3rem] border-4 border-slate-50 shadow-2xl overflow-hidden">
       <div className="overflow-x-auto">
         <table className="w-full text-left min-w-[800px]">
            <thead className="bg-blue-50/50 border-b border-slate-200">
               <tr className="text-[10px] font-black text-slate-900 uppercase tracking-widest">
                  <th className="px-10 py-6 border-r border-slate-200/50">Parameter</th>
                  <th className="px-10 py-6 border-r border-slate-200/50">Result</th>
                  <th className="px-10 py-6 border-r border-slate-200/50">Specimen</th>
                  <th className="px-10 py-6 border-r border-slate-200/50">Ref. Range</th>
                  <th className="px-10 py-6">Method</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
               {data.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors group">
                     <td className="px-10 py-6 border-r border-slate-100 text-[13px] font-black text-black group-hover:text-blue-600 transition-colors">{row.parameter}</td>
                     <td className={`px-10 py-6 border-r border-slate-100 text-[16px] font-black ${row.status === 'Normal' ? 'text-emerald-600' : 'text-red-600'}`}>
                       {row.actual}
                       {row.unit && <span className="ml-2 text-[10px] font-black bg-slate-100 px-2 py-1 rounded text-slate-500 uppercase tracking-tighter">{row.unit}</span>}
                     </td>
                     <td className="px-10 py-6 border-r border-slate-100 text-[12px] font-bold text-black">{row.specimen || 'N/A (AI Guess)'}</td>
                     <td className="px-10 py-6 border-r border-slate-100 text-[12px] font-bold text-black">{row.biologicalReferences || 'N/A (AI Guess)'}</td>
                     <td className="px-10 py-6 text-[12px] font-bold text-black">
                       {row.method || 'N/A (AI Guess)'}
                       {(row.method?.includes('AI Analysis') || row.method?.includes('AI Guess')) && (
                         <span className="block text-[9px] text-blue-500 mt-1.5 uppercase tracking-tighter font-black bg-blue-50 px-2 py-0.5 rounded-full w-fit">AI Inference</span>
                       )}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
       </div>
    </div>
  </div>
);

export default CaseDetailView;
