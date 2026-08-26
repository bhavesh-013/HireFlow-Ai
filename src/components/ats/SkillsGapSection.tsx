import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Cpu,
  Layers,
  ChevronRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { SkillGapAnalysisResult, SkillGapItem } from '../../services/skill.matcher';

interface SkillsGapSectionProps {
  skillGapAnalysis: SkillGapAnalysisResult;
}

export default function SkillsGapSection({ skillGapAnalysis }: SkillsGapSectionProps) {
  const [filter, setFilter] = useState<'all' | 'strong' | 'partial' | 'missing'>('all');

  const { strongMatches, partialMatches, missingSkills, skillsMatchPercentage } = skillGapAnalysis;

  const getFilteredList = (): SkillGapItem[] => {
    if (filter === 'strong') return strongMatches;
    if (filter === 'partial') return partialMatches;
    if (filter === 'missing') return missingSkills;
    return skillGapAnalysis.skills;
  };

  const list = getFilteredList();

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Cpu size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white tracking-tight">
                Skills Gap & Verification Analysis
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {skillsMatchPercentage}% Skill Alignment
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates whether required technical skills are backed by concrete project or work evidence.
            </p>
          </div>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('strong')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'strong'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 hover:bg-emerald-500/20'
            }`}
          >
            <CheckCircle2 size={13} />
            <span>🟢 Strong ({strongMatches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('partial')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'partial'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-500/10 text-amber-300 border border-amber-500/20 hover:bg-amber-500/20'
            }`}
          >
            <HelpCircle size={13} />
            <span>🟡 Partial ({partialMatches.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setFilter('missing')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              filter === 'missing'
                ? 'bg-red-600 text-white'
                : 'bg-red-500/10 text-red-300 border border-red-500/20 hover:bg-red-500/20'
            }`}
          >
            <AlertCircle size={13} />
            <span>🔴 Missing ({missingSkills.length})</span>
          </button>
        </div>
      </div>

      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-6">
        {list.map((skill, idx) => (
          <div
            key={idx}
            className={`bg-slate-950/70 border rounded-2xl p-4 transition-all ${
              skill.grade === 'strong'
                ? 'border-emerald-500/20 hover:border-emerald-500/40'
                : skill.grade === 'partial'
                ? 'border-amber-500/20 hover:border-amber-500/40'
                : 'border-red-500/20 hover:border-red-500/40'
            }`}
          >
            <div className="flex items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    skill.grade === 'strong'
                      ? 'bg-emerald-400'
                      : skill.grade === 'partial'
                      ? 'bg-amber-400'
                      : 'bg-red-400'
                  }`}
                />
                <h4 className="text-sm font-bold text-white">{skill.name}</h4>
                <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                  {skill.category}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {skill.isRequired && (
                  <span className="text-[10px] font-bold text-red-300 bg-red-500/20 border border-red-500/30 px-2 py-0.5 rounded">
                    Required
                  </span>
                )}
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${
                    skill.grade === 'strong'
                      ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                      : skill.grade === 'partial'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-red-500/10 text-red-300 border-red-500/30'
                  }`}
                >
                  {skill.grade} Match
                </span>
              </div>
            </div>

            {skill.evidenceContext && (
              <p className="text-xs text-emerald-300/90 bg-emerald-500/5 border border-emerald-500/15 p-2 rounded-xl mt-2 font-mono">
                ✓ {skill.evidenceContext}
              </p>
            )}

            <p className="text-xs text-slate-300 mt-2.5 leading-relaxed">
              💡 {skill.recommendation}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
