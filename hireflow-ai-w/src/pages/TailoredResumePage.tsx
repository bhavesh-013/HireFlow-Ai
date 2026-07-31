import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Upload,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowUpRight,
  BarChart3,
  ListChecks,
  Sliders
} from 'lucide-react';
import { mockResumes, mockJDMatch } from '../data/mockData';

export default function TailoredResumePage() {
  const navigate = useNavigate();
  const [selectedResumeId, setSelectedResumeId] = useState(mockResumes[0].id);
  const [jdText, setJdText] = useState(
    'We are seeking a Senior Frontend Engineer to build resilient design systems, optimize Web Vitals, and architect GraphQL data pipelines in React 18...'
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(true);

  const handleTailor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim()) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisComplete(true);
    }, 1200);
  };

  const selectedResume = mockResumes.find((r) => r.id === selectedResumeId) || mockResumes[0];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Page Title Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
            AI JOB TARGETING
          </span>
        </div>
        <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">
          Tailor Resume for Specific Job Description
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Paste the target job posting below to instantly align your keywords, skill density, and bullet achievements.
        </p>
      </div>

      {/* Inputs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Select Base Resume */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#0B192C] flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>1. Select Base Resume</span>
            </h3>
            <span className="text-xs font-mono text-slate-400 font-bold">Step 1 of 2</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Choose Document
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => setSelectedResumeId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B192C] focus:outline-none focus:border-[#0B192C]"
            >
              {mockResumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title} ({r.targetRole})
                </option>
              ))}
            </select>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#0B192C]">{selectedResume.title}</span>
                <span className="text-slate-500 font-mono">{selectedResume.version}</span>
              </div>
              <div className="flex gap-4 text-[11px] font-mono text-slate-600 pt-1">
                <span>ATS: <b>{selectedResume.atsScore}%</b></span>
                <span>Health: <b>{selectedResume.healthScore}%</b></span>
                <span>Tailor Match: <b>{selectedResume.tailorScore}%</b></span>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Paste Job Description */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#0B192C] flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              <span>2. Job Description or Posting</span>
            </h3>
            <span className="text-xs font-mono text-slate-400 font-bold">Step 2 of 2</span>
          </div>

          <form onSubmit={handleTailor} className="space-y-3">
            <textarea
              rows={5}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste full job description or requirements here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-[#0B192C] focus:outline-none focus:border-[#0B192C]"
            />

            <button
              type="submit"
              disabled={isAnalyzing}
              className="w-full bg-[#0B192C] hover:bg-slate-800 text-white py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Sparkles size={16} className="text-blue-300" />
              <span>{isAnalyzing ? 'Analyzing Job Keywords...' : 'Analyze & Tailor Resume'}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Analysis Results */}
      {analysisComplete && (
        <div className="space-y-6 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-[#0B192C]">AI Tailoring Recommendations</h2>
            <button
              onClick={() => navigate('/editor')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Apply Recommendations in Editor</span>
              <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Match Score Card */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Target Role Compatibility
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-[#0B192C]">{mockJDMatch.matchScore}%</span>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Good Fit
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Matched 7 out of 12 required core competencies for Stripe Senior Frontend Engineer.
              </p>
            </div>

            {/* Matched Skills */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle2 size={16} />
                <span>Found Keywords ({mockJDMatch.matchedSkills.length})</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {mockJDMatch.matchedSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle size={16} />
                <span>Missing High Impact Skills ({mockJDMatch.missingSkills.length})</span>
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {mockJDMatch.missingSkills.map((sk, idx) => (
                  <span
                    key={idx}
                    className="bg-amber-50 border border-amber-200/70 text-amber-800 text-[11px] font-medium px-2.5 py-1 rounded-lg"
                  >
                    {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
