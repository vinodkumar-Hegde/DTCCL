
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { ClinicalCase } from '../types';

interface Props {
  activeCase?: ClinicalCase;
  onClose: () => void;
  onNavigate: (target: { view?: string; tab?: string; subject?: string; caseId?: string }) => void;
}

const StethoscopeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM14 10.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 12v6m-3-3h6" />
  </svg>
);

const AIAssistant: React.FC<Props> = ({ activeCase, onClose, onNavigate }) => {
  const [isActive, setIsActive] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && !isMinimized) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions, isSpeaking, isMinimized]);

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) {
        channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
      }
    }
    return buffer;
  };

  const createBlob = (data: Float32Array) => {
    const l = data.length;
    const int16 = new Int16Array(l);
    for (let i = 0; i < l; i++) {
      int16[i] = data[i] * 32768;
    }
    return {
      data: encode(new Uint8Array(int16.buffer)),
      mimeType: 'audio/pcm;rate=16000',
    };
  };

  const navigateToFunction: FunctionDeclaration = {
    name: 'navigateTo',
    parameters: {
      type: Type.OBJECT,
      description: 'Trigger navigation to specific app sections, subjects, or case details.',
      properties: {
        view: { 
          type: Type.STRING,
          description: 'The target view. Values: dashboard, detail, summary, calculators.'
        },
        subject: { 
          type: Type.STRING,
          description: 'Filter dashboard by subject. Values: Medicine, Surgery, ENT, OBG, Pediatrics.'
        },
        superSpeciality: {
          type: Type.STRING,
          description: 'Filter by super speciality within a subject.'
        },
        disease: {
          type: Type.STRING,
          description: 'Filter by specific disease.'
        },
        tab: { 
          type: Type.STRING, 
          description: 'Tab to show in detail view. Values: synthesis, history, labs, imaging, treatment, opinion.'
        },
        caseId: { 
          type: Type.STRING, 
          description: 'A specific Case ID to open directly (e.g., DT-P8821, DT-M4412).'
        }
      },
    },
  };

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
             setIsActive(true);
             setIsListening(true);
             const source = inputCtx.createMediaStreamSource(stream);
             const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
             scriptProcessor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createBlob(inputData);
                sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
             };
             source.connect(scriptProcessor);
             scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                if (fc.name === 'navigateTo') {
                  const args = fc.args as any;
                  onNavigate(args);
                  sessionPromise.then((session) => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "Navigation executed." },
                      }
                    });
                  });
                  setTimeout(() => setIsMinimized(true), 800);
                }
              }
            }

            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text;
              setIsSpeaking(true);
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text;
            }

            if (message.serverContent?.turnComplete) {
              setTranscriptions(prev => {
                const newMessages = [...prev];
                if (currentInputTranscription.current) newMessages.push({ role: 'user', text: currentInputTranscription.current });
                if (currentOutputTranscription.current) newMessages.push({ role: 'ai', text: currentOutputTranscription.current });
                return newMessages;
              });
              currentInputTranscription.current = '';
              currentOutputTranscription.current = '';
              setIsSpeaking(false);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const ctx = audioContextRef.current!;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          tools: [{ functionDeclarations: [navigateToFunction] }],
          systemInstruction: `You are Dr. Deeksha, the clinical voice assistant for DocTutorial CCA.
          
          NAVIGATION RULES:
          - Valid tabs: 'synthesis' (OP/IP Summary), 'history' (Patient History), 'labs' (Lab Reports), 'imaging' (X-Ray/ECG Analysis), 'treatment' (Journey timeline), 'opinion' (AI Second Opinion).
          - If the user asks for "Summary" or "OP IP", call navigateTo(tab: 'synthesis').
          - If the user asks for "Opinion" or "Missed checks", call navigateTo(tab: 'opinion').
          - If the user asks for "X-ray" or "ECG", call navigateTo(tab: 'imaging').
          
          PERSONALITY:
          - Professional and helpful.
          
          ACTIVE CASE CONTEXT:
          ${activeCase ? JSON.stringify(activeCase) : 'No case selected.'}`,
          outputAudioTranscription: {},
          inputAudioTranscription: {}
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error("AI Initialization Failed", err);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    onClose();
  };

  useEffect(() => {
    return () => { if (sessionRef.current) sessionRef.current.close(); };
  }, []);

  if (isMinimized) {
    return (
      <button 
        onClick={() => setIsMinimized(false)}
        className="fixed bottom-10 right-10 z-[200] w-24 h-24 bg-[#172554] rounded-full shadow-2xl flex items-center justify-center border-4 border-white pointer-events-auto group animate-fade-in"
      >
        <div className={`absolute inset-0 bg-blue-500 rounded-full opacity-20 ${isSpeaking ? 'animate-ping' : 'animate-pulse'}`}></div>
        <StethoscopeIcon className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none">
      <div className="bg-white/95 backdrop-blur-3xl w-full max-w-3xl h-[85vh] rounded-[4rem] shadow-2xl border border-white/40 pointer-events-auto flex flex-col overflow-hidden animate-fade-in">
        <div className="p-10 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-6">
            <div className="w-16 h-16 bg-[#172554] rounded-3xl flex items-center justify-center text-white shadow-lg"><StethoscopeIcon className="w-8 h-8" /></div>
            <div>
              <h3 className="text-xl font-black text-[#172554]">Dr. Deeksha</h3>
              <p className="text-[11px] font-semibold text-blue-600">AI Clinical Consultant</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button onClick={() => setIsMinimized(true)} className="p-4 bg-white rounded-2xl border border-slate-100 hover:bg-blue-50 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg></button>
            <button onClick={stopSession} className="p-4 bg-white rounded-2xl border border-slate-100 hover:bg-red-50 shadow-sm"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-12 space-y-12 custom-scrollbar">
          {transcriptions.map((t, i) => (
            <div key={i} className={`flex ${t.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-8 rounded-[3rem] text-sm font-medium shadow-sm ${
                t.role === 'user' ? 'bg-[#172554] text-white rounded-tr-none' : 'bg-white border border-slate-100 rounded-tl-none italic text-[#1e3a8a]'
              }`}>
                {t.text}
              </div>
            </div>
          ))}
          {isSpeaking && (
             <div className="flex justify-start">
               <div className="max-w-[85%] p-8 bg-blue-50 text-blue-900 rounded-[3rem] rounded-tl-none italic text-sm border border-blue-100 animate-pulse">
                 {currentOutputTranscription.current || "Analyzing clinical artifact..."}
               </div>
             </div>
          )}
        </div>

        <div className="p-10 bg-[#f8fafc] border-t border-gray-100 flex flex-col items-center gap-4">
          {!isActive ? (
            <button onClick={startSession} className="bg-[#172554] text-white px-16 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-widest shadow-2xl hover:bg-blue-900 transition-all hover:scale-105">Initialize Dr. Deeksha</button>
          ) : (
            <div className="flex items-center gap-3 h-16 px-12 bg-white border border-slate-100 rounded-full shadow-inner">
              {[...Array(12)].map((_, i) => (
                <div key={i} className={`w-1.5 bg-blue-600 rounded-full ${isSpeaking ? 'animate-bounce' : 'h-4 opacity-20'}`} style={{ animationDelay: `${i*0.1}s` }}></div>
              ))}
            </div>
          )}
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Decision Support Active</p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
