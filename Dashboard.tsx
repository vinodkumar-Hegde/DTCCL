
import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ClinicalCase, Subject, Severity } from '../types';
import { SUBJECT_ICONS, MOCK_CASES, SUBJECT_HIERARCHY } from '../constants';

interface Props {
  cases: ClinicalCase[];
  onSelectCase: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedSubject: Subject | null;
  setSelectedSubject: (s: Subject | null) => void;
  onOpenCalculators: () => void;
}

const Dashboard: React.FC<Props> = ({ 
  cases, 
  onSelectCase, 
  searchQuery, 
  setSearchQuery, 
  selectedSubject, 
  setSelectedSubject,
  onOpenCalculators
}) => {
  const [selectedSuperSpec, setSelectedSuperSpec] = useState<string | null>(null);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);

  const subjects: Subject[] = ['Medicine', 'Surgery', 'ENT', 'OBG', 'Pediatrics'];

  const getSubjectCount = (subject: Subject) => {
    return cases.filter(c => c.subject === subject).length;
  };

  const getSuperSpecCount = (subject: Subject, superSpec: string) => {
    return cases.filter(c => c.subject === subject && c.superSpeciality === superSpec).length;
  };

  const getDiseaseCount = (subject: Subject, superSpec: string, disease: string) => {
    return cases.filter(c => c.subject === subject && c.superSpeciality === superSpec && c.disease === disease).length;
  };

  const superSpecialities = useMemo(() => {
    if (!selectedSubject) return [];
    // Combine predefined hierarchy with any dynamic ones from cases
    const predefined = SUBJECT_HIERARCHY[selectedSubject] || [];
    const dynamic = cases.filter(c => c.subject === selectedSubject).map(c => c.superSpeciality);
    return Array.from(new Set([...predefined, ...dynamic]));
  }, [cases, selectedSubject]);

  const diseases = useMemo(() => {
    if (!selectedSubject || !selectedSuperSpec) return [];
    const ds = new Set(cases.filter(c => c.subject === selectedSubject && c.superSpeciality === selectedSuperSpec).map(c => c.disease));
    return Array.from(ds);
  }, [cases, selectedSubject, selectedSuperSpec]);

  const filteredCases = useMemo(() => {
    return cases.filter(c => {
      const matchesSearch = c.diseaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = !selectedSubject || c.subject === selectedSubject;
      const matchesSuperSpec = !selectedSuperSpec || c.superSpeciality === selectedSuperSpec;
      const matchesDisease = !selectedDisease || c.disease === selectedDisease;
      return matchesSearch && matchesSubject && matchesSuperSpec && matchesDisease;
    });
  }, [cases, searchQuery, selectedSubject, selectedSuperSpec, selectedDisease]);

  const getSeverityStyles = (severity: Severity) => {
    switch (severity) {
      case 'Complicated': return 'bg-red-50 text-red-600 border-red-100';
      case 'Moderate': return 'bg-amber-50 text-amber-600 border-amber-100';
      default: return 'bg-emerald-50 text-emerald-600 border-emerald-100';
    }
  };

  const handleBack = () => {
    if (selectedDisease) {
      setSelectedDisease(null);
    } else if (selectedSuperSpec) {
      setSelectedSuperSpec(null);
    } else if (selectedSubject) {
      setSelectedSubject(null);
    }
  };

  const resetNavigation = () => {
    setSelectedSubject(null);
    setSelectedSuperSpec(null);
    setSelectedDisease(null);
  };

  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase();
    const matches = new Set<string>();
    cases.forEach(c => {
      if (c.diseaseName.toLowerCase().includes(query)) matches.add(c.diseaseName);
      if (c.id.toLowerCase().includes(query)) matches.add(c.id);
      if (c.superSpeciality.toLowerCase().includes(query)) matches.add(c.superSpeciality);
    });
    return Array.from(matches).slice(0, 5);
  }, [cases, searchQuery]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] animate-fade-in pb-32 relative overflow-hidden">
      {/* DNA Helix Graphic Background */}
      <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden z-0">
        <div className="w-64 h-full opacity-[0.05] flex flex-col justify-around items-center">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              animate={{ 
                rotateY: 360,
                x: Math.sin(i * 0.4) * 60
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "linear",
                delay: i * 0.2 
              }}
              className="relative w-full flex justify-center items-center"
            >
              <div className="w-4 h-4 rounded-full bg-blue-600 shadow-xl shadow-blue-600/40"></div>
              <div className="w-24 h-0.5 bg-gradient-to-r from-blue-600 via-slate-300 to-emerald-600"></div>
              <div className="w-4 h-4 rounded-full bg-emerald-600 shadow-xl shadow-emerald-600/40"></div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Header Section */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-40 px-6 py-4 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer" onClick={resetNavigation}>
            <div className="w-10 h-10 bg-[#172554] rounded-xl flex items-center justify-center text-white shadow-lg">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-[#172554] tracking-tight">DocTutorials CCL</h1>
                <span className="text-[7px] font-black bg-blue-600 text-white px-1.5 py-0.5 rounded shadow-sm">PRO</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={onOpenCalculators} className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 text-[#172554] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
              Tools
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12 md:px-12">
        {!selectedSubject && (
          <div className="mb-20 space-y-12 text-center max-w-4xl mx-auto">
            <div className="space-y-4">
              <h2 className="text-5xl md:text-6xl font-black text-[#172554] tracking-tight leading-tight">
                DocTutorials <span className="text-blue-600">CCL</span>
              </h2>
              <p className="text-slate-500 font-medium text-xl">Search across thousands of specialized case journeys and diagnostic maps.</p>
            </div>

            {/* Centered Search Bar with Auto-suggestions */}
            <div className="relative max-w-2xl mx-auto group">
              <div className="absolute inset-y-0 left-0 pl-7 flex items-center pointer-events-none">
                <svg className="w-6 h-6 text-slate-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              </div>
              <input 
                type="text"
                placeholder="Search by disease, symptom, or Case ID..."
                className="w-full bg-white border-2 border-slate-200 rounded-[2.5rem] pl-16 pr-8 py-7 focus:border-blue-500 outline-none transition-all text-lg font-bold shadow-xl shadow-blue-900/5"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              
              {suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-4 bg-white rounded-[2rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  {suggestions.map((s, i) => (
                    <button 
                      key={i}
                      onClick={() => setSearchQuery(s)}
                      className="w-full text-left px-8 py-5 hover:bg-slate-50 text-sm font-bold text-[#172554] flex items-center gap-4 border-b border-slate-50 last:border-0"
                    >
                      <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Breadcrumbs / Navigation Header */}
        {(selectedSubject || selectedSuperSpec || selectedDisease) && (
          <div className="mb-12 flex items-center gap-4 bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm animate-fade-in">
            <button 
              onClick={handleBack}
              className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#172554] hover:text-white transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
            </button>
            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest overflow-x-auto whitespace-nowrap scrollbar-hide">
              <button onClick={resetNavigation} className="text-slate-400 hover:text-blue-600 transition-colors">Registry</button>
              {selectedSubject && (
                <>
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <button onClick={() => { setSelectedSuperSpec(null); setSelectedDisease(null); }} className={`${!selectedSuperSpec ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'} transition-colors`}>{selectedSubject}</button>
                </>
              )}
              {selectedSuperSpec && (
                <>
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <button onClick={() => setSelectedDisease(null)} className={`${!selectedDisease ? 'text-blue-600' : 'text-slate-400 hover:text-blue-600'} transition-colors`}>{selectedSuperSpec}</button>
                </>
              )}
              {selectedDisease && (
                <>
                  <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                  <span className="text-blue-600">{selectedDisease}</span>
                </>
              )}
            </div>
          </div>
        )}

        {!selectedSubject ? (
          /* SUBJECT SELECTION */
          <div className="space-y-12 animate-slide-up">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {subjects.map(sub => (
                <button 
                  key={sub}
                  onClick={() => setSelectedSubject(sub)}
                  className="group bg-white p-8 rounded-[3rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center relative overflow-hidden"
                >
                  <div className="w-14 h-14 bg-slate-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#172554] group-hover:text-white transition-all shadow-inner border border-slate-100">
                    {SUBJECT_ICONS[sub]}
                  </div>
                  <h3 className="text-lg font-black text-[#172554] mb-2">{sub}</h3>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{getSubjectCount(sub)} Cases</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : !selectedSuperSpec ? (
          /* SUPER SPECIALITY SELECTION */
          <div className="space-y-12 animate-slide-up">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl font-black text-[#172554] tracking-tight">{selectedSubject} Super Specialities</h2>
              <p className="text-slate-500 font-medium">Drill down into specific departments within {selectedSubject}.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {superSpecialities.map(spec => (
                <button 
                  key={spec}
                  onClick={() => setSelectedSuperSpec(spec)}
                  className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between text-left"
                >
                  <div>
                    <h3 className="text-xl font-black text-[#172554] mb-1">{spec}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getSuperSpecCount(selectedSubject, spec)} Disease Profiles</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-[#172554] group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : !selectedDisease ? (
          /* DISEASE SELECTION */
          <div className="space-y-12 animate-slide-up">
            <div className="text-center max-w-3xl mx-auto space-y-4">
              <h2 className="text-3xl font-black text-[#172554] tracking-tight">{selectedSuperSpec} Diseases</h2>
              <p className="text-slate-500 font-medium">Select a specific condition to view associated clinical cases.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {diseases.map(disease => (
                <button 
                  key={disease}
                  onClick={() => setSelectedDisease(disease)}
                  className="group bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-between text-left"
                >
                  <div>
                    <h3 className="text-xl font-black text-[#172554] mb-1">{disease}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{getDiseaseCount(selectedSubject, selectedSuperSpec, disease)} Cases Available</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center group-hover:bg-[#172554] group-hover:text-white transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* CASE LIST VIEW */
          <div className="space-y-12 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCases.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => onSelectCase(c.id)}
                  className="bg-white rounded-[3.5rem] p-8 border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group relative overflow-hidden flex flex-col min-h-[320px]"
                >
                  <div className="absolute top-0 right-0 p-12 opacity-[0.02] text-[#172554] pointer-events-none group-hover:scale-150 transition-transform duration-700">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/></svg>
                  </div>
                  
                  <div className="flex justify-between items-start mb-8 relative z-10">
                    <span className="px-4 py-1.5 bg-slate-50 text-[#172554] rounded-lg text-[9px] font-black uppercase tracking-widest border border-slate-100 group-hover:bg-[#172554] group-hover:text-white transition-colors">{c.id}</span>
                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getSeverityStyles(c.severity)}`}>{c.severity}</span>
                  </div>

                  <h4 className="text-xl font-black text-[#172554] mb-4 group-hover:text-blue-600 transition-colors tracking-tight leading-tight relative z-10">{c.diseaseName}</h4>
                  <p className="text-[11px] font-medium text-slate-500 leading-relaxed italic line-clamp-3 opacity-80 mb-8 relative z-10">"{c.outpatientSummary}"</p>
                  
                  <div className="mt-auto pt-8 border-t border-slate-50 flex justify-between items-center relative z-10">
                    <div className="flex flex-col">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Patient Profile</p>
                      <p className="text-sm font-black text-slate-700">{c.patientDetails.age}Y / {c.patientDetails.gender}</p>
                    </div>
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-[#172554] group-hover:text-white transition-all shadow-sm">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </div>
                  </div>
                </div>
              ))}
              {filteredCases.length === 0 && (
                <div className="col-span-full py-40 text-center bg-white rounded-[4rem] border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-bold italic">No matching case records found for this criteria.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
