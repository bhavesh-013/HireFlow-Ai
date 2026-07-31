import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowUpRight, Mail, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 800);
  };

  return (
    <div className="max-w-md mx-auto my-8 sm:my-16">
      {/* Page Header Tag */}
      <div className="flex items-center gap-3 mb-6">
        <span className="font-mono text-xs font-bold text-slate-400 tracking-widest">03</span>
        <h2 className="font-mono text-sm font-bold text-[#0B192C] tracking-widest uppercase">
          RECOVERY
        </h2>
        <div className="flex-1 border-b border-slate-300/70 ml-2" />
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-6 space-y-1">
          <h3 className="text-2xl font-black text-[#0B192C] tracking-tight">
            Forgot Password
          </h3>
          <p className="text-xs sm:text-sm text-slate-600">
            Enter your email address and we'll send you a password reset link.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="space-y-6">
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-800 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>Reset Link Sent!</span>
              </div>
              <p className="text-slate-600 leading-relaxed">
                We've sent a password reset email to <span className="font-semibold text-[#0B192C]">{email}</span>. Please check your inbox and follow the instructions.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => navigate('/reset-password')}
                className="bg-[#0B192C] text-white w-full py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Simulate Open Reset Link</span>
                <ArrowUpRight size={16} />
              </button>

              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 hover:text-[#0B192C] w-full text-center py-2"
              >
                <ArrowLeft size={14} />
                <span>Back to Sign In</span>
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
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

            <button
              type="submit"
              disabled={loading}
              className="bg-[#0B192C] text-white w-full py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 mt-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Sending Email...</span>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowUpRight size={16} />
                </>
              )}
            </button>

            <div className="pt-4 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#0B192C] font-semibold"
              >
                <ArrowLeft size={14} />
                <span>Return to Sign In</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
