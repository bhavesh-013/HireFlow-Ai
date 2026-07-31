import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  FileSearch,
  RefreshCw
} from 'lucide-react';
import { mockATSScores } from '../data/mockData';

export default function ATSAnalysisPage() {
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(false);
  const [issues, setIssues] = useState(mockATSScores.issues);

  const handleRescan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 1000);
  };

  const handleFixIssue = (id: string) => {
    setIssues((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-blue-100 text-blue-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
              PARSER AUDIT ENGINE
            </span>
          </div>
          <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
            ATS Compatibility Scan & Analysis
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time parsing simulation for Workday, Taleo, Greenhouse, Lever, and SAP SuccessFactors.
          </p>
        </div>

        <button
          onClick={handleRescan}
          disabled={isScanning}
          className="bg-[#0B192C] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <RefreshCw size={16} className={isScanning ? 'animate-spin' : ''} />
          <span>{isScanning ? 'Rescanning Document...' : 'Run New ATS Audit'}</span>
        </button>
      </div>

      {/* Main Score & Breakdown Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Gauge Box */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs text-center space-y-4 flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <ShieldCheck size={28} />
          </div>

          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Overall ATS Score
            </span>
            <div className="flex items-baseline justify-center gap-1 my-2">
              <span className="text-6xl font-black text-[#0B192C]">{mockATSScores.overall}</span>
              <span className="text-xl font-bold text-slate-400">/ 100</span>
            </div>
            <span className="inline-block bg-emerald-50 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200/60">
              {mockATSScores.status}
            </span>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed max-w-xs">
            Your document structure passes standard layout checks with minimal risk of parser rejection.
          </p>

          <button
            onClick={() => navigate('/editor')}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            <span>Fix All In Editor</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* Right Category Breakdown Progress Bars */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
          <h3 className="font-bold text-base text-[#0B192C] pb-3 border-b border-slate-100">
            Category Performance Audit
          </h3>

          <div className="space-y-4">
            {mockATSScores.breakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-[#0B192C]">{item.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 font-mono">{item.score}%</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded-md ${
                        item.score >= 85
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.score >= 70
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full ${
                      item.score >= 85
                        ? 'bg-emerald-600'
                        : item.score >= 70
                        ? 'bg-blue-600'
                        : 'bg-amber-500'
                    }`}
                    style={{ width: `${item.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Flagged ATS Issues List */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-bold text-base text-[#0B192C] flex items-center gap-2">
            <AlertTriangle size={18} className="text-amber-500" />
            <span>Detected Parser Issues ({issues.length})</span>
          </h3>
          <span className="text-xs font-mono text-slate-400 font-bold">1 Click Auto-Fix</span>
        </div>

        {issues.length === 0 ? (
          <div className="p-8 text-center bg-emerald-50/50 rounded-2xl border border-emerald-200/60 space-y-2">
            <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
            <p className="font-bold text-sm text-emerald-900">All ATS Issues Resolved!</p>
            <p className="text-xs text-emerald-700">Your resume is fully optimized for applicant tracking systems.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((iss) => (
              <div
                key={iss.id}
                className="p-4 rounded-2xl border bg-slate-50/80 border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded-full uppercase ${
                        iss.type === 'critical'
                          ? 'bg-red-100 text-red-700'
                          : iss.type === 'warning'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}
                    >
                      {iss.type} &middot; {iss.category}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-[#0B192C]">{iss.message}</p>
                  <p className="text-xs text-slate-600 leading-relaxed">{iss.solution}</p>
                </div>

                <button
                  onClick={() => handleFixIssue(iss.id)}
                  className="bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
                >
                  <Sparkles size={14} className="text-blue-300" />
                  <span>Auto-Fix Issue</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
