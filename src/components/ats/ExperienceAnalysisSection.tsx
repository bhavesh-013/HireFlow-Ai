import React, { useState } from 'react';
import {
  BriefcaseBusiness,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  ChevronDown,
  Zap,
  Target
} from 'lucide-react';
import { ExperienceAnalysisResult, ExperienceAnalysisItem } from '../../services/experience.analyzer';

interface ExperienceAnalysisSectionProps {
  experienceAnalysis: ExperienceAnalysisResult;
}

export default function ExperienceAnalysisSection({
  experienceAnalysis,
}: ExperienceAnalysisSectionProps) {
  const [expandedRoles, setExpandedRoles] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedRoles((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { experiences, averageExperienceScore } = experienceAnalysis;

  if (experiences.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl text-center">
        <BriefcaseBusiness size={32} className="mx-auto text-slate-500 mb-2" />
        <h3 className="text-base font-bold text-white">No Work Experience Listed</h3>
        <p className="text-xs text-slate-400 mt-1">
          For entry-level/fresher profiles, emphasize technical projects and academic coursework.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <BriefcaseBusiness size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Work Experience Bullet Optimization
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                Avg Score: {averageExperienceScore}%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Bullet-by-bullet evaluation for action verb power, measurable impact, and STAR methodology.
            </p>
          </div>
        </div>
      </div>

      {/* Experience Roles List */}
      <div className="space-y-6 mt-6">
        {experiences.map((exp) => {
          const isExpanded = expandedRoles[exp.id] !== false;

          return (
            <div
              key={exp.id}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md"
            >
              {/* Role Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-850">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-400 font-bold font-mono">
                    {exp.relevanceScore}%
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">
                      {exp.title} <span className="text-slate-400 font-normal">at</span> {exp.company}
                    </h4>
                    <p className="text-xs text-slate-400">{exp.period}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border ${
                      exp.responsibilitiesAlignment === 'High'
                        ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                        : exp.responsibilitiesAlignment === 'Medium'
                        ? 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                        : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                    }`}
                  >
                    JD Responsibilities: {exp.responsibilitiesAlignment} Alignment
                  </span>

                  <button
                    type="button"
                    onClick={() => toggleExpand(exp.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 border border-slate-800 cursor-pointer"
                  >
                    <span>{isExpanded ? 'Hide Bullets' : 'View Bullets'}</span>
                    <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Matched Keywords in Role */}
              {exp.keyJdMatches.length > 0 && (
                <div className="flex items-center gap-1.5 my-3 flex-wrap">
                  <span className="text-[11px] font-bold text-slate-400">JD Keywords Evidenced:</span>
                  {exp.keyJdMatches.map((kw, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[10px] font-medium bg-blue-500/10 text-blue-200 border border-blue-500/20"
                    >
                      {kw}
                    </span>
                  ))}
                </div>
              )}

              {/* Bullets Breakdown */}
              {isExpanded && (
                <div className="space-y-4 mt-4">
                  {exp.bullets.map((bullet, bIdx) => (
                    <div
                      key={bIdx}
                      className="bg-slate-900/70 border border-slate-800/90 rounded-xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <span>Bullet #{bIdx + 1}</span>
                          {bullet.isStrong ? (
                            <span className="text-[10px] px-2 py-0.2 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                              Strong ATS Bullet
                            </span>
                          ) : (
                            <span className="text-[10px] px-2 py-0.2 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              Verb & Impact Optimization Recommended
                            </span>
                          )}
                        </span>

                        {bullet.suggestedActionVerb && (
                          <span className="text-[10px] font-mono font-bold text-blue-300 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded">
                            Action Verb: {bullet.suggestedActionVerb}
                          </span>
                        )}
                      </div>

                      {/* Before / After Dual Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                        {/* 🔴 Current */}
                        <div className="bg-slate-950/80 border border-red-500/25 rounded-lg p-3">
                          <p className="text-[11px] font-bold text-red-300 mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                            Current Bullet
                          </p>
                          <p className="text-slate-300 leading-relaxed">{bullet.currentText}</p>
                        </div>

                        {/* 🟢 Optimized */}
                        <div className="bg-slate-950/80 border border-emerald-500/35 rounded-lg p-3">
                          <p className="text-[11px] font-bold text-emerald-300 mb-1 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            Optimized (Action-Driven)
                          </p>
                          <p className="text-emerald-100 font-medium leading-relaxed">
                            {bullet.optimizedText}
                          </p>
                        </div>
                      </div>

                      {/* Issues & Guidance */}
                      {bullet.issues.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {bullet.issues.map((iss, iIdx) => (
                            <span
                              key={iIdx}
                              className="text-[10px] text-slate-300 bg-slate-800/80 border border-slate-700 px-2 py-0.5 rounded"
                            >
                              • {iss}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
