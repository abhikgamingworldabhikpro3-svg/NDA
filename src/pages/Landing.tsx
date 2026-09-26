import React from 'react';
import { Shield, BookOpen, HelpCircle, RefreshCw, BarChart2, MessageSquare, Award, Zap } from 'lucide-react';

interface LandingProps {
  onStart: () => void;
  onLogin: () => void;
}

export const Landing: React.FC<LandingProps> = ({ onStart, onLogin }) => {
  const features = [
    {
      title: "Daily Current Affairs",
      description: "Short, factual, and syllabus-aligned notes covering the most important events.",
      icon: BookOpen,
      color: "text-blue-500 bg-blue-50 dark:bg-blue-950/20"
    },
    {
      title: "Defence Awareness",
      description: "Dedicated coverage of military exercises, weapon platforms, DRDO, ISRO, and commands.",
      icon: Shield,
      color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20"
    },
    {
      title: "AI Grounding & Explanations",
      description: "Ask NDA AI to explain complex defense treaties, geographical hotspots, or terms simply.",
      icon: MessageSquare,
      color: "text-indigo-500 bg-indigo-50 dark:bg-indigo-950/20"
    },
    {
      title: "Syllabus-Aligned MCQs",
      description: "Generate mock questions on recent news with exactly one verified correct option and explanations.",
      icon: HelpCircle,
      color: "text-amber-500 bg-amber-50 dark:bg-amber-950/20"
    },
    {
      title: "Smart Spaced Revision",
      description: "System automatically schedules revision cards based on questions you got wrong.",
      icon: RefreshCw,
      color: "text-purple-500 bg-purple-50 dark:bg-purple-950/20"
    },
    {
      title: "Weak-Area Analysis",
      description: "Interactive dashboard identifies weak category points and recommends targeted revisions.",
      icon: BarChart2,
      color: "text-rose-500 bg-rose-50 dark:bg-rose-950/20"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md">
              CA
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight">NDA CURRENT AFFAIRS AI</h1>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">independent study guide</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={onLogin} 
              className="text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Log In
            </button>
            <button 
              onClick={onStart} 
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-md transition-all"
            >
              Start Preparing
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-6 py-16 lg:py-24 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-800 border border-slate-700/50 px-3.5 py-1 text-[11px] font-bold text-indigo-400 tracking-wide uppercase">
            <Zap className="h-3 w-3 fill-indigo-400 text-indigo-400 animate-pulse" />
            Designed for NDA 1 & 2 Aspirants
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight">
            Turn Daily News Into <br />
            <span className="text-indigo-500 bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-transparent">NDA-Ready Knowledge</span>
          </h2>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg mx-auto lg:mx-0">
            Ditch cluttered news apps. Prepare for the General Ability Test (GAT) with concise exam-focused summaries, DRDO & ISRO static GK connections, automated revision queues, and practice quizzes designed by AI.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
            <button 
              onClick={onStart}
              className="w-full sm:w-auto rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 text-xs font-bold text-white shadow-lg transition-all"
            >
              Start Preparing Now
            </button>
            <button 
              onClick={onLogin}
              className="w-full sm:w-auto rounded-lg border border-slate-700 hover:bg-slate-800 px-6 py-3.5 text-xs font-bold text-slate-300 hover:text-white transition"
            >
              Existing Student Login
            </button>
          </div>
        </div>

        {/* Hero Visual concept */}
        <div className="flex-1 relative w-full max-w-md mx-auto">
          <div className="absolute -inset-1 rounded-2xl bg-indigo-500/10 blur-xl"></div>
          <div className="relative rounded-2xl border border-slate-800 bg-slate-950 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase">Today's Mission Card</span>
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            </div>
            
            <div className="space-y-2">
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="h-3 bg-slate-800 rounded w-5/6"></div>
              <div className="h-3 bg-slate-800 rounded w-1/2"></div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800">
              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg text-center">
                <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mb-1">Streak</p>
                <p className="text-sm font-extrabold text-indigo-400">🔥 12 Days</p>
              </div>
              <div className="bg-slate-900 border border-slate-800/80 p-3 rounded-lg text-center">
                <p className="text-[10px] text-slate-500 font-bold tracking-wider uppercase mb-1">Accuracy</p>
                <p className="text-sm font-extrabold text-emerald-400">🎯 78%</p>
              </div>
            </div>
            
            <div className="rounded-lg bg-indigo-950/20 border border-indigo-900/40 p-3 text-center">
              <p className="text-[11px] font-semibold text-indigo-300">"Why it matters for NDA": India & US Malabar exercises focus on tactical submarine operations in Bay of Bengal.</p>
            </div>
          </div>
        </div>
      </main>

      {/* Feature section */}
      <section className="bg-slate-950 border-t border-slate-800 py-20">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h3 className="text-2xl lg:text-3xl font-black text-white">Full-Stack GAT Practice Toolkit</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every feature of our platform is custom-built with the UPSC NDA General Ability Test syllabus in mind.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat) => {
              const Icon = feat.icon;
              return (
                <div key={feat.title} className="bg-slate-900 border border-slate-800/60 p-6 rounded-xl hover:border-slate-700/60 transition-all flex gap-4">
                  <div className={`p-3 rounded-lg h-11 w-11 flex items-center justify-center shrink-0 ${feat.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-white">{feat.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{feat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">NDA Current Affairs AI</p>
            <p className="text-[10px] text-slate-500 mt-1">Independent educational application. Not affiliated with UPSC, NDA, or the Government of India.</p>
          </div>
          <p className="text-[10px] text-slate-500 font-medium">© 2026 NDA Current Affairs AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
export default Landing;
