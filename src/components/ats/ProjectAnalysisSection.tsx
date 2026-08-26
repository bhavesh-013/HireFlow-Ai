import React, { useState } from 'react';
import {
  FileCode2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Layers,
  Code2,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { ProjectAnalysisResult, ProjectAnalysisItem } from '../../services/project.analyzer';

interface ProjectAnalysisSectionProps {
  projectAnalysis: ProjectAnalysisResult;
}

export default function ProjectAnalysisSection({
  projectAnalysis,
}: ProjectAnalysisSectionProps) {
  const [expandedProjects, setExpandedProjects] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedProjects((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const { projects, averageProjectScore } = projectAnalysis;

  if (projects.length === 0) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl text-center">
        <FileCode2 size={32} className="mx-auto text-slate-500 mb-2" />
        <h3 className="text-base font-bold text-white">No Projects Found in Resume</h3>
        <p className="text-xs text-slate-400 mt-1">
          Adding 2-3 relevant software projects with clear tech stacks will significantly boost your ATS relevance.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <FileCode2 size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Project Relevance & Optimization
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                Avg Relevance: {averageProjectScore}%
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates individual technical projects, tech stack alignment, and produces truthful Before/After optimizations.
            </p>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="space-y-6 mt-6">
        {projects.map((proj) => {
          const isExpanded = expandedProjects[proj.id] !== false; // expanded by default

          return (
            <div
              key={proj.id}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md"
            >
              {/* Project Card Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-850">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-purple-400 font-bold font-mono">
                    {proj.currentRelevanceScore}%
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white">{proj.projectName}</h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-slate-400">Target Role Relevance:</span>
                      <span
                        className={`text-xs font-bold font-mono ${
                          proj.currentRelevanceScore >= 80
                            ? 'text-emerald-400'
                            : proj.currentRelevanceScore >= 60
                            ? 'text-amber-400'
                            : 'text-red-400'
                        }`}
                      >
                        {proj.currentRelevanceScore}/100
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => toggleExpand(proj.id)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 text-xs font-semibold text-slate-300 border border-slate-800 cursor-pointer"
                >
                  <span>{isExpanded ? 'Hide Optimization' : 'View Optimization'}</span>
                  <ChevronDown size={14} className={`transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {/* Technologies & Keywords Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-4">
                {/* Matching Technologies */}
                <div className="bg-slate-900/60 border border-emerald-500/20 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <CheckCircle2 size={12} />
                    <span>Matching Tech ({proj.matchingTechnologies.length})</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {proj.matchingTechnologies.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-200 border border-emerald-500/20"
                      >
                        {t}
                      </span>
                    ))}
                    {proj.matchingTechnologies.length === 0 && (
                      <span className="text-xs text-slate-500 italic">No direct matching tech keywords</span>
                    )}
                  </div>
                </div>

                {/* Missing Technologies */}
                <div className="bg-slate-900/60 border border-amber-500/20 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <AlertTriangle size={12} />
                    <span>Missing Relevant Stack</span>
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {proj.missingTechnologies.map((t, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-200 border border-amber-500/20"
                      >
                        {t}
                      </span>
                    ))}
                    {proj.missingTechnologies.length === 0 && (
                      <span className="text-xs text-slate-500 italic">Tech stack well covered</span>
                    )}
                  </div>
                </div>

                {/* Weak Points / Feedback */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
                  <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Identified Areas
                  </p>
                  <p className="text-xs text-slate-300 leading-snug">
                    {proj.weakPoints[0] || 'Good alignment with target role.'}
                  </p>
                </div>
              </div>

              {/* Before / After Comparison */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-slate-850 space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles size={14} className="text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Factual Before vs. After Optimization
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Current (🔴 Red / Original) */}
                    <div className="bg-slate-900/90 border border-red-500/30 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-red-400" />
                          🔴 Current Project Description & Bullets
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 italic">{proj.currentDescription}</p>
                      {proj.currentBullets.length > 0 && (
                        <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                          {proj.currentBullets.map((b, i) => (
                            <li key={i} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>

                    {/* Optimized (🟢 Green / Improved) */}
                    <div className="bg-slate-900/90 border border-emerald-500/40 rounded-xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          🟢 Optimized (STAR Phrased, Truth-Preserved)
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100 font-medium">{proj.optimizedDescription}</p>
                      {proj.optimizedBullets.length > 0 && (
                        <ul className="space-y-1.5 text-xs text-emerald-100 list-disc list-inside">
                          {proj.optimizedBullets.map((b, i) => (
                            <li key={i} className="leading-relaxed">{b}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Recommendation notice */}
                  <p className="text-xs text-slate-400 bg-slate-900/50 p-2.5 rounded-xl border border-slate-800">
                    💡 <strong className="text-slate-300">ATS Recommendation:</strong> {proj.suggestedImprovements[0]}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
