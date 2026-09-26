import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  articleService, 
  questionService, 
  reportService, 
  sourceService, 
  auditService, 
  aiService 
} from '../services/dbServices';
import { seedSampleFirestoreData } from '../data/seedData';
import { CurrentAffair, Question, QuestionReport, AuditLog } from '../types';
import { 
  Lock, 
  FileText, 
  HelpCircle, 
  Flag, 
  Activity, 
  Plus, 
  Sparkles, 
  CheckCircle, 
  XCircle, 
  Play,
  Trash2,
  Edit,
  Save,
  Database
} from 'lucide-react';

export const Admin: React.FC = () => {
  const { userProfile } = useAuth();

  const [articles, setArticles] = useState<CurrentAffair[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reports, setReports] = useState<QuestionReport[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Tab management
  const [activeTab, setActiveTab] = useState<'articles' | 'create' | 'reports' | 'logs'>('articles');

  // New Article Form state driven by AI
  const [rawContent, setRawContent] = useState('');
  const [sourceName, setSourceName] = useState('Press Information Bureau (PIB)');
  const [sourceUrl, setSourceUrl] = useState('');
  const [processingAI, setProcessingAI] = useState(false);

  // Edited Article result state (Ready for edits and publication)
  const [aiResult, setAiResult] = useState<Partial<CurrentAffair> | null>(null);
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [pubArticles, allQuestions, allReports, allLogs] = await Promise.all([
          articleService.getPublishedArticles(),
          questionService.getAllQuestions(),
          reportService.getAllReports(),
          auditService.getAuditLogs()
        ]);
        setArticles(pubArticles || []);
        setQuestions(allQuestions || []);
        setReports(allReports || []);
        setAuditLogs(allLogs || []);
      } catch (err) {
        console.error("Admin loader error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, [activeTab]);

  // Seeder trigger helper
  const handleSeedDatabase = async () => {
    if (confirm("Would you like to seed the database with high-quality sample current affairs and GAT MCQs?")) {
      const res = await seedSampleFirestoreData();
      if (res) {
        alert("Success! Database seeded. Reloading statistics...");
        window.location.reload();
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

  if (userProfile?.role !== 'admin') {
    return (
      <div className="flex-1 p-8 text-center space-y-4 bg-slate-50 dark:bg-slate-950 min-h-screen flex flex-col justify-center items-center">
        <Lock className="h-10 w-10 text-rose-500" />
        <h2 className="text-base font-black">Restricted Administration Space</h2>
        <p className="text-xs text-slate-400">Only user profiles possessing administrative privileges can authorize connection to this panel.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight flex items-center gap-2">
            <Lock className="h-5 w-5 text-amber-500" /> Secure Admin Dashboard
          </h2>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
            Manage practice test sheets, ingest GAT news, and inspect corrections
          </p>
        </div>

        {/* Bulk action buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handleSeedDatabase}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-900 px-3.5 py-1.5 text-xs font-bold shadow-xs transition"
          >
            <Database className="h-4 w-4 text-indigo-500" /> Seed Sample GK Data
          </button>
        </div>
      </div>

      {/* Admin stats dashboard banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4.5 rounded-2xl flex items-center gap-3">
          <FileText className="h-5 w-5 text-blue-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Articles</p>
            <p className="text-base font-black">{articles.length} live</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4.5 rounded-2xl flex items-center gap-3">
          <HelpCircle className="h-5 w-5 text-purple-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Questions</p>
            <p className="text-base font-black">{questions.length} live</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4.5 rounded-2xl flex items-center gap-3">
          <Flag className="h-5 w-5 text-rose-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Correction Alerts</p>
            <p className="text-base font-black">{reports.filter(r => r.status === 'pending').length} pending</p>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 p-4.5 rounded-2xl flex items-center gap-3">
          <Activity className="h-5 w-5 text-emerald-500 shrink-0" />
          <div>
            <p className="text-[10px] text-slate-400 font-bold uppercase">Audit actions</p>
            <p className="text-base font-black">{auditLogs.length} events</p>
          </div>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-850 pb-2">
        <button 
          onClick={() => setActiveTab('articles')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'articles' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-850'
          }`}
        >
          News Database
        </button>
        <button 
          onClick={() => setActiveTab('create')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-1 ${
            activeTab === 'create' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-850'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" /> Ingest With AI
        </button>
        <button 
          onClick={() => setActiveTab('reports')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'reports' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-850'
          }`}
        >
          Correction Reports
        </button>
        <button 
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition ${
            activeTab === 'logs' ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950' : 'text-slate-500 hover:text-slate-850'
          }`}
        >
          Audit Logs
        </button>
      </div>

      {/* Content browser tab */}
      {activeTab === 'articles' && (
        <section className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Live articles</h3>
          
          {articles.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">
              <p className="text-xs text-slate-500 font-semibold">No news articles found in database. Ingest one with Gemini above!</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
              {articles.map((art) => (
                <div key={art.id} className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-850/20 transition">
                  <div className="space-y-1 pr-6 flex-1">
                    <p className="text-xs font-bold text-slate-850 dark:text-white line-clamp-1">{art.title}</p>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">{art.category} | Priority: {art.priority}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteArticle(art.id)}
                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20"
                    title="Delete article"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Ingestion pipeline AI creator tab */}
      {activeTab === 'create' && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left panel - raw input */}
          <form onSubmit={handleTriggerAIIngestion} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2">Ingestion Source Details</h3>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source Agency / Ministry</label>
              <input 
                type="text" 
                value={sourceName} 
                onChange={(e) => setSourceName(e.target.value)}
                placeholder="Press Information Bureau (PIB) / ISRO / DRDO"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs outline-none focus:border-indigo-600"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Source Citation Link URL</label>
              <input 
                type="text" 
                value={sourceUrl} 
                onChange={(e) => setSourceUrl(e.target.value)}
                placeholder="https://pib.gov.in/PressReleasePage.aspx?PRID=..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2 px-3 text-xs outline-none focus:border-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Raw press release text copy</label>
              <textarea 
                value={rawContent} 
                onChange={(e) => setRawContent(e.target.value)}
                placeholder="Paste the raw text details fetched from official sources..."
                rows={10}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3 text-xs outline-none focus:border-indigo-600 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={processingAI || !rawContent.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-extrabold text-white rounded-xl py-3 shadow-md flex items-center justify-center gap-1.5"
            >
              <Sparkles className="h-4 w-4 animate-spin" style={{ animationDuration: processingAI ? '1.5s' : '0s' }} />
              <span>{processingAI ? 'Generating Structured study content...' : 'Process with Gemini'}</span>
            </button>
          </form>

          {/* Right panel - AI processing structured package results ready for tweaks and publish */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2">Structured Study Capsule</h3>

            {aiResult ? (
              <div className="space-y-4 h-[420px] overflow-y-auto pr-2 scrollbar-thin">
                {/* Title edit */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Compiled title</label>
                  <input 
                    type="text" 
                    value={aiResult.title || ''} 
                    onChange={(e) => setAiResult(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-bold"
                  />
                </div>

                {/* category and priority dropdowns */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Category</label>
                    <input 
                      type="text" 
                      value={aiResult.category || ''} 
                      onChange={(e) => setAiResult(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-400 uppercase">Priority</label>
                    <select 
                      value={aiResult.priority || 'MEDIUM'} 
                      onChange={(e) => setAiResult(prev => ({ ...prev, priority: e.target.value as any }))}
                      className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-bold text-slate-500"
                    >
                      <option value="HIGH">HIGH</option>
                      <option value="MEDIUM">MEDIUM</option>
                      <option value="LOW">LOW</option>
                    </select>
                  </div>
                </div>

                {/* Summary edit */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Summary (2-3 sentences)</label>
                  <textarea 
                    value={aiResult.summary || ''} 
                    onChange={(e) => setAiResult(prev => ({ ...prev, summary: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-medium"
                  />
                </div>

                {/* NDA Angle */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Why It Matters For NDA</label>
                  <textarea 
                    value={aiResult.ndaRelevance || ''} 
                    onChange={(e) => setAiResult(prev => ({ ...prev, ndaRelevance: e.target.value }))}
                    rows={3}
                    className="w-full bg-indigo-50/20 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-900 rounded-lg p-2 text-xs font-medium"
                  />
                </div>

                {/* static gk */}
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-slate-400 uppercase">Static GK Connection</label>
                  <textarea 
                    value={aiResult.staticGK || ''} 
                    onChange={(e) => setAiResult(prev => ({ ...prev, staticGK: e.target.value }))}
                    rows={3}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-2 text-xs font-medium"
                  />
                </div>

                <button
                  onClick={handlePublishArticle}
                  disabled={publishing}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-xs font-extrabold text-white rounded-xl py-3 shadow-md flex items-center justify-center gap-1.5"
                >
                  <Save className="h-4 w-4" />
                  <span>{publishing ? 'Publishing...' : 'Approve & Publish Live'}</span>
                </button>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-slate-400 text-center p-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <Sparkles className="h-8 w-8 text-slate-300 mb-2" />
                <p className="text-xs font-semibold">Structured study factsheet will populate here automatically upon processed execution.</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Correction Reports Tab */}
      {activeTab === 'reports' && (
        <section className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Reports queue</h3>

          {reports.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">
              <p className="text-xs text-slate-500 font-semibold">No error correction alerts submitted by students.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <div key={r.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs space-y-3">
                  <div className="flex justify-between items-center border-b border-slate-50 dark:border-slate-850 pb-2">
                    <div className="space-y-0.5">
                      <span className="rounded bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400 px-2 py-0.5 text-[9px] font-bold uppercase">
                        Reason: {r.reason}
                      </span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Reported by: {r.userEmail}</p>
                    </div>

                    <span className={`text-[10px] font-black uppercase tracking-wider ${
                      r.status === 'pending' ? 'text-amber-500' : 'text-slate-400'
                    }`}>
                      {r.status}
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-700 dark:text-slate-350 leading-relaxed bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-100 dark:border-slate-900">
                    "{r.description}"
                  </p>

                  {r.status === 'pending' && (
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        onClick={() => handleResolveReport(r.id, 'resolved')}
                        className="rounded bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold text-white px-3 py-1 flex items-center gap-0.5 shadow-sm transition"
                      >
                        <CheckCircle className="h-3 w-3" /> Resolve Bug
                      </button>
                      <button
                        onClick={() => handleResolveReport(r.id, 'rejected')}
                        className="rounded border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-[10px] font-bold text-slate-500 px-3 py-1 transition"
                      >
                        <XCircle className="h-3 w-3" /> Dismiss
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Admin Audit log tab */}
      {activeTab === 'logs' && (
        <section className="space-y-4">
          <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">System Operations logs</h3>

          {auditLogs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-2xl text-center">
              <p className="text-xs text-slate-500 font-semibold">No operations logged yet.</p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 flex items-center justify-between text-xs leading-normal">
                  <div className="space-y-0.5">
                    <p className="font-extrabold text-slate-800 dark:text-slate-200">{log.action}</p>
                    <p className="text-[10px] text-slate-400">Target Object: {log.target} | Administrator: {log.adminUid}</p>
                  </div>

                  <span className="text-[10px] text-slate-400 font-bold shrink-0">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

    </div>
  );
};
export default Admin;
