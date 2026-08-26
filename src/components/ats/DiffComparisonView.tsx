import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  FileText,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Eye,
  Columns2
} from 'lucide-react';
import type { ParsedResumeData } from '../../types';
import { FullResumeDiffReport, DiffBlock } from '../../services/diff.generator';

interface DiffComparisonViewProps {
  originalResume: ParsedResumeData;
  optimizedResume: ParsedResumeData;
  diffReport: FullResumeDiffReport;
}

export default function DiffComparisonView({
  originalResume,
  optimizedResume,
  diffReport,
}: DiffComparisonViewProps) {
  const [activeTab, setActiveTab] = useState<'diff' | 'sideBySide' | 'optimized' | 'original'>('diff');
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(id);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Header & Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Before & After Resume Comparison
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              {diffReport.totalModifications} Enhanced Sections
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Compare original content against ATS-optimized phrasing, STAR action bullets, and prioritized skill orders.
          </p>
        </div>

        {/* View Mode Toggle Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('diff')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'diff'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            🔍 Red/Green Diff ({diffReport.blocks.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sideBySide')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'sideBySide'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-600/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Columns2 size={13} />
            <span>Side-by-Side</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('optimized')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'optimized'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles size={13} />
            <span>Optimized View</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'original'
                ? 'bg-slate-800 text-white'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {/* 1. Red / Green Diff View */}
      {activeTab === 'diff' && (
        <div className="space-y-4 mt-6">
          <div className="flex items-center gap-4 text-xs text-slate-400 pb-2 border-b border-slate-800/60">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>🔴 Replaced / Weak Baseline</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>🟢 Added / Optimized Content</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>🟡 Alignment Category</span>
            </span>
          </div>

          {diffReport.blocks.map((block) => (
            <div
              key={block.id}
              className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4.5 space-y-3 hover:border-slate-700 transition-colors"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 border border-blue-500/20 uppercase font-mono">
                    {block.section}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-white">{block.itemTitle}</h4>
                </div>

                <div className="flex items-center gap-2">
                  {block.categoryTag && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                      {block.categoryTag}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => handleCopy(block.optimizedText, block.id)}
                    className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-[11px] text-slate-300 hover:text-white border border-slate-750 transition-colors cursor-pointer"
                  >
                    {copiedSection === block.id ? (
                      <>
                        <Check size={12} className="text-emerald-400" />
                        <span className="text-emerald-400 font-semibold">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy size={12} />
                        <span>Copy Optimized</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Diff Blocks */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {/* 🔴 Original */}
                <div className="bg-red-950/15 border border-red-500/30 rounded-xl p-3.5 space-y-1">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                    🔴 Original
                  </p>
                  <p className="text-red-200/90 leading-relaxed font-sans">{block.originalText}</p>
                </div>

                {/* 🟢 Optimized */}
                <div className="bg-emerald-950/20 border border-emerald-500/40 rounded-xl p-3.5 space-y-1">
                  <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                    🟢 Optimized
                  </p>
                  <p className="text-emerald-100 font-medium leading-relaxed font-sans">
                    {block.optimizedText}
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-400 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-850">
                💡 <strong className="text-slate-300">Why this improves ATS:</strong> {block.explanation}
              </p>
            </div>
          ))}

          {diffReport.blocks.length === 0 && (
            <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800">
              <CheckCircle2 size={32} className="mx-auto text-emerald-400 mb-2" />
              <h4 className="text-sm font-bold text-white">No Critical Text Discrepancies</h4>
              <p className="text-xs text-slate-400 mt-1">
                Your resume phrasing already closely matches the target job description format.
              </p>
            </div>
          )}
        </div>
      )}

      {/* 2. Side-by-Side Full View */}
      {activeTab === 'sideBySide' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">
          {/* Left: Original */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                <span>Original Candidate Resume</span>
              </h4>
            </div>

            <div className="space-y-4 text-xs text-slate-300 font-sans">
              <div>
                <p className="font-bold text-white text-sm">{originalResume.personalInfo?.fullName || 'Candidate'}</p>
                <p className="text-slate-400">{originalResume.personalInfo?.jobTitle}</p>
              </div>

              {originalResume.personalInfo?.summary && (
                <div>
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Professional Summary</p>
                  <p className="leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                    {originalResume.personalInfo.summary}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Technical Skills</p>
                <p className="leading-relaxed bg-slate-900/60 p-2.5 rounded-xl border border-slate-850">
                  {typeof originalResume.skills === 'string' ? originalResume.skills : 'No skills listed'}
                </p>
              </div>

              {(originalResume.experiences || []).map((exp, idx) => (
                <div key={idx} className="bg-slate-900/60 p-3 rounded-xl border border-slate-850 space-y-1">
                  <p className="font-bold text-slate-200">{exp.title} - {exp.company}</p>
                  <ul className="list-disc list-inside space-y-1 text-slate-400">
                    {(exp.bullets || []).map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Optimized */}
          <div className="bg-slate-950 border border-emerald-500/30 rounded-2xl p-5 space-y-4 shadow-lg shadow-emerald-950/20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-850">
              <h4 className="text-sm font-bold text-emerald-300 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Optimized & Tailored Resume</span>
              </h4>
              <button
                type="button"
                onClick={() => handleCopy(JSON.stringify(optimizedResume, null, 2), 'opt_full')}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 text-xs font-semibold transition-colors cursor-pointer border border-emerald-500/30"
              >
                {copiedSection === 'opt_full' ? 'Copied' : 'Copy Full Data'}
              </button>
            </div>

            <div className="space-y-4 text-xs text-emerald-100 font-sans">
              <div>
                <p className="font-bold text-white text-sm">{optimizedResume.personalInfo?.fullName || 'Candidate'}</p>
                <p className="text-emerald-400 font-semibold">{optimizedResume.personalInfo?.jobTitle}</p>
              </div>

              {optimizedResume.personalInfo?.summary && (
                <div>
                  <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Professional Summary</p>
                  <p className="leading-relaxed bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-100 font-medium">
                    {optimizedResume.personalInfo.summary}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider mb-1">Prioritized Technical Skills</p>
                <p className="leading-relaxed bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-500/30 text-emerald-100 font-medium">
                  {typeof optimizedResume.skills === 'string' ? optimizedResume.skills : ''}
                </p>
              </div>

              {(optimizedResume.experiences || []).map((exp, idx) => (
                <div key={idx} className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-500/30 space-y-1">
                  <p className="font-bold text-white">{exp.title} - {exp.company}</p>
                  <ul className="list-disc list-inside space-y-1 text-emerald-100">
                    {(exp.bullets || []).map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed font-medium">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. Pure Optimized View */}
      {activeTab === 'optimized' && (
        <div className="mt-6 bg-slate-950 border border-emerald-500/30 rounded-2xl p-6 space-y-6 max-w-4xl mx-auto shadow-2xl">
          <div className="text-center pb-5 border-b border-slate-800">
            <h2 className="text-xl font-black text-white">{optimizedResume.personalInfo?.fullName || 'Candidate'}</h2>
            <p className="text-sm font-bold text-emerald-400 mt-0.5">{optimizedResume.personalInfo?.jobTitle}</p>
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-slate-400 mt-2 font-mono">
              <span>{optimizedResume.personalInfo?.email}</span>
              <span>•</span>
              <span>{optimizedResume.personalInfo?.phone}</span>
              <span>•</span>
              <span>{optimizedResume.personalInfo?.location}</span>
            </div>
          </div>

          {optimizedResume.personalInfo?.summary && (
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Professional Summary</h4>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans bg-slate-900/60 p-4 rounded-xl border border-slate-800">
                {optimizedResume.personalInfo.summary}
              </p>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Technical Skills</h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {typeof optimizedResume.skills === 'string' ? optimizedResume.skills : ''}
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Work Experience</h4>
            <div className="space-y-4">
              {(optimizedResume.experiences || []).map((exp, idx) => (
                <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <p className="font-bold text-white text-sm">{exp.title} - {exp.company}</p>
                    <p className="text-xs text-slate-400">{exp.period}</p>
                  </div>
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-200">
                    {(exp.bullets || []).map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-3">Technical Projects</h4>
            <div className="space-y-4">
              {(optimizedResume.projects || []).map((proj, idx) => (
                <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                  <p className="font-bold text-white text-sm">{proj.title}</p>
                  {proj.description && <p className="text-xs text-slate-300 italic">{proj.description}</p>}
                  <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-200">
                    {(proj.bullets || []).map((b, bIdx) => (
                      <li key={bIdx} className="leading-relaxed">{b}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 4. Pure Original View */}
      {activeTab === 'original' && (
        <div className="mt-6 bg-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-4xl mx-auto">
          <div className="text-center pb-5 border-b border-slate-800">
            <h2 className="text-xl font-black text-white">{originalResume.personalInfo?.fullName || 'Candidate'}</h2>
            <p className="text-sm font-semibold text-slate-400 mt-0.5">{originalResume.personalInfo?.jobTitle}</p>
          </div>
          {originalResume.personalInfo?.summary && (
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Professional Summary</h4>
              <p className="text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
                {originalResume.personalInfo.summary}
              </p>
            </div>
          )}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Technical Skills</h4>
            <p className="text-xs text-slate-300 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              {typeof originalResume.skills === 'string' ? originalResume.skills : ''}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
