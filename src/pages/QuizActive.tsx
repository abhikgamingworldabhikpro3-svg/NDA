import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { questionService, quizService, reportService } from '../services/dbServices';
import { Question, QuizAttempt } from '../types';
import { QuizConfig } from './Quiz';
import { sampleQuestions } from '../data/seedData';
import { 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  Award, 
  RefreshCw, 
  Home, 
  Flag, 
  X, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Send
} from 'lucide-react';

interface QuizActiveProps {
  config: QuizConfig;
  onClose: () => void;
}

export const QuizActive: React.FC<QuizActiveProps> = ({ config, onClose }) => {
  const { userProfile } = useAuth();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({}); // questionId -> option (A/B/C/D)
  const [loading, setLoading] = useState(true);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(config.timerSeconds);
  const [timeSpent, setTimeSpent] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Scoreboard / Review state
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Rapid Fire states
  const [rapidFeedback, setRapidFeedback] = useState<Record<string, boolean>>({}); // questionId -> isRevealed

  // Report Modal states
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportQuestionId, setReportQuestionId] = useState('');
  const [reportReason, setReportReason] = useState<'Wrong Answer' | 'Ambiguous Question' | 'Incorrect Fact' | 'Typo' | 'Other'>('Wrong Answer');
  const [reportText, setReportText] = useState('');
  const [reportSuccess, setReportSuccess] = useState(false);

  useEffect(() => {
    const fetchQuestionsForQuiz = async () => {
      setLoading(true);
      try {
        let fetchedQs: Question[] = [];
        
        if (config.mode === 'weak-areas') {
          // Identify weak areas - default to Defence/National/Space
          fetchedQs = await questionService.getAllQuestions();
          if (fetchedQs.length === 0) {
            fetchedQs = sampleQuestions;
          }
        } else if (config.category) {
          fetchedQs = await questionService.getQuestionsByCategory(config.category);
        } else {
          fetchedQs = await questionService.getAllQuestions();
        }

        // Fallback to local high-quality seed questions if db is empty
        if (fetchedQs.length === 0) {
          fetchedQs = sampleQuestions;
        }

        // Filter by difficulty if specified
        if (config.difficulty !== 'mixed') {
          fetchedQs = fetchedQs.filter(q => q.difficulty === config.difficulty);
        }

        // Shuffle and slice count
        fetchedQs = fetchedQs
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(config.count, fetchedQs.length));

        setQuestions(fetchedQs);
      } catch (err) {
        console.error("Quiz questions load failure:", err);
        setQuestions(sampleQuestions.slice(0, config.count));
      } finally {
        setLoading(false);
      }
    };
    fetchQuestionsForQuiz();
  }, [config]);

  // Handle countdown timer
  useEffect(() => {
    if (loading || isSubmitted || config.timerSeconds === 0) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, isSubmitted]);

  // Keep track of simple time elapsed for untimed tests
  useEffect(() => {
    if (loading || isSubmitted || config.timerSeconds > 0) return;
    const interval = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [loading, isSubmitted]);

  const handleSelectOption = (qId: string, option: string) => {
    if (isSubmitted) return;
    
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: option
    }));

    if (config.mode === 'rapid-fire') {
      setRapidFeedback(prev => ({
        ...prev,
        [qId]: true
      }));
    }
  };

  const handleAutoSubmit = () => {
    submitQuiz();
  };

  const submitQuiz = async () => {
    if (!userProfile) return;
    setSubmitting(true);
    
    // Evaluate correctness
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;

    questions.forEach(q => {
      const ans = selectedAnswers[q.id];
      if (!ans) {
        unansweredCount++;
      } else if (ans === q.correctAnswer) {
        correctCount++;
      } else {
        wrongCount++;
      }
    });

    const scorePercent = Math.round((correctCount / questions.length) * 100);

    const attempt: Omit<QuizAttempt, 'userId' | 'attemptedAt'> = {
      id: 'att_' + Math.random().toString(36).substr(2, 9),
      quizType: config.mode,
      category: config.category || 'Mixed',
      score: scorePercent,
      totalQuestions: questions.length,
      correctCount,
      wrongCount,
      unansweredCount,
      timeSpentSeconds: timeSpent,
      answers: selectedAnswers
    };

    try {
      await quizService.submitQuizAttempt(userProfile.uid, attempt);
      setIsSubmitted(true);
    } catch (err) {
      console.error("Failed to submit score:", err);
      // Fallback submission bypass on network failure to maintain student UX
      setIsSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const openReportModal = (questionId: string) => {
    setReportQuestionId(questionId);
    setReportSuccess(false);
    setReportText('');
    setShowReportModal(true);
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || !reportText.trim()) return;
    try {
      await reportService.submitReport(userProfile.uid, {
        questionId: reportQuestionId,
        reason: reportReason,
        description: reportText
      });
      setReportSuccess(true);
      setTimeout(() => {
        setShowReportModal(false);
      }, 1500);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col justify-center items-center">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500">Retrieving test papers, compiling choices...</p>
      </div>
    );
  }

  // Scoreboard View
  if (isSubmitted) {
    const correctCount = questions.filter(q => selectedAnswers[q.id] === q.correctAnswer).length;
    const scorePercent = Math.round((correctCount / questions.length) * 100);

    return (
      <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
        {/* Scorecard Hero */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl text-center space-y-4 shadow-sm max-w-xl mx-auto">
          <Award className="h-12 w-12 text-indigo-500 mx-auto animate-bounce" />
          <div className="space-y-1">
            <h2 className="text-lg font-black text-slate-950 dark:text-white">Exam Completed!</h2>
            <p className="text-xs text-slate-400 font-bold uppercase">GAT Current Affairs Practice Result</p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Total Score</p>
              <p className="text-base font-extrabold text-indigo-500">{scorePercent}%</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Correct</p>
              <p className="text-base font-extrabold text-emerald-500">{correctCount} / {questions.length}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg text-center">
              <p className="text-[10px] text-slate-400 font-bold uppercase">Time spent</p>
              <p className="text-base font-extrabold text-slate-600 dark:text-slate-300">{formatTime(timeSpent)}</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-slate-800 hover:bg-slate-900 text-xs font-extrabold text-white py-2.5 transition"
            >
              Back to Quiz Hub
            </button>
          </div>
        </div>

        {/* Detailed Solutions Review */}
        <section className="max-w-2xl mx-auto space-y-4 mt-8">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Review Solutions & Explanations</h3>

          {questions.map((q, idx) => {
            const userSelection = selectedAnswers[q.id];
            const isCorrect = userSelection === q.correctAnswer;
            
            return (
              <div 
                key={q.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3"
              >
                <div className="flex justify-between items-start gap-2 border-b border-slate-50 dark:border-slate-850 pb-2">
                  <span className="text-[10px] font-bold text-slate-400">Question {idx + 1} ({q.category})</span>
                  <div className="flex items-center gap-1.5">
                    {userSelection ? (
                      isCorrect ? (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 uppercase">
                          <CheckCircle className="h-4 w-4" /> Correct
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-rose-500 uppercase">
                          <XCircle className="h-4 w-4" /> Incorrect
                        </span>
                      )
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Unanswered</span>
                    )}

                    {/* Report Problem button */}
                    <button
                      onClick={() => openReportModal(q.id)}
                      className="ml-3 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-amber-500 transition-all"
                      title="Report question error"
                    >
                      <Flag className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-xs font-extrabold text-slate-850 dark:text-white leading-relaxed">
                  {q.question}
                </h4>

                {/* Options display */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1.5">
                  {['A', 'B', 'C', 'D'].map((opt) => {
                    const optField = `option${opt}` as keyof Question;
                    const optText = q[optField] as string;
                    const isCorrectAnswer = q.correctAnswer === opt;
                    const isSelectedAnswer = userSelection === opt;

                    let classes = "border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-350";
                    if (isCorrectAnswer) {
                      classes = "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400";
                    } else if (isSelectedAnswer) {
                      classes = "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400";
                    }

                    return (
                      <div key={opt} className={`p-2.5 rounded-lg text-xs font-bold ${classes}`}>
                        {opt}. {optText}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Card */}
                <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900/60 leading-relaxed text-xs">
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">Explanation & Static GK</p>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {q.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </section>

        {/* Question Error Report Dialog Modal */}
        {showReportModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl space-y-4 animate-in fade-in duration-100">
              <div className="flex justify-between items-start">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Report Question Correction</h3>
                <button 
                  onClick={() => setShowReportModal(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {reportSuccess ? (
                <div className="text-center py-6 space-y-2 text-emerald-500">
                  <CheckCircle className="h-8 w-8 mx-auto" />
                  <p className="text-xs font-bold">Correction Report submitted to admins!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitReport} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Reason for correction</label>
                    <select
                      value={reportReason}
                      onChange={(e) => setReportReason(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs font-bold text-slate-600 dark:text-slate-300 outline-none"
                    >
                      <option value="Wrong Answer">Wrong Answer Marked</option>
                      <option value="Ambiguous Question">Ambiguous Wording</option>
                      <option value="Incorrect Fact">Incorrect Fact Connection</option>
                      <option value="Typo">Typo / Grammatical error</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Provide details</label>
                    <textarea
                      value={reportText}
                      onChange={(e) => setReportText(e.target.value)}
                      placeholder="e.g. In option B, the launching year is stated wrong. In reality, GSLV Mark 3 was commissioned in 2017..."
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs outline-none focus:border-indigo-600 transition"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-extrabold text-white rounded-lg py-2.5 transition flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <Send className="h-3.5 w-3.5" /> Submit Report
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active quiz screen
  const currentQ = questions[activeIdx];
  const totalQs = questions.length;
  const progressPercent = Math.round(((activeIdx + 1) / totalQs) * 100);

  const rapidRevealed = !!rapidFeedback[currentQ?.id];
  const rapidCorrect = selectedAnswers[currentQ?.id] === currentQ?.correctAnswer;

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
      {/* Quiz Header status */}
      <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl shadow-xs">
        <div className="space-y-0.5">
          <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-[9px] font-extrabold text-slate-500 dark:text-slate-300 uppercase tracking-wide">
            Mode: {config.mode}
          </span>
          <p className="text-xs text-slate-400 font-bold uppercase">Question {activeIdx + 1} of {totalQs}</p>
        </div>

        {/* Countdown Timer */}
        {config.timerSeconds > 0 && (
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/20 px-3.5 py-2 rounded-lg border border-indigo-100 dark:border-indigo-950/50">
            <Clock className="h-4.5 w-4.5 animate-pulse" />
            <span className="text-xs font-extrabold tracking-wide">{formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-200 dark:bg-slate-850 h-2 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
      </div>

      {/* Main Question Sheet card */}
      {currentQ && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2">
            NDA PRACTICE TEST QUESTION
          </h3>

          <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-relaxed">
            {currentQ.question}
          </h4>

          {/* MCQ Options List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {['A', 'B', 'C', 'D'].map((opt) => {
              const optField = `option${opt}` as keyof Question;
              const optText = currentQ[optField] as string;
              const isSelected = selectedAnswers[currentQ.id] === opt;
              const isCorrectAnswer = currentQ.correctAnswer === opt;

              let styleClasses = "border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-900/60";

              if (config.mode === 'rapid-fire' && rapidRevealed) {
                if (isCorrectAnswer) {
                  styleClasses = "bg-emerald-50 border-emerald-500 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400";
                } else if (isSelected) {
                  styleClasses = "bg-rose-50 border-rose-500 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400";
                } else {
                  styleClasses = "border border-slate-100 dark:border-slate-800 bg-slate-50 text-slate-400 dark:bg-slate-950";
                }
              } else if (isSelected) {
                styleClasses = "bg-indigo-600 border-indigo-500 text-white font-black";
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectOption(currentQ.id, opt)}
                  disabled={config.mode === 'rapid-fire' && rapidRevealed}
                  className={`w-full text-left p-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${styleClasses}`}
                >
                  {opt}. {optText}
                </button>
              );
            })}
          </div>

          {/* Rapid-Fire Immediate explanation box */}
          {config.mode === 'rapid-fire' && rapidRevealed && (
            <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-100 dark:border-slate-900/60 space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[10px]">
                {rapidCorrect ? (
                  <span className="text-emerald-500 flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" /> Correct Answer
                  </span>
                ) : (
                  <span className="text-rose-500 flex items-center gap-1">
                    <XCircle className="h-4 w-4" /> Incorrect Answer
                  </span>
                )}
              </div>
              <p className="text-slate-600 dark:text-slate-300 font-medium">
                {currentQ.explanation}
              </p>
            </div>
          )}

          {/* Control navigation Footer */}
          <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850 pt-4 mt-6">
            <button
              onClick={() => setActiveIdx(prev => Math.max(0, prev - 1))}
              disabled={activeIdx === 0}
              className="flex items-center gap-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-800 disabled:opacity-30 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>

            {activeIdx < totalQs - 1 ? (
              <button
                onClick={() => setActiveIdx(prev => prev + 1)}
                disabled={config.mode === 'rapid-fire' && !rapidRevealed}
                className="flex items-center gap-1 bg-slate-800 hover:bg-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-white px-4 py-2 rounded-lg transition-all"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={submitQuiz}
                disabled={submitting || (config.mode === 'rapid-fire' && !rapidRevealed)}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-xs font-extrabold text-white px-6 py-2.5 rounded-xl shadow-lg transition-all"
              >
                {submitting ? 'Submitting...' : 'Finish & Submit Score'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default QuizActive;
