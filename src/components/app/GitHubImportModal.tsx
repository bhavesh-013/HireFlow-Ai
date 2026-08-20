import React, { useEffect, useState } from 'react';
import {
  Github,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
  Search,
  Star,
  GitFork,
  RefreshCw,
  Eye,
  EyeOff,
  Wand2,
  Check,
  ExternalLink,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Cpu,
  Layers,
  Key,
  Briefcase,
  FileText,
  Trash2,
  Plus,
} from 'lucide-react';
import { ExtractedSkill, ProjectItem } from '../../types';
import { useGithubImport } from '../../hooks/useGithubImport';
import { githubService } from '../../services/githubService';

export interface GitHubImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: 'skills' | 'projects';
  username?: string;
  currentSkillsString?: string;
  targetJobDescription?: string;
  onImportSkills?: (skillsString: string, newSkillsList?: ExtractedSkill[]) => void;
  onImportProjects?: (newProjects: ProjectItem[]) => void;
}

export const GitHubImportModal: React.FC<GitHubImportModalProps> = ({
  isOpen,
  onClose,
  mode = 'skills',
  username: initialUsername = '',
  currentSkillsString = '',
  targetJobDescription: initialTargetJd = '',
  onImportSkills,
  onImportProjects,
}) => {
  const [jobDescriptionInput, setJobDescriptionInput] = useState(initialTargetJd);
  const [showJdBox, setShowJdBox] = useState(false);

  const {
    username,
    setUsername,
    userProfile,
    isSyncingRepos,
    syncError,
    syncRepos,

    repos,
    filteredRepos,
    selectedRepos,
    selectedRepoIds,
    searchQuery,
    setSearchQuery,
    hideForks,
    setHideForks,
    hideArchived,
    setHideArchived,
    showPracticeRepos,
    setShowPracticeRepos,
    toggleSelectRepo,
    selectAll,
    deselectAll,

    isProcessingPipeline,
    progress,
    pipelineError,
    extractedSkills,
    extractedProjects,
    mergeResult,
    statsSummary,
    runImportPipeline,
  } = useGithubImport({
    mode: mode as 'skills' | 'projects',
    existingSkillsString: currentSkillsString,
    targetJobDescription: jobDescriptionInput,
  });

  const [patToken, setPatToken] = useState('');
  const [showPatInput, setShowPatInput] = useState(false);
  const [editableProjects, setEditableProjects] = useState<any[]>([]);

  // Sync on open — only if we already know the user's GitHub username.
  // Never auto-sync against a placeholder account; that would show a
  // stranger's real repos as if they were importable for this user.
  useEffect(() => {
    if (isOpen) {
      setJobDescriptionInput(initialTargetJd);
      if (repos.length === 0 && initialUsername) {
        setUsername(initialUsername);
        syncRepos(initialUsername);
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (extractedProjects && extractedProjects.length > 0) {
      setEditableProjects(extractedProjects);
    }
  }, [extractedProjects]);

  const handleDeleteProject = (projId: string) => {
    setEditableProjects((prev) => prev.filter((p) => (p.id || p.title) !== projId));
  };

  const handleUpdateBullet = (projId: string, bulletIdx: number, text: string) => {
    setEditableProjects((prev) =>
      prev.map((p) => {
        if ((p.id || p.title) !== projId) return p;
        const newBullets = [...(p.bullets || [])];
        newBullets[bulletIdx] = text;
        return { ...p, bullets: newBullets };
      })
    );
  };

  const handleDeleteBullet = (projId: string, bulletIdx: number) => {
    setEditableProjects((prev) =>
      prev.map((p) => {
        if ((p.id || p.title) !== projId) return p;
        const newBullets = (p.bullets || []).filter((_: any, idx: number) => idx !== bulletIdx);
        return { ...p, bullets: newBullets };
      })
    );
  };

  const handleAddBullet = (projId: string) => {
    setEditableProjects((prev) =>
      prev.map((p) => {
        if ((p.id || p.title) !== projId) return p;
        const newBullets = [...(p.bullets || []), 'New technical accomplishment bullet'];
        return { ...p, bullets: newBullets };
      })
    );
  };

  const handleSyncSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      syncRepos(username.trim());
    }
  };

  const handlePatSave = () => {
    if (patToken.trim()) {
      githubService.setGitHubPAT(patToken.trim());
    } else {
      githubService.setGitHubPAT(null);
    }
    setShowPatInput(false);
    syncRepos(username);
  };

  const handleConfirmFinalImport = () => {
    if (mode === 'projects') {
      const finalProjects = editableProjects.length > 0 ? editableProjects : extractedProjects;
      if (onImportProjects && finalProjects.length > 0) {
        onImportProjects(finalProjects);
      }
    } else {
      if (!mergeResult) return;
      if (onImportSkills) {
        onImportSkills(mergeResult.formattedSkillsString, mergeResult.mergedSkills);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/30 border border-blue-400/30 rounded-xl text-blue-300">
              <Github size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base tracking-tight">
                  {mode === 'projects'
                    ? 'Import & Enhance Projects from GitHub'
                    : 'Import & Optimize Skills from GitHub'}
                </h2>
                <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold rounded-full flex items-center gap-1">
                  <Sparkles size={11} /> ATS AI Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                {mode === 'projects'
                  ? 'Extract full resume projects, generate STAR bullet achievements, and order by Job Description relevance.'
                  : 'Fetch public repos, extract technology dependencies, optimize for ATS keyword match, and update your resume.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: GitHub Username & Sync Bar */}
          <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl space-y-3">
            <form onSubmit={handleSyncSubmit} className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-[280px]">
                <div className="w-9 h-9 bg-slate-900 text-white rounded-xl flex items-center justify-center font-mono font-bold text-sm shrink-0">
                  <Github size={18} />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                    GitHub Username
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="Enter username (e.g. alexkumar-dev)"
                      className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isSyncingRepos || isProcessingPipeline}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  <RefreshCw size={13} className={isSyncingRepos ? 'animate-spin' : ''} />
                  <span>{isSyncingRepos ? 'Fetching...' : 'Sync Repos'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowJdBox(!showJdBox)}
                  className={`px-3 py-2 border rounded-xl font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer ${
                    jobDescriptionInput
                      ? 'bg-blue-50 text-blue-800 border-blue-300'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                  title="Target Job Description for ranking projects"
                >
                  <Briefcase size={13} />
                  <span>{jobDescriptionInput ? 'Target JD Active' : 'Add Target JD'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPatInput(!showPatInput)}
                  className="p-2 text-slate-500 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-white transition-colors cursor-pointer"
                  title="Configure GitHub Personal Access Token (for higher rate limits)"
                >
                  <Key size={14} />
                </button>
              </div>
            </form>

            {/* Target Job Description Input for Ranking */}
            {showJdBox && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <FileText size={14} className="text-blue-600" /> Target Job Description (used to rank projects by relevance)
                  </span>
                  <button
                    type="button"
                    onClick={() => setJobDescriptionInput('')}
                    className="text-[11px] text-slate-400 hover:text-rose-600"
                  >
                    Clear JD
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={jobDescriptionInput}
                  onChange={(e) => setJobDescriptionInput(e.target.value)}
                  placeholder="Paste target job description or requirements here to rank projects by keyword match..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}

            {/* Optional Personal Access Token Input */}
            {showPatInput && (
              <div className="p-3 bg-white border border-slate-200 rounded-xl text-xs space-y-2 animate-in fade-in duration-150">
                <div className="flex items-center justify-between font-bold text-slate-700">
                  <span>Optional: GitHub Personal Access Token (PAT)</span>
                  <span className="text-[10px] font-mono text-slate-400">Increases limit to 5,000 req/hr</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="password"
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-xs font-mono focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="button"
                    onClick={handlePatSave}
                    className="px-3 py-1 bg-blue-600 text-white font-bold text-xs rounded-lg cursor-pointer hover:bg-blue-700"
                  >
                    Save Token
                  </button>
                </div>
              </div>
            )}

            {/* User Profile Summary if Loaded */}
            {userProfile && !syncError && (
              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <img
                    src={userProfile.avatar_url}
                    alt={userProfile.login}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="font-bold text-slate-900">{userProfile.name || userProfile.login}</span>
                  <span className="text-slate-400">(@{userProfile.login})</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>📁 {userProfile.public_repos} Repos</span>
                  <span>👥 {userProfile.followers} Followers</span>
                  <a
                    href={userProfile.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 hover:underline flex items-center gap-1 font-sans"
                  >
                    View <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            )}

            {/* Error Banner */}
            {syncError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
                <ShieldAlert size={16} className="text-rose-600 shrink-0" />
                <span className="font-medium">{syncError}</span>
              </div>
            )}
          </div>

          {/* PIPELINE PROGRESS UI */}
          {isProcessingPipeline && (
            <div className="p-5 bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 border border-blue-200 rounded-2xl space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-blue-900 flex items-center gap-1.5">
                  <RefreshCw size={14} className="animate-spin text-blue-600" />
                  <span>{progress.stepLabel}</span>
                </span>
                <span className="font-mono text-blue-700">{progress.percent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>

              <div className="grid grid-cols-6 gap-1.5 text-center text-[10px] font-bold pt-1">
                {[
                  '1. Fetch Repos',
                  '2. Read Specs',
                  '3. Analyze Code',
                  mode === 'projects' ? '4. STAR Bullets' : '4. Extract Tech',
                  mode === 'projects' ? '5. JD Ranking' : '5. AI ATS Polish',
                  mode === 'projects' ? '6. Ready Import' : '6. Update Resume',
                ].map((stepName, i) => {
                  const isActive = i + 1 <= progress.currentStep;
                  return (
                    <div
                      key={stepName}
                      className={`py-1 rounded-md border transition-all ${
                        isActive
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-white text-slate-400 border-slate-200'
                      }`}
                    >
                      {stepName}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PIPELINE ERROR */}
          {pipelineError && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl text-xs space-y-1">
              <div className="flex items-center gap-2 font-bold">
                <AlertCircle size={16} className="text-rose-600" />
                <span>Import Pipeline Error</span>
              </div>
              <p>{pipelineError}</p>
            </div>
          )}

          {/* MAIN CONTENT AREA: Repos Table OR Extracted Results */}
          {!statsSummary ? (
            /* STEP 2: Repository List & Selection */
            <div className="space-y-3">
              {/* Filter Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-1">
                <div className="flex items-center gap-2 flex-1 min-w-[280px]">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search repository name, language, topic..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Filter Toggles */}
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button
                      type="button"
                      onClick={() => setHideForks(!hideForks)}
                      className={`px-2.5 py-1.5 border rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        hideForks
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-blue-50 text-blue-800 border-blue-300'
                      }`}
                    >
                      <GitFork size={12} />
                      <span>{hideForks ? 'Forks Hidden' : 'Forks Shown'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setHideArchived(!hideArchived)}
                      className={`px-2.5 py-1.5 border rounded-xl text-[11px] font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                        hideArchived
                          ? 'bg-slate-100 text-slate-600 border-slate-300'
                          : 'bg-purple-50 text-purple-800 border-purple-300'
                      }`}
                    >
                      <span>{hideArchived ? 'Archived Hidden' : 'Archived Shown'}</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <button
                    type="button"
                    onClick={selectAll}
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Select All
                  </button>
                  <span className="text-slate-300">•</span>
                  <button
                    type="button"
                    onClick={deselectAll}
                    className="font-bold text-slate-500 hover:underline cursor-pointer"
                  >
                    Deselect All
                  </button>
                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-xl border border-slate-200">
                    {selectedRepoIds.size} of {repos.length} selected
                  </span>
                </div>
              </div>

              {/* Repos List */}
              <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 max-h-[340px] overflow-y-auto">
                {isSyncingRepos ? (
                  <div className="p-12 text-center space-y-2">
                    <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto" />
                    <p className="text-xs text-slate-500 font-bold">Scanning public repositories for @{username}...</p>
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-xs">
                    {repos.length === 0
                      ? 'No public repositories found for this GitHub user.'
                      : 'No repositories match your search or filter options.'}
                  </div>
                ) : (
                  filteredRepos.map((repo) => {
                    const isSelected = selectedRepoIds.has(repo.id);
                    return (
                      <div
                        key={repo.id}
                        onClick={() => toggleSelectRepo(repo.id)}
                        className={`p-3.5 flex items-start gap-3 cursor-pointer transition-colors ${
                          isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50/80'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="mt-1 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-xs text-[#0B192C] hover:text-blue-600 transition-colors">
                                {repo.name}
                              </span>
                              {repo.isFork && (
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] rounded font-mono flex items-center gap-0.5">
                                  <GitFork size={10} /> Fork
                                </span>
                              )}
                              {repo.isPractice && (
                                <span className="px-1.5 py-0.2 bg-amber-50 text-amber-800 border border-amber-200 text-[10px] rounded font-medium">
                                  Practice
                                </span>
                              )}
                              {repo.isArchived && (
                                <span className="px-1.5 py-0.2 bg-slate-100 text-slate-500 border border-slate-200 text-[10px] rounded font-mono">
                                  Archived
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                              <span className="flex items-center gap-1">
                                <Star size={12} className="text-amber-500 fill-amber-500" />
                                {repo.stars}
                              </span>
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-bold text-[11px]">
                                {repo.language}
                              </span>
                              <span className="text-[10px] text-slate-400">{repo.updatedAt}</span>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 line-clamp-1">{repo.description || 'No description provided.'}</p>

                          {repo.topics && repo.topics.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {repo.topics.slice(0, 6).map((tp: string) => (
                                <span
                                  key={tp}
                                  className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded"
                                >
                                  #{tp}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* PIPELINE RESULTS VIEW: PROJECTS MODE vs SKILLS MODE */
            <div className="space-y-5 animate-in fade-in duration-200">
              {/* Success Banner */}
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
                    <CheckCircle2 size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-emerald-950">
                      {mode === 'projects'
                        ? 'GitHub Projects Generated & Ranked Successfully!'
                        : 'Skills Extracted & ATS-Optimized Successfully!'}
                    </h3>
                    <p className="text-xs text-emerald-800 mt-0.5">
                      {mode === 'projects'
                        ? 'Extracted full project entries with STAR bullets and ranked them by Job Description match.'
                        : 'Analyzed codebase dependencies, framework configs, and README files across selected repositories.'}
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2 text-xs font-mono font-bold text-emerald-900">
                      <span>✓ {statsSummary.repositoriesAnalyzed} Repositories Analyzed</span>
                      {mode === 'projects' ? (
                        <>
                          <span className="bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-950">
                            ✓ {statsSummary.projectsGenerated} Projects Generated
                          </span>
                          {statsSummary.jdMatchApplied && (
                            <span className="bg-blue-100 text-blue-900 px-2 py-0.5 rounded">
                              ✓ Ranked by Target Job Description
                            </span>
                          )}
                        </>
                      ) : (
                        <>
                          <span>✓ {statsSummary.technologiesDetected} Technologies Detected</span>
                          <span className="bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-950">
                            ✓ {statsSummary.newSkillsAdded} New ATS Skills Added
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => runImportPipeline()}
                  className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                >
                  <RefreshCw size={12} /> Re-run
                </button>
              </div>

              {/* PROJECTS MODE DISPLAY */}
              {mode === 'projects' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Briefcase size={14} className="text-blue-600" />
                      <span>Generated Projects ({extractedProjects.length} Ready for Resume)</span>
                    </h4>
                    {jobDescriptionInput && (
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                        Ordered by Job Description Match
                      </span>
                    )}
                  </div>

                  <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                    {(editableProjects.length > 0 ? editableProjects : extractedProjects).map((proj, idx) => {
                      const projKey = proj.id || proj.title || `proj_${idx}`;
                      return (
                        <div
                          key={projKey}
                          className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 transition-all hover:border-slate-300 relative group"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-[#0B192C]">{proj.title}</span>
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded-full">
                                {proj.projectType || 'Open Source'}
                              </span>
                              {proj.stars > 0 && (
                                <span className="text-xs font-mono text-amber-700 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                                  <Star size={11} className="fill-amber-500 text-amber-500" /> {proj.stars}
                                </span>
                              )}
                              {proj.liveUrl && (
                                <a
                                  href={proj.liveUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[10px] font-mono text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1 border border-emerald-200"
                                >
                                  Live Demo <ExternalLink size={9} />
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {proj.relevanceScore && proj.relevanceScore > 0 ? (
                                <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-lg border border-emerald-300 flex items-center gap-1">
                                  <TrendingUp size={12} /> {proj.relevanceScore}% JD Match
                                </span>
                              ) : (
                                <span className="text-xs font-mono font-bold text-slate-700 bg-slate-200/80 px-2 py-0.5 rounded-lg">
                                  ATS Quality: {proj.qualityScore || 92}%
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleDeleteProject(projKey)}
                                className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer rounded"
                                title="Remove project"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>

                          <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                          {/* Editable STAR Bullets */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                STAR Accomplishment Bullets (Factual Evidence)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleAddBullet(projKey)}
                                className="text-[10px] font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <Plus size={11} /> Add Bullet
                              </button>
                            </div>
                            <ul className="space-y-1.5 text-xs text-slate-700">
                              {proj.bullets?.map((b: string, bIdx: number) => (
                                <li key={bIdx} className="flex items-center gap-2 bg-white p-1.5 px-2.5 rounded-xl border border-slate-200/80 text-[11px] leading-relaxed group/bullet">
                                  <span className="text-blue-600 font-bold shrink-0">•</span>
                                  <input
                                    type="text"
                                    value={b}
                                    onChange={(e) => handleUpdateBullet(projKey, bIdx, e.target.value)}
                                    className="flex-1 bg-transparent text-slate-800 text-xs font-medium focus:outline-none focus:bg-slate-50 rounded px-1"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteBullet(projKey, bIdx)}
                                    className="text-slate-300 group-hover/bullet:text-rose-500 transition-colors cursor-pointer"
                                    title="Delete bullet"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Tech Stack Tags */}
                          {proj.techStack && proj.techStack.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {proj.techStack.map((tech: string) => (
                                <span
                                  key={tech}
                                  className="bg-slate-200 text-slate-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SKILLS MODE DISPLAY */}
              {mode === 'skills' && (
                <>
                  {mergeResult && (
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                        <span>Merged Technical Skills Stack (ATS Formatted)</span>
                        <span className="text-[10px] font-mono text-blue-600 font-normal">
                          {mergeResult.existingSkillsCount} Existing + {mergeResult.newSkillsCount} New
                        </span>
                      </label>
                      <textarea
                        rows={4}
                        value={mergeResult.formattedSkillsString}
                        readOnly
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-mono text-[#0B192C] leading-relaxed focus:outline-none"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Cpu size={14} className="text-purple-600" />
                      <span>Extracted Skills Detail & Confidence Scores</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[220px] overflow-y-auto pr-1">
                      {extractedSkills.map((sk, idx) => {
                        const isNewSkill = mergeResult?.mergedSkills.find(
                          (m) => m.name.toLowerCase() === sk.name.toLowerCase() && m.isNew
                        );

                        return (
                          <div
                            key={idx}
                            className={`p-3 rounded-xl border text-xs space-y-1 transition-all ${
                              isNewSkill
                                ? 'bg-blue-50/70 border-blue-300 shadow-2xs'
                                : 'bg-slate-50/70 border-slate-200'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-[#0B192C]">{sk.name}</span>
                                {isNewSkill && (
                                  <span className="px-1.5 py-0.2 bg-blue-600 text-white text-[9px] font-bold rounded-md uppercase tracking-wider animate-pulse">
                                    New
                                  </span>
                                )}
                                <span className="text-[10px] font-mono text-slate-500 bg-slate-200/70 px-1.5 py-0.2 rounded">
                                  {sk.category || 'Tools'}
                                </span>
                              </div>

                              <span
                                className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                                  sk.confidence >= 90
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {sk.confidence}% Match
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 line-clamp-1">{sk.reason}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 hover:text-slate-900 font-bold text-xs cursor-pointer"
          >
            Cancel
          </button>

          {!statsSummary ? (
            <button
              type="button"
              disabled={isProcessingPipeline || selectedRepoIds.size === 0}
              onClick={() => runImportPipeline()}
              className="px-6 py-3 bg-[#0B192C] hover:bg-slate-800 disabled:opacity-50 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles size={16} className={`text-amber-300 ${isProcessingPipeline ? 'animate-spin' : ''}`} />
              <span>
                {isProcessingPipeline
                  ? 'Analyzing Codebase...'
                  : mode === 'projects'
                  ? `Import & Enhance Projects (${selectedRepoIds.size})`
                  : `Import & Optimize Skills (${selectedRepoIds.size})`}
              </span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleConfirmFinalImport}
              className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span>
                {mode === 'projects'
                  ? `Insert All ${extractedProjects.length} Projects into Resume`
                  : 'Update Resume Skills Section'}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GitHubImportModal;
