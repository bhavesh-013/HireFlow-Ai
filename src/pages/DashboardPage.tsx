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
  X,
  Lock
} from 'lucide-react';
import type { ResumeItem } from '../data/resumeListTypes';
import { resumes as resumesApi, activity as activityApi, isAuthenticated, getStoredUser } from '../lib/api';
import { rememberCurrentLocationForRedirect } from '../lib/authGate';
import { analyzeResume } from '../services/ats.engine';

function getPersistedAtsScore(doc: any): number | null {
  if (typeof doc.ats_score === 'number') return doc.ats_score;
  if (typeof doc.atsScore === 'number') return doc.atsScore;
  if (typeof doc.resumeData?.meta?.atsScore === 'number') return doc.resumeData.meta.atsScore;
  if (typeof doc.resumeData?.atsScore === 'number') return doc.resumeData.atsScore;
  return null;
}

/**
 * Converts a stored resume document into a dashboard list item.
 */
function backendResumeToItem(doc: any): ResumeItem {
  const atsScore = getPersistedAtsScore(doc);
  let structureScore: number | null = null;
  if (typeof doc.structure_score === 'number') {
    structureScore = doc.structure_score;
  } else if (typeof doc.resumeData?.meta?.structureScore === 'number') {
    structureScore = doc.resumeData.meta.structureScore;
  }

  return {
    id: doc.id || doc._id,
    title: doc.title || 'Untitled Resume',
    targetRole: doc.targetRole || doc.resumeData?.personalInfo?.jobTitle || 'Not set',
    lastModified: doc.updatedAt ? new Date(doc.updatedAt).toLocaleDateString() : 'Just now',
    updatedAt: doc.updatedAt || new Date().toISOString(),
    atsScore,
    healthScore: structureScore,
    tailorScore: structureScore,
    templateName: doc.templateName || 'modern',
    fileSize: '—',
    status: doc.isArchived ? 'Draft' : 'Published',
    version: 'v1',
  };
}

function formatActivityTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  } catch {
    return 'Recently';
  }
}

interface ToastState {
  show: boolean;
  message: string;
}

