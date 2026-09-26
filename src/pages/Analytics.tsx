import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { quizService, revisionService } from '../services/dbServices';
import { QuizAttempt, RevisionItem } from '../types';
import { 
  BarChart2, 
  HelpCircle, 
  Zap, 
  Award, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  PieChart, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';

interface AnalyticsProps {
  setPath: (path: string) => void;
  lang: LanguageCode;
}

export const Analytics: React.FC<AnalyticsProps> = ({ setPath, lang }) => {
  const { userProfile } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const [userAttempts, userRevs] = await Promise.all([
          quizService.getUserQuizAttempts(userProfile.uid),
          revisionService.getUserRevisions(userProfile.uid)
        ]);
        setAttempts(userAttempts || []);
        setRevisions(userRevs || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalyticsData();
  }, [userProfile]);

  // Aggregate stats
  const totalQuizzes = attempts.length;
  
  const getTotals = () => {
    let attempted = 0;
    let correct = 0;
    let wrong = 0;
    attempts.forEach(att => {
      attempted += att.totalQuestions;
      correct += att.correctCount;
      wrong += att.wrongCount;
    });
    return { attempted, correct, wrong };
  };

  const totals = getTotals();
  const overallAccuracy = totals.attempted > 0 ? Math.round((totals.correct / totals.attempted) * 100) : 0;
  
  const revisionMastered = revisions.filter(r => r.status === 'mastered').length;

  // Group performance by categories
  const getCategoryAnalytics = () => {
    const categoriesMap: Record<string, { correct: number; total: number }> = {};
    attempts.forEach(att => {
      const cat = att.category || 'General';
      if (!categoriesMap[cat]) {
        categoriesMap[cat] = { correct: 0, total: 0 };
      }
      categoriesMap[cat].correct += att.correctCount;
      categoriesMap[cat].total += att.totalQuestions;
    });

    return Object.entries(categoriesMap).map(([cat, stats]) => {
      const acc = Math.round((stats.correct / stats.total) * 100);
      return { category: cat, accuracy: acc, total: stats.total };
    }).sort((a, b) => b.accuracy - a.accuracy);
  };

  const categoryBreakdown = getCategoryAnalytics();

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-6 bg-slate-50 dark:bg-slate-950 animate-pulse">
        <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-28 bg-slate-300 dark:bg-slate-800 rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
          {t('analytics')}
        </h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
          Real-time diagnostics of GAT Syllabus Strengths and Weaknesses
        </p>
      </div>

      {totalQuizzes === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center space-y-3 max-w-xl mx-auto">
          <BarChart2 className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-500">{t('noData')}</p>
          <button 
            onClick={() => setPath('/quiz')}
            className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white px-4 py-2 transition shadow-md"
          >
            Launch First Practice Quiz
          </button>
        </div>
      ) : (
        <>
          {/* Core high level counters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* TOTAL QUESTIONS */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 dark:bg-blue-950/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                <HelpCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Total Attempted</p>
                <p className="text-base font-extrabold">{totals.attempted} Qs</p>
              </div>
            </div>

            {/* TOTAL QUIZZES */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-purple-100 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Tests Completed</p>
                <p className="text-base font-extrabold">{totalQuizzes} Tests</p>
              </div>
            </div>

            {/* AVERAGE ACCURACY */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Average Accuracy</p>
                <p className="text-base font-extrabold text-emerald-500">{overallAccuracy}%</p>
              </div>
            </div>

            {/* REVISIONS MASTERED */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-5 rounded-2xl shadow-xs flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <RefreshCw className="h-5 w-5" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase">Mastered Cards</p>
                <p className="text-base font-extrabold text-indigo-500">{revisionMastered} cards</p>
              </div>
            </div>

          </div>

          {/* GAT Syllabus Category Performance Bars */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <PieChart className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">Syllabus category accuracy</h3>
              </div>

              <div className="space-y-4.5">
                {categoryBreakdown.map((item) => (
                  <div key={item.category} className="space-y-1.5">
                    <div className="flex justify-between items-baseline text-xs font-bold">
                      <span className="text-slate-700 dark:text-slate-200">{item.category}</span>
                      <span className={`${
                        item.accuracy >= 75 ? 'text-emerald-500' : item.accuracy >= 50 ? 'text-amber-500' : 'text-rose-500'
                      }`}>{item.accuracy}%</span>
                    </div>

                    <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.accuracy >= 75 ? 'bg-emerald-500' : item.accuracy >= 50 ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${item.accuracy}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* STUDY DIARY HISTORIES */}
            <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <Clock className="h-5 w-5 text-indigo-500" />
                <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight font-sans">Recent Test Log</h3>
              </div>

              <div className="space-y-3">
                {attempts.slice(0, 4).map((att, idx) => (
                  <div key={idx} className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 p-4 rounded-xl flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-200 capitalize">
                        {att.quizType} Practice ({att.category || 'General'})
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold uppercase">
                        {new Date(att.attemptedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold ${
                        att.score >= 75 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-rose-50 text-rose-600 dark:bg-rose-950/20'
                      }`}>
                        {att.score}% Accuracy
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
};
export default Analytics;
