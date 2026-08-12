import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowUpRight,
  FileText,
  Scan,
  Sparkles,
  Target,
  MessageSquare,
  Layout,
  ShieldCheck,
  Cpu,
  Lock,
  GitFork,
  Download,
  Check,
  ChevronRight
} from 'lucide-react';
import QuickActionModal from '../components/QuickActionModal';
import TemplateModal from '../components/TemplateModal';

interface LandingPageProps {
  onOpenInfo?: (title: string, content: string) => void;
}

export default function LandingPage({ onOpenInfo }: LandingPageProps) {
  const navigate = useNavigate();
  const [quickAction, setQuickAction] = useState<'build' | 'analyse' | 'assistant' | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* SECTION 01: PROFILE */}
      <section id="profile" className="scroll-mt-12">
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          <span className="font-mono text-xs font-bold text-slate-400 tracking-widest">01</span>
          <h2 className="font-mono text-sm sm:text-base font-bold text-[#0B192C] tracking-widest uppercase">
            PROFILE
          </h2>
          <div className="flex-1 border-b border-slate-300/70 ml-2" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left Text & Primary CTAs */}
          <div className="lg:col-span-7 space-y-8">
            <p className="text-slate-700 font-normal text-base sm:text-lg md:text-xl leading-relaxed tracking-tight">
              HireFlow AI helps you create resumes, analyse ATS scores, tailor
              documents for specific jobs and prepare for interviews — all inside one
              calm, focused workspace. No scattered tools, no guesswork: write, score,
              refine and export from the same place.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => navigate('/app/builder?new=1')}
                className="bg-[#0B192C] text-white px-6 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide hover:bg-slate-800 transition-all duration-200 flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <span>Build Resume</span>
                <ArrowUpRight size={16} />
              </button>

              <button
                onClick={() => navigate('/app/ats-analysis')}
                className="bg-white border border-slate-300 text-[#0B192C] px-6 py-3 rounded-xl text-xs sm:text-sm font-bold tracking-wide hover:bg-slate-50 hover:border-slate-400 transition-all duration-200 shadow-2xs cursor-pointer"
              >
                Analyse Resume
              </button>
            </div>
          </div>

          {/* Right Quick Actions Stack */}
          <div className="lg:col-span-5 space-y-3">
            <div className="font-mono text-[11px] font-bold text-slate-400 tracking-widest uppercase mb-3">
              QUICK ACTIONS
            </div>

            {/* Quick Action 1 */}
            <div
              onClick={() => navigate('/app/builder?new=1')}
              className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0B192C] group-hover:bg-[#0B192C] group-hover:text-white transition-colors duration-200">
                  <FileText size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-[#0B192C]">
                    Build Resume
                  </h3>
                  <p className="text-xs text-slate-500">
                    Start a new draft with AI.
                  </p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#0B192C] transition-colors" />
            </div>

            {/* Quick Action 2 */}
            <div
              onClick={() => navigate('/app/ats-analysis')}
              className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0B192C] group-hover:bg-[#0B192C] group-hover:text-white transition-colors duration-200">
                  <Scan size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-[#0B192C]">
                    Analyse Resume
                  </h3>
                  <p className="text-xs text-slate-500">
                    Run an ATS report.
                  </p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#0B192C] transition-colors" />
            </div>

            {/* Quick Action 3 */}
            <div
              onClick={() => navigate('/app/assistant')}
              className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-4 flex items-center justify-between transition-all duration-200 cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-[#0B192C] group-hover:bg-[#0B192C] group-hover:text-white transition-colors duration-200">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm sm:text-base text-[#0B192C]">
                    AI Assistant
                  </h3>
                  <p className="text-xs text-slate-500">
                    Ask your career coach.
                  </p>
                </div>
              </div>
              <ArrowUpRight size={16} className="text-slate-400 group-hover:text-[#0B192C] transition-colors" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 02: SKILLS */}
      <section id="skills" className="scroll-mt-12">
        <div className="flex items-center gap-3 mb-8 sm:mb-10">
          <span className="font-mono text-xs font-bold text-slate-400 tracking-widest">02</span>
          <h2 className="font-mono text-sm sm:text-base font-bold text-[#0B192C] tracking-widest uppercase">
            SKILLS
          </h2>
          <div className="flex-1 border-b border-slate-300/70 ml-2" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-10 gap-x-8">
          {/* Skill 1 */}
          <div
            onClick={() => navigate('/app/builder?new=1')}
            className="space-y-2 border-b border-slate-200/60 pb-6 md:border-none md:pb-0 cursor-pointer group hover:bg-white p-3 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-between text-[#0B192C]">
              <div className="flex items-center gap-2.5">
                <FileText size={18} className="text-slate-700 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                  Resume Builder
                </h3>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
              Create ATS-friendly resumes in minutes.
            </p>
          </div>

          {/* Skill 2 */}
          <div
            onClick={() => navigate('/app/ats-analysis')}
            className="space-y-2 border-b border-slate-200/60 pb-6 md:border-none md:pb-0 cursor-pointer group hover:bg-white p-3 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-between text-[#0B192C]">
              <div className="flex items-center gap-2.5">
                <Scan size={18} className="text-slate-700 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                  ATS Analysis
                </h3>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
              Improve keyword matching and parsing.
            </p>
          </div>

          {/* Skill 3 */}
          <div
            onClick={() => navigate('/app/assistant')}
            className="space-y-2 border-b border-slate-200/60 pb-6 md:border-none md:pb-0 cursor-pointer group hover:bg-white p-3 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-between text-[#0B192C]">
              <div className="flex items-center gap-2.5">
                <Sparkles size={18} className="text-slate-700 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                  AI Assistant
                </h3>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
              Rewrite and optimise every section.
            </p>
          </div>

          {/* Skill 4 */}
          <div
            onClick={() => navigate('/app/builder?new=1')}
            className="space-y-2 border-b border-slate-200/60 pb-6 md:border-none md:pb-0 cursor-pointer group hover:bg-white p-3 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-between text-[#0B192C]">
              <div className="flex items-center gap-2.5">
                <Target size={18} className="text-slate-700 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                  JD Match
                </h3>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
              Tailor resumes for specific jobs.
            </p>
          </div>

          {/* Skill 5 */}
          <div
            onClick={() => navigate('/app/assistant')}
            className="space-y-2 border-b border-slate-200/60 pb-6 md:border-none md:pb-0 cursor-pointer group hover:bg-white p-3 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-between text-[#0B192C]">
              <div className="flex items-center gap-2.5">
                <MessageSquare size={18} className="text-slate-700 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                  Interview Coach
                </h3>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
              Practice interviews with AI feedback.
            </p>
          </div>

          {/* Skill 6 */}
          <div
            onClick={() => navigate('/app/templates')}
            className="space-y-2 cursor-pointer group hover:bg-white p-3 rounded-2xl transition-all"
          >
            <div className="flex items-center justify-between text-[#0B192C]">
              <div className="flex items-center gap-2.5">
                <Layout size={18} className="text-slate-700 group-hover:text-blue-600 transition-colors" />
                <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                  Resume Templates
                </h3>
              </div>
              <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
            </div>
            <p className="text-xs sm:text-sm text-slate-600 pl-7 leading-relaxed">
              Choose beautiful ATS-safe designs.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 03: EXPERIENCE */}
      <section id="experience" className="scroll-mt-12">
        <div className="flex items-center gap-3 mb-8 sm:mb-10">
          <span className="font-mono text-xs font-bold text-slate-400 tracking-widest">03</span>
          <h2 className="font-mono text-sm sm:text-base font-bold text-[#0B192C] tracking-widest uppercase">
            EXPERIENCE
          </h2>
          <div className="flex-1 border-b border-slate-300/70 ml-2" />
        </div>

        <div className="space-y-10">
          {/* Experience Item 1 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
            <div className="md:col-span-4 space-y-1">
              <h3 className="font-extrabold text-lg text-[#0B192C]">
                AI Resume Builder
              </h3>
              <div className="font-mono text-xs text-slate-400 tracking-widest uppercase">
                2026 &mdash; PRESENT
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                Create professional resumes using AI with real-time editing, section rewrites and
                instant template switching.
              </p>
              <div className="flex flex-wrap gap-2">
                {['DRAFTING', 'REWRITE', 'TEMPLATES'].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] sm:text-xs text-slate-500 uppercase bg-slate-100/90 border border-slate-200/80 px-3 py-1 rounded-full font-medium tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200/70" />

          {/* Experience Item 2 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
            <div className="md:col-span-4 space-y-1">
              <h3 className="font-extrabold text-lg text-[#0B192C]">
                ATS Analysis
              </h3>
              <div className="font-mono text-xs text-slate-400 tracking-widest uppercase">
                2026 &mdash; PRESENT
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                Analyse formatting, keywords and readability with instant scoring and line-level
                fixes before you apply.
              </p>
              <div className="flex flex-wrap gap-2">
                {['SCORING', 'KEYWORDS', 'PARSING'].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] sm:text-xs text-slate-500 uppercase bg-slate-100/90 border border-slate-200/80 px-3 py-1 rounded-full font-medium tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-200/70" />

          {/* Experience Item 3 */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-8 items-start">
            <div className="md:col-span-4 space-y-1">
              <h3 className="font-extrabold text-lg text-[#0B192C]">
                AI Career Coach
              </h3>
              <div className="font-mono text-xs text-slate-400 tracking-widest uppercase">
                2026 &mdash; PRESENT
              </div>
            </div>

            <div className="md:col-span-8 space-y-4">
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                Practice interviews and build confidence with role-specific questions and
                structured AI feedback.
              </p>
              <div className="flex flex-wrap gap-2">
                {['INTERVIEWS', 'FEEDBACK'].map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[10px] sm:text-xs text-slate-500 uppercase bg-slate-100/90 border border-slate-200/80 px-3 py-1 rounded-full font-medium tracking-wider"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 04: PROJECTS */}
      <section id="projects" className="scroll-mt-12">
        <div className="flex items-center gap-3 mb-8 sm:mb-10">
          <span className="font-mono text-xs font-bold text-slate-400 tracking-widest">04</span>
          <h2 className="font-mono text-sm sm:text-base font-bold text-[#0B192C] tracking-widest uppercase">
            PROJECTS
          </h2>
          <div className="flex-1 border-b border-slate-300/70 ml-2" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Document Preview Card 1 */}
          <div
            onClick={() => setSelectedTemplate('1')}
            className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-5 h-72 sm:h-80 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-2xs group"
          >
            <div className="space-y-4">
              {/* Top schematic header */}
              <div className="space-y-1.5 border-b border-slate-100 pb-3">
                <div className="h-3.5 bg-[#0B192C] rounded-xs w-3/4" />
                <div className="h-2 bg-slate-400/80 rounded-xs w-1/2" />
              </div>

              {/* Body schematic */}
              <div className="grid grid-cols-12 gap-2 pt-1">
                <div className="col-span-4 space-y-1.5 border-r border-slate-100 pr-2">
                  <div className="h-1.5 bg-slate-300 rounded-xs w-full" />
                  <div className="h-1.5 bg-slate-300 rounded-xs w-5/6" />
                  <div className="h-1.5 bg-slate-300 rounded-xs w-4/6" />
                  <div className="h-1.5 bg-slate-200 rounded-xs w-full mt-3" />
                  <div className="h-1.5 bg-slate-200 rounded-xs w-2/3" />
                </div>
                <div className="col-span-8 space-y-2 pl-1">
                  <div className="h-2 bg-slate-700/80 rounded-xs w-2/3 mb-2" />
                  <div className="h-1.5 bg-slate-300 rounded-xs w-full" />
                  <div className="h-1.5 bg-slate-300 rounded-xs w-11/12" />
                  <div className="h-1.5 bg-slate-300 rounded-xs w-4/5" />
                  <div className="h-1.5 bg-slate-300 rounded-xs w-full mt-3" />
                  <div className="h-1.5 bg-slate-300 rounded-xs w-3/4" />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-[#0B192C]">
              <span className="font-mono uppercase tracking-wider text-[11px]">Executive Template</span>
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Document Preview Card 2 */}
          <div
            onClick={() => setSelectedTemplate('2')}
            className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-5 h-72 sm:h-80 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-2xs group"
          >
            <div className="space-y-4">
              <div className="space-y-1.5 border-b border-slate-100 pb-3 text-center flex flex-col items-center">
                <div className="h-3.5 bg-[#0B192C] rounded-xs w-2/3" />
                <div className="h-2 bg-slate-400/80 rounded-xs w-1/3" />
              </div>

              <div className="space-y-2 pt-1">
                <div className="h-2 bg-slate-700/80 rounded-xs w-1/2" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-full" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-11/12" />
                <div className="h-2 bg-slate-700/80 rounded-xs w-1/2 mt-3" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-full" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-4/5" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-full mt-2" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-[#0B192C]">
              <span className="font-mono uppercase tracking-wider text-[11px]">Classic ATS Template</span>
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Document Preview Card 3 */}
          <div
            onClick={() => setSelectedTemplate('3')}
            className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-5 h-72 sm:h-80 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-2xs group"
          >
            <div className="space-y-4">
              <div className="space-y-1.5 border-b border-slate-100 pb-3 flex justify-between items-center">
                <div className="h-3.5 bg-[#0B192C] rounded-xs w-1/2" />
                <div className="h-2 bg-slate-400/80 rounded-xs w-1/4" />
              </div>

              <div className="space-y-2 pt-1">
                <div className="h-2 bg-slate-700/80 rounded-xs w-1/3" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-full" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-5/6" />
                <div className="h-2 bg-slate-700/80 rounded-xs w-1/3 mt-3" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-full" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-full" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-[#0B192C]">
              <span className="font-mono uppercase tracking-wider text-[11px]">Modern Minimalist</span>
              <ArrowUpRight size={14} />
            </div>
          </div>

          {/* Document Preview Card 4 */}
          <div
            onClick={() => setSelectedTemplate('4')}
            className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl p-5 h-72 sm:h-80 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-2xs group"
          >
            <div className="space-y-4">
              <div className="space-y-1.5 border-b border-slate-100 pb-3">
                <div className="h-4 bg-[#0B192C] rounded-xs w-4/5" />
                <div className="h-2 bg-slate-400/80 rounded-xs w-3/5" />
              </div>

              <div className="space-y-2 pt-1">
                <div className="h-2 bg-slate-700/80 rounded-xs w-2/5" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-full" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-11/12" />
                <div className="h-2 bg-slate-700/80 rounded-xs w-2/5 mt-3" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-full" />
                <div className="h-1.5 bg-slate-300 rounded-xs w-3/4" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 group-hover:text-[#0B192C]">
              <span className="font-mono uppercase tracking-wider text-[11px]">Technical Core</span>
              <ArrowUpRight size={14} />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 05: WORKFLOW & SECTION 06: CERTIFICATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* WORKFLOW */}
        <section id="workflow" className="scroll-mt-12">
          <div className="flex items-center gap-3 mb-8 sm:mb-10">
            <span className="font-mono text-xs font-bold text-slate-400 tracking-widest">05</span>
            <h2 className="font-mono text-sm sm:text-base font-bold text-[#0B192C] tracking-widest uppercase">
              WORKFLOW
            </h2>
            <div className="flex-1 border-b border-slate-300/70 ml-2" />
          </div>

          <div className="relative pl-6 space-y-8 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-[1px] before:bg-slate-300/80">
            {/* Step 01 */}
            <div
              onClick={() => navigate('/app/builder?new=1')}
              className="relative group cursor-pointer hover:bg-white p-3 rounded-2xl transition-all"
            >
              <div className="absolute -left-6 top-4 w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-white group-hover:bg-[#0B192C] group-hover:border-[#0B192C] transition-colors" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">01</span>
                    <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                      Create Resume
                    </h3>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Start fresh or import an existing document.
                </p>
              </div>
            </div>

            {/* Step 02 */}
            <div
              onClick={() => navigate('/app/ats-analysis')}
              className="relative group cursor-pointer hover:bg-white p-3 rounded-2xl transition-all"
            >
              <div className="absolute -left-6 top-4 w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-white group-hover:bg-[#0B192C] group-hover:border-[#0B192C] transition-colors" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">02</span>
                    <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                      Analyse
                    </h3>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Run an ATS report and review section scores.
                </p>
              </div>
            </div>

            {/* Step 03 */}
            <div
              onClick={() => navigate('/app/assistant')}
              className="relative group cursor-pointer hover:bg-white p-3 rounded-2xl transition-all"
            >
              <div className="absolute -left-6 top-4 w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-white group-hover:bg-[#0B192C] group-hover:border-[#0B192C] transition-colors" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">03</span>
                    <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                      Improve
                    </h3>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Apply AI suggestions and tailor to the role.
                </p>
              </div>
            </div>

            {/* Step 04 */}
            <div
              onClick={() => navigate('/app/builder?new=1')}
              className="relative group cursor-pointer hover:bg-white p-3 rounded-2xl transition-all"
            >
              <div className="absolute -left-6 top-4 w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-white group-hover:bg-[#0B192C] group-hover:border-[#0B192C] transition-colors" />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-400">04</span>
                    <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                      Apply
                    </h3>
                  </div>
                  <ArrowUpRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-slate-600">
                  Export a clean PDF and send it out.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CERTIFICATIONS */}
        <section id="certifications" className="scroll-mt-12">
          <div className="flex items-center gap-3 mb-8 sm:mb-10">
            <span className="font-mono text-xs font-bold text-slate-400 tracking-widest">06</span>
            <h2 className="font-mono text-sm sm:text-base font-bold text-[#0B192C] tracking-widest uppercase">
              CERTIFICATIONS
            </h2>
            <div className="flex-1 border-b border-slate-300/70 ml-2" />
          </div>

          <div className="space-y-3">
            {/* Cert 1 */}
            <div className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <ShieldCheck size={18} className="text-slate-700 shrink-0" />
                <span className="font-bold text-sm sm:text-base text-[#0B192C]">
                  ATS Friendly
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 tracking-widest uppercase">
                PARSING VERIFIED
              </span>
            </div>

            {/* Cert 2 */}
            <div className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <Cpu size={18} className="text-slate-700 shrink-0" />
                <span className="font-bold text-sm sm:text-base text-[#0B192C]">
                  AI Powered
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 tracking-widest uppercase">
                DEEPSEEK MODELS
              </span>
            </div>

            {/* Cert 3 */}
            <div className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <Lock size={18} className="text-slate-700 shrink-0" />
                <span className="font-bold text-sm sm:text-base text-[#0B192C]">
                  Privacy First
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 tracking-widest uppercase">
                YOUR DATA STAYS YOURS
              </span>
            </div>

            {/* Cert 4 */}
            <div className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <GitFork size={18} className="text-slate-700 shrink-0" />
                <span className="font-bold text-sm sm:text-base text-[#0B192C]">
                  Open Source
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 tracking-widest uppercase">
                PUBLIC CODEBASE
              </span>
            </div>

            {/* Cert 5 */}
            <div className="bg-white border border-slate-200 hover:border-slate-400 rounded-2xl px-5 py-4 flex items-center justify-between transition-all duration-200 shadow-2xs">
              <div className="flex items-center gap-3">
                <Download size={18} className="text-slate-700 shrink-0" />
                <span className="font-bold text-sm sm:text-base text-[#0B192C]">
                  Fast Export
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400 tracking-widest uppercase">
                PDF IN SECONDS
              </span>
            </div>
          </div>
        </section>
      </div>

      {/* CTA SECTION */}
      <section className="pt-8 sm:pt-12 border-t border-slate-300/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#0B192C] tracking-tight">
              Ready to build your next opportunity?
            </h2>
            <p className="text-slate-600 font-medium text-base sm:text-lg">
              Start free &mdash; no card, no setup.
            </p>
          </div>

          <Link
            to="/signup"
            className="bg-[#0B192C] text-white px-7 py-3.5 rounded-xl text-sm font-bold tracking-wide hover:bg-slate-800 transition-all duration-200 flex items-center justify-center gap-2 shrink-0 shadow-xs"
          >
            <span>Start Free</span>
            <ArrowUpRight size={18} />
          </Link>
        </div>
      </section>

      {/* Modals */}
      <QuickActionModal
        actionType={quickAction}
        onClose={() => setQuickAction(null)}
      />

      <TemplateModal
        templateId={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />
    </div>
  );
}
