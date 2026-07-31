import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Target,
  Activity,
  BarChart3,
  FileText,
  Layers,
  TrendingUp,
  Maximize2,
  FileEdit,
  Edit2,
  MessageSquare,
  ArrowUpRight,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { mockResumes } from '../data/mockData';

export default function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Welcome Banner Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
            Welcome back, Alex
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Here's how your career materials are performing today.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/tailored"
            className="bg-white hover:bg-slate-50 border border-slate-200 text-[#0B192C] px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-2xs transition-all"
          >
            <Target size={16} className="text-blue-600" />
            <span>Tailor for a Job</span>
          </Link>

          <Link
            to="/builder"
            className="bg-[#0B192C] hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-xs transition-all"
          >
            <Sparkles size={16} className="text-blue-300" />
            <span>Build with AI</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Primary Performance Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Resume Health */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">Resume Health</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Activity size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0B192C]">82</span>
            <span className="text-base font-bold text-slate-500">%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '82%' }} />
          </div>
          <p className="font-mono text-[11px] text-slate-500 font-medium">+4 this week</p>
        </div>

        {/* Card 2: ATS Score */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">ATS Score</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart3 size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0B192C]">76</span>
            <span className="text-base font-bold text-slate-500">%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '76%' }} />
          </div>
          <p className="font-mono text-[11px] text-slate-500 font-medium">Passes major ATS</p>
        </div>

        {/* Card 3: Job Match */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">Job Match</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Target size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0B192C]">68</span>
            <span className="text-base font-bold text-slate-500">%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '68%' }} />
          </div>
          <p className="font-mono text-[11px] text-slate-500 font-medium">Sr. Frontend Eng.</p>
        </div>

        {/* Card 4: AI Improvement */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-600">AI Improvement</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Sparkles size={18} />
            </div>
          </div>
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-3xl sm:text-4xl font-black text-[#0B192C]">91</span>
            <span className="text-base font-bold text-slate-500">%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-3 overflow-hidden">
            <div className="bg-blue-600 h-2 rounded-full" style={{ width: '91%' }} />
          </div>
          <p className="font-mono text-[11px] text-slate-500 font-medium">12 suggestions applied</p>
        </div>
      </div>

      {/* Middle 4 Secondary Quick Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
            <FileText size={22} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0B192C]">7</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Total Resumes</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
            <Target size={22} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0B192C]">4</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Tailored Resumes</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
            <Layers size={22} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0B192C]">18</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Resume Versions</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shadow-2xs">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
            <TrendingUp size={22} />
          </div>
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-[#0B192C]">12</span>
              <span className="text-xs font-mono text-slate-400">today</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Recent Activity</p>
          </div>
        </div>
      </div>

      {/* Recent Resumes Section */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-[#0B192C] tracking-tight">
            Recent Resumes
          </h2>
          <Link
            to="/builder"
            className="text-xs font-bold text-slate-500 hover:text-[#0B192C] transition-colors"
          >
            View all
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 relative">
          {mockResumes.slice(0, 2).map((resume, idx) => (
            <div
              key={resume.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all relative group flex flex-col justify-between space-y-6"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                    {resume.title}
                  </h3>
                  <p className="text-xs text-slate-500">{resume.targetRole}</p>
                </div>
                <span className="bg-slate-100 text-slate-600 font-mono text-[11px] px-2.5 py-1 rounded-full font-medium shrink-0">
                  {resume.lastModified}
                </span>
              </div>

              {/* Metric Boxes Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-[#0B192C]">{resume.atsScore}%</div>
                  <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    ATS
                  </div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-[#0B192C]">{resume.healthScore}%</div>
                  <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    HEALTH
                  </div>
                </div>

                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 text-center">
                  <div className="text-lg font-black text-[#0B192C]">{resume.tailorScore}%</div>
                  <div className="font-mono text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                    TAILOR
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <span className="text-xs font-mono text-slate-400">
                  {resume.templateName} &middot; {resume.version}
                </span>
                <button
                  onClick={() => navigate('/editor')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0B192C] hover:text-blue-600"
                >
                  <span>Open Editor</span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          ))}

          {/* Floating Action Bar Overlay as rendered in screenshot */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-4 bg-[#0B192C] text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-3 border border-slate-700/80 text-xs z-20">
            <button
              onClick={() => navigate('/editor')}
              className="hover:text-blue-300 p-1 rounded-md transition-colors"
              title="Full Preview"
            >
              <Maximize2 size={15} />
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => navigate('/editor')}
              className="hover:text-blue-300 p-1 rounded-md transition-colors"
              title="Edit Content"
            >
              <FileEdit size={15} />
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => navigate('/ats-analysis')}
              className="hover:text-blue-300 p-1 rounded-md transition-colors"
              title="Analyze ATS"
            >
              <Edit2 size={15} />
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={() => navigate('/assistant')}
              className="hover:text-blue-300 p-1 rounded-md transition-colors"
              title="Ask AI Assistant"
            >
              <MessageSquare size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
