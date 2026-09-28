import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Clock, 
  Send, 
  Brain, 
  Sparkles, 
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
  Terminal,
  Cpu,
  Compass,
  Layers,
  ChevronRight
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
  }>({ days: 16, hours: 5, minutes: 22, seconds: 40 });

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

  // Quick Preset Chips for the Query Box
  const presetQueries = [
    {
      title: "Armed Forces Commands",
      text: "Give me a quick review cheatsheet on Indian Armed Forces Commands, headquarters locations, and flagship missile systems (Agni, BrahMos, Astra)."
    },
    {
      title: "Strategic Straits & Chokepoints",
      text: "Explain the strategic importance of the Malacca Strait, Bab-el-Mandeb, and South China Sea for Indian maritime security."
    },
    {
      title: "5 Targeted Mock MCQs",
      text: "Generate 5 high-yield UPSC NDA practice questions on recent defense tech, space missions, and geography with detailed explanations."
    },
    {
      title: "Must-Read GAT Topics",
      text: "What are the most critical defense, geography, polity, and current affairs topics to master for NDA 1/2027 GAT?"
    },
    {
      title: "Topic Request for 14 Oct",
      text: "Request: Please add comprehensive monthly defense capsule PDFs and missile range comparison charts before the 14 Oct launch."
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
      setAiResponse(`### 🎯 UPSC NDA GAT Guidance & Intelligence\n\nYour query regarding **"${textToSend}"** has been received. Our syllabus matrix is currently being upgraded with dedicated high-yield notes, factual cheatsheets, and verified practice questions for the **October 14, 2026** platform deployment.`);
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
      utterance.rate = 1.0;
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
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black relative overflow-hidden font-sans">
      
      {/* ========================================================================= */}
      {/* NEON AMBIENT GLOWS & CYBER GRID MATRIX                                    */}
      {/* ========================================================================= */}
      <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.12] pointer-events-none" />
      
      {/* Glowing Neon Light Orbs */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-cyan-500/20 via-fuchsia-500/10 to-transparent rounded-full blur-3xl pointer-events-none animate-neon-pulse" />
      <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-2/3 -right-48 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Cyber Neon Top Bar (No preview button, pure cyber status) */}
      <header className="relative z-20 border-b border-cyan-500/30 bg-[#070d1e]/80 backdrop-blur-xl px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-[0_4px_25px_rgba(6,182,212,0.15)]">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-cyan-400 via-cyan-500 to-blue-600 flex items-center justify-center text-black font-black text-sm shadow-[0_0_15px_rgba(6,182,212,0.8)] border border-cyan-300">
            <Shield className="h-5 w-5 text-slate-950 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm sm:text-base text-white tracking-wide uppercase">
                NDA GAT <span className="text-cyan-400 text-glow-cyan">Cyber Matrix</span>
              </span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-cyan-950/80 border border-cyan-400/50 text-cyan-300">
                <Radio className="h-2.5 w-2.5 text-cyan-400 animate-pulse" /> LIVE
              </span>
            </div>
            <span className="text-[10px] text-fuchsia-400 font-bold tracking-widest uppercase block -mt-0.5">
              Strategic Intelligence Portal • Target: 14 Oct 2026
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/50 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold shadow-[0_0_10px_rgba(6,182,212,0.2)]">
            <Terminal className="h-3.5 w-3.5 text-cyan-400" />
            <span>SYS_STATUS: UNDER_CONSTRUCTION</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12">
        
        {/* ========================================================================= */}
        {/* 1. NEON UNDER CONSTRUCTION HERO & COUNTDOWN                               */}
        {/* ========================================================================= */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          
          {/* Neon Status Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full text-xs font-extrabold bg-[#091428] border border-cyan-400/50 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.35)]">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="tracking-widest uppercase font-mono text-[11px]">
              ⚡ UNDER SCHEDULED SYSTEM UPGRADE • LAUNCHING 14 OCT 2026
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
              Mission Upgrade In Progress <br />
              <span className="bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-emerald-400 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(6,182,212,0.6)]">
                Full Portal Deploys On 14 Oct
              </span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium max-w-2xl mx-auto">
              We are systematically engineering the comprehensive UPSC NDA General Ability Test (GAT) syllabus vaults, defense missile database, tri-service command matrices, and AI spaced repetition engine.
            </p>
          </div>

          {/* Neon Countdown Clock Matrix */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-xl mx-auto pt-3">
            {[
              { label: "DAYS", value: timeLeft.days, color: "text-cyan-400", border: "border-cyan-500/50", glow: "shadow-[0_0_20px_rgba(6,182,212,0.3)]", bg: "from-cyan-950/40" },
              { label: "HOURS", value: timeLeft.hours, color: "text-fuchsia-400", border: "border-fuchsia-500/50", glow: "shadow-[0_0_20px_rgba(217,70,239,0.3)]", bg: "from-fuchsia-950/40" },
              { label: "MINUTES", value: timeLeft.minutes, color: "text-emerald-400", border: "border-emerald-500/50", glow: "shadow-[0_0_20px_rgba(16,185,129,0.3)]", bg: "from-emerald-950/40" },
              { label: "SECONDS", value: timeLeft.seconds, color: "text-amber-400", border: "border-amber-500/50", glow: "shadow-[0_0_20px_rgba(245,158,11,0.3)]", bg: "from-amber-950/40" }
            ].map((unit) => (
              <div 
                key={unit.label}
                className={`bg-gradient-to-b ${unit.bg} to-[#070e22]/90 border ${unit.border} rounded-2xl p-3 sm:p-5 text-center ${unit.glow} backdrop-blur-md relative group hover:scale-105 transition duration-200`}
              >
                <div className="absolute top-1.5 right-2 w-1.5 h-1.5 rounded-full bg-cyan-400/80 animate-pulse" />
                <span className={`block text-2xl sm:text-4xl font-black ${unit.color} tracking-tight font-mono drop-shadow-[0_0_12px_currentColor]`}>
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="block text-[10px] sm:text-[11px] font-extrabold text-slate-300 tracking-widest uppercase mt-1">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 2. FULL-PAGE NEON QUERY BOX & LIVE COACHING WORKSPACE                     */}
        {/* ========================================================================= */}
        <section className="bg-gradient-to-b from-[#091428]/95 to-[#040817]/95 border-2 border-cyan-500/40 rounded-3xl p-5 sm:p-8 shadow-[0_0_35px_rgba(6,182,212,0.25)] backdrop-blur-xl space-y-6 relative overflow-hidden">
          
          {/* Cyber Neon Corner Accents */}
          <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-cyan-400 rounded-tl-3xl pointer-events-none" />
          <div className="absolute top-0 right-0 w-12 h-12 border-t-2 border-r-2 border-cyan-400 rounded-tr-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-12 h-12 border-b-2 border-l-2 border-cyan-400 rounded-bl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-cyan-400 rounded-br-3xl pointer-events-none" />

          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyan-500/20 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-400/50 text-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]">
                  <Brain className="h-5 w-5" />
                </div>
                <h2 className="text-base sm:text-xl font-black text-white tracking-wide">
                  Aspirant Query & Syllabus Intelligence Desk
                </h2>
              </div>
              <p className="text-xs text-slate-300 mt-1 font-medium">
                Ask instant NDA GAT questions to the AI Coach or submit official topic requests to be published for the 14 Oct deployment.
              </p>
            </div>

            {/* Neon Mode Switcher Tabs */}
            <div className="flex items-center bg-[#020617] p-1.5 rounded-2xl border border-cyan-500/40 shrink-0 shadow-inner">
              <button
                onClick={() => setActiveTab('ai-coach')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'ai-coach'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-black shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                    : 'text-slate-300 hover:text-cyan-300'
                }`}
              >
                <Zap className="h-4 w-4 fill-current" />
                <span>Instant AI Coach</span>
              </button>
              <button
                onClick={() => setActiveTab('submit-query')}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === 'submit-query'
                    ? 'bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white shadow-[0_0_15px_rgba(217,70,239,0.8)]'
                    : 'text-slate-300 hover:text-fuchsia-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Submit Query Form</span>
              </button>
            </div>
          </div>

          {/* TAB 1: INSTANT AI COACH QUERY BOX */}
          {activeTab === 'ai-coach' && (
            <div className="space-y-6">
              
              {/* Quick Topic Chips */}
              <div className="space-y-2.5">
                <span className="text-[11px] font-black uppercase tracking-widest text-cyan-400 flex items-center gap-1.5">
                  <Flame className="h-3.5 w-3.5 text-amber-400 animate-bounce" /> Suggested High-Yield Query Topics:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {presetQueries.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiQuery(preset.text);
                        handleAskAICoach(preset.text);
                      }}
                      className="text-[11px] font-bold px-3.5 py-2 rounded-xl border border-cyan-500/30 bg-[#020617]/80 hover:bg-cyan-950/40 hover:border-cyan-400 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)] text-slate-200 hover:text-cyan-300 transition-all cursor-pointer text-left flex items-center gap-1.5"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Neon Input Form Bar */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAskAICoach(); }}
                className="flex gap-2.5 items-center bg-[#020617] border-2 border-cyan-500/50 p-2 sm:p-2.5 rounded-2xl shadow-[0_0_20px_rgba(6,182,212,0.25)] focus-within:border-cyan-400 focus-within:shadow-[0_0_25px_rgba(6,182,212,0.5)] transition duration-200"
              >
                <div className="pl-3 text-cyan-400">
                  <Terminal className="h-5 w-5" />
                </div>
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask any GAT question: e.g. What are the key missile classifications, speeds, and DRDO ranges?"
                  className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none font-medium"
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiQuery.trim()}
                  className="inline-flex items-center gap-2 px-5 sm:px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 text-black text-xs font-black shadow-[0_0_15px_rgba(6,182,212,0.7)] hover:shadow-[0_0_25px_rgba(6,182,212,0.9)] transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0 uppercase tracking-wider"
                >
                  {aiLoading ? (
                    <>
                      <Sparkles className="h-4 w-4 animate-spin text-slate-950" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 text-slate-950" />
                      <span>Ask AI Coach</span>
                    </>
                  )}
                </button>
              </form>

              {/* AI Query Result Display */}
              {aiResponse && (
                <div className="bg-[#020617]/95 border-2 border-cyan-500/60 rounded-2xl p-5 sm:p-6 space-y-4 animate-in fade-in duration-300 shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                  <div className="flex items-center justify-between border-b border-cyan-500/30 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
                      <span className="text-xs font-black text-cyan-400 uppercase tracking-widest font-mono">
                        UPSC NDA GAT Intelligence Response
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSpeech(aiResponse)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold transition cursor-pointer shadow-[0_0_10px_rgba(6,182,212,0.2)]"
                        title="Listen Aloud"
                      >
                        {speaking ? <VolumeX className="h-4 w-4 text-fuchsia-400" /> : <Volume2 className="h-4 w-4" />}
                        <span>{speaking ? 'Stop' : 'Listen'}</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiResponse);
                          setCopiedResponse(true);
                          setTimeout(() => setCopiedResponse(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold transition cursor-pointer"
                      >
                        {copiedResponse ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                        <span>{copiedResponse ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="text-xs sm:text-sm text-slate-200 font-sans leading-relaxed whitespace-pre-wrap space-y-2 selection:bg-cyan-500 selection:text-black">
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
                <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-6 text-center space-y-3 animate-in fade-in shadow-[0_0_25px_rgba(16,185,129,0.3)]">
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(16,185,129,0.6)]">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base sm:text-lg font-black text-white">Query Successfully Transmitted!</h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Tracking ID: <strong className="text-emerald-400 font-mono text-sm">{submittedQuery.id}</strong>. Our editorial team will review your topic request and integrate it for the **October 14, 2026** platform deployment.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmittedQuery(null)}
                    className="mt-2 inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition cursor-pointer"
                  >
                    Submit Another Query
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitQueryForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-fuchsia-400 mb-1.5">
                        Your Name *
                      </label>
                      <div className="relative">
                        <User className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Cadet Rahul Sharma"
                          className="w-full bg-[#020617] border border-cyan-500/40 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition shadow-inner"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-fuchsia-400 mb-1.5">
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="e.g. rahul.nda@gmail.com"
                          className="w-full bg-[#020617] border border-cyan-500/40 focus:border-cyan-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition shadow-inner"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-400 mb-1.5">
                        Query Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full bg-[#020617] border border-cyan-500/40 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition cursor-pointer"
                      >
                        <option value="Syllabus Topic Request">Syllabus Topic Request (Add before 14 Oct)</option>
                        <option value="Exam Guidance">UPSC NDA 1/2027 GAT Guidance</option>
                        <option value="Defense News Inquiry">Defense Technology / Weaponry Inquiry</option>
                        <option value="Feature Suggestion">App Feature Suggestion</option>
                        <option value="Other">Other Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-400 mb-1.5">
                        Urgency Level
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                        className="w-full bg-[#020617] border border-cyan-500/40 focus:border-cyan-400 rounded-xl px-4 py-2.5 text-xs text-white outline-none transition cursor-pointer"
                      >
                        <option value="Normal">Normal Inquiry</option>
                        <option value="High">High Priority (Preparing for NDA 2026/2027)</option>
                        <option value="Immediate">Immediate Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-wider text-cyan-400 mb-1.5">
                      Detailed Query or Topic Request *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.query}
                      onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                      placeholder="Describe the topics, questions, or specific features you would like to see covered upon our full launch on 14 October..."
                      className="w-full bg-[#020617] border border-cyan-500/40 focus:border-cyan-400 rounded-xl p-3.5 text-xs text-white placeholder-slate-600 outline-none transition leading-relaxed shadow-inner"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-fuchsia-500 via-purple-600 to-indigo-600 hover:from-fuchsia-400 hover:to-indigo-500 text-white text-xs font-black tracking-widest uppercase shadow-[0_0_20px_rgba(217,70,239,0.5)] transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
                        <span>Transmitting Query to Editorial Desk...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>Submit Official Query</span>
                      </>
                    )}
                  </button>
                </form>
              )}

            </div>
          )}

        </section>

        {/* ========================================================================= */}
        {/* 3. NEON OCTOBER 14 ROADMAP & FEATURE HIGHLIGHTS                           */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center space-y-1.5">
            <h3 className="text-lg sm:text-2xl font-black text-white tracking-wide">
              What Deploys on <span className="text-cyan-400 text-glow-cyan">14 October 2026?</span>
            </h3>
            <p className="text-xs text-slate-300 max-w-lg mx-auto">
              Our engineering and defense intelligence team is finalizing these four high-impact modules for UPSC NDA aspirants:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1: Defense Capsules */}
            <div className="bg-gradient-to-b from-cyan-950/30 to-[#040817] border-2 border-cyan-500/40 p-5 rounded-2xl space-y-3 hover:border-cyan-400 hover:shadow-[0_0_25px_rgba(6,182,212,0.35)] transition group">
              <div className="h-10 w-10 rounded-xl bg-cyan-950 border border-cyan-400 text-cyan-400 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.5)]">
                <Shield className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-black text-white group-hover:text-cyan-300 transition">1,000+ Defense Capsules</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Daily tri-service defense news, bilateral military drills, DRDO missile specifications, and static GK links.
              </p>
            </div>

            {/* 2: Spaced Repetition */}
            <div className="bg-gradient-to-b from-emerald-950/30 to-[#040817] border-2 border-emerald-500/40 p-5 rounded-2xl space-y-3 hover:border-emerald-400 hover:shadow-[0_0_25px_rgba(16,185,129,0.35)] transition group">
              <div className="h-10 w-10 rounded-xl bg-emerald-950 border border-emerald-400 text-emerald-400 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.5)]">
                <Zap className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-black text-white group-hover:text-emerald-300 transition">Spaced Repetition Engine</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                SM-2 algorithm flashcard schedules to guarantee 0% memory decay for historical treaties and geographic passes.
              </p>
            </div>

            {/* 3: 150-Q Full Mocks */}
            <div className="bg-gradient-to-b from-amber-950/30 to-[#040817] border-2 border-amber-500/40 p-5 rounded-2xl space-y-3 hover:border-amber-400 hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition group">
              <div className="h-10 w-10 rounded-xl bg-amber-950 border border-amber-400 text-amber-400 flex items-center justify-center shadow-[0_0_12px_rgba(245,158,11,0.5)]">
                <Award className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-black text-white group-hover:text-amber-300 transition">150-Q GAT Full Mocks</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Real UPSC NDA examination simulation with negative marking (-0.83), timers, and granular percentile analytics.
              </p>
            </div>

            {/* 4: Audio Briefs */}
            <div className="bg-gradient-to-b from-fuchsia-950/30 to-[#040817] border-2 border-fuchsia-500/40 p-5 rounded-2xl space-y-3 hover:border-fuchsia-400 hover:shadow-[0_0_25px_rgba(217,70,239,0.35)] transition group">
              <div className="h-10 w-10 rounded-xl bg-fuchsia-950 border border-fuchsia-400 text-fuchsia-400 flex items-center justify-center shadow-[0_0_12px_rgba(217,70,239,0.5)]">
                <Volume2 className="h-5 w-5" />
              </div>
              <h4 className="text-sm font-black text-white group-hover:text-fuchsia-300 transition">Audio Intelligence Briefs</h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                Hands-free 3-minute morning intelligence broadcasts to review news during physical training or commute.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* Cyber Neon Footer */}
      <footer className="relative z-10 border-t border-cyan-500/30 bg-[#020617] py-6 text-center text-xs text-slate-400 space-y-1">
        <p className="font-mono text-cyan-300/80">
          © 2026 UPSC NDA General Ability Test (GAT) Intelligence Engine • Target Launch: October 14, 2026
        </p>
        <p className="text-[10px] text-slate-500 font-mono">
          SECURE_LINK: ACTIVE • AI_COACH: ONLINE • CIPHER: 256-BIT
        </p>
      </footer>

    </div>
  );
};

export default UnderConstruction;
