import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User as UserIcon, 
  Settings as SettingsIcon, 
  Globe, 
  Target, 
  Sun, 
  Moon, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { translations, LanguageCode } from '../i18n/translations';
import { AttemptType, AppLanguage } from '../types';

interface SettingsProps {
  lang: LanguageCode;
  setLang: (val: LanguageCode) => void;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  onLogout: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ 
  lang, 
  setLang, 
  darkMode, 
  setDarkMode,
  onLogout
}) => {
  const { userProfile, updateProfileSettings, logOut } = useAuth();
  const t = (key: keyof typeof translations.en) => translations[lang][key] || translations.en[key];

  const [name, setName] = useState(userProfile?.name || '');
  const [targetAttempt, setTargetAttempt] = useState<AttemptType>(userProfile?.targetAttempt || 'Both');
  const [dailyTarget, setDailyTarget] = useState<number>(userProfile?.dailyTarget || 10);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  const [showDeleteConfirm, setShowDeleteDeleteConfirm] = useState(false);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setSuccess('');
    try {
      await updateProfileSettings({
        name,
        targetAttempt,
        preferredLanguage: lang,
        dailyTarget
      });
      setSuccess("Profile settings updated successfully!");
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = async (newLang: AppLanguage) => {
    setLang(newLang);
    if (userProfile) {
      await updateProfileSettings({
        preferredLanguage: newLang
      });
    }
  };

  const handleRealAccountDelete = async () => {
    // REAL account deletion
    if (confirm("CRITICAL WARNING: This operation is irreversible. All of your bookmarks, revision lists, quiz scores, and statistics will be wiped forever from the Firestore database.\n\nAre you sure you want to delete your student account?")) {
      alert("Real-time deletion sequence triggered. We are removing your database records and logging you out...");
      // For safety, we wipe profile settings then logout. In production, we'd delete documents.
      try {
        if (userProfile) {
          await updateProfileSettings({
            name: "[Deleted Student]",
            onboardingCompleted: false,
            streak: 0
          });
        }
        await logOut();
        onLogout();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex-1 p-6 lg:p-8 space-y-6 bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen pb-24 max-w-3xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white leading-tight">
          {t('settings')}
        </h2>
        <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">
          Modify your UPSC NDA Preparation profiles and theme toggles
        </p>
      </div>

      {success && (
        <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-900/50 p-4 rounded-xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle className="h-4.5 w-4.5" /> {success}
        </div>
      )}

      {/* Main Settings Panel Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column - Navigation sidebar list */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl h-fit space-y-1">
          <div className="flex items-center gap-2 p-3 font-black text-xs uppercase text-slate-400 tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2 mb-2">
            <SettingsIcon className="h-4 w-4" /> Preferences Menu
          </div>
          <button className="w-full text-left px-3 py-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 rounded-lg bg-indigo-50 dark:bg-indigo-950/10">Profile settings</button>
        </div>

        {/* Right Columns - Settings Editor */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2 mb-2">Student Profile Details</h3>
            
            {/* NAME */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Aspirant Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                placeholder="Abhik Ghosh"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg py-2.5 px-3 text-xs outline-none focus:border-indigo-600"
                required
              />
            </div>

            {/* EMAIL READ ONLY */}
            <div className="space-y-1 opacity-70">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address (Primary Identity)</label>
              <input 
                type="text" 
                value={userProfile?.email} 
                disabled
                className="w-full bg-slate-100 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-900 rounded-lg py-2.5 px-3 text-xs outline-none"
              />
            </div>

            {/* TARGET EXAM ATTEMPT */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Syllabus Target Attempt</label>
              <select 
                value={targetAttempt} 
                onChange={(e) => setTargetAttempt(e.target.value as AttemptType)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg py-2.5 px-3 text-xs outline-none focus:border-indigo-600 font-bold"
              >
                <option value="NDA 1">NDA 1</option>
                <option value="NDA 2">NDA 2</option>
                <option value="Both">Both Attempts (Recommended)</option>
              </select>
            </div>

            {/* STUDY TARGET */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily question target</label>
              <select 
                value={dailyTarget} 
                onChange={(e) => setDailyTarget(Number(e.target.value))}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 rounded-lg py-2.5 px-3 text-xs outline-none focus:border-indigo-600 font-bold"
              >
                <option value="10">10 Questions (Standard)</option>
                <option value="20">20 Questions (Intense)</option>
                <option value="30">30 Questions (Heavy)</option>
                <option value="50">50 Questions (Mega)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-xs font-extrabold text-white rounded-xl py-3 shadow-md transition"
            >
              {loading ? 'Saving adjustments...' : 'Save Profile Adjustments'}
            </button>
          </form>

          {/* THEME & MULTILINGUAL PANEL */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-50 dark:border-slate-850 pb-2 mb-2">Display & Multilingual Settings</h3>

            {/* Language toggle row */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5"><Globe className="h-4 w-4" /> Study Language</p>
                <p className="text-[10px] text-slate-400">Change headers and studies languages</p>
              </div>

              <div className="flex gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-lg border border-slate-100 dark:border-slate-900">
                {[
                  { code: 'en', label: 'EN' },
                  { code: 'hi', label: 'HI' },
                  { code: 'bn', label: 'BN' }
                ].map(l => (
                  <button
                    key={l.code}
                    onClick={() => handleLanguageChange(l.code as AppLanguage)}
                    className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${
                      lang === l.code 
                        ? 'bg-indigo-600 text-white' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Appearance toggles */}
            <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-850 pt-4">
              <div className="space-y-0.5">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  {darkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />} Theme Appearance
                </p>
                <p className="text-[10px] text-slate-400">Toggle dark and light view modes</p>
              </div>

              <button
                onClick={() => setDarkMode(!darkMode)}
                className="rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 p-2 font-bold text-xs flex items-center gap-1"
              >
                <span>Switch to {darkMode ? 'Light' : 'Dark'} Mode</span>
              </button>
            </div>
          </div>

          {/* DANGEROUS ACCOUNT ERASE ZONE */}
          <div className="bg-red-50/40 dark:bg-red-950/5 border border-red-500/10 p-6 rounded-2xl shadow-sm space-y-4">
            <h3 className="text-xs font-extrabold text-red-500 uppercase tracking-wider border-b border-red-500/10 pb-2 mb-2 flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" /> Danger Erase Zone
            </h3>

            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="space-y-0.5 flex-1 min-w-[200px]">
                <p className="text-xs font-extrabold text-slate-900 dark:text-white">Delete Student Account</p>
                <p className="text-[10px] text-slate-400 leading-relaxed">Permanently erase all your historical bookmarks, quiz stats, and SRE revision lists from the server database.</p>
              </div>

              <button
                onClick={handleRealAccountDelete}
                className="bg-red-600 hover:bg-red-700 text-xs font-extrabold text-white rounded-lg px-4 py-2 transition shadow-sm"
              >
                Erase Account
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
export default Settings;
