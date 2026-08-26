import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, Eye, EyeOff, Lock, Mail, User, AlertCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { auth, ApiRequestError } from '../lib/api';
import { consumeRedirectAfterLogin } from '../lib/authGate';
import GoogleButton from './GoogleButton';

interface AuthModalProps {
  open: boolean;
  initialMode?: 'login' | 'signup';
  onClose: () => void;
}

export default function AuthModal({
  open,
  initialMode = 'login',
  onClose,
}: AuthModalProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);

  // UI State
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccess(false);
  }, [initialMode, open]);

  if (!open) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      await auth.login(email, password);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate(consumeRedirectAfterLogin('/app/dashboard'));
      }, 700);
    } catch (err) {
      setLoading(false);
      const message =
        err instanceof ApiRequestError
          ? err.message
          : 'Something went wrong. Please try again.';
      setError(message);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreed) {
      setError('Please agree to the terms of service.');
      return;
    }

    setLoading(true);

    try {
      await auth.register(name.trim(), email, password);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        onClose();
        navigate(consumeRedirectAfterLogin('/app/dashboard'));
      }, 700);
    } catch (err) {
      setLoading(false);
      const message =
        err instanceof ApiRequestError
          ? err.message
          : 'Something went wrong. Please try again.';
      setError(message);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setGoogleLoading(true);

    try {
      const redirectPath = consumeRedirectAfterLogin('/app/dashboard');
      const redirectUrl = `${window.location.origin}${redirectPath}`;
      await auth.loginWithGoogle(redirectUrl);
    } catch (err) {
      setGoogleLoading(false);
      const message =
        err instanceof ApiRequestError
          ? err.message
          : 'Unable to sign in with Google. Please try again.';
      setError(message);
    }
  };

  const fillDemo = () => {
    setEmail('demo@hireflow.ai');
    setPassword('hireflow2026');
    setError('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-300 rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 relative my-8">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Close"
        >
          <X size={20} />
        </button>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-2xl mb-6 max-w-xs">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-bold font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-[#0B192C] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError('');
            }}
            className={`flex-1 py-1.5 text-xs font-bold font-mono tracking-wider uppercase rounded-xl transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-[#0B192C] shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            SIGN UP
          </button>
        </div>

        {/* Header Title */}
        <div className="mb-6 space-y-1">
          <h3 className="text-2xl font-black text-[#0B192C] tracking-tight">
            {mode === 'login' ? 'Welcome Back' : 'Create Your Account'}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            {mode === 'login'
              ? 'Sign in to access your saved resumes and ATS reports.'
              : 'Join HireFlow AI to build resumes and boost your interview readiness.'}
          </p>
        </div>

        {/* Error Notification */}
        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2 animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Notification */}
        {success && (
          <div className="mb-5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>
              {mode === 'login'
                ? 'Signed in successfully! Redirecting...'
                : 'Account created! Redirecting...'}
            </span>
          </div>
        )}

        {/* Sign In Form */}
        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0B192C] focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  PASSWORD
                </label>
                <Link
                  to="/forgot-password"
                  onClick={onClose}
                  className="font-mono text-[11px] text-blue-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#0B192C] focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading || success}
              className="bg-[#0B192C] text-white w-full py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowUpRight size={16} />
                </>
              )}
            </button>
          </form>
        ) : (
          /* Sign Up Form */
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                FULL NAME
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-[#0B192C] focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all"
                  required
                />
                <User size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-[#0B192C] focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all"
                  required
                />
                <Mail size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-10 py-2 text-sm text-[#0B192C] focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-mono text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                CONFIRM PASSWORD
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2 text-sm text-[#0B192C] focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all"
                  required
                />
                <Lock size={16} className="absolute left-3.5 top-2.5 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="modal-terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="rounded border-slate-300 text-[#0B192C] focus:ring-[#0B192C]"
              />
              <label htmlFor="modal-terms" className="text-xs text-slate-600 select-none">
                I agree to the Terms of Service &amp; Privacy Policy
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading || success}
              className="bg-[#0B192C] text-white w-full py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Creating Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowUpRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 border-b border-slate-200" />
          <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
            OR
          </span>
          <div className="flex-1 border-b border-slate-200" />
        </div>

        {/* Google Authentication Option */}
        <GoogleButton
          onClick={handleGoogleLogin}
          loading={googleLoading}
          disabled={loading || success}
        />

        {mode === 'login' && (
          <div className="mt-5 pt-4 border-t border-slate-200/80 flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={fillDemo}
              className="font-mono text-xs text-slate-500 hover:text-[#0B192C] underline decoration-slate-300 underline-offset-4 cursor-pointer"
            >
              Auto-fill demo credentials
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
