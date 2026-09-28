import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Sidebar, MobileBottomNav } from './components/Navigation';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { ToastContainer, ToastMessage } from './components/Toast';

// Pages
import UnderConstruction from './pages/UnderConstruction';
import Launch from './pages/Launch';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import CurrentAffairs from './pages/CurrentAffairs';
import ArticleDetail from './pages/ArticleDetail';
import Quiz, { QuizConfig } from './pages/Quiz';
import QuizActive from './pages/QuizActive';
import Revision from './pages/Revision';
import Bookmarks from './pages/Bookmarks';
import Monthly from './pages/Monthly';
import AskAI from './pages/AskAI';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import Admin from './pages/Admin';

import { translations, LanguageCode } from './i18n/translations';
import { Compass, RefreshCw, Zap, ShieldAlert, Clock, ArrowRight } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { currentUser, userProfile, loading } = useAuth();
  const isOnline = useOnlineStatus();

  // Router Path State
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  
  // Translation Language State
  const [lang, setLang] = useState<LanguageCode>('en');

  // Theme Appearance State
  const [darkMode, setDarkMode] = useState(true);

  // Active Quiz Config State
  const [activeQuiz, setActiveQuiz] = useState<QuizConfig | null>(null);

  // Toast States
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Under Construction active till 14 Oct 2026
  const targetLaunchTimestamp = new Date('2026-10-14T00:00:00').getTime();
  const isUnderConstructionPeriod = new Date().getTime() < targetLaunchTimestamp;

  // Preview Mode flag so admins & testers can access the portal freely
  const [previewMode, setPreviewMode] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem('nda_preview_mode') === 'true';
    } catch {
      return false;
    }
  });

  // Track browser history navigation back/forward actions
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Update language when user profile successfully loads
  useEffect(() => {
    if (userProfile?.preferredLanguage) {
      setLang(userProfile.preferredLanguage);
    }
  }, [userProfile]);

  // Synchronize darkMode class on document element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const addToast = (type: 'success' | 'error' | 'info', text: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, { id, type, text }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  const enablePreviewAndEnter = () => {
    setPreviewMode(true);
    try {
      sessionStorage.setItem('nda_preview_mode', 'true');
    } catch {}
    if (currentUser) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  // Helper function to extract path parameters (like articleId from /current-affairs/art_123)
  const getRouteParam = (pathPattern: string, actualPath: string) => {
    const patternParts = pathPattern.split('/');
    const actualParts = actualPath.split('/');
    
    if (patternParts.length !== actualParts.length) return null;
    
    let param = '';
    for (let i = 0; i < patternParts.length; i++) {
      if (patternParts[i].startsWith(':')) {
        param = actualParts[i];
      } else if (patternParts[i] !== actualParts[i]) {
        return null;
      }
    }
    return param;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-center items-center space-y-4 font-sans">
        <RefreshCw className="h-8 w-8 text-indigo-500 animate-spin" />
        <p className="text-xs font-bold text-slate-400">Verifying secure student identity, establishing connection...</p>
      </div>
    );
  }

  // EXPLICIT LAUNCH NOTIFICATION & APPRECIATION ROUTE
  if (currentPath === '/launch') {
    return (
      <Launch 
        onBackToCommand={() => navigate('/')} 
        onEnterApp={enablePreviewAndEnter} 
      />
    );
  }

  // EXPLICIT UNDER CONSTRUCTION ROUTE OR DEFAULT LANDING TILL 14 OCT
  if (
    currentPath === '/under-construction' || 
    (isUnderConstructionPeriod && !previewMode && (currentPath === '/' || !currentUser))
  ) {
    return (
      <UnderConstruction 
        onEnterApp={enablePreviewAndEnter} 
        onLaunchNow={() => navigate('/launch')}
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
        lang={lang} 
      />
    );
  }

  // PUBLIC FLOWS (When preview mode is engaged or user explicitly visits login/register)
  if (!currentUser) {
    if (currentPath === '/login') {
      return (
        <Auth 
          initialMode="login" 
          onSuccess={() => navigate('/dashboard')} 
          onGoBack={() => navigate('/')} 
        />
      );
    }
    if (currentPath === '/register') {
      return (
        <Auth 
          initialMode="register" 
          onSuccess={() => navigate('/dashboard')} 
          onGoBack={() => navigate('/')} 
        />
      );
    }
    return (
      <Landing 
        onStart={() => navigate('/register')} 
        onLogin={() => navigate('/login')} 
      />
    );
  }

  // ONBOARDING FLOW
  if (userProfile && !userProfile.onboardingCompleted) {
    return <Onboarding onComplete={() => navigate('/dashboard')} />;
  }

  // ACTIVE EXAM WORKSPACE OVERLAY (Hides all surrounding sidebar/nav for absolute focus)
  if (activeQuiz) {
    return (
      <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col`}>
        <QuizActive config={activeQuiz} onClose={() => setActiveQuiz(null)} />
        <ToastContainer toasts={toasts} removeToast={removeToast} />
        <OfflineIndicator />
      </div>
    );
  }

  // AUTHENTICATED WORKSPACE VIEW
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  // Route matching logic
  const renderPathView = () => {
    if (currentPath === '/' || currentPath === '/dashboard') {
      return <Dashboard setPath={setCurrentPath} lang={lang} />;
    }

    if (currentPath === '/current-affairs') {
      return <CurrentAffairs setPath={setCurrentPath} lang={lang} />;
    }

    const articleIdParam = getRouteParam('/current-affairs/:id', currentPath);
    if (articleIdParam) {
      return (
        <ArticleDetail 
          articleId={articleIdParam} 
          onBack={() => navigate('/current-affairs')} 
          lang={lang}
          setPath={setCurrentPath}
        />
      );
    }

    const categoryParam = getRouteParam('/categories/:category', currentPath);
    if (categoryParam) {
      return (
        <CurrentAffairs 
          setPath={setCurrentPath} 
          lang={lang} 
          selectedCategory={decodeURIComponent(categoryParam)} 
        />
      );
    }

    if (currentPath === '/quiz') {
      return <Quiz setPath={setCurrentPath} lang={lang} onLaunchQuiz={setActiveQuiz} />;
    }

    if (currentPath === '/revision') {
      return <Revision setPath={setCurrentPath} lang={lang} />;
    }

    if (currentPath === '/bookmarks') {
      return <Bookmarks setPath={setCurrentPath} lang={lang} />;
    }

    if (currentPath === '/monthly') {
      return <Monthly setPath={setCurrentPath} lang={lang} onLaunchQuiz={setActiveQuiz} />;
    }

    if (currentPath === '/ask-ai') {
      return <AskAI setPath={setCurrentPath} lang={lang} />;
    }

    if (currentPath === '/analytics') {
      return <Analytics setPath={setCurrentPath} lang={lang} />;
    }

    if (currentPath === '/profile' || currentPath === '/settings') {
      return (
        <Settings 
          lang={lang} 
          setLang={setLang} 
          darkMode={darkMode} 
          setDarkMode={setDarkMode}
          onLogout={() => {
            sessionStorage.removeItem('nda_preview_mode');
            setPreviewMode(false);
            navigate('/');
          }}
        />
      );
    }

    if (currentPath === '/admin') {
      return <Admin />;
    }

    // Fallback redirect
    return <Dashboard setPath={setCurrentPath} lang={lang} />;
  };

  return (
    <div className={`${darkMode ? 'dark' : ''} min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-800 dark:text-slate-100 font-sans transition-colors duration-150`}>
      {/* Sidebar Navigation (Desktop) */}
      <Sidebar 
        currentPath={currentPath} 
        setPath={setCurrentPath} 
        lang={lang} 
        darkMode={darkMode} 
        setDarkMode={setDarkMode} 
      />

      {/* Main viewport Container */}
      <div className="flex-1 flex flex-col lg:pl-64 min-h-screen">
        {/* Top Header bar with custom install prompt buttons */}
        <header className="h-16 border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 sticky top-0 z-10 flex items-center justify-between px-6 shadow-xs">
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 font-extrabold text-white text-xs">
              CA
            </div>
            <span className="text-xs font-black tracking-tight">{t('appName')}</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold tracking-wider uppercase">
              <Zap className="h-4 w-4 text-amber-500 shrink-0" />
              <span>Active Study Channel: GAT Current Affairs</span>
            </div>

            {isUnderConstructionPeriod && (
              <button
                onClick={() => navigate('/under-construction')}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800/60 hover:scale-105 transition cursor-pointer"
                title="View 14 Oct Roadmap & Query Box"
              >
                <Clock className="h-3 w-3" />
                <span>Launch Desk: 14 Oct (Query Box Active)</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <PWAInstallButton />
            <button
              onClick={() => navigate('/settings')}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 dark:bg-slate-900 transition shadow-xs cursor-pointer"
            >
              Lang: {lang.toUpperCase()}
            </button>
          </div>
        </header>

        {/* Dynamic page contents routing injection */}
        <main className="flex-grow flex flex-col">
          {renderPathView()}
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav currentPath={currentPath} setPath={setCurrentPath} lang={lang} darkMode={darkMode} setDarkMode={setDarkMode} />

      {/* Global alert notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* In-app network checker */}
      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
