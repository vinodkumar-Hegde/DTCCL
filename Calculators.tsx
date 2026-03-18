
import React, { useState, useRef } from 'react';
import { analyzeMedicalImage, validateClinicalData } from '../services/geminiService';

interface Props {
  onBack: () => void;
}

type CalcType = 'bmi' | 'gfr' | 'apgar' | 'dose' | 'bishop' | 'edd' | 'xray' | 'ecg' | 'pid' | 'endo' | 'chads' | 'hasbled' | 'heart' | 'timi' | 'grace' | 'duke' | 'wells' | 'validator';

const Calculators: React.FC<Props> = ({ onBack }) => {
  const [activeCalc, setActiveCalc] = useState<CalcType | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fade-in pb-32">
      <header className="mb-10 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center text-[#172554] font-black text-xs tracking-widest uppercase hover:underline group">
          <div className="p-2 bg-blue-50 rounded-lg mr-3 group-hover:bg-blue-600 group-hover:text-white transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7" /></svg>
          </div>
          Back to Hub
        </button>
        <div className="text-right">
          <h2 className="text-2xl font-black text-[#172554] tracking-tighter">Clinical Tools</h2>
          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">DT-CCA Decision Support</p>
        </div>
      </header>

      {!activeCalc ? (
        <div className="space-y-12">
          <div>
            <SectionTitle title="General Clinical" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <CalcCard 
                title="BMI" 
                desc="Body Mass Index & BSA" 
                detail="Calculate body mass index and surface area for nutritional and dosing assessment."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                onClick={() => setActiveCalc('bmi')}
              />
              <CalcCard 
                title="eGFR" 
                desc="Glomerular Filtration Rate" 
                detail="MDRD equation for estimating renal function and staging chronic kidney disease."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.288a2 2 0 01-1.643.021l-4.238-1.815a1 1 0 00-.796.012l-1.928.895m-4 5c.749-3.616 1.03-5.596 1.247-8.421C2.047 7.632 2 5.062 2 3h12a1 1 0 011 1v11.414l1.293 1.293a1 1 0 001.414 0l1.293-1.293V4a1 1 0 011-1h2a1 1 0 011 1v11.414l1.293 1.293a1 1 0 001.414 0l1.293-1.293V4a1 1 0 011-1h2a1 1 0 011 1v14l-4 4z" /></svg>}
                onClick={() => setActiveCalc('gfr')}
              />
              <CalcCard 
                title="APGAR" 
                desc="Neonatal Assessment" 
                detail="Standardized 1 and 5-minute scoring for newborn clinical status evaluation."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>}
                onClick={() => setActiveCalc('apgar')}
              />
              <CalcCard 
                title="Pharmacology" 
                desc="mg/kg Body Weight" 
                detail="Precision weight-based dosing calculator for pediatric and critical care medications."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                onClick={() => setActiveCalc('dose')}
              />
            </div>
          </div>

          <div>
            <SectionTitle title="Cardiology Decision Support" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <CalcCard 
                title="CHA₂DS₂-VASc" 
                desc="Stroke Risk in AFib" 
                detail="Validated score for predicting stroke risk in patients with non-valvular atrial fibrillation."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                onClick={() => setActiveCalc('chads')}
              />
              <CalcCard 
                title="HAS-BLED" 
                desc="Bleeding Risk Score" 
                detail="Assesses the 1-year risk of major bleeding in patients on anticoagulation for AFib."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                onClick={() => setActiveCalc('hasbled')}
              />
              <CalcCard 
                title="HEART Score" 
                desc="Chest Pain Risk" 
                detail="Predicts 6-week risk of Major Adverse Cardiac Events (MACE) in ED chest pain patients."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                onClick={() => setActiveCalc('heart')}
              />
              <CalcCard 
                title="TIMI Score" 
                desc="STEMI Mortality" 
                detail="Predicts 30-day mortality in patients with ST-elevation myocardial infarction (STEMI)."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                onClick={() => setActiveCalc('timi')}
              />
              <CalcCard 
                title="GRACE Score" 
                desc="ACS Risk Staging" 
                detail="Estimates in-hospital and 6-month mortality across the spectrum of acute coronary syndromes."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>}
                onClick={() => setActiveCalc('grace')}
              />
              <CalcCard 
                title="Duke Treadmill" 
                desc="Stress Test Risk" 
                detail="Predicts 5-year survival and risk in patients undergoing exercise treadmill testing."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                onClick={() => setActiveCalc('duke')}
              />
              <CalcCard 
                title="Wells' Criteria" 
                desc="PE Risk Assessment" 
                detail="Clinical prediction rule for estimating the probability of pulmonary embolism (PE)."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                onClick={() => setActiveCalc('wells')}
              />
            </div>
          </div>

          <div>
            <SectionTitle title="Gynecology & Obstetrics" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <CalcCard 
                title="Bishop Score" 
                desc="Cervical Ripeness" 
                detail="Predicts the likelihood of successful vaginal delivery following induction of labor."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                onClick={() => setActiveCalc('bishop')}
              />
              <CalcCard 
                title="EDD & GA" 
                desc="Pregnancy Mapping" 
                detail="Calculates estimated due date and current gestational age based on LMP."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                onClick={() => setActiveCalc('edd')}
              />
              <CalcCard 
                title="PID Risk" 
                desc="Pelvic Inflammatory Disease" 
                detail="Clinical criteria scoring for assessing the risk of pelvic inflammatory disease."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                onClick={() => setActiveCalc('pid')}
              />
              <CalcCard 
                title="rASRM Endo" 
                desc="Endometriosis Staging" 
                detail="Revised American Society for Reproductive Medicine staging for endometriosis."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.628.288a2 2 0 01-1.643.021l-4.238-1.815a1 1 0 00-.796.012l-1.928.895m-4 5c.749-3.616 1.03-5.596 1.247-8.421C2.047 7.632 2 5.062 2 3h12a1 1 0 011 1v11.414l1.293 1.293a1 1 0 001.414 0l1.293-1.293V4a1 1 0 011-1h2a1 1 0 011 1v11.414l1.293 1.293a1 1 0 001.414 0l1.293-1.293V4a1 1 0 011-1h2a1 1 0 011 1v14l-4 4z" /></svg>}
                onClick={() => setActiveCalc('endo')}
              />
            </div>
          </div>

          <div>
            <SectionTitle title="Advanced AI Diagnostics" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <CalcCard 
                title="MONAI Analyzer" 
                desc="Neural Image Ingestion" 
                detail="Advanced neural diagnostic engine for automated radiograph and artifact analysis."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                onClick={() => setActiveCalc('xray')}
              />
              <CalcCard 
                title="ECG Neural" 
                desc="Waveform Pattern Analysis" 
                detail="AI-powered ECG interpretation for identifying complex arrhythmias and patterns."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                onClick={() => setActiveCalc('ecg')}
              />
              <CalcCard 
                title="Health Validator" 
                desc="Google Health API Sync" 
                detail="Validates clinical data against international standards (WHO, ICD-11, HL7)."
                icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>}
                onClick={() => setActiveCalc('validator')}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[4rem] shadow-2xl border border-slate-100 overflow-hidden animate-slide-up max-w-5xl mx-auto">
          <div className="bg-[#172554] p-10 text-white flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tight">
                {activeCalc === 'edd' ? 'Pregnancy Mapping' : 
                 activeCalc === 'bishop' ? 'Bishop Score' : 
                 activeCalc === 'xray' ? 'MONAI Analyzer' : 
                 activeCalc === 'ecg' ? 'ECG Neural Analyzer' : 
                 activeCalc === 'pid' ? 'PID Risk Score' : 
                 activeCalc === 'endo' ? 'Endometriosis Stage' : 
                 activeCalc === 'chads' ? 'CHA₂DS₂-VASc Score' :
                 activeCalc === 'hasbled' ? 'HAS-BLED Score' :
                 activeCalc === 'heart' ? 'HEART Score' :
                 activeCalc === 'timi' ? 'TIMI Score (STEMI)' :
                 activeCalc === 'grace' ? 'GRACE Risk Score' :
                 activeCalc === 'duke' ? 'Duke Treadmill Score' :
                 activeCalc === 'wells' ? "Wells' Criteria (PE)" :
                 activeCalc === 'validator' ? 'Clinical Data Validator' :
                 activeCalc.toUpperCase()} Tool
              </h3>
              <p className="text-blue-300 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Validated Medical Algorithm</p>
            </div>
            <button onClick={() => setActiveCalc(null)} className="p-3 bg-white/10 rounded-2xl hover:bg-white/20 transition-all">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <div className="p-10 lg:p-16">
            {activeCalc === 'bmi' && <BMICalculator />}
            {activeCalc === 'gfr' && <GFRCalculator />}
            {activeCalc === 'apgar' && <APGARCalculator />}
            {activeCalc === 'dose' && <DoseCalculator />}
            {activeCalc === 'bishop' && <BishopScoreCalculator />}
            {activeCalc === 'edd' && <EDDCalculator />}
            {activeCalc === 'pid' && <PIDRiskCalculator />}
            {activeCalc === 'endo' && <EndoStagingCalculator />}
            {activeCalc === 'chads' && <CHADSVAScCalculator />}
            {activeCalc === 'hasbled' && <HasBledCalculator />}
            {activeCalc === 'heart' && <HeartScoreCalculator />}
            {activeCalc === 'timi' && <TIMIScoreCalculator />}
            {activeCalc === 'grace' && <GraceScoreCalculator />}
            {activeCalc === 'duke' && <DukeTreadmillCalculator />}
            {activeCalc === 'wells' && <WellsCalculator />}
            {activeCalc === 'validator' && <ClinicalValidatorTool />}
            {(activeCalc === 'xray' || activeCalc === 'ecg') && <ImageDiagnosticTool type={activeCalc} />}
          </div>
        </div>
      )}
    </div>
  );
};

