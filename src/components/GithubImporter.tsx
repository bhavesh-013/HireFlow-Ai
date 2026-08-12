import React, { useState, useMemo } from 'react';
import {
  Github,
  CheckCircle2,
  RefreshCw,
  Search,
  Star,
  GitFork,
  Sparkles,
  Plus,
  Trash2,
  Check,
  ExternalLink,
  Code2,
  Layers,
  Terminal,
  Cpu,
  Database as DatabaseIcon,
  Cloud as CloudIcon,
  TestTube,
  Wrench,
  Smartphone,
  Bot,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  Info,
  UserCheck
} from 'lucide-react';
import { GitHubRepoItem, ParsedResumeData, SkillCategoryItem } from '../types';
import { mockGithubRepos } from '../data/mockData';

export interface GithubImporterProps {
  onConfirmImport: (parsedResume: ParsedResumeData) => void;
  mockUser: {
    name: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    github: string;
    linkedin: string;
  };
}

export type SkillCategoryType =
  | 'Frontend'
  | 'Backend'
  | 'Database'
  | 'DevOps'
  | 'Cloud'
  | 'AI/ML'
  | 'Mobile'
  | 'Testing'
  | 'Tools';

const SKILL_CATEGORIES: { category: SkillCategoryType; label: string; icon: React.ReactNode; color: string }[] = [
  { category: 'Frontend', label: 'Frontend', icon: <Code2 size={16} />, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { category: 'Backend', label: 'Backend', icon: <Layers size={16} />, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { category: 'Database', label: 'Database', icon: <DatabaseIcon size={16} />, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { category: 'DevOps', label: 'DevOps', icon: <Terminal size={16} />, color: 'bg-slate-100 text-slate-800 border-slate-300' },
  { category: 'Cloud', label: 'Cloud', icon: <CloudIcon size={16} />, color: 'bg-sky-50 text-sky-700 border-sky-200' },
  { category: 'AI/ML', label: 'AI / ML', icon: <Bot size={16} />, color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { category: 'Mobile', label: 'Mobile', icon: <Smartphone size={16} />, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { category: 'Testing', label: 'Testing', icon: <TestTube size={16} />, color: 'bg-teal-50 text-teal-700 border-teal-200' },
  { category: 'Tools', label: 'Tools', icon: <Wrench size={16} />, color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
];

export const GithubImporter: React.FC<GithubImporterProps> = ({ onConfirmImport, mockUser }) => {
  // State for GitHub Connection
  const [githubConnected, setGithubConnected] = useState(true);
  const [githubUsername, setGithubUsername] = useState('alexkumar-dev');
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [showOAuthModal, setShowOAuthModal] = useState(false);

  // Authenticated GitHub Profile details
  const [userProfile] = useState({
    name: 'Alex Kumar',
    username: 'alexkumar-dev',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'Senior Software Engineer & Open Source Contributor. Building high-performance web applications & AI tools.',
    publicRepos: 24,
    followers: 482,
    starsTotal: 3340,
    githubUrl: 'https://github.com/alexkumar-dev',
  });

  // Repositories State
  const [repos, setRepos] = useState<GitHubRepoItem[]>(mockGithubRepos);
  const [repoSearch, setRepoSearch] = useState('');
  const [expandedRepoId, setExpandedRepoId] = useState<string | null>('gh_1');

  // Categorized Skills State extracted from repos
  const initialSkillItems: SkillCategoryItem[] = useMemo(() => {
    const defaultSkills: SkillCategoryItem[] = [
      // Frontend
      { id: 'sk_1', name: 'React 18', category: 'Frontend', selected: true },
      { id: 'sk_2', name: 'TypeScript', category: 'Frontend', selected: true },
      { id: 'sk_3', name: 'Next.js 14', category: 'Frontend', selected: true },
      { id: 'sk_4', name: 'Tailwind CSS', category: 'Frontend', selected: true },
      { id: 'sk_5', name: 'HTML5/CSS3', category: 'Frontend', selected: true },
      { id: 'sk_6', name: 'Zustand', category: 'Frontend', selected: true },
      { id: 'sk_7', name: 'HTML5 Canvas API', category: 'Frontend', selected: true },
      // Backend
      { id: 'sk_8', name: 'Node.js', category: 'Backend', selected: true },
      { id: 'sk_9', name: 'Express.js', category: 'Backend', selected: true },
      { id: 'sk_10', name: 'Python', category: 'Backend', selected: true },
      { id: 'sk_11', name: 'GraphQL', category: 'Backend', selected: true },
      { id: 'sk_12', name: 'REST APIs', category: 'Backend', selected: true },
      // Database
      { id: 'sk_13', name: 'PostgreSQL', category: 'Database', selected: true },
      { id: 'sk_14', name: 'Redis', category: 'Database', selected: true },
      { id: 'sk_15', name: 'Prisma ORM', category: 'Database', selected: true },
      // DevOps
      { id: 'sk_16', name: 'Docker', category: 'DevOps', selected: true },
      { id: 'sk_17', name: 'GitHub Actions (CI/CD)', category: 'DevOps', selected: true },
      { id: 'sk_18', name: 'Terraform', category: 'DevOps', selected: true },
      { id: 'sk_19', name: 'Kubernetes (GKE)', category: 'DevOps', selected: true },
      // Cloud
      { id: 'sk_20', name: 'Vercel', category: 'Cloud', selected: true },
      { id: 'sk_21', name: 'AWS Cloud Run', category: 'Cloud', selected: true },
      { id: 'sk_22', name: 'Google Cloud Platform', category: 'Cloud', selected: true },
      // AI / ML
      { id: 'sk_23', name: 'Gemini AI API', category: 'AI/ML', selected: true },
      { id: 'sk_24', name: 'PyTorch', category: 'AI/ML', selected: true },
      { id: 'sk_25', name: 'SpaCy / NLP', category: 'AI/ML', selected: true },
      // Mobile
      { id: 'sk_26', name: 'React Native', category: 'Mobile', selected: true },
      // Testing
      { id: 'sk_27', name: 'Jest', category: 'Testing', selected: true },
      { id: 'sk_28', name: 'Playwright', category: 'Testing', selected: true },
      { id: 'sk_29', name: 'Cypress', category: 'Testing', selected: true },
      // Tools
      { id: 'sk_30', name: 'Git', category: 'Tools', selected: true },
      { id: 'sk_31', name: 'Vite', category: 'Tools', selected: true },
      { id: 'sk_32', name: 'npm / pnpm', category: 'Tools', selected: true },
    ];
    return defaultSkills;
  }, []);

  const [skills, setSkills] = useState<SkillCategoryItem[]>(initialSkillItems);

  // New Skill Input states per category
  const [newSkillText, setNewSkillText] = useState<{ [cat in SkillCategoryType]?: string }>({});
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editingSkillName, setEditingSkillName] = useState('');

  // Handle repository selection toggle
  const toggleRepoSelection = (repoId: string) => {
    setRepos((prev) =>
      prev.map((r) => (r.id === repoId ? { ...r, selected: !r.selected } : r))
    );
  };

  // Toggle skill selection
  const toggleSkillSelection = (skillId: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, selected: !s.selected } : s))
    );
  };

  // Add new skill to category
  const handleAddSkill = (category: SkillCategoryType) => {
    const text = newSkillText[category]?.trim();
    if (!text) return;

    const newSkill: SkillCategoryItem = {
      id: `custom_sk_${Date.now()}`,
      name: text,
      category,
      selected: true,
    };
    setSkills((prev) => [...prev, newSkill]);
    setNewSkillText((prev) => ({ ...prev, [category]: '' }));
  };

  // Remove skill
  const handleRemoveSkill = (skillId: string) => {
    setSkills((prev) => prev.filter((s) => s.id !== skillId));
  };

  // Select all or deselect all in category
  const handleToggleCategory = (category: SkillCategoryType, selectAll: boolean) => {
    setSkills((prev) =>
      prev.map((s) => (s.category === category ? { ...s, selected: selectAll } : s))
    );
  };

  // Save skill edit
  const handleSaveSkillEdit = (skillId: string) => {
    if (!editingSkillName.trim()) return;
    setSkills((prev) =>
      prev.map((s) => (s.id === skillId ? { ...s, name: editingSkillName.trim() } : s))
    );
    setEditingSkillId(null);
    setEditingSkillName('');
  };

  // Fetch repositories simulated
  const handleFetchGithubUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!githubUsername.trim()) return;
    setIsFetchingRepos(true);
    setTimeout(() => {
      setIsFetchingRepos(false);
      setGithubConnected(true);
    }, 600);
  };

  // Computed properties for filtered repos
  const filteredRepos = useMemo(() => {
    if (!repoSearch.trim()) return repos;
    return repos.filter(
      (r) =>
        r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
        r.description.toLowerCase().includes(repoSearch.toLowerCase()) ||
        r.language.toLowerCase().includes(repoSearch.toLowerCase()) ||
        r.topics.some((t) => t.toLowerCase().includes(repoSearch.toLowerCase()))
    );
  }, [repos, repoSearch]);

  const selectedRepos = useMemo(() => repos.filter((r) => r.selected), [repos]);

  // Aggregate stats for summary
  const totalAnalyzed = repos.length;
  const selectedCount = selectedRepos.length;
  const activeSkills = useMemo(() => skills.filter((s) => s.selected), [skills]);

  // Group active skills by category for summary & export
  const skillsByCategory = useMemo(() => {
    const map: Record<SkillCategoryType, string[]> = {
      Frontend: [],
      Backend: [],
      Database: [],
      DevOps: [],
      Cloud: [],
      'AI/ML': [],
      Mobile: [],
      Testing: [],
      Tools: [],
    };
    activeSkills.forEach((s) => {
      map[s.category].push(s.name);
    });
    return map;
  }, [activeSkills]);

  // Final confirmation to populate resume editor
  const handleConfirm = () => {
    if (selectedRepos.length === 0) {
      alert('Please select at least one GitHub repository to import into your resume.');
      return;
    }

    // Build Projects
    const parsedProjects = selectedRepos.map((repo) => {
      // Collect extracted tech
      const repoTech = repo.extractedTech
        ? [
            ...repo.extractedTech.frameworks,
            ...repo.extractedTech.languages,
            ...repo.extractedTech.databases,
            ...repo.extractedTech.devops,
          ].filter(Boolean)
        : [repo.language, ...(repo.topics || []).slice(0, 4)];

      return {
        id: `gh_proj_${repo.id}`,
        title: repo.generatedTitle || repo.name,
        description: repo.generatedDescription || repo.description,
        techStack: Array.from(new Set(repoTech)).slice(0, 6),
        link: repo.url,
        stars: repo.stars,
        bullets: repo.generatedBullets || [
          `Engineered open-source project "${repo.name}" with ${repo.stars} GitHub stars and ${repo.forks} forks using ${repo.language}.`,
          `Built modular application inspecting ${repo.dependencyFiles?.join(', ') || 'codebase'} for production deployment.`,
        ],
      };
    });

    // Format skill string from active categories
    const formattedSkillsArray: string[] = [];
    SKILL_CATEGORIES.forEach(({ category, label }) => {
      const catSkills = skillsByCategory[category];
      if (catSkills.length > 0) {
        formattedSkillsArray.push(`${label}: ${catSkills.join(', ')}`);
      }
    });
    const formattedSkillsString = formattedSkillsArray.join(' | ');

    // Build complete ParsedResumeData
    const parsedGithubResume: ParsedResumeData = {
      title: `GitHub_Resume_${userProfile.username}.pdf`,
      targetRole: 'Senior Full Stack & Open Source Engineer',
      templateName: 'Modern Tech Stack',
      importSource: 'github',
      personalInfo: {
        fullName: mockUser.name || userProfile.name,
        jobTitle: 'Senior Full Stack & Open Source Engineer',
        email: mockUser.email,
        phone: mockUser.phone,
        location: mockUser.location,
        website: mockUser.website,
        github: userProfile.githubUrl,
        linkedin: mockUser.linkedin,
        summary: `Open Source Engineer with ${selectedRepos.length} highlighted GitHub repositories (${selectedRepos.reduce((acc, r) => acc + r.stars, 0)} total stars). Specialized in ${activeSkills.slice(0, 8).map(s => s.name).join(', ')}.`,
      },
      experiences: [
        {
          id: `exp_gh_main`,
          title: 'Senior Open Source Contributor',
          company: 'GitHub / Independent',
          period: '2021 - Present',
          location: mockUser.location,
          bullets: [
            `Maintained ${selectedRepos.length} production-ready technical repositories accumulating over ${selectedRepos.reduce((acc, r) => acc + r.stars, 0)} stars.`,
            `Architected modular software solutions using ${activeSkills.slice(0, 5).map(s => s.name).join(', ')}.`,
            `Established automated CI/CD testing and Dockerized deployment workflows across public repositories.`,
          ],
        },
      ],
      education: [
        {
          id: `edu_gh_1`,
          degree: 'B.S. in Computer Science',
          institution: 'UC Berkeley',
          period: '2016 - 2020',
        },
      ],
      skills: formattedSkillsString,
      projects: parsedProjects,
      certificates: [],
    };

    onConfirmImport(parsedGithubResume);
  };

  return (
    <div className="space-y-8">
      {/* ------------------------------------------------------------------- */}
      {/* OAUTH AUTHENTICATED PROFILE & SYNC BAR */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          {/* User Profile Info */}
          <div className="flex items-start gap-4">
            <div className="relative">
              <img
                src={userProfile.avatarUrl}
                alt={userProfile.name}
                className="w-16 h-16 rounded-2xl object-cover ring-4 ring-slate-100 shadow-sm"
              />
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-white rounded-full p-1 border-2 border-white shadow-xs">
                <Check size={12} className="stroke-[3]" />
              </span>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl font-black text-[#0B192C]">{userProfile.name}</h2>
                <span className="text-xs font-mono text-slate-500">@{userProfile.username}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <UserCheck size={13} className="text-emerald-600" />
                  <span>GitHub OAuth Connected</span>
                </span>
              </div>

              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                {userProfile.bio}
              </p>

              <div className="flex items-center gap-4 text-xs font-mono font-bold text-slate-500 pt-1">
                <span>📁 {userProfile.publicRepos} Public Repos</span>
                <span>⭐ {userProfile.starsTotal.toLocaleString()} Total Stars</span>
                <span>👥 {userProfile.followers} Followers</span>
                <a
                  href={userProfile.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 font-sans"
                >
                  <span>View GitHub</span>
                  <ExternalLink size={12} />
                </a>
              </div>
            </div>
          </div>

          {/* Sync / Switch User */}
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <button
              onClick={() => setShowOAuthModal(true)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#0B192C] rounded-xl font-bold text-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Github size={15} />
              <span>Re-authenticate OAuth</span>
            </button>
          </div>
        </div>

        {/* Username Search Input Bar */}
        <form onSubmit={handleFetchGithubUser} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={githubUsername}
              onChange={(e) => setGithubUsername(e.target.value)}
              placeholder="Enter GitHub Username to fetch (e.g. alexkumar-dev)"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs sm:text-sm font-bold text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0B192C]"
            />
            <Github size={16} className="absolute left-3 top-3 text-slate-400" />
          </div>

          <button
            type="submit"
            disabled={isFetchingRepos}
            className="bg-[#0B192C] hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors cursor-pointer flex items-center justify-center gap-2"
          >
            {isFetchingRepos ? (
              <>
                <RefreshCw size={15} className="animate-spin" />
                <span>Scanning Repositories & Dependencies...</span>
              </>
            ) : (
              <>
                <RefreshCw size={15} />
                <span>Fetch & Re-analyze Repositories</span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* REPOSITORY SELECTION & METADATA DEEP SCAN SECTION */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                STEP 1: SELECT REPOSITORIES
              </span>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                Deep Inspection Active (package.json, README, workflows)
              </span>
            </div>
            <h3 className="font-black text-lg text-[#0B192C] mt-1">
              Select Repositories for Resume ({selectedCount} of {totalAnalyzed} Selected)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              We inspect commit history, dependency manifests, and documentation to automatically extract technologies and generate STAR-formatted accomplishment bullet points.
            </p>
          </div>

          <div className="relative">
            <input
              type="text"
              value={repoSearch}
              onChange={(e) => setRepoSearch(e.target.value)}
              placeholder="Filter repositories..."
              className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-[#0B192C] focus:outline-none focus:border-[#0B192C]"
            />
            <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          </div>
        </div>

        {/* Repository Cards */}
        <div className="space-y-4">
          {filteredRepos.map((repo) => {
            const isExpanded = expandedRepoId === repo.id;
            return (
              <div
                key={repo.id}
                className={`rounded-2xl border transition-all ${
                  repo.selected
                    ? 'bg-blue-50/40 border-blue-400 shadow-2xs ring-1 ring-blue-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Row */}
                <div className="p-4 sm:p-5 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => toggleRepoSelection(repo.id)}
                      className={`mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 cursor-pointer ${
                        repo.selected
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      {repo.selected && <Check size={14} className="stroke-[3]" />}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-mono font-bold text-base text-[#0B192C]">{repo.name}</h4>
                        <span className="bg-slate-100 text-slate-700 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md">
                          {repo.language}
                        </span>
                        <div className="flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md">
                          <Star size={12} className="text-amber-500 fill-amber-500" />
                          <span>{repo.stars}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-slate-100 text-slate-600 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md">
                          <GitFork size={12} />
                          <span>{repo.forks}</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                        {repo.description}
                      </p>

                      {/* Topics */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {repo.topics.map((t) => (
                          <span
                            key={t}
                            className="bg-slate-100 text-slate-600 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setExpandedRepoId(isExpanded ? null : repo.id)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <FileText size={13} />
                      <span>{isExpanded ? 'Hide Deep Inspection' : 'Inspect Metadata'}</span>
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>
                </div>

                {/* Deep Inspection Details Panel */}
                {isExpanded && (
                  <div className="border-t border-slate-200/80 bg-white p-5 rounded-b-2xl space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      {/* Inspected Files */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="font-mono font-bold text-slate-700 flex items-center gap-1.5">
                          <FileText size={14} className="text-blue-600" />
                          <span>Files Inspected ({repo.dependencyFiles?.length || 0})</span>
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {repo.dependencyFiles?.map((file) => (
                            <span
                              key={file}
                              className="bg-white border border-slate-200 font-mono text-[11px] px-2 py-0.5 rounded-md text-slate-700 font-bold"
                            >
                              📄 {file}
                            </span>
                          ))}
                        </div>
                        {repo.readmeSnippet && (
                          <div className="mt-2 pt-2 border-t border-slate-200 font-mono text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200/60 leading-relaxed whitespace-pre-wrap">
                            {repo.readmeSnippet}
                          </div>
                        )}
                      </div>

                      {/* Extracted Technologies Categorized */}
                      <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                        <span className="font-mono font-bold text-slate-700 flex items-center gap-1.5">
                          <Cpu size={14} className="text-purple-600" />
                          <span>Extracted Technologies by Category</span>
                        </span>
                        {repo.extractedTech ? (
                          <div className="space-y-1.5">
                            {(Object.entries(repo.extractedTech) as [string, string[]][]).map(([cat, items]) => {
                              if (!items || items.length === 0) return null;
                              return (
                                <div key={cat} className="flex items-start gap-2 text-[11px]">
                                  <span className="capitalize font-mono font-bold text-slate-500 w-24 shrink-0">
                                    {cat}:
                                  </span>
                                  <div className="flex flex-wrap gap-1">
                                    {items.map((it) => (
                                      <span
                                        key={it}
                                        className="bg-blue-100/70 text-blue-800 font-bold px-1.5 py-0.5 rounded text-[10px]"
                                      >
                                        {it}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No category metadata available.</p>
                        )}
                      </div>
                    </div>

                    {/* Generated Resume Highlights Preview */}
                    <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0B192C] flex items-center gap-1.5">
                          <Sparkles size={14} className="text-blue-600" />
                          <span>Generated Resume Project Accomplishments (STAR Format)</span>
                        </span>
                        <span className="text-[10px] font-mono text-blue-700 font-bold bg-blue-100 px-2 py-0.5 rounded-md">
                          3 Bullets Formatted
                        </span>
                      </div>
                      <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 font-sans leading-relaxed">
                        {repo.generatedBullets?.map((bullet, idx) => (
                          <li key={idx} className="pl-1">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* CATEGORIZED SKILLS REVIEW, EDIT, ADD & REMOVE MANAGER */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 text-purple-800 text-[10px] font-mono font-bold px-2 py-0.5 rounded-md">
                STEP 2: REVIEW & CATEGORIZE SKILLS
              </span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                9 Categories Auto-Populated ({activeSkills.length} Selected Skills)
              </span>
            </div>
            <h3 className="font-black text-lg text-[#0B192C] mt-1">
              Categorized Technical Skills Extracted from GitHub Repos
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Review, edit, add custom skills, or deselect skills before importing them into your resume editor.
            </p>
          </div>
        </div>

        {/* 9 Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {SKILL_CATEGORIES.map(({ category, label, icon, color }) => {
            const catSkills = skills.filter((s) => s.category === category);
            const activeInCat = catSkills.filter((s) => s.selected);
            const allSelected = catSkills.length > 0 && activeInCat.length === catSkills.length;

            return (
              <div
                key={category}
                className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-4 shadow-2xs hover:border-slate-300 transition-all"
              >
                {/* Category Card Header */}
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded-lg border ${color}`}>{icon}</div>
                    <h4 className="font-bold text-sm text-[#0B192C]">{label}</h4>
                    <span className="bg-slate-200 text-slate-700 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                      {activeInCat.length}/{catSkills.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleCategory(category, !allSelected)}
                    className="text-[11px] font-mono font-bold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                  >
                    {allSelected ? 'Deselect All' : 'Select All'}
                  </button>
                </div>

                {/* Skill Pills list */}
                <div className="flex flex-wrap gap-2 min-h-[60px] align-content-start">
                  {catSkills.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No skills in this category yet.</p>
                  ) : (
                    catSkills.map((sk) => {
                      const isEditing = editingSkillId === sk.id;
                      return (
                        <div
                          key={sk.id}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all border ${
                            sk.selected
                              ? 'bg-white border-blue-400 text-[#0B192C] shadow-xs'
                              : 'bg-slate-100/80 border-slate-200 text-slate-400 line-through'
                          }`}
                        >
                          {/* Toggle selection checkbox */}
                          <input
                            type="checkbox"
                            checked={sk.selected}
                            onChange={() => toggleSkillSelection(sk.id)}
                            className="w-3.5 h-3.5 rounded border-slate-300 text-blue-600 focus:ring-0 cursor-pointer"
                          />

                          {/* Editable or display text */}
                          {isEditing ? (
                            <input
                              type="text"
                              value={editingSkillName}
                              onChange={(e) => setEditingSkillName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSaveSkillEdit(sk.id);
                              }}
                              onBlur={() => handleSaveSkillEdit(sk.id)}
                              autoFocus
                              className="bg-blue-50 border border-blue-300 rounded px-1.5 py-0.5 text-xs font-bold text-[#0B192C] outline-none"
                            />
                          ) : (
                            <span
                              onClick={() => {
                                setEditingSkillId(sk.id);
                                setEditingSkillName(sk.name);
                              }}
                              className="cursor-pointer hover:text-blue-600 title='Click to edit'"
                            >
                              {sk.name}
                            </span>
                          )}

                          {/* Delete Action */}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(sk.id)}
                            className="text-slate-400 hover:text-rose-600 transition-colors ml-0.5 cursor-pointer"
                            title="Remove skill"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Add Custom Skill Input */}
                <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                  <input
                    type="text"
                    value={newSkillText[category] || ''}
                    onChange={(e) =>
                      setNewSkillText((prev) => ({ ...prev, [category]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddSkill(category);
                      }
                    }}
                    placeholder={`Add ${label} skill...`}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-[#0B192C] focus:outline-none focus:border-blue-500 font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddSkill(category)}
                    className="p-1.5 bg-[#0B192C] hover:bg-slate-800 text-white rounded-xl transition-colors cursor-pointer shrink-0"
                    title={`Add skill to ${label}`}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* IMPORT SUMMARY & CONFIRMATION ACTION DASHBOARD */}
      {/* ------------------------------------------------------------------- */}
      <div className="bg-[#0B192C] text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <span className="bg-blue-500/20 text-blue-300 text-[11px] font-mono font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Import Summary Ready
            </span>
            <h3 className="text-2xl font-black mt-2">Ready to Populate Resume Editor</h3>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              We have processed your GitHub profile, analyzed repository dependency graphs, extracted categorized skills, and synthesized resume-ready project entries.
            </p>
          </div>

          <button
            onClick={handleConfirm}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-sm sm:text-base shadow-lg hover:shadow-blue-500/20 transition-all cursor-pointer flex items-center justify-center gap-2.5 shrink-0"
          >
            <Sparkles size={18} className="text-amber-300" />
            <span>Confirm & Import into Resume Editor</span>
          </button>
        </div>

        {/* 4 Summary Stat Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 font-bold">REPOSITORIES ANALYZED</span>
            <div className="text-2xl font-black text-white flex items-center gap-2">
              <span>{totalAnalyzed}</span>
              <span className="text-xs font-mono font-normal text-emerald-400">({selectedCount} Selected)</span>
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1">Full inspection completed</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 font-bold">PROJECTS GENERATED</span>
            <div className="text-2xl font-black text-white">{selectedCount}</div>
            <p className="text-[10px] text-slate-400 line-clamp-1">STAR bullet highlights ready</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 font-bold">SKILLS EXTRACTED</span>
            <div className="text-2xl font-black text-white">{activeSkills.length}</div>
            <p className="text-[10px] text-slate-400 line-clamp-1">Categorized across 9 domains</p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 space-y-1">
            <span className="text-[11px] font-mono text-slate-400 font-bold">TECHNOLOGIES DETECTED</span>
            <div className="text-2xl font-black text-white">
              {Object.values(skillsByCategory).reduce((acc: number, list: string[]) => acc + (list.length > 0 ? 1 : 0), 0)} / 9
            </div>
            <p className="text-[10px] text-slate-400 line-clamp-1">Full-stack & DevOps coverage</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SIMULATED OAUTH RE-AUTHENTICATION MODAL */}
      {/* ------------------------------------------------------------------- */}
      {showOAuthModal && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 bg-slate-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md">
              <Github size={32} />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#0B192C]">GitHub OAuth Authorization</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                HireFlow AI is requesting read access to your public repositories, organization memberships, commit history, and profile details to extract technical skills.
              </p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-[#0B192C]">
                <span>Permissions Requested:</span>
                <span className="text-emerald-700 font-mono">read:user, repo</span>
              </div>
              <ul className="list-disc list-inside text-slate-600 space-y-1 text-[11px]">
                <li>Read public repository metadata & package manifests</li>
                <li>Analyze topics, languages, and commit activity</li>
                <li>Extract technical skills and build resume project entries</li>
              </ul>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowOAuthModal(false)}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowOAuthModal(false);
                  setGithubConnected(true);
                  setIsFetchingRepos(true);
                  setTimeout(() => setIsFetchingRepos(false), 500);
                }}
                className="flex-1 py-3 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={16} className="text-emerald-400" />
                <span>Authorize HireFlow</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
