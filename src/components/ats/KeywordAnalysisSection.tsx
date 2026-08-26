import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Search,
  MapPin,
  Sparkles,
  ShieldAlert,
  Info
} from 'lucide-react';
import { KeywordAnalysisResult, KeywordMatchItem } from '../../services/keyword.matcher';

interface KeywordAnalysisSectionProps {
  keywordAnalysis: KeywordAnalysisResult;
}

export default function KeywordAnalysisSection({
  keywordAnalysis,
}: KeywordAnalysisSectionProps) {
  const [filterQuery, setFilterQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'matched' | 'partial' | 'missing'>('all');

  const { matchedKeywords, partialKeywords, missingKeywords, matchPercentage } = keywordAnalysis;

  const matchesFilter = (item: KeywordMatchItem) => {
    if (!filterQuery) return true;
    return (
      item.name.toLowerCase().includes(filterQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(filterQuery.toLowerCase()) ||
      (item.naturalFitSection && item.naturalFitSection.toLowerCase().includes(filterQuery.toLowerCase()))
    );
  };

  const filteredMatched = matchedKeywords.filter(matchesFilter);
  const filteredPartial = partialKeywords.filter(matchesFilter);
  const filteredMissing = missingKeywords.filter(matchesFilter);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white tracking-tight">
              Keyword Match & Gap Analysis
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
              {matchPercentage}% Match Rate
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Exact and semantic keyword detection across Resume sections with contextual natural-fit recommendations.
          </p>
        </div>

        {/* Search / Filter input */}
        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search keywords or fit..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mt-5 border-b border-slate-800/80 pb-3 overflow-x-auto custom-scrollbar">
        <button
          type="button"
          onClick={() => setActiveCategory('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Keywords ({matchedKeywords.length + partialKeywords.length + missingKeywords.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('matched')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'matched'
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-800/60 text-emerald-400 hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 size={13} />
          <span>🟢 Matched ({matchedKeywords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('partial')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'partial'
              ? 'bg-amber-600 text-white'
              : 'bg-slate-800/60 text-amber-400 hover:bg-slate-800'
          }`}
        >
          <HelpCircle size={13} />
          <span>🟡 Partial ({partialKeywords.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveCategory('missing')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
            activeCategory === 'missing'
              ? 'bg-red-600 text-white'
              : 'bg-slate-800/60 text-red-400 hover:bg-slate-800'
          }`}
        >
          <AlertCircle size={13} />
          <span>🔴 Missing ({missingKeywords.length})</span>
        </button>
      </div>

      {/* 🔴 Missing Keywords Panel (Always prioritized for maximum actionable value) */}
      {(activeCategory === 'all' || activeCategory === 'missing') && filteredMissing.length > 0 && (
        <div className="mt-6">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h4 className="text-xs font-bold text-red-300 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>Missing Keywords & Natural Fit Recommendations ({filteredMissing.length})</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              Preserves factual integrity (add only if you have relevant experience)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMissing.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/70 border border-red-500/25 rounded-2xl p-4 hover:border-red-500/40 transition-colors"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-red-200">{item.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/10 text-red-300 border border-red-500/20">
                      {item.category}
                    </span>
                  </div>
                  {item.naturalFitSection && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <MapPin size={10} />
                      Fit: {item.naturalFitSection}
                    </span>
                  )}
                </div>

                {item.placementSuggestion && (
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 mt-2">
                    💡 <strong className="text-slate-200">Where it fits:</strong> {item.placementSuggestion}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🟢 Matched Keywords Panel */}
      {(activeCategory === 'all' || activeCategory === 'matched') && filteredMatched.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-emerald-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Matched Keywords Present in Resume ({filteredMatched.length})</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredMatched.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-emerald-500/20 rounded-xl p-3 flex items-center justify-between gap-2 hover:border-emerald-500/40 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{item.name}</p>
                  <div className="flex items-center gap-1 mt-1 flex-wrap">
                    {item.foundLocations.map((loc, lIdx) => (
                      <span
                        key={lIdx}
                        className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 capitalize"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    Found {item.frequencyInResume}x
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 🟡 Partial Keywords Panel */}
      {(activeCategory === 'all' || activeCategory === 'partial') && filteredPartial.length > 0 && (
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-3 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Partial / Related Concepts ({filteredPartial.length})</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredPartial.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-950/60 border border-amber-500/20 rounded-xl p-3 flex items-center justify-between gap-2"
              >
                <div>
                  <p className="text-xs font-bold text-amber-200">{item.name}</p>
                  <p className="text-[10px] text-slate-400">Related semantic term detected in profile</p>
                </div>
                <span className="text-[10px] bg-amber-500/10 text-amber-300 px-2 py-0.5 rounded border border-amber-500/20">
                  Partial
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
