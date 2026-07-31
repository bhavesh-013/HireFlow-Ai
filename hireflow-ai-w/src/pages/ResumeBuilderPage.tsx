import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  Github,
  Linkedin,
  FilePlus,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  ArrowUpRight,
  Zap,
  Trash2,
  Copy,
  Layout,
  Star,
  Search,
  Check,
  RefreshCw,
  Clock,
  ExternalLink,
  Info,
  Layers,
  FileUp,
  Code
} from 'lucide-react';
import {
  mockUploadHistory,
  mockGithubRepos,
  mockLinkedInProfileData,
  mockTemplates,
  mockResumes,
  mockUser
} from '../data/mockData';
import { ParsedResumeData, GitHubRepoItem, UploadHistoryItem } from '../types';
import { GithubImporter } from '../components/GithubImporter';

export default function ResumeBuilderPage() {
  const navigate = useNavigate();

  // Active Creation Tab Mode
  const [activeTab, setActiveTab] = useState<
    'scratch' | 'upload' | 'github' | 'linkedin' | 'templates'
  >('upload');

  // Common Processing Modal State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTitle, setProcessingTitle] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');

  // ----------------------------------------------------
  // Option 1: Start From Scratch State
  // ----------------------------------------------------
  const [scratchTitle, setScratchTitle] = useState('Senior Full Stack Developer');
  const [scratchTargetRole, setScratchTargetRole] = useState('Senior Full Stack Engineer');
  const [scratchLevel, setScratchLevel] = useState('Senior (5-8 years)');

  // ----------------------------------------------------
  // Option 2: Upload Resume State
  // ----------------------------------------------------
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>(mockUploadHistory);

  // ----------------------------------------------------
  // Option 3: GitHub Import State
  // ----------------------------------------------------
  const [githubConnected, setGithubConnected] = useState(true);
  const [githubUsername, setGithubUsername] = useState('alexkumar-dev');
  const [isFetchingRepos, setIsFetchingRepos] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepoItem[]>(mockGithubRepos);
  const [repoSearch, setRepoSearch] = useState('');

  // ----------------------------------------------------
  // Option 4: LinkedIn Import State
  // ----------------------------------------------------
  const [linkedInFile, setLinkedInFile] = useState<File | null>(null);
  const [linkedInDragActive, setLinkedInDragActive] = useState(false);

  // ----------------------------------------------------
  // Option 5: Browse Templates State
  // ----------------------------------------------------
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [templateSearch, setTemplateSearch] = useState('');
  const [previewTemplateId, setPreviewTemplateId] = useState<string | null>(null);

  // Helper function: Simulate Processing & Redirect to Editor
  const runImportProcess = (
    title: string,
    steps: string[],
    dataToImport: ParsedResumeData
  ) => {
    setIsProcessing(true);
    setProcessingTitle(title);
    setProgressPercent(0);

    let stepIdx = 0;
    setCurrentStepText(steps[0]);

    const interval = setInterval(() => {
      stepIdx++;
      if (stepIdx < steps.length) {
        setProgressPercent(Math.round(((stepIdx + 1) / steps.length) * 100));
        setCurrentStepText(steps[stepIdx]);
      } else {
        clearInterval(interval);
        setProgressPercent(100);
        setCurrentStepText('Import complete! Opening Resume Editor...');

        // Save imported data to localStorage for persistence
        try {
          localStorage.setItem('hireflow_current_resume', JSON.stringify(dataToImport));
        } catch {
          // ignore
        }

        setTimeout(() => {
          setIsProcessing(false);
          // Navigate to editor with imported data
          navigate('/app/editor', { state: { importedResume: dataToImport } });
        }, 800);
      }
    }, 500);
  };

  // ----------------------------------------------------
  // Handler: Start From Scratch
  // ----------------------------------------------------
  const handleStartScratch = (e: React.FormEvent) => {
    e.preventDefault();
    const blankResume: ParsedResumeData = {
      title: `${scratchTitle}.pdf`,
      targetRole: scratchTargetRole,
      templateName: 'Minimal Technical',
      importSource: 'scratch',
      personalInfo: {
        fullName: mockUser.name,
        jobTitle: scratchTargetRole,
        email: mockUser.email,
        phone: mockUser.phone,
        location: mockUser.location,
        website: mockUser.website,
        summary: '',
      },
      experiences: [],
      education: [],
      skills: '',
      projects: [],
      certificates: [],
    };

    runImportProcess(
      'Initializing Fresh Resume Workspace',
      [
        'Creating ATS-compliant blank layout...',
        'Configuring default typography & section margins...',
        'Preparing real-time AI bullet suggestions...',
        'Readying Resume Editor...',
      ],
      blankResume
    );
  };

  // ----------------------------------------------------
  // Handler: Upload Resume PDF/DOCX
  // ----------------------------------------------------
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const processUploadedFile = (file: File) => {
    if (!file.name.match(/\.(pdf|docx|doc)$/i)) {
      alert('Please select a valid PDF or DOCX file.');
      return;
    }
    setUploadedFile(file);

    const parsedData: ParsedResumeData = {
      title: file.name,
      targetRole: 'Senior Software Engineer',
      templateName: 'Modern Tech Stack',
      importSource: 'upload',
      personalInfo: {
        fullName: mockUser.name,
        jobTitle: 'Senior Software Engineer',
        email: mockUser.email,
        phone: mockUser.phone,
        location: mockUser.location,
        website: mockUser.website,
        github: mockUser.github,
        linkedin: mockUser.linkedin,
        summary: `Parsed from uploaded file "${file.name}": Senior Software Engineer with extensive experience in React, TypeScript, distributed systems, and modern SaaS infrastructure.`,
      },
      experiences: [
        {
          id: `exp_u_${Date.now()}_1`,
          title: 'Senior Software Engineer',
          company: 'Tech Corp Global',
          period: '2022 - Present',
          location: 'San Francisco, CA',
          bullets: [
            `Extracted from ${file.name}: Spearheaded migration of core web client to React 18 & TypeScript, achieving 40% faster initial load time.`,
            'Architected micro-frontend modules integrated across 5 primary product suites.',
            'Optimized API response caching reducing database load by 35%.',
          ],
        },
      ],
      education: [
        {
          id: `edu_u_${Date.now()}`,
          degree: 'B.S. Computer Science',
          institution: 'UC Berkeley',
          period: '2016 - 2020',
        },
      ],
      skills: 'React, TypeScript, Node.js, Next.js, GraphQL, PostgreSQL, Tailwind CSS, Docker, Jest, CI/CD',
      projects: [
        {
          id: `proj_u_${Date.now()}`,
          title: 'Parsed Document Pipeline',
          description: 'Custom parsing engine extracted from candidate uploaded document.',
          techStack: ['TypeScript', 'PDF.js', 'Express'],
          bullets: ['Auto-extracted contact info, work experiences, and tech stack tags.'],
        },
      ],
      certificates: [],
    };

    // Add to local upload history state
    const newHistoryItem: UploadHistoryItem = {
      id: `upl_${Date.now()}`,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: file.name.endsWith('.docx') ? 'docx' : 'pdf',
      uploadedAt: 'Just now',
      status: 'Parsed',
      parsedResume: parsedData,
    };
    setUploadHistory([newHistoryItem, ...uploadHistory]);

    runImportProcess(
      `Parsing Resume File: ${file.name}`,
      [
        'Uploading document buffer to Gemini parser...',
        'Extracting contact header and location metadata...',
        'Structuring work experience timeline & bullet metrics...',
        'Classifying technical skills and education entries...',
        'Auto-filling Resume Editor...',
      ],
      parsedData
    );
  };

  const handleImportFromHistory = (item: UploadHistoryItem) => {
    runImportProcess(
      `Loading Saved Document: ${item.fileName}`,
      [
        'Retrieving stored parsed schema...',
        'Validating ATS compatibility tags...',
        'Opening Resume Editor with saved upload...',
      ],
      item.parsedResume
    );
  };

  // ----------------------------------------------------
  // Handler: GitHub Import
  // ----------------------------------------------------
  const toggleRepoSelection = (repoId: string) => {
    setGithubRepos((prev) =>
      prev.map((r) => (r.id === repoId ? { ...r, selected: !r.selected } : r))
    );
  };

  const handleFetchGithubUser = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFetchingRepos(true);
    setTimeout(() => {
      setIsFetchingRepos(false);
      setGithubConnected(true);
    }, 600);
  };

  const handleImportGithubProjects = () => {
    const selectedRepos = githubRepos.filter((r) => r.selected);
    if (selectedRepos.length === 0) {
      alert('Please select at least one GitHub repository to import.');
      return;
    }

    // Extract all unique technologies from selected repos
    const techSet = new Set<string>();
    selectedRepos.forEach((r) => {
      if (r.language) techSet.add(r.language);
      r.topics?.forEach((t) => techSet.add(t));
    });

    const parsedProjects = selectedRepos.map((repo) => ({
      id: `gh_p_${repo.id}`,
      title: repo.name,
      description: repo.description,
      techStack: [repo.language, ...(repo.topics || []).slice(0, 4)],
      link: repo.url,
      stars: repo.stars,
      bullets: [
        `Engineered open-source project "${repo.name}" with ${repo.stars} GitHub stars and ${repo.forks} forks using ${repo.language}.`,
        `Built modular application utilizing ${repo.topics.slice(0, 3).join(', ')} for production workflows.`,
      ],
    }));

    const parsedGithubResume: ParsedResumeData = {
      title: `GitHub_Projects_Resume_${githubUsername}.pdf`,
      targetRole: 'Full Stack & Open Source Engineer',
      templateName: 'Modern Tech Stack',
      importSource: 'github',
      personalInfo: {
        fullName: mockUser.name,
        jobTitle: 'Senior Open Source / Full Stack Engineer',
        email: mockUser.email,
        phone: mockUser.phone,
        location: mockUser.location,
        website: mockUser.website,
        github: `https://github.com/${githubUsername}`,
        linkedin: mockUser.linkedin,
        summary: `Open Source Engineer with ${selectedRepos.length} highlighted GitHub repositories (${selectedRepos.reduce((acc, r) => acc + r.stars, 0)} total stars). Specialized in ${Array.from(techSet).slice(0, 6).join(', ')}.`,
      },
      experiences: [
        {
          id: `exp_gh_1`,
          title: 'Senior Open Source Contributor',
          company: 'GitHub / Independent',
          period: '2021 - Present',
          location: 'San Francisco, CA',
          bullets: [
            `Maintained ${selectedRepos.length} popular technical repositories across ${Array.from(techSet).slice(0, 4).join(', ')}.`,
            `Received over ${selectedRepos.reduce((acc, r) => acc + r.stars, 0)} GitHub stars from software engineers worldwide.`,
          ],
        },
      ],
      education: [
        {
          id: `edu_gh_1`,
          degree: 'B.S. Computer Science',
          institution: 'UC Berkeley',
          period: '2016 - 2020',
        },
      ],
      skills: Array.from(techSet).join(', ') + ', React, TypeScript, Node.js, Git, CI/CD',
      projects: parsedProjects,
      certificates: [],
    };

    runImportProcess(
      'Importing GitHub Repositories into Resume',
      [
        'Connecting to GitHub API endpoint...',
        `Parsing commit metadata for ${selectedRepos.length} selected repositories...`,
        'Translating repository descriptions into STAR bullet accomplishments...',
        'Extracting primary language tags and framework keywords...',
        'Populating Projects and Technical Skills sections in Editor...',
      ],
      parsedGithubResume
    );
  };

  // ----------------------------------------------------
  // Handler: LinkedIn Import PDF
  // ----------------------------------------------------
  const handleLinkedInDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setLinkedInDragActive(true);
    } else if (e.type === 'dragleave') {
      setLinkedInDragActive(false);
    }
  };

  const handleLinkedInDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLinkedInDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processLinkedInPDF(e.dataTransfer.files[0]);
    }
  };

  const handleLinkedInFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processLinkedInPDF(e.target.files[0]);
    }
  };

  const processLinkedInPDF = (file: File) => {
    setLinkedInFile(file);

    const linkedInParsedResume: ParsedResumeData = {
      title: `LinkedIn_Profile_${mockLinkedInProfileData.fullName.replace(' ', '_')}.pdf`,
      targetRole: 'Senior Frontend Engineer',
      templateName: 'Silicon Valley Executive',
      importSource: 'linkedin',
      personalInfo: {
        fullName: mockLinkedInProfileData.fullName,
        jobTitle: 'Senior Frontend Engineer',
        email: mockUser.email,
        phone: mockUser.phone,
        location: 'San Francisco, CA',
        website: mockUser.website,
        linkedin: mockUser.linkedin,
        github: mockUser.github,
        summary: mockLinkedInProfileData.summary,
      },
      experiences: mockLinkedInProfileData.experiences,
      education: mockLinkedInProfileData.education,
      skills: mockLinkedInProfileData.skills,
      projects: [
        {
          id: 'proj_li_1',
          title: 'Design System & Micro-Frontend Architecture',
          description: 'Enterprise React component library & atomic design system.',
          techStack: ['React', 'TypeScript', 'Tailwind CSS'],
          bullets: ['Imported from LinkedIn profile endorsements & project highlights.'],
        },
      ],
      certificates: mockLinkedInProfileData.certifications.map((c) => ({
        id: c.id,
        title: c.title,
        issuer: c.issuer,
        date: c.date,
      })),
    };

    runImportProcess(
      `Importing LinkedIn Export: ${file.name}`,
      [
        'Reading LinkedIn PDF profile document stream...',
        'Extracting About summary and Headline tags...',
        'Parsing Experience positions, company names, and dates...',
        'Extracting Education history and LinkedIn Skill endorsements...',
        'Auto-filling Editor with LinkedIn profile data...',
      ],
      linkedInParsedResume
    );
  };

  // ----------------------------------------------------
  // Handler: Browse Templates
  // ----------------------------------------------------
  const handleSelectTemplate = (templateName: string) => {
    const templateResume: ParsedResumeData = {
      title: `${templateName} Resume.pdf`,
      targetRole: 'Senior Frontend Engineer',
      templateName,
      importSource: 'template',
      personalInfo: {
        fullName: mockUser.name,
        jobTitle: 'Senior Frontend Engineer',
        email: mockUser.email,
        phone: mockUser.phone,
        location: mockUser.location,
        website: mockUser.website,
        github: mockUser.github,
        linkedin: mockUser.linkedin,
        summary:
          'Product-focused Senior Frontend Engineer with 6+ years of experience architecting high-performance React applications, design systems, and modern web architectures for scale.',
      },
      experiences: [
        {
          id: 'exp_t1',
          title: 'Senior Frontend Engineer',
          company: 'Vercel / Tech Corp',
          period: '2023 - Present',
          location: 'San Francisco, CA',
          bullets: [
            'Architected high-throughput React SPA utilizing Zustand state management, lowering initial load latency by 38% for 120k monthly active users.',
            'Engineered reusable design system component library adopted by 14 cross-functional engineering pods.',
          ],
        },
      ],
      education: [
        {
          id: 'edu_t1',
          degree: 'B.S. Computer Science',
          institution: 'UC Berkeley',
          period: '2016 - 2020',
        },
      ],
      skills: 'React, TypeScript, Next.js, Tailwind CSS, GraphQL, Vite, Web Vitals, Node.js',
      projects: [],
      certificates: [],
    };

    runImportProcess(
      `Applying Template: ${templateName}`,
      [
        'Configuring ATS styling parameters...',
        'Applying layout typography and section spacing...',
        'Loading template structure into Editor...',
      ],
      templateResume
    );
  };

  const filteredTemplates = mockTemplates.filter((tmpl) => {
    const matchesCat = selectedCategory === 'All' || tmpl.category === selectedCategory;
    const matchesSearch =
      tmpl.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      tmpl.description.toLowerCase().includes(templateSearch.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const filteredRepos = githubRepos.filter(
    (r) =>
      r.name.toLowerCase().includes(repoSearch.toLowerCase()) ||
      r.description.toLowerCase().includes(repoSearch.toLowerCase()) ||
      r.language.toLowerCase().includes(repoSearch.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Processing Modal Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
              <RefreshCw size={32} className="animate-spin text-blue-600" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-[#0B192C]">{processingTitle}</h3>
              <p className="text-xs text-slate-500 font-medium">{currentStepText}</p>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono font-bold text-slate-600">
                <span>PROGRESS</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden p-0.5 border border-slate-200">
                <div
                  className="bg-[#0B192C] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <p className="text-[11px] text-slate-400 font-mono">
              HireFlow AI Engine &middot; Structuring ATS resume JSON
            </p>
          </div>
        </div>
      )}

      {/* Main Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-blue-100 text-blue-800 text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full">
            RESUME WORKFLOW
          </span>
          <span className="text-slate-400 font-mono text-xs">&bull; Step 1 of 2</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
          Create & Import Resume
        </h1>
        <p className="text-sm text-slate-600 mt-1 max-w-3xl">
          Select your preferred import method below. Complete the step to process your data and open the interactive Resume Editor.
        </p>
      </div>

      {/* 5 Options Navigation Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Tab 1: Start From Scratch */}
        <button
          onClick={() => setActiveTab('scratch')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
            activeTab === 'scratch'
              ? 'bg-[#0B192C] border-[#0B192C] text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeTab === 'scratch' ? 'bg-indigo-500/30 text-indigo-300' : 'bg-indigo-50 text-indigo-600'
              }`}
            >
              <FilePlus size={20} />
            </div>
            {activeTab === 'scratch' && <CheckCircle2 size={16} className="text-blue-400" />}
          </div>
          <div>
            <h3 className="font-bold text-sm leading-snug">1. Start Scratch</h3>
            <p
              className={`text-[11px] mt-0.5 line-clamp-1 ${
                activeTab === 'scratch' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Blank canvas & AI assistant
            </p>
          </div>
        </button>

        {/* Tab 2: Upload Resume */}
        <button
          onClick={() => setActiveTab('upload')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
            activeTab === 'upload'
              ? 'bg-[#0B192C] border-[#0B192C] text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeTab === 'upload' ? 'bg-blue-500/30 text-blue-300' : 'bg-blue-50 text-blue-600'
              }`}
            >
              <Upload size={20} />
            </div>
            {activeTab === 'upload' && <CheckCircle2 size={16} className="text-blue-400" />}
          </div>
          <div>
            <h3 className="font-bold text-sm leading-snug">2. Upload Resume</h3>
            <p
              className={`text-[11px] mt-0.5 line-clamp-1 ${
                activeTab === 'upload' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              PDF or DOCX document
            </p>
          </div>
        </button>

        {/* Tab 3: Import GitHub */}
        <button
          onClick={() => setActiveTab('github')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
            activeTab === 'github'
              ? 'bg-[#0B192C] border-[#0B192C] text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeTab === 'github' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-[#0B192C]'
              }`}
            >
              <Github size={20} />
            </div>
            {activeTab === 'github' && <CheckCircle2 size={16} className="text-blue-400" />}
          </div>
          <div>
            <h3 className="font-bold text-sm leading-snug">3. GitHub Import</h3>
            <p
              className={`text-[11px] mt-0.5 line-clamp-1 ${
                activeTab === 'github' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              OAuth & repo selector
            </p>
          </div>
        </button>

        {/* Tab 4: Import LinkedIn */}
        <button
          onClick={() => setActiveTab('linkedin')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
            activeTab === 'linkedin'
              ? 'bg-[#0B192C] border-[#0B192C] text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeTab === 'linkedin' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700'
              }`}
            >
              <Linkedin size={20} />
            </div>
            {activeTab === 'linkedin' && <CheckCircle2 size={16} className="text-blue-400" />}
          </div>
          <div>
            <h3 className="font-bold text-sm leading-snug">4. LinkedIn PDF</h3>
            <p
              className={`text-[11px] mt-0.5 line-clamp-1 ${
                activeTab === 'linkedin' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Extract LinkedIn profile
            </p>
          </div>
        </button>

        {/* Tab 5: Browse Templates */}
        <button
          onClick={() => setActiveTab('templates')}
          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
            activeTab === 'templates'
              ? 'bg-[#0B192C] border-[#0B192C] text-white shadow-md'
              : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center justify-between">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                activeTab === 'templates' ? 'bg-amber-500/30 text-amber-300' : 'bg-amber-50 text-amber-600'
              }`}
            >
              <Layout size={20} />
            </div>
            {activeTab === 'templates' && <CheckCircle2 size={16} className="text-blue-400" />}
          </div>
          <div>
            <h3 className="font-bold text-sm leading-snug">5. Browse Templates</h3>
            <p
              className={`text-[11px] mt-0.5 line-clamp-1 ${
                activeTab === 'templates' ? 'text-slate-300' : 'text-slate-500'
              }`}
            >
              Pick from ATS designs
            </p>
          </div>
        </button>
      </div>

      {/* ------------------------------------------------------------------- */}
      {/* SECTION VIEW 1: START FROM SCRATCH */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'scratch' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
              <FilePlus size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0B192C]">Start From Scratch</h2>
              <p className="text-xs text-slate-500">
                Initialize a clean, structured ATS canvas. Use HireFlow AI prompts to write your summary and accomplishment bullets step by step.
              </p>
            </div>
          </div>

          <form onSubmit={handleStartScratch} className="space-y-6 max-w-2xl">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Resume Document Name
                </label>
                <input
                  type="text"
                  value={scratchTitle}
                  onChange={(e) => setScratchTitle(e.target.value)}
                  placeholder="e.g. Senior Full Stack Developer - 2026"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm font-bold text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0B192C]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Target Job Title
                  </label>
                  <input
                    type="text"
                    value={scratchTargetRole}
                    onChange={(e) => setScratchTargetRole(e.target.value)}
                    placeholder="e.g. Lead Frontend Engineer"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0B192C]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                    Experience Level
                  </label>
                  <select
                    value={scratchLevel}
                    onChange={(e) => setScratchLevel(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0B192C] focus:bg-white focus:outline-none focus:border-[#0B192C]"
                  >
                    <option value="Entry Level (0-2 years)">Entry Level (0-2 years)</option>
                    <option value="Mid Level (2-5 years)">Mid Level (2-5 years)</option>
                    <option value="Senior (5-8 years)">Senior (5-8 years)</option>
                    <option value="Lead / Staff (8+ years)">Lead / Staff (8+ years)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="p-4 bg-indigo-50/60 border border-indigo-100 rounded-2xl flex items-start gap-3 text-xs text-indigo-900">
              <Sparkles size={18} className="text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">AI Guided Creation:</span> Once initialized, you can click "Enhance with AI" inside any section to automatically generate impact bullets for your target role.
              </div>
            </div>

            <button
              type="submit"
              className="w-full sm:w-auto bg-[#0B192C] hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
            >
              <Sparkles size={16} className="text-blue-300" />
              <span>Create Blank Document & Open Editor</span>
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SECTION VIEW 2: UPLOAD RESUME (PDF/DOCX) */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'upload' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Upload size={24} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#0B192C]">Upload Existing Resume</h2>
                <p className="text-xs text-slate-500">
                  Upload your existing PDF or Word resume. Our AI parser automatically extracts contact details, work history, skills, and education to populate the editor.
                </p>
              </div>
            </div>

            {/* Drag & Drop Area */}
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-all ${
                dragActive
                  ? 'border-blue-600 bg-blue-50/60 scale-[1.01]'
                  : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 shadow-xs">
                <FileUp size={32} />
              </div>

              <h3 className="font-black text-lg text-[#0B192C]">
                Drag & Drop your resume here
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm">
                Supports PDF or DOCX files up to 10MB.
              </p>

              <div className="mt-6">
                <label className="bg-[#0B192C] hover:bg-slate-800 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer inline-flex items-center gap-2 shadow-md transition-colors">
                  <Upload size={16} />
                  <span>Choose PDF / DOCX File</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Upload History Section */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-slate-500" />
                <h3 className="font-bold text-base text-[#0B192C]">Your Upload History</h3>
              </div>
              <span className="text-xs font-mono font-bold text-slate-500">
                {uploadHistory.length} Uploaded Files
              </span>
            </div>

            <div className="space-y-3">
              {uploadHistory.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-50/80 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-100/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-blue-100 text-blue-700 rounded-xl shrink-0 font-bold text-xs uppercase">
                      {item.fileType}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-[#0B192C] truncate max-w-[280px]">
                        {item.fileName}
                      </h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {item.fileSize} &middot; Uploaded {item.uploadedAt} &middot;{' '}
                        <span className="text-emerald-700 font-bold">{item.status}</span>
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleImportFromHistory(item)}
                    className="bg-[#0B192C] hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0"
                  >
                    <span>Import Data into Editor</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SECTION VIEW 3: IMPORT FROM GITHUB */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          {/* GitHub Header & Connect Box */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-slate-100 text-[#0B192C] rounded-2xl">
                  <Github size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-[#0B192C]">Import GitHub Projects</h2>
                  <p className="text-xs text-slate-500">
                    Connect GitHub OAuth or search your username. Select repositories to automatically generate project accomplishments & tech stack keywords.
                  </p>
                </div>
              </div>

              {githubConnected && (
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-mono font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>OAuth Connected</span>
                </span>
              )}
            </div>

            {/* Username Search & Sync Bar */}
            <form onSubmit={handleFetchGithubUser} className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={githubUsername}
                  onChange={(e) => setGithubUsername(e.target.value)}
                  placeholder="Enter GitHub Username (e.g. alexkumar-dev)"
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
                    <span>Fetching Repos...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw size={15} />
                    <span>Fetch Public Repositories</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Repository Selection UI */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="font-black text-lg text-[#0B192C]">
                  Select Repositories to Include ({githubRepos.filter((r) => r.selected).length} Selected)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Check the projects you want AI to format into the Projects & Technical Skills sections of your resume.
                </p>
              </div>

              <div className="relative">
                <input
                  type="text"
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  placeholder="Filter repositories..."
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#0B192C] focus:outline-none"
                />
                <Search size={14} className="absolute left-2.5 top-2 text-slate-400" />
              </div>
            </div>

            {/* Repositories Cards List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredRepos.map((repo) => (
                <div
                  key={repo.id}
                  onClick={() => toggleRepoSelection(repo.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 ${
                    repo.selected
                      ? 'bg-blue-50/60 border-blue-500 shadow-xs ring-1 ring-blue-500/20'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          repo.selected
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {repo.selected && <Check size={14} />}
                      </div>
                      <h4 className="font-bold text-sm text-[#0B192C] font-mono">{repo.name}</h4>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 text-slate-700 text-[11px] font-mono font-bold px-2 py-0.5 rounded-md shrink-0">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      <span>{repo.stars}</span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {repo.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 text-[11px] font-mono">
                    <span className="font-bold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-md">
                      {repo.language}
                    </span>
                    <span className="text-slate-400">Updated {repo.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Process Action */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-xs font-mono text-slate-500">
                Selected {githubRepos.filter((r) => r.selected).length} of {githubRepos.length} repos
              </span>

              <button
                onClick={handleImportGithubProjects}
                className="w-full sm:w-auto bg-[#0B192C] hover:bg-slate-800 text-white px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-colors cursor-pointer flex items-center justify-center gap-2"
              >
                <Sparkles size={16} className="text-blue-300" />
                <span>Import Selected Repos into Resume Editor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SECTION VIEW 4: LINKEDIN PDF IMPORT */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'linkedin' && (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-2xs space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-3 bg-blue-50 text-blue-700 rounded-2xl">
              <Linkedin size={24} />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#0B192C]">Import LinkedIn Profile PDF</h2>
              <p className="text-xs text-slate-500">
                Export your LinkedIn profile to PDF and upload it here. We extract work experience, education, endorsements, and headline summary automatically.
              </p>
            </div>
          </div>

          {/* LinkedIn Instruction Banner */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3 text-xs text-slate-700">
            <Info size={18} className="text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-[#0B192C]">How to export your LinkedIn PDF:</span>
              <ol className="list-decimal list-inside space-y-1 mt-1 text-slate-600">
                <li>Go to your LinkedIn Profile page.</li>
                <li>Click the <span className="font-bold text-[#0B192C]">"More"</span> button beneath your header.</li>
                <li>Select <span className="font-bold text-[#0B192C]">"Save to PDF"</span> and upload the downloaded document below.</li>
              </ol>
            </div>
          </div>

          {/* LinkedIn PDF Dropzone */}
          <div
            onDragEnter={handleLinkedInDrag}
            onDragOver={handleLinkedInDrag}
            onDragLeave={handleLinkedInDrag}
            onDrop={handleLinkedInDrop}
            className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center flex flex-col items-center justify-center transition-all ${
              linkedInDragActive
                ? 'border-blue-600 bg-blue-50/60 scale-[1.01]'
                : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
            }`}
          >
            <div className="w-16 h-16 rounded-3xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4 shadow-xs">
              <Linkedin size={32} />
            </div>

            <h3 className="font-black text-lg text-[#0B192C]">
              Drop your LinkedIn exported PDF here
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm">
              Upload your official LinkedIn Profile PDF file.
            </p>

            <div className="mt-6">
              <label className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer inline-flex items-center gap-2 shadow-md transition-colors">
                <Linkedin size={16} />
                <span>Upload LinkedIn PDF</span>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleLinkedInFileInput}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SECTION VIEW 5: BROWSE TEMPLATES */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'templates' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Category Filter Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              {['All', 'Tech', 'Executive', 'Minimal', 'Design', 'Academic', 'Creative'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#0B192C] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Template Search Box */}
            <div className="relative shrink-0">
              <input
                type="text"
                value={templateSearch}
                onChange={(e) => setTemplateSearch(e.target.value)}
                placeholder="Search templates..."
                className="bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs text-[#0B192C] focus:outline-none focus:border-[#0B192C]"
              />
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white border border-slate-200/90 rounded-3xl overflow-hidden shadow-2xs hover:shadow-lg transition-all group flex flex-col justify-between"
              >
                <div className="relative h-56 bg-slate-100 overflow-hidden border-b border-slate-200/80">
                  <img
                    src={tmpl.previewImage}
                    alt={tmpl.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <button
                      onClick={() => handleSelectTemplate(tmpl.name)}
                      className="w-full bg-white hover:bg-slate-50 text-[#0B192C] font-bold text-xs py-2.5 rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles size={14} className="text-blue-600" />
                      <span>Use This Template</span>
                    </button>
                  </div>

                  {tmpl.badge && (
                    <span className="absolute top-3 left-3 bg-[#0B192C] text-white text-[10px] font-bold font-mono px-2.5 py-1 rounded-full shadow-md">
                      {tmpl.badge}
                    </span>
                  )}
                </div>

                <div className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                      {tmpl.name}
                    </h3>
                    <span className="bg-slate-100 text-slate-600 text-[10px] font-bold font-mono px-2 py-0.5 rounded-md">
                      {tmpl.category}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {tmpl.description}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs font-mono text-slate-500">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star size={14} fill="currentColor" />
                      <span>{tmpl.rating}</span>
                    </div>
                    <span>{(tmpl.downloads / 1000).toFixed(1)}k downloads</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
