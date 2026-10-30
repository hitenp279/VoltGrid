import React, { useState } from 'react';
import { useGridApp } from '../../context/GridAppContext';
import {
  Zap,
  Lock,
  Mail,
  User,
  ArrowRight,
  X,
  AlertCircle
} from 'lucide-react';

function getFriendlyAuthErrorMessage(err) {
  const code = err?.code || '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Invalid email address format. Please enter a valid email.';
    case 'auth/user-not-found':
      return 'No account found with this email. Please check your email or register.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please check your credentials.';
    case 'auth/email-already-in-use':
      return 'This email address is already in use. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password is too weak. Please use at least 6 characters.';
    case 'auth/missing-password':
      return 'Please enter your password.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again in a moment.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      return err?.message || 'Authentication failed. Please try again.';
  }
}

export default function LoginPage({ onClose }) {
  const {
    loginWithFirebase,
    registerWithFirebase,
    continueAsGuest
  } = useGridApp();

  const [tab, setTab] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    if (tab === 'signup') {
      if (!name.trim()) {
        setError('Please enter your full name.');
        return;
      }
      if (password.length < 6) {
        setError('Password is too weak. Please use at least 6 characters.');
        return;
      }
    }

    setLoading(true);
    try {
      if (tab === 'login') {
        await loginWithFirebase(trimmedEmail, password);
      } else {
        await registerWithFirebase(trimmedEmail, password, name.trim());
      }
      if (onClose) onClose();
    } catch (err) {
      setError(getFriendlyAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    continueAsGuest();
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 dark:bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-md bg-[#FFF8EA] dark:bg-[#121F33] border border-[#D8C7AF] dark:border-[#1E3352] rounded-2xl overflow-hidden my-8 shadow-2xl transition-colors">
        
        {/* Close Button if opened as modal */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 text-[#172A46]/60 dark:text-[#E8DCC8]/60 hover:text-[#172A46] dark:hover:text-[#FFF8EA] rounded-lg hover:bg-[#E8DCC8]/60 dark:hover:bg-[#1E3352] transition-colors z-10 cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Top Header */}
        <div className="p-6 border-b border-[#D8C7AF] dark:border-[#1E3352] bg-[#E8DCC8]/50 dark:bg-[#0B1422]/60">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-[#172A46] dark:bg-[#FFF8EA] flex items-center justify-center text-[#FFF8EA] dark:text-[#172A46] shadow-sm">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[#172A46] dark:text-[#FFF8EA] font-mono">VOLT<span className="text-emerald-600 dark:text-emerald-400">GRID</span></span>
            </div>
          </div>
          <p className="text-xs text-[#172A46]/70 dark:text-[#E8DCC8]/70">
            Smart Grid & EV Charging Orchestration Platform
          </p>
        </div>

        {/* Auth Body */}
        <div className="p-6 space-y-5">
          
          {/* Sign In / Sign Up toggle */}
          <div className="grid grid-cols-2 p-1 bg-[#E8DCC8] dark:bg-[#0B1422] rounded-xl border border-[#D8C7AF] dark:border-[#1E3352] text-xs">
            <button
              type="button"
              onClick={() => { setTab('login'); setError(''); }}
              className={`py-2 text-center rounded-lg font-semibold transition-all cursor-pointer ${
                tab === 'login' 
                  ? 'bg-[#FFF8EA] dark:bg-[#172A46] text-[#172A46] dark:text-[#FFF8EA] shadow-sm' 
                  : 'text-[#172A46]/60 dark:text-[#E8DCC8]/60 hover:text-[#172A46] dark:hover:text-[#FFF8EA]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setTab('signup'); setError(''); }}
              className={`py-2 text-center rounded-lg font-semibold transition-all cursor-pointer ${
                tab === 'signup' 
                  ? 'bg-[#FFF8EA] dark:bg-[#172A46] text-[#172A46] dark:text-[#FFF8EA] shadow-sm' 
                  : 'text-[#172A46]/60 dark:text-[#E8DCC8]/60 hover:text-[#172A46] dark:hover:text-[#FFF8EA]'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* User-friendly Error Alert */}
          {error && (
            <div
              role="alert"
              className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 dark:text-rose-300"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-[#172A46]/80 dark:text-[#E8DCC8]/80 mb-1.5">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-[#172A46]/50 dark:text-[#E8DCC8]/50 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    autoComplete="name"
                    className="w-full pl-9 pr-3.5 py-2 bg-[#FFF8EA] dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] rounded-lg text-xs text-[#172A46] dark:text-[#FFF8EA] placeholder-[#172A46]/40 dark:placeholder-[#E8DCC8]/40 focus:outline-none focus:border-[#172A46] dark:focus:border-[#4B6B94] transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-[#172A46]/80 dark:text-[#E8DCC8]/80 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-[#172A46]/50 dark:text-[#E8DCC8]/50 absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="driver@example.com"
                  autoComplete="email"
                  className="w-full pl-9 pr-3.5 py-2 bg-[#FFF8EA] dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] rounded-lg text-xs text-[#172A46] dark:text-[#FFF8EA] placeholder-[#172A46]/40 dark:placeholder-[#E8DCC8]/40 focus:outline-none focus:border-[#172A46] dark:focus:border-[#4B6B94] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#172A46]/80 dark:text-[#E8DCC8]/80 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-[#172A46]/50 dark:text-[#E8DCC8]/50 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                  className="w-full pl-9 pr-3.5 py-2 bg-[#FFF8EA] dark:bg-[#0B1422] border border-[#D8C7AF] dark:border-[#1E3352] rounded-lg text-xs text-[#172A46] dark:text-[#FFF8EA] placeholder-[#172A46]/40 dark:placeholder-[#E8DCC8]/40 focus:outline-none focus:border-[#172A46] dark:focus:border-[#4B6B94] transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-[#172A46] hover:bg-[#1E3352] dark:bg-[#FFF8EA] dark:hover:bg-[#E8DCC8] disabled:opacity-50 disabled:cursor-not-allowed text-[#FFF8EA] dark:text-[#172A46] font-semibold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm mt-1"
            >
              {loading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-current/30 border-t-current rounded-full animate-spin" />
                  <span>{tab === 'login' ? 'Signing In...' : 'Creating Account...'}</span>
                </>
              ) : (
                <>
                  <span>{tab === 'login' ? 'Sign In to EV Dashboard' : 'Create EV Account'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Continue as Guest */}
          <div className="text-center pt-3 border-t border-[#D8C7AF] dark:border-[#1E3352]">
            <button
              type="button"
              onClick={handleGuest}
              className="text-xs text-[#172A46]/70 dark:text-[#E8DCC8]/70 hover:text-[#172A46] dark:hover:text-[#FFF8EA] font-medium transition-colors cursor-pointer"
            >
              Continue as Guest (Explore Station Hubs & Availability)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
