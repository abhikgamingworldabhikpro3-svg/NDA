import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiService, articleService } from '../services/dbServices';
import { AIMessage } from '../types';
import { 
  Send, 
  Brain, 
  MessageSquare, 
  RefreshCw, 
  ShieldAlert, 
  Compass, 
  HelpCircle,
  Clock,
  Sparkles,
  ChevronRight,
  Shield
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';

interface AskAIProps {
  setPath: (path: string) => void;
  lang: LanguageCode;
}

export const AskAI: React.FC<AskAIProps> = ({ setPath, lang }) => {
  const { userProfile } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Suggested Prompts based on UPSC GAT syllabus
  const prompts = [
    {
      title: "Today's Key Affairs",
      prompt: "What are today's most important current affairs developments for NDA?",
      icon: Compass,
      color: "bg-blue-50 text-blue-500 hover:border-blue-300 dark:bg-blue-950/20"
    },
    {
      title: "Geopolitical Hotspot",
      prompt: "Explain a current international boundary or geopolitical dispute (like South China Sea or Red Sea) for NDA preparation.",
      icon: MessageSquare,
      color: "bg-emerald-50 text-emerald-500 hover:border-emerald-300 dark:bg-emerald-950/20"
    },
    {
      title: "Military Commands",
      prompt: "Give me a quick review cheatsheet on Indian Armed Forces Commands, locations, and flagship weapon systems.",
      icon: Shield,
      color: "bg-amber-50 text-amber-500 hover:border-amber-300 dark:bg-amber-950/20"
    },
    {
      title: "Space & Science Facts",
      prompt: "Test me with 5 difficult science & space MCQs based on recent global scientific missions.",
      icon: HelpCircle,
      color: "bg-purple-50 text-purple-500 hover:border-purple-300 dark:bg-purple-950/20"
    }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userQuery = textToSend;
    setQuery('');

    // Prepend user message
    const userMessage: AIMessage = {
      role: 'user',
      parts: [{ text: userQuery }]
    };
    setMessages(prev => [...prev, userMessage]);
    setLoading(true);

    try {
      // Load current articles into context for grounding if available, preventing hallucinated fabrications
      const recentArticles = await articleService.getPublishedArticles();
      const contextData = recentArticles.slice(0, 10).map(a => `Title: ${a.title}\nCategory: ${a.category}\nFacts: ${a.importantFacts?.join(', ')}\nNDA Relevance: ${a.ndaRelevance}\n`).join('\n---\n');

      const responseText = await aiService.askNdaAI(userQuery, messages, contextData);
      
      const modelMessage: AIMessage = {
        role: 'model',
        parts: [{ text: responseText }]
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: "GAT Coach is currently offline due to a connection timeout. Please retry in a few seconds." }]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([]);
    setQuery('');
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24 flex flex-col justify-between">
      
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
            {t('askAI')}
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            Your Personal GAT General Knowledge & Current Affairs Coach
          </p>
        </div>

        {messages.length > 0 && (
          <button 
            onClick={handleResetChat}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold transition shadow-xs"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Clear History
          </button>
        )}
      </div>

      {/* Main Conversation Window */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[520px]">
        
        {/* Chat Feed */}
        <div className="flex-grow overflow-y-auto p-5 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-6 max-w-lg mx-auto py-10">
              <div className="h-14 w-12 items-center justify-center bg-indigo-50 dark:bg-indigo-950/20 text-indigo-500 rounded-2xl flex relative animate-bounce">
                <Brain className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">Begin Interrogating Your GAT Coach</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-semibold">
                  Ask definitions of military treaties, weapon scopes, geographic locations, indices rankings, or ask for targeted practice quizzes.
                </p>
              </div>

              {/* Prompt Suggestion Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full pt-4">
                {prompts.map((p) => {
                  const PromptIcon = p.icon;
                  return (
                    <button
                      key={p.title}
                      onClick={() => handleSendPrompt(p.prompt)}
                      className={`text-left p-4 rounded-xl border border-slate-100 dark:border-slate-850/80 transition flex gap-3 cursor-pointer bg-slate-50 dark:bg-slate-950/50 ${p.color}`}
                    >
                      <PromptIcon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-black block">{p.title}</h4>
                        <p className="text-[10px] text-slate-400 font-semibold line-clamp-2 mt-0.5 leading-relaxed">{p.prompt}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div 
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`p-4.5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed max-w-[85%] whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-50 text-slate-800 dark:bg-slate-950 border border-slate-150 dark:border-slate-900 rounded-bl-none prose dark:prose-invert font-normal text-slate-600 dark:text-slate-300'
                  }`}>
                    {msg.parts[0].text}
                  </div>
                </div>
              ))}
              <div ref={scrollRef} />
            </div>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="p-4.5 rounded-2xl bg-slate-50 border border-slate-150 text-slate-400 dark:bg-slate-950 dark:border-slate-900 font-bold rounded-bl-none text-xs flex items-center gap-2 animate-pulse">
                <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" />
                <span>NDA AI is analyzing database, formulating static GK connection...</span>
              </div>
            </div>
          )}
        </div>

        {/* Query Input form footer */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendPrompt(query); }}
          className="border-t border-slate-150 dark:border-slate-850 p-4 bg-slate-50/50 dark:bg-slate-900/60 flex gap-3"
        >
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask NDA AI: e.g. What are DRDO's recent missile advancements?"
            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 text-xs sm:text-sm font-medium outline-none focus:border-indigo-600 transition"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800"
          >
            <Send className="h-4.5 w-4.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
export default AskAI;
