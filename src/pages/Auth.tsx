import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, Mail, Lock, User, Globe, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { AppLanguage, AttemptType } from '../types';

interface AuthProps {
  onSuccess: () => void;
  onGoBack: () => void;
  initialMode?: 'login' | 'register';
}

export const Auth: React.FC<AuthProps> = ({ onSuccess, onGoBack, initialMode = 'login' }) => {
  const { loginEmail, signUpEmail, signInWithGoogle, resetPassword } = useAuth();
  
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [targetAttempt, setTargetAttempt] = useState<AttemptType>('Both');
  const [language, setLanguage] = useState<AppLanguage>('en');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (mode === 'forgot') {
      if (!email) {
        return setError("Please enter your email address.");
      }
      setLoading(true);
      try {
        await resetPassword(email);
        setSuccess("Password reset instructions sent to your email!");
      } catch (err: any) {
        setError(err.message || "Failed to send reset email.");
      } finally {
        setLoading(false);
      }
      return;
    }

    if (mode === 'register') {
      if (!name || !email || !password || !confirmPassword) {
        return setError("Please fill out all fields.");
      }
      if (password !== confirmPassword) {
        return setError("Passwords do not match.");
      }
      if (password.length < 6) {
        return setError("Password must be at least 6 characters.");
      }

      setLoading(true);
      try {
        await signUpEmail(email, password, name, targetAttempt, language);
        onSuccess();
      } catch (err: any) {
        setError(err.message || "Failed to sign up.");
      } finally {
        setLoading(false);
      }
    } else {
      if (!email || !password) {
        return setError("Please fill out all login fields.");
      }
      setLoading(true);
      try {
        await loginEmail(email, password);
        onSuccess();
      } catch (err: any) {
        setError(err.message || "Failed to log in.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Google Sign-In failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      {/* Go Back button */}
      <button 
        onClick={onGoBack}
        className="absolute top-6 left-6 text-xs font-semibold text-slate-400 hover:text-white flex items-center gap-1"
      >
        ← Back to Home
      </button>

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-extrabold text-white shadow-md text-lg">
            CA
          </div>
          <h2 className="text-xl font-black text-white">NDA CURRENT AFFAIRS AI</h2>
          <p className="text-xs text-slate-400">
            {mode === 'login' ? 'Welcome back! Log in to continue your mission.' :
             mode === 'register' ? 'Set up your aspirant account to begin GAT study.' :
             'Reset your account credentials.'}
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-950/40 border border-red-900/60 p-3 rounded-lg flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
            <p className="leading-relaxed">{error}</p>
          </div>
        )}

        {/* Success message */}
        {success && (
          <div className="bg-emerald-950/40 border border-emerald-900/60 p-3 rounded-lg flex items-start gap-2.5 text-xs text-emerald-200">
            <Sparkles className="h-4 w-4 shrink-0 text-emerald-400" />
            <p className="leading-relaxed">{success}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Abhik Ghosh"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-600 rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium text-slate-100 outline-none transition"
                  required
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                placeholder="abhik@example.com"
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-600 rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium text-slate-100 outline-none transition"
                required
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Password</label>
                {mode === 'login' && (
                  <button 
                    type="button" 
                    onClick={() => setMode('forgot')}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-600 rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium text-slate-100 outline-none transition"
                  required
                />
              </div>
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-600 rounded-lg py-2.5 pl-10 pr-4 text-xs font-medium text-slate-100 outline-none transition"
                    required
                  />
                </div>
              </div>

              {/* Target attempt and language selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Target Attempt
                  </label>
                  <select 
                    value={targetAttempt} 
                    onChange={(e) => setTargetAttempt(e.target.value as AttemptType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-indigo-600 transition"
                  >
                    <option value="NDA 1">NDA 1</option>
                    <option value="NDA 2">NDA 2</option>
                    <option value="Both">Both</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Language
                  </label>
                  <select 
                    value={language} 
                    onChange={(e) => setLanguage(e.target.value as AppLanguage)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg py-2.5 px-3 text-xs font-medium text-slate-300 outline-none focus:border-indigo-600 transition"
                  >
                    <option value="en">English</option>
                    <option value="hi">हिंदी (Hindi)</option>
                    <option value="bn">বাংলা (Bengali)</option>
                  </select>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-indigo-600 hover:bg-indigo-700 py-3 text-xs font-extrabold text-white shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 
             mode === 'login' ? 'Sign In to Dashboard' : 
             mode === 'register' ? 'Register Account' : 
             'Send Recovery Instructions'}
            {!loading && <ArrowRight className="h-3.5 w-3.5" />}
          </button>
        </form>

        {/* Separator */}
        {mode !== 'forgot' && (
          <>
            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-500 font-bold uppercase tracking-wider">Or Connect With</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full rounded-lg border border-slate-800 hover:bg-slate-800/80 py-2.5 text-xs font-bold text-slate-300 hover:text-white transition flex items-center justify-center gap-2"
            >
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
              </svg>
              Google Account
            </button>
          </>
        )}

        {/* Footer controls */}
        <div className="text-center text-xs font-medium">
          {mode === 'login' ? (
            <p className="text-slate-400">
              New to the platform?{' '}
              <button onClick={() => setMode('register')} className="text-indigo-400 hover:text-indigo-300 font-bold">
                Create Account
              </button>
            </p>
          ) : (
            <p className="text-slate-400">
              Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-indigo-400 hover:text-indigo-300 font-bold">
                Log In
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
export default Auth;
