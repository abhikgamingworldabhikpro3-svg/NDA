import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  articleService, 
  quizService, 
  revisionService, 
  questionService 
} from '../services/dbServices';
import { CurrentAffair, Question, QuizAttempt, RevisionItem } from '../types';
import { 
  Zap, 
  Target, 
  RefreshCw, 
  ShieldAlert, 
  BookOpen, 
  HelpCircle, 
  ChevronRight, 
  Compass,
  AlertCircle,
  Clock,
  ThumbsUp,
  Brain
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';
import { getRecommendedArticles } from '../data/seedData';

interface DashboardProps {
  setPath: (path: string) => void;
  lang: LanguageCode;
}

export const Dashboard: React.FC<DashboardProps> = ({ setPath, lang }) => {
  const { userProfile } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const [articles, setArticles] = useState<CurrentAffair[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [revisions, setRevisions] = useState<RevisionItem[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!userProfile) return;
      try {
        let [pubArticles, allQuestions, userRevs, userAttempts] = await Promise.all([
          articleService.getPublishedArticles(),
          questionService.getAllQuestions(),
          revisionService.getUserRevisions(userProfile.uid),
          quizService.getUserQuizAttempts(userProfile.uid)
        ]);

        // Auto-seed if database is empty on load
        if ((!pubArticles || pubArticles.length === 0) && (!allQuestions || allQuestions.length === 0)) {
          try {
            const { seedSampleFirestoreData } = await import('../data/seedData');
            const seeded = await seedSampleFirestoreData();
            if (seeded) {
              [pubArticles, allQuestions, userRevs, userAttempts] = await Promise.all([
                articleService.getPublishedArticles(),
                questionService.getAllQuestions(),
                revisionService.getUserRevisions(userProfile.uid),
                quizService.getUserQuizAttempts(userProfile.uid)
              ]);
            }
          } catch (seedErr) {
            console.error("Auto-seeding failed:", seedErr);
          }
        }

        setArticles(pubArticles || []);
        setQuestions(allQuestions || []);
        setRevisions(userRevs || []);
        setAttempts(userAttempts || []);
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, [userProfile]);

  // Calculates today's completed question counts
  const getTodayAttemptedCount = () => {
    const today = new Date().toDateString();
    let count = 0;
    attempts.forEach(att => {
      if (new Date(att.attemptedAt).toDateString() === today) {
        count += att.totalQuestions;
      }
    });
    return count;
  };

  // Calculate overall accuracy
  const getAccuracy = () => {
    if (attempts.length === 0) return 0;
    let totalCorrect = 0;
    let totalQs = 0;
    attempts.forEach(att => {
      totalCorrect += att.correctCount;
      totalQs += att.totalQuestions;
    });
    return totalQs > 0 ? Math.round((totalCorrect / totalQs) * 100) : 0;
  };

  // Find category accuracy breakdown to establish weak area
  const getWeakArea = () => {
    if (attempts.length === 0) return "Not Tested";
    const catStats: Record<string, { correct: number; total: number }> = {};
    attempts.forEach(att => {
      const cat = att.category || 'General';
      if (!catStats[cat]) {
        catStats[cat] = { correct: 0, total: 0 };
      }
      catStats[cat].correct += att.correctCount;
      catStats[cat].total += att.totalQuestions;
    });

    let weakestCat = "None";
    let lowestAcc = 101;

    Object.entries(catStats).forEach(([cat, stats]) => {
      const acc = (stats.correct / stats.total) * 100;
      if (acc < lowestAcc) {
        lowestAcc = acc;
        weakestCat = cat;
      }
    });

    return weakestCat === "None" ? "Defence" : weakestCat;
  };

  const todayAttempted = getTodayAttemptedCount();
  const dailyGoal = userProfile?.dailyTarget || 10;
  const isGoalCompleted = todayAttempted >= dailyGoal;
  const accuracy = getAccuracy();
  const weakCategory = getWeakArea();
  const revisionDueCount = revisions.filter(r => new Date(r.nextReviewAt) <= new Date() && r.status !== 'mastered').length;

  const finishedArticleIds = attempts.map(a => a.id); // placeholder logic for completed reads
  const recommendations = getRecommendedArticles(articles, finishedArticleIds);

  const handleAction = (targetPath: string) => {
    window.history.pushState({}, '', targetPath);
    setPath(targetPath);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-6 animate-pulse bg-slate-50 dark:bg-slate-950">
        <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="h-24 bg-slate-300 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-24 bg-slate-300 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-24 bg-slate-300 dark:bg-slate-800 rounded-lg"></div>
          <div className="h-24 bg-slate-300 dark:bg-slate-800 rounded-lg"></div>
        </div>
        <div className="h-40 bg-slate-300 dark:bg-slate-800 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
      
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
            {t('welcome')}, {userProfile?.name}!
          </h2>
          <p className="text-xs text-slate-500 font-semibold uppercase mt-0.5 tracking-wider">
            Target Attempt: {userProfile?.targetAttempt} | Preferred Language: {userProfile?.preferredLanguage?.toUpperCase()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-bold text-slate-500">SYSTEM CALIBRATED</span>
        </div>
      </div>

      {/* TODAY'S MISSION COMPACT CORE */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Compass className="h-5 w-5 text-indigo-500" />
          <h3 className="text-xs font-extrabold tracking-wider text-slate-900 dark:text-white uppercase">
            {t('todaysMission')}
          </h3>
        </div>

        {/* 4 metrics row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* STREAK */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900/60 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-950/20 flex items-center justify-center text-orange-600 dark:text-orange-400">
              <Zap className="h-5 w-5 fill-current" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('streak')}</p>
              <p className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
                🔥 {userProfile?.streak || 0} {t('days')}
              </p>
            </div>
          </div>

          {/* DAILY TARGET PROGRESS */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900/60 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-950/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Target className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('dailyTarget')}</p>
              <div className="flex items-baseline gap-1 mt-0.5">
                <p className="text-base font-extrabold text-slate-800 dark:text-white">
                  {todayAttempted} / {dailyGoal}
                </p>
                <span className="text-[10px] text-slate-400 font-semibold">Qs</span>
              </div>
              {/* Simple inline progress bar */}
              <div className="w-full bg-slate-200 dark:bg-slate-850 h-1.5 rounded-full mt-1.5 overflow-hidden">
                <div 
                  className={`h-full rounded-full ${isGoalCompleted ? 'bg-emerald-500' : 'bg-indigo-600'}`}
                  style={{ width: `${Math.min((todayAttempted / dailyGoal) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* ACCURACY */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900/60 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <HelpCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('accuracy')}</p>
              <p className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
                🎯 {accuracy}%
              </p>
            </div>
          </div>

          {/* REVISIONS */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900/60 flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-950/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t('revisionDue')}</p>
              <p className="text-base font-extrabold text-slate-800 dark:text-white mt-0.5">
                🔁 {revisionDueCount} {revisionDueCount === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
        </div>

        {/* RECOMMENDATIONS & WEAK SPOTS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 dark:border-slate-800/80 pt-5">
          <div className="bg-rose-50/40 dark:bg-rose-950/10 border border-rose-100 dark:border-rose-950/40 p-4 rounded-xl flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('weakAreas')}</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">
                Your highest error rate resides in <strong className="text-rose-600 dark:text-rose-400">{weakCategory}</strong>.
              </p>
              <button 
                onClick={() => handleAction(`/quiz`)}
                className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 mt-2"
              >
                Launch Weak-Area Quiz <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          <div className="bg-blue-50/40 dark:bg-indigo-950/10 border border-blue-100 dark:border-indigo-950/40 p-4 rounded-xl flex items-start gap-3">
            <Brain className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{t('recommendedStudy')}</p>
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 mt-1">
                Recommended to read: <strong className="text-indigo-600 dark:text-indigo-400">{recommendations[0]?.title || "Defence updates"}</strong>.
              </p>
              <button 
                onClick={() => recommendations[0] ? handleAction(`/current-affairs/${recommendations[0].id}`) : handleAction('/current-affairs')}
                className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 mt-2"
              >
                Read Now <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Interactive Shortcuts buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 dark:border-slate-800/80 pt-5">
          <button 
            onClick={() => handleAction('/current-affairs')}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 p-3.5 text-center transition-all shadow-xs"
          >
            <BookOpen className="h-5 w-5 text-indigo-500 mx-auto mb-1.5" />
            <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{t('currentAffairs')}</span>
          </button>
          
          <button 
            onClick={() => handleAction('/quiz')}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 p-3.5 text-center transition-all shadow-xs"
          >
            <HelpCircle className="h-5 w-5 text-emerald-500 mx-auto mb-1.5" />
            <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{t('startQuiz')}</span>
          </button>

          <button 
            onClick={() => handleAction('/revision')}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 p-3.5 text-center transition-all shadow-xs"
          >
            <RefreshCw className="h-5 w-5 text-purple-500 mx-auto mb-1.5" />
            <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{t('reviseNow')}</span>
          </button>

          <button 
            onClick={() => handleAction('/ask-ai')}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-850 p-3.5 text-center transition-all shadow-xs"
          >
            <Brain className="h-5 w-5 text-indigo-500 mx-auto mb-1.5" />
            <span className="text-xs font-bold block text-slate-800 dark:text-slate-200">{t('askAI')}</span>
          </button>
        </div>
      </section>

      {/* CONTINUE LEARNING CARD LIST */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <Zap className="h-4 w-4 fill-indigo-600 text-indigo-600" />
            {t('todaysAffairs')}
          </h3>
          <button 
            onClick={() => handleAction('/current-affairs')}
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center"
          >
            View All <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center space-y-3">
            <p className="text-xs text-slate-500 font-semibold">Your Today's learning mission is currently empty.</p>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const { seedSampleFirestoreData } = await import('../data/seedData');
                  await seedSampleFirestoreData();
                  const [pubArticles, allQuestions, userRevs, userAttempts] = await Promise.all([
                    articleService.getPublishedArticles(),
                    questionService.getAllQuestions(),
                    revisionService.getUserRevisions(userProfile!.uid),
                    quizService.getUserQuizAttempts(userProfile!.uid)
                  ]);
                  setArticles(pubArticles || []);
                  setQuestions(allQuestions || []);
                  setRevisions(userRevs || []);
                  setAttempts(userAttempts || []);
                } catch (err) {
                  console.error("Frictionless seeding failed:", err);
                } finally {
                  setLoading(false);
                }
              }}
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-[10px] font-black text-white px-4 py-2 rounded-lg shadow-sm transition active:scale-[0.98] cursor-pointer"
            >
              <Zap className="h-3.5 w-3.5 fill-current text-amber-400" />
              <span>Instantly Seed NDA Syllabus Content</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {articles.slice(0, 2).map((art) => (
              <div 
                key={art.id}
                onClick={() => handleAction(`/current-affairs/${art.id}`)}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition duration-150 cursor-pointer space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[10px] font-extrabold text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                      {art.category}
                    </span>
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${
                      art.priority === 'HIGH' ? 'text-rose-500' : art.priority === 'MEDIUM' ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      {art.priority} Priority
                    </span>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-snug">
                    {art.title}
                  </h4>
                  
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {art.summary}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-800/80 pt-3 text-[10px] text-slate-400 font-semibold uppercase">
                  <span>Source: {art.sourceName}</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {new Date(art.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default Dashboard;
