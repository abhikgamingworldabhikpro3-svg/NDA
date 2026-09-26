import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, HelpCircle, Monitor } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed PWA, hide the button
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-all"
      >
        <Download className="w-3.5 h-3.5" />
        Install App
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-2 rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          Install on iOS
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-150">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Install on iPhone / iPad</h3>
                <button 
                  onClick={() => setShowIOSGuide(false)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
                1. Tap the <strong className="text-indigo-600 dark:text-indigo-400">Share</strong> button in your Safari browser toolbar (the square with an arrow pointing up).<br /><br />
                2. Scroll down and select <strong className="text-indigo-600 dark:text-indigo-400">Add to Home Screen</strong>.<br /><br />
                3. Tap <strong className="text-indigo-600 dark:text-indigo-400">Add</strong> to complete installation.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-700 shadow-md transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
export default PWAInstallButton;
