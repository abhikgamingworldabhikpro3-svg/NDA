import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { revisionService, questionService, articleService } from '../services/dbServices';
import { RevisionItem, Question, CurrentAffair } from '../types';
import { 
  RefreshCw, 
  HelpCircle, 
  Calendar, 
  Trash2, 
  Play, 
  Award, 
  CheckCircle, 
  Compass, 
  AlertCircle,
  XCircle,
  Eye
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';

interface RevisionProps {
  setPath: (path: string) => void;
  lang: LanguageCode;
}

export const Revision: React.FC<RevisionProps> = ({ setPath, lang }) => {
  const { userProfile } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const [revisionItems, setRevisionItems] = useState<RevisionItem[]>([]);
  const [questions, setQuestions] = useState<Record<string, Question>>({});
  const [articles, setArticles] = useState<Record<string, CurrentAffair>>({});
  const [loading, setLoading] = useState(true);

  // Active testing states
  const [testingItem, setTestingItem] = useState<RevisionItem | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [feedbackRevealed, setFeedbackRevealed] = useState(false);

  useEffect(() => {
    const fetchRevisions = async () => {
      if (!userProfile) return;
      setLoading(true);
      try {
        const revs = await revisionService.getUserRevisions(userProfile.uid);
        setRevisionItems(revs || []);

        // Bulk load corresponding questions and articles for details
        const allQuestions = await questionService.getAllQuestions();
        const allArticles = await articleService.getPublishedArticles();

        const qMap: Record<string, Question> = {};
        allQuestions.forEach(q => qMap[q.id] = q);
        setQuestions(qMap);

        const aMap: Record<string, CurrentAffair> = {};
        allArticles.forEach(a => aMap[a.id] = a);
        setArticles(aMap);

      } catch (err) {
        console.error("Revision fetch failure:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRevisions();
  }, [userProfile]);

  const handleDeleteItem = async (itemId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userProfile) return;
    try {
      await revisionService.deleteRevisionItem(userProfile.uid, itemId);
      setRevisionItems(prev => prev.filter(r => r.id !== itemId));
    } catch (err) {
      console.error(err);
    }
  };

  const startTestReview = (item: RevisionItem) => {
    if (item.itemType !== 'question') return;
    setTestingItem(item);
    setSelectedOption(null);
    setFeedbackRevealed(false);
  };

  const handleSelectOption = async (option: string) => {
    if (!testingItem || !userProfile) return;
    setSelectedOption(option);
    setFeedbackRevealed(true);

    const question = questions[testingItem.itemId];
    const isCorrect = question.correctAnswer === option;

    // Update revision statistics in Firestore!
    await revisionService.addOrUpdateRevision(
      userProfile.uid, 
      testingItem.itemId, 
      'question', 
      isCorrect
    );

    // Refresh list in background
    setTimeout(async () => {
      const revs = await revisionService.getUserRevisions(userProfile.uid);
      setRevisionItems(revs || []);
    }, 1000);
  };

  const revisionDue = revisionItems.filter(r => new Date(r.nextReviewAt) <= new Date() && r.status !== 'mastered');
  const masteredCount = revisionItems.filter(r => r.status === 'mastered').length;

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-4 bg-slate-50 dark:bg-slate-950 animate-pulse">
        <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-32 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
        <div className="h-32 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
          {t('revision')}
        </h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
          Spaced Repetition Engine (SRE) for GAT syllabus retention
        </p>
      </div>

      {/* Spaced-Repetition Active Test Overlay Modal */}
      {testingItem && questions[testingItem.itemId] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl space-y-4 animate-in zoom-in duration-100">
            <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-850 pb-2">
              <span className="text-[10px] font-black text-indigo-500 uppercase tracking-wider">Active Spaced Review Trial</span>
              <button 
                onClick={() => setTestingItem(null)}
                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-850 dark:text-white leading-relaxed">
                {questions[testingItem.itemId].question}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {['A', 'B', 'C', 'D'].map(opt => {
                  const optField = `option${opt}` as keyof Question;
                  const optText = questions[testingItem.itemId][optField] as string;
                  const isCorrect = questions[testingItem.itemId].correctAnswer === opt;
                  const isSelected = selectedOption === opt;

                  let styleClasses = "border border-slate-100 bg-slate-50 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-350 dark:hover:bg-slate-900";
                  if (feedbackRevealed) {
                    if (isCorrect) {
                      styleClasses = "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400";
                    } else if (isSelected) {
                      styleClasses = "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400";
                    } else {
                      styleClasses = "opacity-40 border border-slate-100 text-slate-400 dark:bg-slate-950 dark:border-slate-900";
                    }
                  }

                  return (
                    <button
                      key={opt}
                      onClick={() => handleSelectOption(opt)}
                      disabled={feedbackRevealed}
                      className={`w-full text-left p-3 rounded-xl text-xs font-bold transition ${styleClasses}`}
                    >
                      {opt}. {optText}
                    </button>
                  );
                })}
              </div>

              {feedbackRevealed && (
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900/60 leading-relaxed text-xs">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Explanation</p>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {questions[testingItem.itemId].explanation}
                  </p>
                  <button
                    onClick={() => setTestingItem(null)}
                    className="mt-4 w-full bg-slate-850 hover:bg-slate-900 text-white font-bold py-2 rounded-lg text-center"
                  >
                    Finish Review Item
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Revision Stats overview banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-orange-100 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <RefreshCw className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Total active</p>
            <p className="text-base font-extrabold">{revisionItems.length} items</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Due Today</p>
            <p className="text-base font-extrabold text-rose-600 dark:text-rose-400">{revisionDue.length} items</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-4 shadow-xs">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Mastered</p>
            <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">{masteredCount} items</p>
          </div>
        </div>
      </div>

      {/* Revision items list */}
      <section className="space-y-4">
        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-slate-500" />
          My Spaced Revision Cards
        </h3>

        {revisionItems.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-12 rounded-2xl text-center space-y-2 max-w-xl mx-auto">
            <p className="text-xs text-slate-500 font-semibold">Your revision queue is currently empty.</p>
            <p className="text-[10px] text-slate-400">Items enter here automatically when you answer a question wrong in quizzes, or when you tap "Add to Revision" on articles.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {revisionItems.map((item) => {
              const question = questions[item.itemId];
              const article = articles[item.itemId];
              
              const isDue = new Date(item.nextReviewAt) <= new Date();

              if (item.itemType === 'question' && !question) return null;
              if (item.itemType === 'article' && !article) return null;

              return (
                <div 
                  key={item.id}
                  className={`bg-white dark:bg-slate-900 border p-4.5 rounded-2xl shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isDue ? 'border-l-4 border-l-rose-500 border-slate-200 dark:border-slate-800' : 'border-slate-200 dark:border-slate-850'
                  }`}
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        item.status === 'mastered' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}>
                        {item.status}
                      </span>
                      {isDue && (
                        <span className="text-[9px] font-extrabold text-rose-500 uppercase tracking-wide flex items-center gap-0.5">
                          • Due Review
                        </span>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
                      {item.itemType === 'question' ? question.question : article.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                      <span>Type: {item.itemType}</span>
                      <span>Correct Reviews: {item.correctCount}</span>
                      <span>Wrong: {item.wrongCount}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 justify-end sm:justify-start">
                    {item.itemType === 'question' ? (
                      <button
                        onClick={() => startTestReview(item)}
                        className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold text-white px-3.5 py-1.5 flex items-center gap-1 shadow-sm transition"
                      >
                        <Play className="h-3 w-3 fill-current" /> Test Trial
                      </button>
                    ) : (
                      <button
                        onClick={() => setPath(`/current-affairs/${article.id}`)}
                        className="rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[10px] font-bold text-slate-600 dark:text-slate-300 px-3.5 py-1.5 flex items-center gap-1 transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> Read Article
                      </button>
                    )}

                    <button
                      onClick={(e) => handleDeleteItem(item.id, e)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-850 text-slate-400 hover:text-red-500 dark:hover:bg-slate-850 hover:bg-slate-50"
                      title="Remove from queue"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
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
export default Revision;
