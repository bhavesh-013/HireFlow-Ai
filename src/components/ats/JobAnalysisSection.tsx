import React, { useState } from 'react';
import {
  Briefcase,
  GraduationCap,
  Award,
  Layers,
  Code2,
  Cpu,
  CheckCircle2,
  ListOrdered,
  FileText,
  ChevronDown,
  Sparkles,
  Zap,
  Target
} from 'lucide-react';
import { ParsedJobDescription } from '../../services/jd.parser';

interface JobAnalysisSectionProps {
  parsedJd: ParsedJobDescription;
}

export default function JobAnalysisSection({ parsedJd }: JobAnalysisSectionProps) {
  const [activeTab, setActiveTab] = useState<'categorized' | 'skills' | 'responsibilities' | 'verbs'>('categorized');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <Target size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Job Description Analysis
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Extracted Structure
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Parsed role criteria, technical taxonomy, and qualification requirements.
            </p>
          </div>
        </div>

        {/* Quick Role Metadata Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-xs">
            <Briefcase size={14} className="text-blue-400" />
            <span className="text-slate-400">Role:</span>
            <span className="font-bold text-white">{parsedJd.jobTitle}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-xs">
            <Layers size={14} className="text-emerald-400" />
            <span className="text-slate-400">Exp:</span>
            <span className="font-bold text-emerald-300">
              {parsedJd.minYearsExperience ? `${parsedJd.minYearsExperience}+ Yrs` : parsedJd.experienceLevel}
            </span>
          </div>

          {parsedJd.educationalRequirements.length > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2 text-xs">
              <GraduationCap size={14} className="text-purple-400" />
              <span className="text-slate-400">Degree:</span>
              <span className="font-bold text-slate-200 truncate max-w-[140px]">
                {parsedJd.educationalRequirements[0]}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-5 border-b border-slate-800/80 pb-3 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('categorized')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'categorized'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Categorized Keywords ({parsedJd.rawKeywords.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('skills')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'skills'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Required vs Preferred Skills ({parsedJd.allSkills.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('responsibilities')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'responsibilities'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Key Responsibilities ({parsedJd.responsibilities.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verbs')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'verbs'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
          }`}
        >
          Action Verbs & Domain ({parsedJd.actionVerbs.length + parsedJd.domainTerminology.length})
        </button>
      </div>

      {/* Tab 1: Categorized Keywords */}
      {activeTab === 'categorized' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
          {/* Required Keywords */}
          <div className="bg-slate-950/60 border border-red-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                Required Skills ({parsedJd.categorizedKeywords.required.length})
              </span>
              <span className="text-[10px] bg-red-500/10 text-red-300 border border-red-500/20 px-2 py-0.5 rounded font-mono">
                Weight: High
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsedJd.categorizedKeywords.required.map((kw, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-red-500/10 text-red-200 border border-red-500/20 hover:border-red-400/40 transition-colors"
                >
                  {kw}
                </span>
              ))}
              {parsedJd.categorizedKeywords.required.length === 0 && (
                <p className="text-xs text-slate-500 italic">No specific required keywords extracted.</p>
              )}
            </div>
          </div>

          {/* Technical Skills */}
          <div className="bg-slate-950/60 border border-blue-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Technical Skills ({parsedJd.categorizedKeywords.technical.length})
              </span>
              <span className="text-[10px] bg-blue-500/10 text-blue-300 border border-blue-500/20 px-2 py-0.5 rounded font-mono">
                Hard Tech
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsedJd.categorizedKeywords.technical.map((tech, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-500/10 text-blue-200 border border-blue-500/20 hover:border-blue-400/40 transition-colors"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Tools & Technologies */}
          <div className="bg-slate-950/60 border border-purple-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                Tools & Technologies ({parsedJd.categorizedKeywords.toolsAndTech.length})
              </span>
              <span className="text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/20 px-2 py-0.5 rounded font-mono">
                Tooling
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsedJd.categorizedKeywords.toolsAndTech.map((tool, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/10 text-purple-200 border border-purple-500/20 hover:border-purple-400/40 transition-colors"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          {/* Preferred / Nice to have */}
          <div className="bg-slate-950/60 border border-amber-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Preferred Skills ({parsedJd.categorizedKeywords.preferred.length})
              </span>
              <span className="text-[10px] bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded font-mono">
                Bonus
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsedJd.categorizedKeywords.preferred.map((pref, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-200 border border-amber-500/20 hover:border-amber-400/40 transition-colors"
                >
                  {pref}
                </span>
              ))}
              {parsedJd.categorizedKeywords.preferred.length === 0 && (
                <p className="text-xs text-slate-500 italic">No preferred skills specifically designated.</p>
              )}
            </div>
          </div>

          {/* Soft Skills */}
          <div className="bg-slate-950/60 border border-emerald-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Soft Skills ({parsedJd.categorizedKeywords.softSkills.length})
              </span>
              <span className="text-[10px] bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">
                Behavioral
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsedJd.categorizedKeywords.softSkills.map((soft, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-200 border border-emerald-500/20 hover:border-emerald-400/40 transition-colors"
                >
                  {soft}
                </span>
              ))}
            </div>
          </div>

          {/* Domain Terms */}
          <div className="bg-slate-950/60 border border-teal-500/20 rounded-2xl p-4">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs font-bold text-teal-300 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-teal-400" />
                Domain Terminology ({parsedJd.domainTerminology.length})
              </span>
              <span className="text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded font-mono">
                Industry
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {parsedJd.domainTerminology.map((term, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-teal-500/10 text-teal-200 border border-teal-500/20 hover:border-teal-400/40 transition-colors"
                >
                  {term}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Skills with Importance & Frequency */}
      {activeTab === 'skills' && (
        <div className="mt-5 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {parsedJd.allSkills.map((skill, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      skill.importance === 'Critical'
                        ? 'bg-red-400'
                        : skill.importance === 'High'
                        ? 'bg-amber-400'
                        : 'bg-blue-400'
                    }`}
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{skill.name}</p>
                    <p className="text-[10px] text-slate-400">{skill.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                    JD Freq: {skill.frequency}x
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                      skill.importance === 'Critical'
                        ? 'bg-red-500/20 text-red-300 border-red-500/30'
                        : skill.importance === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}
                  >
                    {skill.importance}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Key Responsibilities */}
      {activeTab === 'responsibilities' && (
        <div className="mt-5 space-y-2.5">
          {parsedJd.responsibilities.map((resp, idx) => (
            <div
              key={idx}
              className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5 flex items-start gap-3 hover:border-slate-700 transition-colors"
            >
              <div className="w-5 h-5 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5">
                {idx + 1}
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">{resp}</p>
            </div>
          ))}
          {parsedJd.responsibilities.length === 0 && (
            <p className="text-xs text-slate-500 italic p-4 text-center">
              No individual bullet points detected; parsing derived from general description.
            </p>
          )}
        </div>
      )}

      {/* Tab 4: Action Verbs & Domain */}
      {activeTab === 'verbs' && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              Target Action Verbs In JD ({parsedJd.actionVerbs.length})
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {parsedJd.actionVerbs.map((verb, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-200 border border-amber-500/20"
                >
                  {verb}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award size={14} className="text-purple-400" />
              Certifications & Qualifications
            </h4>
            <div className="space-y-2">
              {parsedJd.certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-xs text-purple-200 font-medium"
                >
                  {cert}
                </div>
              ))}
              {parsedJd.certifications.length === 0 && (
                <p className="text-xs text-slate-500 italic">No specific certifications strictly mandated.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
