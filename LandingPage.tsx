
import React from 'react';
import { motion } from 'framer-motion';
import { Brain, ShieldCheck, Activity, ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  onSelectRole: (role: 'doctor' | 'admin') => void;
}

const LandingPage: React.FC<Props> = ({ onSelectRole }) => {
  return (
    <div className="min-h-screen bg-white overflow-hidden flex flex-col lg:flex-row relative font-['Outfit']">
      {/* Background Atmosphere & Graphics */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/[0.03] blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-600/[0.03] blur-[120px] rounded-full"></div>
        
        {/* Abstract Shapes */}
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/4 left-1/4 w-96 h-96 border border-blue-100/30 rounded-full opacity-20"
        ></motion.div>
        <motion.div 
          animate={{ 
            rotate: -360,
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] border border-emerald-100/30 rounded-[4rem] opacity-20"
        ></motion.div>

        {/* DNA Helix Graphic - Centered and More Visible */}
        <div className="absolute inset-0 flex justify-center items-center pointer-events-none overflow-hidden">
          <div className="w-64 h-full opacity-[0.15] flex flex-col justify-around items-center">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ 
                  rotateY: 360,
                  x: Math.sin(i * 0.4) * 60
                }}
                transition={{ 
                  duration: 6, 
                  repeat: Infinity, 
                  ease: "linear",
                  delay: i * 0.15 
                }}
                className="relative w-full flex justify-center items-center"
              >
                <div className="w-6 h-6 rounded-full bg-blue-600 shadow-xl shadow-blue-600/60"></div>
                <div className="w-32 h-1 bg-gradient-to-r from-blue-600 via-slate-300 to-emerald-600"></div>
                <div className="w-6 h-6 rounded-full bg-emerald-600 shadow-xl shadow-emerald-600/60"></div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Floating Icons Graphics */}
        <div className="absolute inset-0">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 100 }}
              animate={{ 
                opacity: [0, 0.15, 0],
                y: [-20, -150],
                x: Math.sin(i) * 80
              }}
              transition={{ 
                duration: 12 + i * 2, 
                repeat: Infinity, 
                delay: i * 1.5,
                ease: "easeInOut"
              }}
              className="absolute text-blue-300"
              style={{ 
                left: `${10 + i * 12}%`, 
                top: `${15 + (i % 4) * 20}%` 
              }}
            >
              {i % 3 === 0 ? <Activity size={48} /> : i % 3 === 1 ? <Brain size={48} /> : <ShieldCheck size={48} />}
            </motion.div>
          ))}
        </div>

        {/* Neural Network Style Connections */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.05] pointer-events-none">
          <pattern id="neural-grid" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="currentColor" className="text-blue-600" />
            <line x1="2" y1="2" x2="100" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-slate-300" />
            <line x1="2" y1="2" x2="0" y2="100" stroke="currentColor" strokeWidth="0.5" className="text-slate-300" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#neural-grid)" />
        </svg>

        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '60px 60px' }}></div>
      </div>

      {/* Discreet Admin Entry - Top Right */}
      <div className="absolute top-8 right-8 z-50">
        <motion.button 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onSelectRole('admin')}
          className="w-12 h-12 bg-white/50 backdrop-blur-md border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-blue-600 hover:border-blue-200 hover:bg-white transition-all shadow-sm hover:shadow-md"
          title="Admin Portal"
        >
          <Sparkles className="w-5 h-5" />
        </motion.button>
      </div>

      {/* Left Section: Editorial/Brand */}
      <div className="relative z-10 flex-1 flex flex-col justify-center p-12 lg:p-24 border-b lg:border-b-0 lg:border-r border-slate-100">
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-12"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-3xl shadow-2xl shadow-blue-600/30"
            >
              <Brain className="w-10 h-10 text-white" />
            </motion.div>
            <div className="space-y-1">
              <span className="text-blue-600 font-black text-xs uppercase tracking-[0.5em] block">Advanced Registry</span>
              <span className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.2em]">Powered by DocTutorials AI Engineering</span>
            </div>
          </div>

          <div className="space-y-4">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="text-7xl lg:text-9xl font-black text-slate-900 tracking-tighter leading-[0.8] font-['Space_Grotesk']"
            >
              <span style={{ fontFamily: 'Roboto, sans-serif' }}>DocTutorials</span><br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-blue-500 to-emerald-500">CCL</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.8 }}
              className="text-slate-500 text-xl lg:text-2xl font-medium max-w-lg leading-relaxed"
            >
              The synchronized master repository of historical case journeys, neural diagnostic insights, and synchronized medical artifacts.
            </motion.p>
          </div>

          <div className="flex flex-wrap gap-8 pt-6">
            <div className="flex items-center gap-4 text-slate-400 group">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-100 transition-colors">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">HIPAA Compliant</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400 group">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Real-time Synthesis</span>
            </div>
          </div>
        </motion.div>

        {/* Vertical Rail Text */}
        <div className="absolute left-8 bottom-24 hidden lg:block">
          <p className="text-[10px] font-black text-slate-200 uppercase tracking-[1em] [writing-mode:vertical-rl] rotate-180">
            INTELLIGENT DIAGNOSTIC ARCHIVE
          </p>
        </div>
      </div>

      {/* Right Section: Portal Entry */}
      <div className="relative z-10 flex-1 flex flex-col justify-center items-center p-12 lg:p-24 bg-slate-50/30 backdrop-blur-sm">
        <div className="w-full max-w-md">
          <div className="space-y-8">
            {/* Doctor Portal */}
            <motion.button
              whileHover={{ scale: 1.02, y: -8 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectRole('doctor')}
              className="w-full group relative p-12 rounded-[4rem] bg-white border border-slate-200 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] flex flex-col items-center text-center transition-all hover:border-blue-600/50 hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.12)]"
            >
              <div className="w-24 h-24 bg-blue-50 rounded-[2.5rem] flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all duration-700 mb-8 shadow-inner">
                <Activity className="w-12 h-12" />
              </div>
              
              <div className="space-y-2">
                <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight font-['Space_Grotesk']">Enter Registry</h3>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Doctor & Specialist Access</p>
              </div>

              <div className="mt-10 w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                <ChevronRight className="w-8 h-8" />
              </div>

              {/* Decorative Corner Graphic */}
              <div className="absolute top-8 right-8 w-12 h-12 border-t-2 border-r-2 border-blue-100 rounded-tr-3xl group-hover:border-blue-400 transition-colors"></div>
            </motion.button>

            {/* Powered By Footer */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 1 }}
              className="pt-16 flex flex-col items-center gap-4"
            >
              <div className="h-px w-24 bg-slate-200"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] text-center">
                Powered by DocTutorials AI Engineering
              </p>
              <div className="flex gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse delay-75"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse delay-150"></div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
