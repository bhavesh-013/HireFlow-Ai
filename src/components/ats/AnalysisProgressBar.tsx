import React from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';

interface AnalysisProgressBarProps {
  progress: number; // 0 - 100
  stepText: string;
  isCompleted?: boolean;
}

const STEPS = [
  'Analyzing JD...',
  'Extracting requirements...',
  'Analyzing resume...',
  'Matching keywords...',
  'Analyzing projects & exp...',
  'Generating optimization...',
  'Calculating final ATS score...',
];

export default function AnalysisProgressBar({
  progress,
  stepText,
  isCompleted,
}: AnalysisProgressBarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between gap-4 mb-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#2563EB]">
            {isCompleted ? (
              <CheckCircle2 size={18} className="text-emerald-600" />
            ) : (
              <Loader2 size={18} className="animate-spin text-[#2563EB]" />
            )}
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#0B192C] tracking-tight flex items-center gap-2">
              <span>{isCompleted ? 'ATS Optimization Complete' : 'AI Live ATS Optimization in Progress'}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-[#2563EB] font-mono font-bold border border-blue-100">
                {Math.round(progress)}%
              </span>
            </h4>
            <p className="text-xs text-[#475569] font-mono mt-0.5">{stepText}</p>
          </div>
        </div>

        <div className="text-right hidden sm:block">
          <span className="text-[11px] text-[#475569] uppercase tracking-wider font-semibold">
            Deterministic Engine • High Precision
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 relative z-10">
        <div
          className="h-full bg-[#2563EB] rounded-full transition-all duration-300 ease-out shadow-xs"
          style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
        />
      </div>

      {/* Step Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mt-4 relative z-10">
        {STEPS.map((step, idx) => {
          const stepPercent = ((idx + 1) / STEPS.length) * 100;
          const isDone = progress >= stepPercent;
          const isCurrent = progress >= stepPercent - 15 && progress < stepPercent;

          return (
            <div
              key={idx}
              className={`px-2 py-1.5 rounded-lg border text-[11px] font-medium text-center transition-all ${
                isDone
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                  : isCurrent
                  ? 'bg-blue-50 border-blue-200 text-[#2563EB] font-semibold ring-1 ring-blue-100'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}
            >
              <div className="flex items-center justify-center gap-1">
                {isDone ? (
                  <span className="text-emerald-600 font-bold">✓</span>
                ) : isCurrent ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-ping" />
                ) : (
                  <span className="text-slate-400 font-mono">{idx + 1}</span>
                )}
                <span className="truncate">{step.replace(/\.\.\./, '')}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
