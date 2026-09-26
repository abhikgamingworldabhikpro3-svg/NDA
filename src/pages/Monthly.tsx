import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { articleService } from '../services/dbServices';
import { CurrentAffair } from '../types';
import { 
  Calendar, 
  ChevronRight, 
  BookOpen, 
  HelpCircle, 
  Award, 
  Shield, 
  Globe, 
  Compass, 
  Brain,
  Layers,
  ArrowRight,
  TrendingUp,
  Atom,
  Building
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';

interface MonthlyProps {
  setPath: (path: string) => void;
  lang: LanguageCode;
  onLaunchQuiz: (config: any) => void;
}

export const Monthly: React.FC<MonthlyProps> = ({ setPath, lang, onLaunchQuiz }) => {
  const { userProfile } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const [articles, setArticles] = useState<CurrentAffair[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>("September 2026");
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>("Defence");

  const months = ["September 2026", "August 2026", "July 2026"];
  const categories = ["Defence", "National", "International", "Space", "Economy", "Government Schemes"];

  const categoryIcons: Record<string, any> = {
    "Defence": Shield,
    "National": Compass,
    "International": Globe,
    "Space": Atom,
    "Economy": TrendingUp,
    "Government Schemes": Building
  };

  useEffect(() => {
    const fetchMonthlyArticles = async () => {
      setLoading(true);
      try {
        const pub = await articleService.getPublishedArticles();
        setArticles(pub || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMonthlyArticles();
  }, []);

  // Filter articles belonging to selected month (we will compare publish date)
  const getMonthlyArticles = () => {
    return articles.filter(art => {
      const date = new Date(art.publishedAt);
      const monthYearStr = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
      return monthYearStr === selectedMonth;
    });
  };

  const monthlyArticles = getMonthlyArticles();

  // Mega revision facts breakdown
  const getCategoryFacts = (cat: string) => {
    const catArticles = monthlyArticles.filter(a => a.category === cat);
    const facts: string[] = [];
    catArticles.forEach(a => {
      if (a.importantFacts) {
        facts.push(...a.importantFacts.slice(0, 2));
      }
    });
    return facts.slice(0, 6);
  };

  const activeCategoryFacts = getCategoryFacts(activeCategoryTab);

  const handleLaunchMegaMockTest = () => {
    // Launch a high-yield mock test of 50 questions
    onLaunchQuiz({
      mode: 'monthly',
      count: 30,
      difficulty: 'mixed',
      timerSeconds: 1200
    });
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-4 bg-slate-50 dark:bg-slate-950 animate-pulse">
        <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-40 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  const IconComponent = categoryIcons[activeCategoryTab] || Shield;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
            {t('monthly')}
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            Compiled Syllabus Monthly Bundles for GAT Preparation
          </p>
        </div>

        {/* Month selector dropdown */}
        <div className="relative">
          <select 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none focus:border-indigo-600 shadow-xs"
          >
            {months.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* MONTHLY MEGA REVISION CALLOUT */}
      <section className="bg-gradient-to-r from-indigo-900 to-indigo-950 text-white rounded-2xl p-6 shadow-md relative overflow-hidden">
        <div className="absolute right-0 bottom-0 top-0 opacity-10 flex items-center justify-center pointer-events-none">
          <Calendar className="h-44 w-44 scale-150 rotate-12" />
        </div>

        <div className="space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3.5 py-1 text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
            <Award className="h-3.5 w-3.5 text-indigo-400" /> High-Yield Compiler
          </div>

          <h3 className="text-lg lg:text-xl font-black leading-tight">
            {selectedMonth} Mega Revision Capsule
          </h3>

          <p className="text-xs text-indigo-200 leading-relaxed font-medium">
            Analyze the complete set of {monthlyArticles.length} exam-relevant current affairs published in {selectedMonth}. Retain high-value factsheet points, static GK ministries, and weapon platforms seamlessly.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={handleLaunchMegaMockTest}
              className="rounded-lg bg-white hover:bg-slate-100 text-indigo-950 font-bold px-4 py-2.5 text-xs shadow-sm transition"
            >
              Start GAT Monthly Mock Test
            </button>
          </div>
        </div>
      </section>

      {/* COMPACT FACT CAPSULE VIEWER BY CATEGORY */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xs space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
          <Layers className="h-5 w-5 text-indigo-500" />
          <h3 className="text-sm font-black text-slate-950 dark:text-white uppercase tracking-tight">Category Facts Digest</h3>
        </div>

        {/* Categories toggler */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategoryTab(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeCategoryTab === cat 
                  ? 'bg-indigo-600 text-white shadow-xs' 
                  : 'bg-slate-50 hover:bg-slate-100 border border-slate-100 dark:bg-slate-950 dark:border-slate-900 text-slate-400 dark:text-slate-400'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Fact Capsule points display */}
        <div className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 p-5 rounded-xl space-y-3 min-h-[140px] flex flex-col justify-center">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            <IconComponent className="h-4 w-4 text-indigo-500 shrink-0" />
            <span>Key facts from {activeCategoryTab}</span>
          </div>

          {activeCategoryFacts.length === 0 ? (
            <p className="text-xs text-slate-500 font-semibold italic text-center">No key facts parsed for {activeCategoryTab} in {selectedMonth} yet.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {activeCategoryFacts.map((fact, index) => (
                <div key={index} className="flex items-start gap-2.5 text-xs font-bold text-slate-600 dark:text-slate-350 leading-relaxed">
                  <span className="text-indigo-500 mt-1 shrink-0">•</span>
                  <span>{fact}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* MONTHLY CHRONOLOGICAL NEWS TIMELINE */}
      <section className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <BookOpen className="h-4.5 w-4.5 text-slate-500" />
          Chronological Ingestion Timeline ({monthlyArticles.length} items)
        </h3>

        {monthlyArticles.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">
            <p className="text-xs text-slate-500 font-semibold">No timeline events compiled for {selectedMonth} yet.</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
            {monthlyArticles.map((art) => (
              <div 
                key={art.id}
                onClick={() => setPath(`/current-affairs/${art.id}`)}
                className="p-4.5 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850/30 transition cursor-pointer"
              >
                <div className="space-y-1 pr-6 flex-1">
                  <h4 className="text-xs sm:text-sm font-extrabold text-slate-850 dark:text-white line-clamp-1 leading-snug">
                    {art.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                    <span className="text-indigo-500">{art.category}</span>
                    <span>{new Date(art.publishedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <ChevronRight className="h-4 w-4 text-slate-400 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
export default Monthly;
