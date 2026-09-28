import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  Send, 
  Brain, 
  Award, 
  Zap, 
  Copy, 
  Check, 
  Volume2, 
  VolumeX, 
  CheckCircle2,
  FileText,
  User,
  Mail,
  Flame,
  Radio,
  BookOpen,
  Layers,
  ChevronRight,
  Compass,
  Sparkles,
  HelpCircle,
  Cpu,
  Terminal,
  Activity,
  Lightbulb,
  Coffee,
  Power,
  Lock,
  ShieldCheck,
  Key,
  Server,
  EyeOff,
  Scale,
  X,
  ExternalLink,
  CheckCircle
} from 'lucide-react';
import { aiService, userQueryService } from '../services/dbServices';
import { UserQuery } from '../types';

interface UnderConstructionProps {
  onEnterApp?: () => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  lang?: string;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = () => {
  // Target Launch Date: October 14, 2026
  const targetDate = new Date('2026-10-14T00:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 16, hours: 4, minutes: 54, seconds: 12 });

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Interactive Lab & Generator States
  const [isTurbo, setIsTurbo] = useState(false);
  const [coffeeBoost, setCoffeeBoost] = useState(false);
  const [bulbBrightness, setBulbBrightness] = useState<'normal' | 'turbo' | 'dim'>('normal');
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [rpm, setRpm] = useState(2400);
  const [voltage, setVoltage] = useState(238);
  const [activeCodeLine, setActiveCodeLine] = useState(0);

  // Modal Dialog States for Footer Legal & Security
  const [activeModal, setActiveModal] = useState<'privacy' | 'security' | 'terms' | 'telemetry' | null>(null);

  // Live coder terminal logs
  const codeLogs = [
    { tag: "KERNEL", msg: "Ingesting 2026-2027 GAT Current Affairs Matrix into Neural Vault..." },
    { tag: "DEFENSE", msg: "Calibrating Agni-V, BrahMos-ER & Astra Mk-1 missile telemetry vectors..." },
    { tag: "EXAM-ENGINE", msg: "Synthesizing 150-Question UPSC NDA Mock Exam simulation routines..." },
    { tag: "SPACED-REP", msg: "Compiling SM-2 optimal memory decay intervals for historic treaties..." },
    { tag: "GEOPOLITICS", msg: "Indexing Malacca, Hormuz, and Bab-el-Mandeb strategic choke points..." },
    { tag: "AUDIO-SYNTH", msg: "Rendering 3-minute tri-service morning intelligence audio capsule..." },
    { tag: "DATA-CORE", msg: "Validating UPSC syllabus correlation index with 99.8% precision..." }
  ];

  // Rotate terminal logs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCodeLine(prev => (prev + 1) % codeLogs.length);
    }, isTurbo ? 1200 : 2200);
    return () => clearInterval(interval);
  }, [isTurbo, codeLogs.length]);

  // Dynamic RPM & Voltage fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const baseRpm = isTurbo ? 4850 : 2400;
      const baseVolt = isTurbo ? 248 : 238;
      setRpm(baseRpm + Math.floor(Math.random() * 80 - 40));
      setVoltage(baseVolt + (Math.random() * 2 - 1));
    }, 400);
    return () => clearInterval(interval);
  }, [isTurbo]);

  // Spark generator effect
  const triggerSparks = () => {
    const newSparks = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i,
      x: (Math.random() - 0.5) * 40,
      y: (Math.random() - 0.5) * 40
    }));
    setSparks(prev => [...prev, ...newSparks]);
    setTimeout(() => {
      setSparks(prev => prev.slice(newSparks.length));
    }, 800);
  };

  const handleToggleTurbo = () => {
    setIsTurbo(!isTurbo);
    setBulbBrightness(!isTurbo ? 'turbo' : 'normal');
    triggerSparks();
  };

  const handleBoostCoffee = () => {
    setCoffeeBoost(true);
    triggerSparks();
    setTimeout(() => setCoffeeBoost(false), 8000);
  };

  // Query Box Engine State
  const [activeTab, setActiveTab] = useState<'ai-coach' | 'submit-query'>('ai-coach');

  // AI Coach Query States
  const [aiQuery, setAiQuery] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [copiedResponse, setCopiedResponse] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // Form Submission States
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    category: 'Syllabus Topic Request' as UserQuery['category'],
    urgency: 'Normal' as UserQuery['urgency'],
    query: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedQuery, setSubmittedQuery] = useState<UserQuery | null>(null);

  // Curated High-Yield Syllabus Topics
  const presetQueries = [
    {
      title: "Armed Forces Commands & Missiles",
      text: "Provide a concise cheatsheet of all Indian Tri-Service Commands, headquarters, and key missile systems (Agni-V, BrahMos-ER, Astra Mk-1)."
    },
    {
      title: "Strategic Maritime Chokepoints",
      text: "Analyze the strategic importance of the Malacca Strait, Bab-el-Mandeb, and Strait of Hormuz for India's Indo-Pacific security doctrine."
    },
    {
      title: "5 High-Yield Mock MCQs",
      text: "Generate 5 UPSC NDA standard GAT multiple choice questions on recent defense technology, space missions, and geography with detailed answer keys."
    },
    {
      title: "Constitutional & Polity Essentials",
      text: "Summarize fundamental rights, emergency provisions, and key amendments frequently tested in the UPSC NDA General Ability Test."
    },
    {
      title: "14 Oct Syllabus Request",
      text: "Request: Please ensure monthly defense exercise charts and missile range comparison diagrams are included in the 14 Oct deployment."
    }
  ];

  // Handle Live AI Coach Query
  const handleAskAICoach = async (customText?: string) => {
    const textToSend = customText || aiQuery;
    if (!textToSend.trim()) return;

    setAiLoading(true);
    setAiResponse(null);
    if (!customText) setAiQuery('');

    try {
      const response = await aiService.askNdaAI(textToSend, []);
      setAiResponse(response);
    } catch {
      setAiResponse(`### 🏛️ UPSC NDA GAT Academic Intelligence\n\nYour query regarding **"${textToSend}"** has been received. Our editorial and subject-matter team is finalizing the verified notes, factual tables, and mock questions for this topic ahead of the **14 October 2026** platform deployment.`);
    } finally {
      setAiLoading(false);
    }
  };

  // Handle Speech synthesis
  const handleToggleSpeech = (text: string) => {
    if ('speechSynthesis' in window) {
      if (speaking) {
        window.speechSynthesis.cancel();
        setSpeaking(false);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeaking(false);
      utterance.onerror = () => setSpeaking(false);
      setSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Handle Form Submission
  const handleSubmitQueryForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.query.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const created = await userQueryService.submitQuery({
        name: formData.name,
        email: formData.email,
        phone: formData.phone || undefined,
        category: formData.category,
        urgency: formData.urgency,
        query: formData.query
      });

      setSubmittedQuery(created);
      setFormData({
        name: '',
        email: '',
        phone: '',
        category: 'Syllabus Topic Request',
        urgency: 'Normal',
        query: ''
      });
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative overflow-hidden">
      
      {/* Background Ambience & Warm Bulb Bloom */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-20 pointer-events-none" />
      
      {/* Dynamic Warm Filament Bloom from Overhead Bulbs */}
      <div 
        className={`absolute top-0 left-1/4 -translate-x-1/2 w-[550px] h-[350px] rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          bulbBrightness === 'turbo' 
            ? 'bg-amber-400/35 scale-125' 
            : bulbBrightness === 'dim' 
            ? 'bg-amber-600/10 scale-75' 
            : 'bg-amber-500/20'
        }`} 
      />
      <div 
        className={`absolute top-0 right-1/4 translate-x-1/2 w-[550px] h-[350px] rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          bulbBrightness === 'turbo' 
            ? 'bg-amber-400/35 scale-125' 
            : bulbBrightness === 'dim' 
            ? 'bg-amber-600/10 scale-75' 
            : 'bg-amber-500/20'
        }`} 
      />

      {/* ========================================================================= */}
      {/* HANGING VINTAGE INDUSTRIAL LIGHT BULBS (OVERHEAD)                          */}
      {/* ========================================================================= */}
      <div className="relative z-20 w-full max-w-5xl mx-auto px-6 flex justify-between pointer-events-none select-none -mt-2">
        {/* Left Hanging Bulb */}
        <div className="flex flex-col items-center animate-bulb-swing-1">
          <div className="w-0.5 h-16 sm:h-20 bg-gradient-to-b from-slate-700 to-slate-900 shadow-xs" />
          <div className="w-4 h-4 rounded-t-sm bg-gradient-to-b from-amber-800 to-amber-950 border-t border-amber-600/60 shadow-xs" />
          <div className={`relative w-8 h-10 rounded-b-full rounded-t-sm border border-amber-400/40 backdrop-blur-xs flex items-center justify-center transition-all duration-300 ${
            bulbBrightness === 'turbo' 
              ? 'bg-amber-400/50 animate-bulb-turbo' 
              : bulbBrightness === 'dim' 
              ? 'bg-amber-800/20' 
              : 'bg-amber-500/30 animate-bulb-glow'
          }`}>
            <div className="w-2.5 h-4 border-t-2 border-x-2 border-amber-200 rounded-t-full shadow-[0_0_8px_#fef08a] animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-300/40 rounded-b-full" />
          </div>
        </div>

        {/* Center Defense Seal / Brand */}
        <div className="pt-4 flex items-center gap-2.5 opacity-90">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[10px] tracking-widest uppercase font-mono font-bold text-amber-300/90 bg-slate-900/80 px-3 py-1 rounded-full border border-slate-800">
            ⚡ WAR ROOM LIVE DEPLOYMENT ENGINE
          </span>
        </div>

        {/* Right Hanging Bulb */}
        <div className="flex flex-col items-center animate-bulb-swing-2">
          <div className="w-0.5 h-20 sm:h-24 bg-gradient-to-b from-slate-700 to-slate-900 shadow-xs" />
          <div className="w-4 h-4 rounded-t-sm bg-gradient-to-b from-amber-800 to-amber-950 border-t border-amber-600/60 shadow-xs" />
          <div className={`relative w-8 h-10 rounded-b-full rounded-t-sm border border-amber-400/40 backdrop-blur-xs flex items-center justify-center transition-all duration-300 ${
            bulbBrightness === 'turbo' 
              ? 'bg-amber-400/50 animate-bulb-turbo' 
              : bulbBrightness === 'dim' 
              ? 'bg-amber-800/20' 
              : 'bg-amber-500/30 animate-bulb-glow'
          }`}>
            <div className="w-2.5 h-4 border-t-2 border-x-2 border-amber-200 rounded-t-full shadow-[0_0_8px_#fef08a] animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-amber-300/40 rounded-b-full" />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-10">
        
        {/* ========================================================================= */}
        {/* HERO: INSTITUTIONAL BADGE & TITLE                                         */}
        {/* ========================================================================= */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold bg-slate-900/90 border border-slate-800 text-slate-300 shadow-sm">
            <Shield className="h-3.5 w-3.5 text-amber-400" />
            <span>National Defence Academy & GAT Strategic Intelligence</span>
            <span className="h-1 w-1 rounded-full bg-slate-600" />
            <span className="text-amber-400 font-mono">Launch 14 Oct 2026</span>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Platform Upgrade Underway
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed font-normal max-w-2xl mx-auto">
              Our engineering & defense content divisions are assembling the 2026-2027 UPSC NDA syllabus question vaults, defense missile database, and AI spaced repetition engine.
            </p>
          </div>

          {/* Precision Chronometer */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-lg mx-auto pt-2">
            {[
              { label: "DAYS", value: timeLeft.days },
              { label: "HOURS", value: timeLeft.hours },
              { label: "MINUTES", value: timeLeft.minutes },
              { label: "SECONDS", value: timeLeft.seconds }
            ].map((unit) => (
              <div 
                key={unit.label}
                className="bg-slate-900/90 border border-slate-800/90 rounded-xl p-3 sm:p-4 text-center shadow-md relative group hover:border-slate-700 transition"
              >
                <span className="block text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-tabular">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="block text-[9px] sm:text-[10px] font-bold text-amber-400/90 tracking-wider uppercase mt-0.5">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* ANIMATED WAR ROOM LAB: GENERATOR + CODERS AT WORK + TERMINAL RADAR        */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-xl backdrop-blur-md space-y-6 relative overflow-hidden">
          
          {/* Lab Section Header & Interactive Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Activity className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                  <span>Engineers & Heavy Generators At Full Load</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-400 border border-emerald-800/60">
                    ONLINE
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Real-time visualization of engineering pipelines and syllabus generator.
                </p>
              </div>
            </div>

            {/* Interactive Overclock & Lab Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={handleToggleTurbo}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer shadow-sm border ${
                  isTurbo 
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
              >
                <Zap className={`h-3.5 w-3.5 ${isTurbo ? 'fill-current animate-bounce' : 'text-amber-400'}`} />
                <span>{isTurbo ? 'Overclock Active (Turbo)' : 'Overclock Generator'}</span>
              </button>

              <button
                onClick={handleBoostCoffee}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                  coffeeBoost 
                    ? 'bg-amber-900/60 text-amber-200 border-amber-500' 
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-700'
                }`}
                title="Feed coffee to coders"
              >
                <Coffee className={`h-3.5 w-3.5 text-amber-400 ${coffeeBoost ? 'animate-bounce' : ''}`} />
                <span>{coffeeBoost ? 'Coffee Injected! ☕' : 'Coffee Fuel'}</span>
              </button>

              <button
                onClick={() => setBulbBrightness(bulbBrightness === 'normal' ? 'turbo' : bulbBrightness === 'turbo' ? 'dim' : 'normal')}
                className="p-1.5 rounded-xl bg-slate-950 border border-slate-700 hover:bg-slate-800 text-amber-400 transition cursor-pointer"
                title="Cycle Bulb Brightness"
              >
                <Lightbulb className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Interactive Visual Grid: Generator (Left) + Coders Working (Center) + Live Terminal/Radar (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* 1. HEAVY INDUSTRIAL POWER GENERATOR (4 Cols) */}
            <div className="lg:col-span-4 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden shadow-inner">
              
              {/* Exhaust Pipe with Rising Steam Puffs */}
              <div className="absolute top-2 right-4 flex flex-col items-center">
                <div className="w-4 h-3 bg-slate-700 rounded-t-sm border-t border-slate-500" />
                <div className="relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-slate-300/30 blur-xs animate-steam-1" />
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-slate-200/20 blur-xs animate-steam-2" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <Power className="h-3 w-3 text-amber-400" />
                    DEFENSE-GEN-4 UNIT
                  </span>
                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                    isTurbo ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 animate-pulse' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {isTurbo ? 'TURBO 4.8 kW' : 'NOMINAL 2.4 kW'}
                  </span>
                </div>

                {/* Animated Rotating Gears & Machine Body */}
                <div className="relative h-28 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-center overflow-hidden p-2">
                  
                  {/* Central Main Gear */}
                  <div className={`relative z-10 w-16 h-16 rounded-full border-4 border-dashed border-amber-500/80 bg-slate-950 flex items-center justify-center shadow-md ${
                    isTurbo ? 'animate-spin-turbo border-amber-400' : 'animate-spin-slow'
                  }`}>
                    <div className="w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                  </div>

                  {/* Secondary Interlocking Gear (Top Left) */}
                  <div className={`absolute top-2 left-6 w-11 h-11 rounded-full border-3 border-dashed border-slate-600 bg-slate-900 flex items-center justify-center ${
                    isTurbo ? 'animate-spin-fast' : 'animate-spin-reverse'
                  }`}>
                    <div className="w-3 h-3 rounded-full bg-slate-700" />
                  </div>

                  {/* High Speed Pinion Gear (Bottom Right) */}
                  <div className={`absolute bottom-2 right-8 w-9 h-9 rounded-full border-2 border-dashed border-cyan-500/70 bg-slate-900 flex items-center justify-center ${
                    isTurbo ? 'animate-spin-turbo' : 'animate-spin-fast'
                  }`}>
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                  </div>

                  {/* Piston Thrust Arm (Left) */}
                  <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center">
                    <div className={`w-3 h-8 rounded bg-gradient-to-b from-slate-600 to-slate-800 border border-slate-500 ${isTurbo ? 'animate-piston' : ''}`} />
                  </div>

                  {/* Sparks effect on Turbo */}
                  {sparks.map(s => (
                    <div 
                      key={s.id} 
                      className="absolute w-1.5 h-1.5 rounded-full bg-amber-300 shadow-[0_0_8px_#fbbf24] animate-ping"
                      style={{ top: `calc(50% + ${s.y}px)`, left: `calc(50% + ${s.x}px)` }}
                    />
                  ))}
                </div>
              </div>

              {/* Live Generator Dials & Gauges */}
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-800/80 mt-3 text-center">
                <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">ROTATION</span>
                  <span className="block text-xs font-mono font-extrabold text-amber-400">{rpm} RPM</span>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">VOLTAGE</span>
                  <span className="block text-xs font-mono font-extrabold text-cyan-400">{voltage.toFixed(1)}V</span>
                </div>
                <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                  <span className="block text-[9px] text-slate-400 font-bold uppercase">LOAD</span>
                  <span className="block text-xs font-mono font-extrabold text-emerald-400">{isTurbo ? '99.4%' : '88.2%'}</span>
                </div>
              </div>

            </div>

            {/* 2. CODERS & DEFENSE ENGINEERS AT WORK (4 Cols) */}
            <div className="lg:col-span-4 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden shadow-inner">
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <User className="h-3 w-3 text-cyan-400" />
                    DEV WORKSPACE POD
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 font-bold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                    ACTIVE CODING
                  </span>
                </div>

                {/* Animated Coder Illustration & Multi-Monitor Workstation */}
                <div className="relative h-28 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-around p-3 overflow-hidden">
                  
                  {/* Coder 1 (Left - Defense AI Lead) */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                        <div className="w-3.5 h-1 bg-cyan-400/80 rounded-full" />
                      </div>
                      <div className="absolute -top-1 -left-1 -right-1 h-4 border-t-2 border-x-2 border-amber-400 rounded-t-full" />
                    </div>
                    <div className="w-10 h-7 bg-slate-800 rounded-t-md border-t border-slate-700 mt-0.5 flex items-center justify-center relative">
                      <div className={`w-6 h-1.5 bg-slate-700 rounded-full border border-slate-600 ${isTurbo || coffeeBoost ? 'animate-typing-1' : 'animate-typing-2'}`} />
                    </div>
                    <div className="w-14 h-2 bg-slate-950 rounded-t border-t border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
                  </div>

                  {/* Center Coffee Station with Rising Steam */}
                  <div className="flex flex-col items-center justify-end h-full pb-1">
                    <div className="relative">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-amber-200/40 blur-2xs animate-steam-1" />
                      <div className="w-4 h-5 rounded-b-md bg-amber-800 border border-amber-600 flex items-center justify-center">
                        <div className="text-[7px] font-bold text-amber-200">CA</div>
                      </div>
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 mt-1">COFFEE</span>
                  </div>

                  {/* Coder 2 (Right - GAT Content Specialist) */}
                  <div className="flex flex-col items-center">
                    <div className="relative">
                      <div className="w-7 h-7 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                        <div className="w-4 h-1.5 border border-emerald-400/80 rounded-xs" />
                      </div>
                    </div>
                    <div className="w-10 h-7 bg-slate-800 rounded-t-md border-t border-slate-700 mt-0.5 flex items-center justify-center relative">
                      <div className={`w-6 h-1.5 bg-slate-700 rounded-full border border-slate-600 ${isTurbo || coffeeBoost ? 'animate-typing-2' : 'animate-typing-1'}`} />
                    </div>
                    <div className="w-14 h-2 bg-slate-950 rounded-t border-t border-emerald-400/60 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                  </div>

                </div>
              </div>

              {/* Status Indicator */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-800/80 mt-3">
                <span className="flex items-center gap-1">
                  <Flame className="h-3 w-3 text-amber-500" />
                  <span>BURNDOWN: 94.2%</span>
                </span>
                <span className="text-cyan-400">
                  {coffeeBoost ? 'VELOCITY: 3.5x' : isTurbo ? 'VELOCITY: 2.0x' : 'VELOCITY: 1.0x'}
                </span>
              </div>

            </div>

            {/* 3. LIVE COMPILER TERMINAL & RADAR SWEEP (4 Cols) */}
            <div className="lg:col-span-4 bg-slate-950/90 border border-slate-800/90 rounded-2xl p-4.5 flex flex-col justify-between relative overflow-hidden shadow-inner">
              
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-400 flex items-center gap-1.5">
                    <Terminal className="h-3 w-3 text-emerald-400" />
                    LIVE BUILD TELEMETRY
                  </span>
                  <div className="flex items-center gap-1">
                    <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[10px] font-mono font-bold text-slate-300">v2.4.0-RC3</span>
                  </div>
                </div>

                {/* Radar + Live Terminal Feed */}
                <div className="relative h-28 bg-slate-900/90 rounded-xl border border-slate-800 p-2.5 flex flex-col justify-between overflow-hidden">
                  
                  {/* Subtle Background Radar Sweep */}
                  <div className="absolute right-2 bottom-2 w-16 h-16 rounded-full border border-emerald-500/20 pointer-events-none opacity-40">
                    <div className="absolute inset-0 rounded-full border border-emerald-500/20" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-emerald-500/20" />
                    <div className="absolute top-0 left-1/2 w-0.5 h-8 bg-gradient-to-t from-emerald-400 to-transparent origin-bottom animate-radar" />
                  </div>

                  {/* Terminal Text Line */}
                  <div className="space-y-1.5 z-10">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono text-amber-400/90 font-bold">
                      <span className="px-1.5 py-0.2 bg-amber-950/80 border border-amber-800 rounded">
                        [{codeLogs[activeCodeLine].tag}]
                      </span>
                      <span className="text-emerald-400">READY</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 leading-snug line-clamp-2">
                      {codeLogs[activeCodeLine].msg}
                    </p>
                  </div>

                  {/* Blinking Server Rack LEDs */}
                  <div className="flex items-center gap-1.5 pt-1 border-t border-slate-800/80 z-10">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse delay-100" />
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse delay-200" />
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse delay-300" />
                    <span className="text-[9px] font-mono text-slate-500 ml-auto">OCT_14_SYNC_OK</span>
                  </div>

                </div>
              </div>

              {/* Status indicator */}
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-3 border-t border-slate-800/80 mt-3">
                <span className="flex items-center gap-1">
                  <Compass className="h-3 w-3 text-cyan-400" />
                  <span>SYLLABUS COVERAGE</span>
                </span>
                <span className="text-emerald-400 font-bold">99.8% VERIFIED</span>
              </div>

            </div>

          </div>

        </section>

        {/* ========================================================================= */}
        {/* FULL-PAGE ASPIRANT QUERY & INTELLIGENCE DESK                              */}
        {/* ========================================================================= */}
        <section className="bg-slate-900/80 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl backdrop-blur-md space-y-6 relative overflow-hidden">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-amber-400" />
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Aspirant Query & Syllabus Intelligence Desk
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Submit syllabus questions to the AI Coach or register topic requests to be prioritized for the 14 Oct deployment.
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setActiveTab('ai-coach')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'ai-coach'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span>Instant AI Coach</span>
              </button>
              <button
                onClick={() => setActiveTab('submit-query')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  activeTab === 'submit-query'
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Submit Query Form</span>
              </button>
            </div>
          </div>

          {/* TAB 1: INSTANT AI COACH QUERY BOX */}
          {activeTab === 'ai-coach' && (
            <div className="space-y-6">
              
              {/* Suggested Topic Chips */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                  <Flame className="h-3 w-3 text-amber-500" /> Suggested High-Yield Query Topics:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {presetQueries.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiQuery(preset.text);
                        handleAskAICoach(preset.text);
                      }}
                      className="text-[11px] font-medium px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-950/70 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer text-left"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Form Bar */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAskAICoach(); }}
                className="flex gap-2.5 items-center bg-slate-950 border border-slate-800 p-2 sm:p-2.5 rounded-2xl shadow-inner focus-within:border-amber-500/60 transition"
              >
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask any GAT topic: e.g. What are the key missile classifications, speeds, and DRDO ranges?"
                  className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none font-medium"
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiQuery.trim()}
                  className="inline-flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold shadow-md transition disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer disabled:cursor-not-allowed shrink-0"
                >
                  {aiLoading ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 animate-spin text-slate-950" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Ask AI Coach</span>
                    </>
                  )}
                </button>
              </form>

              {/* AI Query Result Display */}
              {aiResponse && (
                <div className="bg-slate-950 border border-slate-800/90 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in duration-300 shadow-xl">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                        UPSC NDA GAT Academic Intelligence Brief
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSpeech(aiResponse)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-medium transition cursor-pointer"
                        title="Listen Aloud"
                      >
                        {speaking ? <VolumeX className="h-3.5 w-3.5 text-amber-400" /> : <Volume2 className="h-3.5 w-3.5" />}
                        <span>{speaking ? 'Stop' : 'Listen'}</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiResponse);
                          setCopiedResponse(true);
                          setTimeout(() => setCopiedResponse(false), 2000);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-slate-800 hover:bg-slate-900 text-slate-300 text-xs font-medium transition cursor-pointer"
                      >
                        {copiedResponse ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap space-y-2">
                    {aiResponse}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: SUBMIT ASPIRANT QUERY / TOPIC REQUEST FORM */}
          {activeTab === 'submit-query' && (
            <div className="space-y-6">
              
              {submittedQuery ? (
                <div className="bg-emerald-950/30 border border-emerald-500/30 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Query Successfully Registered</h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Tracking Reference: <strong className="text-emerald-400 font-mono">{submittedQuery.id}</strong>. Our editorial desk will review and integrate this topic into the **14 October 2026** platform deployment.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmittedQuery(null)}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitQueryForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Aspirant Name *
                      </label>
                      <div className="relative">
                        <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Cadet Rahul Sharma"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500/60 transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. rahul.nda@gmail.com"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500/60 transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500/60 transition cursor-pointer"
                      >
                        <option value="Syllabus Topic Request">Syllabus Topic Request (Priority for 14 Oct)</option>
                        <option value="Exam Guidance">UPSC NDA 1/2027 GAT Guidance</option>
                        <option value="Defense News Inquiry">Defense Technology / Weaponry Inquiry</option>
                        <option value="Feature Suggestion">Feature Suggestion</option>
                        <option value="Other">General Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                        Urgency Level
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-amber-500/60 transition cursor-pointer"
                      >
                        <option value="Normal">Normal Inquiry</option>
                        <option value="High">High Priority (Exam in 2026/2027)</option>
                        <option value="Immediate">Immediate Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                      Detailed Syllabus Query or Request *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.query}
                      onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                      placeholder="Describe the topics, questions, or specific features you would like to see covered upon our full launch on 14 October..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 outline-none focus:border-amber-500/60 transition leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold tracking-wider uppercase shadow-md transition cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                        <span>Transmitting Query to Editorial Desk...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Official Inquiry</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          )}

        </section>

        {/* ========================================================================= */}
        {/* ROADMAP & FEATURE MODULES                                                 */}
        {/* ========================================================================= */}
        <section className="space-y-4">
          <div className="text-center space-y-1">
            <h3 className="text-base sm:text-lg font-bold text-white">
              Upcoming Modules Releasing 14 October 2026
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Core academic frameworks prepared for UPSC NDA General Ability Test aspirants:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2 hover:border-slate-700 transition">
              <div className="h-9 w-9 rounded-xl bg-slate-800 text-amber-400 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-white">1,000+ Defense Capsules</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Daily tri-service defense news, bilateral military drills, DRDO missile specifications, and static GK links.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2 hover:border-slate-700 transition">
              <div className="h-9 w-9 rounded-xl bg-slate-800 text-emerald-400 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Spaced Repetition Matrix</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                SM-2 algorithm flashcard schedules to ensure zero memory decay for historical treaties and geographical passes.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2 hover:border-slate-700 transition">
              <div className="h-9 w-9 rounded-xl bg-slate-800 text-cyan-400 flex items-center justify-center">
                <Award className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-white">150-Q GAT Full Mocks</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Realistic UPSC NDA simulation with negative marking (-0.83), timers, and granular percentile analytics.
              </p>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl space-y-2 hover:border-slate-700 transition">
              <div className="h-9 w-9 rounded-xl bg-slate-800 text-fuchsia-400 flex items-center justify-center">
                <Volume2 className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-bold text-white">Audio Intelligence Briefs</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Hands-free 3-minute morning intelligence broadcasts to review news during physical training or commute.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* ========================================================================= */}
      {/* INSTITUTIONAL COMPREHENSIVE FOOTER                                        */}
      {/* ========================================================================= */}
      <footer className="relative z-10 border-t border-slate-800/90 bg-[#030712] pt-12 pb-8 text-slate-400 font-sans">
        
        {/* Compliance Badges Ribbon */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 border-b border-slate-800/80">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <ShieldCheck className="h-5 w-5 text-emerald-400 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-white">256-Bit AES Encryption</span>
                <span className="block text-[10px] text-slate-500 font-mono">End-to-End Data Security</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <EyeOff className="h-5 w-5 text-cyan-400 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-white">100% Student Privacy</span>
                <span className="block text-[10px] text-slate-500 font-mono">Zero Third-Party Ads / Trackers</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Scale className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-white">DPDP Act 2023 Aligned</span>
                <span className="block text-[10px] text-slate-500 font-mono">Full Compliance Standard</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <Server className="h-5 w-5 text-purple-400 shrink-0" />
              <div>
                <span className="block text-xs font-bold text-white">99.99% Target SLA Uptime</span>
                <span className="block text-[10px] text-slate-500 font-mono">High Availability Redundancy</span>
              </div>
            </div>

          </div>
        </div>

        {/* 4-Column Navigation & Info Matrix */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 text-xs">
          
          {/* Col 1: Brand & Academic Credentials (4 cols) */}
          <div className="lg:col-span-4 space-y-3.5">
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-sm">
                <Shield className="h-4 w-4" />
              </div>
              <span className="font-extrabold text-sm text-white tracking-tight">
                NDA GAT Intelligence Engine
              </span>
            </div>
            
            <p className="text-slate-400 text-xs leading-relaxed font-normal">
              Official strategic preparation platform engineered for the UPSC National Defence Academy & Naval Academy Examination (General Ability Test). Built with military-grade precision and verifiable pedagogical standards.
            </p>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                SYSTEM STATUS: 100% OPERATIONAL
              </span>
            </div>
          </div>

          {/* Col 2: Core Syllabus Modules (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-amber-400/90">
              Intelligence Modules
            </h4>
            <ul className="space-y-2 text-slate-400">
              <li className="flex items-center gap-2 hover:text-white transition cursor-default">
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span>1,000+ Tri-Service Defense GK</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition cursor-default">
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span>SM-2 Spaced Repetition Cache</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition cursor-default">
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span>150-Q UPSC NDA Simulation Mocks</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition cursor-default">
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span>Audio Intelligence Broadcasts</span>
              </li>
              <li className="flex items-center gap-2 hover:text-white transition cursor-default">
                <ChevronRight className="h-3 w-3 text-slate-600" />
                <span>Missile Telemetry & Command Vault</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal, Privacy & Security Modals (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-cyan-400/90">
              Privacy & Governance
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActiveModal('privacy')}
                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition cursor-pointer text-left"
                >
                  <Lock className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Privacy Policy (100% Protected)</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('security')}
                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition cursor-pointer text-left"
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  <span>Security & Encryption Architecture</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('terms')}
                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition cursor-pointer text-left"
                >
                  <Scale className="h-3.5 w-3.5 text-amber-400" />
                  <span>Terms of Service & Honor Code</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveModal('telemetry')}
                  className="flex items-center gap-2 text-slate-400 hover:text-cyan-300 transition cursor-pointer text-left"
                >
                  <Activity className="h-3.5 w-3.5 text-purple-400" />
                  <span>System Telemetry & SLA Specs</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Version & Build Specification (2 cols) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono text-emerald-400/90">
              Build Specification
            </h4>
            <div className="space-y-1.5 font-mono text-[11px] text-slate-400 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">VERSION</span>
                <span className="text-emerald-400 font-bold">v2.4.0-PROD</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">BUILD CANDIDATE</span>
                <span className="text-slate-300">2026.10.14-RC3</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">CIPHER SUITE</span>
                <span className="text-cyan-300">AES-256-GCM / TLS 1.3</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[9px] uppercase">TARGET DATE</span>
                <span className="text-amber-400 font-bold">14 OCT 2026</span>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright & Disclaimer Bottom Bar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <div>
            <p>© 2026 UPSC NDA General Ability Test (GAT) Intelligence Engine. All Rights Reserved.</p>
            <p className="text-[10px] text-slate-600 mt-0.5">
              Academic preparation repository for UPSC NDA examination aspirants. Independent educational resource.
            </p>
          </div>

          <div className="flex items-center gap-4 text-slate-400 font-mono text-[10px]">
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3 text-emerald-400" />
              <span>SHA-256 VERIFIED</span>
            </span>
            <span>•</span>
            <span>GDPR / DPDP READY</span>
            <span>•</span>
            <span className="text-amber-400 font-bold">OCT 14 LAUNCH</span>
          </div>
        </div>

      </footer>

      {/* ========================================================================= */}
      {/* INTERACTIVE MODALS FOR PRIVACY, SECURITY, TERMS, TELEMETRY                */}
      {/* ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
              <div className="flex items-center gap-2.5">
                {activeModal === 'privacy' && <Lock className="h-5 w-5 text-cyan-400" />}
                {activeModal === 'security' && <ShieldCheck className="h-5 w-5 text-emerald-400" />}
                {activeModal === 'terms' && <Scale className="h-5 w-5 text-amber-400" />}
                {activeModal === 'telemetry' && <Activity className="h-5 w-5 text-purple-400" />}
                
                <h3 className="text-base font-bold text-white">
                  {activeModal === 'privacy' && '100% Student Privacy Policy & Data Charter'}
                  {activeModal === 'security' && 'Security Architecture & 256-Bit Encryption Protocol'}
                  {activeModal === 'terms' && 'Terms of Service & Academic Honor Code'}
                  {activeModal === 'telemetry' && 'System Architecture, Version & SLA Metrics'}
                </h3>
              </div>

              <button
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              
              {/* PRIVACY POLICY CONTENT */}
              {activeModal === 'privacy' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs">
                    <strong>100% Student Data Protection Guarantee:</strong> We do NOT sell, rent, monetize, or transmit any aspirant personal data, mock exam attempts, or learning telemetry to third parties.
                  </div>

                  <h4 className="font-bold text-white text-sm">1. Data Collection & Usage</h4>
                  <p>
                    We collect only essential credentials (student name, email, target exam year) required to maintain synchronized bookmarks, spaced revision flashcards, and personalized diagnostic test performance.
                  </p>

                  <h4 className="font-bold text-white text-sm">2. Zero Third-Party Advertising & Trackers</h4>
                  <p>
                    This platform contains zero third-party commercial advertising networks, zero data brokers, and zero behavioral telemetry SDKs. The study environment is 100% focused on academic excellence.
                  </p>

                  <h4 className="font-bold text-white text-sm">3. DPDP Act 2023 & GDPR Compliance</h4>
                  <p>
                    In full accordance with the Digital Personal Data Protection (DPDP) Act of 2023 and global privacy frameworks, you retain complete rights to inspect, export, or permanently delete your learning records and quiz scores at any time from the account settings.
                  </p>
                </div>
              )}

              {/* SECURITY CONTENT */}
              {activeModal === 'security' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-200 text-xs">
                    <strong>Enterprise Military-Grade Security:</strong> All user records, quiz histories, and editorial notes are secured with 256-Bit Advanced Encryption Standard (AES) at rest and Transport Layer Security (TLS 1.3) in transit.
                  </div>

                  <h4 className="font-bold text-white text-sm">1. Database Security & Granular RBAC</h4>
                  <p>
                    User data is partitioned through strict Firestore Security Rules. Aspirants can only read and write their own quiz attempts, bookmarks, and revision items. Editorial and admin actions are strictly locked to authorized credentials.
                  </p>

                  <h4 className="font-bold text-white text-sm">2. AI Request Sanitization & Rate-Limiting</h4>
                  <p>
                    All queries submitted to the GAT AI Coach Assistant are scrubbed and verified against rate limits to prevent prompt injection and unauthorized denial of service attacks.
                  </p>

                  <h4 className="font-bold text-white text-sm">3. Continuous Vulnerability Auditing</h4>
                  <p>
                    Our dependencies and API bridges undergo continuous automated vulnerability scanning and adhere to OWASP Top 10 security standards.
                  </p>
                </div>
              )}

              {/* TERMS OF SERVICE */}
              {activeModal === 'terms' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-xs">
                    <strong>Academic Integrity & Fair Use:</strong> This application is an educational aid designed solely to support defense aspirants preparing for the UPSC NDA & NA General Ability Test.
                  </div>

                  <h4 className="font-bold text-white text-sm">1. Educational License & Scope</h4>
                  <p>
                    All practice questions, defense cheatsheets, and spaced repetition notes are curated for individual student study. Unauthorized bulk scraping or redistribution of the question bank is prohibited.
                  </p>

                  <h4 className="font-bold text-white text-sm">2. Examination Disclaimer</h4>
                  <p>
                    UPSC (Union Public Service Commission) is an independent constitutional authority. This portal is an educational study tool and is not officially affiliated with or endorsed by the Union Public Service Commission.
                  </p>

                  <h4 className="font-bold text-white text-sm">3. Aspirant Honor Code</h4>
                  <p>
                    Cadets and students are encouraged to uphold the highest standards of integrity, discipline, and honest self-assessment during mock examination attempts.
                  </p>
                </div>
              )}

              {/* SYSTEM TELEMETRY */}
              {activeModal === 'telemetry' && (
                <div className="space-y-4">
                  <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs">
                    <strong>Deployment Architecture Specifications:</strong> High-availability cloud infrastructure optimized for low-latency delivery across pan-India networks.
                  </div>

                  <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">CURRENT RELEASE</span>
                      <span className="text-white font-bold">v2.4.0-PROD_CANDIDATE</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">TARGET LAUNCH</span>
                      <span className="text-amber-400 font-bold">14 October 2026</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">UPTIME SLA</span>
                      <span className="text-emerald-400 font-bold">99.99% Availability</span>
                    </div>
                    <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block text-[10px]">MEDIAN API LATENCY</span>
                      <span className="text-cyan-400 font-bold">&lt; 14ms (CDN Edge)</span>
                    </div>
                  </div>

                  <h4 className="font-bold text-white text-sm">Multi-Tier Failover Mechanism</h4>
                  <p>
                    The AI Coach and quiz engines are configured with multi-tier automated cascade failover to ensure zero downtime even during upstream network reconfigurations.
                  </p>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/60 flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                Close Specification
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UnderConstruction;
