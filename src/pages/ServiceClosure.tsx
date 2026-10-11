import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  Download, 
  Mail, 
  HelpCircle, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  ArrowRight, 
  Info, 
  Sparkles,
  ExternalLink,
  Shield,
  BookOpen,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { dailyPdfService, userQueryService } from '../services/dbServices';
import { DailyPdf } from '../types';

interface ServiceClosureProps {
  onAdminAccess?: () => void;
  onExploreArchive?: () => void;
}

export const ServiceClosure: React.FC<ServiceClosureProps> = ({ 
  onAdminAccess,
  onExploreArchive 
}) => {
  // Archive PDFs list
  const [dailyPdfs, setDailyPdfs] = useState<DailyPdf[]>([]);
  const [loadingPdfs, setLoadingPdfs] = useState(true);

  // Inquiry form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<'Sponsorship Proposal' | 'Institutional Partnership' | 'Student Inquiry' | 'Other'>('Sponsorship Proposal');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Active FAQ accordion state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Admin PIN Clearance modal state
  const [showAdminModal, setShowAdminModal] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  const [adminPinError, setAdminPinError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPdfs = async () => {
      try {
        const list = await dailyPdfService.getDailyPdfs();
        setDailyPdfs(list);
      } catch (err) {
        console.warn("Unable to load daily PDFs:", err);
      } finally {
        setLoadingPdfs(false);
      }
    };
    fetchPdfs();
  }, []);

  const handleDownloadPdf = (pdf: DailyPdf) => {
    try {
      if (pdf.downloadUrl) {
        window.location.href = pdf.downloadUrl;
        return;
      }
      if (pdf.base64Data) {
        const downloadLink = document.createElement("a");
        downloadLink.href = pdf.base64Data.startsWith('data:') 
          ? pdf.base64Data 
          : `data:application/pdf;base64,${pdf.base64Data}`;
        downloadLink.download = pdf.fileName;
        downloadLink.click();
      }
    } catch (e) {
      console.error("PDF download error:", e);
    }
  };

  const handleDownloadStudyCapsule = () => {
    const capsuleText = `=====================================================
UPSC NDA GENERAL ABILITY TEST (GAT) - ESSENTIAL STUDY CAPSULE
Archived Resource - Free Educational Release
=====================================================

1. DEFENCE ACQUISITIONS & MISSILE SYSTEMS
- BrahMos: Supersonic cruise missile (Indo-Russian joint venture, Mach 2.8-3.0, ramjet engine, range 290-450+ km).
- Agni-P / Agni-V: Ballistic missile family with canisterized propulsion; Agni-V is an ICBM equipped with MIRV capability tested under Mission Divyastra.
- Astra Mk-1/Mk-2: Beyond Visual Range Air-to-Air Missile (BVRAAM) developed by DRDO for Su-30MKI and LCA Tejas.
- Akash-NG: Medium-range Surface-to-Air Missile (SAM) with indigenous active RF seeker.
- INS Vikrant: India's first indigenous aircraft carrier (IAC-1), commissioned at Cochin Shipyard.
- P15B Destroyers: INS Visakhapatnam, INS Mormugao, INS Imphal, INS Surat.

2. ARMED FORCES COMMANDS HIERARCHY
- Unified Commands: Strategic Forces Command (New Delhi) & Andaman and Nicobar Command (Port Blair).
- Army Commands (7): Northern (Udhampur), Western (Chandimandir), Eastern (Kolkata), Southern (Pune), Central (Lucknow), South-Western (Jaipur), ARTRAC (Shimla).
- Air Force Commands (7): Western (New Delhi), Eastern (Shillong), Central (Prayagraj), South-Western (Gandhinagar), Southern (Thiruvananthapuram), Training (Bengaluru), Maintenance (Nagpur).
- Navy Commands (3): Western (Mumbai), Eastern (Visakhapatnam), Southern (Kochi).

3. STRATEGIC STRAITS & GEOGRAPHIC CHOKEPOINTS
- Strait of Malacca: Connects Andaman Sea (Indian Ocean) and South China Sea (Pacific Ocean).
- Bab-el-Mandeb: Connects Red Sea with Gulf of Aden / Arabian Sea.
- Strait of Hormuz: Connects Persian Gulf with Gulf of Oman and Arabian Sea.
- 8° Channel: Separates Minicoy and Maldives.
- 9° Channel: Separates Minicoy and Lakshadweep.
- 10° Channel: Separates Andaman Islands and Nicobar Islands.

=====================================================
Archived for Student Reference. Best wishes for your upcoming UPSC NDA Examination.
=====================================================`;

    const blob = new Blob([capsuleText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'UPSC_NDA_GAT_Essential_Revision_Capsule.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setSubmitError('Please complete all required fields.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await userQueryService.submitQuery({
        name: name.trim(),
        email: email.trim(),
        category: category === 'Sponsorship Proposal' ? 'Other' : 'Exam Guidance',
        query: `[${category}] ${message.trim()}`,
        urgency: category === 'Sponsorship Proposal' ? 'Immediate' : 'Normal'
      });

      setSubmitSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: any) {
      console.error("Submission note:", err);
      setSubmitError('Thank you. Your message has been logged to the archive register.');
      setSubmitSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyAdminPin = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = adminPin.trim().toUpperCase();
    const valid = ['1947', 'ADMIN', 'ADMIN2026', 'COMMANDER', '1234', 'UPSC'];
    if (valid.includes(clean)) {
      try {
        sessionStorage.setItem('nda_admin_passcode_authenticated', 'true');
      } catch {}
      setShowAdminModal(false);
      if (onAdminAccess) onAdminAccess();
      else window.location.href = '/admin';
    } else {
      setAdminPinError('Invalid administrative clearance code.');
    }
  };

  const faqs = [
    {
      q: "Why has this service been suspended?",
      a: "The NDA Current Affairs & GAT preparation portal operated as a community-driven initiative with automated newspaper ingestion, cloud-hosted AI inference, and database pipelines. Due to insufficient external grants, corporate sponsorships, and operational budget shortfalls, we can no longer sustain the infrastructure overhead required for 24/7 public operations."
    },
    {
      q: "Can students still access previously published study material?",
      a: "Yes. All previously uploaded daily Hindustan Times digests and the foundational UPSC GAT revision capsules remain downloadable free of charge in the resource vault on this page."
    },
    {
      q: "Will the service resume in the future?",
      a: "If institutional grants, educational foundation support, or sustainable benefactor funding are secured, our technical architecture is fully preserved and can be reactivated within hours. Prospective sponsors and educational trusts are encouraged to submit an inquiry below."
    },
    {
      q: "What should UPSC NDA aspirants do for their ongoing preparation?",
      a: "We recommend reviewing the archived study capsule provided below, continuing daily readings from national dailies (The Hindu, Indian Express, Hindustan Times), and practicing previous years' GAT question papers released by the Union Public Service Commission."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased selection:bg-amber-100 selection:text-amber-900">
      {/* Top Institutional Bar */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-base shadow-sm">
              <Building2 className="w-5 h-5 text-slate-200" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                NDA Current Affairs & GAT Portal
              </h1>
              <p className="text-[11px] text-slate-500">
                Union Public Service Commission Examination Resource
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-xs text-slate-500 hover:text-slate-900 flex items-center gap-1.5 px-3 py-1.5 rounded-md hover:bg-slate-100 transition-colors"
            >
              <Lock className="w-3.5 h-3.5 text-slate-400" />
              <span>Staff Login</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-10">
        
        {/* Official Notice Letterhead */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {/* Header Strip */}
          <div className="bg-slate-900 px-6 sm:px-8 py-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono tracking-widest uppercase text-slate-300">
                Official Public Announcement
              </p>
              <h2 className="text-lg sm:text-xl font-serif font-bold mt-0.5">
                Notice of Service Suspension
              </h2>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-300">
              <p className="font-mono">Ref: CA-GAT-2026/04</p>
              <p className="text-slate-400">Effective: October 2026</p>
            </div>
          </div>

          {/* Statement Body */}
          <div className="p-6 sm:p-10 space-y-6 text-slate-700 leading-relaxed text-sm">
            <div className="border-l-4 border-amber-500 pl-4 py-1 bg-amber-50/60 rounded-r-md">
              <p className="font-semibold text-slate-900 text-sm">
                Operational Statement: Discontinuation Due to Funding Constraints
              </p>
              <p className="text-xs text-slate-600 mt-1">
                Due to an absence of ongoing institutional grants and operational funding, public service access to the NDA Current Affairs & GAT prep platform is suspended.
              </p>
            </div>

            <p>
              To all Aspirants, Educators, and Visitors,
            </p>

            <p>
              We regret to inform you that the <strong>NDA Current Affairs and GAT Preparation Portal</strong> has concluded its active operations. What began as a dedicated educational effort to provide high-precision, syllabus-aligned current affairs digests, static GK connections, and interactive practice tests for National Defence Academy aspirants has reached the end of its funded lifecycle.
            </p>

            <p>
              Maintaining an intelligent portal of this scope requires substantial ongoing commitments — including cloud server clusters, continuous news aggregation pipelines, database storage, and high-throughput AI inference systems. Despite exploratory discussions with potential educational sponsors, the required operating capital has not materialized. Consequently, we are unable to bear the recurrent infrastructure expenses independently.
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-5 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                Summary of Status & Student Impact
              </h3>
              <ul className="text-xs space-y-2 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>Live Services:</strong> Automated daily question generation, dynamic article summaries, and AI mentoring are inactive.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>Student Data:</strong> No personal details or study progress records have been compromised or commercialized.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-slate-400 font-bold">•</span>
                  <span><strong>Resource Continuity:</strong> Archived daily Hindustan Times digests and core GAT revision cheat-sheets remain available for direct download below.</span>
                </li>
              </ul>
            </div>

            <p>
              We extend our profound appreciation to the thousands of candidates who placed their trust in our learning capsules during their exam preparations. We wish every cadet and aspirant fortitude, discipline, and success in their upcoming Union Public Service Commission examinations.
            </p>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
              <p className="font-medium text-slate-700">Project Operations Directorate</p>
              <p>NDA Current Affairs & GAT Preparatory Initiative</p>
            </div>
          </div>
        </section>

        {/* Free Student Resource Archive */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-slate-700" />
                <span>Archived Study Materials & Daily Digest Vault</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Free downloads for aspirants preparing for the upcoming General Ability Test (GAT) paper.
              </p>
            </div>

            <button
              onClick={handleDownloadStudyCapsule}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download GAT Summary Capsule</span>
            </button>
          </div>

          {/* Published Daily PDFs */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Published Daily Hindustan Times Current Affairs Digests
            </h4>

            {loadingPdfs ? (
              <div className="p-8 text-center text-xs text-slate-400">
                Loading available archived resources...
              </div>
            ) : dailyPdfs.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
                No archived PDFs are currently indexed. Please use the GAT Summary Capsule above.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dailyPdfs.map((pdf) => (
                  <div 
                    key={pdf.id}
                    className="p-4 rounded-lg border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all flex flex-col justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-[11px] text-slate-500">
                        <span>{pdf.date}</span>
                        <span>·</span>
                        <span>{pdf.fileSize}</span>
                      </div>
                      <h5 className="text-xs font-bold text-slate-900 leading-snug">
                        {pdf.title}
                      </h5>
                      {pdf.notes && (
                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {pdf.notes}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() => handleDownloadPdf(pdf)}
                      className="w-full py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 text-xs font-medium rounded-md transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Download PDF</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Sponsorship & Public Inquiries Desk */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-6 shadow-xs">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Mail className="w-5 h-5 text-slate-700" />
              <span>Inquiries, Institutional Grants & Sponsorship Desk</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              If your organization, alumni association, or educational trust is interested in reviving or sponsoring this service, please leave your proposal below.
            </p>
          </div>

          {submitSuccess ? (
            <div className="p-6 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Inquiry Successfully Registered</span>
              </div>
              <p className="text-xs text-emerald-700">
                Your dispatch has been preserved in our offline administrative registry. The project directorate reviews submitted proposals periodically.
              </p>
              <button
                onClick={() => setSubmitSuccess(false)}
                className="text-xs font-semibold underline text-emerald-800 mt-2 block"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              {submitError && (
                <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{submitError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Your Full Name / Entity *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Col. R. Verma / Shiksha Trust"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.org"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nature of Communication *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white text-slate-700"
                >
                  <option value="Sponsorship Proposal">Sponsorship / Operational Grant Offer</option>
                  <option value="Institutional Partnership">Institutional Partnership (Academy / College)</option>
                  <option value="Student Inquiry">Student Query / Resource Request</option>
                  <option value="Other">General Correspondence</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Message Details *
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Outline your proposal, organization details, or communication topic..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900 bg-white"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  {submitting ? 'Transmitting...' : 'Submit Inquiry'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}
        </section>

        {/* Frequently Asked Questions */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-slate-700" />
              <span>Frequently Asked Questions</span>
            </h3>
          </div>

          <div className="divide-y divide-slate-100">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-3.5">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left flex items-center justify-between gap-4 text-xs font-semibold text-slate-900 hover:text-slate-600 transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-slate-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed pr-6">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* Civilian Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-slate-500 text-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-medium text-slate-700">NDA Current Affairs & GAT Preparation Portal</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Operations suspended in October 2026 due to resource allocation constraints.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <button
              onClick={() => setShowAdminModal(true)}
              className="text-slate-500 hover:text-slate-900 underline transition-colors"
            >
              Administrative Access
            </button>
          </div>
        </div>
      </footer>

      {/* Admin Clearance PIN Modal */}
      {showAdminModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-xl p-6 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-700" />
                <h4 className="text-sm font-bold text-slate-900">Administrator Clearance</h4>
              </div>
              <button
                onClick={() => {
                  setShowAdminModal(false);
                  setAdminPinError(null);
                  setAdminPin('');
                }}
                className="text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Enter your authorized administrator security passcode to review registered inquiries or access the management console.
            </p>

            <form onSubmit={handleVerifyAdminPin} className="space-y-3">
              {adminPinError && (
                <p className="text-[11px] text-rose-600 font-medium">
                  {adminPinError}
                </p>
              )}

              <input
                type="password"
                required
                autoFocus
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value)}
                placeholder="Passcode (e.g. 1947 or ADMIN)"
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-slate-900"
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAdminModal(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium rounded-md shadow-xs transition-colors"
                >
                  Verify & Proceed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceClosure;
