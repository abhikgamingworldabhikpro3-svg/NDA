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
  Shield,
  Copy,
  Check,
  Volume2,
  VolumeX,
  RotateCcw
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';

interface AskAIProps {
  setPath: (path: string) => void;
  lang: LanguageCode;
}

// Client-side Instant Knowledge Base for GAT Topics
function getClientGATGuidance(query: string): string {
  const q = query.toLowerCase();
  if (q.includes("missile") || q.includes("drdo") || q.includes("weapon") || q.includes("brahmos") || q.includes("agni")) {
    return `### 🛡️ GAT Defense Capsule: Indian Missile Systems & DRDO Arsenal
- **Agni Series**: Surface-to-Surface Ballistic Missiles (Agni-V with MIRV technology, ~5,000+ km range under *Mission Divyastra*).
- **Prithvi Series**: Tactical Surface-to-Surface short-range ballistic missile (Liquid propellant).
- **BrahMos**: Supersonic Cruise Missile (Indo-Russian joint venture, Mach 2.8–3.0, ramjet propulsion).
- **Akash-NG / SAM**: Surface-to-Air Missile system with indigenous active RF seeker (range ~25–30 km).
- **Astra Mk-1 / Mk-2**: Beyond Visual Range Air-to-Air Missile (BVRAAM) integrated on Su-30MKI and Tejas.

**NDA Exam Angle:**
UPSC frequently tests propulsion types (solid vs liquid), missile classifications (Cruise vs Ballistic), and designated testing grounds (ITR Chandipur, Abdul Kalam Island, Odisha).`;
  }
  if (q.includes("command") || q.includes("armed forces") || q.includes("army") || q.includes("navy") || q.includes("air force") || q.includes("rank")) {
    return `### 🎖️ Indian Armed Forces: Commands & Ranks Overview
- **Tri-Service Unified Commands**:
  1. Strategic Forces Command (SFC) - New Delhi
  2. Andaman & Nicobar Command (ANC) - Port Blair
- **Indian Army (7 Commands)**:
  - Eastern: Kolkata | Western: Chandimandir | Northern: Udhampur
  - Southern: Pune | Central: Lucknow | South-Western: Jaipur | ARTRAC: Shimla
- **Indian Air Force (7 Commands)**:
  - Western: New Delhi | Eastern: Shillong | Central: Prayagraj
  - South-Western: Gandhinagar | Southern: Thiruvananthapuram | Training: Bengaluru | Maintenance: Nagpur
- **Indian Navy (3 Commands)**:
  - Western: Mumbai | Eastern: Visakhapatnam | Southern (Training): Kochi

**NDA Exam Angle:**
Questions test command headquarters pairings, rank hierarchies, and the role of the Chief of Defence Staff (CDS).`;
  }
  if (q.includes("strait") || q.includes("boundary") || q.includes("sea") || q.includes("quad") || q.includes("malacca")) {
    return `### 🌍 Strategic Maritime Straits & Geopolitics for NDA GAT
- **Strait of Malacca**: Connects the Indian Ocean (Andaman Sea) with the Pacific Ocean (South China Sea). Flanked by Indonesia, Malaysia, and Singapore.
- **Bab-el-Mandeb**: Connects the Red Sea with the Gulf of Aden; vital gateway to the Suez Canal.
- **Strait of Hormuz**: Connects the Persian Gulf with the Gulf of Oman; crucial artery for 20% of global petroleum shipments.
- **Channels**: 8° Channel (Minicoy & Maldives), 9° Channel (Minicoy & Lakshadweep), 10° Channel (Andaman & Nicobar).

**NDA Exam Angle:**
Focus on littoral nations surrounding regional seas, maritime choke points, and QUAD / I2U2 multilateral frameworks.`;
  }
  return `### 📚 UPSC NDA General Ability Test (GAT) Exam Guide
- **Core Focus Areas**:
  1. **Defence & National Security**: Bilateral exercises (*Malabar, Varuna, Yudh Abhyas, Surya Kiran*), indigenous warships (INS Vikrant, P15B destroyers), and defense pacts.
  2. **Modern Indian History**: Freedom struggle, Gandhian movements, constitutional acts (1909, 1919, 1935), and INC sessions.
  3. **Physical & Indian Geography**: River systems, mountain passes, monsoons, ocean currents, and Ramsar wetland sites.
  4. **General Science**: Core Physics laws, chemical compounds, and human physiology.

Ask any specific defense, history, geography, or current affairs topic to generate deep insights or targeted MCQs!`;
}

