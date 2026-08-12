import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Target,
  BarChart3,
  FileText,
  PlusCircle,
  UploadCloud,
  Bot,
  Linkedin,
  Github,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Copy,
  Download,
  Trash2,
  Wand2,
  Briefcase,
  ChevronRight,
  X
} from 'lucide-react';
import { mockResumes, ResumeItem } from '../data/mockData';
import { resumes as resumesApi, isAuthenticated, getStoredUser } from '../lib/api';

function backendResumeToItem(doc: any): ResumeItem {
  return {
    id: doc._id,
    title: doc.title || 'Untitled Resume',
    targetRole: doc.resumeData?.personalInfo?.jobTitle || 'Not set',
    lastModified: doc.lastEdited ? new Date(doc.lastEdited).toLocaleDateString() : 'Just now',
    updatedAt: doc.lastEdited || doc.updatedAt || new Date().toISOString(),
    atsScore: doc.atsScore || 0,
    healthScore: doc.healthScore || 0,
    tailorScore: doc.atsScore || 0,
    templateName: doc.template || 'modern',
    fileSize: '—',
    status: doc.status === 'published' ? 'Published' : 'Draft',
    version: `v${doc.currentVersion || 1}`,
  };
}

interface ToastState {
  show: boolean;
  message: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  // Interactive Resumes State — loaded from the backend; falls back to mock
  // data only if the backend can't be reached (e.g. not configured yet).
  const [resumesList, setResumesList] = useState<ResumeItem[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });

  useEffect(() => {
    // Guests can browse the workspace, but there's no saved resume list to
    // fetch without an account — skip the call and show demo data directly,
    // rather than hitting a 401 and reporting it as a backend outage.
    if (!isAuthenticated()) {
      setResumesList(mockResumes);
      setIsGuestMode(true);
      setUsingFallbackData(true);
      setIsLoadingResumes(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const data: any = await resumesApi.list();
        if (cancelled) return;
        const list = Array.isArray(data) ? data.map(backendResumeToItem) : [];
        setResumesList(list);
        setUsingFallbackData(false);
      } catch {
        if (cancelled) return;
        // Backend not reachable/configured — show demo data instead of a broken screen
        setResumesList(mockResumes);
        setUsingFallbackData(true);
      } finally {
        if (!cancelled) setIsLoadingResumes(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Modal State for LinkedIn / GitHub import
  const [importModal, setImportModal] = useState<{ open: boolean; platform: 'LinkedIn' | 'GitHub' | null }>({
    open: false,
    platform: null
  });
  const [importInput, setImportInput] = useState('');

  const showNotification = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3500);
  };

  const handleContinueResume = () => {
    if (!usingFallbackData && resumesList.length > 0) {
      // resumesList is sorted by lastEdited desc — [0] is the latest unfinished resume
      navigate(`/app/builder?id=${resumesList[0].id}`);
    } else {
      // No saved resume yet — open Resume Builder upload state
      navigate('/app/builder');
    }
  };

  const handleCreateResume = () => {
    // Always open the Resume Builder upload / start screen
    navigate('/app/builder?new=1');
  };

  const handleDuplicate = async (id: string, title: string) => {
    if (usingFallbackData) {
      const existing = resumesList.find((r) => r.id === id);
      if (existing) {
        const duplicatedItem = {
          ...existing,
          id: `res-${Date.now()}`,
          title: `${title} (Copy)`,
          lastModified: 'Just now'
        };
        setResumesList([duplicatedItem, ...resumesList]);
        showNotification(`Duplicated "${title}" successfully.`);
      }
      return;
    }

    try {
      const created: any = await resumesApi.duplicate(id);
      setResumesList([backendResumeToItem(created), ...resumesList]);
      showNotification(`Duplicated "${title}" successfully.`);
    } catch (err: any) {
      showNotification(err?.message || `Could not duplicate "${title}".`);
    }
  };

  const handleRename = async (id: string, oldTitle: string) => {
    const newTitle = window.prompt('Enter new resume title:', oldTitle);
    if (!newTitle || !newTitle.trim() || newTitle === oldTitle) return;

    try {
      await resumesApi.rename(id, newTitle.trim());
      setResumesList((prev) => prev.map((r) => (r.id === id ? { ...r, title: newTitle.trim() } : r)));
      showNotification(`Renamed resume to "${newTitle.trim()}".`);
    } catch (err: any) {
      showNotification(err?.message || 'Could not rename resume.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (typeof window !== 'undefined' && !window.confirm(`Delete "${title}"?\nThis action cannot be undone.`)) {
      return;
    }

    if (usingFallbackData) {
      setResumesList(resumesList.filter((r) => r.id !== id));
      showNotification(`Deleted "${title}".`);
      return;
    }

    try {
      await resumesApi.remove(id);
      setResumesList(resumesList.filter((r) => r.id !== id));
      showNotification(`Deleted "${title}".`);
    } catch (err: any) {
      showNotification(err?.message || `Could not delete "${title}".`);
    }
  };

  const handleExport = (id: string, title: string) => {
    sessionStorage.setItem('hireflow_pending_export', 'pdf');
    if (usingFallbackData) {
      navigate('/app/builder');
    } else {
      navigate(`/app/builder?id=${id}`);
    }
  };

  const handleImportSubmit = () => {
    if (!importInput.trim()) return;
    showNotification(`Successfully imported profile data from ${importModal.platform}!`);
    setImportModal({ open: false, platform: null });
    setImportInput('');
    navigate('/app/ats-analysis');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-[#0B192C]">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B192C] text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Backend fallback / guest-mode notice */}
      {!isLoadingResumes && usingFallbackData && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 font-medium flex items-center gap-2">
          {isGuestMode ? (
            <span>👋 You're browsing as a guest — showing sample data. <a href="/signup" className="font-bold underline">Sign up free</a> to save real resumes and unlock AI features.</span>
          ) : (
            <span>⚠️ Showing demo data — couldn't reach the backend API. Start it with <code className="font-mono bg-amber-100 px-1 rounded">cd backend && npm run dev</code> and refresh.</span>
          )}
        </div>
      )}

      {/* 1. Welcome Hero Section */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 rounded-full text-xs font-mono font-bold text-slate-600">
            <Sparkles size={13} className="text-blue-600" />
            <span>HIREFLOW WORKSPACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B192C]">
            Good Morning, {getStoredUser()?.name?.split(' ')[0] || getStoredUser()?.full_name?.split(' ')[0] || 'Candidate'} 👋
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
            "You're <span className="font-bold text-[#0B192C] underline decoration-blue-500 decoration-2 underline-offset-4">22 ATS points</span> away from a highly optimized resume."
          </p>
        </div>

        {/* Hero CTAs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
          <button
            onClick={handleContinueResume}
            className="bg-[#0B192C] hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <span>Continue Resume</span>
            <ArrowUpRight size={16} />
          </button>
          <button
            onClick={handleCreateResume}
            className="bg-white hover:bg-slate-50 border border-slate-200/90 text-[#0B192C] px-5 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all cursor-pointer"
          >
            <Target size={16} className="text-blue-600" />
            <span>Create Resume</span>
          </button>
        </div>
      </div>

      {/* 2. Continue Working & 4. KPI Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Continue Working Card (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs flex flex-col justify-between space-y-5 hover:shadow-md transition-all">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Clock size={13} /> CONTINUING WORKSPACE
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold rounded-full">
              Most Recent
            </span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-[#0B192C]">
                  {resumesList[0]?.title || 'No resume yet'}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {resumesList[0]
                    ? `Last edited ${resumesList[0].lastModified}`
                    : 'Start your first resume to see it here.'}
                </p>
              </div>
              <button
                onClick={handleContinueResume}
                className="px-4 py-2 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shrink-0 flex items-center gap-1.5"
              >
                <span>{resumesList[0] ? 'Continue Editing' : 'Start a Resume'}</span>
                <ArrowUpRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">ATS Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#0B192C]">{resumesList[0]?.atsScore ?? '—'}</span>
                  <span className="text-xs text-slate-500 font-bold">/ 100</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Target Job Match</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#0B192C]">{resumesList[0]?.tailorScore ?? '—'}</span>
                  <span className="text-xs text-slate-500 font-bold">% Match</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. KPI Cards (5 Cols Grid) */}
        <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-3.5">
          {/* KPI 1: ATS Score */}
          <div
            onClick={() => navigate('/app/ats-analysis')}
            className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">ATS Score</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#0B192C]">76</span>
                <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  +18 Potential
                </span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart3 size={20} />
            </div>
          </div>

          {/* KPI 2: Job Match */}
          <div
            onClick={handleContinueResume}
            className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">Job Match</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#0B192C]">84%</span>
                <span className="text-xs text-slate-500 font-medium">Sr. Frontend</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Target size={20} />
            </div>
          </div>

          {/* KPI 3: Tailored Resumes */}
          <div
            onClick={handleContinueResume}
            className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">Tailored Resumes</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#0B192C]">4</span>
                <span className="text-xs text-slate-500 font-medium">Active versions</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <FileText size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* 8. Recent Resumes & 9. Activity Timeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 8. Compact Recent Resumes List (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#0B192C] tracking-tight">Recent Resumes</h2>
            <button
              onClick={() => navigate('/app/builder?new=1')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
            >
              + Create New
            </button>
          </div>

          <div className="space-y-2.5">
            {resumesList.map((res) => (
              <div
                key={res.id}
                className="bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex flex-wrap items-center justify-between gap-3 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white border border-slate-200 text-[#0B192C] rounded-xl shadow-2xs shrink-0">
                    <FileText size={18} />
                  </div>
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-[#0B192C]">{res.title}</h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      <span>ATS Score: <strong className="text-[#0B192C]">{res.atsScore}%</strong></span>
                      <span>&middot;</span>
                      <span>{res.lastModified}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => navigate(usingFallbackData ? '/app/builder' : `/app/builder?id=${res.id}`)}
                    className="px-3 py-1.5 bg-[#0B192C] hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1"
                  >
                    <span>Edit</span>
                    <ArrowUpRight size={12} />
                  </button>
                  <button
                    onClick={() => handleDuplicate(res.id, res.title)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-[#0B192C] rounded-lg transition-colors cursor-pointer"
                    title="Duplicate"
                  >
                    <Copy size={14} />
                  </button>
                  <button
                    onClick={() => handleExport(res.id, res.title)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-600 hover:text-[#0B192C] rounded-lg transition-colors cursor-pointer"
                    title="Export PDF"
                  >
                    <Download size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(res.id, res.title)}
                    className="p-1.5 bg-white border border-slate-200 text-slate-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 9. Recent Activity Timeline (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-[#0B192C] tracking-tight">Recent Activity Timeline</h2>
            <span className="font-mono text-[11px] text-slate-400">Chronological</span>
          </div>

          <div className="space-y-4 relative pl-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {/* Timeline item 1 */}
            <div className="relative pl-5 space-y-1">
              <div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full bg-[#0B192C] border-2 border-white ring-2 ring-slate-100" />
              <span className="text-[10px] font-mono font-bold text-slate-400 block">2 hours ago</span>
              <h4 className="text-xs font-bold text-[#0B192C]">Resume Edited</h4>
              <p className="text-[11px] text-slate-500">Updated Senior Software Engineer.pdf experience section.</p>
            </div>

            {/* Timeline item 2 */}
            <div className="relative pl-5 space-y-1">
              <div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full bg-blue-600 border-2 border-white ring-2 ring-blue-50" />
              <span className="text-[10px] font-mono font-bold text-slate-400 block">5 hours ago</span>
              <h4 className="text-xs font-bold text-[#0B192C]">ATS Scan Completed</h4>
              <p className="text-[11px] text-slate-500">Score improved from 68 to 76 (+8 ATS points).</p>
            </div>

            {/* Timeline item 3 */}
            <div className="relative pl-5 space-y-1">
              <div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full bg-emerald-600 border-2 border-white ring-2 ring-emerald-50" />
              <span className="text-[10px] font-mono font-bold text-slate-400 block">Yesterday</span>
              <h4 className="text-xs font-bold text-[#0B192C]">AI Suggestions Applied</h4>
              <p className="text-[11px] text-slate-500">Added Docker, STAR metrics, and optimized header format.</p>
            </div>

            {/* Timeline item 4 */}
            <div className="relative pl-5 space-y-1">
              <div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-white ring-2 ring-slate-100" />
              <span className="text-[10px] font-mono font-bold text-slate-400 block">2 days ago</span>
              <h4 className="text-xs font-bold text-[#0B192C]">Resume Exported</h4>
              <p className="text-[11px] text-slate-500">Exported Fullstack Developer (Stripe).pdf as ATS-compliant PDF.</p>
            </div>

            {/* Timeline item 5 */}
            <div className="relative pl-5 space-y-1">
              <div className="absolute -left-[5px] top-1.5 w-3 h-3 rounded-full bg-slate-400 border-2 border-white ring-2 ring-slate-100" />
              <span className="text-[10px] font-mono font-bold text-slate-400 block">3 days ago</span>
              <h4 className="text-xs font-bold text-[#0B192C]">Job Tailored</h4>
              <p className="text-[11px] text-slate-500">Matched resume with Stripe Senior Engineer job description.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Import Modal for LinkedIn / GitHub */}
      {importModal.open && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {importModal.platform === 'LinkedIn' ? (
                  <Linkedin className="text-[#0077B5]" size={20} />
                ) : (
                  <Github className="text-slate-900" size={20} />
                )}
                <h3 className="font-bold text-base text-[#0B192C]">
                  Import from {importModal.platform}
                </h3>
              </div>
              <button
                onClick={() => setImportModal({ open: false, platform: null })}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Enter your {importModal.platform} profile URL or handle to automatically extract skills, work history, and projects.
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#0B192C]">
                {importModal.platform} Profile URL
              </label>
              <input
                type="text"
                value={importInput}
                onChange={(e) => setImportInput(e.target.value)}
                placeholder={
                  importModal.platform === 'LinkedIn'
                    ? 'https://linkedin.com/in/alexkumar'
                    : 'https://github.com/alexkumar'
                }
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-sans text-[#0B192C] focus:outline-none focus:ring-2 focus:ring-[#0B192C]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setImportModal({ open: false, platform: null })}
                className="px-4 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                className="px-5 py-2 bg-[#0B192C] hover:bg-slate-800 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Start Import
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
