import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizService, questionService, revisionService } from '../services/dbServices';
import { Question, QuizAttempt } from '../types';
import { 
  HelpCircle, 
  Clock, 
  Sliders, 
  History, 
  Zap, 
  Award, 
  ChevronRight, 
  BookOpen, 
  AlertCircle,
  Play
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';

interface QuizProps {
  setPath: (path: string) => void;
  lang: LanguageCode;
  onLaunchQuiz: (config: QuizConfig) => void;
}

export interface QuizConfig {
  mode: 'daily' | 'weekly' | 'monthly' | 'category' | 'weak-areas' | 'custom' | 'rapid-fire';
  category?: string;
  count: number;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  timerSeconds: number; // 0 for off
}

export const Quiz: React.FC<QuizProps> = ({ setPath, lang, onLaunchQuiz }) => {
  const { userProfile } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const [questions, setQuestions] = useState<Question[]>([]);
  const [history, setHistory] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  // Custom Quiz States
  const [customCount, setCustomCount] = useState<number>(10);
  const [customCategory, setCustomCategory] = useState<string>('All');
  const [customDifficulty, setCustomDifficulty] = useState<'easy' | 'medium' | 'hard' | 'mixed'>('mixed');
  const [customTimer, setCustomTimer] = useState<number>(600); // 10 minutes default

  const categories = [
    "All", "Defence", "National", "International", "Science & Technology", "Space",
    "Economy", "Government Schemes", "Environment", "Awards", "Sports",
    "Appointments", "Important Days", "Reports & Indexes", "International Organisations",
    "Places in News"
  ];

  useEffect(() => {
    const fetchQuizHubData = async () => {
      if (!userProfile) return;
      try {
        const [allQs, userHistory] = await Promise.all([
          questionService.getAllQuestions(),
          quizService.getUserQuizAttempts(userProfile.uid)
        ]);
        setQuestions(allQs || []);
        setHistory(userHistory || []);
      } catch (err) {
        console.error("Failed to load Quiz Hub:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizHubData();
  }, [userProfile]);

  const triggerQuizLaunch = (mode: QuizConfig['mode'], categoryValue?: string) => {
    let finalCount = 10;
    if (mode === 'weekly') finalCount = 50;
    if (mode === 'monthly') finalCount = 100;
    if (mode === 'custom') finalCount = customCount;

    onLaunchQuiz({
      mode,
      category: categoryValue || (mode === 'custom' && customCategory !== 'All' ? customCategory : undefined),
      count: finalCount,
      difficulty: mode === 'custom' ? customDifficulty : 'mixed',
      timerSeconds: mode === 'custom' ? customTimer : 0
    });
  };

  const handleOpenAttempt = (attempt: QuizAttempt) => {
    // Allows student to view previous results
    alert(`Attempt detail view is available on completion scorecards! Score: ${attempt.score}/${attempt.totalQuestions}`);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-6 animate-pulse bg-slate-50 dark:bg-slate-950">
        <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-40 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-40 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
          {t('quiz')}
        </h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
          Evaluate Your GAT General Knowledge Preparedness
        </p>
      </div>

      {/* Main Core Quiz modes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* DAILY 10 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-2">
            <div className="h-9 w-9 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Daily 10 Challenge</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              10 fast-paced GK and Current Affairs questions refreshed daily. Earn streaks and satisfy daily study targets.
            </p>
          </div>
          <button 
            onClick={() => triggerQuizLaunch('daily')}
            className="mt-4 flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white rounded-lg py-2.5 px-4 shadow-sm transition-all justify-center"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Launch Daily 10
          </button>
        </div>

        {/* WEAK AREA ENGINE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-2">
            <div className="h-9 w-9 rounded-lg bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Weak-Area Retests</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Targeted practice questions generated automatically from categories where your score is historically lower.
            </p>
          </div>
          <button 
            onClick={() => triggerQuizLaunch('weak-areas')}
            className="mt-4 flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-xs font-bold text-white rounded-lg py-2.5 px-4 shadow-sm transition-all justify-center"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Retest Errors
          </button>
        </div>

        {/* RAPID FIRE */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:shadow-md transition">
          <div className="space-y-2">
            <div className="h-9 w-9 rounded-lg bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">{t('rapidFire')} Mode</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Instant feedback. Answer questions one-by-one with explanations revealed immediately.
            </p>
          </div>
          <button 
            onClick={() => triggerQuizLaunch('rapid-fire')}
            className="mt-4 flex items-center gap-1 bg-amber-600 hover:bg-amber-700 text-xs font-bold text-white rounded-lg py-2.5 px-4 shadow-sm transition-all justify-center"
          >
            <Play className="h-3.5 w-3.5 fill-current" /> Start Rapid Fire
          </button>
        </div>
      </div>

      {/* CUSTOM QUIZ CONFIGURATION BOX */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Sliders className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-tight">Configure Custom Mock Exam</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* Q COUNT */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Questions size</label>
            <select 
              value={customCount} 
              onChange={(e) => setCustomCount(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-350 outline-none focus:border-indigo-600 transition"
            >
              <option value="10">10 Questions</option>
              <option value="20">20 Questions</option>
              <option value="30">30 Questions</option>
              <option value="50">50 Questions</option>
            </select>
          </div>

          {/* SYLLABUS CATEGORY */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Syllabus category</label>
            <select 
              value={customCategory} 
              onChange={(e) => setCustomCategory(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-350 outline-none focus:border-indigo-600 transition"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Syllabus' : c}</option>
              ))}
            </select>
          </div>

          {/* DIFFICULTY */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Difficulty level</label>
            <select 
              value={customDifficulty} 
              onChange={(e) => setCustomDifficulty(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-350 outline-none focus:border-indigo-600 transition"
            >
              <option value="mixed">Mixed (Recommended)</option>
              <option value="easy">Easy Level</option>
              <option value="medium">Medium Level</option>
              <option value="hard">Hard Level</option>
            </select>
          </div>

          {/* TIMER */}
          <div className="space-y-1">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Duration timer</label>
            <select 
              value={customTimer} 
              onChange={(e) => setCustomTimer(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-350 outline-none focus:border-indigo-600 transition"
            >
              <option value="0">Off (No Timer)</option>
              <option value="300">5 minutes</option>
              <option value="600">10 minutes</option>
              <option value="1200">20 minutes</option>
              <option value="1800">30 minutes</option>
            </select>
          </div>
        </div>

        <button 
          onClick={() => triggerQuizLaunch('custom')}
          className="w-full mt-2 bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-extrabold text-white rounded-xl shadow-lg transition-all flex items-center justify-center gap-1.5"
        >
          <Play className="h-4 w-4 fill-current" /> Start Custom Practice Test
        </button>
      </section>

      {/* QUIZ ATTEMPTS HISTORY */}
      <section className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <History className="h-4 w-4 text-slate-500" />
          Quiz Attempt History
        </h3>

        {history.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">
            <p className="text-xs text-slate-500 font-semibold">You have not completed any quizzes yet. Start your first mission!</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
            {history.slice(0, 5).map((att) => {
              const accuracy = Math.round((att.correctCount / att.totalQuestions) * 100);
              return (
                <div 
                  key={att.id}
                  onClick={() => handleOpenAttempt(att)}
                  className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850/30 transition cursor-pointer"
                >
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 capitalize">
                      {att.quizType} Quiz
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold">
                      {new Date(att.attemptedAt).toLocaleDateString()} at {new Date(att.attemptedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">
                        {att.correctCount} / {att.totalQuestions}
                      </p>
                      <p className={`text-[10px] font-bold ${
                        accuracy >= 75 ? 'text-emerald-500' : accuracy >= 50 ? 'text-amber-500' : 'text-rose-500'
                      }`}>
                        {accuracy}% accuracy
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
export default Quiz;