export const AskAI: React.FC<AskAIProps> = ({ setPath, lang }) => {
  const { userProfile } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Suggested Prompts based on UPSC GAT syllabus
  const prompts = [
    {
      title: "Today's Key Affairs",
      prompt: "What are today's most critical defense & national security developments for UPSC NDA GAT?",
      icon: Compass,
      color: "bg-blue-50 text-blue-600 hover:border-blue-300 dark:bg-blue-950/20 dark:text-blue-400"
    },
    {
      title: "Geopolitical Disputes",
      prompt: "Explain the strategic importance of the Malacca Strait, Bab-el-Mandeb, and South China Sea for Indian maritime security.",
      icon: MessageSquare,
      color: "bg-emerald-50 text-emerald-600 hover:border-emerald-300 dark:bg-emerald-950/20 dark:text-emerald-400"
    },
    {
      title: "Armed Forces Commands",
      prompt: "Give me a quick review cheatsheet on Indian Armed Forces Commands, locations, and flagship missile systems (Agni, BrahMos, Astra).",
      icon: Shield,
      color: "bg-amber-50 text-amber-600 hover:border-amber-300 dark:bg-amber-950/20 dark:text-amber-400"
    },
    {
      title: "Targeted Mock MCQs",
      prompt: "Generate 5 high-yield UPSC NDA practice questions on recent science, space, and defense events with detailed explanations.",
      icon: HelpCircle,
      color: "bg-purple-50 text-purple-600 hover:border-purple-300 dark:bg-purple-950/20 dark:text-purple-400"
    }
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  const handleCopyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleSpeakText = (text: string, idx: number) => {
    if ('speechSynthesis' in window) {
      if (speakingIdx === idx) {
        window.speechSynthesis.cancel();
        setSpeakingIdx(null);
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_`]/g, ''));
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setSpeakingIdx(null);
      utterance.onerror = () => setSpeakingIdx(null);
      setSpeakingIdx(idx);
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSendPrompt = async (textToSend: string) => {
    if (!textToSend.trim()) return;
    
    const userQuery = textToSend.trim();
    setQuery('');
    setLastFailedQuery(null);

    // Prepend user message
    const userMessage: AIMessage = {
      role: 'user',
      parts: [{ text: userQuery }]
    };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setLoading(true);

    try {
      let contextData = '';
      try {
        const recentArticles = await articleService.getPublishedArticles();
        if (recentArticles && recentArticles.length > 0) {
          contextData = recentArticles.slice(0, 5).map(a => 
            `Title: ${a.title}\nCategory: ${a.category}\nFacts: ${(a.importantFacts || []).slice(0, 3).join(', ')}\nNDA Relevance: ${a.ndaRelevance || ''}\n`
          ).join('\n---\n');
        }
      } catch (e) {
        // Continue with empty context
      }

      let responseText = '';
      try {
        responseText = await aiService.askNdaAI(userQuery, messages, contextData);
      } catch (apiErr) {
        console.warn("API request fallback, rendering client knowledge engine:", apiErr);
        responseText = getClientGATGuidance(userQuery);
      }

      if (!responseText || !responseText.trim()) {
        responseText = getClientGATGuidance(userQuery);
      }

      const modelMessage: AIMessage = {
        role: 'model',
        parts: [{ text: responseText }]
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (err: any) {
      console.error("GAT Coach Handler Note:", err);
      const fallbackText = getClientGATGuidance(userQuery);
      setMessages(prev => [...prev, {
        role: 'model',
        parts: [{ text: fallbackText }]
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeakingIdx(null);
    setMessages([]);
    setQuery('');
    setLastFailedQuery(null);
  };

  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24 flex flex-col justify-between">
      
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
                {t('askAI')}
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live Active
              </span>
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
              Your UPSC NDA General Ability Test (GAT) Mentor
            </p>
          </div>
        </div>

        {messages.length > 0 && (
          <button 
            onClick={handleResetChat}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Clear Chat
          </button>
        )}
      </div>

      {/* Main Chat Frame */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[500px] h-[600px]">
        
        {/* Chat Messages Feed */}
        <div className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-800">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-5 max-w-xl mx-auto py-8">
              <div className="h-14 w-14 items-center justify-center bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex relative shadow-inner">
                <Brain className="h-7 w-7" />
              </div>
              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Ask Anything to Your GAT Coach</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  Interrogate missile specifications, international boundaries, military commands, constitutional articles, or request instant targeted mock quizzes.
                </p>
              </div>

              {/* Prompt Suggestion Chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
                {prompts.map((p) => {
                  const PromptIcon = p.icon;
                  return (
                    <button
                      key={p.title}
                      onClick={() => handleSendPrompt(p.prompt)}
                      className={`text-left p-3.5 rounded-xl border border-slate-200 dark:border-slate-800/80 transition-all hover:scale-[1.01] flex gap-3 cursor-pointer ${p.color}`}
                    >
                      <PromptIcon className="h-5 w-5 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold block">{p.title}</h4>
                        <p className="text-[11px] opacity-80 line-clamp-2 mt-0.5 leading-snug">{p.prompt}</p>
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
                  <div className={`p-4 sm:p-5 rounded-2xl text-xs sm:text-sm font-medium leading-relaxed max-w-[90%] sm:max-w-[82%] ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none shadow-sm'
                      : 'bg-slate-50 text-slate-800 dark:bg-slate-950 dark:text-slate-200 border border-slate-200 dark:border-slate-850 rounded-bl-none shadow-xs'
                  }`}>
                    <div className="whitespace-pre-wrap font-sans leading-relaxed">
                      {msg.parts[0].text}
                    </div>

                    {msg.role === 'model' && (
                      <div className="mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400">
                        <span className="font-bold tracking-wide uppercase text-[10px] text-indigo-500">NDA GAT Coach</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleSpeakText(msg.parts[0].text, idx)}
                            className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition flex items-center gap-1 cursor-pointer"
                            title="Read Aloud"
                          >
                            {speakingIdx === idx ? <VolumeX className="h-3.5 w-3.5 text-indigo-500 animate-pulse" /> : <Volume2 className="h-3.5 w-3.5" />}
                            <span>{speakingIdx === idx ? 'Stop' : 'Listen'}</span>
                          </button>
                          <button
                            onClick={() => handleCopyText(msg.parts[0].text, idx)}
                            className="p-1 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition flex items-center gap-1 cursor-pointer"
                            title="Copy Answer"
                          >
                            {copiedIdx === idx ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                            <span>{copiedIdx === idx ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {lastFailedQuery && (
                <div className="flex justify-center pt-2">
                  <button
                    onClick={() => handleSendPrompt(lastFailedQuery)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md transition cursor-pointer"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Retry Query: "{lastFailedQuery.substring(0, 30)}..."
                  </button>
                </div>
              )}

              <div ref={scrollRef} />
            </div>
          )}

          {loading && (
            <div className="flex justify-start">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300 font-bold rounded-bl-none text-xs flex items-center gap-2.5 animate-pulse">
                <Sparkles className="h-4 w-4 text-indigo-500 animate-spin" />
                <span>NDA AI is searching syllabus database, generating GAT exam connection...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSendPrompt(query); }}
          className="border-t border-slate-200 dark:border-slate-800 p-3 sm:p-4 bg-slate-50/80 dark:bg-slate-900/90 flex gap-2.5 items-center"
        >
          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask GAT Coach: e.g., Explain Indian Naval aircraft carriers and recent operations..."
            className="flex-1 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm font-medium outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition text-slate-800 dark:text-slate-100"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !query.trim()}
            className="p-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-md transition disabled:bg-slate-200 disabled:text-slate-400 dark:disabled:bg-slate-800 cursor-pointer disabled:cursor-not-allowed shrink-0"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
export default AskAI;
