import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Server, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  ShieldAlert, 
  Terminal, 
  Activity, 
  Radio, 
  Send, 
  CheckCircle2, 
  Mail, 
  Phone, 
  Lock, 
  ArrowRight,
  ExternalLink,
  Cpu,
  Flame,
  Shield,
  Zap,
  HelpCircle,
  Copy,
  Check
} from 'lucide-react';
import { userQueryService } from '../services/dbServices';
import { AdminMailboxModal } from '../components/AdminMailboxModal';

interface ServerDownProps {
  onRetry?: () => void;
  onAdminAccess?: () => void;
  onViewLaunch?: () => void;
}

export const ServerDown: React.FC<ServerDownProps> = ({ 
  onRetry, 
  onAdminAccess, 
  onViewLaunch 
}) => {
  // Target Launch & Recovery Date: October 14, 2026
  const targetDate = new Date('2026-10-14T00:00:00').getTime();

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
  }>({ days: 15, hours: 23, minutes: 48, seconds: 32 });

  // Military Clocks
  const [zuluTime, setZuluTime] = useState('');
  const [istTime, setIstTime] = useState('');

  // Diagnostic Ping Simulation State
  const [isPinging, setIsPinging] = useState(false);
  const [pingLogs, setPingLogs] = useState<string[]>([
    "[00:00:01] INITIATING TCP HANDSHAKE -> 10.240.0.1:443 ... TIMEOUT",
    "[00:00:02] PROBING DEFENCE CLUSTER EDGE GATEWAY ... NO RESPONSE",
    "[00:00:03] ERR_CONNECTION_REFUSED (HTTP 503 SERVICE UNAVAILABLE)",
    "[00:00:04] PRIMARY DATABASE CLUSTER LOCKED FOR CRITICAL OVERHAUL"
  ]);
  const [pingLatency, setPingLatency] = useState<string>('TIMEOUT (Offline)');

  // Emergency Message Form State
  const [cadetName, setCadetName] = useState('');
  const [cadetEmail, setCadetEmail] = useState('');
  const [emergencyQuery, setEmergencyQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Mailbox Drawer State
  const [showMailbox, setShowMailbox] = useState(false);
  const [receivedCount, setReceivedCount] = useState(0);

  const fetchMailCount = async () => {
    try {
      const list = await userQueryService.getUserQueries();
      setReceivedCount(list.length);
    } catch {
      // offline fallback
      try {
        const local = JSON.parse(localStorage.getItem('nda_offline_queries') || '[]');
        setReceivedCount(local.length);
      } catch {}
    }
  };

  useEffect(() => {
    fetchMailCount();
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }

      const d = new Date();
      setZuluTime(d.toISOString().slice(11, 19) + ' ZULU');
      setIstTime(d.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour12: false }) + ' IST');
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  // Run Simulated Network Diagnostic Reconnection Ping
  const handleRunDiagnosticPing = () => {
    setIsPinging(true);
    setPingLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] >> DISPATCHING ICMP ECHO PROBE TO DEFENCE CLUSTERS...`]);

    setTimeout(() => {
      setPingLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] >> NODE 1 (DELHI-NORTH): 503 UNAVAILABLE (PACKET LOSS 100%)`,
        `[${new Date().toLocaleTimeString()}] >> NODE 2 (KHARAKWASLA-HQ): DB IN REPAIR MODE // KERNEL 6.1.0-DEFENCE`,
        `[${new Date().toLocaleTimeString()}] >> RECONNECT STATUS: GATEWAY OFFLINE - MAINTENANCE IN PROGRESS`
      ]);
      setPingLatency('503 Service Unavailable');
      setIsPinging(false);
    }, 1800);
  };

  // Submit Emergency Inquiry even when server is down (persists to Firestore or LocalStorage queue)
  const handleSubmitEmergency = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cadetEmail.trim() || !emergencyQuery.trim()) return;

    setIsSubmitting(true);
    const newRecord = {
      name: cadetName.trim() || 'Aspirant (Server Outage Dispatch)',
      email: cadetEmail.trim(),
      category: 'Other' as const,
      urgency: 'Immediate' as const,
      query: `[SERVER DOWN REPORT] ${emergencyQuery.trim()}`,
      status: 'received' as const,
      createdAt: new Date().toISOString()
    };

    try {
      await userQueryService.submitQuery(newRecord);
    } catch {
      // Offline fallback queue
      try {
        const stored = JSON.parse(localStorage.getItem('nda_offline_queries') || '[]');
        stored.push({ ...newRecord, id: 'offline_' + Date.now() });
        localStorage.setItem('nda_offline_queries', JSON.stringify(stored));
      } catch {}
    } finally {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      setEmergencyQuery('');
      fetchMailCount();
    }
  };

  return (
    <div className="min-h-screen bg-[#070908] text-slate-100 font-sans flex flex-col relative overflow-x-hidden selection:bg-rose-500 selection:text-white">
      
      {/* Background Warning Mesh & Scanlines */}
      <div className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-rose-600 via-amber-500 to-rose-600 animate-pulse" />

      {/* Top Defcon Outage Strip */}
      <header className="border-b border-[#2a1719] bg-[#12090a]/90 backdrop-blur-md sticky top-0 z-40 px-4 sm:px-6 py-3 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center text-rose-400 relative">
            <WifiOff className="w-5 h-5 animate-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-black text-white uppercase tracking-wider">
                UPSC NDA Tactical Engine
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-rose-950 text-rose-300 border border-rose-600/60 uppercase">
                DEFCON 1 // SERVER OFFLINE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              HTTP 503 // ALL CLOUD GATEWAYS CURRENTLY DOWN
            </p>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowMailbox(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a0e10] hover:bg-[#251317] border border-rose-800/40 text-rose-300 text-xs font-bold transition cursor-pointer"
            title="Inspect received offline aspirant dispatches"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Cadet Mails ({receivedCount})</span>
          </button>

          {onAdminAccess && (
            <button
              onClick={onAdminAccess}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/80 border border-amber-500/40 text-amber-300 text-xs font-bold transition cursor-pointer"
              title="Admin Section (Secret Code Required)"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Access</span>
            </button>
          )}

          <button
            onClick={onRetry || (() => window.location.reload())}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-extrabold shadow-md transition cursor-pointer"
            title="Retry Connection"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Ping</span>
          </button>
        </div>
      </header>

      {/* Main Server Down Hero Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8 relative z-10">
        
        {/* Outage Status Card */}
        <div className="bg-[#12080a] border-2 border-rose-600/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-950/90 text-rose-300 border border-rose-500/50">
                <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
                <span>CRITICAL SYSTEM OUTAGE // CODE 503</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-none">
                Server is Down
              </h1>

              <p className="text-sm sm:text-base text-rose-200/90 font-medium leading-relaxed">
                The UPSC NDA General Ability Test (GAT) central application cluster is temporarily offline for emergency core infrastructure maintenance and database upgrades. Public portal access is currently halted.
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300 pt-2">
                <div className="bg-[#1c0d10] px-3 py-1.5 rounded-lg border border-rose-900/60 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-rose-400" />
                  <span>{istTime}</span>
                </div>
                <div className="bg-[#1c0d10] px-3 py-1.5 rounded-lg border border-rose-900/60 flex items-center gap-2">
                  <Radio className="w-3.5 h-3.5 text-amber-400" />
                  <span>{zuluTime}</span>
                </div>
                <div className="bg-[#1c0d10] px-3 py-1.5 rounded-lg border border-rose-900/60 text-rose-300">
                  INCIDENT REF: <strong className="text-white">INC-2026-OCT-GAT-991</strong>
                </div>
              </div>
            </div>

            {/* Huge 503 Military Beacon */}
            <div className="bg-[#1a0c0f] border border-rose-700/40 rounded-2xl p-6 text-center space-y-2 shrink-0 self-center sm:self-auto min-w-[200px]">
              <div className="text-5xl sm:text-6xl font-black font-mono tracking-tighter text-rose-500 drop-shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                503
              </div>
              <div className="text-[11px] font-mono font-bold text-rose-300 uppercase tracking-widest">
                SERVICE OFFLINE
              </div>
              <div className="pt-2">
                <span className="inline-block w-3 h-3 rounded-full bg-rose-500 animate-ping" />
              </div>
            </div>
          </div>

          {/* Recovery ETA Countdown Banner */}
          <div className="bg-[#1a0d10] border border-rose-900/70 rounded-2xl p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <span className="font-bold text-rose-300 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" /> Expected System Recovery & Official Launch ETA
              </span>
              <span className="font-mono text-slate-300">
                Target: 14 October 2026 // 0000 HRS IST
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
              <div className="bg-[#0e0708] border border-rose-950 p-2.5 sm:p-3 rounded-xl">
                <div className="text-xl sm:text-3xl font-black font-mono text-white">{timeLeft.days}</div>
                <div className="text-[10px] uppercase font-bold text-rose-400">Days</div>
              </div>
              <div className="bg-[#0e0708] border border-rose-950 p-2.5 sm:p-3 rounded-xl">
                <div className="text-xl sm:text-3xl font-black font-mono text-white">{timeLeft.hours}</div>
                <div className="text-[10px] uppercase font-bold text-rose-400">Hours</div>
              </div>
              <div className="bg-[#0e0708] border border-rose-950 p-2.5 sm:p-3 rounded-xl">
                <div className="text-xl sm:text-3xl font-black font-mono text-white">{timeLeft.minutes}</div>
                <div className="text-[10px] uppercase font-bold text-rose-400">Minutes</div>
              </div>
              <div className="bg-[#0e0708] border border-rose-950 p-2.5 sm:p-3 rounded-xl">
                <div className="text-xl sm:text-3xl font-black font-mono text-amber-400">{timeLeft.seconds}</div>
                <div className="text-[10px] uppercase font-bold text-amber-400">Seconds</div>
              </div>
            </div>
          </div>
        </div>

        {/* Two-Column Workstation: Diagnostics & Emergency Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left: Live Terminal Diagnostics */}
          <div className="bg-[#0c0f0d] border border-[#202e24] rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-[#1b2b1e] pb-3">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-emerald-400">
                  <Terminal className="w-4 h-4" />
                  <span>CLUSTER NETWORK DIAGNOSTICS</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Socket: OFFLINE
                </span>
              </div>

              {/* Terminal Logs Window */}
              <div className="mt-3 bg-[#050806] border border-[#142217] rounded-xl p-3 font-mono text-xs text-slate-300 space-y-1.5 h-48 overflow-y-auto">
                {pingLogs.map((log, i) => (
                  <div key={i} className={`leading-relaxed ${
                    log.includes('TIMEOUT') || log.includes('UNAVAILABLE') || log.includes('503') 
                      ? 'text-rose-400' 
                      : log.includes('PROBING') 
                      ? 'text-amber-300' 
                      : 'text-emerald-400'
                  }`}>
                    {log}
                  </div>
                ))}
              </div>

              <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Gateway Latency: <strong className="text-rose-400">{pingLatency}</strong></span>
                <span>Cluster Node: <strong className="text-slate-200">ND-DELHI-01</strong></span>
              </div>
            </div>

            <button
              onClick={handleRunDiagnosticPing}
              disabled={isPinging}
              className="mt-4 w-full py-2.5 bg-[#142418] hover:bg-[#1a3120] text-emerald-400 border border-emerald-600/30 rounded-xl text-xs font-bold uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isPinging ? 'animate-spin' : ''}`} />
              <span>{isPinging ? "Probing Cloud Edge Nodes..." : "Probe Gateway Handshake"}</span>
            </button>
          </div>

          {/* Right: Emergency Cadet Offline Dispatch Desk */}
          <div className="bg-[#0f1411] border border-[#223627] rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1d2f21] pb-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
                <Mail className="w-4 h-4" />
                <span>Emergency Cadet Dispatch</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                OFFLINE BUFFER ACTIVE
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Have an urgent question regarding syllabus, notes, or launch notifications? Send your query below; it will be prioritized immediately once the servers reboot.
            </p>

            {submittedSuccess ? (
              <div className="bg-[#122417] border border-emerald-500/40 rounded-xl p-4 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-white uppercase">Dispatch Queued Successfully</h4>
                <p className="text-[11px] text-slate-300">
                  Your message has been captured. Our officers will review and reply to your email.
                </p>
                <button
                  onClick={() => setSubmittedSuccess(false)}
                  className="mt-2 text-xs text-amber-400 hover:underline font-bold"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitEmergency} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={cadetName}
                    onChange={(e) => setCadetName(e.target.value)}
                    placeholder="Cadet / Aspirant Name"
                    className="w-full bg-[#080d09] border border-[#253928] focus:border-amber-500 text-slate-100 text-xs py-2 px-3 rounded-lg outline-none"
                  />
                  <input
                    type="email"
                    required
                    value={cadetEmail}
                    onChange={(e) => setCadetEmail(e.target.value)}
                    placeholder="Official Email Address *"
                    className="w-full bg-[#080d09] border border-[#253928] focus:border-amber-500 text-slate-100 text-xs py-2 px-3 rounded-lg outline-none"
                  />
                </div>

                <textarea
                  rows={3}
                  required
                  value={emergencyQuery}
                  onChange={(e) => setEmergencyQuery(e.target.value)}
                  placeholder="Describe your query, topic request, or technical notice..."
                  className="w-full bg-[#080d09] border border-[#253928] focus:border-amber-500 text-slate-100 text-xs p-3 rounded-lg outline-none"
                />

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? "Dispatching..." : "Transmit Emergency Dispatch"}</span>
                </button>
              </form>
            )}

            {/* Secure Transmission Status */}
            <div className="pt-2 border-t border-[#1a2b1d] flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>DIRECT ROUTING TO COMMAND INBOX</span>
              </span>
              <span className="text-amber-400/80 font-bold">256-BIT ENCRYPTED</span>
            </div>
          </div>
        </div>

        {/* Officer Emergency Control Bar */}
        <div className="bg-[#111812] border border-[#263a2a] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3 text-slate-300">
            <Shield className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <div className="font-bold text-white">Academy Staff & Officer Security Gateway</div>
              <div className="text-[11px] text-slate-400">Authorized personnel may enter the Admin Section using Commander Secret Code (e.g. 1947).</div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowMailbox(true)}
              className="px-3.5 py-2 bg-[#17251a] hover:bg-[#203324] border border-[#2b442f] text-slate-200 font-bold rounded-xl transition cursor-pointer"
            >
              Cadet Inbox ({receivedCount})
            </button>

            {onAdminAccess && (
              <button
                onClick={onAdminAccess}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold rounded-xl transition flex items-center gap-1.5 shadow-md cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Admin Section</span>
              </button>
            )}
          </div>
        </div>

      </main>

      {/* Admin Received Cadet Mails Drawer Modal */}
      <AdminMailboxModal 
        isOpen={showMailbox} 
        onClose={() => {
          setShowMailbox(false);
          fetchMailCount();
        }} 
      />

      {/* Outage Footer */}
      <footer className="border-t border-[#1e1315] bg-[#090506] text-slate-500 text-xs py-6 px-4 text-center mt-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <div>
            © 2026 UPSC NDA General Ability Test (GAT) Intelligence Engine. System Status: <strong>DOWN (503)</strong>
          </div>
          <div className="text-rose-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>INC-2026-OCT-GAT-991 // STANDBY PROTOCOL</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default ServerDown;
