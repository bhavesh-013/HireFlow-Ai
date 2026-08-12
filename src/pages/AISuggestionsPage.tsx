import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Lightbulb,
  Check
} from 'lucide-react';
import { mockAISuggestions, AISuggestion } from '../data/mockData';
import { isAuthenticated } from '../lib/api';
import { rememberCurrentLocationForRedirect } from '../lib/authGate';
import LoginRequiredModal from '../components/app/LoginRequiredModal';

export default function AISuggestionsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>(mockAISuggestions);

  const toggleApply = (id: string) => {
    if (!isAuthenticated()) {
      setIsAuthGateOpen(true);
      return;
    }
    setSuggestions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, applied: !s.applied } : s))
    );
  };

  const appliedCount = suggestions.filter((s) => s.applied).length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Guest AI-feature gate */}
      <LoginRequiredModal
        open={isAuthGateOpen}
        onClose={() => setIsAuthGateOpen(false)}
        onLogin={() => {
          rememberCurrentLocationForRedirect(location.pathname, location.search);
          setIsAuthGateOpen(false);
          navigate('/login');
        }}
        onSignup={() => {
          rememberCurrentLocationForRedirect(location.pathname, location.search);
          setIsAuthGateOpen(false);
          navigate('/signup');
        }}
        message="Applying AI suggestions requires a free account. Log in or sign up to continue — you'll land right back here."
      />

      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
              SMART WRITING ENGINE
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
            AI Resume Improvement Suggestions
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Actionable bullet point upgrades, verb replacements, and metric additions generated for your resume.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-3 py-1.5 rounded-xl border border-slate-200">
            {appliedCount} / {suggestions.length} Applied
          </span>
          <button
            onClick={() => navigate('/app/editor')}
            className="bg-[#0B192C] hover:bg-slate-800 text-white px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <span>Open in Editor</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Suggestions List */}
      <div className="space-y-5">
        {suggestions.map((item) => (
          <div
            key={item.id}
            className={`bg-white border rounded-2xl p-6 shadow-2xs transition-all space-y-4 ${
              item.applied ? 'border-emerald-300 bg-emerald-50/20' : 'border-slate-200/90'
            }`}
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="bg-slate-100 text-[#0B192C] text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-md">
                  {item.category}
                </span>
                <span className="bg-blue-100 text-blue-800 text-[10px] font-bold font-mono px-2.5 py-0.5 rounded-full">
                  {item.impactScore}
                </span>
              </div>

              <button
                onClick={() => toggleApply(item.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  item.applied
                    ? 'bg-emerald-600 text-white shadow-2xs'
                    : 'bg-[#0B192C] hover:bg-slate-800 text-white shadow-2xs'
                }`}
              >
                {item.applied ? (
                  <>
                    <Check size={14} />
                    <span>Applied to Resume</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-blue-300" />
                    <span>Apply Suggestion</span>
                  </>
                )}
              </button>
            </div>

            {/* Content Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Original Text */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">
                  Original Text
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">{item.originalText}</p>
              </div>

              {/* AI Suggested Upgraded Text */}
              <div className="p-3.5 bg-blue-50/50 rounded-xl border border-blue-200/70 space-y-1">
                <span className="text-[10px] font-bold font-mono text-blue-700 uppercase tracking-wider block flex items-center gap-1">
                  <Sparkles size={12} />
                  <span>AI Enhanced Text</span>
                </span>
                <p className="text-xs font-medium text-[#0B192C] leading-relaxed font-sans">
                  {item.suggestedText}
                </p>
              </div>
            </div>

            {/* Rationale */}
            <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
              <Lightbulb size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p>
                <strong className="text-[#0B192C]">AI Rationale:</strong> {item.rationale}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
