
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { MOCK_CASES as INITIAL_MOCK_CASES } from './constants';
import { ClinicalCase, Subject } from './types';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import CaseDetailView from './components/CaseDetailView';
import CaseComparisonView from './components/CaseComparisonView';
import QuickSummaryView from './components/QuickSummaryView';
import AIAssistant from './components/AIAssistant';
import Calculators from './components/Calculators';
import AdminDashboard from './components/AdminDashboard';
import QuestionaryView from './components/QuestionaryView';

import { supabase } from './src/supabase';

const App: React.FC = () => {
  const [userRole, setUserRole] = useState<'doctor' | 'admin' | null>(null);
  const [view, setView] = useState<'landing' | 'dashboard' | 'detail' | 'comparison' | 'summary' | 'calculators' | 'admin' | 'questionary'>('landing');
  const [activeTab, setActiveTab] = useState<string>('primary_details');
  const [allCases, setAllCases] = useState<ClinicalCase[]>(INITIAL_MOCK_CASES);
  const [loading, setLoading] = useState(true);
  const [selectedCaseId, setSelectedCaseId] = useState<string | null>(null);
  const [compareCaseId, setCompareCaseId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isAIAssistantOpen, setIsAIAssistantOpen] = useState(false);
  const [isActionHubExpanded, setIsActionHubExpanded] = useState(false);

  useEffect(() => {
    const fetchCases = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('clinical_cases')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
          // Map the Supabase data back to ClinicalCase objects
          const cases = data.map(item => item.data as ClinicalCase);
          setAllCases(cases);
        }
      } catch (err) {
        console.error('Error fetching cases from Supabase:', err);
        // Fallback to mock cases if Supabase fails
      } finally {
        setLoading(false);
      }
    };

    fetchCases();
  }, []);

  const filteredCases = useMemo(() => {
    return allCases.filter(c => {
      const matchesSearch = c.diseaseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          c.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = !selectedSubject || c.subject === selectedSubject;
      return matchesSearch && matchesSubject;
    });
  }, [searchQuery, selectedSubject, allCases]);

  const selectedCase = useMemo(() => 
    allCases.find(c => c.id === selectedCaseId), 
  [selectedCaseId, allCases]);

  const compareCase = useMemo(() => 
    allCases.find(c => c.id === compareCaseId), 
  [compareCaseId, allCases]);

  const handleSelectRole = (role: 'doctor' | 'admin') => {
    setUserRole(role);
    setView(role === 'admin' ? 'admin' : 'dashboard');
  };

  const handleExitPortal = () => {
    setUserRole(null);
    setView('landing');
    setSelectedCaseId(null);
    setSelectedSubject(null);
    setIsActionHubExpanded(false);
  };
  
  const handleSelectCase = (id: string) => {
    setSelectedCaseId(id);
    setView('detail');
    setActiveTab('primary_details');
  };

  const handleCompareWithSimilar = (caseId: string) => {
    const current = allCases.find(c => c.id === caseId);
    if (!current) return;
    
    const similar = allCases.find(c => c.subject === current.subject && c.id !== caseId);
    if (similar) {
      setSelectedCaseId(caseId);
      setCompareCaseId(similar.id);
      setView('comparison');
    } else {
      alert("No other similar cases found in this specialty to compare with.");
    }
  };

  const handleVoiceNavigate = useCallback((target: { view?: string; tab?: string; subject?: string; caseId?: string }) => {
    if (userRole !== 'doctor') return;
    if (target.subject) {
      setSelectedSubject(target.subject as Subject);
      setView('dashboard');
    }
    if (target.caseId) {
      const found = allCases.find(c => c.id === target.caseId || c.id.toLowerCase().includes(target.caseId.toLowerCase()));
      if (found) {
        setSelectedCaseId(found.id);
        setView('detail');
        setActiveTab(target.tab || 'primary_details');
      }
    } else if (target.tab) {
      const validTabs = ['primary_details', 'history', 'labs', 'imaging', 'treatment', 'opinion'];
      if (validTabs.includes(target.tab)) {
        setActiveTab(target.tab);
        if (view !== 'detail') setView('detail');
      }
    }
    if (target.view) {
      const validViews = ['dashboard', 'detail', 'comparison', 'summary', 'calculators'];
      if (validViews.includes(target.view)) setView(target.view as any);
    }
  }, [allCases, userRole, view]);

  const handleAddCase = (newCase: ClinicalCase) => {
    setAllCases(prev => [newCase, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900">
      {userRole && view !== 'landing' && (
        <div className="fixed bottom-8 right-8 z-[70] flex flex-col items-end gap-4">
          {isActionHubExpanded && (
            <div className="flex flex-col items-end gap-3 mb-2 animate-slide-in">
              {userRole === 'doctor' && (
                <button 
                  onClick={() => { setIsAIAssistantOpen(true); setIsActionHubExpanded(false); }}
                  className="bg-[#172554] text-white py-4 px-6 rounded-2xl shadow-2xl hover:bg-blue-900 transition-all flex items-center gap-4 border border-blue-400/20"
                >
                  <div className="w-2.5 h-2.5 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-[11px] font-bold tracking-widest uppercase">Consult Deeksha</span>
                </button>
              )}
              
              <button 
                onClick={handleExitPortal}
                className="bg-white text-red-600 border border-red-100 py-4 px-6 rounded-2xl shadow-xl hover:bg-red-50 transition-all flex items-center gap-4"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                <span className="text-[11px] font-bold tracking-widest uppercase">Exit Portal</span>
              </button>
            </div>
          )}
          
          <button 
            onClick={() => setIsActionHubExpanded(!isActionHubExpanded)}
            className={`w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all transform active:scale-90 ${isActionHubExpanded ? 'bg-red-500 text-white rotate-45' : 'bg-[#172554] text-white hover:bg-blue-900'}`}
          >
            {isActionHubExpanded ? (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      )}

      {view === 'landing' && <LandingPage onSelectRole={handleSelectRole} />}
      
      {view === 'dashboard' && userRole === 'doctor' && (
        <Dashboard 
          cases={allCases}
          onSelectCase={handleSelectCase}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedSubject={selectedSubject}
          setSelectedSubject={setSelectedSubject}
          onOpenCalculators={() => setView('calculators')}
        />
      )}

      {view === 'admin' && userRole === 'admin' && (
        <AdminDashboard 
          cases={allCases} 
          onAddCase={handleAddCase} 
          onClose={handleExitPortal} 
        />
      )}

      {view === 'detail' && selectedCase && (
        <CaseDetailView 
          clinicalCase={selectedCase} 
          onBack={() => setView('dashboard')}
          onCompare={(id) => handleCompareWithSimilar(id)}
          onShowSummary={() => setView('summary')}
          onOpenAI={() => setIsAIAssistantOpen(true)}
          onOpenQuestionary={() => setView('questionary')}
          externalActiveTab={activeTab}
          onTabChange={setActiveTab}
        />
      )}

      {view === 'comparison' && selectedCase && compareCase && (
        <CaseComparisonView case1={selectedCase} case2={compareCase} onBack={() => setView('detail')} />
      )}

      {view === 'summary' && selectedCase && (
        <QuickSummaryView clinicalCase={selectedCase} onBack={() => setView('detail')} />
      )}

      {view === 'questionary' && selectedCase && (
        <QuestionaryView clinicalCase={selectedCase} onBack={() => setView('detail')} />
      )}

      {view === 'calculators' && (
        <Calculators onBack={() => setView('dashboard')} />
      )}

      {isAIAssistantOpen && (
        <AIAssistant activeCase={selectedCase} onClose={() => setIsAIAssistantOpen(false)} onNavigate={handleVoiceNavigate} />
      )}
    </div>
  );
};

export default App;
