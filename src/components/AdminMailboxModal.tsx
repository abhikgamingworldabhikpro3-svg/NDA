import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Send, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Search, 
  Filter, 
  Download, 
  RefreshCw, 
  Lock, 
  Unlock, 
  Shield, 
  User, 
  Phone, 
  AlertTriangle, 
  Sparkles, 
  ExternalLink, 
  Copy, 
  Check, 
  X, 
  Archive,
  Inbox,
  Radio,
  FileSpreadsheet
} from 'lucide-react';
import { userQueryService } from '../services/dbServices';
import { UserQuery } from '../types';

interface AdminMailboxModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminMailboxModal: React.FC<AdminMailboxModalProps> = ({ isOpen, onClose }) => {
  const [queries, setQueries] = useState<UserQuery[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'launch' | 'syllabus' | 'urgent' | 'unanswered'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'stats'>('inbox');

  // Commander PIN Gate (Default: 1947 or instant 1-click unlock)
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('nda_admin_mailbox_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);

  const fetchQueries = async () => {
    setLoading(true);
    try {
      const data = await userQueryService.getUserQueries();
      setQueries(data);
    } catch (err) {
      console.error("Failed to fetch queries:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && isUnlocked) {
      fetchQueries();
    }
  }, [isOpen, isUnlocked]);

  const handleUnlockWithPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPin = pinInput.trim();
    if (cleanPin === '1947' || cleanPin === 'COMMANDER' || cleanPin === 'admin' || cleanPin === '') {
      setIsUnlocked(true);
      try {
        sessionStorage.setItem('nda_admin_mailbox_unlocked', 'true');
      } catch {}
      setPinError(false);
      fetchQueries();
    } else {
      setPinError(true);
    }
  };

  const handleStatusChange = async (id: string, newStatus: 'received' | 'in-review' | 'answered') => {
    await userQueryService.updateQueryStatus(id, newStatus);
    setQueries(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to permanently delete this message record?")) {
      await userQueryService.deleteQuery(id);
      setQueries(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (queries.length === 0) {
      alert("No received messages to export yet.");
      return;
    }

    const headers = ["ID", "Name", "Email", "Category", "Urgency", "Status", "Query/Message", "Created At"];
    const rows = queries.map(q => [
      `"${q.id}"`,
      `"${(q.name || '').replace(/"/g, '""')}"`,
      `"${(q.email || '').replace(/"/g, '""')}"`,
      `"${(q.category || '').replace(/"/g, '""')}"`,
      `"${(q.urgency || 'Normal').replace(/"/g, '""')}"`,
      `"${(q.status || 'received').replace(/"/g, '""')}"`,
      `"${(q.query || '').replace(/"/g, '""')}"`,
      `"${q.createdAt || ''}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `UPSC_NDA_Received_Cadet_Mails_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isOpen) return null;

  // Filtered queries calculation
  const filteredQueries = queries.filter(q => {
    const matchesSearch = 
      (q.name && q.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.email && q.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.query && q.query.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (q.category && q.category.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (selectedFilter === 'launch') {
      return q.query?.toLowerCase().includes('launch') || q.query?.toLowerCase().includes('gate alert') || q.category === 'Exam Guidance';
    }
    if (selectedFilter === 'syllabus') {
      return q.category === 'Syllabus Topic Request' || q.category === 'Defense News Inquiry';
    }
    if (selectedFilter === 'urgent') {
      return q.urgency === 'Immediate' || q.urgency === 'High';
    }
    if (selectedFilter === 'unanswered') {
      return q.status === 'received' || q.status === 'in-review';
    }

    return true;
  });

  const countTotal = queries.length;
  const countLaunchAlerts = queries.filter(q => q.query?.toLowerCase().includes('launch') || q.query?.toLowerCase().includes('gate alert')).length;
  const countSyllabusRequests = queries.filter(q => q.category === 'Syllabus Topic Request').length;
  const countUrgent = queries.filter(q => q.urgency === 'Immediate' || q.urgency === 'High').length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#0e1610] border border-[#2a3e2e] rounded-2xl max-w-5xl w-full h-[92vh] max-h-[850px] flex flex-col shadow-2xl overflow-hidden font-sans text-slate-100 relative">
        
        {/* Top Header Bar */}
        <div className="p-4 sm:p-5 border-b border-[#223525] bg-[#09100a] flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black uppercase tracking-wide text-white">
                  Cadet Intelligence Mailbox
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 border border-amber-500/40 text-amber-300">
                  DEFCON DISPATCH DESK
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Live stream of all received emails, topic requests, priority launch passes & cadet inquiries.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchQueries}
              disabled={loading || !isUnlocked}
              title="Refresh Mailbox Feed"
              className="p-2 text-slate-400 hover:text-white bg-[#152217] hover:bg-[#1d2f20] border border-[#253928] rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            <button 
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-[#152217] hover:bg-[#1d2f20] border border-[#253928] transition-colors cursor-pointer"
              title="Close Mailbox Desk"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PIN UNLOCK SCREEN IF LOCKED */}
        {!isUnlocked ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-[#162419] border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-xl">
              <Lock className="w-8 h-8" />
            </div>

            <div className="space-y-2 max-w-md">
              <h4 className="text-xl font-bold uppercase text-white tracking-wide">
                Commander Security Clearance Required
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                This inbox contains private aspirant emails and strategic topic requests. Enter your PIN or click the instant commander access key to proceed.
              </p>
            </div>

            <form onSubmit={handleUnlockWithPin} className="max-w-xs w-full space-y-3">
              <div>
                <input
                  type="password"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  placeholder="Enter PIN (Default: 1947)"
                  className="w-full bg-[#070c08] border border-[#2a3e2e] focus:border-amber-500 text-center text-slate-100 text-sm py-2.5 px-4 rounded-xl outline-none tracking-widest font-mono"
                  autoFocus
                />
                {pinError && (
                  <p className="text-rose-400 text-[11px] mt-1 font-bold">
                    Incorrect PIN. Use 1947 or click Instant Unlock.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Unlock Mailbox Console</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsUnlocked(true);
                  try {
                    sessionStorage.setItem('nda_admin_mailbox_unlocked', 'true');
                  } catch {}
                  fetchQueries();
                }}
                className="w-full py-2 bg-[#142016] hover:bg-[#1a2b1d] text-amber-400 border border-amber-600/30 text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                ⚡ Instant 1-Click Commander Pass
              </button>
            </form>
          </div>
        ) : (
          /* MAIN MAILBOX WORKSPACE */
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Telemetry Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 sm:px-5 bg-[#09100a] border-b border-[#223525] shrink-0 text-xs">
              <div className="bg-[#111c13] border border-[#233827] rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Total Received</div>
                  <div className="text-lg font-mono font-black text-amber-400">{countTotal} Mails</div>
                </div>
                <Inbox className="w-5 h-5 text-amber-400/60" />
              </div>

              <div className="bg-[#111c13] border border-[#233827] rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Launch Alerts</div>
                  <div className="text-lg font-mono font-black text-emerald-400">{countLaunchAlerts} Cadets</div>
                </div>
                <Radio className="w-5 h-5 text-emerald-400/60" />
              </div>

              <div className="bg-[#111c13] border border-[#233827] rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Topic Requests</div>
                  <div className="text-lg font-mono font-black text-sky-400">{countSyllabusRequests} Topics</div>
                </div>
                <Sparkles className="w-5 h-5 text-sky-400/60" />
              </div>

              <div className="bg-[#111c13] border border-[#233827] rounded-lg p-2.5 flex items-center justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Urgent Priority</div>
                  <div className="text-lg font-mono font-black text-rose-400">{countUrgent} High</div>
                </div>
                <AlertTriangle className="w-5 h-5 text-rose-400/60" />
              </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="p-3 sm:px-5 border-b border-[#223525] bg-[#0c140e] flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
              
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by cadet name, email or topic..."
                  className="w-full bg-[#142016] border border-[#273d2b] focus:border-amber-500 text-slate-100 text-xs pl-9 pr-3 py-2 rounded-lg outline-none"
                />
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                    selectedFilter === 'all'
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#152217] text-slate-400 hover:text-white border border-[#253928]'
                  }`}
                >
                  All ({queries.length})
                </button>

                <button
                  onClick={() => setSelectedFilter('launch')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                    selectedFilter === 'launch'
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#152217] text-slate-400 hover:text-white border border-[#253928]'
                  }`}
                >
                  Launch VIP Alerts
                </button>

                <button
                  onClick={() => setSelectedFilter('syllabus')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                    selectedFilter === 'syllabus'
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#152217] text-slate-400 hover:text-white border border-[#253928]'
                  }`}
                >
                  Topic Requests
                </button>

                <button
                  onClick={() => setSelectedFilter('urgent')}
                  className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer shrink-0 ${
                    selectedFilter === 'urgent'
                      ? 'bg-amber-500 text-black'
                      : 'bg-[#152217] text-slate-400 hover:text-white border border-[#253928]'
                  }`}
                >
                  Urgent ({countUrgent})
                </button>

                {/* Export to CSV Button */}
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ml-auto shrink-0 shadow"
                  title="Download all received emails & inquiries into CSV spreadsheet"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Export CSV</span>
                </button>
              </div>

            </div>

            {/* MESSAGE LIST VIEW */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-5 space-y-3">
              {loading && queries.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3 text-slate-400">
                  <RefreshCw className="w-8 h-8 animate-spin text-amber-400" />
                  <p className="text-xs font-bold uppercase tracking-wider">Accessing Tactical Datastore...</p>
                </div>
              ) : filteredQueries.length === 0 ? (
                <div className="py-20 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-[#152217] border border-[#253928] flex items-center justify-center text-slate-500">
                    <Inbox className="w-6 h-6" />
                  </div>
                  <div className="text-sm font-bold text-slate-300">
                    {searchQuery ? "No messages match your search criteria" : "No received cadet dispatches yet"}
                  </div>
                  <p className="text-xs text-slate-500 max-w-sm">
                    {searchQuery ? "Try searching for a different keyword, name, or email address." : "Submissions from the 'Cadet Topic Request' desk and 'VIP Launch Gate Alert' form will appear here live in real-time."}
                  </p>
                </div>
              ) : (
                filteredQueries.map((q) => {
                  const isLaunchAlert = q.query?.toLowerCase().includes('launch') || q.query?.toLowerCase().includes('gate alert');
                  const dateFormatted = q.createdAt ? new Date(q.createdAt).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Recent';

                  return (
                    <div 
                      key={q.id}
                      className={`rounded-xl border transition-all p-4 sm:p-5 space-y-3 shadow-md ${
                        q.status === 'answered'
                          ? 'bg-[#0a110c]/80 border-[#1c2e20] opacity-80'
                          : isLaunchAlert
                          ? 'bg-[#101b12] border-emerald-500/30 hover:border-emerald-500/60'
                          : 'bg-[#121d15] border-[#29402e] hover:border-amber-500/50'
                      }`}
                    >
                      {/* Top Row: Sender Info & Badges */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f3223] pb-3">
                        <div className="flex items-start sm:items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isLaunchAlert 
                              ? 'bg-emerald-950 border border-emerald-500/50 text-emerald-400' 
                              : 'bg-amber-950 border border-amber-500/50 text-amber-400'
                          }`}>
                            {q.name ? q.name.slice(0, 2).toUpperCase() : 'CD'}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-white text-sm">
                                {q.name || 'Anonymous Cadet'}
                              </span>
                              
                              {/* Category Badge */}
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                isLaunchAlert
                                  ? 'bg-emerald-900/60 border border-emerald-500/40 text-emerald-300'
                                  : 'bg-amber-900/60 border border-amber-500/40 text-amber-300'
                              }`}>
                                {isLaunchAlert ? '🚀 VIP Launch Alert' : q.category || 'Topic Request'}
                              </span>

                              {/* Urgency Badge */}
                              {q.urgency && q.urgency !== 'Normal' && (
                                <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
                                  q.urgency === 'Immediate'
                                    ? 'bg-rose-950 border border-rose-500/60 text-rose-300 animate-pulse'
                                    : 'bg-amber-950 border border-amber-600/60 text-amber-300'
                                }`}>
                                  {q.urgency}
                                </span>
                              )}
                            </div>

                            {/* Email & Contact Details */}
                            <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                              <span className="text-slate-200 font-mono font-medium flex items-center gap-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                {q.email}
                              </span>

                              <button
                                onClick={() => handleCopy(q.email, q.id + '_email')}
                                className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-[#18281b] px-1.5 py-0.5 rounded cursor-pointer"
                                title="Copy Email Address"
                              >
                                {copiedId === q.id + '_email' ? (
                                  <>
                                    <Check className="w-3 h-3 text-emerald-400" />
                                    <span className="text-emerald-400">Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3 h-3" />
                                    <span>Copy</span>
                                  </>
                                )}
                              </button>

                              <a
                                href={`mailto:${q.email}?subject=RE: UPSC NDA GAT Operations - ${encodeURIComponent(q.category || 'Inquiry')}`}
                                className="text-[10px] text-sky-400 hover:text-sky-300 flex items-center gap-1 bg-[#18281b] px-1.5 py-0.5 rounded"
                                title="Open Email Client to Reply"
                              >
                                <Send className="w-3 h-3" />
                                <span>Reply</span>
                              </a>
                            </div>
                          </div>
                        </div>

                        {/* Timestamp & Status Badge */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs text-slate-400 font-mono">
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {dateFormatted}
                          </span>

                          <div className="mt-1 flex items-center gap-1.5">
                            <span className="text-[10px] uppercase font-bold text-slate-500">Status:</span>
                            <select
                              value={q.status || 'received'}
                              onChange={(e) => handleStatusChange(q.id, e.target.value as any)}
                              className="bg-[#17251a] border border-[#2a3e2e] focus:border-amber-500 text-slate-200 text-[10px] font-bold uppercase rounded px-1.5 py-0.5 outline-none cursor-pointer"
                            >
                              <option value="received">📥 Received</option>
                              <option value="in-review">⏳ In Review</option>
                              <option value="answered">✅ Answered</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Message / Query Content Body */}
                      <div className="bg-[#0b120c] border border-[#1b2b1e] rounded-lg p-3.5 space-y-1.5">
                        <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center justify-between">
                          <span>Received Message / Inquiry Payload:</span>
                          <button
                            onClick={() => handleCopy(q.query, q.id + '_query')}
                            className="text-slate-400 hover:text-amber-400 text-[10px] flex items-center gap-1 cursor-pointer"
                          >
                            {copiedId === q.id + '_query' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>Copy Message</span>
                          </button>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal whitespace-pre-wrap">
                          {q.query}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                        <span className="text-[10px] font-mono text-slate-500">
                          ID: {q.id}
                        </span>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDelete(q.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 rounded transition-colors cursor-pointer"
                            title="Delete this received record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Footer Status Bar */}
            <div className="p-3 sm:px-5 border-t border-[#223525] bg-[#09100a] flex items-center justify-between text-xs text-slate-400 shrink-0">
              <div className="flex items-center gap-2 font-mono text-[11px]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Connected to Firebase Firestore [userQueries]</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setIsUnlocked(false);
                    try {
                      sessionStorage.removeItem('nda_admin_mailbox_unlocked');
                    } catch {}
                  }}
                  className="text-slate-400 hover:text-amber-400 text-xs font-bold uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>Lock Mailbox</span>
                </button>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
export default AdminMailboxModal;
