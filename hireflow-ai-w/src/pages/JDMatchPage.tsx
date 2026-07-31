import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileSearch,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  TrendingUp,
  Target
} from 'lucide-react';
import { mockJDMatch } from '../data/mockData';

export default function JDMatchPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
              JD ALIGNMENT AUDITOR
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
            Job Description Keyword Density & Match
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Target Company: <b>{mockJDMatch.company}</b> &middot; Role: <b>{mockJDMatch.jobTitle}</b>
          </p>
        </div>

        <button
          onClick={() => navigate('/tailored')}
          className="bg-[#0B192C] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <Target size={16} className="text-blue-300" />
          <span>Tailor Another Job</span>
        </button>
      </div>

      {/* Match Score Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-blue-50 text-blue-600 flex flex-col items-center justify-center font-black shrink-0 border border-blue-200/80">
            <span className="text-2xl">{mockJDMatch.matchScore}%</span>
            <span className="text-[9px] uppercase font-mono font-bold text-blue-700">MATCH</span>
          </div>
          <div>
            <h3 className="font-bold text-lg text-[#0B192C]">{mockJDMatch.jobTitle}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{mockJDMatch.company}</p>
            <p className="text-xs text-slate-600 mt-2">
              Found 7 out of 12 required skill terms in your primary resume version.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/editor')}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <span>Optimize in Editor</span>
          <ArrowUpRight size={15} />
        </button>
      </div>

      {/* Keyword Density Matrix Table */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <h3 className="font-bold text-base text-[#0B192C] pb-3 border-b border-slate-100 flex items-center gap-2">
          <FileSearch size={18} className="text-blue-600" />
          <span>Keyword Frequency Comparison</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px] uppercase">
                <th className="py-3 px-4">Keyword Term</th>
                <th className="py-3 px-4">JD Frequency</th>
                <th className="py-3 px-4">Your Resume Frequency</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {mockJDMatch.keywordDensity.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-[#0B192C]">{row.keyword}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{row.countInJD} times</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{row.countInResume} times</td>
                  <td className="py-3 px-4">
                    {row.countInResume >= row.countInJD / 2 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 size={12} />
                        <span>Sufficient</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                        <AlertCircle size={12} />
                        <span>Low Density</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
