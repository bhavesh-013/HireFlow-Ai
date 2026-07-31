import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-16">
      {/* Page Header Tag */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-xs font-bold text-slate-400 tracking-widest">04</span>
        <h2 className="font-mono text-sm font-bold text-[#0B192C] tracking-widest uppercase">
          NEW PASSWORD
        </h2>
        <div className="flex-1 border-b border-slate-300/70 ml-2" />
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6 space-y-1">
          <h3 className="text-2xl font-black text-[#0B192C] tracking-tight">
            Reset Your Password
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Please enter a strong new password for your account.
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
            <span>Password updated successfully! Redirecting to Sign In...</span>
          </div>
        )}

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label className="block font-mono text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              NEW PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
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

          <div>
            <label className="block font-mono text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              CONFIRM NEW PASSWORD
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm text-[#0B192C] focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all"
              />
              <Lock size={16} className="absolute left-3.5 top-3 text-slate-400" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className="bg-[#0B192C] text-white w-full py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-4 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <span>Updating Password...</span>
            ) : (
              <>
                <span>Update Password</span>
                <ArrowUpRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-200/80 text-center">
          <Link to="/login" className="text-xs text-slate-600 hover:text-[#0B192C] font-semibold">
            Cancel and Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
