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
  HelpCircle
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-700 selection:text-white antialiased">
      
      {/* Subtle Institutional Header Accent */}
      <div className="h-1 bg-gradient-to-r from-amber-600 via-indigo-600 to-slate-800 w-full" />

      {/* Top Institutional Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md px-6 sm:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-sm">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm sm:text-base text-white tracking-tight">
                National Defence Academy & Naval Academy
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-300">General Ability Test (GAT)</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span>Strategic Intelligence & Examination Portal</span>
            </div>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
          <span className="font-medium text-slate-300">System Upgrade in Progress</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span className="text-amber-400 font-semibold">Deployment: 14 Oct 2026</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        
        {/* ========================================================================= */}
        {/* 1. EXECUTIVE HERO & COUNTDOWN CHRONOMETER                                 */}
        {/* ========================================================================= */}
        <section className="text-center space-y-6 max-w-3xl mx-auto">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-amber-400 tracking-wider uppercase bg-amber-950/40 border border-amber-800/60 px-3.5 py-1 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              <span>Official Release Target: 14 October 2026</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Platform Architecture Upgrade
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto font-normal">
              We are finalizing the comprehensive 2026–2027 UPSC NDA syllabus question vault, defense technology matrices, tri-service operational command datasets, and the adaptive revision engine.
            </p>
          </div>

          {/* Precision Chronometer Countdown */}
          <div className="grid grid-cols-4 gap-3 sm:gap-4 max-w-lg mx-auto pt-2">
            {[
              { label: "Days", value: timeLeft.days },
              { label: "Hours", value: timeLeft.hours },
              { label: "Minutes", value: timeLeft.minutes },
              { label: "Seconds", value: timeLeft.seconds }
            ].map((unit) => (
              <div 
                key={unit.label}
                className="bg-slate-900 border border-slate-800 rounded-xl p-3 sm:p-4 text-center shadow-md relative group hover:border-slate-700 transition"
              >
                <span className="block text-2xl sm:text-4xl font-extrabold text-white font-tabular tracking-tight">
                  {String(unit.value).padStart(2, '0')}
                </span>
                <span className="block text-[10px] sm:text-xs font-semibold text-slate-400 tracking-wider uppercase mt-1">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>

        </section>

        {/* ========================================================================= */}
        {/* 2. FULL-PAGE ASPIRANT QUERY & INTELLIGENCE DESK                           */}
        {/* ========================================================================= */}
        <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
            <div>
              <div className="flex items-center gap-2.5">
                <Brain className="h-5 w-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Aspirant Query & Syllabus Intelligence Desk
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Consult the GAT Coach on defense topics or submit official syllabus requests for the 14 October release.
              </p>
            </div>

            {/* Segmented Mode Controls */}
            <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
              <button
                onClick={() => setActiveTab('ai-coach')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'ai-coach'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Zap className="h-3.5 w-3.5 text-amber-400" />
                <span>Instant GAT Coach</span>
              </button>
              <button
                onClick={() => setActiveTab('submit-query')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                  activeTab === 'submit-query'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Submit Query Form</span>
              </button>
            </div>
          </div>

          {/* TAB 1: INSTANT GAT COACH DESK */}
          {activeTab === 'ai-coach' && (
            <div className="space-y-6">
              
              {/* Curated Syllabus Topics */}
              <div className="space-y-2">
                <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
                  <BookOpen className="h-3.5 w-3.5 text-slate-400" /> Curated Syllabus Inquiries:
                </span>
                <div className="flex items-center gap-2 flex-wrap">
                  {presetQueries.map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setAiQuery(preset.text);
                        handleAskAICoach(preset.text);
                      }}
                      className="text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950/60 hover:bg-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer text-left"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search & Query Input Bar */}
              <form 
                onSubmit={(e) => { e.preventDefault(); handleAskAICoach(); }}
                className="flex gap-2 items-center bg-slate-950 border border-slate-800 p-2 rounded-xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition"
              >
                <input
                  type="text"
                  value={aiQuery}
                  onChange={(e) => setAiQuery(e.target.value)}
                  placeholder="Ask any GAT question: e.g. What are the key differences between ballistic and cruise missiles in India's arsenal?"
                  className="flex-1 bg-transparent px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none font-medium"
                  disabled={aiLoading}
                />
                <button
                  type="submit"
                  disabled={aiLoading || !aiQuery.trim()}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                >
                  {aiLoading ? (
                    <>
                      <Sparkles className="h-3.5 w-3.5 animate-spin text-amber-300" />
                      <span>Consulting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5" />
                      <span>Submit Query</span>
                    </>
                  )}
                </button>
              </form>

              {/* Structured AI Intelligence Brief */}
              {aiResponse && (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 sm:p-6 space-y-4 shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      <span>UPSC NDA GAT Academic Assessment</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSpeech(aiResponse)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
                        title="Read Aloud"
                      >
                        {speaking ? <VolumeX className="h-3.5 w-3.5 text-indigo-400" /> : <Volume2 className="h-3.5 w-3.5" />}
                        <span>{speaking ? 'Stop' : 'Listen'}</span>
                      </button>

                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(aiResponse);
                          setCopiedResponse(true);
                          setTimeout(() => setCopiedResponse(false), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-medium transition cursor-pointer"
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
                <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-6 text-center space-y-3 animate-in fade-in">
                  <div className="h-10 w-10 rounded-full bg-emerald-900/50 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-white">Query Successfully Logged</h3>
                    <p className="text-xs text-slate-300 max-w-md mx-auto">
                      Tracking Reference: <strong className="text-emerald-400 font-mono">{submittedQuery.id}</strong>. Our academic team will evaluate your topic request for the 14 October release.
                    </p>
                  </div>
                  <button
                    onClick={() => setSubmittedQuery(null)}
                    className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-semibold transition cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitQueryForm} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Cadet / Aspirant Name *
                      </label>
                      <div className="relative">
                        <User className="h-4 w-4 text-slate-500 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
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
                          className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Inquiry Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition cursor-pointer"
                      >
                        <option value="Syllabus Topic Request">Syllabus Topic Request (Priority for 14 Oct)</option>
                        <option value="Exam Guidance">UPSC NDA GAT Strategy & Planning</option>
                        <option value="Defense News Inquiry">Defense Technology / Weaponry Data</option>
                        <option value="Feature Suggestion">Feature Suggestion</option>
                        <option value="Other">General Academic Inquiry</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Urgency Level
                      </label>
                      <select
                        value={formData.urgency}
                        onChange={(e) => setFormData({ ...formData, urgency: e.target.value as any })}
                        className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg px-3.5 py-2.5 text-xs text-white outline-none transition cursor-pointer"
                      >
                        <option value="Normal">Normal Inquiry</option>
                        <option value="High">High Priority (Exam Candidate)</option>
                        <option value="Immediate">Urgent Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Detailed Query or Syllabus Topic Request *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.query}
                      onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                      placeholder="Specify the exact defense topics, historical events, or syllabus areas you would like integrated prior to launch..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-lg p-3.5 text-xs text-white placeholder-slate-500 outline-none transition leading-relaxed"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold tracking-wide uppercase transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Sparkles className="h-4 w-4 animate-spin text-amber-300" />
                        <span>Logging Inquiry...</span>
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
        {/* 3. OCTOBER 14 ROADMAP MATRIX                                              */}
        {/* ========================================================================= */}
        <section className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
              Deployment Matrix • Scheduled for 14 October 2026
            </h3>
            <p className="text-xs text-slate-400 max-w-lg mx-auto">
              Key modules undergoing final verification and syllabus calibration:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* 1: Defense Capsules */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2.5 hover:border-slate-700 transition">
              <div className="h-9 w-9 rounded-lg bg-indigo-950/80 border border-indigo-800/50 text-indigo-400 flex items-center justify-center">
                <Shield className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">1,000+ Defense Capsules</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Tri-service operations, bilateral exercises, DRDO weapon specifications, and static GK links.
              </p>
            </div>

            {/* 2: Spaced Repetition */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2.5 hover:border-slate-700 transition">
              <div className="h-9 w-9 rounded-lg bg-emerald-950/80 border border-emerald-800/50 text-emerald-400 flex items-center justify-center">
                <Zap className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">Spaced Repetition Matrix</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                SM-2 algorithm flashcard schedules to prevent memory decay on historical treaties, articles, and geographical passes.
              </p>
            </div>

            {/* 3: 150-Q Full Mocks */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2.5 hover:border-slate-700 transition">
              <div className="h-9 w-9 rounded-lg bg-amber-950/80 border border-amber-800/50 text-amber-400 flex items-center justify-center">
                <Award className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">150-Q GAT Full Mocks</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-length UPSC NDA exam simulation with negative marking (-0.83), timers, and percentile analytics.
              </p>
            </div>

            {/* 4: Audio Briefs */}
            <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-2.5 hover:border-slate-700 transition">
              <div className="h-9 w-9 rounded-lg bg-purple-950/80 border border-purple-800/50 text-purple-400 flex items-center justify-center">
                <Volume2 className="h-4 w-4" />
              </div>
              <h4 className="text-sm font-semibold text-white">Audio Intelligence Briefs</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Concise 3-minute morning audio digests for seamless revision during physical training or transit.
              </p>
            </div>

          </div>
        </section>

      </main>

      {/* Institutional Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-4xl mx-auto px-4 space-y-1">
          <p>© 2026 UPSC NDA General Ability Test (GAT) Academic Intelligence Engine</p>
          <p className="text-[11px] text-slate-600">
            Aligned with Union Public Service Commission (UPSC) Syllabus & Defence Services Examination Standards • Target Launch: 14 October 2026
          </p>
        </div>
      </footer>

    </div>
  );
};

export default UnderConstruction;
