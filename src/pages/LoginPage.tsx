import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Eye, EyeOff, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { auth, ApiRequestError } from '../lib/api';
import { consumeRedirectAfterLogin } from '../lib/authGate';
import GoogleButton from '../components/GoogleButton';

export default function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    // Parse any OAuth error returned in URL hash or search params
    const hash = window.location.hash;
    const search = window.location.search;
    const searchParams = new URLSearchParams(search);
    const hashParams = new URLSearchParams(hash.includes('#') ? hash.substring(1) : hash);
    const errorDesc =
      searchParams.get('error_description') ||
      hashParams.get('error_description') ||
      searchParams.get('error') ||
      hashParams.get('error');

    if (errorDesc) {
      const lower = errorDesc.toLowerCase();
      if (lower.includes('access_denied') || lower.includes('cancel')) {
        setError('Google sign-in was cancelled.');
      } else {
        setError('Unable to sign in with Google. Please try again.');
      }
    }
  }, []);

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
        navigate(consumeRedirectAfterLogin('/dashboard'));
      }, 800);
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
      const redirectPath = consumeRedirectAfterLogin('/dashboard');
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
    <div className="max-w-md mx-auto my-8 sm:my-16">
      {/* Page Header Tag */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-xs font-bold text-slate-400 tracking-widest">01</span>
        <h2 className="font-mono text-sm font-bold text-[#0B192C] tracking-widest uppercase">
          SIGN IN
        </h2>
        <div className="flex-1 border-b border-slate-300/70 ml-2" />
      </div>

      {/* Auth Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6 space-y-1">
          <h3 className="text-2xl font-black text-[#0B192C] tracking-tight">
            Welcome Back
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Sign in to access your saved resumes and ATS analysis reports.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
            <span>Signed in successfully! Redirecting to workspace...</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              EMAIL ADDRESS
            </label>
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0B192C] focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all"
              />
              <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                PASSWORD
              </label>
              <Link
                to="/forgot-password"
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
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
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

        <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col items-center gap-3">
          <button
            type="button"
            onClick={fillDemo}
            className="font-mono text-xs text-slate-500 hover:text-[#0B192C] underline decoration-slate-300 underline-offset-4 cursor-pointer"
          >
            Auto-fill demo credentials
          </button>

          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <Link to="/signup" className="font-bold text-[#0B192C] hover:underline">
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