const SectionTitle = ({ title }: { title: string }) => (
  <div className="col-span-full mt-8 mb-4 flex items-center gap-4">
    <div className="w-2 h-6 bg-blue-600 rounded-full"></div>
    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">{title}</h3>
  </div>
);

const CalcCard: React.FC<{ title: string; desc: string; detail: string; icon: React.ReactNode; onClick: () => void }> = ({ title, desc, detail, icon, onClick }) => (
  <button 
    onClick={onClick}
    className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all flex flex-col items-center text-center group relative overflow-hidden"
  >
    <div className="w-20 h-20 bg-slate-50 text-blue-600 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-inner">
      {icon}
    </div>
    <h4 className="text-xl font-black text-[#172554] mb-2">{title}</h4>
    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-4">{desc}</p>
    <p className="text-[11px] font-medium text-slate-400 leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500">{detail}</p>
    
    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-emerald-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
  </button>
);

const ClinicalValidatorTool = () => {
  const [data, setData] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleValidate = async () => {
    if (!data) return;
    setIsValidating(true);
    const validation = await validateClinicalData({ raw_text: data });
    setResult(validation);
    setIsValidating(false);
  };

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Clinical Data Stream</label>
          <textarea 
            value={data}
            onChange={(e) => setData(e.target.value)}
            placeholder="Paste patient vitals, symptoms, or lab results here for Google Health API validation..."
            className="w-full h-64 bg-slate-50 border border-slate-100 rounded-[2rem] p-8 text-sm font-bold text-slate-700 outline-none focus:border-blue-600 transition-all shadow-inner resize-none"
          />
        </div>
        <button 
          onClick={handleValidate}
          disabled={!data || isValidating}
          className="w-full py-6 bg-[#172554] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-900 transition-all disabled:opacity-30 flex items-center justify-center gap-4"
        >
          {isValidating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Syncing with Google Health...
            </>
          ) : 'Validate Clinical Data'}
        </button>
      </div>
      <div className="bg-slate-50 rounded-[3rem] p-10 shadow-inner flex flex-col min-h-[400px]">
        <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-8 flex items-center gap-3">
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          Validation Report
        </h5>
        
        {result ? (
          <div className="space-y-8 animate-fade-in">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                <p className={`text-2xl font-black uppercase tracking-tight ${result.status === 'Valid' ? 'text-emerald-600' : 'text-amber-600'}`}>{result.status}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Integrity Score</p>
                <p className="text-4xl font-black text-[#172554]">{result.score}%</p>
              </div>
            </div>
            <div className="space-y-4">
              {result.findings.map((f: string, i: number) => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="w-6 h-6 flex-shrink-0 bg-blue-50 rounded-lg flex items-center justify-center text-[10px] font-black text-blue-600">
                    {i+1}
                  </div>
                  <p className="text-xs font-bold text-slate-600 leading-relaxed">{f}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Data Stream</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CHADSVAScCalculator = () => {
  const [criteria, setCriteria] = useState({
    age75: false,
    age65: false,
    female: false,
    hf: false,
    htn: false,
    stroke: false,
    vascular: false,
    dm: false
  });

  const score = (criteria.age75 ? 2 : 0) + 
                (criteria.age65 ? 1 : 0) + 
                (criteria.female ? 1 : 0) + 
                (criteria.hf ? 1 : 0) + 
                (criteria.htn ? 1 : 0) + 
                (criteria.stroke ? 2 : 0) + 
                (criteria.vascular ? 1 : 0) + 
                (criteria.dm ? 1 : 0);

  const getRisk = () => {
    if (score >= 2) return { risk: 'High Risk', recommendation: 'Oral anticoagulation recommended.' };
    if (score === 1) return { risk: 'Moderate Risk', recommendation: 'Consider oral anticoagulation.' };
    return { risk: 'Low Risk', recommendation: 'No anticoagulation required.' };
  };

  const risk = getRisk();

  const items = [
    { key: 'hf', label: 'Congestive Heart Failure', points: 1 },
    { key: 'htn', label: 'Hypertension', points: 1 },
    { key: 'age75', label: 'Age ≥ 75 years', points: 2 },
    { key: 'dm', label: 'Diabetes Mellitus', points: 1 },
    { key: 'stroke', label: 'Stroke / TIA / Thromboembolism', points: 2 },
    { key: 'vascular', label: 'Vascular Disease (MI, PAD, etc)', points: 1 },
    { key: 'age65', label: 'Age 65-74 years', points: 1 },
    { key: 'female', label: 'Female Sex', points: 1 },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {items.map(item => (
          <button 
            key={item.key}
            onClick={() => setCriteria({...criteria, [item.key]: !criteria[item.key as keyof typeof criteria]})}
            className={`w-full p-6 rounded-2xl flex items-center justify-between border transition-all ${criteria[item.key as keyof typeof criteria] ? 'bg-[#172554] text-white border-[#172554] shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'}`}
          >
            <span className="text-xs font-bold">{item.label}</span>
            <span className="text-[10px] font-black opacity-60">+{item.points}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">CHA₂DS₂-VASc Score</p>
        <p className="text-8xl font-black text-[#172554]">{score}</p>
        <div className="mt-8 space-y-2">
           <p className={`text-xl font-black uppercase tracking-tight ${score >= 2 ? 'text-red-600' : 'text-emerald-600'}`}>{risk.risk}</p>
           <p className="text-[11px] font-medium text-slate-500 max-w-[200px] mx-auto italic">"{risk.recommendation}"</p>
        </div>
      </div>
    </div>
  );
};

const HasBledCalculator = () => {
  const [criteria, setCriteria] = useState({
    htn: false,
    renal: false,
    liver: false,
    stroke: false,
    bleeding: false,
    inr: false,
    elderly: false,
    drugs: false,
    alcohol: false
  });

  const score = Object.values(criteria).filter(v => v).length;

  const items = [
    { key: 'htn', label: 'Hypertension (SBP >160 mmHg)' },
    { key: 'renal', label: 'Abnormal Renal Function' },
    { key: 'liver', label: 'Abnormal Liver Function' },
    { key: 'stroke', label: 'Stroke History' },
    { key: 'bleeding', label: 'Prior Major Bleeding' },
    { key: 'inr', label: 'Labile INR' },
    { key: 'elderly', label: 'Elderly (Age >65)' },
    { key: 'drugs', label: 'Drugs (Antiplatelets/NSAIDs)' },
    { key: 'alcohol', label: 'Alcohol (>8 units/week)' },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {items.map(item => (
          <button 
            key={item.key}
            onClick={() => setCriteria({...criteria, [item.key]: !criteria[item.key as keyof typeof criteria]})}
            className={`w-full p-6 rounded-2xl flex items-center justify-between border transition-all ${criteria[item.key as keyof typeof criteria] ? 'bg-[#172554] text-white border-[#172554] shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'}`}
          >
            <span className="text-xs font-bold">{item.label}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${criteria[item.key as keyof typeof criteria] ? 'bg-blue-400 border-blue-400' : 'border-slate-200'}`}>
              {criteria[item.key as keyof typeof criteria] && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </div>
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">HAS-BLED Score</p>
        <p className="text-8xl font-black text-[#172554]">{score}</p>
        <div className="mt-8 space-y-2">
           <p className={`text-xl font-black uppercase tracking-tight ${score >= 3 ? 'text-red-600' : 'text-emerald-600'}`}>
             {score >= 3 ? 'High Risk' : 'Low/Moderate Risk'}
           </p>
           <p className="text-[11px] font-medium text-slate-500 max-w-[200px] mx-auto italic">
             {score >= 3 ? 'Caution and regular review recommended.' : 'Standard anticoagulation monitoring.'}
           </p>
        </div>
      </div>
    </div>
  );
};

const HeartScoreCalculator = () => {
  const [scores, setScores] = useState({ h: 0, e: 0, a: 0, r: 0, t: 0 });
  const total = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);

  const options = [
    { key: 'h', label: 'History', vals: ['Slightly suspicious (0)', 'Moderately suspicious (1)', 'Highly suspicious (2)'] },
    { key: 'e', label: 'ECG', vals: ['Normal (0)', 'Non-specific repolarization (1)', 'Significant ST-depression (2)'] },
    { key: 'a', label: 'Age', vals: ['<45 (0)', '45-64 (1)', '≥65 (2)'] },
    { key: 'r', label: 'Risk Factors', vals: ['None (0)', '1-2 factors (1)', '≥3 factors (2)'] },
    { key: 't', label: 'Troponin', vals: ['≤ normal limit (0)', '1-3x normal limit (1)', '>3x normal limit (2)'] },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {options.map(opt => (
          <div key={opt.key}>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">{opt.label}</label>
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map(v => (
                <button 
                  key={v}
                  onClick={() => setScores({...scores, [opt.key]: v})}
                  className={`w-full py-3 px-4 text-left text-[10px] font-bold rounded-xl border transition-all ${scores[opt.key as keyof typeof scores] === v ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-500 border-slate-100'}`}
                >
                  {opt.vals[v]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">HEART Score</p>
        <p className="text-8xl font-black text-[#172554]">{total}</p>
        <div className="mt-8 space-y-2">
           <p className={`text-xl font-black uppercase tracking-tight ${total >= 7 ? 'text-red-600' : total >= 4 ? 'text-amber-600' : 'text-emerald-600'}`}>
             {total >= 7 ? 'High Risk' : total >= 4 ? 'Moderate Risk' : 'Low Risk'}
           </p>
           <p className="text-[11px] font-medium text-slate-500 max-w-[200px] mx-auto italic">
             {total >= 7 ? 'Observation, treatment, and CAG recommended.' : total >= 4 ? 'Observation and further testing.' : 'Discharge may be considered.'}
           </p>
        </div>
      </div>
    </div>
  );
};

const PIDRiskCalculator = () => {
  const [signs, setSigns] = useState({
    abdominalPain: false,
    adnexalTenderness: false,
    cervicalMotionTenderness: false,
    fever: false,
    discharge: false,
    leukocytosis: false,
    elevatedCRP: false
  });

  const activeCount = Object.values(signs).filter(v => v).length;

  const getRisk = () => {
    if (activeCount >= 5) return { label: 'High Risk', color: 'text-red-600', note: 'Immediate hospitalization and IV antibiotics often required.' };
    if (activeCount >= 3) return { label: 'Moderate Risk', color: 'text-amber-600', note: 'Strong clinical suspicion. Diagnostic workup and outpatient RX recommended.' };
    return { label: 'Low Risk', color: 'text-emerald-600', note: 'Clinical features are currently minimal. Monitor for progression.' };
  };

  const risk = getRisk();

  const criteria = [
    { key: 'abdominalPain', label: 'Lower Abdominal Pain' },
    { key: 'adnexalTenderness', label: 'Adnexal Tenderness' },
    { key: 'cervicalMotionTenderness', label: 'Cervical Motion Tenderness' },
    { key: 'fever', label: 'Fever (>38.3°C)' },
    { key: 'discharge', label: 'Abnormal Discharge' },
    { key: 'leukocytosis', label: 'Leukocytosis on Wet Mount' },
    { key: 'elevatedCRP', label: 'Elevated CRP / ESR' }
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {criteria.map(c => (
          <button 
            key={c.key}
            onClick={() => setSigns({...signs, [c.key]: !signs[c.key as keyof typeof signs]})}
            className={`w-full p-6 rounded-2xl flex items-center justify-between border transition-all ${signs[c.key as keyof typeof signs] ? 'bg-[#172554] text-white border-[#172554] shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'}`}
          >
            <span className="text-xs font-bold">{c.label}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${signs[c.key as keyof typeof signs] ? 'bg-blue-400 border-blue-400' : 'border-slate-200'}`}>
              {signs[c.key as keyof typeof signs] && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </div>
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Positive Indicators</p>
        <p className="text-8xl font-black text-[#172554]">{activeCount}</p>
        <div className="mt-8 space-y-2">
           <p className={`text-xl font-black uppercase tracking-tight ${risk.color}`}>{risk.label}</p>
           <p className="text-[11px] font-medium text-slate-500 max-w-[200px] mx-auto italic">"{risk.note}"</p>
        </div>
      </div>
    </div>
  );
};

const EndoStagingCalculator = () => {
  const [peritoneum, setPeritoneum] = useState(0);
  const [ovaries, setOvaries] = useState(0);
  const [adhesions, setAdhesions] = useState(0);
  const [culDeSac, setCulDeSac] = useState(0);

  const total = peritoneum + ovaries + adhesions + culDeSac;

  const getStage = (t: number) => {
    if (t > 40) return { label: 'Stage IV (Severe)', color: 'text-red-700', bg: 'bg-red-50' };
    if (t >= 16) return { label: 'Stage III (Moderate)', color: 'text-red-600', bg: 'bg-red-50' };
    if (t >= 6) return { label: 'Stage II (Mild)', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { label: 'Stage I (Minimal)', color: 'text-emerald-600', bg: 'bg-emerald-50' };
  };

  const stage = getStage(total);

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-8 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        <ScoreSection 
          label="Peritoneal Involvement" 
          value={peritoneum} 
          onChange={setPeritoneum}
          options={[
            { label: 'None', score: 0 },
            { label: 'Superficial (<1cm)', score: 1 },
            { label: 'Superficial (1-3cm)', score: 2 },
            { label: 'Superficial (>3cm)', score: 4 },
            { label: 'Deep (>3cm)', score: 6 }
          ]}
        />
        <ScoreSection 
          label="Ovarian Endometrioma" 
          value={ovaries} 
          onChange={setOvaries}
          options={[
            { label: 'None', score: 0 },
            { label: 'Superficial (<1cm)', score: 2 },
            { label: 'Superficial (1-3cm)', score: 4 },
            { label: 'Deep (>3cm)', score: 20 }
          ]}
        />
        <ScoreSection 
          label="Adhesions (Dense)" 
          value={adhesions} 
          onChange={setAdhesions}
          options={[
            { label: 'None', score: 0 },
            { label: 'Partial (<1/3)', score: 4 },
            { label: 'Moderate (1/3-2/3)', score: 8 },
            { label: 'Dense (>2/3)', score: 16 }
          ]}
        />
        <ScoreSection 
          label="Cul-de-sac Obliteration" 
          value={culDeSac} 
          onChange={setCulDeSac}
          options={[
            { label: 'None', score: 0 },
            { label: 'Partial', score: 4 },
            { label: 'Complete', score: 40 }
          ]}
        />
      </div>
      <div className={`flex flex-col items-center justify-center rounded-[3rem] p-10 shadow-inner text-center transition-colors ${stage.bg}`}>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total ASRM Score</p>
        <p className={`text-8xl font-black ${stage.color}`}>{total}</p>
        <div className="mt-8">
           <p className={`text-2xl font-black uppercase tracking-tight ${stage.color}`}>{stage.label}</p>
           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">rASRM Staging System</p>
        </div>
      </div>
    </div>
  );
};

const ScoreSection = ({ label, value, onChange, options }: { label: string; value: number; onChange: (s: number) => void; options: {label: string, score: number}[] }) => (
  <div className="space-y-3">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <div className="grid grid-cols-2 gap-2">
      {options.map((opt, i) => (
        <button 
          key={i}
          onClick={() => onChange(opt.score)}
          className={`py-3 px-4 rounded-xl text-[10px] font-bold border transition-all text-left ${value === opt.score ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200'}`}
        >
          {opt.label} ({opt.score})
        </button>
      ))}
    </div>
  </div>
);

const ImageDiagnosticTool: React.FC<{ type: 'xray' | 'ecg' }> = ({ type }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!preview || !file) return;
    setIsAnalyzing(true);
    const base64 = preview.split(',')[1];
    const findings = await analyzeMedicalImage(base64, file.type);
    setResult(findings || "Failed to analyze artifact.");
    setIsAnalyzing(false);
  };

  const formatPoints = (text: string | null) => {
    if (!text) return [];
    return text.split(/(?:\d+\.|\*|-|\n)/g)
      .map(p => p.trim())
      .filter(p => p.length > 5);
  };

  return (
    <div className="grid lg:grid-cols-2 gap-12">
      <div className="space-y-8">
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="aspect-video bg-slate-50 border-4 border-dashed border-slate-100 rounded-[3rem] flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 transition-all overflow-hidden relative group"
        >
          {preview ? (
            <img src={preview} className="w-full h-full object-contain opacity-90" />
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm group-hover:scale-110 transition-transform">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload {type.toUpperCase()} Specimen</p>
            </div>
          )}
          <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
        </div>
        
        <button 
          onClick={handleAnalyze} 
          disabled={!preview || isAnalyzing}
          className="w-full py-6 bg-[#172554] text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-900 transition-all disabled:opacity-30 flex items-center justify-center gap-4"
        >
          {isAnalyzing ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Neural Analysis Active...
            </>
          ) : `Analyze ${type.toUpperCase()}`}
        </button>
      </div>

      <div className="bg-slate-50 rounded-[3rem] p-10 shadow-inner flex flex-col h-full min-h-[400px]">
        <h5 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-8 flex items-center gap-3">
          <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
          Clinical Diagnostic Points
        </h5>
        
        {result ? (
          <div className="space-y-6 overflow-y-auto custom-scrollbar pr-4">
            {formatPoints(result).map((point, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="w-6 h-6 flex-shrink-0 bg-white rounded-lg flex items-center justify-center text-[10px] font-black text-blue-600 border border-slate-200 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">{i+1}</div>
                <p className="text-sm font-bold text-slate-700 leading-relaxed">{point}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-30">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            <p className="text-[10px] font-black uppercase tracking-widest">Awaiting Artifact Ingestion</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BishopScoreCalculator = () => {
  const [scores, setScores] = useState({
    dilation: 0,
    effacement: 0,
    station: 0,
    consistency: 0,
    position: 0
  });

  const total = (Object.values(scores) as number[]).reduce((a, b) => a + b, 0);

  const getInterpretation = (t: number) => {
    if (t >= 8) return { label: 'Favorable', color: 'text-emerald-600', note: 'High likelihood of successful induction.' };
    if (t >= 6) return { label: 'Intermediate', color: 'text-blue-600', note: 'Induction may be attempted but with caution.' };
    return { label: 'Unfavorable', color: 'text-red-600', note: 'Cervical ripening likely required before induction.' };
  };

  const interpretation = getInterpretation(total);

  const params = [
    { key: 'dilation', label: 'Dilation (cm)', options: ['Closed (0)', '1-2 cm (1)', '3-4 cm (2)', '≥5 cm (3)'] },
    { key: 'effacement', label: 'Effacement (%)', options: ['0-30% (0)', '40-50% (1)', '60-70% (2)', '≥80% (3)'] },
    { key: 'station', label: 'Station', options: ['-3 (0)', '-2 (1)', '-1, 0 (2)', '+1, +2 (3)'] },
    { key: 'consistency', label: 'Consistency', options: ['Firm (0)', 'Medium (1)', 'Soft (2)'] },
    { key: 'position', label: 'Position', options: ['Posterior (0)', 'Mid (1)', 'Anterior (2)'] },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {params.map(p => (
          <div key={p.key} className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{p.label}</label>
            <div className="grid grid-cols-2 gap-2">
              {p.options.map((opt, i) => (
                <button 
                  key={i}
                  onClick={() => setScores({...scores, [p.key]: i})}
                  className={`py-3 px-4 rounded-xl text-[10px] font-bold border transition-all text-left ${scores[p.key as keyof typeof scores] === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-500 border-slate-100 hover:border-blue-200'}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Total Bishop Score</p>
        <p className="text-8xl font-black text-[#172554]">{total}</p>
        <div className="mt-8 space-y-2">
           <p className={`text-xl font-black uppercase tracking-tight ${interpretation.color}`}>{interpretation.label}</p>
           <p className="text-[11px] font-medium text-slate-500 max-w-[200px] mx-auto italic">"{interpretation.note}"</p>
        </div>
      </div>
    </div>
  );
};

const EDDCalculator = () => {
  const [lmp, setLmp] = useState('');
  
  const calculateData = () => {
    if (!lmp) return null;
    const lmpDate = new Date(lmp);
    const today = new Date();
    
    // Naegele's Rule: +280 days
    const edd = new Date(lmpDate.getTime() + (280 * 24 * 60 * 60 * 1000));
    
    // Gestational Age
    const diffTime = Math.abs(today.getTime() - lmpDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(diffDays / 7);
    const days = diffDays % 7;

    return { 
      edd: edd.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
      ga: `${weeks}w ${days}d`,
      isOverdue: today > edd
    };
  };

  const data = calculateData();

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-8 flex flex-col justify-center">
        <div className="space-y-3">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Last Menstrual Period (LMP)</label>
          <input 
            type="date" 
            value={lmp}
            onChange={(e) => setLmp(e.target.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-8 py-5 text-lg font-black text-[#172554] outline-none focus:border-blue-600 transition-all shadow-inner"
          />
        </div>
        <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100">
           <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-2">Algorithm Note</p>
           <p className="text-xs font-bold text-slate-600 leading-relaxed italic">Calculations based on standard 280-day cycle using Naegele's rule with real-time GA sync.</p>
        </div>
      </div>
      <div className="bg-slate-50 rounded-[3rem] p-10 shadow-inner flex flex-col justify-center gap-10 text-center">
        {data ? (
          <>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Estimated Due Date (EDD)</p>
              <p className="text-3xl font-black text-[#172554] tracking-tight">{data.edd}</p>
            </div>
            <div className="pt-8 border-t border-slate-200">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Current Gestational Age</p>
              <p className="text-6xl font-black text-blue-600">{data.ga}</p>
            </div>
          </>
        ) : (
          <div className="py-20 flex flex-col items-center gap-6 opacity-30">
             <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
             <p className="text-sm font-black uppercase tracking-widest">Awaiting LMP Entry</p>
          </div>
        )}
      </div>
    </div>
  );
};

const BMICalculator = () => {
  const [w, setW] = useState('');
  const [h, setH] = useState('');
  const bmi = w && h ? (Number(w) / ((Number(h)/100)**2)).toFixed(1) : null;
  
  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <CalcInput label="Weight (kg)" value={w} onChange={setW} />
        <CalcInput label="Height (cm)" value={h} onChange={setH} />
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Result</p>
        <p className="text-6xl font-black text-[#172554]">{bmi || '0.0'}</p>
        <p className={`mt-4 text-[10px] font-black uppercase tracking-widest ${Number(bmi) >= 25 ? 'text-amber-600' : 'text-emerald-600'}`}>
          {bmi ? (Number(bmi) < 18.5 ? 'Underweight' : Number(bmi) < 25 ? 'Normal' : 'Overweight') : 'N/A'}
        </p>
      </div>
    </div>
  );
};

const GFRCalculator = () => {
  const [cr, setCr] = useState('');
  const [age, setAge] = useState('');
  const [isFemale, setIsFemale] = useState(false);
  const [isAfrican, setIsAfrican] = useState(false);

  const gfr = cr && age ? (175 * (Number(cr) ** -1.154) * (Number(age) ** -0.203) * (isFemale ? 0.742 : 1) * (isAfrican ? 1.212 : 1)).toFixed(1) : null;

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <CalcInput label="Creatinine (mg/dL)" value={cr} onChange={setCr} />
        <CalcInput label="Age (Years)" value={age} onChange={setAge} />
        <div className="flex gap-4 pt-4">
           <button onClick={() => setIsFemale(!isFemale)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${isFemale ? 'bg-[#172554] text-white border-[#172554]' : 'bg-white text-slate-400 border-slate-100'}`}>Female</button>
           <button onClick={() => setIsAfrican(!isAfrican)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${isAfrican ? 'bg-[#172554] text-white border-[#172554]' : 'bg-white text-slate-400 border-slate-100'}`}>African Am.</button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">eGFR (MDRD)</p>
        <p className="text-6xl font-black text-[#172554]">{gfr || '0.0'}</p>
        <p className="mt-4 text-[10px] font-black uppercase text-blue-600 tracking-widest">mL/min/1.73m²</p>
      </div>
    </div>
  );
};

const APGARCalculator = () => {
  const [scores, setScores] = useState({ a: 0, p: 0, g: 0, ap: 0, r: 0 });
  const total = (Object.values(scores) as number[]).reduce((sum: number, v: number) => sum + v, 0);

  const options = [
    { key: 'a', label: 'Appearance', vals: ['Blue/Pale (0)', 'Body Pink (1)', 'All Pink (2)'] },
    { key: 'p', label: 'Pulse', vals: ['Absent (0)', '<100 bpm (1)', '>100 bpm (2)'] },
    { key: 'g', label: 'Grimace', vals: ['Floppy (0)', 'Grimace (1)', 'Crying/Pulling (2)'] },
    { key: 'ap', label: 'Activity', vals: ['Absent (0)', 'Flexion (1)', 'Active (2)'] },
    { key: 'r', label: 'Respiration', vals: ['Absent (0)', 'Slow/Irregular (1)', 'Strong Cry (2)'] },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
        {options.map(opt => (
          <div key={opt.key}>
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2 mb-2 block">{opt.label}</label>
            <div className="flex gap-2">
              {[0, 1, 2].map(v => (
                <button 
                  key={v}
                  onClick={() => setScores({...scores, [opt.key]: v})}
                  className={`flex-1 py-3 text-[8px] font-black rounded-xl border transition-all ${scores[opt.key as keyof typeof scores] === v ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}
                >
                  {opt.vals[v]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Final APGAR</p>
        <p className="text-8xl font-black text-[#172554]">{total}</p>
        <p className={`mt-6 text-[10px] font-black uppercase tracking-widest ${total >= 7 ? 'text-emerald-600' : 'text-red-600'}`}>
          {total >= 7 ? 'Normal' : total >= 4 ? 'Moderate Distress' : 'Severely Depressed'}
        </p>
      </div>
    </div>
  );
};

const DoseCalculator = () => {
  const [wt, setWt] = useState('');
  const [dosePerKg, setDosePerKg] = useState('');
  const [conc, setConc] = useState('');

  const mg = wt && dosePerKg ? Number(wt) * Number(dosePerKg) : 0;
  const ml = mg && conc ? mg / Number(conc) : 0;

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-6">
        <CalcInput label="Weight (kg)" value={wt} onChange={setWt} />
        <CalcInput label="Required Dose (mg/kg)" value={dosePerKg} onChange={setDosePerKg} />
        <CalcInput label="Available Concentration (mg/mL)" value={conc} onChange={setConc} />
      </div>
      <div className="bg-slate-50 rounded-[3rem] p-10 shadow-inner flex flex-col justify-center gap-10">
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total mg</p>
          <p className="text-4xl font-black text-[#172554]">{mg.toFixed(2)} mg</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Total Volume (mL)</p>
          <p className="text-5xl font-black text-blue-600">{ml.toFixed(2)} mL</p>
        </div>
      </div>
    </div>
  );
};

const TIMIScoreCalculator = () => {
  const [criteria, setCriteria] = useState({
    age65: false,
    markers: false,
    st: false,
    angina: false,
    asa: false,
    riskFactors: false,
    stenosis: false
  });

  const score = Object.values(criteria).filter(v => v).length;

  const items = [
    { key: 'age65', label: 'Age ≥ 65 years' },
    { key: 'riskFactors', label: '≥ 3 Risk Factors for CAD' },
    { key: 'stenosis', label: 'Prior Coronary Stenosis ≥ 50%' },
    { key: 'st', label: 'ST Deviation on ECG' },
    { key: 'angina', label: '≥ 2 Anginal Episodes in 24h' },
    { key: 'asa', label: 'ASA use in last 7 days' },
    { key: 'markers', label: 'Elevated Cardiac Markers' },
  ];

  const getRisk = () => {
    if (score >= 5) return { risk: 'High Risk (26-41%)', color: 'text-red-600' };
    if (score >= 3) return { risk: 'Intermediate Risk (13-20%)', color: 'text-amber-600' };
    return { risk: 'Low Risk (5-8%)', color: 'text-emerald-600' };
  };

  const risk = getRisk();

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {items.map(item => (
          <button 
            key={item.key}
            onClick={() => setCriteria({...criteria, [item.key]: !criteria[item.key as keyof typeof criteria]})}
            className={`w-full p-6 rounded-2xl flex items-center justify-between border transition-all ${criteria[item.key as keyof typeof criteria] ? 'bg-[#172554] text-white border-[#172554] shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'}`}
          >
            <span className="text-xs font-bold">{item.label}</span>
            <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${criteria[item.key as keyof typeof criteria] ? 'bg-blue-400 border-blue-400' : 'border-slate-200'}`}>
              {criteria[item.key as keyof typeof criteria] && <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>}
            </div>
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">TIMI Score (UA/NSTEMI)</p>
        <p className="text-8xl font-black text-[#172554]">{score}</p>
        <div className="mt-8 space-y-2">
           <p className={`text-xl font-black uppercase tracking-tight ${risk.color}`}>{risk.risk}</p>
           <p className="text-[11px] font-medium text-slate-500 max-w-[200px] mx-auto italic">"14-day risk of death, MI, or urgent revascularization."</p>
        </div>
      </div>
    </div>
  );
};

const GraceScoreCalculator = () => {
  const [age, setAge] = useState('60');
  const [hr, setHr] = useState('80');
  const [sbp, setSbp] = useState('120');
  const [cr, setCr] = useState('1.0');
  const [killip, setKillip] = useState(0);
  const [arrest, setArrest] = useState(false);
  const [st, setSt] = useState(false);
  const [markers, setMarkers] = useState(false);

  // Simplified GRACE calculation logic for demo
  const calculateScore = () => {
    let s = 0;
    const a = Number(age);
    if (a < 30) s += 0; else if (a < 40) s += 8; else if (a < 50) s += 25; else if (a < 60) s += 41; else if (a < 70) s += 58; else if (a < 80) s += 75; else s += 91;
    
    const h = Number(hr);
    if (h < 50) s += 0; else if (h < 70) s += 3; else if (h < 90) s += 9; else if (h < 110) s += 15; else if (h < 150) s += 24; else if (h < 200) s += 38; else s += 46;
    
    const p = Number(sbp);
    if (p < 80) s += 58; else if (p < 100) s += 53; else if (p < 120) s += 43; else if (p < 140) s += 34; else if (p < 160) s += 24; else if (p < 200) s += 10; else s += 0;
    
    const c = Number(cr);
    if (c < 0.4) s += 1; else if (c < 0.8) s += 4; else if (c < 1.2) s += 7; else if (c < 1.6) s += 10; else if (c < 2.0) s += 13; else if (c < 4.0) s += 21; else s += 28;
    
    s += killip === 0 ? 0 : killip === 1 ? 20 : killip === 2 ? 39 : 59;
    if (arrest) s += 39;
    if (st) s += 28;
    if (markers) s += 14;
    
    return s;
  };

  const score = calculateScore();

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4">
          <CalcInput label="Age" value={age} onChange={setAge} />
          <CalcInput label="Heart Rate" value={hr} onChange={setHr} />
          <CalcInput label="Systolic BP" value={sbp} onChange={setSbp} />
          <CalcInput label="Creatinine" value={cr} onChange={setCr} />
        </div>
        
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Killip Class</label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((k, i) => (
              <button 
                key={k}
                onClick={() => setKillip(i)}
                className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${killip === i ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}`}
              >
                Class {k}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={() => setArrest(!arrest)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${arrest ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-400 border-slate-100'}`}>Cardiac Arrest</button>
          <button onClick={() => setSt(!st)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${st ? 'bg-blue-900 text-white border-blue-900' : 'bg-white text-slate-400 border-slate-100'}`}>ST Deviation</button>
          <button onClick={() => setMarkers(!markers)} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all ${markers ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-400 border-slate-100'}`}>+ Markers</button>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">GRACE Risk Score</p>
        <p className="text-8xl font-black text-[#172554]">{score}</p>
        <div className="mt-8 space-y-2">
           <p className={`text-xl font-black uppercase tracking-tight ${score > 140 ? 'text-red-600' : score > 108 ? 'text-amber-600' : 'text-emerald-600'}`}>
             {score > 140 ? 'High Risk (>3%)' : score > 108 ? 'Intermediate Risk (1-3%)' : 'Low Risk (<1%)'}
           </p>
           <p className="text-[11px] font-medium text-slate-500 max-w-[200px] mx-auto italic">"Estimated in-hospital mortality risk."</p>
        </div>
      </div>
    </div>
  );
};

const DukeTreadmillCalculator = () => {
  const [time, setTime] = useState('10');
  const [st, setSt] = useState('1');
  const [angina, setAngina] = useState(0);

  const score = Number(time) - (5 * Number(st)) - (4 * angina);

  const getRisk = () => {
    if (score <= -11) return { label: 'High Risk', color: 'text-red-600', survival: '72% 5-year survival' };
    if (score < 5) return { label: 'Moderate Risk', color: 'text-amber-600', survival: '91% 5-year survival' };
    return { label: 'Low Risk', color: 'text-emerald-600', survival: '99% 5-year survival' };
  };

  const risk = getRisk();

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-8 flex flex-col justify-center">
        <CalcInput label="Exercise Time (Minutes)" value={time} onChange={setTime} />
        <CalcInput label="Max ST Segment Deviation (mm)" value={st} onChange={setSt} />
        
        <div className="space-y-2">
          <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">Angina Index</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'None (0)', val: 0 },
              { label: 'Non-limiting (1)', val: 1 },
              { label: 'Limiting (2)', val: 2 }
            ].map(opt => (
              <button 
                key={opt.val}
                onClick={() => setAngina(opt.val)}
                className={`py-3 rounded-xl text-[10px] font-bold border transition-all ${angina === opt.val ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-400 border-slate-100'}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Duke Treadmill Score</p>
        <p className="text-8xl font-black text-[#172554]">{score.toFixed(1)}</p>
        <div className="mt-8 space-y-2">
           <p className={`text-xl font-black uppercase tracking-tight ${risk.color}`}>{risk.label}</p>
           <p className="text-[11px] font-medium text-slate-500 max-w-[200px] mx-auto italic">"{risk.survival}"</p>
        </div>
      </div>
    </div>
  );
};

const WellsCalculator = () => {
  const [criteria, setCriteria] = useState({
    signs: false,
    alternative: false,
    hr: false,
    immobilization: false,
    prior: false,
    hemoptysis: false,
    cancer: false
  });

  const score = (criteria.signs ? 3 : 0) + 
                (criteria.alternative ? 3 : 0) + 
                (criteria.hr ? 1.5 : 0) + 
                (criteria.immobilization ? 1.5 : 0) + 
                (criteria.prior ? 1.5 : 0) + 
                (criteria.hemoptysis ? 1 : 0) + 
                (criteria.cancer ? 1 : 0);

  const getRisk = () => {
    if (score > 6) return { label: 'High Probability (65%)', color: 'text-red-600' };
    if (score >= 2) return { label: 'Moderate Probability (16%)', color: 'text-amber-600' };
    return { label: 'Low Probability (1%)', color: 'text-emerald-600' };
  };

  const risk = getRisk();

  const items = [
    { key: 'signs', label: 'Clinical signs and symptoms of DVT', points: 3 },
    { key: 'alternative', label: 'PE is #1 diagnosis OR as likely as others', points: 3 },
    { key: 'hr', label: 'Heart rate > 100 bpm', points: 1.5 },
    { key: 'immobilization', label: 'Immobilization ≥ 3 days OR surgery in 4 wks', points: 1.5 },
    { key: 'prior', label: 'Previous PE or DVT', points: 1.5 },
    { key: 'hemoptysis', label: 'Hemoptysis', points: 1 },
    { key: 'cancer', label: 'Malignancy with treatment in last 6 months', points: 1 },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-12">
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-4 custom-scrollbar">
        {items.map(item => (
          <button 
            key={item.key}
            onClick={() => setCriteria({...criteria, [item.key]: !criteria[item.key as keyof typeof criteria]})}
            className={`w-full p-6 rounded-2xl flex items-center justify-between border transition-all ${criteria[item.key as keyof typeof criteria] ? 'bg-[#172554] text-white border-[#172554] shadow-lg' : 'bg-white text-slate-600 border-slate-100 hover:border-blue-200'}`}
          >
            <span className="text-xs font-bold">{item.label}</span>
            <span className="text-[10px] font-black opacity-60">+{item.points}</span>
          </button>
        ))}
      </div>
      <div className="flex flex-col items-center justify-center bg-slate-50 rounded-[3rem] p-10 shadow-inner text-center">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Wells' Score</p>
        <p className="text-8xl font-black text-[#172554]">{score}</p>
        <div className="mt-8 space-y-2">
           <p className={`text-xl font-black uppercase tracking-tight ${risk.color}`}>{risk.label}</p>
           <p className="text-[11px] font-medium text-slate-500 max-w-[200px] mx-auto italic">"Clinical probability of Pulmonary Embolism."</p>
        </div>
      </div>
    </div>
  );
};

const CalcInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <div className="space-y-2">
    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-2">{label}</label>
    <input 
      type="number" 
      value={value} 
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-8 py-5 text-lg font-black text-[#172554] outline-none focus:border-blue-600 transition-all shadow-inner" 
    />
  </div>
);

export default Calculators;
