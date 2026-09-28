import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  articleService, 
  questionService, 
  reportService, 
  auditService, 
  aiService,
  userQueryService 
} from '../services/dbServices';
import { seedSampleFirestoreData } from '../data/seedData';
import { CurrentAffair, Question, QuestionReport, AuditLog, UserQuery } from '../types';
import { 
  Lock, 
  Unlock,
  Shield,
  FileText, 
  HelpCircle, 
  Flag, 
  Activity, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  Edit, 
  Save, 
  Database, 
  MessageSquare, 
  Clock, 
  User, 
  Mail, 
  Phone,
  ArrowLeft,
  KeyRound,
  ShieldAlert,
  AlertTriangle,
  RefreshCw,
  LogOut,
  Eye,
  EyeOff,
  Check
} from 'lucide-react';

interface AdminProps {
  onBack?: () => void;
}

export const Admin: React.FC<AdminProps> = ({ onBack }) => {
  const { userProfile } = useAuth();

  // Secret Code Clearance State (Persistent in session or user role admin)
  const [isAuthorized, setIsAuthorized] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('nda_admin_passcode_authenticated') === 'true' || userProfile?.role === 'admin';
    } catch {
      return false;
    }
  });

  const [secretCodeInput, setSecretCodeInput] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccess, setAuthSuccess] = useState(false);

  // Data states
  const [articles, setArticles] = useState<CurrentAffair[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [userQueries, setUserQueries] = useState<UserQuery[]>([]);
  const [loading, setLoading] = useState(false);

  // Tab management
  const [activeTab, setActiveTab] = useState<'articles' | 'create' | 'reports' | 'queries' | 'logs'>('articles');

  // New Article Form state driven by AI
  const [rawContent, setRawContent] = useState('');
  const [sourceName, setSourceName] = useState('Press Information Bureau (PIB)');
  const [sourceUrl, setSourceUrl] = useState('');
  const [processingAI, setProcessingAI] = useState(false);

  // Edited Article result state (Ready for edits and publication)
  const [aiResult, setAiResult] = useState<Partial<CurrentAffair> | null>(null);
  const [publishing, setPublishing] = useState(false);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [pubArticles, allQuestions, allReports, allLogs, allQueries] = await Promise.all([
        articleService.getPublishedArticles(),
        questionService.getAllQuestions(),
        reportService.getAllReports(),
        auditService.getAuditLogs(),
        userQueryService.getUserQueries()
      ]);
      setArticles(pubArticles || []);
      setQuestions(allQuestions || []);
      setReports(allReports || []);
      setAuditLogs(allLogs || []);
      setUserQueries(allQueries || []);
    } catch (err) {
      console.error("Admin loader error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthorized) {
      fetchAdminData();
    }
  }, [isAuthorized, activeTab]);

  // Handle Secret Code Verification
  const handleVerifySecretCode = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanCode = secretCodeInput.trim().toUpperCase();

    // Accepted Secret Codes
    const validCodes = ['1947', 'COMMANDER', 'ADMIN', 'ADMIN2026', 'UPSC2026', 'UPSC', 'AIRFORCE', 'ARMY', 'NAVY'];

    if (validCodes.includes(cleanCode)) {
      setAuthSuccess(true);
      setAuthError(null);
      setTimeout(() => {
        setIsAuthorized(true);
        try {
          sessionStorage.setItem('nda_admin_passcode_authenticated', 'true');
        } catch {}
      }, 500);
    } else {
      setAuthError('Incorrect Secret Code. Access denied. Enter valid Commander Clearance code (e.g. 1947).');
    }
  };

  // Instant Commander Unlock
  const handleInstantCommanderUnlock = () => {
    setAuthSuccess(true);
    setAuthError(null);
    setTimeout(() => {
      setIsAuthorized(true);
      try {
        sessionStorage.setItem('nda_admin_passcode_authenticated', 'true');
      } catch {}
    }, 400);
  };

  // Lock Console
  const handleLockConsole = () => {
    setIsAuthorized(false);
    setSecretCodeInput('');
    setAuthSuccess(false);
    try {
      sessionStorage.removeItem('nda_admin_passcode_authenticated');
    } catch {}
  };

  // Seeder trigger helper
  const handleSeedDatabase = async () => {
    if (confirm("Would you like to seed the database with high-quality sample current affairs and GAT MCQs?")) {
      const res = await seedSampleFirestoreData();
      if (res) {
        alert("Success! Database seeded. Reloading statistics...");
        fetchAdminData();
      } else {
        alert("Failed to seed database.");
      }
    }
  };

  // Trigger secure server-side Gemini analysis
  const handleTriggerAIIngestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawContent.trim()) return;
    setProcessingAI(true);
    try {
      const parsedData = await aiService.processArticleWithAI(rawContent, sourceName, sourceUrl);
      setAiResult({
        ...parsedData,
        id: 'art_' + Math.random().toString(36).substr(2, 9),
        sourceName,
        sourceUrl,
        publishedAt: new Date().toISOString(),
        status: 'published'
      });
    } catch (err: any) {
      alert(`Ingestion failed: ${err.message}`);
    } finally {
      setProcessingAI(false);
    }
  };

  const handlePublishArticle = async () => {
    if (!aiResult) return;
    setPublishing(true);
    try {
      const newArticle = {
        ...aiResult,
        createdAt: new Date().toISOString(),
      } as CurrentAffair;

      await articleService.createAdminArticle(newArticle);
      await auditService.logAdminAction("ARTICLE_PUBLISHED", newArticle.id, { title: newArticle.title });
      
      alert("Success! Article published live to student database.");
      setAiResult(null);
      setRawContent('');
      setActiveTab('articles');
      fetchAdminData();
    } catch (err) {
      console.error(err);
      alert("Failed to publish article.");
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteArticle = async (id: string) => {
    if (confirm("Are you sure you want to delete this article permanently?")) {
      try {
        await articleService.deleteAdminArticle(id);
        await auditService.logAdminAction("ARTICLE_DELETED", id);
        setArticles(prev => prev.filter(a => a.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleResolveReport = async (reportId: string, action: 'resolved' | 'rejected') => {
    try {
      await reportService.updateReportStatus(reportId, action);
      await auditService.logAdminAction(`REPORT_${action.toUpperCase()}`, reportId);
      setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: action } : r));
    } catch (err) {
      console.error(err);
    }
  };

  // ==========================================
  // SECRET CODE CLEARANCE GATE (ONLY ON ADMIN)
  // ==========================================
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[#070d08] text-slate-100 flex flex-col items-center justify-center p-4 sm:p-6 font-sans relative overflow-hidden">
        {/* Background Grid Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1b3320_1px,transparent_1px),linear-gradient(to_bottom,#1b3320_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Back navigation button if available */}
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-6 left-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#111e14] hover:bg-[#182b1d] border border-[#253e2a] text-xs font-bold text-slate-300 transition cursor-pointer z-10"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Return to Public Command Post</span>
          </button>
        )}

        {/* Clearance Card */}
        <div className="relative z-10 max-w-md w-full bg-[#0d160f] border border-[#243c29] rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
          {/* Header Icon */}
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#16281a] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl relative">
            <Lock className="w-8 h-8" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-500 animate-ping" />
          </div>

          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
              <Shield className="w-3 h-3 text-amber-400" />
              RESTRICTED OFFICER ZONE
            </div>
            <h2 className="text-xl sm:text-2xl font-black uppercase text-white tracking-wide">
              Admin Section Clearance
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
              Access to curriculum curation, live test generation, AI ingestion, and system logs requires authorized military administration clearance.
            </p>
          </div>

          {/* Secret Code Form */}
          <form onSubmit={handleVerifySecretCode} className="space-y-4 text-left">
            <div>
              <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" /> Secret Admin Code / PIN
                </span>
                <span className="text-[10px] font-mono text-amber-400/80 font-normal">Default: 1947</span>
              </label>

              <div className="relative">
                <input
                  type={showSecretCode ? 'text' : 'password'}
                  value={secretCodeInput}
                  onChange={(e) => {
                    setSecretCodeInput(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Enter secret code (e.g. 1947 or COMMANDER)"
                  className="w-full bg-[#070c08] border border-[#2a452f] focus:border-amber-500 text-slate-100 text-sm py-3 px-4 pr-10 rounded-xl outline-none tracking-widest font-mono transition-all"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowSecretCode(!showSecretCode)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 cursor-pointer"
                  title={showSecretCode ? "Hide Secret Code" : "Show Secret Code"}
                >
                  {showSecretCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="mt-2 p-2.5 rounded-lg bg-rose-950/60 border border-rose-600/40 text-rose-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              {authSuccess && (
                <div className="mt-2 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-600/40 text-emerald-300 text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>Clearance verified. Launching Admin HQ...</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={authSuccess}
              className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Unlock className="w-4 h-4" />
              <span>Authorize & Enter Admin Section</span>
            </button>

            <button
              type="button"
              onClick={handleInstantCommanderUnlock}
              disabled={authSuccess}
              className="w-full py-2.5 bg-[#142217] hover:bg-[#1a2d1e] text-amber-400 border border-amber-600/30 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>⚡ Authorized Commander 1-Click Pass</span>
            </button>
          </form>

          {/* Footer note */}
          <div className="pt-2 border-t border-[#1b3121] text-[11px] text-slate-400 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>National Defence Academy Admin Security Protocol</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHORIZED ADMIN DASHBOARD WORKSPACE
  // ==========================================
  return (
    <div className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 bg-slate-900 text-slate-100 min-h-screen pb-24 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#0a120c] border border-[#233827] p-4 sm:p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl sm:text-2xl font-black text-white leading-tight flex items-center gap-2">
              <Shield className="h-6 w-6 text-amber-400" /> NDA Command Admin Section
            </h2>
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40">
              CLEARANCE: VERIFIED
            </span>
          </div>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">
            Publish GAT News, Generate AI Questions, Review Reports & Manage Aspirant Inquiries
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 rounded-lg border border-[#2a452f] bg-[#122015] hover:bg-[#182d1c] px-3.5 py-2 text-xs font-bold text-slate-200 transition cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-amber-400" /> Public Portal
            </button>
          )}

          <button 
            onClick={handleSeedDatabase}
            className="flex items-center gap-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 px-3.5 py-2 text-xs font-bold transition cursor-pointer"
            title="Populate test articles and questions"
          >
            <Database className="h-4 w-4 text-amber-400" /> Seed Sample GK Data
          </button>

          <button 
            onClick={handleLockConsole}
            className="flex items-center gap-1.5 rounded-lg border border-rose-500/40 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 px-3.5 py-2 text-xs font-bold transition cursor-pointer"
            title="Lock the Admin Section"
          >
            <LogOut className="h-4 w-4 text-rose-400" /> Lock Admin Section
          </button>
        </div>
      </div>

      {/* Admin stats dashboard banner */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-[#111c13] border border-[#233827] p-4 rounded-2xl flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Articles</p>
            <p className="text-base font-black text-white">{articles.length} live</p>
          </div>
        </div>

        <div className="bg-[#111c13] border border-[#233827] p-4 rounded-2xl flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-purple-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Questions</p>
            <p className="text-base font-black text-white">{questions.length} live</p>
          </div>
        </div>

        <div className="bg-[#111c13] border border-[#233827] p-4 rounded-2xl flex items-center gap-3">
          <MessageSquare className="h-5 w-5 text-amber-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Desk Queries</p>
            <p className="text-base font-black text-amber-400">{userQueries.length} received</p>
          </div>
        </div>

        <div className="bg-[#111c13] border border-[#233827] p-4 rounded-2xl flex items-center gap-3">
          <Flag className="h-5 w-5 text-rose-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Alerts</p>
            <p className="text-base font-black text-rose-400">{reports.filter(r => r.status === 'pending').length} pending</p>
          </div>
        </div>

        <div className="bg-[#111c13] border border-[#233827] p-4 rounded-2xl flex items-center gap-3">
          <Activity className="h-5 w-5 text-emerald-400 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Audit logs</p>
            <p className="text-base font-black text-emerald-400">{auditLogs.length} events</p>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-[#233827] pb-2 overflow-x-auto">
        <button 
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${
            activeTab === 'articles' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white bg-[#111c13]'
          }`}
        >
          Articles Vault ({articles.length})
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'create' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white bg-[#111c13]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> Ingest with AI
        </button>
        <button 
          onClick={() => setActiveTab('queries')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'queries' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white bg-[#111c13]'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" /> Desk Queries ({userQueries.length})
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition shrink-0 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'reports' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white bg-[#111c13]'
          }`}
        >
          <Flag className="h-3.5 w-3.5" /> Correction Reports ({reports.length})
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition shrink-0 cursor-pointer ${
            activeTab === 'logs' ? 'bg-amber-500 text-black shadow-md' : 'text-slate-400 hover:text-white bg-[#111c13]'
          }`}
        >
          Audit History
        </button>
      </div>

      {/* Articles Management tab */}
      {activeTab === 'articles' && (
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Live GAT Articles</h3>
            <button
              onClick={() => setActiveTab('create')}
              className="rounded-lg bg-indigo-600 hover:bg-indigo-700 text-xs font-bold text-white px-3 py-1.5 flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" /> New Article
            </button>
          </div>

          <div className="bg-[#111c13] border border-[#233827] rounded-2xl overflow-hidden">
            {articles.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No current affairs articles found in Firestore. Click "Seed Sample GK Data" above to initialize.
              </div>
            ) : (
              <div className="divide-y divide-[#1c2e20]">
                {articles.map((art) => (
                  <div key={art.id} className="p-4 flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#192b1d] text-amber-400 border border-[#2d4d33]">
                          {art.category}
                        </span>
                        <h4 className="text-sm font-bold text-white truncate">{art.title}</h4>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{art.summary}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleDeleteArticle(art.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition cursor-pointer"
                        title="Delete article"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* AI Ingestion Tab */}
      {activeTab === 'create' && (
        <section className="space-y-4">
          <div className="bg-[#111c13] border border-[#233827] p-6 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wide">Automated AI Current Affairs Ingestion</h3>
            </div>
            <p className="text-xs text-slate-400">
              Paste raw news from PIB, The Hindu, or MoD releases. Gemini will extract syllabus-aligned key facts, bullet points, and NDA-style MCQs.
            </p>

            <form onSubmit={handleTriggerAIIngestion} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Source Name</label>
                  <input
                    type="text"
                    value={sourceName}
                    onChange={(e) => setSourceName(e.target.value)}
                    className="w-full bg-[#09100a] border border-[#233827] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Source URL (Optional)</label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://pib.gov.in/..."
                    className="w-full bg-[#09100a] border border-[#233827] rounded-lg px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Raw News Article Content</label>
                <textarea
                  rows={6}
                  value={rawContent}
                  onChange={(e) => setRawContent(e.target.value)}
                  placeholder="Paste government press release or defence bulletin text here..."
                  className="w-full bg-[#09100a] border border-[#233827] rounded-lg p-3 text-xs text-slate-100 outline-none focus:border-amber-500 font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={processingAI || !rawContent.trim()}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {processingAI ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                <span>{processingAI ? "AI Processing Ingestion..." : "Analyze & Generate Current Affair"}</span>
              </button>
            </form>

            {aiResult && (
              <div className="mt-6 p-4 rounded-xl bg-[#09100a] border border-amber-500/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-400 uppercase">Generated AI Draft</span>
                  <button
                    onClick={handlePublishArticle}
                    disabled={publishing}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition cursor-pointer"
                  >
                    {publishing ? "Publishing..." : "Publish Live to App"}
                  </button>
                </div>
                <h4 className="text-base font-black text-white">{aiResult.title}</h4>
                <p className="text-xs text-slate-300">{aiResult.summary}</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Desk Queries Tab */}
      {activeTab === 'queries' && (
        <section className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            Received Cadet Dispatches ({userQueries.length})
          </h3>
          <div className="bg-[#111c13] border border-[#233827] rounded-2xl overflow-hidden divide-y divide-[#1c2e20]">
            {userQueries.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No inquiries received yet.
              </div>
            ) : (
              userQueries.map((q) => (
                <div key={q.id} className="p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white">{q.name}</span>
                      <span className="text-[11px] text-slate-400 font-mono">({q.email})</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-600/30">
                        {q.category}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {q.createdAt ? new Date(q.createdAt).toLocaleString() : ''}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 bg-[#09100a] p-3 rounded-lg border border-[#1e3322]">
                    {q.query}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Reports Tab */}
      {activeTab === 'reports' && (
        <section className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            User Bug & Question Reports ({reports.length})
          </h3>
          <div className="bg-[#111c13] border border-[#233827] rounded-2xl overflow-hidden divide-y divide-[#1c2e20]">
            {reports.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No question error reports logged.
              </div>
            ) : (
              reports.map((r) => (
                <div key={r.id} className="p-4 flex items-center justify-between">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">{r.reason}</p>
                    <p className="text-xs text-slate-400">{r.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleResolveReport(r.id, 'resolved')}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded transition cursor-pointer"
                    >
                      Resolve
                    </button>
                    <button
                      onClick={() => handleResolveReport(r.id, 'rejected')}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded transition cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      )}

      {/* Audit Logs Tab */}
      {activeTab === 'logs' && (
        <section className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
            System Operation Audit Logs ({auditLogs.length})
          </h3>
          <div className="bg-[#111c13] border border-[#233827] rounded-2xl overflow-hidden divide-y divide-[#1c2e20]">
            {auditLogs.length === 0 ? (
              <div className="p-8 text-center text-slate-400 text-xs">
                No operations logged yet.
              </div>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-amber-400">{log.action}</span>
                    <span className="text-slate-400 ml-2">Target: {log.target}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      )}
    </div>
  );
};

export default Admin;
