import React from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  ArrowDown,
  Layout,
  FileCheck,
  Sparkles
} from 'lucide-react';
import { StructureAnalysisResult } from '../../services/structure.analyzer';

interface ResumeStructureSectionProps {
  structureAnalysis: StructureAnalysisResult;
}

export default function ResumeStructureSection({
  structureAnalysis,
}: ResumeStructureSectionProps) {
  const {
    sections,
    issues,
    structureScore,
    formattingScore,
    recommendedSectionOrder,
    isAtsCompliant,
  } = structureAnalysis;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <Layout size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Resume Structure & ATS Formatting Audit
              </h3>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                  isAtsCompliant
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}
              >
                {isAtsCompliant ? 'ATS Compliant Structure' : 'Action Items Detected'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Verifies section completeness, optimal reading hierarchy, paragraph density, and ATS parser safety.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completeness</p>
            <p className="text-sm font-black text-white font-mono">{structureScore}%</p>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 px-3 py-1.5 rounded-xl text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Formatting</p>
            <p className="text-sm font-black text-emerald-400 font-mono">{formattingScore}%</p>
          </div>
        </div>
      </div>

      {/* Sections Checklist */}
      <div className="mt-6">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
          Section Completeness Checklist
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {sections.map((sec) => (
            <div
              key={sec.key}
              className={`p-3.5 rounded-2xl border transition-all ${
                sec.isFound
                  ? 'bg-slate-950/60 border-emerald-500/20'
                  : sec.isRequired
                  ? 'bg-slate-950/60 border-red-500/30'
                  : 'bg-slate-950/40 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-bold text-white truncate">{sec.name}</span>
                {sec.isFound ? (
                  <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                ) : sec.isRequired ? (
                  <XCircle size={15} className="text-red-400 shrink-0" />
                ) : (
                  <HelpCircle size={15} className="text-slate-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2">{sec.feedback}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Formatting & Content Density Issues */}
      {issues.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <AlertTriangle size={14} className="text-amber-400" />
            <span>Structure & Formatting Improvements ({issues.length})</span>
          </h4>

          <div className="space-y-3">
            {issues.map((issue) => (
              <div
                key={issue.id}
                className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded border ${
                        issue.severity === 'Critical'
                          ? 'bg-red-500/20 text-red-300 border-red-500/30'
                          : issue.severity === 'Warning'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                      }`}
                    >
                      {issue.severity}
                    </span>
                    <span className="text-xs font-bold text-white">{issue.title}</span>
                  </div>
                  <p className="text-xs text-slate-400">{issue.description}</p>
                  <p className="text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-2 rounded-xl mt-2">
                    💡 <strong>How to resolve:</strong> {issue.recommendation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Section Order */}
      <div className="mt-6 pt-5 border-t border-slate-800/80">
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Sparkles size={14} className="text-blue-400" />
          <span>Optimal ATS Reading Order</span>
        </h4>
        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
          {recommendedSectionOrder.map((secName, idx) => (
            <React.Fragment key={idx}>
              <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-slate-200 shrink-0">
                <span className="text-blue-400 mr-1.5 font-mono">{idx + 1}.</span>
                <span>{secName}</span>
              </div>
              {idx < recommendedSectionOrder.length - 1 && (
                <span className="text-slate-600 shrink-0">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
