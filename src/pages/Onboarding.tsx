import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Globe, Award, Target, ArrowRight } from 'lucide-react';
import { AttemptType, AppLanguage } from '../types';

interface OnboardingProps {
  onComplete: () => void;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const { updateProfileSettings } = useAuth();
  
  const [targetAttempt, setTargetAttempt] = useState<AttemptType>('Both');
  const [language, setLanguage] = useState<AppLanguage>('en');
  const [dailyTarget, setDailyTarget] = useState<number>(10);
  const [loading, setLoading] = useState(false);

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await updateProfileSettings({
        targetAttempt,
        preferredLanguage: language,
        dailyTarget,
        onboardingCompleted: true
      });
      onComplete();
    } catch (err) {
      console.error("Onboarding failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-extrabold text-white text-lg">
            🎯
          </div>
          <h2 className="text-2xl font-black text-white">Let's Customize Your Preparation</h2>
          <p className="text-xs text-slate-400">
            Tell us about your UPSC NDA roadmap so we can customize your dashboard targets, daily missions, and revision alerts.
          </p>
        </div>

        <form onSubmit={handleOnboardSubmit} className="space-y-6">
          {/* Target Attempt */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Shield className="h-4 w-4 text-indigo-400" /> Which UPSC NDA/NA exam are you targeting?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {(['NDA 1', 'NDA 2', 'Both'] as AttemptType[]).map((attempt) => (
                <button
                  type="button"
                  key={attempt}
                  onClick={() => setTargetAttempt(attempt)}
                  className={`py-3.5 rounded-lg text-xs font-bold border transition ${
                    targetAttempt === attempt 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {attempt}
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Language */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Globe className="h-4 w-4 text-indigo-400" /> What is your preferred study language?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिंदी (Hindi)' },
                { code: 'bn', label: 'বাংলা (Bengali)' }
              ].map((lang) => (
                <button
                  type="button"
                  key={lang.code}
                  onClick={() => setLanguage(lang.code as AppLanguage)}
                  className={`py-3.5 rounded-lg text-xs font-bold border transition ${
                    language === lang.code 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 font-semibold leading-relaxed">
              * Note: The user interface, headlines, and GK questions will automatically adapt to your chosen preference where translations exist.
            </p>
          </div>

          {/* Daily Target */}
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="text-xs font-bold text-slate-200 flex items-center gap-2">
              <Target className="h-4 w-4 text-indigo-400" /> What is your daily GAT question practice target?
            </label>
            <div className="grid grid-cols-4 gap-2.5">
              {[10, 20, 30, 50].map((num) => (
                <button
                  type="button"
                  key={num}
                  onClick={() => setDailyTarget(num)}
                  className={`py-3.5 rounded-lg text-xs font-bold border transition ${
                    dailyTarget === num 
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400' 
                      : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {num} Qs
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 py-4 text-xs font-extrabold text-white shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Completing Onboarding...' : 'Lock Preferences & Continue'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
export default Onboarding;
