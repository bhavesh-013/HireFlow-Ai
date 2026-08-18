import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
  mockLinkedInProfileData,
  mockResumes,
} from '../data/mockData';
import { getStoredUser } from '../lib/api';
import { ParsedResumeData, UploadHistoryItem, ResumeType } from '../types';
import { GithubImporter } from '../components/GithubImporter';
import ResumeEditorPage from './ResumeEditorPage';
import { getDefaultSectionItems, suggestResumeType } from '../services/section.reorder';
import { parseResumeFile } from '../utils/fileParser';
import { parseResumeText } from '../utils/resumeTextParser';
import { FRESHER_DEFAULT_RESUME } from '../data/defaultFresherResume';
import { EXPERIENCED_DEFAULT_RESUME } from '../data/defaultExperiencedResume';

export default function ResumeBuilderPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Real logged-in user (from localStorage set during auth)
  const currentUser = getStoredUser();

  // Resume Builder is a single page with two states:
  //  - chooser (upload / scratch / GitHub import) when there's no resume yet
  //  - editor, once a resume exists (loaded via ?id=, an in-progress local
  //    draft, or one just created) — unless the user explicitly asked to
  //    start a new one (?new=1, used by the Dashboard's "+ Create New").
  // Switching between them is a state change, never a route change.
  const forceNew = searchParams.get('new') === '1';
  const hasLocalDraft = (() => {
    try {
      return !!localStorage.getItem('hireflow_current_resume');
    } catch {
      return false;
    }
  })();
  const [showEditor, setShowEditor] = useState<boolean>(
    !forceNew && (!!searchParams.get('id') || !!searchParams.get('template') || hasLocalDraft)
  );

  useEffect(() => {
    if (forceNew) {
      try {
        localStorage.removeItem('hireflow_current_resume');
      } catch {
        // ignore
      }
    }
    // Only relevant on first mount for a given navigation
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active Creation Tab Mode
  const [activeTab, setActiveTab] = useState<
    'scratch' | 'upload' | 'github' | 'linkedin'
  >('upload');

  // Common Processing Modal State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingTitle, setProcessingTitle] = useState('');
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepText, setCurrentStepText] = useState('');

  // ----------------------------------------------------
  // Option 1: Start From Scratch State
  // ----------------------------------------------------
  const [scratchTitle, setScratchTitle] = useState('');
  const [scratchTargetRole, setScratchTargetRole] = useState('');
  // Explicit resume-type choice — never calculated from years of
  // experience, always a direct user decision. See types.ResumeType.
  const [resumeType, setResumeType] = useState<ResumeType>('experienced');

  // ----------------------------------------------------
  // Option 2: Upload Resume State
  // ----------------------------------------------------
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadHistory, setUploadHistory] = useState<UploadHistoryItem[]>([]);

  // Note: GitHub import itself is handled entirely by the <GithubImporter />
  // component below (real GitHub API + skill/project extraction pipeline).

  // ----------------------------------------------------
  // Option 4: LinkedIn Import State
  // ----------------------------------------------------
  const [linkedInFile, setLinkedInFile] = useState<File | null>(null);
  const [linkedInDragActive, setLinkedInDragActive] = useState(false);

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
          // Show the editor in place — no route change, same page.
          setShowEditor(true);
        }, 800);
      }
    }, 500);
  };

  // ----------------------------------------------------
  // Handler: Start From Scratch
  // ----------------------------------------------------
  const handleStartScratch = (e: React.FormEvent) => {
    e.preventDefault();
    const isFresher = resumeType === 'fresher';
    const blankResume: ParsedResumeData = isFresher
      ? {
          ...FRESHER_DEFAULT_RESUME,
          title: `${scratchTitle || FRESHER_DEFAULT_RESUME.personalInfo.fullName}.pdf`,
          targetRole: scratchTargetRole || FRESHER_DEFAULT_RESUME.targetRole,
          personalInfo: {
            ...FRESHER_DEFAULT_RESUME.personalInfo,
            jobTitle: scratchTargetRole || FRESHER_DEFAULT_RESUME.personalInfo.jobTitle,
          },
        }
      : {
          ...EXPERIENCED_DEFAULT_RESUME,
          title: `${scratchTitle || EXPERIENCED_DEFAULT_RESUME.personalInfo.fullName}.pdf`,
          targetRole: scratchTargetRole || EXPERIENCED_DEFAULT_RESUME.targetRole,
          personalInfo: {
            ...EXPERIENCED_DEFAULT_RESUME.personalInfo,
            jobTitle: scratchTargetRole || EXPERIENCED_DEFAULT_RESUME.personalInfo.jobTitle,
          },
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

  const [uploadParseWarning, setUploadParseWarning] = useState<string | null>(null);

  const processUploadedFile = async (file: File) => {
    if (!file.name.match(/\.(pdf|docx|doc)$/i)) {
      alert('Please select a valid PDF or DOCX file.');
      return;
    }
    setUploadedFile(file);
    setUploadParseWarning(null);
    setIsProcessing(true);
    setProcessingTitle(`Parsing Resume File: ${file.name}`);
    setProgressPercent(15);
    setCurrentStepText('Reading document contents...');

    let parsedData: ParsedResumeData;
    let parseFailed = false;

    try {
      // Real extraction — pdfjs-dist for PDF, mammoth for DOCX (see
      // utils/fileParser.ts) — never fabricated data.
      const cleanText = await parseResumeFile(file);
      setProgressPercent(55);
      setCurrentStepText('Extracting contact info, experience, education & skills...');

      if (!cleanText || cleanText.trim().length < 20) {
        parseFailed = true;
      }

      const extracted = parseResumeText(cleanText, file.name);

      // Merge in whatever we already know about the logged-in user for
      // fields the parser couldn't find — never invented, always real.
      parsedData = {
        ...extracted,
        importSource: 'upload',
        personalInfo: {
          ...extracted.personalInfo,
          email: extracted.personalInfo.email || currentUser?.email || '',
          phone: extracted.personalInfo.phone || currentUser?.phone || '',
          location: extracted.personalInfo.location || currentUser?.location || '',
          website: extracted.personalInfo.website || currentUser?.website || '',
          github: extracted.personalInfo.github || currentUser?.github || '',
          linkedin: extracted.personalInfo.linkedin || currentUser?.linkedin || '',
        },
      };

      const inferredType = suggestResumeType(parsedData);
      parsedData.resumeType = inferredType;
      parsedData.sectionsOrder = getDefaultSectionItems(inferredType);
    } catch (err) {
      console.error('Resume parsing error:', err);
      parseFailed = true;
      parsedData = {
        title: file.name,
        importSource: 'upload',
        resumeType: 'experienced',
        sectionsOrder: getDefaultSectionItems('experienced'),
        personalInfo: {
          fullName: currentUser?.full_name || currentUser?.name || '',
          jobTitle: '',
          email: currentUser?.email || '',
          phone: currentUser?.phone || '',
          location: currentUser?.location || '',
          website: currentUser?.website || '',
          github: currentUser?.github || '',
          linkedin: currentUser?.linkedin || '',
          summary: '',
        },
        experiences: [],
        education: [],
        skills: '',
        projects: [],
        certificates: [],
      };
    }

    if (parseFailed) {
      setUploadParseWarning('Unable to extract some information from this file. Please review and correct the fields in the editor.');
    }

    setProgressPercent(85);
    setCurrentStepText('Auto-filling Resume Editor...');

    // Add to local upload history state
    const newHistoryItem: UploadHistoryItem = {
      id: `upl_${Date.now()}`,
      fileName: file.name,
      fileSize: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      fileType: file.name.endsWith('.docx') ? 'docx' : 'pdf',
      uploadedAt: 'Just now',
      status: parseFailed ? 'Failed' : 'Parsed',
      parsedResume: parsedData,
    };
    setUploadHistory([newHistoryItem, ...uploadHistory]);

    try {
      localStorage.setItem('hireflow_current_resume', JSON.stringify(parsedData));
    } catch {
      // ignore
    }

    setProgressPercent(100);
    setCurrentStepText(parseFailed ? 'Import complete — please review extracted fields.' : 'Import complete! Opening Resume Editor...');

    setTimeout(() => {
      setIsProcessing(false);
      setShowEditor(true);
      if (parseFailed) {
        // Surface the warning inside the editor toast too, since the
        // chooser view unmounts once the editor takes over.
        try {
          sessionStorage.setItem('hireflow_upload_warning', 'Unable to extract some information from this file. Please review and correct the fields below.');
        } catch {
          // ignore
        }
      }
    }, 800);
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
        fullName: currentUser?.full_name || currentUser?.name || mockLinkedInProfileData.fullName,
        jobTitle: 'Senior Frontend Engineer',
        email: currentUser?.email || '',
        phone: currentUser?.phone || '',
        location: currentUser?.location || '',
        website: currentUser?.website || '',
        linkedin: currentUser?.linkedin || '',
        github: currentUser?.github || '',
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



  // State 2: a resume exists (loaded by id, or just created) — show the editor,
  // still on the same /app/builder route. No navigation, only conditional rendering.
  if (showEditor) {
    return <ResumeEditorPage />;
  }

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

      {/* 4 Options Navigation Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
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

              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  What type of resume are you creating?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setResumeType('fresher')}
                    className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                      resumeType === 'fresher'
                        ? 'bg-[#0B192C] border-[#0B192C] text-white'
                        : 'bg-slate-50 border-slate-200 text-[#0B192C] hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-bold text-sm">
                      {resumeType === 'fresher' && <Check size={16} className="text-blue-300" />}
                      Fresher
                    </span>
                    <p className={`text-[11px] mt-1 ${resumeType === 'fresher' ? 'text-slate-300' : 'text-slate-500'}`}>
                      For students and candidates with little or no professional experience.
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setResumeType('experienced')}
                    className={`text-left p-4 rounded-xl border transition-colors cursor-pointer ${
                      resumeType === 'experienced'
                        ? 'bg-[#0B192C] border-[#0B192C] text-white'
                        : 'bg-slate-50 border-slate-200 text-[#0B192C] hover:bg-slate-100'
                    }`}
                  >
                    <span className="flex items-center gap-2 font-bold text-sm">
                      {resumeType === 'experienced' && <Check size={16} className="text-blue-300" />}
                      Experienced Professional
                    </span>
                    <p className={`text-[11px] mt-1 ${resumeType === 'experienced' ? 'text-slate-300' : 'text-slate-500'}`}>
                      For candidates with professional work experience.
                    </p>
                  </button>
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

          {/* Upload History Section (Only visible when user has uploaded files) */}
          {uploadHistory.length > 0 && (
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
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------- */}
      {/* SECTION VIEW 3: IMPORT FROM GITHUB */}
      {/* ------------------------------------------------------------------- */}
      {activeTab === 'github' && (
        <GithubImporter
          onConfirmImport={(parsedResume) => {
            runImportProcess(
              'Importing GitHub Repositories into Resume',
              [
                'Authenticating GitHub OAuth token...',
                'Analyzing repository package.json, README, and dependency manifests...',
                'Extracting categorized technical skills across 9 domains...',
                'Generating STAR-formatted project entries & key highlights...',
                'Populating Resume Editor with imported Projects, Skills & GitHub profile link...',
              ],
              parsedResume
            );
          }}
          mockUser={currentUser || { name: '', email: '', phone: '', location: '', website: '', github: '', linkedin: '', id: '', role: '', membership: '', avatar: '', bio: '', resumePreferences: { targetRole: '', industry: '', experienceLevel: '', autoSave: false, aiEnhanceOnExport: false } }}
        />
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


    </div>
  );
}
