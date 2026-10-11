import React, { useEffect } from 'react';
import { 
  Building2, 
  Lock, 
  ShieldAlert, 
  AlertCircle, 
  Trash2, 
  FileX, 
  CheckCircle2, 
  HelpCircle,
  XCircle
} from 'lucide-react';
import { indexedDbPdf } from '../services/indexedDbPdf';

export const ServiceClosure: React.FC = () => {
  useEffect(() => {
    // Purge any stored client-side databases, files, and tokens
    indexedDbPdf.purgeAllData();
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans antialiased selection:bg-slate-300 selection:text-slate-900 flex flex-col justify-between">
      {/* Civilian Top Bar */}
      <header className="border-b border-slate-200 bg-white shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-serif font-bold text-base shadow-xs">
              <Building2 className="w-5 h-5 text-slate-200" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 leading-tight">
                NDA Educational Service & Portal
              </h1>
              <p className="text-[11px] text-slate-500">
                Union Public Service Commission Educational Initiative
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-md">
            <Lock className="w-3.5 h-3.5 text-rose-600" />
            <span>Admin Access Revoked</span>
          </div>
        </div>
      </header>

      {/* Main Body Notice */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-8 w-full">
        
        {/* Primary Decommission Card */}
        <section className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          {/* Header Strip */}
          <div className="bg-slate-900 px-6 sm:px-8 py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-[11px] font-mono tracking-widest uppercase text-slate-400">
                Notice of Permanent Decommissioning
              </p>
              <h2 className="text-xl sm:text-2xl font-serif font-bold mt-1 text-white">
                Service Permanently Closed
              </h2>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-300">
              <p className="font-mono">Ref: DECOMMISSION-FINAL-2026</p>
              <p className="text-slate-400">Status: Terminated & Purged</p>
            </div>
          </div>

          {/* Statement Content */}
          <div className="p-6 sm:p-10 space-y-6 text-slate-700 leading-relaxed text-sm">
            <div className="border-l-4 border-rose-500 pl-4 py-2 bg-rose-50/70 rounded-r-md space-y-1">
              <p className="font-bold text-rose-950 text-sm flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>All Operations Terminated · All Files Purged</span>
              </p>
              <p className="text-xs text-rose-800 leading-relaxed">
                In accordance with final decommissioning directives due to zero operational funding, this service has been fully closed. All backend processes, uploaded materials, and administrative entry points have been permanently removed.
              </p>
            </div>

            <p>
              This is an official notice to all visitors, previous users, and stakeholders that the <strong>NDA Current Affairs and GAT Preparation Portal</strong> has ceased all public and private operations.
            </p>

            {/* Key Action Verification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <FileX className="w-4 h-4 text-rose-600" />
                  <span>All Files Deleted</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All uploaded PDF newspapers, digests, database records, and server file systems have been completely wiped. No files remain on server storage or local caching layers.
                </p>
              </div>

              <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span>Administrative Access Terminated</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All administrative portals, staff consoles, clearance passcodes, and elevated management privileges have been revoked. No administrator can access or modify the platform.
                </p>
              </div>

              <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <CheckCircle2 className="w-4 h-4 text-slate-600" />
                  <span>Pipelines Deactivated</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  All real-time news indexing pipelines, AI question generators, and cloud background workers have been stopped and taken offline.
                </p>
              </div>

              <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-xs text-slate-900">
                  <Lock className="w-4 h-4 text-slate-600" />
                  <span>Privacy & Zero Data Retained</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  User profiles, contact registries, and candidate records have been discarded in compliance with complete project termination.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 pt-2">
              We express our gratitude to everyone who participated in this initiative during its active lifecycle. The project is now concluded in its entirety.
            </p>

            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-500 gap-2">
              <p className="font-medium text-slate-700">Project Operations Directorate</p>
              <p>Final Decommission Complete</p>
            </div>
          </div>
        </section>

      </main>

      {/* Civilian Footer */}
      <footer className="border-t border-slate-200 bg-white py-6 text-slate-500 text-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <p className="text-slate-600">
            NDA Educational Portal — Service Permanently Closed & Decommissioned
          </p>
          <p className="text-[11px] text-slate-400">
            All files deleted · All services offline · No administrative access
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ServiceClosure;