export default function DashboardPage() {
  const navigate = useNavigate();

  // Route protection gate for Dashboard
  if (!isAuthenticated()) {
    return (
      <div className="min-h-[65vh] flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
        <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-10 max-w-md w-full shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock size={30} />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-black text-[#0B192C]">Please sign in first</h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Please sign in first to access your dashboard and manage your saved resumes.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                rememberCurrentLocationForRedirect('/app/dashboard', '');
                navigate('/?auth=login');
              }}
              className="w-full bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-sm px-6 py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2"
            >
              <span>Sign In</span>
            </button>
            <button
              onClick={() => {
                rememberCurrentLocationForRedirect('/app/dashboard', '');
                navigate('/?auth=signup');
              }}
              className="w-full bg-slate-100 hover:bg-slate-200 text-[#0B192C] font-bold text-sm px-6 py-3 rounded-xl transition-all cursor-pointer"
            >
              Sign Up Free
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Resumes are always loaded from the real backend — never from seeded demo data.
  const [resumesList, setResumesList] = useState<ResumeItem[]>([]);
  const [activityList, setActivityList] = useState<any[]>([]);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGuestMode, setIsGuestMode] = useState(false);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '' });

  const loadResumes = () => {
    setIsLoadingResumes(true);
    setLoadError(null);
    resumesApi
      .list()
      .then((data: any) => {
        const list = Array.isArray(data) ? data.map(backendResumeToItem) : [];
        setResumesList(list);
      })
      .catch((err: any) => {
        setResumesList([]);
        setLoadError(err?.message || "Couldn't load your resumes. Please try again.");
      })
      .finally(() => setIsLoadingResumes(false));
  };

  const loadActivities = () => {
    activityApi
      .listRecent(10)
      .then((data: any) => {
        setActivityList(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setActivityList([]);
      });
  };

  useEffect(() => {
    setIsGuestMode(!isAuthenticated());
    loadResumes();
    loadActivities();
  }, []);

  const showNotification = (msg: string) => {
    setToast({ show: true, message: msg });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3500);
  };

  const handleContinueResume = () => {
    if (resumesList.length > 0) {
      // resumesList is sorted by updatedAt desc — [0] is the most recent resume
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

    try {
      await resumesApi.remove(id);
      await activityApi.log('RESUME_DELETED', null, `Deleted "${title}"`);
      setResumesList(resumesList.filter((r) => r.id !== id));
      loadActivities();
      showNotification(`Deleted "${title}".`);
    } catch (err: any) {
      showNotification(err?.message || `Could not delete "${title}".`);
    }
  };

  const handleExport = (id: string, title: string) => {
    sessionStorage.setItem('hireflow_pending_export', 'pdf');
    if (!isAuthenticated()) {
      rememberCurrentLocationForRedirect('/app/builder', `?id=${id}`);
      navigate('/login');
      return;
    }
    navigate(`/app/builder?id=${id}`);
  };

  const analyzedResumes = resumesList.filter((r) => typeof r.atsScore === 'number' && r.atsScore >= 0);
  const latestAtsScore = resumesList[0]?.atsScore ?? null;
  const atsPotential = latestAtsScore !== null ? Math.max(0, 100 - latestAtsScore) : null;
  const avgAtsScore =
    analyzedResumes.length > 0
      ? Math.round(analyzedResumes.reduce((sum, r) => sum + (r.atsScore || 0), 0) / analyzedResumes.length)
      : null;

  return (
    <div className="space-y-6 animate-in fade-in duration-200 text-[#0B192C]">
      {/* Toast Notification Banner */}
      {toast.show && (
        <div className="fixed top-20 right-6 z-50 bg-[#0B192C] text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-2">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-bold">{toast.message}</span>
        </div>
      )}

      {/* Guest-mode notice */}
      {!isLoadingResumes && isGuestMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 text-xs text-amber-800 font-medium flex items-center gap-2">
          <span>👋 You're browsing as a guest — resumes are saved to this browser only. <a href="/signup" className="font-bold underline">Sign up free</a> to save them to your account and unlock AI features.</span>
        </div>
      )}

      {/* Real load-error notice — never masked with fake data */}
      {!isLoadingResumes && loadError && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-xs text-red-800 font-medium flex items-center justify-between gap-3">
          <span>⚠️ {loadError}</span>
          <button
            onClick={loadResumes}
            className="font-bold underline shrink-0 cursor-pointer"
          >
            Retry
          </button>
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
            {resumesList[0] ? (
              <>
                Your latest resume scores{' '}
                <span className="font-bold text-[#0B192C] underline decoration-blue-500 decoration-2 underline-offset-4">
                  {resumesList[0].atsScore}/100 on ATS
                </span>
                {resumesList[0].atsScore < 100 && ` — ${100 - resumesList[0].atsScore} points to a perfect score.`}
              </>
            ) : (
              'Build your first resume to get a real ATS score and personalized suggestions.'
            )}
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
                  <span className="text-2xl font-black text-[#0B192C]">
                    {resumesList[0]?.atsScore !== null && resumesList[0]?.atsScore !== undefined ? resumesList[0].atsScore : '—'}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">/ 100</span>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl space-y-1">
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">Structure Score</span>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-black text-[#0B192C]">
                    {resumesList[0]?.healthScore !== null && resumesList[0]?.healthScore !== undefined ? resumesList[0].healthScore : '—'}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">/ 100</span>
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
              <span className="text-xs font-bold text-slate-500">Latest ATS Score</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#0B192C]">{latestAtsScore ?? '—'}</span>
                {atsPotential !== null && atsPotential > 0 && (
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    +{atsPotential} Potential
                  </span>
                )}
              </div>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <BarChart3 size={20} />
            </div>
          </div>

          {/* KPI 2: Average ATS Score across all resumes */}
          <div
            onClick={handleContinueResume}
            className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">Average ATS Score</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#0B192C]">{avgAtsScore !== null ? `${avgAtsScore}%` : '—'}</span>
                <span className="text-xs text-slate-500 font-medium">Across all resumes</span>
              </div>
            </div>
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Target size={20} />
            </div>
          </div>

          {/* KPI 3: Total Resumes */}
          <div
            onClick={() => navigate('/app/builder?new=1')}
            className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs hover:shadow-md hover:-translate-y-0.5 transition-all cursor-pointer flex items-center justify-between"
          >
            <div className="space-y-1">
              <span className="text-xs font-bold text-slate-500">Total Resumes</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-black text-[#0B192C]">{resumesList.length}</span>
                <span className="text-xs text-slate-500 font-medium">Saved versions</span>
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
            {isLoadingResumes && (
              <div className="text-center py-8 text-xs text-slate-400 font-medium">Loading your resumes…</div>
            )}
            {!isLoadingResumes && resumesList.length === 0 && !loadError && (
              <div className="text-center py-8 space-y-2">
                <p className="text-xs text-slate-500 font-medium">You haven't created a resume yet.</p>
                <button
                  onClick={() => navigate('/app/builder?new=1')}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer"
                >
                  Create your first resume →
                </button>
              </div>
            )}
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
                      <span>ATS Score: <strong className="text-[#0B192C]">{res.atsScore !== null && res.atsScore !== undefined ? `${res.atsScore}%` : 'Not analyzed'}</strong></span>
                      <span>&middot;</span>
                      <span>{res.lastModified}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => navigate(`/app/builder?id=${res.id}`)}
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

          {activityList.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              Your recent resume activity will appear here.
            </p>
          ) : (
            <div className="space-y-4 relative pl-3 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {activityList.slice(0, 5).map((act, i) => (
                <div key={act.id} className="relative pl-5 space-y-1">
                  <div
                    className={`absolute -left-[5px] top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 ${
                      i === 0 ? 'bg-[#0B192C] ring-slate-100' : 'bg-slate-400 ring-slate-100'
                    }`}
                  />
                  <span className="text-[10px] font-mono font-bold text-slate-400 block">{formatActivityTime(act.created_at)}</span>
                  <h4 className="text-xs font-bold text-[#0B192C]">{act.description || act.activity_type}</h4>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
