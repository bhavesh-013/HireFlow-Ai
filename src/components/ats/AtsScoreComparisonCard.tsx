import React from 'react';
import {
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Award,
  Zap,
  Info,
  Sparkles
} from 'lucide-react';
import { DetailedAtsScoreBreakdown } from '../../services/ats.scoring';

interface AtsScoreComparisonCardProps {
  breakdown: DetailedAtsScoreBreakdown;
  targetRole?: string;
}

export default function AtsScoreComparisonCard({
  breakdown,
  targetRole,
}: AtsScoreComparisonCardProps) {
  const { overallCurrentScore, overallOptimizedScore, scoreDelta, factorsList, scoreGrade } = breakdown;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
      {/* Top Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
              Live ATS Benchmark
            </span>
            {targetRole && (
              <span className="text-xs font-semibold text-slate-400">
                Targeting: <strong className="text-slate-200">{targetRole}</strong>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            ATS Match & Optimization Report
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
            Calculated across semantic keyword density, technical skill verification, and STAR project impact.
          </p>
        </div>

        {/* Delta Badge */}
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 px-4 py-2 rounded-2xl">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Projected ATS Lift
            </p>
            <p className="text-lg font-black text-white leading-none">
              +{scoreDelta} pts <span className="text-xs font-semibold text-emerald-400">(+{Math.round((scoreDelta / Math.max(1, overallCurrentScore)) * 100)}%)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Main Score Comparison Dual Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-6">
        {/* Current Resume Score Card */}
        <div className="bg-slate-950/80 border border-red-500/20 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between group hover:border-red-500/40 transition-colors">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 shrink-0" />
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
                Current Resume
              </h3>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${scoreGrade.current.badge}`}>
              {scoreGrade.current.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-black text-white tracking-tight font-mono">
              {overallCurrentScore}
            </span>
            <span className="text-lg font-bold text-slate-500">/ 100</span>
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                overallCurrentScore >= 80 ? 'bg-emerald-500' : overallCurrentScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${overallCurrentScore}%` }}
            />
          </div>
          <p className="text-xs text-slate-400 mt-2.5">
            Initial raw baseline before job-description semantic keyword & STAR bullet optimization.
          </p>
        </div>

        {/* Optimized Resume Score Card */}
        <div className="bg-gradient-to-br from-slate-950/90 via-slate-900/90 to-emerald-950/30 border border-emerald-500/40 rounded-2xl p-5 relative overflow-hidden flex flex-col justify-between shadow-lg shadow-emerald-950/20">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
              <h3 className="text-sm font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-300" />
                <span>Optimized Resume</span>
              </h3>
            </div>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${scoreGrade.optimized.badge}`}>
              {scoreGrade.optimized.label}
            </span>
          </div>

          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-5xl font-black text-emerald-400 tracking-tight font-mono">
              {overallOptimizedScore}
            </span>
            <span className="text-lg font-bold text-emerald-600/80">/ 100</span>
          </div>

          <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden p-0.5 border border-emerald-500/30">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${overallOptimizedScore}%` }}
            />
          </div>
          <p className="text-xs text-emerald-200/80 mt-2.5">
            Full compliance with target JD requirements, strong action verbs, prioritized skills & STAR format.
          </p>
        </div>
      </div>

      {/* Individual Factor Breakdown Progress Bars */}
      <div className="mt-8 pt-6 border-t border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>Individual Factor Score Progression (Before → After)</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {factorsList.map((factor) => {
            const factorDelta = factor.optimizedScore - factor.currentScore;
            return (
              <div
                key={factor.key}
                className="bg-slate-950/60 border border-slate-800/90 rounded-xl p-3.5 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-xs font-bold text-slate-200 truncate">{factor.name}</span>
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold">
                    <span className={factor.currentScore >= 75 ? 'text-slate-300' : 'text-amber-400'}>
                      {factor.currentScore}%
                    </span>
                    <ArrowRight size={12} className="text-slate-500 shrink-0" />
                    <span className="text-emerald-400 font-black">{factor.optimizedScore}%</span>
                  </div>
                </div>

                {/* Progress Bar Dual Layer */}
                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden relative border border-slate-800">
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-slate-700/60 rounded-full"
                    style={{ width: `${factor.currentScore}%` }}
                  />
                  <div
                    className="absolute top-0 bottom-0 left-0 bg-emerald-500/80 rounded-full transition-all"
                    style={{ width: `${factor.optimizedScore}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                  <span className="truncate pr-2">{factor.explanation}</span>
                  {factorDelta > 0 && (
                    <span className="text-emerald-400 font-bold font-mono shrink-0">
                      +{factorDelta}%
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
