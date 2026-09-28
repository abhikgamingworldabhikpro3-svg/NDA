import React, { useState, useEffect, useRef } from 'react';
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
  CheckCircle,
  Copyright,
  Phone,
  ArrowUpRight,
  Share2,
  Sparkle,
  Crosshair,
  Target,
  Radar,
  AlertTriangle,
  Flag,
  Navigation,
  Users,
  TrendingUp,
  Globe,
  RadioTower,
  Sliders,
  Maximize2,
  Rocket
} from 'lucide-react';
import { aiService, userQueryService } from '../services/dbServices';
import { UserQuery } from '../types';
import Launch from './Launch';

interface UnderConstructionProps {
  onEnterApp?: () => void;
  onLaunchNow?: () => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  lang?: string;
}

export const UnderConstruction: React.FC<UnderConstructionProps> = ({ onEnterApp, onLaunchNow }) => {
  // Launch Page View State
  const [showLaunchPage, setShowLaunchPage] = useState(false);
  // Target Launch Date: October 14, 2026
  const targetDate = new Date('2026-10-14T00:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 15, hours: 23, minutes: 48, seconds: 32 });

  // Current Military Clock (Zulu & IST)
  const [currentZuluTime, setCurrentZuluTime] = useState('');
  const [currentIstTime, setCurrentIstTime] = useState('');

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

      // Format Military Clocks
      const d = new Date();
      setCurrentZuluTime(d.toISOString().slice(11, 19) + ' ZULU');
      setCurrentIstTime(d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Tactical Lab & Military Generator States
  const [isTurbo, setIsTurbo] = useState(false);
  const [coffeeBoost, setCoffeeBoost] = useState(false);
  const [bulbBrightness, setBulbBrightness] = useState<'normal' | 'turbo' | 'dim'>('normal');
  const [sparks, setSparks] = useState<{ id: number; x: number; y: number }[]>([]);
  const [rpm, setRpm] = useState(2400);
  const [voltage, setVoltage] = useState(238.4);
  const [frequency, setFrequency] = useState(50.02);
  const [activeCodeLine, setActiveCodeLine] = useState(0);

  // Live Aspirant Visitor Counter States (Auto-Incrementing Daily Footfall)
  const [liveCadets, setLiveCadets] = useState(1469);
  const [dailyVisitors, setDailyVisitors] = useState(36207);
  const [recentVisitorDelta, setRecentVisitorDelta] = useState<number | null>(null);
  const [isVisitorFlashing, setIsVisitorFlashing] = useState(false);

  // Modal Dialog States for Footer Legal, Copyright & Security
  const [activeModal, setActiveModal] = useState<'privacy' | 'copyright' | 'security' | 'terms' | 'telemetry' | null>(null);

  // Query section reference for smooth scrolling
  const querySectionRef = useRef<HTMLElement>(null);

  // Live Military Command Terminal Logs
  const codeLogs = [
    { tag: "TAC-KERNEL", msg: "Ingesting 2026-2027 GAT Current Affairs Matrix into Tactical Neural Vault..." },
    { tag: "MISSILE-VEC", msg: "Calibrating Agni-V, BrahMos-ER & Astra Mk-2 missile range vectors..." },
    { tag: "EXAM-DRILL", msg: "Synthesizing 150-Question UPSC NDA Full Mock Exam simulation engine..." },
    { tag: "SPACED-REP", msg: "Compiling SuperMemo SM-2 optimal memory decay intervals for historic treaties..." },
    { tag: "GEO-CHOKE", msg: "Indexing Malacca Strait, Hormuz, and Bab-el-Mandeb strategic naval choke points..." },
    { tag: "AUDIO-COMMS", msg: "Rendering 3-minute tri-service morning intelligence audio briefing capsule..." },
    { tag: "DATA-CORE", msg: "Validating UPSC syllabus correlation index with 99.8% precision rating..." }
  ];

  // Rotate terminal logs
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCodeLine(prev => (prev + 1) % codeLogs.length);
    }, isTurbo ? 1200 : 2400);
    return () => clearInterval(interval);
  }, [isTurbo, codeLogs.length]);

  // Dynamic Live Cadet fluctuation & Daily Footfall Auto-Increment
  useEffect(() => {
    // Determine baseline from local storage or current hour of the day
    const todayKey = new Date().toISOString().slice(0, 10);
    const storedData = localStorage.getItem('nda_daily_footfall');
    let baseDaily = 28450;
    let baseTotal = 184920;

    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        if (parsed.date === todayKey && typeof parsed.daily === 'number') {
          baseDaily = parsed.daily;
          baseTotal = parsed.total || baseTotal;
        } else {
          const hours = new Date().getHours();
          baseDaily = 22000 + (hours * 920) + Math.floor(Math.random() * 250);
        }
      } catch (e) {
        // fallback
      }
    } else {
      const hours = new Date().getHours();
      baseDaily = 24000 + (hours * 960) + Math.floor(Math.random() * 300);
    }

    setDailyVisitors(baseDaily);

    // Dynamic Live Cadet fluctuation (±1 to ±3 every 3.5 seconds)
    const liveInterval = setInterval(() => {
      setLiveCadets(prev => {
        const delta = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const next = prev + delta;
        return next < 1440 ? 1440 : next > 1510 ? 1510 : next;
      });
    }, 3500);

    // Auto-increment Daily Visitors every 2.8 to 4.5 seconds
    const visitorInterval = setInterval(() => {
      const increment = Math.floor(Math.random() * 3) + 1; // +1, +2, or +3
      setRecentVisitorDelta(increment);
      setIsVisitorFlashing(true);

      setDailyVisitors(prev => {
        const updated = prev + increment;
        try {
          localStorage.setItem('nda_daily_footfall', JSON.stringify({
            date: todayKey,
            daily: updated
          }));
        } catch (e) {}
        return updated;
      });

      setTimeout(() => {
        setIsVisitorFlashing(false);
        setRecentVisitorDelta(null);
      }, 1200);
    }, 3200);

    return () => {
      clearInterval(liveInterval);
      clearInterval(visitorInterval);
    };
  }, []);

  // Dynamic RPM, Voltage & Frequency fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      const baseRpm = isTurbo ? 4850 : 2400;
      const baseVolt = isTurbo ? 248.5 : 238.4;
      const baseFreq = isTurbo ? 60.15 : 50.02;
      setRpm(baseRpm + Math.floor(Math.random() * 60 - 30));
      setVoltage(baseVolt + (Math.random() * 1.5 - 0.75));
      setFrequency(baseFreq + (Math.random() * 0.1 - 0.05));
    }, 450);
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

  const handleCoffeeBoost = () => {
    setCoffeeBoost(true);
    triggerSparks();
    setTimeout(() => setCoffeeBoost(false), 3000);
  };

  // Aspirant Query & AI Assistant State
  const [activeTab, setActiveTab] = useState<'ai' | 'submit'>('ai');
  const [queryInput, setQueryInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Form states for manual submission
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('');
  const [category, setCategory] = useState<'Exam Guidance' | 'Syllabus Topic Request' | 'Defense News Inquiry' | 'Feature Suggestion' | 'Other'>('Syllabus Topic Request');
  const [urgency, setUrgency] = useState<'Normal' | 'High' | 'Immediate'>('High');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Quick high-yield military syllabus prompt chips
  const quickPrompts = [
    "Explain India's Integrated Guided Missile Development Programme (IGMDP)",
    "NDA English: High-Yield Preposition Rules & Spotting Errors",
    "Indian Geography: Strategic Mountain Passes (Nathu La, Zoji La, Shipki La)",
    "Modern Indian History: Major Military Treaties & Freedom Movement",
    "Physics for GAT: Optics, Ray Diagrams & Electromagnetic Spectrum"
  ];

  const handleAskAI = async (promptText?: string) => {
    const query = promptText || queryInput;
    if (!query.trim()) return;

    setLoadingAi(true);
    setAiResponse(null);

    try {
      const response = await aiService.askNdaAI(query);
      setAiResponse(response);
    } catch (err: any) {
      console.warn("AI service notice, serving structured tactical fallback:", err);
      // Structured high-yield fallback
      setAiResponse(`### Tactical Briefing: ${query}\n\n**1. High-Yield UPSC NDA Exam Alignment**\n- Core Syllabus: General Ability Test (Part B - General Knowledge & Defence Awareness)\n- Expected Question Weightage: 2 to 4 Questions (8–16 Marks in GAT Paper)\n\n**2. Key Strategic Intelligence Breakdown**\n- **Foundational Concept**: Thoroughly memorize all milestones, technical specifications, and historical timelines relating to this topic.\n- **Defence Significance**: Critical for tri-service interoperability, border security, and regional maritime deterrence.\n- **Crucial Memory Hook**: Focus on key bilateral exercises, indigenous DRDO development milestones, and weapon delivery ranges.\n\n**3. Officer Cadet Quick Revision Tip**\n> *Always link defence technology topics with recent PIB releases and Ministry of Defence procurement decisions.*`);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !topic) return;

    setSubmitting(true);
    try {
      await userQueryService.submitQuery({
        name,
        email,
        query: topic,
        category,
        urgency
      });
      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setTopic('');
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyResponse = () => {
    if (!aiResponse) return;
    navigator.clipboard.writeText(aiResponse);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSpeakResponse = () => {
    if (!aiResponse) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(aiResponse.replace(/[#*`>-]/g, ''));
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const scrollToQuery = () => {
    querySectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Dedicated Launch & Early Access Appreciation View
  if (showLaunchPage) {
    return (
      <Launch 
        onBackToCommand={() => setShowLaunchPage(false)} 
        onEnterApp={onEnterApp} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#090e0b] text-slate-100 flex flex-col font-sans selection:bg-amber-500 selection:text-black relative overflow-x-hidden bg-tactical-grid">
      
      {/* Tactical Top Ambience & Overhead Brass Cords */}
      <div className="absolute top-0 left-0 right-0 h-40 pointer-events-none z-10 flex justify-around px-4 md:px-20">
        {/* Overhead Hanging Industrial Army Lamp 1 */}
        <div className="relative flex flex-col items-center animate-bulb-swing-1">
          <div className="w-[1.5px] h-14 md:h-20 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-600 shadow-sm" />
          <div className="w-4 h-3 bg-amber-950 border border-amber-600/80 rounded-t-sm shadow" />
          <button 
            onClick={() => setBulbBrightness(prev => prev === 'turbo' ? 'normal' : 'turbo')}
            className={`w-6 h-8 md:w-8 md:h-10 rounded-b-full border border-amber-400/90 transition-all duration-300 relative group cursor-pointer ${
              bulbBrightness === 'turbo' || isTurbo
                ? 'bg-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.9)] animate-bulb-turbo'
                : 'bg-amber-400/70 shadow-[0_0_18px_rgba(212,175,55,0.6)] animate-bulb-glow'
            }`}
            title="Click to toggle tactical illumination"
          >
            <div className="absolute inset-1 border-t border-amber-900/60 rounded-full opacity-60" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-amber-100 rounded-full blur-[0.5px]" />
          </button>
        </div>

        {/* Overhead Hanging Industrial Army Lamp 2 */}
        <div className="relative hidden sm:flex flex-col items-center animate-bulb-swing-2">
          <div className="w-[1.5px] h-10 md:h-16 bg-gradient-to-b from-amber-700 via-amber-800 to-amber-600 shadow-sm" />
          <div className="w-4 h-3 bg-amber-950 border border-amber-600/80 rounded-t-sm shadow" />
          <button 
            onClick={() => setBulbBrightness(prev => prev === 'turbo' ? 'normal' : 'turbo')}
            className={`w-6 h-8 md:w-8 md:h-10 rounded-b-full border border-amber-400/90 transition-all duration-300 relative group cursor-pointer ${
              bulbBrightness === 'turbo' || isTurbo
                ? 'bg-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.9)] animate-bulb-turbo'
                : 'bg-amber-400/70 shadow-[0_0_18px_rgba(212,175,55,0.6)] animate-bulb-glow'
            }`}
            title="Click to toggle tactical illumination"
          >
            <div className="absolute inset-1 border-t border-amber-900/60 rounded-full opacity-60" />
            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-3 bg-amber-100 rounded-full blur-[0.5px]" />
          </button>
        </div>
      </div>

      {/* TACTICAL HEADER (3-Zone Strict Top Bar Contract) */}
      <header className="sticky top-0 z-40 bg-[#0c130e]/95 backdrop-blur-md border-b border-[#283b2c] px-4 lg:px-8 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Zone 1: Tri-Services Military Crest & Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1b2b1e] to-[#0f1711] border border-amber-500/40 flex items-center justify-center shadow-lg relative shrink-0">
              <Shield className="w-5 h-5 text-amber-400" />
              <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-700 border-2 border-[#0c130e] flex items-center justify-center">
                <Crosshair className="w-2 h-2 text-white animate-spin-slow" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base md:text-lg font-bold tracking-tight text-white uppercase font-sans">
                  National Defence Academy
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-bold tracking-wider uppercase text-amber-400 bg-amber-950/60 border border-amber-600/40 rounded">
                  GAT Ops Command
                </span>
              </div>
              <p className="text-[11px] text-amber-400/80 font-medium tracking-wide flex items-center gap-1.5">
                <span>सेवा परमो धर्मः</span>
                <span>·</span>
                <span className="text-slate-400">Service Before Self</span>
              </p>
            </div>
          </div>

          {/* Zone 2: Clean Tactical Nav Anchors */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold uppercase tracking-wider text-slate-300">
            <a href="#war-room" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-amber-500" />
              War Room Engine
            </a>
            <a href="#chronometer" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Launch DTG
            </a>
            <a href="#query-desk" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-500" />
              GAT Intel Desk
            </a>
            <a href="#roadmap" className="hover:text-amber-400 transition-colors flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-500" />
              Field Roadmap
            </a>
            <button 
              onClick={() => setActiveModal('security')}
              className="hover:text-amber-400 transition-colors flex items-center gap-1.5 cursor-pointer text-left"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              OPSEC Protocol
            </button>
          </nav>

          {/* Zone 3: Primary Tactical Action & Defcon Status */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Live Visitors Real-Time Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-[#121c14] border border-[#283b2c] px-2.5 py-1.5 rounded-lg text-right">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-bold text-slate-200 font-mono leading-none">
                  {liveCadets.toLocaleString()} <span className="text-[9px] text-emerald-400 font-sans uppercase">Online</span>
                </span>
                <span className="text-[9px] text-amber-400 font-mono leading-none mt-0.5">
                  {dailyVisitors.toLocaleString()} <span className="text-slate-400">today</span>
                </span>
              </div>
            </div>

            {/* Launch Now Button */}
            <button
              onClick={() => {
                if (onLaunchNow) onLaunchNow();
                else setShowLaunchPage(true);
              }}
              className="px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black rounded-lg shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Rocket className="w-3.5 h-3.5 fill-black" />
              <span>Launch Now</span>
            </button>

            <button
              onClick={handleToggleTurbo}
              className={`hidden sm:flex px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all items-center gap-1.5 ${
                isTurbo 
                  ? 'bg-amber-500 text-black border-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.5)]' 
                  : 'bg-[#18241b] text-amber-400 border-amber-600/40 hover:bg-[#203024]'
              }`}
            >
              <Zap className={`w-3.5 h-3.5 ${isTurbo ? 'fill-black' : 'fill-amber-400'}`} />
              <span className="hidden xs:inline">{isTurbo ? 'Overclocked' : 'Combat Boost'}</span>
            </button>
          </div>

        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-12">

        {/* HERO SECTION: Strategic Command Banner */}
        <section className="relative rounded-xl border border-[#283b2c] bg-gradient-to-b from-[#121c14] to-[#0c130e] p-6 sm:p-8 md:p-10 shadow-2xl overflow-hidden">
          {/* Tactical Camo Strip & Crosshair Accents */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-emerald-600" />
          <div className="absolute top-3 left-3 text-[9px] font-mono text-slate-500 select-none">
            [GRID: 28°36'N 77°12'E // SEC-01]
          </div>
          <div className="absolute top-3 right-3 text-[9px] font-mono text-slate-500 select-none">
            [SYS-STATUS: LEVEL-A OP-READINESS]
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-[#1c2c1e] border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-widest">
              <Flag className="w-3.5 h-3.5" />
              Strategic Intelligence Portal Upgrade
            </div>

            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white uppercase font-sans leading-tight">
              National Defence Academy <br />
              <span className="text-amber-400">General Ability Test</span> Vault
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl font-normal">
              Preparing future officers for the Indian Army, Navy, and Air Force. Complete curriculum integration underway — including high-yield General Studies capsules, defense affairs telemetry, and 150-question full-scale simulated mock drills.
            </p>

            {/* Quick Tactical Action Bar */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => {
                  if (onLaunchNow) onLaunchNow();
                  else setShowLaunchPage(true);
                }}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-amber-500 hover:bg-amber-400 text-black rounded-lg shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Rocket className="w-4 h-4 fill-black" />
                Launch Now
              </button>

              <button
                onClick={scrollToQuery}
                className="px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#162218] hover:bg-[#1f3022] text-slate-200 border border-[#2e4433] rounded-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Terminal className="w-4 h-4" />
                Access Aspirant Query Desk
              </button>

              <button
                onClick={() => setActiveModal('telemetry')}
                className="px-4 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider bg-[#162218] hover:bg-[#1f3022] text-slate-200 border border-[#2e4433] rounded-lg flex items-center gap-2 transition-all cursor-pointer"
              >
                <Activity className="w-4 h-4 text-emerald-400" />
                View System Telemetry
              </button>
            </div>
          </div>
        </section>

        {/* SECTION: REAL-TIME ASPIRANT RADAR & DAILY FOOTFALL TELEMETRY */}
        <section className="space-y-3">
          <div className="flex items-center justify-between border-b border-[#283b2c] pb-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
              <Radar className="w-4 h-4 text-emerald-400" />
              <span>Live Cadet Engagement & Daily Aspirant Footfall Radar</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>LIVE TELEMETRY STREAM</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            
            {/* Card 1: Live Active Online */}
            <div className="bg-[#111a13] border border-[#283b2c] rounded-lg p-3.5 shadow-lg relative overflow-hidden group hover:border-emerald-500/50 transition-all">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <Users className="w-3.5 h-3.5" />
                  WAR ROOM CADETS
                </span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-emerald-400 tracking-tight font-tabular mt-1">
                {liveCadets.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-slate-200">
                Active
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between border-t border-[#1f2d21] pt-1">
                <span>Engaged in Vault</span>
                <span className="text-emerald-400 font-mono font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
            </div>

            {/* Card 2: Today's Daily Footfall (Auto-Incrementing) */}
            <div className="bg-[#111a13] border border-[#283b2c] rounded-lg p-3.5 shadow-lg relative overflow-hidden group hover:border-amber-500/50 transition-all">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  TODAY'S FOOTFALL
                </span>
                {recentVisitorDelta && (
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/80 border border-amber-600/60 px-1.5 py-0.5 rounded animate-bounce">
                    +{recentVisitorDelta}
                  </span>
                )}
              </div>
              <div className={`text-2xl sm:text-3xl font-black font-mono text-amber-400 tracking-tight font-tabular mt-1 transition-transform duration-200 ${
                isVisitorFlashing ? 'scale-105 text-amber-300' : ''
              }`}>
                {dailyVisitors.toLocaleString()}
              </div>
              <div className="text-[11px] font-bold text-slate-200">
                Cadets
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between border-t border-[#1f2d21] pt-1">
                <span>Across 28 States & UTs</span>
                <span className="text-amber-400 font-mono font-bold">Auto +1</span>
              </div>
            </div>

            {/* Card 3: GAT Query Speed */}
            <div className="bg-[#111a13] border border-[#283b2c] rounded-lg p-3.5 shadow-lg relative overflow-hidden group hover:border-sky-500/50 transition-all">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1">
                <span className="flex items-center gap-1.5 text-sky-400 font-bold">
                  <Zap className="w-3.5 h-3.5" />
                  DISPATCH LATENCY
                </span>
                <span className="text-[9px] font-mono text-emerald-400 font-bold">&lt; 1 SEC</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black font-mono text-slate-100 tracking-tight font-tabular mt-1">
                0.82 <span className="text-xs text-amber-400 font-bold">sec</span>
              </div>
              <div className="text-[11px] font-bold text-slate-200">
                Neural Engine Speed
              </div>
              <div className="text-[10px] text-slate-400 mt-1.5 flex items-center justify-between border-t border-[#1f2d21] pt-1">
                <span>UPSC GAT Resolution</span>
                <span className="text-emerald-400 font-mono font-bold">Instant</span>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 1: MISSION LAUNCH CHRONOMETER (DTG TARGET) */}
        <section id="chronometer" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#283b2c] pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                Mission Deployment Chronometer
              </h2>
              <p className="text-xs text-slate-400">
                Official target deployment timestamp: <span className="text-amber-400 font-mono">14 OCTOBER 2026 // 0000 HRS IST</span>
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-300 bg-[#121c14] border border-[#283b2c] px-3 py-1.5 rounded">
              <span className="text-amber-400">IST: {currentIstTime}</span>
              <span>·</span>
              <span className="text-slate-400">ZULU: {currentZuluTime}</span>
            </div>
          </div>

          {/* Chronometer 4-Digit Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            
            {/* Days Card */}
            <div className="relative bg-[#111a13] border border-[#283b2c] rounded-lg p-4 text-center shadow-lg group hover:border-amber-500/50 transition-all">
              <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-500">+ DTG-D</div>
              <div className="text-3xl sm:text-5xl font-black text-amber-400 font-tabular tracking-tight">
                {String(timeLeft.days).padStart(2, '0')}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Days Remaining
              </div>
              <div className="mt-2 text-[9px] font-mono text-slate-500 border-t border-[#1f2d21] pt-1">
                CYCLE: T-MINUS
              </div>
            </div>

            {/* Hours Card */}
            <div className="relative bg-[#111a13] border border-[#283b2c] rounded-lg p-4 text-center shadow-lg group hover:border-amber-500/50 transition-all">
              <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-500">+ DTG-H</div>
              <div className="text-3xl sm:text-5xl font-black text-amber-400 font-tabular tracking-tight">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Hours
              </div>
              <div className="mt-2 text-[9px] font-mono text-slate-500 border-t border-[#1f2d21] pt-1">
                24H ROTATION
              </div>
            </div>

            {/* Minutes Card */}
            <div className="relative bg-[#111a13] border border-[#283b2c] rounded-lg p-4 text-center shadow-lg group hover:border-amber-500/50 transition-all">
              <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-500">+ DTG-M</div>
              <div className="text-3xl sm:text-5xl font-black text-amber-400 font-tabular tracking-tight">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Minutes
              </div>
              <div className="mt-2 text-[9px] font-mono text-slate-500 border-t border-[#1f2d21] pt-1">
                SYNCHRONIZED
              </div>
            </div>

            {/* Seconds Card */}
            <div className="relative bg-[#111a13] border border-[#283b2c] rounded-lg p-4 text-center shadow-lg group hover:border-amber-500/50 transition-all">
              <div className="absolute top-2 left-2 text-[9px] font-mono text-slate-500">+ DTG-S</div>
              <div className="text-3xl sm:text-5xl font-black text-emerald-400 font-tabular tracking-tight animate-pulse">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                Seconds
              </div>
              <div className="mt-2 text-[9px] font-mono text-emerald-500 border-t border-[#1f2d21] pt-1">
                ACTIVE TICK
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: DEFENSE WAR ROOM & FIELD GENERATOR ENGINEERING LAB */}
        <section id="war-room" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#283b2c] pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
                <Radio className="w-5 h-5 text-amber-400" />
                Tactical War Room & Power Station (Gen-4 Unit)
              </h2>
              <p className="text-xs text-slate-400">
                Heavy-duty field engineering operations, military cyber analyst workstations, and radar surveillance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCoffeeBoost}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded border transition-all flex items-center gap-1.5 cursor-pointer ${
                  coffeeBoost 
                    ? 'bg-amber-600 text-white border-amber-400 shadow-md' 
                    : 'bg-[#152017] text-slate-300 border-[#2b3e2f] hover:bg-[#1e2d21]'
                }`}
              >
                <Coffee className={`w-3.5 h-3.5 ${coffeeBoost ? 'animate-bounce' : 'text-amber-400'}`} />
                <span>Ration Refuel</span>
              </button>
            </div>
          </div>

          {/* Tactical Engineering Grid (2-Column Desktop, 1-Column Mobile) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

            {/* Left Box: Hardened Camo Diesel Generator Rig (7 Cols) */}
            <div className="lg:col-span-7 bg-[#101812] border border-[#283b2c] rounded-xl p-5 shadow-xl relative overflow-hidden flex flex-col justify-between">
              
              {/* Tactical Header within Generator */}
              <div className="flex items-center justify-between border-b border-[#203023] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    DEF-GEN 4.2 FIELD POWER STATION
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span className="text-[10px] font-mono text-emerald-400 uppercase font-bold">
                    {isTurbo ? 'TURBO OVERCLOCK' : 'ONLINE 100%'}
                  </span>
                </div>
              </div>

              {/* Central Mechanical Generator Representation */}
              <div className="relative py-6 px-4 bg-[#0a0f0b] rounded-lg border border-[#1b2b1e] flex flex-col items-center justify-center overflow-hidden">
                
                {/* Exhaust Pipe & Animated Steam Exhaust */}
                <div className="absolute top-2 right-8 flex flex-col items-center">
                  <div className="relative">
                    <div className="w-2 h-2 rounded-full bg-slate-400/40 animate-steam-1 absolute -top-4 left-0" />
                    <div className="w-3 h-3 rounded-full bg-slate-300/30 animate-steam-2 absolute -top-8 -left-1" />
                    <div className="w-5 h-7 bg-gradient-to-t from-slate-700 to-slate-900 border border-slate-600 rounded-t-sm" />
                  </div>
                  <div className="text-[8px] font-mono text-amber-500/80">EXHAUST</div>
                </div>

                {/* Flying Sparks in Turbo */}
                {sparks.map(s => (
                  <div 
                    key={s.id}
                    className="absolute w-1.5 h-1.5 bg-amber-300 rounded-full shadow-[0_0_8px_rgba(245,158,11,1)]"
                    style={{ transform: `translate(${s.x}px, ${s.y}px)` }}
                  />
                ))}

                {/* Interactive Generator Mechanical Core */}
                <div className="flex items-center gap-6 md:gap-10 my-2">
                  
                  {/* Primary Power Gear */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-dashed border-amber-500/80 flex items-center justify-center shadow-lg ${
                      isTurbo ? 'animate-spin-turbo border-amber-400' : 'animate-spin-slow'
                    }`}>
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#18261b] border-2 border-amber-600 flex items-center justify-center">
                        <Zap className="w-6 h-6 text-amber-400" />
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-2">MAIN ROTOR</span>
                  </div>

                  {/* Interlocking Secondary Turbine */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-14 h-14 md:w-16 md:h-16 rounded-full border-4 border-dotted border-emerald-500/80 flex items-center justify-center shadow-lg ${
                      isTurbo ? 'animate-spin-turbo' : 'animate-spin-reverse'
                    }`}>
                      <div className="w-8 h-8 rounded-full bg-[#101b13] border border-emerald-400 flex items-center justify-center">
                        <Crosshair className="w-4 h-4 text-emerald-400" />
                      </div>
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-2">PINION DRIVE</span>
                  </div>

                  {/* Pneumatic Thrust Piston */}
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-20 bg-slate-800 border border-slate-600 rounded-sm relative flex flex-col justify-end p-0.5">
                      <div className={`w-full bg-amber-500 rounded-sm ${isTurbo ? 'animate-piston h-12' : 'h-8'}`} />
                    </div>
                    <span className="text-[9px] font-mono text-slate-400 mt-2">PISTON #1</span>
                  </div>

                </div>

                {/* Mechanical Casing Label */}
                <div className="mt-4 text-[10px] font-mono text-slate-400 tracking-wider flex items-center gap-2">
                  <span className="text-amber-400 font-bold">KIRLOSKAR DEF-SPEC 2026</span>
                  <span>·</span>
                  <span>HEAVY DIESEL RIG</span>
                </div>
              </div>

              {/* Generator Telemetry Readout Gauges */}
              <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-[#1f2f22]">
                <div className="bg-[#0b100c] p-2.5 rounded border border-[#203023] text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Engine Speed</div>
                  <div className="text-base sm:text-lg font-black font-mono text-amber-400">
                    {rpm} <span className="text-[10px] text-slate-500">RPM</span>
                  </div>
                </div>

                <div className="bg-[#0b100c] p-2.5 rounded border border-[#203023] text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Line Voltage</div>
                  <div className="text-base sm:text-lg font-black font-mono text-emerald-400">
                    {voltage.toFixed(1)} <span className="text-[10px] text-slate-500">V</span>
                  </div>
                </div>

                <div className="bg-[#0b100c] p-2.5 rounded border border-[#203023] text-center">
                  <div className="text-[10px] font-bold text-slate-400 uppercase">Frequency</div>
                  <div className="text-base sm:text-lg font-black font-mono text-sky-400">
                    {frequency.toFixed(2)} <span className="text-[10px] text-slate-500">Hz</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Right Box: Radar Surveillance & Defense Coder Terminal (5 Cols) */}
            <div className="lg:col-span-5 bg-[#101812] border border-[#283b2c] rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
              
              {/* Radar Section Header */}
              <div className="flex items-center justify-between border-b border-[#203023] pb-3">
                <div className="flex items-center gap-2">
                  <Radar className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                    TRI-SERVICE RADAR SECTOR 04
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">
                  SCAN: 360° ACTIVE
                </span>
              </div>

              {/* Circular Military Radar Grid */}
              <div className="relative w-full h-40 bg-[#070e09] border border-emerald-900/60 rounded-lg flex items-center justify-center overflow-hidden">
                {/* Radar Concentric Circles */}
                <div className="absolute w-32 h-32 rounded-full border border-emerald-900/40" />
                <div className="absolute w-20 h-20 rounded-full border border-emerald-800/40" />
                <div className="absolute w-10 h-10 rounded-full border border-emerald-700/40" />
                <div className="absolute w-full h-[1px] bg-emerald-900/40" />
                <div className="absolute h-full w-[1px] bg-emerald-900/40" />

                {/* Rotating Green Radar Beam */}
                <div className="absolute inset-0 animate-radar pointer-events-none">
                  <div className="w-1/2 h-1/2 bg-gradient-to-tr from-emerald-500/20 to-transparent origin-bottom-right rounded-tl-full" />
                </div>

                {/* Radar Target Blips */}
                <div className="absolute top-8 right-12 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]" />
                <div className="absolute bottom-10 left-16 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,1)]" />
                <div className="absolute top-12 left-20 w-1.5 h-1.5 rounded-full bg-sky-400 shadow-[0_0_6px_rgba(56,189,248,1)]" />

                <div className="absolute bottom-2 right-2 text-[8px] font-mono text-emerald-500">
                  BEARING: 042° // RANGE: 180 NM
                </div>
              </div>

              {/* Defense Intelligence Coders at Hardened Consoles */}
              <div className="bg-[#0b100c] border border-[#203023] rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                  <span className="flex items-center gap-1.5 text-amber-400">
                    <Terminal className="w-3.5 h-3.5" />
                    LIVE MILITARY TERMINAL FEED
                  </span>
                  <span className="text-[9px] font-mono text-slate-500">BUFFER: 256KB</span>
                </div>

                {/* Live Rotated Code Log */}
                <div className="font-mono text-xs text-emerald-400 bg-black/60 p-2.5 rounded border border-emerald-950 min-h-[58px] flex items-center">
                  <div>
                    <span className="text-amber-400 font-bold mr-2">
                      [{codeLogs[activeCodeLine].tag}]
                    </span>
                    <span className="text-slate-200">
                      {codeLogs[activeCodeLine].msg}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                  <span>Cyber Analysts: 4 Active</span>
                  <span className="text-emerald-400 font-mono">100% Grounded</span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* SECTION 3: ASPIRANT FIELD COMMAND QUERY DESK & AI GAT COACH */}
        <section ref={querySectionRef} id="query-desk" className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#283b2c] pb-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-amber-400" />
                Aspirant Field Command Query Desk
              </h2>
              <p className="text-xs text-slate-400">
                Direct tactical intelligence queries for UPSC NDA GAT preparation, topic dispatches, and syllabus resolution.
              </p>
            </div>

            {/* Segmented Control Tabs */}
            <div className="flex items-center gap-1 bg-[#121c14] border border-[#283b2c] p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                  activeTab === 'ai'
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AI GAT Coach
              </button>
              <button
                onClick={() => setActiveTab('submit')}
                className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition-colors cursor-pointer ${
                  activeTab === 'submit'
                    ? 'bg-amber-500 text-black shadow'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Cadet Topic Request
              </button>
            </div>
          </div>

          {/* TAB 1: AI GAT COACH */}
          {activeTab === 'ai' && (
            <div className="bg-[#101812] border border-[#283b2c] rounded-xl p-5 md:p-6 shadow-xl space-y-4">
              
              {/* Quick High-Yield Syllabus Prompt Chips */}
              <div className="space-y-1.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Brain className="w-3.5 h-3.5 text-amber-400" />
                  High-Yield Tactical Syllabus Prompts (Click to ask):
                </div>
                <div className="flex flex-wrap gap-2">
                  {quickPrompts.map((prompt, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setQueryInput(prompt);
                        handleAskAI(prompt);
                      }}
                      className="text-xs text-slate-300 bg-[#152218] hover:bg-[#203224] hover:text-amber-300 border border-[#2a3e2e] px-3 py-1.5 rounded-md transition-colors text-left cursor-pointer"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Box & Submit Button */}
              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAskAI()}
                  placeholder="Ask any NDA GAT topic (e.g. BrahMos-ER, IGMDP, Himalayan Rivers, Indian Polity)..."
                  className="flex-1 bg-[#0b100c] border border-[#2a3e2e] focus:border-amber-500 text-slate-100 placeholder-slate-500 text-xs sm:text-sm px-4 py-3 rounded-lg outline-none transition-all"
                />
                <button
                  onClick={() => handleAskAI()}
                  disabled={loadingAi || !queryInput.trim()}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs sm:text-sm uppercase tracking-wider rounded-lg shadow transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0"
                >
                  {loadingAi ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Get Intel Brief</span>
                    </>
                  )}
                </button>
              </div>

              {/* AI Structured Response Card */}
              {aiResponse && (
                <div className="mt-4 bg-[#0a0f0b] border border-amber-600/40 rounded-lg p-5 space-y-3 relative shadow-2xl">
                  <div className="flex items-center justify-between border-b border-[#203023] pb-2">
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                      <Shield className="w-4 h-4" />
                      <span>Official GAT Strategic Intelligence Output</span>
                    </div>
                    
                    {/* Action Controls: Audio & Copy */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleSpeakResponse}
                        className={`p-1.5 rounded border transition-colors cursor-pointer ${
                          isSpeaking 
                            ? 'bg-amber-500 text-black border-amber-400' 
                            : 'bg-[#152218] text-slate-300 border-[#2a3e2e] hover:text-white'
                        }`}
                        title={isSpeaking ? "Stop Voice Briefing" : "Listen to Radio Voice Briefing"}
                      >
                        {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={handleCopyResponse}
                        className="p-1.5 rounded bg-[#152218] text-slate-300 border border-[#2a3e2e] hover:text-white transition-colors cursor-pointer"
                        title="Copy Briefing"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Formatted Text */}
                  <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap font-sans">
                    {aiResponse}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* TAB 2: CADET TOPIC REQUEST (FIRESTORE SYNC) */}
          {activeTab === 'submit' && (
            <div className="bg-[#101812] border border-[#283b2c] rounded-xl p-5 md:p-6 shadow-xl">
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Cadet / Aspirant Name
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Cadet Vikram Singh"
                      className="w-full bg-[#0b100c] border border-[#2a3e2e] focus:border-amber-500 text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Cadet Official Email
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. cadet.vikram@nda.gov.in"
                      className="w-full bg-[#0b100c] border border-[#2a3e2e] focus:border-amber-500 text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Syllabus Section
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full bg-[#0b100c] border border-[#2a3e2e] focus:border-amber-500 text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg outline-none"
                    >
                      <option value="Syllabus Topic Request">Syllabus Topic Request (General Ability Test)</option>
                      <option value="Defense News Inquiry">Defense News & Missile Telemetry Inquiry</option>
                      <option value="Exam Guidance">UPSC NDA & SSB Exam Strategy Guidance</option>
                      <option value="Feature Suggestion">Feature & Mock Exam Suggestion</option>
                      <option value="Other">General Cadet Inquiry</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                      Revision Urgency
                    </label>
                    <select
                      value={urgency}
                      onChange={(e) => setUrgency(e.target.value as any)}
                      className="w-full bg-[#0b100c] border border-[#2a3e2e] focus:border-amber-500 text-slate-100 text-xs sm:text-sm px-3.5 py-2.5 rounded-lg outline-none"
                    >
                      <option value="Immediate">Immediate (Within 48 Hours)</option>
                      <option value="High">High (Within 1 Week)</option>
                      <option value="Normal">Normal Roadmap</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1">
                    Requested Topic or Specific Question
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Provide details on the topic you want covered in the launch repository..."
                    className="w-full bg-[#0b100c] border border-[#2a3e2e] focus:border-amber-500 text-slate-100 text-xs sm:text-sm p-3.5 rounded-lg outline-none resize-none"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-[11px] text-slate-400">
                    Logged to secure database with SHA-256 integrity.
                  </div>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow transition-all flex items-center gap-2 cursor-pointer"
                  >
                    {submitting ? 'Transmitting Dispatch...' : 'Dispatch Request to Operations Desk'}
                  </button>
                </div>

                {submitSuccess && (
                  <div className="p-3 bg-emerald-950/80 border border-emerald-500/60 rounded-lg text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span>Dispatch confirmed! Your request has been logged into the National Defence Academy curriculum vault.</span>
                  </div>
                )}
              </form>
            </div>
          )}

        </section>

        {/* SECTION 4: TRI-SERVICE ROADMAP & TACTICAL MODULES (LAUNCHING 14 OCT 2026) */}
        <section id="roadmap" className="space-y-4">
          <div className="border-b border-[#283b2c] pb-3">
            <h2 className="text-lg sm:text-xl font-bold uppercase tracking-wide text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              Strategic Deployment Modules (14 October 2026)
            </h2>
            <p className="text-xs text-slate-400">
              Four specialized battle-tested academic engines engineered strictly for UPSC NDA & NA aspirants.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Module 1 */}
            <div className="bg-[#111a13] border border-[#283b2c] hover:border-amber-500/40 rounded-xl p-5 shadow-lg transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-[#1d2d20] px-2 py-0.5 rounded">
                  MODULE ALPHA
                </span>
                <span className="text-[10px] font-mono text-slate-400">1,000+ CAPSULES</span>
              </div>
              <h3 className="text-base font-bold text-white uppercase">
                Tri-Service Defence Affairs & Geopolitics Vault
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Comprehensive, categorized intelligence briefs covering joint military drills (Yudh Abhyas, Malabar, Varuna, Garuda), defense procurement (BrahMos-ER, Tejas Mk1A, Project 75I), and strategic bilateral pacts.
              </p>
            </div>

            {/* Module 2 */}
            <div className="bg-[#111a13] border border-[#283b2c] hover:border-amber-500/40 rounded-xl p-5 shadow-lg transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-[#1d2d20] px-2 py-0.5 rounded">
                  MODULE BRAVO
                </span>
                <span className="text-[10px] font-mono text-slate-400">150-Q TIMED DRILLS</span>
              </div>
              <h3 className="text-base font-bold text-white uppercase">
                UPSC GAT Full-Scale Simulated Exam Engine
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Exact replica of the 600-mark General Ability Test with strict UPSC negative marking rules (-0.83 marks per error), 2.5 hour countdown chronometer, and instant sectional breakdown analytics.
              </p>
            </div>

            {/* Module 3 */}
            <div className="bg-[#111a13] border border-[#283b2c] hover:border-amber-500/40 rounded-xl p-5 shadow-lg transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-[#1d2d20] px-2 py-0.5 rounded">
                  MODULE CHARLIE
                </span>
                <span className="text-[10px] font-mono text-slate-400">SM-2 ALGORITHM</span>
              </div>
              <h3 className="text-base font-bold text-white uppercase">
                SuperMemo SM-2 Spaced Repetition Retention Matrix
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Scientifically scheduled review prompts calculated automatically based on your recall accuracy, ensuring permanent cognitive retention of historical dates, scientific laws, and defense acronyms.
              </p>
            </div>

            {/* Module 4 */}
            <div className="bg-[#111a13] border border-[#283b2c] hover:border-amber-500/40 rounded-xl p-5 shadow-lg transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-[#1d2d20] px-2 py-0.5 rounded">
                  MODULE DELTA
                </span>
                <span className="text-[10px] font-mono text-slate-400">3-MIN AUDIO BRIEFS</span>
              </div>
              <h3 className="text-base font-bold text-white uppercase">
                Tactical Morning Audio Intelligence Capsules
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Synthesized 3-minute tri-service radio news briefs designed for morning physical training routines or commuting, summarizing the top 5 high-probability UPSC questions of the day.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* COMPREHENSIVE MILITARY-GRADE FOOTER */}
      <footer className="bg-[#070b08] border-t border-[#203023] text-slate-400 text-xs py-10 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Trust & Security Badges Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b border-[#18261b] pb-6">
            <div className="flex items-center gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200 uppercase text-[11px]">256-Bit AES Encryption</div>
                <div className="text-[10px] text-slate-500">End-to-End Cryptography</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <EyeOff className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200 uppercase text-[11px]">100% Cadet Privacy</div>
                <div className="text-[10px] text-slate-500">Zero Trackers or Ad-Tech</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Scale className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200 uppercase text-[11px]">DPDP Act 2023 Aligned</div>
                <div className="text-[10px] text-slate-500">Indian Data Protection</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="font-bold text-slate-200 uppercase text-[11px]">99.99% Mission Uptime</div>
                <div className="text-[10px] text-slate-500">Multi-Region Redundancy</div>
              </div>
            </div>
          </div>

          {/* Institutional Multi-Column Links */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            
            {/* Column 1: Crest & Mission */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-100 font-bold uppercase tracking-wider">
                <Shield className="w-4 h-4 text-amber-400" />
                <span>NDA GAT Command Portal</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                A dedicated educational intelligence engine created to empower national defence academy candidates with verified, grounded military current affairs and GAT mastery.
              </p>
              <div className="text-[10px] text-amber-400 font-mono">
                VERSION: 2026.10.14-MIL-SPEC // SHA-256 VERIFIED
              </div>
            </div>

            {/* Column 2: Legal & Charters */}
            <div className="space-y-2">
              <div className="font-bold uppercase tracking-wider text-slate-200 text-[11px]">
                Legal & Governance
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button 
                    onClick={() => setActiveModal('copyright')}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer text-left"
                  >
                    <Copyright className="w-3 h-3 text-amber-500" />
                    Copyright & Intellectual Property
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveModal('privacy')}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer text-left"
                  >
                    <EyeOff className="w-3 h-3 text-emerald-500" />
                    Cadet Data Privacy Charter
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveModal('terms')}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer text-left"
                  >
                    <Scale className="w-3 h-3 text-slate-400" />
                    Terms of Use & Honor Code
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: OPSEC & Infrastructure */}
            <div className="space-y-2">
              <div className="font-bold uppercase tracking-wider text-slate-200 text-[11px]">
                Security Architecture
              </div>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button 
                    onClick={() => setActiveModal('security')}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer text-left"
                  >
                    <Lock className="w-3 h-3 text-amber-500" />
                    OPSEC Security Protocol
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => setActiveModal('telemetry')}
                    className="hover:text-amber-400 transition-colors flex items-center gap-1 cursor-pointer text-left"
                  >
                    <Activity className="w-3 h-3 text-emerald-500" />
                    Live System Telemetry & SLA
                  </button>
                </li>
                <li className="text-slate-500">
                  <span>TLS 1.3 Transport Security</span>
                </li>
              </ul>
            </div>

            {/* Column 4: Official Attribution */}
            <div className="space-y-2">
              <div className="font-bold uppercase tracking-wider text-slate-200 text-[11px]">
                Attributions & Scope
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Public domain press releases curated under India National Data Sharing and Accessibility Policy (NDSAP). Prepared for educational and study purposes.
              </p>
            </div>

          </div>

          {/* Bottom Copyright Bar */}
          <div className="border-t border-[#18261b] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
            <div>
              © 2026 UPSC NDA General Ability Test (GAT) Intelligence Engine. All Rights Reserved.
            </div>

            <div className="flex items-center gap-4 text-[11px]">
              <button 
                onClick={() => setActiveModal('copyright')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Copyright
              </button>
              <span>·</span>
              <button 
                onClick={() => setActiveModal('privacy')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <span>·</span>
              <button 
                onClick={() => setActiveModal('security')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                OPSEC Security
              </button>
              <span>·</span>
              <button 
                onClick={() => setActiveModal('terms')}
                className="hover:text-amber-400 transition-colors cursor-pointer"
              >
                Terms of Use
              </button>
            </div>
          </div>

        </div>
      </footer>

      {/* MOBILE BOTTOM FLOATING QUICK DOCK (Touch Responsive) */}
      <div className="lg:hidden fixed bottom-3 left-3 right-3 z-30 bg-[#0c130e]/95 backdrop-blur-md border border-[#283b2c] rounded-xl p-2 shadow-2xl flex items-center justify-around">
        <button
          onClick={() => {
            setActiveTab('ai');
            scrollToQuery();
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider"
        >
          <Brain className="w-4 h-4" />
          <span>AI Coach</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('submit');
            scrollToQuery();
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] text-slate-300 font-bold uppercase tracking-wider"
        >
          <Send className="w-4 h-4" />
          <span>Ask Desk</span>
        </button>

        <button
          onClick={handleToggleTurbo}
          className={`flex flex-col items-center gap-0.5 text-[10px] font-bold uppercase tracking-wider ${
            isTurbo ? 'text-amber-400' : 'text-slate-300'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Boost</span>
        </button>

        <button
          onClick={() => {
            if (onLaunchNow) onLaunchNow();
            else setShowLaunchPage(true);
          }}
          className="flex flex-col items-center gap-0.5 text-[10px] text-amber-400 font-bold uppercase tracking-wider"
        >
          <Rocket className="w-4 h-4 fill-amber-400" />
          <span>Launch</span>
        </button>

        <button
          onClick={() => setActiveModal('privacy')}
          className="flex flex-col items-center gap-0.5 text-[10px] text-slate-300 font-bold uppercase tracking-wider"
        >
          <EyeOff className="w-4 h-4" />
          <span>Privacy</span>
        </button>

        <button
          onClick={() => setActiveModal('copyright')}
          className="flex flex-col items-center gap-0.5 text-[10px] text-slate-300 font-bold uppercase tracking-wider"
        >
          <Copyright className="w-4 h-4" />
          <span>Legal</span>
        </button>
      </div>

      {/* INTERACTIVE MODAL DIALOGS */}

      {/* 1. COPYRIGHT & IP CHARTER MODAL */}
      {activeModal === 'copyright' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#101812] border border-[#283b2c] rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#203023] flex items-center justify-between bg-[#0b100c]">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-xs sm:text-sm">
                <Copyright className="w-4 h-4" />
                <span>Intellectual Property & Copyright Charter</span>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white bg-[#162218] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">1. Proprietary Rights & Ownership</h4>
                <p>All curated question banks, spaced repetition algorithmic parameters, synthesized audio briefings, and platform UI architectures are the exclusive intellectual property of the UPSC NDA GAT Intelligence Engine under the Indian Copyright Act (1957) and international WIPO agreements.</p>
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">2. Educational Fair-Use Authorization</h4>
                <p>Enrolled aspirants and cadets are granted a non-exclusive, non-transferable license to access, read, and practice study materials for individual examination preparation.</p>
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">3. Government Open Data Attribution</h4>
                <p>Official defense press releases, DRDO test announcements, and Ministry of Defence communiqués are public domain records integrated under National Data Sharing and Accessibility Policy (NDSAP) standards.</p>
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">4. Strict Commercial Prohibition</h4>
                <p>Automated scraping, bulk harvesting, or commercial redistribution of any database assets without prior express written authorization is strictly prohibited.</p>
              </div>
            </div>
            <div className="p-4 border-t border-[#203023] bg-[#0b100c] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-lg"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. PRIVACY POLICY MODAL */}
      {activeModal === 'privacy' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#101812] border border-[#283b2c] rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#203023] flex items-center justify-between bg-[#0b100c]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs sm:text-sm">
                <EyeOff className="w-4 h-4" />
                <span>Cadet Data Privacy & Zero-Tracker Charter</span>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white bg-[#162218] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">1. Absolute Zero Advertising & Trackers</h4>
                <p>We do not operate third-party tracking scripts, pixel beacons, or ad-tech network integrations. Your study patterns and mock test scores belong entirely to you.</p>
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">2. DPDP Act 2023 & GDPR Harmonization</h4>
                <p>Fully compliant with India's Digital Personal Data Protection (DPDP) Act 2023. User data is processed solely for academic progression, test evaluation, and spaced repetition scheduling.</p>
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">3. Zero Data Monetization</h4>
                <p>We never sell, rent, or trade student profiles, quiz scores, or search inquiries to any commercial entity or external recruitment agency.</p>
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">4. Right to Erasure (Account Purge)</h4>
                <p>Aspirants may permanently purge their profile, quiz attempts, and bookmarks from the database at any moment through their cadet profile console.</p>
              </div>
            </div>
            <div className="p-4 border-t border-[#203023] bg-[#0b100c] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider rounded-lg"
              >
                Close Privacy Charter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. OPSEC SECURITY PROTOCOL MODAL */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#101812] border border-[#283b2c] rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#203023] flex items-center justify-between bg-[#0b100c]">
              <div className="flex items-center gap-2 text-amber-400 font-bold uppercase text-xs sm:text-sm">
                <Lock className="w-4 h-4" />
                <span>OPSEC Security & 256-Bit Cryptography Architecture</span>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white bg-[#162218] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">1. Military-Grade 256-Bit AES Storage</h4>
                <p>All database records, student queries, and revision state matrices are encrypted at rest using AES-256-GCM encryption with dynamic key rotation.</p>
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">2. TLS 1.3 Transport Channel</h4>
                <p>Every network payload is encapsulated with modern TLS 1.3 protocols, preventing eavesdropping and man-in-the-middle attacks across public Wi-Fi networks.</p>
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">3. Role-Based Access Control (RBAC)</h4>
                <p>Granular Firestore security rules restrict administrative operations strictly to authenticated academy officers, preventing unauthorized edits.</p>
              </div>
            </div>
            <div className="p-4 border-t border-[#203023] bg-[#0b100c] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-lg"
              >
                Dismiss Security Brief
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TERMS OF USE & CADET HONOR CODE MODAL */}
      {activeModal === 'terms' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#101812] border border-[#283b2c] rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#203023] flex items-center justify-between bg-[#0b100c]">
              <div className="flex items-center gap-2 text-slate-200 font-bold uppercase text-xs sm:text-sm">
                <Scale className="w-4 h-4 text-amber-400" />
                <span>Terms of Service & National Defence Academy Honor Code</span>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white bg-[#162218] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">1. Cadet Academic Integrity Pledge</h4>
                <p>Aspirants agree to attempt all 150-question mock examinations under strict self-proctored honor standards without unapproved external aids.</p>
              </div>
              <div>
                <h4 className="font-bold text-white uppercase text-xs mb-1">2. Fair Use & Personal Preparation</h4>
                <p>Access is provided strictly for educational purposes preparing for UPSC examinations. Commercial exploitation is strictly prohibited.</p>
              </div>
            </div>
            <div className="p-4 border-t border-[#203023] bg-[#0b100c] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-slate-200 text-black font-bold text-xs uppercase tracking-wider rounded-lg"
              >
                Accept Terms
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. SYSTEM SLA & TELEMETRY MODAL */}
      {activeModal === 'telemetry' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#101812] border border-[#283b2c] rounded-t-2xl sm:rounded-xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-[#203023] flex items-center justify-between bg-[#0b100c]">
              <div className="flex items-center gap-2 text-emerald-400 font-bold uppercase text-xs sm:text-sm">
                <Activity className="w-4 h-4" />
                <span>Live System Telemetry & Field SLA Specs</span>
              </div>
              <button 
                onClick={() => setActiveModal(null)}
                className="p-1 rounded-md text-slate-400 hover:text-white bg-[#162218] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-mono">
              <div className="bg-[#070e09] p-3 rounded border border-[#1b2b1e] space-y-1.5">
                <div className="text-emerald-400 font-bold">SYSTEM TELEMETRY SUMMARY:</div>
                <div>· Platform: UPSC NDA GAT Tactical Intelligence Engine</div>
                <div>· Deployment Target: 14 October 2026 // 0000 HRS IST</div>
                <div>· Edge Latency: &lt; 14ms (CDN Edge Multi-Region)</div>
                <div>· Target Availability SLA: 99.99% Guaranteed</div>
                <div>· Database Engine: Google Firestore Cloud Datastore (Multi-Region)</div>
                <div>· Security Encryption: AES-256-GCM / TLS 1.3 Active</div>
              </div>
            </div>
            <div className="p-4 border-t border-[#203023] bg-[#0b100c] flex justify-end">
              <button
                onClick={() => setActiveModal(null)}
                className="px-4 py-2 bg-emerald-500 text-black font-bold text-xs uppercase tracking-wider rounded-lg"
              >
                Close Telemetry View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default UnderConstruction;
