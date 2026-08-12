import React, { useState } from 'react';
import { X, Lock, Mail, User } from 'lucide-react';
import { authService } from '../../services/auth.service';

interface LoginRequiredModalProps {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
  onSuccess?: () => void;
  message?: string;
  badge?: string;
}

export default function LoginRequiredModal({
  open,
  onClose,
  onLogin,
  onSignup,
  onSuccess,
  message,
  badge = 'AUTH GATE',
}: LoginRequiredModalProps) {
  const [inlineMode, setInlineMode] = useState<'prompt' | 'login' | 'signup'>('prompt');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!open) return null;

  const handleInlineAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (inlineMode === 'signup') {
        await authService.register(name || email.split('@')[0], email, password);
      } else {
        await authService.login(email, password);
      }
      setLoading(false);
      setInlineMode('prompt');
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      setLoading(false);
      setError(err.message || 'Authentication failed. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400">{badge}</span>
            <span className="text-slate-300">/</span>
            <h3 className="font-mono text-xs sm:text-sm font-bold text-[#0B192C] tracking-wider uppercase">
              {inlineMode === 'prompt' ? 'Login Required' : inlineMode === 'signup' ? 'Quick Sign Up' : 'Quick Log In'}
            </h3>
          </div>
          <button
            onClick={() => {
              setInlineMode('prompt');
              onClose();
            }}
            className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {inlineMode === 'prompt' ? (
          <>
            <div className="my-6 flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center shrink-0">
                <Lock size={16} className="text-blue-600" />
              </div>
              <p className="text-slate-700 text-sm leading-relaxed">
                {message || 'This feature requires a free HireFlow account. Log in or sign up to continue — your progress will be saved automatically.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                Maybe later
              </button>
              <button
                onClick={() => setInlineMode('login')}
                className="bg-white border border-slate-300 text-[#0B192C] px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Log In
              </button>
              <button
                onClick={() => setInlineMode('signup')}
                className="bg-[#0B192C] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Sign Up Free
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleInlineAuth} className="my-4 space-y-3">
            {error && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                {error}
              </div>
            )}
            {inlineMode === 'signup' && (
              <div>
                <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Full Name</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0B192C]"
                  />
                  <User size={14} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0B192C]"
                />
                <Mail size={14} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-mono font-bold text-slate-400 uppercase mb-1">Password</label>
              <div className="relative">
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-[#0B192C]"
                />
                <Lock size={14} className="absolute left-3 top-2.5 text-slate-400" />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setInlineMode(inlineMode === 'login' ? 'signup' : 'login')}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                {inlineMode === 'login' ? 'Need an account? Sign up' : 'Already registered? Log in'}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setInlineMode('prompt')}
                  className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0B192C] text-white px-4 py-1.5 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {loading ? 'Processing...' : inlineMode === 'signup' ? 'Create & Continue' : 'Log In & Continue'}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
