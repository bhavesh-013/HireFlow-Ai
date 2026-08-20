import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowUpRight,
  Sliders,
  Trash2,
  RotateCcw,
  Check,
  X,
  Eye,
  Layers,
  ArrowRight,
  ShieldCheck,
  Zap,
  Info,
  Building2,
  Briefcase
} from 'lucide-react';
import type { ParsedResumeData, TailoredResumeVersion, TailoringSuggestion, JDMatchBreakdown } from '../types';
import { analyzeJobDescription, type JDAnalysis } from '../services/jd.analyzer';
import { analyzeResume, calculateJdMatchBreakdown } from '../services/ats.engine';
import { generateJdTailoringSuggestions, applyTailoringSuggestion } from '../services/ai.improvement';
import { versionService } from '../services/version.service';
import { buildKeywordReport, MISSING_KEYWORD_USER_NOTICE } from '../services/keyword.engine';

export default function TailoredResumePage() {
  const navigate = useNavigate();

  // Load available resumes from localStorage or sample fallback
  const [baseResumes, setBaseResumes] = useState<ParsedResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [activeResumeData, setActiveResumeData] = useState<ParsedResumeData | null>(null);

  // Version management state
  const [tailoredVersions, setTailoredVersions] = useState<TailoredResumeVersion[]>([]);
  const [activeVersionId, setActiveVersionId] = useState<string>('original');

  // Input JD state
  const [targetCompany, setTargetCompany] = useState('');
  const [jdText, setJdText] = useState(
    `We are seeking a Senior Full Stack Software Engineer to build scalable microservices and high-throughput React frontends.
Requirements:
- 5+ years of experience with React, TypeScript, and Node.js
- Strong knowledge of PostgreSQL, Redis query caching, and Docker containerization
- Hands-on experience with AWS Cloud Services and CI/CD automated deployment pipelines
- Track record of writing Jest & Playwright unit test suites`
  );

  // Analysis & Engine state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null);
  const [generalAtsScore, setGeneralAtsScore] = useState<number>(84);
  const [jdMatchScore, setJdMatchScore] = useState<number>(72);
  const [jdBreakdown, setJdBreakdown] = useState<JDMatchBreakdown | null>(null);
  const [suggestions, setSuggestions] = useState<TailoringSuggestion[]>([]);

  // Preview state for individual suggestion
  const [previewSuggestionId, setPreviewSuggestionId] = useState<string | null>(null);

  // Toast notification
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Run on mount: Load real resumes
  useEffect(() => {
    const loaded: ParsedResumeData[] = [];
    try {
      const stored = localStorage.getItem('hireflow_current_resume');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed?.personalInfo?.fullName || parsed?.skills) {
          if (!parsed.id) parsed.id = 'res_base_1';
          loaded.push(parsed);
        }
      }
    } catch {}

    if (loaded.length === 0) {
      // Default sample fallback if no user resume in storage
      loaded.push({
        id: 'res_base_sample',
        title: 'Senior Frontend Engineer Resume',
        resumeType: 'experienced',
        personalInfo: {
          fullName: 'Alex Kumar',
          jobTitle: 'Senior Fullstack Engineer',
          email: 'alex.kumar@hireflow.ai',
          phone: '+1 (555) 382-9011',
          location: 'San Francisco, CA',
          website: 'https://alexkumar.dev',
          linkedin: 'https://linkedin.com/in/alexkumar-dev',
          github: 'https://github.com/alexkumar-dev',
          summary: 'Product-focused Senior Engineer with 6+ years of experience building scalable web applications with React, TypeScript, and Node.js.',
        },
        skills: 'Languages: React, TypeScript, JavaScript, HTML, CSS | Backend: Node.js, Express, REST APIs | Databases: PostgreSQL, MongoDB | DevOps: Git',
        experiences: [
          {
            id: 'exp1',
            company: 'TechCorp Innovations',
            title: 'Senior Software Engineer',
            period: '2022 - Present',
            bullets: [
              'Developed React web applications serving 120k monthly active users.',
              'Engineered backend REST endpoints using Node.js and PostgreSQL.',
            ],
          },
        ],
        education: [
          {
            id: 'edu1',
            degree: 'B.S. in Computer Science',
            institution: 'UC Berkeley',
            period: '2016 - 2020',
          },
        ],
        projects: [
          {
            id: 'proj1',
            title: 'HireFlow Platform',
            description: 'AI resume platform built with React and TypeScript.',
            techStack: ['React', 'TypeScript', 'Node.js'],
            bullets: ['Built fullstack application with sub-300ms latency.'],
          },
        ],
        certificates: [],
      });
    }

    setBaseResumes(loaded);
    setSelectedResumeId(loaded[0].id || 'res_base_sample');
    setActiveResumeData(loaded[0]);

    // Load tailored versions list
    const versions = versionService.listVersionsForResume(loaded[0].id || 'res_base_sample');
    setTailoredVersions(versions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle Base Resume switch
  const handleResumeSelect = (id: string) => {
    setSelectedResumeId(id);
    const found = baseResumes.find((r) => r.id === id) || baseResumes[0];
    setActiveResumeData(found);
    setActiveVersionId('original');
    const versions = versionService.listVersionsForResume(id);
    setTailoredVersions(versions);
  };

  // Run analysis pipeline
  const runTailoringAnalysis = (resume: ParsedResumeData, jd: string) => {
    if (!jd || jd.trim().length < 20) {
      setJdAnalysis(null);
      setJdBreakdown(null);
      return;
    }

    const jdRes = analyzeJobDescription(jd);
    setJdAnalysis(jdRes);

    // Calculate General ATS Score & JD Match Score separately
    const atsReport = analyzeResume(resume, { jobDescription: jd });
    setGeneralAtsScore(atsReport.finalScore);

    const breakdown = calculateJdMatchBreakdown(resume, jd);
    setJdBreakdown(breakdown);
    setJdMatchScore(breakdown.overallJdMatchScore);

    // Generate Tailoring Suggestions (NO invented content)
    const sug = generateJdTailoringSuggestions(resume, jd);
    setSuggestions(sug);
  };

  // Handle Form Submit — Analyze JD
  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!jdText.trim() || !activeResumeData) return;
    setIsAnalyzing(true);

    setTimeout(() => {
      setIsAnalyzing(false);
      runTailoringAnalysis(activeResumeData, jdText);
      showToast('Real JD analysis complete — separate General ATS & JD Match scores computed!');
    }, 600);
  };

  // Clear JD
  const handleClearJd = () => {
    setJdText('');
    setJdAnalysis(null);
    setJdBreakdown(null);
    setSuggestions([]);
    showToast('Cleared Job Description.');
  };

  // Create Tailored Resume Version (Preserves original 100%)
  const handleCreateTailoredVersion = () => {
    if (!activeResumeData || !jdText.trim()) return;

    const company = targetCompany.trim() || jdAnalysis?.industry || 'Target Employer';
    const role = jdAnalysis?.targetRole || activeResumeData.personalInfo?.jobTitle || 'Target Role';

    const version = versionService.createTailoredVersion(
      activeResumeData,
      jdText,
      company,
      role
    );

    const updatedVersions = versionService.listVersionsForResume(activeResumeData.id || '');
    setTailoredVersions(updatedVersions);
    setActiveVersionId(version.id);
    setActiveResumeData(version.parsedResume);

    // Populate suggestions for this new version
    const sug = generateJdTailoringSuggestions(version.parsedResume, jdText);
    setSuggestions(sug);

    showToast(`Created new tailored resume version: "${version.title}". Original resume remains untouched.`);
  };

  // Suggestion Approval Handlers: Preview, Apply, Reject, Undo
  const handleApplySuggestion = (sugId: string) => {
    if (!activeResumeData) return;
    const targetSug = suggestions.find((s) => s.id === sugId);
    if (!targetSug) return;

    const updatedResume = applyTailoringSuggestion(activeResumeData, targetSug);
    setActiveResumeData(updatedResume);

    // Mark suggestion as applied
    const updatedSugs = suggestions.map((s) => (s.id === sugId ? { ...s, status: 'applied' as const } : s));
    setSuggestions(updatedSugs);

    // If working on a tailored version, update its record
    if (activeVersionId !== 'original') {
      const appliedIds = updatedSugs.filter((s) => s.status === 'applied').map((s) => s.id);
      versionService.updateVersionContent(activeVersionId, updatedResume, appliedIds, updatedSugs);
    }

    // Re-run deterministic ATS & JD Match engines on updated content
    runTailoringAnalysis(updatedResume, jdText);
    showToast(`Applied tailoring: "${targetSug.reason.slice(0, 50)}..."`);
  };

  const handleRejectSuggestion = (sugId: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === sugId ? { ...s, status: 'rejected' as const } : s)));
    showToast('Suggestion rejected.');
  };

  const handleUndoSuggestion = (sugId: string) => {
    setSuggestions((prev) => prev.map((s) => (s.id === sugId ? { ...s, status: 'pending' as const } : s)));
    showToast('Suggestion reset to pending.');
  };

  // Switch between Original Base Resume and Tailored Versions
  const handleSwitchVersion = (vId: string) => {
    setActiveVersionId(vId);
    if (vId === 'original') {
      const base = baseResumes.find((r) => r.id === selectedResumeId) || baseResumes[0];
      const restored = versionService.restoreOriginal(base);
      setActiveResumeData(restored);
      runTailoringAnalysis(restored, jdText);
      showToast('Switched to Original Base Resume (Untouched).');
    } else {
      const v = versionService.getVersionById(vId);
      if (v) {
        setActiveResumeData(v.parsedResume);
        runTailoringAnalysis(v.parsedResume, v.jobDescriptionText);
        showToast(`Switched to version: "${v.title}".`);
      }
    }
  };

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-300 pb-28 text-[#0B192C] font-sans">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-blue-50 text-blue-800 text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border border-blue-200 inline-flex items-center gap-1">
              <Sparkles size={11} className="text-blue-600" /> REAL JD MATCHING & TAILORING
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#0B192C] tracking-tight">
            Tailor Resume for Target Job Posting
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
            Align your resume keywords, responsibilities, and technical stack with target job postings without fabricating experience or overwriting your original resume.
          </p>
        </div>

        {/* Version Safety Indicator */}
        <div className="bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl flex items-center gap-2 text-xs font-bold text-emerald-900 shrink-0">
          <ShieldCheck size={18} className="text-emerald-600" />
          <div>
            <span>Version Protection Active</span>
            <span className="block text-[10px] font-normal text-emerald-700">Original resume remains 100% untouched</span>
          </div>
        </div>
      </div>

      {/* Floating Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#0B192C] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200">
          <div className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg">
            <Sparkles size={16} />
          </div>
          <span className="text-xs font-bold">{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white ml-2 text-xs">
            <X size={14} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* INPUT SECTION: Base Resume Selection + JD Input                    */}
      {/* ------------------------------------------------------------------ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step 1: Select Base Resume & Version Selector */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#0B192C] flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span>1. Select Base Resume & Version</span>
            </h3>
            <span className="text-xs font-mono text-slate-400 font-bold">Step 1 of 2</span>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
              Base Resume Document
            </label>
            <select
              value={selectedResumeId}
              onChange={(e) => handleResumeSelect(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-[#0B192C] focus:outline-none focus:border-blue-600"
            >
              {baseResumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title || 'Untitled Resume'} ({r.personalInfo?.jobTitle || 'Software Engineer'})
                </option>
              ))}
            </select>

            {/* Version Switcher Tabs */}
            <div className="pt-2 space-y-2">
              <span className="block text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                ACTIVE VERSION (Original vs Tailored)
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => handleSwitchVersion('original')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeVersionId === 'original'
                      ? 'bg-[#0B192C] text-white shadow-2xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ShieldCheck size={13} className={activeVersionId === 'original' ? 'text-emerald-400' : ''} />
                  <span>Original (Base)</span>
                </button>

                {tailoredVersions.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleSwitchVersion(v.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      activeVersionId === v.id
                        ? 'bg-blue-600 text-white shadow-2xs font-black'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    <Target size={13} className={activeVersionId === v.id ? 'text-amber-300' : ''} />
                    <span>{v.targetCompany}</span>
                    <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[9px] font-mono rounded-full">
                      {v.jdMatchScore}%
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Resume Summary Card */}
            {activeResumeData && (
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs">
                <div className="flex justify-between items-center font-bold text-[#0B192C]">
                  <span>{activeResumeData.personalInfo?.fullName}</span>
                  <span className="text-blue-700 font-mono text-[11px]">{activeResumeData.personalInfo?.jobTitle}</span>
                </div>
                <p className="text-[11px] text-slate-600 line-clamp-2">
                  {activeResumeData.personalInfo?.summary || 'No summary text.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Step 2: Paste Job Description */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-bold text-base text-[#0B192C] flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              <span>2. Target Job Posting & Company</span>
            </h3>
            <span className="text-xs font-mono text-slate-400 font-bold">Step 2 of 2</span>
          </div>

          <form onSubmit={handleAnalyze} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                value={targetCompany}
                onChange={(e) => setTargetCompany(e.target.value)}
                placeholder="Target Company (e.g. Stripe, Google)"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-[#0B192C] focus:outline-none focus:border-blue-600"
              />
              <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                <Building2 size={13} /> Saved as separate tailored version
              </span>
            </div>

            <textarea
              rows={5}
              value={jdText}
              onChange={(e) => setJdText(e.target.value)}
              placeholder="Paste full job description or requirements here..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-[#0B192C] font-mono focus:outline-none focus:border-blue-600"
            />

            <div className="flex items-center gap-2 pt-1">
              <button
                type="submit"
                disabled={isAnalyzing}
                className="flex-1 bg-[#0B192C] hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles size={15} className="text-blue-300" />
                <span>{isAnalyzing ? 'Extracting Job Requirements...' : 'Analyze JD Match'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearJd}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors"
              >
                Clear JD
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* EMPTY STATES & SCORES SECTION                                     */}
      {/* ------------------------------------------------------------------ */}
      {!jdText.trim() ? (
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center space-y-2">
          <Info size={28} className="text-blue-500 mx-auto" />
          <h3 className="font-bold text-sm text-[#0B192C]">No Job Description Provided</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">
            Add a job description above to see how closely your resume matches this role, extract missing keywords, and create a tailored version.
          </p>
        </div>
      ) : jdText.trim().length < 20 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center space-y-2">
          <AlertCircle size={24} className="text-amber-600 mx-auto" />
          <h3 className="font-bold text-sm text-amber-900">Job Description Too Short</h3>
          <p className="text-xs text-amber-800 max-w-md mx-auto">
            The job description doesn't contain enough information for a reliable match. Please paste the full job posting requirements.
          </p>
        </div>
      ) : (
        <React.Fragment>
          {/* ------------------------------------------------------------------ */}
          {/* SEPARATE SCORES DASHBOARD: General ATS (0-100) vs JD Match (0-100%)*/}
          {/* ------------------------------------------------------------------ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* GENERAL ATS COMPATIBILITY CARD */}
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  GENERAL ATS COMPATIBILITY
                </span>
                <span className="px-2 py-0.5 bg-blue-50 text-blue-800 text-[10px] font-mono font-bold rounded">
                  Structural Audit
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-[#0B192C] font-mono">{generalAtsScore}</span>
                <span className="text-xs font-bold text-slate-400 font-mono">/100</span>
                <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ml-auto ${generalAtsScore >= 80 ? 'bg-emerald-50 text-emerald-800' : 'bg-blue-50 text-blue-800'}`}>
                  Estimated ATS Compatibility
                </span>
              </div>
              <p className="text-[11px] text-slate-500 italic border-t border-slate-100 pt-2">
                ATS systems vary by employer and configuration. This score is an estimate based on HireFlow's analysis rules.
              </p>
            </div>

            {/* JOB DESCRIPTION MATCH CARD (SEPARATE SCORE!) */}
            <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-2xs space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="font-mono text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                  <Target size={12} /> SPECIFIC JOB MATCH
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold rounded">
                  Role Fit
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-blue-900 font-mono">{jdMatchScore}%</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full ml-auto border border-emerald-200">
                  {jdMatchScore >= 80 ? 'Strong Match' : jdMatchScore >= 65 ? 'Good Role Match' : 'Needs Tailoring'}
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed border-t border-blue-50 pt-2">
                Evaluated against target posting requirements for <strong className="text-[#0B192C]">{jdAnalysis?.targetRole || 'Target Role'}</strong>.
              </p>
            </div>
          </div>

          {/* ------------------------------------------------------------------ */}
          {/* DETAILED JD MATCH BREAKDOWN CATEGORIES (Requirement 9)            */}
          {/* ------------------------------------------------------------------ */}
          {jdBreakdown && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                    TRANSPARENT MATCH BREAKDOWN
                  </span>
                  <h3 className="text-base font-bold text-[#0B192C]">Weighted Category Alignment</h3>
                </div>
                <button
                  type="button"
                  onClick={handleCreateTailoredVersion}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles size={14} />
                  <span>Create Tailored Resume Version</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">REQUIRED SKILLS</span>
                  <span className="text-lg font-black text-[#0B192C] font-mono">{Math.round((jdBreakdown.skillMatch / 100) * 25)}/25</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">RESPONSIBILITIES</span>
                  <span className="text-lg font-black text-[#0B192C] font-mono">{Math.round((jdBreakdown.responsibilityMatch / 100) * 25)}/25</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">TECH STACK</span>
                  <span className="text-lg font-black text-[#0B192C] font-mono">{Math.round((jdBreakdown.technologyMatch / 100) * 20)}/20</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">EXPERIENCE</span>
                  <span className="text-lg font-black text-[#0B192C] font-mono">{Math.round((jdBreakdown.experienceMatch / 100) * 10)}/10</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">EDUCATION</span>
                  <span className="text-lg font-black text-[#0B192C] font-mono">{Math.round((jdBreakdown.educationMatch / 100) * 5)}/5</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">JOB TITLE MATCH</span>
                  <span className="text-lg font-black text-[#0B192C] font-mono">{Math.round((jdBreakdown.jobTitleMatch / 100) * 5)}/5</span>
                </div>
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* MISSING SKILLS WITH NOTICE (Requirement 10 & 11)                   */}
          {/* ------------------------------------------------------------------ */}
          {jdAnalysis && jdAnalysis.requiredSkills.length > 0 && (
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle size={18} className="text-amber-600" />
                  <h3 className="text-base font-bold text-[#0B192C]">Missing & Unmatched Role Skills</h3>
                </div>
                <span className="text-xs font-mono font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                  User Guidance Required
                </span>
              </div>

              {/* Mandatory Notice Required by Task 5 */}
              <div className="p-3 bg-blue-50 border border-blue-200 text-blue-900 rounded-xl text-xs font-bold flex items-center gap-2">
                <Info size={16} className="text-blue-600 shrink-0" />
                <span>{MISSING_KEYWORD_USER_NOTICE}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {jdAnalysis.requiredSkills.slice(0, 9).map((gap) => {
                  const resumeText = JSON.stringify(activeResumeData || {}).toLowerCase();
                  const isFound = resumeText.includes((gap.skill || '').toLowerCase());
                  return (
                    <div
                      key={gap.skill}
                      className={`p-3.5 rounded-xl border space-y-1.5 ${
                        isFound
                          ? 'bg-emerald-50/50 border-emerald-200 text-emerald-950'
                          : 'bg-amber-50/50 border-amber-200 text-amber-950'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold text-xs">
                        <span>{gap.skill}</span>
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold uppercase ${
                            isFound ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isFound ? 'Found' : gap.importance}
                        </span>
                      </div>
                      <p className="text-[11px] opacity-80 leading-normal">
                        {isFound
                          ? 'Detected in candidate profile.'
                          : `Required by job description (${gap.frequency}x) but absent from resume.`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ------------------------------------------------------------------ */}
          {/* AI TAILORING SUGGESTIONS & APPROVAL WORKFLOW (Requirements 18 & 19)*/}
          {/* ------------------------------------------------------------------ */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                  USER APPROVAL WORKFLOW
                </span>
                <h3 className="text-lg font-bold text-[#0B192C] flex items-center gap-2 mt-0.5">
                  <Sparkles size={18} className="text-blue-600" />
                  <span>AI Tailoring Suggestions ({suggestions.length})</span>
                </h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                Only clicking <b>Apply</b> mutates resume content
              </span>
            </div>

            {suggestions.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-4 text-center">
                No pending tailoring suggestions. Resume content aligns well with available JD keywords.
              </p>
            ) : (
              <div className="space-y-4">
                {suggestions.map((sug) => (
                  <div
                    key={sug.id}
                    className={`p-5 rounded-2xl border transition-all space-y-3 ${
                      sug.status === 'applied'
                        ? 'bg-emerald-50/40 border-emerald-300'
                        : sug.status === 'rejected'
                        ? 'bg-slate-50 border-slate-200 opacity-60'
                        : 'bg-white border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200 text-[10px] font-mono font-bold rounded-md uppercase">
                          {sug.section}
                        </span>
                        <span className="text-xs font-bold text-[#0B192C]">{sug.reason}</span>
                      </div>

                      {/* Action Buttons: Preview, Apply, Reject, Undo */}
                      <div className="flex items-center gap-2">
                        {sug.status === 'applied' ? (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1">
                              <Check size={13} /> Applied
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUndoSuggestion(sug.id)}
                              className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                            >
                              Undo
                            </button>
                          </div>
                        ) : sug.status === 'rejected' ? (
                          <button
                            type="button"
                            onClick={() => handleUndoSuggestion(sug.id)}
                            className="text-xs font-bold text-slate-600 hover:text-slate-900 underline cursor-pointer"
                          >
                            Reset
                          </button>
                        ) : (
                          <React.Fragment>
                            <button
                              type="button"
                              onClick={() => handleApplySuggestion(sug.id)}
                              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Check size={13} />
                              <span>Apply</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleRejectSuggestion(sug.id)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors flex items-center gap-1"
                            >
                              <X size={13} />
                              <span>Reject</span>
                            </button>
                          </React.Fragment>
                        )}
                      </div>
                    </div>

                    {/* BEFORE / AFTER COMPARISON CARD (Requirement 19) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                      <div className="p-3 bg-red-50/50 border border-red-200/80 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono font-bold text-red-800 uppercase block">ORIGINAL</span>
                        <p className="text-slate-800">{sug.originalText}</p>
                      </div>
                      <div className="p-3 bg-emerald-50/50 border border-emerald-200/80 rounded-xl space-y-1">
                        <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase block">TAILORED (PROPOSED)</span>
                        <p className="text-slate-900 font-medium">{sug.suggestedText}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </React.Fragment>
      )}
    </div>
  );
}
