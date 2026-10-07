import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  articleService, 
  bookmarkService, 
  revisionService, 
  aiService,
  questionService
} from '../services/dbServices';
import { CurrentAffair, Question } from '../types';
import { 
  Bookmark, 
  BookmarkCheck, 
  RefreshCw, 
  Sparkles, 
  HelpCircle, 
  Brain, 
  Clock, 
  Send, 
  MessageSquare,
  ArrowLeft,
  ChevronRight,
  Shield,
  Award,
  Globe,
  Plus,
  ThumbsUp,
  Volume2,
  Play,
  Pause,
  Loader2
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';

interface ArticleDetailProps {
  articleId: string;
  onBack: () => void;
  lang: LanguageCode;
  setPath: (path: string) => void;
}

export const ArticleDetail: React.FC<ArticleDetailProps> = ({ 
  articleId, 
  onBack, 
  lang,
  setPath
}) => {
  const { userProfile } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];
  const [article, setArticle] = useState<CurrentAffair | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRevising, setIsRevising] = useState(false);
  const [loading, setLoading] = useState(true);

  // TTS Voice briefing states
  const [generatingAudio, setGeneratingAudio] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioObj, setAudioObj] = useState<HTMLAudioElement | null>(null);

  // Clean up playing audio on page navigate / component unmount
  useEffect(() => {
    return () => {
      if (audioObj) {
        audioObj.pause();
      }
    };
  }, [audioObj]);

  const handleListenToBriefing = async () => {
    if (audioObj) {
      if (isPlayingAudio) {
        audioObj.pause();
        setIsPlayingAudio(false);
      } else {
        audioObj.play();
        setIsPlayingAudio(true);
      }
      return;
    }

    if (!article) return;
    setGeneratingAudio(true);
    try {
      const briefingText = `${article.title}. Summary: ${article.summary}`;
      const response = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: briefingText })
      });
      if (!response.ok) {
        throw new Error("Failed to generate tts briefing");
      }
      const data = await response.json();
      
      const audioUrl = `data:audio/wav;base64,${data.audio}`;
      const audio = new Audio(audioUrl);
      
      audio.addEventListener('play', () => setIsPlayingAudio(true));
      audio.addEventListener('pause', () => setIsPlayingAudio(false));
      audio.addEventListener('ended', () => setIsPlayingAudio(false));
      
      setAudioObj(audio);
      audio.play();
      setIsPlayingAudio(true);
    } catch (err) {
      console.error("Audio generation failed:", err);
      alert("Failed to connect to the Gemini voice engine. Please try again.");
    } finally {
      setGeneratingAudio(false);
    }
  };

  // Chat parameters
  const [query, setQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [chatLoading, setLoadingChat] = useState(false);

  // Interactive custom practice MCQs generated on demand
  const [practiceQuestions, setPracticeQuestions] = useState<Question[]>([]);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  useEffect(() => {
    const fetchArticleDetail = async () => {
      setLoading(true);
      try {
        const art = await articleService.getArticleById(articleId);
        if (art) {
          setArticle(art);
          
          if (userProfile) {
            const bookmarked = await bookmarkService.isBookmarked(userProfile.uid, 'article', articleId);
            setIsBookmarked(bookmarked);
            
            // Check if present in revision
            const revisions = await revisionService.getUserRevisions(userProfile.uid);
            const isRev = revisions.some(r => r.itemId === articleId && r.itemType === 'article');
            setIsRevising(isRev);
          }
        }
      } catch (err) {
        console.error("Failed to load article detail:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticleDetail();
  }, [articleId, userProfile]);

  const handleToggleBookmark = async () => {
    if (!userProfile || !article) return;
    try {
      const state = await bookmarkService.toggleBookmark(userProfile.uid, 'article', article.id);
      setIsBookmarked(state);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleRevision = async () => {
    if (!userProfile || !article) return;
    try {
      await revisionService.addOrUpdateRevision(userProfile.uid, article.id, 'article', true);
      setIsRevising(true);
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Gemini processing to answer article specific question
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !article) return;

    const userText = query;
    setQuery('');
    setChatMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoadingChat(true);

    try {
      const responseText = await aiService.askArticleSpecificAI(
        userText, 
        article.title, 
        article.detailedExplanation || article.summary, 
        article.category
      );
      setChatMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (err) {
      console.warn("Client fallback for article chat:", err);
      const fallbackResponse = `### 🎯 GAT Brief: ${article.title}\n\n**Direct Answer:**\nRegarding "${userText}": In this article (${article.category}), key focus is on: ${(article.importantFacts || []).slice(0, 3).join("; ")}.\n\n**NDA Exam Context:**\n${article.ndaRelevance || "High probability topic for upcoming GAT paper."}\n\n**Static GK:**\n${article.staticGK || "Review foundational dates, acts, and military headquarters."}`;
      setChatMessages(prev => [...prev, { role: 'model', text: fallbackResponse }]);
    } finally {
      setLoadingChat(false);
    }
  };

  // Trigger Gemini MCQ generation on demand
  const handleGenerateQuestions = async () => {
    if (!article) return;
    setGeneratingQuiz(true);
    try {
      const fetchedQs = await aiService.generatePracticeQuestions(
        article.title,
        article.category,
        article.detailedExplanation,
        5,
        'medium'
      );

      // Map to strict Question models
      const mappedQs: Question[] = fetchedQs.map((q, idx) => ({
        id: `gen_q_${article.id}_${idx}`,
        question: q.question,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        category: article.category,
        difficulty: 'medium',
        source: article.sourceName,
        articleId: article.id
      }));

      // Optionally save generated questions to the questions database so admins can review later!
      if (userProfile?.role === 'admin') {
        for (const mq of mappedQs) {
          await questionService.saveAdminQuestion(mq);
        }
      }

      setPracticeQuestions(mappedQs);
      setActiveQuestionIndex(0);
      setSelectedOption(null);
      setQuizScore(0);
      setShowExplanation(false);
    } catch (err) {
      console.error("AI question generation error:", err);
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleSelectOption = (opt: string) => {
    if (showExplanation) return;
    setSelectedOption(opt);
    setShowExplanation(true);
    const correct = practiceQuestions[activeQuestionIndex].correctAnswer === opt;
    if (correct) {
      setQuizScore(prev => prev + 1);
    }
  };

  const handleNextPracticeQuestion = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setActiveQuestionIndex(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 space-y-6 animate-pulse bg-slate-50 dark:bg-slate-950">
        <div className="h-6 bg-slate-300 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-40 bg-slate-300 dark:bg-slate-800 rounded-xl"></div>
        <div className="space-y-2">
          <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-5/6"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-800 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="flex-1 p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-950">
        <p className="text-sm font-bold text-slate-500">Selected article does not exist or has been removed.</p>
        <button onClick={onBack} className="text-xs font-bold text-indigo-600 hover:underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 grid grid-cols-1 xl:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
      
      {/* Left Columns - Article content */}
      <div className="xl:col-span-2 space-y-6">
        {/* Back control */}
        <button 
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Articles
        </button>

        {/* Content sheet */}
        <article className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[10px] font-extrabold text-slate-600 dark:text-slate-200 uppercase tracking-wider">
                  {article.category}
                </span>
                {article.subCategory && (
                  <span className="text-xs font-semibold text-slate-400">{article.subCategory}</span>
                )}
              </div>

              <div className="flex items-center gap-1 text-[10px] text-slate-400 font-bold uppercase">
                <Clock className="h-3.5 w-3.5" />
                <span>Published: {new Date(article.publishedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <h1 className="text-lg lg:text-xl font-black text-slate-900 dark:text-white leading-tight">
              {article.title}
            </h1>

            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Source: {article.sourceName}</span>
              <span className={`text-[10px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full ${
                article.priority === 'HIGH' ? 'bg-red-50 text-rose-600 dark:bg-red-950/20 dark:text-rose-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300'
              }`}>
                {article.priority} Priority
              </span>
            </div>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5 py-1">
            <button
              onClick={handleToggleBookmark}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition border ${
                isBookmarked 
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-sm' 
                  : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
              }`}
            >
              {isBookmarked ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              <span>{isBookmarked ? 'Bookmarked' : 'Bookmark'}</span>
            </button>

            <button
              onClick={handleToggleRevision}
              disabled={isRevising}
              className={`flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-bold transition border ${
                isRevising
                  ? 'bg-emerald-600/10 border-emerald-500/20 text-emerald-500'
                  : 'bg-white border-slate-200 hover:border-slate-300 text-slate-600 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300'
              }`}
            >
              <RefreshCw className={`h-4 w-4 ${isRevising ? '' : 'text-emerald-500'}`} />
              <span>{isRevising ? 'In Revision' : 'Add to Revision'}</span>
            </button>

            <button
              onClick={handleGenerateQuestions}
              disabled={generatingQuiz}
              className="flex items-center gap-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 text-xs font-bold text-white shadow-md transition"
            >
              <HelpCircle className="h-4 w-4" />
              <span>{generatingQuiz ? 'Generating...' : 'Generate Practice Qs'}</span>
            </button>
          </div>

          {/* Summary Callout */}
          <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900/60 leading-relaxed">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1.5">Executive Summary</p>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200">{article.summary}</p>
          </div>

          {/* Detailed Markdown Content */}
          <div className="text-xs lg:text-sm text-slate-700 dark:text-slate-300 space-y-4 leading-relaxed font-normal whitespace-pre-wrap">
            {article.detailedExplanation}
          </div>

          {/* WHY IT MATTERS FOR NDA */}
          <section className="bg-indigo-50/40 dark:bg-indigo-950/15 border-l-4 border-indigo-600 p-4 rounded-r-xl space-y-1.5">
            <h3 className="text-xs font-extrabold text-indigo-700 dark:text-indigo-400 tracking-wider uppercase">
              {t('whyItMatters')}
            </h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-200 leading-relaxed">
              {article.ndaRelevance}
            </p>
          </section>

          {/* REMEMBER THIS - Factual lists */}
          {article.importantFacts && article.importantFacts.length > 0 && (
            <section className="bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-900/60 p-4 rounded-xl space-y-3">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white tracking-wider uppercase">
                {t('importantFacts')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {article.importantFacts.map((fact, index) => (
                  <div key={index} className="flex items-start gap-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <span className="text-amber-500 mt-1 shrink-0">•</span>
                    <span>{fact}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* STATIC GK CONNECTION CARD */}
          {article.staticGK && (
            <section className="bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-500/10 p-5 rounded-2xl space-y-2">
              <div className="flex items-center gap-1.5 border-b border-emerald-500/10 pb-2 mb-2">
                <Globe className="h-4 w-4 text-emerald-500" />
                <h3 className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 tracking-wider uppercase">
                  {t('staticGk')}
                </h3>
              </div>
              <p className="text-xs font-medium text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">
                {article.staticGK}
              </p>
            </section>
          )}
        </article>
      </div>

      {/* Right Column - Chat Assistant or MCQ practice panel */}
      <div className="space-y-6">
        
        {/* practice MCQ generated on demand */}
        {practiceQuestions.length > 0 && (
          <div className="bg-white dark:bg-slate-900 border-2 border-indigo-600/30 p-5 rounded-2xl shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
              <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase">Mock Test Practice</span>
              <span className="text-[10px] font-bold text-slate-400">Question {activeQuestionIndex + 1} of {practiceQuestions.length}</span>
            </div>

            {activeQuestionIndex < practiceQuestions.length ? (
              <div className="space-y-4">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white leading-relaxed">
                  {practiceQuestions[activeQuestionIndex].question}
                </h4>

                <div className="space-y-2">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optionField = `option${opt}` as keyof Question;
                    const optionText = practiceQuestions[activeQuestionIndex][optionField] as string;
                    const isCorrect = practiceQuestions[activeQuestionIndex].correctAnswer === opt;
                    const isSelected = selectedOption === opt;

                    return (
                      <button
                        key={opt}
                        onClick={() => handleSelectOption(opt)}
                        disabled={showExplanation}
                        className={`w-full text-left p-3 rounded-lg text-xs font-bold border transition-all ${
                          showExplanation
                            ? isCorrect
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                              : isSelected
                                ? 'bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                                : 'bg-slate-50 border-slate-100 text-slate-400 dark:bg-slate-950 dark:border-slate-900'
                            : isSelected
                              ? 'bg-indigo-600 border-indigo-500 text-white'
                              : 'bg-slate-50 border-slate-100 dark:bg-slate-950 dark:border-slate-900 hover:bg-slate-100 dark:hover:bg-slate-900/80 text-slate-600 dark:text-slate-350'
                        }`}
                      >
                        {opt}. {optionText}
                      </button>
                    );
                  })}
                </div>

                {showExplanation && (
                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900 space-y-1.5 leading-relaxed">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Solution Explanation</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-300">
                      {practiceQuestions[activeQuestionIndex].explanation}
                    </p>
                    
                    <button
                      onClick={
                        activeQuestionIndex === practiceQuestions.length - 1
                          ? () => setPracticeQuestions([]) // close
                          : handleNextPracticeQuestion
                      }
                      className="mt-3 w-full bg-slate-800 hover:bg-slate-900 text-[10px] font-bold text-white rounded py-2 transition"
                    >
                      {activeQuestionIndex === practiceQuestions.length - 1 ? 'Finish Practice' : 'Next Question'}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center p-6 space-y-2">
                <ThumbsUp className="h-8 w-8 text-emerald-500 mx-auto" />
                <h4 className="text-sm font-extrabold">Practice Completed!</h4>
                <p className="text-xs text-slate-400">You scored {quizScore} out of {practiceQuestions.length}.</p>
                <button
                  onClick={() => setPracticeQuestions([])}
                  className="rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 px-4 py-1.5 text-xs font-bold"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        )}

        {/* Ask AI about this article grounding chat */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm flex flex-col h-[400px]">
          <div className="border-b border-slate-100 dark:border-slate-800 p-4 flex items-center gap-2">
            <Brain className="h-4 w-4 text-indigo-500 animate-pulse" />
            <div>
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Article Deep-Dive AI</h3>
              <p className="text-[9px] text-slate-400 font-semibold tracking-wide">Ask definitions, summaries, or details</p>
            </div>
          </div>

          {/* Message queue */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
            {chatMessages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-400 p-4">
                <MessageSquare className="h-8 w-8 text-slate-300" />
                <p className="text-xs font-bold text-slate-500">Ask any analytical query or ask: "Give me 3 GK questions from this article."</p>
              </div>
            ) : (
              chatMessages.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-3 rounded-2xl text-xs font-medium max-w-[85%] leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-indigo-600 text-white rounded-br-none' 
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100 rounded-bl-none'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))
            )}

            {chatLoading && (
              <div className="flex justify-start">
                <div className="p-3 rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 text-xs font-bold rounded-bl-none animate-pulse">
                  Analyzing details...
                </div>
              </div>
            )}
          </div>

          {/* Form input */}
          <form onSubmit={handleSendChat} className="border-t border-slate-100 dark:border-slate-800 p-3 flex gap-2">
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type question about this news..."
              className="flex-1 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-lg px-3 text-xs outline-none focus:border-indigo-600 transition"
              disabled={chatLoading}
            />
            <button 
              type="submit"
              disabled={chatLoading || !query.trim()}
              className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
export default ArticleDetail;
