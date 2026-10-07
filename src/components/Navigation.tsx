import React from 'react';
import { 
  Shield, 
  BookOpen, 
  Compass, 
  Globe, 
  HelpCircle, 
  RefreshCw, 
  Bookmark, 
  Calendar, 
  MessageSquare, 
  BarChart2, 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Menu, 
  Lock,
  Sun,
  Moon,
  ChevronRight,
  TrendingUp,
  Award,
  Zap,
  Cpu,
  LogOut,
  Atom,
  Building,
  Flag,
  FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { translations, LanguageCode } from '../i18n/translations';

interface NavigationProps {
  currentPath: string;
  setPath: (path: string) => void;
  lang: LanguageCode;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
}

export const Sidebar: React.FC<NavigationProps> = ({ 
  currentPath, 
  setPath, 
  lang,
  darkMode,
  setDarkMode
}) => {
  const { userProfile, logOut } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setPath(path);
  };

  const navItems = [
    { name: t('dashboard'), path: '/dashboard', icon: Compass },
    { name: t('currentAffairs'), path: '/current-affairs', icon: BookOpen },
    { name: t('defence'), path: '/categories/Defence', icon: Shield },
    { name: t('national'), path: '/categories/National', icon: Flag },
    { name: t('international'), path: '/categories/International', icon: Globe },
    { name: t('scienceSpace'), path: '/categories/Space', icon: Atom },
    { name: t('economy'), path: '/categories/Economy', icon: TrendingUp },
    { name: t('govtSchemes'), path: '/categories/Government Schemes', icon: Building },
    { name: t('awardsSports'), path: '/categories/Awards', icon: Award },
    { name: t('quiz'), path: '/quiz', icon: HelpCircle },
    { name: t('revision'), path: '/revision', icon: RefreshCw },
    { name: t('bookmarks'), path: '/bookmarks', icon: Bookmark },
    { name: t('monthly'), path: '/monthly', icon: Calendar },
    { name: t('askAI'), path: '/ask-ai', icon: MessageSquare },
    { name: t('analytics'), path: '/analytics', icon: BarChart2 },
    { name: t('profile'), path: '/profile', icon: UserIcon },
    { name: t('settings'), path: '/settings', icon: SettingsIcon },
  ];

  const isAdmin = userProfile?.role === 'admin';

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-slate-200 bg-slate-900 text-slate-100 lg:flex dark:border-slate-800">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-slate-800">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md">
          CA
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-tight text-white">{t('appName')}</h1>
          <p className="text-[10px] text-slate-400 font-medium">Read. Revise. Practice.</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
          return (
            <button
              key={item.path}
              onClick={() => handleNavigate(item.path)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
                isActive 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span className="truncate">{item.name}</span>
              {isActive && <ChevronRight className="ml-auto h-3 w-3" />}
            </button>
          );
        })}

        {/* Admin Section (Always Accessible with Clearance Gateway) */}
        <div className="pt-4 border-t border-slate-800 mt-4 space-y-1">
          <div className="flex items-center justify-between px-3 mb-1">
            <p className="text-[10px] font-black text-amber-400/90 tracking-wider uppercase">Admin Gateway</p>
            <span className="text-[9px] font-mono font-bold bg-amber-950 text-amber-400 border border-amber-600/30 px-1.5 py-0.2 rounded">PIN PROTECTED</span>
          </div>
          
          <button
            onClick={() => handleNavigate('/admin?tab=daily-pdf')}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              currentPath.includes('tab=daily-pdf')
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-blue-300 hover:bg-blue-950/40 hover:text-white border border-blue-500/20'
            }`}
          >
            <FileText className="h-4 w-4 shrink-0 text-blue-400" />
            <span className="truncate">Upload Daily HT PDF</span>
            <span className="ml-auto text-[9px] font-bold bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded">NEW</span>
          </button>

          <button
            onClick={() => handleNavigate('/admin')}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-xs font-semibold transition-all ${
              currentPath === '/admin'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'
            }`}
          >
            <Lock className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Admin Command HQ</span>
          </button>
        </div>
      </nav>

      {/* Bottom Profile and Controls */}
      <div className="border-t border-slate-800 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-800 font-semibold text-slate-200 text-xs">
              {userProfile?.name?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="truncate w-28">
              <p className="text-xs font-bold text-white truncate">{userProfile?.name}</p>
              <p className="text-[10px] text-slate-400 truncate">{userProfile?.email}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
          >
            {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>

        <button
          onClick={logOut}
          className="flex w-full items-center gap-2 rounded-lg bg-slate-800 hover:bg-red-900/40 border border-slate-700/50 hover:border-red-700/50 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-red-200 transition-all justify-center"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>{t('logout')}</span>
        </button>
      </div>
    </aside>
  );
};

export const MobileBottomNav: React.FC<NavigationProps> = ({ 
  currentPath, 
  setPath, 
  lang 
}) => {
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const handleNavigate = (path: string) => {
    window.history.pushState({}, '', path);
    setPath(path);
  };

  const mobileItems = [
    { name: t('dashboard'), path: '/dashboard', icon: Compass },
    { name: t('currentAffairs'), path: '/current-affairs', icon: BookOpen },
    { name: 'HT PDF', path: '/admin?tab=daily-pdf', icon: FileText },
    { name: t('quiz'), path: '/quiz', icon: HelpCircle },
    { name: t('revision'), path: '/revision', icon: RefreshCw },
    { name: t('profile'), path: '/profile', icon: UserIcon },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 flex h-16 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 lg:hidden shadow-lg justify-around items-center px-2">
      {mobileItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentPath === item.path || (item.path !== '/dashboard' && currentPath.startsWith(item.path));
        return (
          <button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            className={`flex flex-col items-center justify-center flex-1 h-full py-2 text-[10px] font-bold tracking-tight transition-all ${
              isActive 
                ? 'text-indigo-600 dark:text-indigo-400' 
                : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'
            }`}
          >
            <Icon className={`h-5.5 w-5.5 mb-1 ${isActive ? 'scale-110' : ''}`} />
            <span>{item.name}</span>
          </button>
        );
      })}
    </nav>
  );
};
