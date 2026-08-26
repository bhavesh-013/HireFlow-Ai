import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Save,
  Download,
  Eye,
  EyeOff,
  Undo,
  Redo,
  Sparkles,
  CheckCircle2,
  Plus,
  PlusCircle,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Code,
  Award,
  Trophy,
  Globe,
  ArrowLeft,
  FileText,
  Palette,
  Type,
  Sliders,
  Check,
  AlertCircle,
  RotateCcw,
  Github,
  Star,
  ExternalLink,
  X,
  Edit3,
  Zap,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  FileCheck,
  Sparkle,
  GripVertical,
  Copy,
  Layers,
  FolderPlus,
  Linkedin,
  Wand2
} from 'lucide-react';
import { validateLinkedInUrl, validateGitHubUrl, validatePortfolioUrl } from '../utils/urlValidator';
import { extractResumeMetrics, fixSummaryGrammar, improveSummaryAts } from '../utils/summaryAi';
import { resumes as resumesApi, ai as aiApi, activity, ApiRequestError, isAuthenticated, getStoredUser } from '../lib/api';
import { rememberCurrentLocationForRedirect } from '../lib/authGate';
import { authService } from '../services/auth.service';
import { toBackendPayload, fromBackendResume } from '../lib/resumeMapping';
import {
  ParsedResumeData,
  ExperienceItem,
  EducationItem,
  ProjectItem,
  CertificateItem,
  AchievementItem,
  SectionNavItem,
  CustomSectionData,
  CustomSectionItem,
  ResumeType,
  ATSFullReport
} from '../types';
import { GitHubImportModal } from '../components/app/GitHubImportModal';
import { templatesConfigService } from '../services/templateConfig.service';
import { getDefaultSectionItems, getDefaultCustomSections } from '../services/section.reorder';
import { normalizeProjects } from '../utils/resumeTextParser';
import { AiWritingAssistantInline } from '../components/app/AiWritingAssistantInline';
import { downloadDocxExport, generateSafeFilename } from '../services/export.service';
import { atsEngine } from '../services/ats.engine';
import FresherDocumentView from '../components/templates/FresherDocumentView';
import ExperiencedDocumentView from '../components/templates/ExperiencedDocumentView';

export default function ResumeEditorPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const documentSheetRef = useRef<HTMLDivElement | null>(null);

  // Backend resume id — present once this resume has been saved at least once
  const [resumeId, setResumeId] = useState<string | null>(searchParams.get('id'));
  const [isLoadingResume, setIsLoadingResume] = useState<boolean>(!!searchParams.get('id'));
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isAiWorking, setIsAiWorking] = useState(false);
  // Stores which export type ('pdf' | 'docx') to auto-fire after login redirect
  const pendingExportRef = React.useRef<'pdf' | 'docx' | null>(null);

  // Only Export requires authentication. Unauthenticated users are redirected
  // directly to the Sign In page without showing any modal or popup.
  const gateExport = (type: 'pdf' | 'docx'): boolean => {
    if (!isAuthenticated()) {
      // Immediately write latest resume draft to localStorage so no user edits are lost
      const currentResume: ParsedResumeData = {
        title: docTitle,
        targetRole,
        personalInfo,
        experiences,
        education,
        skills,
        projects,
        certificates,
        achievements,
        resumeType,
        sectionsOrder: sections,
        customSections,
        templateName: selectedTemplate,
        resumeStyling,
      };
      try {
        localStorage.setItem('hireflow_current_resume', JSON.stringify(currentResume));
      } catch {
        // ignore
      }

      sessionStorage.setItem('hireflow_pending_export', type);
      rememberCurrentLocationForRedirect(location.pathname, location.search);
      navigate('/login');
      return true;
    }
    return false;
  };

  // Load state from router or localStorage
  const importedData: ParsedResumeData | null = location.state?.importedResume || (() => {
    try {
      const stored = localStorage.getItem('hireflow_current_resume');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  // Real logged-in user (if any) — used to prefill known contact fields,
  // never to fabricate resume content.
  const currentUser = getStoredUser();

  // Default section navigator items now come from getDefaultSectionItems()
  // in services/section.reorder.ts, which is resumeType-aware (Fresher vs
  // Experienced) — see the `sections` state initializer below.

  // ----------------------------------------------------
  // STATE MANAGEMENT
  // ----------------------------------------------------
  const [activeSection, setActiveSection] = useState<string>('personal');
  // Explicit Fresher / Experienced choice — drives the default section
  // order below. Never inferred from years-of-experience math; only ever
  // set by the user (in the builder chooser) or an initial best-guess from
  // an import, which the user can change here at any time.
  const [resumeType, setResumeType] = useState<ResumeType>(importedData?.resumeType || 'experienced');
  const [fresherLayoutMode, setFresherLayoutMode] = useState<'auto' | '1-column' | '2-column'>('auto');
  const [sections, setSections] = useState<SectionNavItem[]>(
    importedData?.sectionsOrder || getDefaultSectionItems(resumeType)
  );
  const [customSections, setCustomSections] = useState<CustomSectionData[]>(
    importedData?.customSections || getDefaultCustomSections(resumeType)
  );

  const [isAddSectionModalOpen, setIsAddSectionModalOpen] = useState(false);
  const [newCustomSectionTitle, setNewCustomSectionTitle] = useState('');
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [aiHighlightedSection, setAiHighlightedSection] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(true);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState('Modern Executive');

  // Preview controls
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [isAtsPanelExpanded, setIsAtsPanelExpanded] = useState<boolean>(false);

  // Live ATS Engine State (Calculated 100% deterministically from active resume & JD)
  const [atsReport, setAtsReport] = useState<ATSFullReport | null>(null);
  const [liveAtsScore, setLiveAtsScore] = useState<number | null>(null);
  const [isCalculatingAts, setIsCalculatingAts] = useState<boolean>(false);
  const [atsLastUpdatedText, setAtsLastUpdatedText] = useState<string>('Updated just now');

  // Tailored Resume State
  const [activeResumeMode, setActiveResumeMode] = useState<'original' | 'tailored'>('original');
  const [tailoredResumeData, setTailoredResumeData] = useState<ParsedResumeData | null>(null);
  const [jdTab, setJdTab] = useState<'paste' | 'upload' | 'linkedin'>('paste');
  const [jdText, setJdText] = useState('');
  const [jdLinkedinUrl, setJdLinkedinUrl] = useState('');
  const [jdFile, setJdFile] = useState<File | null>(null);
  const [isAnalyzingJd, setIsAnalyzingJd] = useState(false);
  const [isTailorPanelExpanded, setIsTailorPanelExpanded] = useState(true);
  const [jdAnalysisResult, setJdAnalysisResult] = useState<{
    matchPercent: number;
    missingKeywords: string[];
    requiredSkills: string[];
    recommendedSkills: string[];
    missingMetrics: string[];
    suggestions: string[];
  } | null>(null);

  const [docTitle, setDocTitle] = useState(
    importedData?.title || 'Untitled Resume.pdf'
  );
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [targetRole, setTargetRole] = useState(
    importedData?.targetRole || ''
  );

  // Toast message
  const [toastMsg, setToastMsg] = useState<string | null>(
    importedData?.importSource
      ? `Resume auto-filled from ${importedData.importSource.toUpperCase()} import! Ready to customize.`
      : null
  );

  // Form State — real data only. When there's no imported resume, fields
  // start empty (or prefilled from the real logged-in account) rather than
  // a fabricated demo profile.
  const [personalInfo, setPersonalInfo] = useState({
    fullName: importedData?.personalInfo?.fullName || currentUser?.full_name || currentUser?.name || '',
    jobTitle: importedData?.personalInfo?.jobTitle || '',
    email: importedData?.personalInfo?.email || currentUser?.email || '',
    phone: importedData?.personalInfo?.phone || currentUser?.phone || '',
    location: importedData?.personalInfo?.location || currentUser?.location || '',
    website: importedData?.personalInfo?.website || currentUser?.website || '',
    github: importedData?.personalInfo?.github || currentUser?.github || '',
    linkedin: importedData?.personalInfo?.linkedin || currentUser?.linkedin || '',
    summary: importedData?.personalInfo?.summary || '',
  });

  const [urlErrors, setUrlErrors] = useState<{
    linkedin?: string | null;
    github?: string | null;
    website?: string | null;
  }>({});

  const [summaryPreviewDiff, setSummaryPreviewDiff] = useState<{
    original: string;
    suggested: string;
    type: string;
  } | null>(null);

  const handleLinkedinChange = (value: string) => {
    setPersonalInfo((prev) => ({ ...prev, linkedin: value }));
    const res = validateLinkedInUrl(value);
    setUrlErrors((prev) => ({ ...prev, linkedin: res.error }));
  };

  const handleGithubChange = (value: string) => {
    setPersonalInfo((prev) => ({ ...prev, github: value }));
    const res = validateGitHubUrl(value);
    setUrlErrors((prev) => ({ ...prev, github: res.error }));
  };

  const handleWebsiteChange = (value: string) => {
    setPersonalInfo((prev) => ({ ...prev, website: value }));
    const res = validatePortfolioUrl(value);
    setUrlErrors((prev) => ({ ...prev, website: res.error }));
  };

  const [experiences, setExperiences] = useState<ExperienceItem[]>(
    importedData?.experiences && importedData.experiences.length > 0
      ? importedData.experiences
      : []
  );

  const [education, setEducation] = useState<EducationItem[]>(
    importedData?.education && importedData.education.length > 0
      ? importedData.education
      : []
  );

  const [skills, setSkills] = useState<string>(
    importedData?.skills || ''
  );

  const [projects, setProjects] = useState<ProjectItem[]>(
    importedData?.projects && importedData.projects.length > 0
      ? normalizeProjects(importedData.projects)
      : []
  );

  const [certificates, setCertificates] = useState<CertificateItem[]>(
    importedData?.certificates && importedData.certificates.length > 0
      ? importedData.certificates
      : []
  );

  const [achievements, setAchievements] = useState<AchievementItem[]>(
    importedData?.achievements && importedData.achievements.length > 0
      ? importedData.achievements
      : []
  );

  // Customization & Styling State
  const [resumeStyling, setResumeStyling] = useState(
    importedData?.resumeStyling || {
      fontFamily: 'Inter, sans-serif',
      primaryColor: '#000000',
      accentColor: '#000000',
      textColor: '#111827',
      backgroundColor: '#FFFFFF',
      fontSize: 'normal',
      lineHeight: 'normal',
      sectionSpacing: 'normal',
    }
  );

  // Active resume data displayed in the live preview (Original vs Tailored)
  const displayPersonalInfo = activeResumeMode === 'tailored' && tailoredResumeData ? tailoredResumeData.personalInfo : personalInfo;
  const displayExperiences = activeResumeMode === 'tailored' && tailoredResumeData ? tailoredResumeData.experiences : experiences;
  const displayEducation = activeResumeMode === 'tailored' && tailoredResumeData ? tailoredResumeData.education : education;
  const displaySkills = activeResumeMode === 'tailored' && tailoredResumeData ? (tailoredResumeData.skills || '') : skills;
  const displayProjects = normalizeProjects(
    activeResumeMode === 'tailored' && tailoredResumeData ? tailoredResumeData.projects : projects
  );
  const displayCertificates = activeResumeMode === 'tailored' && tailoredResumeData ? (tailoredResumeData.certificates || []) : certificates;
  const displayAchievements = activeResumeMode === 'tailored' && tailoredResumeData ? (tailoredResumeData.achievements || []) : achievements;

  // Handlers for Tailored Resume Section
  const handleAnalyzeJd = async () => {
    const rawJd = jdText || (jdFile ? jdFile.name : '') || jdLinkedinUrl;
    if (!rawJd.trim()) {
      showToast('Please paste a job description or provide a file/link first.');
      return;
    }
    setIsAnalyzingJd(true);
    try {
      const result: any = await aiApi.jdMatch(currentResumeDataSnapshot(), rawJd);
      setJdAnalysisResult({
        matchPercent: result?.matchPercentage || result?.matchScore || 0,
        missingKeywords: result?.missingKeywords || [],
        requiredSkills: result?.requiredSkills || [],
        recommendedSkills: result?.recommendedSkills || [],
        missingMetrics: result?.missingMetrics || [],
        suggestions: result?.recommendations || [],
      });
      showToast('Job description analyzed! Review findings below.');
    } catch {
      showToast('Could not analyze the job description — please try again.');
    } finally {
      setIsAnalyzingJd(false);
    }
  };

  const handleGenerateTailoredResume = () => {
    if (!jdAnalysisResult) {
      showToast('Please analyze a job description first.');
      return;
    }
    // Tailoring re-emphasizes and reorders the candidate's REAL content for
    // this role — it must never invent a metric, skill, or technology the
    // user didn't already provide. No fabricated bullets/skills are added
    // here; only real resume data, carried over as-is.
    const tailored: ParsedResumeData = {
      title: `${docTitle.replace(/\.(pdf|docx)$/i, '')}_Tailored.pdf`,
      targetRole: targetRole || personalInfo.jobTitle,
      templateName: selectedTemplate,
      resumeType,
      personalInfo: {
        ...personalInfo,
        jobTitle: targetRole || personalInfo.jobTitle,
      },
      experiences,
      education,
      skills,
      projects,
      certificates,
      achievements,
    };

    setTailoredResumeData(tailored);
    setActiveResumeMode('tailored');
    showToast('Tailored Resume generated! Live preview updated to Tailored view.');
  };

  // After a login redirect, sessionStorage may hold a pending export type.
  // Read it once on mount (after state is fully initialised) and fire the
  // appropriate export so the user never has to click again.
  useEffect(() => {
    const pending = sessionStorage.getItem('hireflow_pending_export') as 'pdf' | 'docx' | null;
    if (!pending) return;

    let cancelled = false;

    const checkAndExecuteExport = async () => {
      let authed = isAuthenticated();
      if (!authed) {
        try {
          const user = await authService.getCurrentUser();
          authed = !!user;
        } catch {
          authed = false;
        }
      }

      if (cancelled) return;

      if (authed) {
        sessionStorage.removeItem('hireflow_pending_export');
        showToast(`Authenticated! Auto-exporting ${pending.toUpperCase()}...`);
        setTimeout(() => {
          if (pending === 'pdf') {
            pendingExportRef.current = 'pdf';
            triggerPrintExport();
          } else {
            triggerDocxExport();
          }
        }, 600);
      } else {
        sessionStorage.removeItem('hireflow_pending_export');
      }
    };

    checkAndExecuteExport();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle URL ?template=<templateId> parameter or template selection updates
  useEffect(() => {
    const tmplId = searchParams.get('template');
    if (tmplId) {
      const tmpl = templatesConfigService.getTemplateById(tmplId);
      if (tmpl) {
        setSelectedTemplate(tmpl.name);
        setResumeStyling(templatesConfigService.toResumeStyling(tmpl));
        showToast(`Applied "${tmpl.name}" ATS template layout!`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // Surface the "couldn't fully parse this file" warning (set by
  // ResumeBuilderPage's upload handler) once the editor takes over.
  useEffect(() => {
    try {
      const warning = sessionStorage.getItem('hireflow_upload_warning');
      if (warning) {
        showToast(warning);
        sessionStorage.removeItem('hireflow_upload_warning');
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load an existing resume from the backend when editing via ?id=<resumeId>
  useEffect(() => {
    if (!resumeId) return;
    let cancelled = false;

    (async () => {
      try {
        const doc = await resumesApi.get(resumeId);
        if (cancelled) return;
        const mapped = fromBackendResume(doc);
        setDocTitle(mapped.docTitle);
        setTargetRole(mapped.targetRole);
        setPersonalInfo({
          fullName: mapped.personalInfo.fullName || '',
          jobTitle: mapped.personalInfo.jobTitle || '',
          email: mapped.personalInfo.email || '',
          phone: mapped.personalInfo.phone || '',
          location: mapped.personalInfo.location || '',
          website: mapped.personalInfo.website || '',
          github: mapped.personalInfo.github || '',
          linkedin: mapped.personalInfo.linkedin || '',
          summary: mapped.personalInfo.summary || '',
        });
        setUrlErrors({
          linkedin: validateLinkedInUrl(mapped.personalInfo.linkedin).error,
          github: validateGitHubUrl(mapped.personalInfo.github).error,
          website: validatePortfolioUrl(mapped.personalInfo.website).error,
        });
        if (mapped.experiences.length > 0) setExperiences(mapped.experiences);
        if (mapped.education.length > 0) setEducation(mapped.education);
        if (mapped.skills) setSkills(mapped.skills);
        if (mapped.projects.length > 0) setProjects(normalizeProjects(mapped.projects));
        if (mapped.certificates.length > 0) setCertificates(mapped.certificates);
        if (mapped.achievements && mapped.achievements.length > 0) setAchievements(mapped.achievements);
        if (mapped.resumeType) setResumeType(mapped.resumeType);
        if (mapped.sections && mapped.sections.length > 0) {
          setSections(mapped.sections);
        } else if (mapped.resumeType) {
          // Older saved resume with no persisted section order — fall
          // back to the type-appropriate default rather than the generic one.
          setSections(getDefaultSectionItems(mapped.resumeType));
        }
        if (mapped.customSections) setCustomSections(mapped.customSections);
        if (mapped.selectedTemplate) setSelectedTemplate(mapped.selectedTemplate);
        if (mapped.resumeStyling) setResumeStyling(mapped.resumeStyling);
        if (typeof mapped.atsScore === 'number') setLiveAtsScore(mapped.atsScore);
      } catch (err) {
        if (!cancelled) {
          setSaveError(
            err instanceof ApiRequestError ? err.message : 'Could not load this resume.'
          );
        }
      } finally {
        if (!cancelled) setIsLoadingResume(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // Only run once, on mount, for the resume id present in the URL at load time
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Comparison Modal State
  const [showComparisonModal, setShowComparisonModal] = useState(false);
  // Real pre-AI snapshot for the comparison modal (set right before an AI
  // pass runs). Null until the user has actually run "Apply All AI" once.
  const [preAiSnapshot, setPreAiSnapshot] = useState<{ summary: string; skills: string } | null>(null);

  // GitHub Import Modal State
  const [isGithubModalOpen, setIsGithubModalOpen] = useState(false);
  const [githubImportMode, setGithubImportMode] = useState<'skills' | 'projects'>('skills');

  // AI Priority Fix Suggestions
  const coachSuggestions = [
    {
      id: 'sug_summary',
      title: 'AI Improve Summary',
      section: 'summary',
      atsGain: 4,
      description: 'AI optimizes your summary for ATS structure and keywords.',
      apply: () => handleAiImproveSummary(),
    },
    {
      id: 'sug_metrics',
      title: 'Add STAR Metrics to Experience',
      section: 'experience',
      atsGain: 5,
      description: 'AI rewrites your top role\'s bullets with quantified STAR-style impact.',
      apply: () => handleEnhanceExperienceWithAI(),
    },
    {
      id: 'sug_docker',
      title: 'Suggest Missing Skills',
      section: 'skills',
      atsGain: 6,
      description: 'AI recommends in-demand keywords missing from your skills based on your resume.',
      apply: () => handleSuggestSkillsWithAI(),
    },
    {
      id: 'sug_projects',
      title: 'Improve Project Bullets',
      section: 'projects',
      atsGain: 3,
      description: 'AI rewrites your first project\'s bullets with more concrete detail.',
      apply: () => handleImproveProjectBulletsWithAI(),
    },
  ];

  // Compact Section Navigator Definition
  const sectionNavItems = [
    { id: 'personal', title: 'Personal', icon: User, num: '01' },
    { id: 'summary', title: 'Summary', icon: FileText, num: '02' },
    { id: 'experience', title: 'Experience', icon: Briefcase, num: '03' },
    { id: 'projects', title: 'Projects', icon: Code, num: '04' },
    { id: 'skills', title: 'Skills', icon: Zap, num: '05' },
    { id: 'education', title: 'Education', icon: GraduationCap, num: '06' },
    { id: 'certificates', title: 'Certificates', icon: Award, num: '07' },
    { id: 'achievements', title: 'Achievements', icon: Trophy, num: '08' },
    { id: 'styling', title: 'Font & Layout', icon: Palette, num: '09' },
  ] as const;

  // Auto-save: writes to localStorage immediately, and syncs to the backend
  // (debounced) once the resume is loaded, creating it on the very first save.
  useEffect(() => {
    if (isLoadingResume) return; // don't autosave over data that's still loading
    setIsSaved(false);
    const timer = setTimeout(() => {
      const currentResume: ParsedResumeData = {
        title: docTitle,
        targetRole,
        personalInfo,
        experiences,
        education,
        skills,
        projects,
        certificates,
        achievements,
        resumeType,
        sectionsOrder: sections,
        customSections,
        templateName: selectedTemplate,
        resumeStyling,
      };
      try {
        localStorage.setItem('hireflow_current_resume', JSON.stringify(currentResume));
      } catch {
        // ignore
      }

      // Guests can build/edit/export resumes freely, but resume persistence
      // to the backend requires an account — skip the sync attempt for them
      // rather than showing a "Sync issue" error on every keystroke. Their
      // work is still safe locally via the write above.
      if (!isAuthenticated()) {
        setSaveError(null);
        setIsSaved(true);
        return;
      }

      (async () => {
        try {
          const payload = toBackendPayload({
            docTitle,
            targetRole,
            personalInfo,
            experiences,
            education,
            skills,
            projects,
            certificates,
            achievements,
            resumeType,
            sections,
            customSections,
            selectedTemplate,
            resumeStyling,
            atsScore: liveAtsScore,
          });

          if (resumeId) {
            await resumesApi.autosave(resumeId, payload);
          } else {
            const created: any = await resumesApi.create(payload);
            const newId = created._id || created.id;
            if (newId) {
              setResumeId(newId);
              setSearchParams({ id: newId }, { replace: true });
              await activity.log('RESUME_CREATED', newId, `Created resume: ${docTitle}`);
            }
          }
          setSaveError(null);
          setIsSaved(true);
        } catch (err) {
          setIsSaved(false);
          // Local copy is still safe in localStorage; surface the backend issue softly.
          setSaveError(
            err instanceof ApiRequestError
              ? err.message
              : 'Could not sync to the server — changes are saved locally.'
          );
        }
      })();
    }, 600);

    return () => clearTimeout(timer);
  }, [docTitle, targetRole, personalInfo, experiences, education, skills, projects, certificates, achievements, customSections, sections, resumeType, selectedTemplate, resumeStyling, liveAtsScore, isLoadingResume]);

  // ----------------------------------------------------
  // LIVE DETERMINISTIC ATS SCORE CALCULATION (~1s Debounce)
  // ----------------------------------------------------
  // Constructs an active resume snapshot respecting section visibility & order
  const buildActiveResumeSnapshot = React.useCallback((): ParsedResumeData => {
    const visibleSectionIds = new Set(
      sections.filter((s) => s.visible).map((s) => s.id)
    );

    return {
      id: resumeId || undefined,
      title: docTitle,
      targetRole: targetRole || personalInfo.jobTitle,
      templateName: selectedTemplate,
      resumeType,
      resumeStyling,
      personalInfo: visibleSectionIds.has('personal')
        ? personalInfo
        : {
            fullName: '',
            jobTitle: '',
            email: '',
            phone: '',
            location: '',
            summary: '',
          },
      experiences: visibleSectionIds.has('experience') ? experiences : [],
      education: visibleSectionIds.has('education') ? education : [],
      skills: visibleSectionIds.has('skills') ? (skills || '') : '',
      projects: visibleSectionIds.has('projects') ? projects : [],
      certificates: visibleSectionIds.has('certificates') ? certificates : [],
      achievements: visibleSectionIds.has('achievements') ? achievements : [],
      customSections: customSections.filter((c) => visibleSectionIds.has(c.id)),
      sectionsOrder: sections,
    };
  }, [
    resumeId,
    docTitle,
    targetRole,
    personalInfo,
    selectedTemplate,
    resumeType,
    resumeStyling,
    experiences,
    education,
    skills,
    projects,
    certificates,
    achievements,
    customSections,
    sections,
  ]);

  // Recalculate ATS score automatically whenever the user edits, adds, deletes, hides, or reorders any section
  useEffect(() => {
    if (isLoadingResume) return;

    setIsCalculatingAts(true);

    const timer = setTimeout(() => {
      try {
        const snapshot = buildActiveResumeSnapshot();
        const report = atsEngine.analyzeResume(snapshot, {
          jobDescription: jdText && jdText.trim().length >= 10 ? jdText : undefined,
        });

        // Clamp score (0 - 99): Never claim 100% ATS compatibility
        const clampedScore = Math.min(report.finalScore, 99);

        setAtsReport(report);
        setLiveAtsScore(clampedScore);
        setAtsLastUpdatedText('Updated just now');

        // Immediately update localStorage current resume with new canonical ATS score
        try {
          const stored = localStorage.getItem('hireflow_current_resume');
          if (stored) {
            const parsed = JSON.parse(stored);
            parsed.atsScore = clampedScore;
            parsed.meta = { ...(parsed.meta || {}), atsScore: clampedScore };
            localStorage.setItem('hireflow_current_resume', JSON.stringify(parsed));
          }
        } catch {}

        // If authenticated and resume exists, immediately persist to database
        if (resumeId && isAuthenticated()) {
          resumesApi.autosave(resumeId, {
            ats_score: clampedScore,
            atsScore: clampedScore,
          }).catch((err) => {
            console.warn('[ResumeEditor] Background ATS score sync notice:', err);
          });
        }
      } catch (err) {
        console.error('Error calculating live ATS score:', err);
      } finally {
        setIsCalculatingAts(false);
      }
    }, 800); // 800ms debounce

    return () => clearTimeout(timer);
  }, [buildActiveResumeSnapshot, jdText, isLoadingResume, resumeId]);

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Switches Fresher/Experienced resume type. Re-applies the type-appropriate
  // default section order, but — unlike a plain overwrite — preserves any
  // custom sections the user has already added and any titles they've
  // renamed, so switching type never silently deletes a user's own content.
  // This is also why the section list no longer differs between a brand-new
  // resume and one whose type has been toggled: both paths go through the
  // same getDefaultSectionItems() source of truth.
  const switchResumeType = (newType: ResumeType) => {
    setResumeType(newType);
    setSections((prev) => {
      const defaults = getDefaultSectionItems(newType);
      const defaultIds = new Set(defaults.map((s) => s.id));
      const preservedCustoms = prev.filter((s) => s.isCustom && !defaultIds.has(s.id));
      const merged = defaults.map((d) => {
        const existing = prev.find((s) => s.id === d.id);
        return existing ? { ...d, title: existing.title, visible: existing.visible } : d;
      });
      const stylingIdx = merged.findIndex((s) => s.id === 'styling');
      const insertAt = stylingIdx === -1 ? merged.length : stylingIdx;
      const result = [...merged.slice(0, insertAt), ...preservedCustoms, ...merged.slice(insertAt)];
      return result.map((item, idx) => ({ ...item, num: String(idx + 1).padStart(2, '0') }));
    });
    // Only seed the Fresher custom-section scaffolding (Tools & Technologies,
    // Courses, etc.) if the user hasn't already added their own — never
    // overwrite content that's already there.
    if (newType === 'fresher') {
      setCustomSections((prev) => (prev.length > 0 ? prev : getDefaultCustomSections('fresher')));
    }
    showToast(`Switched to ${newType === 'fresher' ? 'Fresher' : 'Experienced'} layout format!`);
  };

  // ----------------------------------------------------
  // SECTION NAVIGATOR HANDLERS
  // ----------------------------------------------------
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'personal': return User;
      case 'summary': return FileText;
      case 'experience': return Briefcase;
      case 'projects': return Code;
      case 'skills': return Zap;
      case 'education': return GraduationCap;
      case 'certificates': return Award;
      case 'achievements': return Trophy;
      case 'styling': return Palette;
      case 'custom': default: return Sparkles;
    }
  };

  const handleAddStandardSection = (type: string, label: string) => {
    const existingCount = sections.filter((s) => s.type === type).length;
    const newId = existingCount > 0 ? `${type}_${Date.now()}` : type;
    const title = existingCount > 0 ? `${label} (${existingCount + 1})` : label;

    const newSec: SectionNavItem = {
      id: newId,
      title,
      type: type as any,
      visible: true,
    };

    setSections((prev) => [...prev, newSec]);
    setActiveSection(newId);
    setIsAddSectionModalOpen(false);
    showToast(`Added "${title}" section!`);
  };

  const handleCreateCustomSection = () => {
    if (!newCustomSectionTitle.trim()) return;
    const title = newCustomSectionTitle.trim();
    const newId = `custom_${Date.now()}`;

    const newSec: SectionNavItem = {
      id: newId,
      title,
      type: 'custom',
      visible: true,
      isCustom: true,
    };

    const newCustomData: CustomSectionData = {
      id: newId,
      title,
      items: [
        {
          id: `citem_${Date.now()}`,
          title: `${title} Detail`,
          subtitle: 'Key Highlight',
          date: '2024',
          bullets: ['Enter item achievements or relevant details here.'],
        },
      ],
    };

    setCustomSections((prev) => [...prev, newCustomData]);
    setSections((prev) => [...prev, newSec]);
    setActiveSection(newId);
    setNewCustomSectionTitle('');
    setIsAddSectionModalOpen(false);
    showToast(`Created custom section "${title}"!`);
  };

  const handleDeleteSection = (secId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const target = sections.find((s) => s.id === secId);
    if (!target) return;

    setSections((prev) => {
      const next = prev.filter((s) => s.id !== secId);
      if (activeSection === secId && next.length > 0) {
        setActiveSection(next[0].id);
      }
      return next;
    });

    showToast(`Deleted "${target.title}" section`);
  };

  const handleDuplicateSection = (secId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const idx = sections.findIndex((s) => s.id === secId);
    if (idx === -1) return;

    const target = sections[idx];
    const newId = `${target.id}_dup_${Date.now()}`;
    const newTitle = `${target.title} (Copy)`;

    if (target.type === 'custom') {
      const origCustom = customSections.find((c) => c.id === target.id);
      const clonedCustom: CustomSectionData = {
        id: newId,
        title: newTitle,
        items: origCustom
          ? origCustom.items.map((it) => ({
              ...it,
              id: `citem_${Math.random().toString(36).substr(2, 9)}`,
              bullets: [...(it.bullets || [])],
            }))
          : [],
      };
      setCustomSections((prev) => [...prev, clonedCustom]);
    }

    const dupSec: SectionNavItem = {
      ...target,
      id: newId,
      title: newTitle,
      visible: true,
    };

    const nextSections = [...sections];
    nextSections.splice(idx + 1, 0, dupSec);
    setSections(nextSections);
    setActiveSection(newId);
    showToast(`Duplicated "${target.title}" section!`);
  };

  const handleToggleVisibility = (secId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSections((prev) =>
      prev.map((s) => {
        if (s.id === secId) {
          const nextVis = !s.visible;
          showToast(nextVis ? `Showing "${s.title}" section` : `Hid "${s.title}" section`);
          return { ...s, visible: nextVis };
        }
        return s;
      })
    );
  };

  const handleMoveSection = (index: number, direction: 'up' | 'down', e?: React.MouseEvent) => {
    e?.stopPropagation();
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const next = [...sections];
    const [removed] = next.splice(index, 1);
    next.splice(targetIndex, 0, removed);
    setSections(next);
  };

  const handleReorderSections = (fromIndex: number, toIndex: number) => {
    if (fromIndex < 0 || fromIndex >= sections.length || toIndex < 0 || toIndex >= sections.length) return;
    const next = [...sections];
    const [removed] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, removed);
    setSections(next);
  };

  const handleUpdateCustomSectionTitle = (secId: string, newTitle: string) => {
    setCustomSections((prev) =>
      prev.map((c) => (c.id === secId ? { ...c, title: newTitle } : c))
    );
    setSections((prev) =>
      prev.map((s) => (s.id === secId ? { ...s, title: newTitle } : s))
    );
  };

  const handleAddCustomItem = (secId: string) => {
    const newItem: CustomSectionItem = {
      id: `citem_${Date.now()}`,
      title: 'New Item',
      subtitle: '',
      date: '2024',
      bullets: ['Enter details or highlight point'],
    };
    setCustomSections((prev) =>
      prev.map((c) => (c.id === secId ? { ...c, items: [...c.items, newItem] } : c))
    );
  };

  const handleDeleteCustomItem = (secId: string, itemId: string) => {
    setCustomSections((prev) =>
      prev.map((c) =>
        c.id === secId ? { ...c, items: c.items.filter((it) => it.id !== itemId) } : c
      )
    );
  };

  const handleUpdateCustomItem = (
    secId: string,
    itemId: string,
    field: keyof CustomSectionItem,
    value: any
  ) => {
    setCustomSections((prev) =>
      prev.map((c) =>
        c.id === secId
          ? {
              ...c,
              items: c.items.map((it) => (it.id === itemId ? { ...it, [field]: value } : it)),
            }
          : c
      )
    );
  };

  // Helper Section Select & Smooth Scroll
  const handleSelectSection = (secId: string) => {
    setActiveSection(secId);
    if (documentSheetRef.current) {
      const el = document.getElementById(`doc-sec-${secId}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Helper AI Green Flash
  const triggerAiGreenHighlight = (secId: string) => {
    setAiHighlightedSection(secId);
    setTimeout(() => {
      setAiHighlightedSection(null);
    }, 3000);
  };

  // Real AI calls via Supabase Edge Functions (Gemini-powered, falls back gracefully if no API key set)
  const currentResumeDataSnapshot = () =>
    toBackendPayload({
      docTitle,
      targetRole,
      personalInfo,
      experiences,
      education,
      skills,
      projects,
      certificates,
      achievements,
      resumeType,
    }).resumeData;

  /**
   * Refines the job title using the SAME text the user already entered —
   * asks the AI to tighten/ATS-optimize the wording of their own current
   * title. Never fabricates an unrelated title: if the AI service can't
   * return a grounded rewrite, this fails honestly with a toast instead
   * of falling back to a hardcoded title.
   */
  const handleRefineJobTitleWithAI = async () => {
    if (isAiWorking || !personalInfo.jobTitle.trim()) return;
    setIsAiWorking(true);
    try {
      const result: any = await aiApi.suggest({
        resumeData: currentResumeDataSnapshot(),
        section: 'jobTitle',
        promptDetails: `Rewrite ONLY this exact job title to be more ATS-friendly, keeping the same role/seniority — do not invent a different role: "${personalInfo.jobTitle}"`,
      });
      const refined = result?.improvedJobTitle || result?.refinedTitle || result?.suggestedTitle;
      if (refined && typeof refined === 'string') {
        setPersonalInfo((prev) => ({ ...prev, jobTitle: refined.trim() }));
        triggerAiGreenHighlight('personal');
        showToast('Job title refined by AI based on your current title.');
      } else {
        showToast('AI could not generate a refined title right now — please try again.');
      }
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : 'Could not reach the AI service.'
      );
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleAiImproveSummary = async () => {
    if (isAiWorking || !personalInfo.summary.trim()) return;
    setIsAiWorking(true);
    try {
      const snapshot = currentResumeDataSnapshot();
      const result: any = await aiApi.suggest({
        resumeData: snapshot,
        section: 'summary',
        promptDetails:
          'Optimize existing summary for ATS-friendly structure and keywords, while preserving all factual information. Never invent skills, experience, achievements, or numbers.',
      });
      const improved =
        result?.enhancedSummary ||
        result?.suggested ||
        improveSummaryAts(personalInfo.summary, targetRole || personalInfo.jobTitle);
      if (improved && improved.trim() !== personalInfo.summary.trim()) {
        setSummaryPreviewDiff({
          original: personalInfo.summary,
          suggested: improved.trim(),
          type: 'AI Improve',
        });
      } else {
        showToast('Summary is already optimal!');
      }
    } catch (err) {
      const fallback = improveSummaryAts(personalInfo.summary, targetRole || personalInfo.jobTitle);
      if (fallback && fallback.trim() !== personalInfo.summary.trim()) {
        setSummaryPreviewDiff({
          original: personalInfo.summary,
          suggested: fallback.trim(),
          type: 'AI Improve',
        });
      } else {
        showToast(err instanceof ApiRequestError ? err.message : 'Could not optimize summary right now.');
      }
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleFixSummaryGrammar = async () => {
    if (isAiWorking || !personalInfo.summary.trim()) return;
    setIsAiWorking(true);
    try {
      const snapshot = currentResumeDataSnapshot();
      const result: any = await aiApi.suggest({
        resumeData: snapshot,
        section: 'summary',
        promptDetails:
          'Correct ONLY grammar, spelling, punctuation, and sentence clarity in this exact summary. Do NOT add any new facts, metrics, or numbers.',
      });
      const fixed = result?.enhancedSummary || result?.suggested || fixSummaryGrammar(personalInfo.summary);
      if (fixed && fixed.trim() !== personalInfo.summary.trim()) {
        setSummaryPreviewDiff({
          original: personalInfo.summary,
          suggested: fixed.trim(),
          type: 'Fix Grammar',
        });
      } else {
        showToast('No grammar or spelling issues detected in summary.');
      }
    } catch (err) {
      const fallback = fixSummaryGrammar(personalInfo.summary);
      if (fallback && fallback.trim() !== personalInfo.summary.trim()) {
        setSummaryPreviewDiff({
          original: personalInfo.summary,
          suggested: fallback.trim(),
          type: 'Fix Grammar',
        });
      } else {
        showToast('No grammar or spelling issues detected in summary.');
      }
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleAddMetricsWithAI = async () => {
    if (isAiWorking || !personalInfo.summary.trim()) return;

    const snapshot = currentResumeDataSnapshot();
    const existingMetrics = extractResumeMetrics(snapshot);

    if (existingMetrics.length === 0) {
      showToast('No existing metrics or numbers found in your resume to include.');
      return;
    }

    setIsAiWorking(true);
    try {
      const result: any = await aiApi.suggest({
        resumeData: snapshot,
        section: 'summary',
        promptDetails: `Integrate ONLY these exact metrics/numbers already present in the resume into the summary text: ${existingMetrics.join(
          ', '
        )}. Do NOT invent any new numbers or facts.`,
      });
      const updated =
        result?.enhancedSummary ||
        result?.suggested ||
        `${personalInfo.summary.replace(/[.!?]$/, '')} with tracked impact across ${existingMetrics.join(', ')}.`;
      if (updated && updated.trim() !== personalInfo.summary.trim()) {
        setSummaryPreviewDiff({
          original: personalInfo.summary,
          suggested: updated.trim(),
          type: 'Add Metrics',
        });
      } else {
        showToast('Summary already incorporates available metrics.');
      }
    } catch (err) {
      showToast(err instanceof ApiRequestError ? err.message : 'Could not analyze metrics right now.');
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleEnhanceExperienceWithAI = async () => {
    if (isAiWorking) return;
    if (experiences.length === 0) {
      showToast('Add a work experience entry first.');
      return;
    }
    setIsAiWorking(true);
    try {
      const result: any = await aiApi.suggest({
        resumeData: currentResumeDataSnapshot(),
        section: 'experience',
        promptDetails:
          'Rewrite the bullet points for the most recent role with quantified, STAR-style impact statements.',
      });
      const suggestions: string[] = result?.suggestions || [];
      if (suggestions.length > 0) {
        const updated = [...experiences];
        updated[0] = {
          ...updated[0],
          bullets: suggestions.slice(0, Math.max(updated[0].bullets.length, suggestions.length)),
        };
        setExperiences(updated);
        handleSelectSection('experience');
        triggerAiGreenHighlight('experience');
        showToast('Experience bullets rewritten by AI based on your resume.');
      } else {
        showToast('AI did not return suggestions — please try again.');
      }
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : 'Could not reach the AI service.'
      );
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleImproveProjectBulletsWithAI = async () => {
    if (isAiWorking) return;
    if (projects.length === 0) {
      showToast('Add a project first.');
      return;
    }
    setIsAiWorking(true);
    try {
      const result: any = await aiApi.suggest({
        resumeData: currentResumeDataSnapshot(),
        section: 'projects',
        promptDetails: 'Rewrite the bullet points for the first project with concrete, impactful detail.',
      });
      const suggestions: string[] = result?.suggestions || [];
      if (suggestions.length > 0) {
        const updated = [...projects];
        updated[0] = {
          ...updated[0],
          bullets: suggestions.slice(0, Math.max(updated[0].bullets.length, suggestions.length)),
        };
        setProjects(updated);
        triggerAiGreenHighlight('projects');
        showToast('Project bullets rewritten by AI based on your resume.');
      } else {
        showToast('AI did not return suggestions — please try again.');
      }
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : 'Could not reach the AI service.'
      );
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleGenerateProjectDescriptionWithAI = async () => {
    if (isAiWorking) return;
    if (projects.length === 0) {
      showToast('Add a project first.');
      return;
    }
    setIsAiWorking(true);
    try {
      const result: any = await aiApi.suggest({
        resumeData: currentResumeDataSnapshot(),
        section: 'projects',
        promptDetails: 'Write a concise, punchy one-sentence description for the first project.',
      });
      const description = result?.enhancedSummary || result?.suggestions?.[0];
      if (description) {
        const updated = [...projects];
        updated[0] = { ...updated[0], description };
        setProjects(updated);
        triggerAiGreenHighlight('projects');
        showToast('Generated a project description with AI.');
      } else {
        showToast('AI did not return a description — please try again.');
      }
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : 'Could not reach the AI service.'
      );
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleSuggestSkillsWithAI = async () => {
    if (isAiWorking) return;
    setIsAiWorking(true);
    try {
      const result: any = await aiApi.suggest({
        resumeData: currentResumeDataSnapshot(),
        section: 'skills',
        promptDetails:
          'Recommend in-demand technical skills/keywords missing from this resume, relevant to the candidate\'s experience.',
      });
      const recommended: string[] = result?.recommendedSkills || [];
      const current = skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
      const missing = recommended.filter((s) => !current.includes(s.toLowerCase()));
      if (missing.length > 0) {
        setSkills((prev) => (prev ? `${prev}, ${missing.join(', ')}` : missing.join(', ')));
        triggerAiGreenHighlight('skills');
        showToast(`AI added missing keywords: ${missing.join(', ')}`);
      } else if (recommended.length > 0) {
        showToast('Your skills already cover the AI-recommended keywords.');
      } else {
        showToast('AI did not return suggestions — please try again.');
      }
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : 'Could not reach the AI service.'
      );
    } finally {
      setIsAiWorking(false);
    }
  };

  const handleApplyAllAIReal = async () => {
    if (isAiWorking) return;
    setIsAiWorking(true);
    // Capture the real pre-AI values so the "Original vs AI Optimized"
    // comparison modal shows this candidate's actual before/after text,
    // never a hardcoded sample.
    setPreAiSnapshot({ summary: personalInfo.summary, skills });
    try {
      const snapshot = currentResumeDataSnapshot();
      const [summaryResult, expResult, skillsResult]: any[] = await Promise.all([
        aiApi.suggest({ resumeData: snapshot, section: 'summary' }),
        experiences.length > 0
          ? aiApi.suggest({ resumeData: snapshot, section: 'experience' })
          : Promise.resolve(null),
        aiApi.suggest({ resumeData: snapshot, section: 'skills' }),
      ]);

      const applied: string[] = [];

      if (summaryResult?.enhancedSummary) {
        setPersonalInfo((prev) => ({ ...prev, summary: summaryResult.enhancedSummary }));
        applied.push('summary');
      }

      if (expResult?.suggestions?.length > 0 && experiences.length > 0) {
        const updated = [...experiences];
        updated[0] = {
          ...updated[0],
          bullets: expResult.suggestions.slice(
            0,
            Math.max(updated[0].bullets.length, expResult.suggestions.length)
          ),
        };
        setExperiences(updated);
        applied.push('experience');
      }

      if (skillsResult?.recommendedSkills?.length > 0) {
        const current = skills.split(',').map((s) => s.trim().toLowerCase()).filter(Boolean);
        const missing = skillsResult.recommendedSkills.filter(
          (s: string) => !current.includes(s.toLowerCase())
        );
        if (missing.length > 0) {
          setSkills((prev) => (prev ? `${prev}, ${missing.join(', ')}` : missing.join(', ')));
          applied.push('skills');
        }
      }

      triggerAiGreenHighlight('summary');
      showToast(
        applied.length > 0
          ? `AI updated: ${applied.join(', ')}.`
          : 'AI ran, but had no new suggestions for your resume.'
      );
    } catch (err) {
      showToast(
        err instanceof ApiRequestError ? err.message : 'Could not reach the AI service.'
      );
    } finally {
      setIsAiWorking(false);
    }
  };

  // Apply All AI Fixes
  // handleApplyAllAI: see handleApplyAllAIReal below (defined after the AI handlers), which
  // replaces this — the old version below just injected fixed hardcoded strings.


  // ─── Export: PDF via Isolated Print Iframe (Professional Executive Layout) 
  const triggerPrintExport = () => {
    const sheet = documentSheetRef.current;
    if (!sheet) {
      showToast('Resume preview not ready — please try again.');
      return;
    }

    const oldIframe = document.getElementById('hireflow-print-iframe');
    if (oldIframe) oldIframe.remove();

    const iframe = document.createElement('iframe');
    iframe.id = 'hireflow-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const iframeDoc = iframe.contentWindow?.document;
    if (!iframeDoc) return;

    // Clone sheet DOM node and strip active editor selection ring highlights + hover styles
    const clone = sheet.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('*').forEach((node) => {
      const el = node as HTMLElement;
      if (el.className && typeof el.className === 'string') {
        el.className = el.className
          .replace(/ring-2\s+ring-[^\s]+/g, '')
          .replace(/bg-blue-50\/20/g, '')
          .replace(/bg-emerald-50\/30/g, '')
          .replace(/hover:bg-[^\s]+/g, '')
          .trim();
      }
      // Clean duplicate literal bullet symbols (●, •) only if standalone at start
      if (el.children.length === 0 && el.textContent) {
        el.textContent = el.textContent.replace(/^[●•]\s*/u, '').trim();
      }
    });

    const cleanHtml = clone.innerHTML;

    const stylesHtml = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'))
      .map((node) => node.outerHTML)
      .join('\n');

    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${docTitle || 'Resume'}</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 0;
            }
            html, body {
              margin: 0 !important;
              padding: 0 !important;
              background: #ffffff !important;
              width: 100% !important;
              font-family: Inter, system-ui, -apple-system, sans-serif !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-wrapper {
              width: 100% !important;
              max-width: 210mm !important;
              margin: 0 auto !important;
              padding: 10mm 12mm !important;
              box-sizing: border-box !important;
              zoom: 0.95 !important;
              background: #ffffff !important;
              color: #000000 !important;
            }
            .print-wrapper *, .print-wrapper *::before, .print-wrapper *::after {
              box-sizing: border-box !important;
              outline: none !important;
              box-shadow: none !important;
              --tw-ring-shadow: none !important;
              --tw-ring-color: transparent !important;
              --tw-shadow: none !important;
              --tw-ring-offset-shadow: none !important;
            }
            /* Two-column grid preservation in print engine */
            .print-wrapper .grid {
              display: grid !important;
            }
            .print-wrapper .grid-cols-12 {
              display: grid !important;
              grid-template-columns: repeat(12, minmax(0, 1fr)) !important;
              gap: 1.25rem !important;
            }
            .print-wrapper .col-span-5 {
              grid-column: span 5 / span 5 !important;
              border-right: 1px solid #cbd5e1 !important;
              padding-right: 1rem !important;
            }
            .print-wrapper .col-span-7 {
              grid-column: span 7 / span 7 !important;
              padding-left: 0.5rem !important;
            }
            .print-wrapper .flex {
              display: flex !important;
            }
            .print-wrapper .flex-row {
              flex-direction: row !important;
            }
            .print-wrapper .justify-between {
              justify-content: space-between !important;
            }
            .print-wrapper .w-\[68\%\] {
              width: 68% !important;
            }
            .print-wrapper .w-\[32\%\] {
              width: 32% !important;
            }
            .print-wrapper .rounded-full {
              border-radius: 9999px !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Executive Compact Formatting Rules */
            .print-wrapper [id^="doc-sec-"] {
              margin-bottom: 12px !important;
              padding-bottom: 4px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
            }
            .print-wrapper h1 {
              font-size: 22px !important;
              line-height: 1.2 !important;
              margin-bottom: 2px !important;
            }
            .print-wrapper h2 {
              font-size: 11px !important;
              letter-spacing: 0.05em !important;
              margin-bottom: 4px !important;
            }
            .print-wrapper p, .print-wrapper li, .print-wrapper span {
              font-size: 10.5px !important;
              line-height: 1.4 !important;
            }
            .print-wrapper ul {
              margin-top: 3px !important;
              margin-bottom: 3px !important;
              padding-left: 14px !important;
              list-style-type: disc !important;
            }
            .print-wrapper li {
              margin-bottom: 2px !important;
              page-break-inside: avoid !important;
              break-inside: avoid !important;
              list-style-type: disc !important;
            }
            .print-wrapper li::marker {
              font-size: 7px !important;
              color: #475569 !important;
            }
          </style>
        </head>
        <body style="background: #ffffff;">
          <div class="print-wrapper">
            ${cleanHtml}
          </div>
        </body>
      </html>
    `);
    iframeDoc.close();

    setTimeout(() => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      setTimeout(() => iframe.remove(), 1000);
    }, 250);
  };

  const handleExportPDF = () => {
    if (gateExport('pdf')) return;
    showToast(`Preparing "${docTitle}" for print…`);
    activity.log('RESUME_EXPORTED_PDF', resumeId, `Exported PDF for "${docTitle}"`);
    // Small delay so the toast renders before the print dialog blocks the UI.
    setTimeout(triggerPrintExport, 200);
  };

  // ─── Export: DOCX via Native Microsoft Word Binary Generator (.docx) ───────────────
  const triggerDocxExport = async () => {
    // Single Source of Truth: construct active resume data
    const activeData: ParsedResumeData = {
      title: docTitle,
      targetRole: targetRole || personalInfo.jobTitle,
      templateName: selectedTemplate,
      resumeType,
      sectionsOrder: sections,
      personalInfo,
      experiences,
      education,
      skills,
      projects,
      certificates,
      achievements,
    };

    try {
      showToast('Generating DOCX document…');
      const filename = await downloadDocxExport(activeData, selectedTemplate);
      showToast(`Exported "${filename}" successfully — valid Microsoft Word document.`);
      activity.log('RESUME_EXPORTED_DOCX', resumeId, `Exported DOCX for "${docTitle}"`);
    } catch (err) {
      console.error('DOCX export error:', err);
      showToast('DOCX generation failed. Please try again.');
    }
  };

  const handleExportDOCX = () => {
    if (gateExport('docx')) return;
    triggerDocxExport();
  };

  // GitHub import handlers
  const handleImportSkillsFromGithub = (newSkillsString: string) => {
    setSkills(newSkillsString);
    triggerAiGreenHighlight('skills');
    showToast('Skills updated from GitHub repository!');
  };

  const handleImportProjectsFromGithub = (newProjects: ProjectItem[]) => {
    setProjects((prev) => [...newProjects, ...prev]);
    triggerAiGreenHighlight('projects');
    showToast(`Imported ${newProjects.length} projects from GitHub!`);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#0B192C] font-sans selection:bg-[#0B192C] selection:text-white pb-20">
      {/* ------------------------------------------------------------------ */}
      {/* 1. TOP HEADER ACTION BAR (ONE CLEAN ROW)                            */}
      {/* ------------------------------------------------------------------ */}
      <header className="bg-white border-b border-slate-200/90 px-4 sm:px-6 py-2.5 sticky top-0 z-40 transition-all shadow-2xs">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between gap-3 flex-wrap">
          {/* Left: Document Name, Template & Badges */}
          <div className="flex items-center gap-3 flex-wrap flex-1 min-w-[280px]">
            <button
              onClick={() => navigate('/app/dashboard')}
              className="p-1.5 text-slate-500 hover:text-[#0B192C] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Back to Dashboard"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Resume Title */}
            <div className="flex items-center gap-2">
              {isEditingTitle ? (
                <input
                  type="text"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  onBlur={() => setIsEditingTitle(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingTitle(false)}
                  autoFocus
                  className="font-bold text-sm sm:text-base text-[#0B192C] bg-slate-50 border border-blue-500 rounded px-2 py-0.5 focus:outline-none"
                />
              ) : (
                <div
                  onClick={() => setIsEditingTitle(true)}
                  className="group flex items-center gap-1.5 cursor-pointer"
                >
                  <h1 className="font-bold text-sm sm:text-base text-[#0B192C] group-hover:text-blue-600 transition-colors">
                    {docTitle}
                  </h1>
                  <Edit3 size={13} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                </div>
              )}
            </div>

            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block" />

            {/* Template Selector */}
            <select
              value={selectedTemplate}
              onChange={(e) => {
                const name = e.target.value;
                setSelectedTemplate(name);
                const tmpl = templatesConfigService.getTemplateById(name);
                if (tmpl) {
                  setResumeStyling(templatesConfigService.toResumeStyling(tmpl));
                  showToast(`Applied "${tmpl.name}" ATS template layout!`);
                }
              }}
              className="bg-slate-50 border border-slate-200 text-[#0B192C] font-bold text-xs rounded-md px-2.5 py-1 focus:outline-none cursor-pointer hover:bg-slate-100"
            >
              {templatesConfigService.getAllTemplates().map((t) => (
                <option key={t.id} value={t.name}>
                  {t.name} ({t.category})
                </option>
              ))}
            </select>

            <div className="h-4 w-[1px] bg-slate-200 hidden md:block" />

            {/* Status Pills */}
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1.5 text-slate-500 font-medium" title={saveError || undefined}>
                <span className={`w-2 h-2 rounded-full ${saveError ? 'bg-red-500' : isSaved ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                <span>{saveError ? 'Sync issue' : isSaved ? 'Auto Saved' : 'Saving...'}</span>
              </span>

              {liveAtsScore !== null && (
                <button
                  onClick={() => setIsAtsPanelExpanded(true)}
                  className={`px-2 py-0.5 border font-mono text-[11px] font-bold rounded-md flex items-center gap-1 cursor-pointer transition-all ${
                    isCalculatingAts
                      ? 'bg-amber-50 text-amber-800 border-amber-200 animate-pulse'
                      : liveAtsScore >= 80
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                      : liveAtsScore >= 60
                      ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                      : liveAtsScore >= 40
                      ? 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                      : 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                  }`}
                  title="Live ATS Score — Click to expand ATS Analysis panel"
                >
                  <span>{isCalculatingAts ? 'Updating ATS score...' : `ATS: ${liveAtsScore}/100`}</span>
                </button>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">

            <button
              onClick={handleExportPDF}
              className="bg-[#0B192C] hover:bg-slate-800 text-white px-3.5 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 shadow-2xs cursor-pointer transition-colors"
            >
              <Download size={14} />
              <span>Export PDF</span>
            </button>

            <button
              onClick={handleExportDOCX}
              className="bg-white hover:bg-slate-50 text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors hidden sm:flex"
            >
              <FileText size={14} className="text-blue-600" />
              <span>DOCX</span>
            </button>
          </div>
        </div>
      </header>



      {/* Toast Notification Banner */}
      {toastMsg && (
        <div className="max-w-[1600px] mx-auto px-4 mt-3">
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between gap-3 text-xs text-blue-950 font-medium shadow-2xs animate-in slide-in-from-top duration-200">
            <div className="flex items-center gap-2.5">
              <Sparkles size={16} className="text-blue-600 shrink-0" />
              <span>{toastMsg}</span>
            </div>
            <button
              onClick={() => setToastMsg(null)}
              className="text-xs text-blue-700 hover:text-blue-950 font-bold underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. MAIN TWO-COLUMN WORKSPACE (LEFT 40% | RIGHT 60%)                 */}
      {/* ------------------------------------------------------------------ */}
      <main className="max-w-[1600px] mx-auto px-4 py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================================================================ */}
          {/* LEFT COLUMN (40% -> lg:col-span-5): CONTENT EDITOR & ATS ANALYSIS */}
          {/* ================================================================ */}
          <div className="lg:col-span-5 space-y-4">
            
            {/* DYNAMIC UPGRADED SECTION NAVIGATOR */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-3 shadow-2xs space-y-2">
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                    SECTION NAVIGATOR
                  </span>
                  <span className="bg-blue-50 text-blue-700 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full">
                    {sections.length} sections
                  </span>
                </div>
                <button
                  onClick={() => setIsAddSectionModalOpen(true)}
                  className="inline-flex items-center gap-1 bg-[#0B192C] hover:bg-slate-800 text-white text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer shadow-xs"
                  title="Add standard or custom section"
                >
                  <Plus size={13} />
                  <span>Add Section</span>
                </button>
              </div>

              {/* Reorderable Section Items List */}
              <div className="space-y-1.5 max-h-[340px] overflow-y-auto pr-1 custom-scrollbar">
                {sections.map((item, idx) => {
                  const IconComp = getSectionIcon(item.type);
                  const isSelected = activeSection === item.id;
                  const isHidden = !item.visible;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.setData('text/plain', String(idx));
                        setDraggedIndex(idx);
                      }}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.preventDefault();
                        const fromIdx = Number(e.dataTransfer.getData('text/plain'));
                        if (!isNaN(fromIdx)) {
                          handleReorderSections(fromIdx, idx);
                        }
                        setDraggedIndex(null);
                      }}
                      onClick={() => handleSelectSection(item.id)}
                      className={`group flex items-center justify-between p-2 rounded-xl text-xs transition-all cursor-pointer border ${
                        isSelected
                          ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-xs'
                          : isHidden
                          ? 'bg-slate-50/70 text-slate-400 border-dashed border-slate-200 hover:bg-slate-100/80'
                          : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      {/* Left: Drag Handle, Icon & Title */}
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className={`cursor-grab active:cursor-grabbing p-0.5 rounded opacity-40 group-hover:opacity-100 transition-opacity ${
                            isSelected ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-200 text-slate-500'
                          }`}
                          title="Drag to reorder section"
                        >
                          <GripVertical size={14} />
                        </span>
                        <IconComp
                          size={15}
                          className={`shrink-0 ${
                            isSelected ? 'text-blue-300' : isHidden ? 'text-slate-400' : 'text-slate-600'
                          }`}
                        />
                        <span className={`font-bold truncate ${isHidden ? 'opacity-60' : ''}`}>
                          {item.title}
                        </span>
                        {isHidden && (
                          <span className="text-[9px] font-mono uppercase bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold shrink-0">
                            Hidden
                          </span>
                        )}

                      </div>

                      {/* Right Action Icons: Move Up/Down, Hide/Show, Duplicate, Delete */}
                      <div className="flex items-center gap-1 shrink-0 ml-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={(e) => handleMoveSection(idx, 'up', e)}
                          disabled={idx === 0}
                          className={`p-1 rounded transition-colors ${
                            idx === 0
                              ? 'opacity-20 cursor-not-allowed'
                              : isSelected
                              ? 'hover:bg-slate-700 text-slate-200'
                              : 'hover:bg-slate-200 text-slate-600'
                          }`}
                          title="Move section up"
                        >
                          <ChevronUp size={13} />
                        </button>

                        <button
                          onClick={(e) => handleMoveSection(idx, 'down', e)}
                          disabled={idx === sections.length - 1}
                          className={`p-1 rounded transition-colors ${
                            idx === sections.length - 1
                              ? 'opacity-20 cursor-not-allowed'
                              : isSelected
                              ? 'hover:bg-slate-700 text-slate-200'
                              : 'hover:bg-slate-200 text-slate-600'
                          }`}
                          title="Move section down"
                        >
                          <ChevronDown size={13} />
                        </button>



                        <button
                          onClick={(e) => handleDuplicateSection(item.id, e)}
                          className={`p-1 rounded transition-colors ${
                            isSelected
                              ? 'hover:bg-slate-700 text-slate-200'
                              : 'hover:bg-slate-200 text-slate-600'
                          }`}
                          title="Duplicate section"
                        >
                          <Copy size={13} />
                        </button>

                        <button
                          onClick={(e) => handleDeleteSection(item.id, e)}
                          className={`p-1 rounded transition-colors ${
                            isSelected
                              ? 'hover:bg-red-900/80 text-red-300'
                              : 'hover:bg-red-50 text-red-600'
                          }`}
                          title="Delete section"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ACTIVE SECTION CONTENT EDITOR FORM */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600">
                    {sectionNavItems.find((s) => s.id === activeSection)?.num}
                  </span>
                  <h2 className="font-bold text-sm text-[#0B192C]">
                    Edit {sectionNavItems.find((s) => s.id === activeSection)?.title}
                  </h2>
                </div>
                <span className="text-[10px] font-mono font-medium text-slate-400">
                  Live Preview Sync
                </span>
              </div>

              {/* SECTION FORMS WITH INTEGRATED INLINE AI BUTTONS */}
              {activeSection === 'personal' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Resume Type
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => switchResumeType('fresher')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          resumeType === 'fresher'
                            ? 'bg-[#0B192C] border-[#0B192C] text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Fresher
                      </button>
                      <button
                        type="button"
                        onClick={() => switchResumeType('experienced')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors cursor-pointer ${
                          resumeType === 'experienced'
                            ? 'bg-[#0B192C] border-[#0B192C] text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Experienced Professional
                      </button>
                    </div>
                    {resumeType === 'fresher' && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                          Fresher Layout Arrangement
                        </label>
                        <div className="flex gap-1.5 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setFresherLayoutMode('auto');
                              showToast('Auto mode: switches to 1-column for large resumes!');
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium border cursor-pointer ${
                              fresherLayoutMode === 'auto'
                                ? 'bg-blue-600 border-blue-600 text-white font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Auto (Smart)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFresherLayoutMode('1-column');
                              showToast('Full-width stacked layout selected!');
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium border cursor-pointer ${
                              fresherLayoutMode === '1-column'
                                ? 'bg-blue-600 border-blue-600 text-white font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            1-Column Stacked (Large Resume)
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setFresherLayoutMode('2-column');
                              showToast('2-column side-by-side layout selected!');
                            }}
                            className={`px-2.5 py-1 rounded text-[11px] font-medium border cursor-pointer ${
                              fresherLayoutMode === '2-column'
                                ? 'bg-blue-600 border-blue-600 text-white font-bold'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            2-Column Side-by-Side
                          </button>
                        </div>
                      </div>
                    )}
                    <p className="text-[10px] text-slate-400 mt-1">
                      {resumeType === 'fresher'
                        ? 'Best for students and candidates with limited professional experience.'
                        : 'Best for candidates with professional work experience.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={personalInfo.fullName}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, fullName: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Target Job Title
                      </label>
                      <input
                        type="text"
                        value={personalInfo.jobTitle}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, jobTitle: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={personalInfo.email}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, email: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-[#0B192C] focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Location / Phone
                      </label>
                      <input
                        type="text"
                        value={personalInfo.location}
                        onChange={(e) => setPersonalInfo({ ...personalInfo, location: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-[#0B192C] focus:bg-white focus:border-blue-600 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-1 sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Linkedin size={11} className="text-blue-600" />
                          LinkedIn Profile
                        </label>
                        <input
                          type="text"
                          value={personalInfo.linkedin || ''}
                          onChange={(e) => handleLinkedinChange(e.target.value)}
                          placeholder="linkedin.com/in/username"
                          className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-[#0B192C] focus:bg-white focus:outline-none transition-colors ${
                            urlErrors.linkedin
                              ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                              : 'border-slate-200 focus:border-blue-600'
                          }`}
                        />
                        {urlErrors.linkedin && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-start gap-1 font-medium">
                            <AlertCircle size={11} className="shrink-0 mt-0.5" />
                            <span>{urlErrors.linkedin}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Github size={11} className="text-slate-700" />
                          GitHub Profile
                        </label>
                        <input
                          type="text"
                          value={personalInfo.github || ''}
                          onChange={(e) => handleGithubChange(e.target.value)}
                          placeholder="github.com/username"
                          className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-[#0B192C] focus:bg-white focus:outline-none transition-colors ${
                            urlErrors.github
                              ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                              : 'border-slate-200 focus:border-blue-600'
                          }`}
                        />
                        {urlErrors.github && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-start gap-1 font-medium">
                            <AlertCircle size={11} className="shrink-0 mt-0.5" />
                            <span>{urlErrors.github}</span>
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                          <Globe size={11} className="text-emerald-600" />
                          Portfolio Website
                        </label>
                        <input
                          type="text"
                          value={personalInfo.website || ''}
                          onChange={(e) => handleWebsiteChange(e.target.value)}
                          placeholder="myportfolio.dev"
                          className={`w-full bg-slate-50 border rounded-lg px-3 py-2 text-xs text-[#0B192C] focus:bg-white focus:outline-none transition-colors ${
                            urlErrors.website
                              ? 'border-red-400 focus:border-red-500 ring-1 ring-red-400/20'
                              : 'border-slate-200 focus:border-blue-600'
                          }`}
                        />
                        {urlErrors.website && (
                          <p className="text-[10px] text-red-500 mt-1 flex items-start gap-1 font-medium">
                            <AlertCircle size={11} className="shrink-0 mt-0.5" />
                            <span>{urlErrors.website}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Auto-fill from Profile — only shown to logged-in users with real profile data */}
                  {currentUser && (
                    <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          const targetWeb = currentUser.website || personalInfo.website;
                          const targetGit = currentUser.github || personalInfo.github;
                          const targetLin = currentUser.linkedin || personalInfo.linkedin;
                          setPersonalInfo((prev) => ({
                            ...prev,
                            fullName: currentUser.full_name || currentUser.name || prev.fullName,
                            email: currentUser.email || prev.email,
                            phone: currentUser.phone || prev.phone,
                            location: currentUser.location || prev.location,
                            website: targetWeb,
                            github: targetGit,
                            linkedin: targetLin,
                          }));
                          setUrlErrors({
                            linkedin: validateLinkedInUrl(targetLin).error,
                            github: validateGitHubUrl(targetGit).error,
                            website: validatePortfolioUrl(targetWeb).error,
                          });
                          showToast('Auto-filled contact details from your account profile!');
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <User size={13} />
                        <span>Auto-fill from Profile</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'summary' && (
                <div className="space-y-4">
                  <div className="space-y-2 text-xs">
                    <AiWritingAssistantInline
                      label="Executive Summary Text"
                      value={personalInfo.summary}
                      onChange={(newVal) => setPersonalInfo({ ...personalInfo, summary: newVal })}
                      section="summary"
                      multiline
                      rows={5}
                      placeholder="Write a concise 2-3 sentence overview of your background, technical focus, and accomplishments..."
                      jdText={jdText}
                    />
                  </div>

                  {/* Contextual AI Toolbar for Summary */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={handleFixSummaryGrammar}
                      disabled={isAiWorking || !personalInfo.summary.trim()}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Check size={13} className="text-emerald-600" />
                      <span>{isAiWorking ? 'Thinking...' : 'Fix Grammar'}</span>
                    </button>

                    <button
                      onClick={handleAiImproveSummary}
                      disabled={isAiWorking || !personalInfo.summary.trim()}
                      className="px-3 py-1.5 bg-[#0B192C] hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs"
                    >
                      <Wand2 size={13} className="text-blue-300" />
                      <span>{isAiWorking ? 'Improving...' : 'AI Improve'}</span>
                    </button>
                  </div>

                  {/* Minimal Before -> After Result Panel */}
                  {summaryPreviewDiff && (
                    <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-2.5 shadow-2xs transition-all">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
                        <span>Proposed Change ({summaryPreviewDiff.type})</span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div className="p-2 bg-red-50/60 border border-red-200 rounded-md">
                          <span className="block text-[9px] font-bold text-red-600 uppercase tracking-wider mb-0.5">Original</span>
                          <p className="text-slate-700 line-through opacity-80 leading-snug">{summaryPreviewDiff.original}</p>
                        </div>
                        <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-md">
                          <span className="block text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Proposed</span>
                          <p className="text-slate-900 font-semibold leading-snug">{summaryPreviewDiff.suggested}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setSummaryPreviewDiff(null)}
                          className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md border border-slate-200 cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPersonalInfo((prev) => ({ ...prev, summary: summaryPreviewDiff.suggested }));
                            setSummaryPreviewDiff(null);
                            triggerAiGreenHighlight('summary');
                            showToast('Summary updated!');
                          }}
                          className="px-3 py-1 bg-[#0B192C] hover:bg-slate-800 text-white font-semibold text-xs rounded-md flex items-center gap-1 cursor-pointer"
                        >
                          <Check size={12} />
                          <span>Apply</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'experience' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Work Experience ({experiences.length})
                    </span>
                    <button
                      onClick={() => {
                        const newExp: ExperienceItem = {
                          id: `exp_${Date.now()}`,
                          title: '',
                          company: '',
                          period: '',
                          location: '',
                          bullets: [''],
                        };
                        setExperiences([...experiences, newExp]);
                      }}
                      className="px-2.5 py-1 bg-[#0B192C] text-white rounded-md font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Role
                    </button>
                  </div>

                  {/* Optional AI Enhancement */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center gap-2">
                      <Sparkles size={14} className="text-slate-500" />
                      <span className="text-xs text-slate-700 font-bold">Enhance with AI <span className="font-normal text-slate-500">(optional)</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleEnhanceExperienceWithAI}
                        disabled={isAiWorking}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 border border-slate-300 rounded text-xs font-bold cursor-pointer transition-colors"
                      >
                        {isAiWorking ? 'Thinking...' : 'Improve Experience Bullets'}
                      </button>
                    </div>
                  </div>

                  {experiences.map((exp, expIdx) => (
                    <div key={exp.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center justify-between gap-2">
                        <input
                          type="text"
                          value={exp.title}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[expIdx].title = e.target.value;
                            setExperiences(updated);
                          }}
                          className="font-bold text-xs text-[#0B192C] bg-white border border-slate-200 rounded px-2 py-1 flex-1"
                        />
                        <input
                          type="text"
                          value={exp.company}
                          onChange={(e) => {
                            const updated = [...experiences];
                            updated[expIdx].company = e.target.value;
                            setExperiences(updated);
                          }}
                          className="text-xs text-slate-700 bg-white border border-slate-200 rounded px-2 py-1 flex-1"
                        />
                        <button
                          onClick={() => setExperiences(experiences.filter((item) => item.id !== exp.id))}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="space-y-3">
                        {exp.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold mt-2">•</span>
                            <div className="flex-1">
                              <AiWritingAssistantInline
                                value={b}
                                onChange={(newVal) => {
                                  const updated = [...experiences];
                                  updated[expIdx].bullets[bIdx] = newVal;
                                  setExperiences(updated);
                                }}
                                section="experience"
                                itemId={exp.id}
                                multiline
                                rows={2}
                                placeholder="Action Verb + Context + Technology + Result..."
                                jdText={jdText}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'projects' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Projects & Portfolio
                    </span>
                    <button
                      onClick={() => {
                        const newProj: ProjectItem = {
                          id: `proj_${Date.now()}`,
                          title: '',
                          description: '',
                          techStack: [],
                          bullets: [''],
                        };
                        setProjects([...projects, newProj]);
                      }}
                      className="px-2.5 py-1 bg-[#0B192C] text-white rounded-md font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Project
                    </button>
                  </div>

                  {/* Inline AI & GitHub Toolbar for Projects */}
                  <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                    <span className="font-bold text-slate-800 text-[11px] block">Project AI & Integration Tools</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => {
                          setGithubImportMode('projects');
                          setIsGithubModalOpen(true);
                        }}
                        className="px-2.5 py-1.5 bg-[#0B192C] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        <Github size={13} /> Import GitHub Projects
                      </button>

                      <button
                        onClick={handleImproveProjectBulletsWithAI}
                        disabled={isAiWorking}
                        className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Sparkles size={13} /> {isAiWorking ? 'Thinking...' : 'Improve Bullet Points'}
                      </button>

                      <button
                        onClick={handleGenerateProjectDescriptionWithAI}
                        disabled={isAiWorking}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 size={13} /> {isAiWorking ? 'Thinking...' : 'Generate Description'}
                      </button>
                    </div>
                  </div>

                  {projects.map((proj, pIdx) => (
                    <div key={proj.id} className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-xl space-y-3 shadow-2xs">
                      {/* Title & Delete Header */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 space-y-1">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Project Title
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. HireFlow AI Workspace"
                            value={proj.title}
                            onChange={(e) => {
                              const updated = [...projects];
                              updated[pIdx].title = e.target.value;
                              setProjects(updated);
                            }}
                            className="w-full font-bold text-xs text-[#0B192C] bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                        <button
                          onClick={() => setProjects(projects.filter((p) => p.id !== proj.id))}
                          className="p-1.5 text-slate-400 hover:text-red-600 cursor-pointer self-end mb-0.5"
                          title="Delete project"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Live Link / Demo URL Input */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                          <Globe size={11} className="text-blue-600" />
                          <span>Live Link / Project Demo URL</span>
                        </label>
                        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus-within:border-blue-600">
                          <ExternalLink size={12} className="text-slate-400 shrink-0" />
                          <input
                            type="text"
                            placeholder="https://myproject.com or https://github.com/username/project"
                            value={proj.link || proj.demoUrl || ''}
                            onChange={(e) => {
                              const updated = [...projects];
                              updated[pIdx].link = e.target.value;
                              updated[pIdx].demoUrl = e.target.value;
                              setProjects(updated);
                            }}
                            className="w-full text-xs text-[#0B192C] bg-transparent focus:outline-none font-mono"
                          />
                        </div>
                      </div>

                      {/* Tech Stack Input */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Tech Stack (comma-separated)
                        </label>
                        <input
                          type="text"
                          placeholder="React 18, TypeScript, Node.js, Express"
                          value={(proj.techStack || []).join(', ')}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[pIdx].techStack = e.target.value
                              .split(',')
                              .map((t) => t.trim())
                              .filter(Boolean);
                            setProjects(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      {/* Description */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Short Description
                        </label>
                        <textarea
                          rows={2}
                          placeholder="Brief description of project capabilities..."
                          value={proj.description}
                          onChange={(e) => {
                            const updated = [...projects];
                            updated[pIdx].description = e.target.value;
                            setProjects(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-700 leading-relaxed focus:border-blue-600 focus:outline-none"
                        />
                      </div>

                      {/* Bullet Highlights */}
                      <div className="space-y-1.5 pt-1 border-t border-slate-200/60">
                        <div className="flex items-center justify-between">
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                            Key Bullet Points
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...projects];
                              updated[pIdx].bullets = [...(updated[pIdx].bullets || []), ''];
                              setProjects(updated);
                            }}
                            className="text-[10px] font-bold text-blue-600 hover:underline cursor-pointer"
                          >
                            + Add Bullet
                          </button>
                        </div>

                        <div className="space-y-3">
                          {(proj.bullets || []).map((b, bIdx) => (
                            <div key={bIdx} className="flex items-start gap-1.5">
                              <span className="text-blue-600 font-bold mt-2">•</span>
                              <div className="flex-1">
                                <AiWritingAssistantInline
                                  value={b}
                                  onChange={(newVal) => {
                                    const updated = [...projects];
                                    updated[pIdx].bullets[bIdx] = newVal;
                                    setProjects(updated);
                                  }}
                                  section="projects"
                                  itemId={proj.id}
                                  multiline
                                  rows={2}
                                  placeholder="Describe technical contribution, feature, or outcome..."
                                  jdText={jdText}
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...projects];
                                  updated[pIdx].bullets = updated[pIdx].bullets.filter((_, idx) => idx !== bIdx);
                                  setProjects(updated);
                                }}
                                className="p-1 text-slate-400 hover:text-red-600 cursor-pointer mt-1"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'skills' && (
                <div className="space-y-4 text-xs">
                  <div className="space-y-2">
                    <AiWritingAssistantInline
                      label="Technical Skills Stack"
                      value={skills}
                      onChange={(newVal) => setSkills(newVal)}
                      section="skills"
                      multiline
                      rows={4}
                      placeholder="e.g. Languages: JavaScript, TypeScript | Frontend: React, Next.js | Backend: Node.js, PostgreSQL"
                      jdText={jdText}
                    />
                  </div>

                  {/* Contextual AI Toolbar for Skills */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setGithubImportMode('skills');
                        setIsGithubModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#0B192C] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Github size={13} /> Import GitHub Skills
                    </button>

                    <button
                      onClick={handleSuggestSkillsWithAI}
                      disabled={isAiWorking}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 disabled:opacity-60 disabled:cursor-not-allowed text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Sparkles size={13} className="text-blue-600" />
                      <span>{isAiWorking ? 'Thinking...' : 'Suggest Missing Skills'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeSection === 'education' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Education & Qualifications ({education.length})
                    </span>
                    <button
                      onClick={() => {
                        const newEdu: EducationItem = {
                          id: `edu_${Date.now()}`,
                          degree: '',
                          institution: '',
                          startYear: '',
                          endYear: '',
                          period: '',
                          gpa: '',
                          coursework: '',
                        };
                        setEducation([...education, newEdu]);
                      }}
                      className="px-2.5 py-1 bg-[#0B192C] text-white rounded-md font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Education
                    </button>
                  </div>

                  {education.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic py-2">
                      No education entries added. Click "Add Education" to add your college/school details.
                    </p>
                  )}

                  {education.map((edu, eIdx) => {
                    const parsedStart = edu.startYear || (edu.period ? edu.period.split(/[-–—]/)[0]?.trim() : '');
                    const parsedEnd = edu.endYear || (edu.period ? edu.period.split(/[-–—]/)[1]?.trim() : '');

                    return (
                      <div key={edu.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                        <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 pb-2">
                          <span className="font-bold text-[#0B192C] text-xs truncate">
                            {edu.degree || edu.institution ? `${edu.degree || 'Degree'} ${edu.institution ? `at ${edu.institution}` : ''}` : `Education Entry #${eIdx + 1}`}
                          </span>
                          <button
                            onClick={() => setEducation(education.filter((item) => item.id !== edu.id))}
                            className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                            title="Delete education entry"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        {/* Row 1: Degree / Field of Study | College / University */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>Degree / Field of Study <span className="text-red-500 font-black">*</span></span>
                              <span className="text-[9px] font-semibold text-red-600 font-mono">Required</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. B.Tech in Computer Science"
                              value={edu.degree}
                              onChange={(e) => {
                                const updated = [...education];
                                updated[eIdx].degree = e.target.value;
                                setEducation(updated);
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-bold text-[#0B192C] focus:outline-none transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>College / University <span className="text-red-500 font-black">*</span></span>
                              <span className="text-[9px] font-semibold text-red-600 font-mono">Required</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. PW Institute of Innovation"
                              value={edu.institution}
                              onChange={(e) => {
                                const updated = [...education];
                                updated[eIdx].institution = e.target.value;
                                setEducation(updated);
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs text-[#0B192C] focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        {/* Row 2: Start Year | End Year / Expected Graduation */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>Start Year <span className="text-red-500 font-black">*</span></span>
                              <span className="text-[9px] font-semibold text-red-600 font-mono">Required</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 2025"
                              value={parsedStart}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = [...education];
                                updated[eIdx].startYear = val;
                                const curEnd = updated[eIdx].endYear || parsedEnd;
                                updated[eIdx].period = (val && curEnd) ? `${val} – ${curEnd}` : (val || curEnd || '');
                                setEducation(updated);
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-mono text-slate-700 focus:outline-none transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>End Year / Expected Graduation <span className="text-red-500 font-black">*</span></span>
                              <span className="text-[9px] font-semibold text-red-600 font-mono">Required</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 2029"
                              value={parsedEnd}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = [...education];
                                updated[eIdx].endYear = val;
                                const curStart = updated[eIdx].startYear || parsedStart;
                                updated[eIdx].period = (curStart && val) ? `${curStart} – ${val}` : (curStart || val || '');
                                setEducation(updated);
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs font-mono text-slate-700 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>

                        {/* Row 3: GPA / Percentage | Relevant Coursework */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>GPA / Percentage</span>
                              <span className="text-[9px] font-medium text-slate-400 font-mono">Optional</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. 8.5/10 or 85%"
                              value={edu.gpa || ''}
                              onChange={(e) => {
                                const updated = [...education];
                                updated[eIdx].gpa = e.target.value;
                                setEducation(updated);
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none transition-colors"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider mb-1 flex items-center justify-between">
                              <span>Relevant Coursework</span>
                              <span className="text-[9px] font-medium text-slate-400 font-mono">Optional</span>
                            </label>
                            <input
                              type="text"
                              placeholder="e.g. OOP in C++, Operating Systems, Data Structures, Algorithms"
                              value={edu.coursework || edu.highlights || ''}
                              onChange={(e) => {
                                const updated = [...education];
                                updated[eIdx].coursework = e.target.value;
                                updated[eIdx].highlights = e.target.value;
                                setEducation(updated);
                              }}
                              className="w-full bg-white border border-slate-200 focus:border-blue-600 rounded px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {activeSection === 'certificates' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Certificates & Credentials
                    </span>
                    <button
                      onClick={() => {
                        const newCert: CertificateItem = {
                          id: `cert_${Date.now()}`,
                          title: '',
                          issuer: '',
                          date: '',
                        };
                        setCertificates([...certificates, newCert]);
                      }}
                      className="px-2.5 py-1 bg-[#0B192C] text-white rounded-md font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Certificate
                    </button>
                  </div>

                  {certificates.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic py-2">
                      No certificates added yet. Click "Add Certificate" if you have one — only include certifications you actually hold.
                    </p>
                  )}

                  {certificates.map((c, cIdx) => (
                    <div key={c.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-2">
                      <input
                        type="text"
                        placeholder="Certificate title (e.g. AWS Solutions Architect)"
                        value={c.title}
                        onChange={(e) => {
                          const updated = [...certificates];
                          updated[cIdx].title = e.target.value;
                          setCertificates(updated);
                        }}
                        className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-[#0B192C] flex-1"
                      />
                      <button
                        onClick={() => setCertificates(certificates.filter((item) => item.id !== c.id))}
                        className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'achievements' && (
                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Achievements
                    </span>
                    <button
                      onClick={() => {
                        const newAchievement: AchievementItem = {
                          id: `ach_${Date.now()}`,
                          title: '',
                          description: '',
                          date: '',
                        };
                        setAchievements([...achievements, newAchievement]);
                      }}
                      className="px-2.5 py-1 bg-[#0B192C] text-white rounded-md font-bold text-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus size={12} /> Add Achievement
                    </button>
                  </div>

                  {achievements.length === 0 && (
                    <p className="text-[11px] text-slate-400 italic py-2">
                      No achievements added yet. Add hackathons, awards, publications, or other real accomplishments — only include ones that actually happened.
                    </p>
                  )}

                  {achievements.map((a, aIdx) => (
                    <div key={a.id} className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Achievement title (e.g. Winner, XYZ Hackathon 2024)"
                          value={a.title}
                          onChange={(e) => {
                            const updated = [...achievements];
                            updated[aIdx] = { ...updated[aIdx], title: e.target.value };
                            setAchievements(updated);
                          }}
                          className="bg-white border border-slate-200 rounded px-2 py-1 text-xs font-bold text-[#0B192C] flex-1"
                        />
                        <input
                          type="text"
                          placeholder="Date"
                          value={a.date || ''}
                          onChange={(e) => {
                            const updated = [...achievements];
                            updated[aIdx] = { ...updated[aIdx], date: e.target.value };
                            setAchievements(updated);
                          }}
                          className="bg-white border border-slate-200 rounded px-2 py-1 text-xs text-slate-600 w-24"
                        />
                        <button
                          onClick={() => setAchievements(achievements.filter((item) => item.id !== a.id))}
                          className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      <textarea
                        placeholder="Short description (optional)"
                        value={a.description || ''}
                        onChange={(e) => {
                          const updated = [...achievements];
                          updated[aIdx] = { ...updated[aIdx], description: e.target.value };
                          setAchievements(updated);
                        }}
                        rows={2}
                        className="w-full bg-white border border-slate-200 rounded px-2 py-1.5 text-xs text-slate-700"
                      />
                    </div>
                  ))}
                </div>
              )}

              {activeSection === 'styling' && (
                <div className="space-y-4 text-xs">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Resume Layout Template
                      </label>
                      <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {templatesConfigService.getAllTemplates().length} Templates Configured
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-[320px] overflow-y-auto custom-scrollbar p-1">
                      {templatesConfigService.getAllTemplates().map((tmpl) => {
                        const isSelected =
                          selectedTemplate.toLowerCase() === tmpl.name.toLowerCase() ||
                          selectedTemplate.toLowerCase() === tmpl.id.toLowerCase();
                        return (
                          <div
                            key={tmpl.id}
                            onClick={() => {
                              setSelectedTemplate(tmpl.name);
                              setResumeStyling(templatesConfigService.toResumeStyling(tmpl));
                              showToast(`Applied "${tmpl.name}" ATS template layout!`);
                            }}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer space-y-1.5 ${
                              isSelected
                                ? 'bg-[#0B192C] text-white border-[#0B192C] shadow-md ring-2 ring-blue-500/50'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400 hover:bg-white'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-xs leading-snug">{tmpl.name}</span>
                              <span
                                className={`text-[9px] font-mono px-1.5 py-0.5 rounded font-bold ${
                                  isSelected ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-700'
                                }`}
                              >
                                {tmpl.category}
                              </span>
                            </div>
                            <p className={`text-[10px] line-clamp-2 leading-relaxed ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                              {tmpl.description}
                            </p>
                            <div className="flex items-center gap-1.5 pt-1 text-[9px] font-mono">
                              <span className={`px-1 rounded ${isSelected ? 'bg-slate-700 text-emerald-300' : 'bg-slate-200 text-slate-700'}`}>
                                Single Column
                              </span>
                              <span className={`px-1 rounded ${isSelected ? 'bg-slate-700 text-blue-300' : 'bg-slate-200 text-slate-700'}`}>
                                Table Free
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Font Family
                      </label>
                      <select
                        value={resumeStyling.fontFamily}
                        onChange={(e) => setResumeStyling({ ...resumeStyling, fontFamily: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-[#0B192C]"
                      >
                        <option value="Inter, sans-serif">Inter (Modern Sans)</option>
                        <option value="Georgia, serif">Georgia (Classic Serif)</option>
                        <option value="Garamond, Times New Roman, serif">Garamond / Times (Harvard)</option>
                        <option value="Roboto, sans-serif">Roboto (Clean Sans)</option>
                        <option value="Calibri, sans-serif">Calibri (Corporate)</option>
                        <option value="JetBrains Mono, monospace">JetBrains Mono (Developer)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                        Header Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={resumeStyling.primaryColor}
                          onChange={(e) => setResumeStyling({ ...resumeStyling, primaryColor: e.target.value })}
                          className="w-8 h-8 rounded border border-slate-200 cursor-pointer"
                        />
                        <span className="font-mono text-xs text-slate-700">{resumeStyling.primaryColor}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* CUSTOM SECTION EDITOR CARD */}
            {sections.find((s) => s.id === activeSection)?.type === 'custom' && (() => {
              const customData = customSections.find((c) => c.id === activeSection) || {
                id: activeSection,
                title: sections.find((s) => s.id === activeSection)?.title || 'Custom Section',
                items: [],
              };

              return (
                <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <Sparkles size={15} className="text-blue-500" />
                    <h3 className="text-xs font-bold text-[#0B192C]">Custom Section Editor</h3>
                  </div>

                  {/* Title rename */}
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                      Section Title
                    </label>
                    <input
                      type="text"
                      value={customData.title}
                      onChange={(e) => handleUpdateCustomSectionTitle(activeSection, e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:outline-none"
                    />
                  </div>

                  {/* Items list */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-[#0B192C]">
                        Items ({customData.items.length})
                      </label>
                      <button
                        onClick={() => handleAddCustomItem(activeSection)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline cursor-pointer"
                      >
                        <Plus size={13} /> Add Item
                      </button>
                    </div>

                    {customData.items.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50/80 border border-slate-200/90 rounded-xl space-y-3 relative">
                        <button
                          onClick={() => handleDeleteCustomItem(activeSection, item.id)}
                          className="absolute top-3 right-3 text-slate-400 hover:text-red-600 p-1 cursor-pointer"
                          title="Delete item"
                        >
                          <Trash2 size={14} />
                        </button>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="sm:col-span-2">
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Item Title / Name
                            </label>
                            <input
                              type="text"
                              value={item.title}
                              onChange={(e) => handleUpdateCustomItem(activeSection, item.id, 'title', e.target.value)}
                              placeholder="e.g. Native English, Fluent German"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-bold text-[#0B192C] focus:border-blue-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Subtitle / Context (Optional)
                            </label>
                            <input
                              type="text"
                              value={item.subtitle || ''}
                              onChange={(e) => handleUpdateCustomItem(activeSection, item.id, 'subtitle', e.target.value)}
                              placeholder="e.g. C2 Proficient, Honors Award"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-[#0B192C] focus:border-blue-600 focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                              Date / Year (Optional)
                            </label>
                            <input
                              type="text"
                              value={item.date || ''}
                              onChange={(e) => handleUpdateCustomItem(activeSection, item.id, 'date', e.target.value)}
                              placeholder="e.g. 2024"
                              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs text-[#0B192C] focus:border-blue-600 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                            Details / Description
                          </label>
                          <textarea
                            rows={2}
                            value={(item.bullets || []).join('\n')}
                            onChange={(e) => handleUpdateCustomItem(activeSection, item.id, 'bullets', e.target.value.split('\n'))}
                            placeholder="Enter item details or bullet points..."
                            className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-[#0B192C] focus:border-blue-600 focus:outline-none"
                          />
                        </div>
                      </div>
                    ))}

                    {customData.items.length === 0 && (
                      <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl bg-slate-50">
                        <p className="text-xs text-slate-500">No items added to this section yet.</p>
                        <button
                          onClick={() => handleAddCustomItem(activeSection)}
                          className="mt-2 text-xs font-bold text-blue-600 hover:underline inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Plus size={13} /> Add First Item
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* ATS ANALYSIS PANEL — LIVE DETERMINISTIC ATS SCORE & CHECKLIST */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs">
              <button
                onClick={() => setIsAtsPanelExpanded(!isAtsPanelExpanded)}
                className="flex items-center justify-between w-full text-left select-none cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-bold font-mono text-xs transition-colors ${
                    isCalculatingAts
                      ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                      : liveAtsScore !== null && liveAtsScore >= 80
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : liveAtsScore !== null && liveAtsScore >= 60
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : liveAtsScore !== null && liveAtsScore >= 40
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}>
                    {isCalculatingAts ? '...' : liveAtsScore !== null ? liveAtsScore : '--'}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs text-[#0B192C]">ATS Analysis</h3>
                      {liveAtsScore !== null && !isCalculatingAts && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          liveAtsScore >= 80 ? 'bg-emerald-100 text-emerald-800' :
                          liveAtsScore >= 60 ? 'bg-blue-100 text-blue-800' :
                          liveAtsScore >= 40 ? 'bg-amber-100 text-amber-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {atsReport?.scoreLabel || 'Score'}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 flex items-center gap-1">
                      {isCalculatingAts ? (
                        <span className="text-amber-600 font-medium">Updating ATS score...</span>
                      ) : (
                        <span>{atsLastUpdatedText}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {isAtsPanelExpanded ? (
                    <ChevronUp size={16} className="text-slate-400 shrink-0" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400 shrink-0" />
                  )}
                </div>
              </button>

              {isAtsPanelExpanded && (
                <div className="pt-3 border-t border-slate-100 mt-3 space-y-3.5 text-xs animate-in fade-in duration-200">
                  {/* Live Score Progress Bar */}
                  <div className="space-y-1.5 p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                    <div className="flex justify-between items-center text-[11px] font-medium">
                      <span className="text-slate-700 font-bold">Overall ATS Health</span>
                      <span className="font-bold font-mono text-xs">
                        {isCalculatingAts ? (
                          <span className="text-amber-600 animate-pulse">Calculating...</span>
                        ) : liveAtsScore !== null ? (
                          <span className={
                            liveAtsScore >= 80 ? 'text-emerald-700' :
                            liveAtsScore >= 60 ? 'text-blue-700' :
                            liveAtsScore >= 40 ? 'text-amber-700' : 'text-red-700'
                          }>
                            {liveAtsScore} / 100
                          </span>
                        ) : (
                          '--'
                        )}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCalculatingAts ? 'bg-amber-400 animate-pulse w-full' :
                          (liveAtsScore || 0) >= 80 ? 'bg-emerald-500' :
                          (liveAtsScore || 0) >= 60 ? 'bg-blue-500' :
                          (liveAtsScore || 0) >= 40 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: isCalculatingAts ? '100%' : `${liveAtsScore || 0}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                      <span>{jdText?.trim() ? 'Evaluated against Target Job Description' : 'General ATS Readability Scoring'}</span>
                      <span>{isCalculatingAts ? 'Updating ATS score...' : atsLastUpdatedText}</span>
                    </div>
                  </div>

                  {/* 8 Standard ATS Categories Live Checklist */}
                  {atsReport && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                          ATS EVALUATION (8 KEY CATEGORIES)
                        </span>
                        <span className="text-[9px] text-slate-400 font-mono">100% Deterministic</span>
                      </div>
                      <div className="space-y-1.5">
                        {(atsReport.standardCategories || [
                          (atsReport.categories as any)?.contact || atsReport.categories?.contactInfo,
                          (atsReport.categories as any)?.structure || atsReport.categories?.sections,
                          atsReport.categories?.experience,
                          (atsReport.categories as any)?.skills || atsReport.categories?.hardSkills,
                          atsReport.categories?.projects,
                          atsReport.categories?.education,
                          atsReport.categories?.formatting,
                          (atsReport.categories as any)?.contentQuality || atsReport.categories?.metrics,
                        ].filter(Boolean)).map((cat: any, idx: number) => {
                          const weightMap: Record<string, string> = {
                            contactInfo: '10%',
                            contact: '10%',
                            sections: '10%',
                            structure: '10%',
                            experience: '20%',
                            hardSkills: '15%',
                            skills: '15%',
                            projects: '15%',
                            education: '10%',
                            formatting: '10%',
                            metrics: '10%',
                            contentQuality: '10%',
                          };
                          const weight = weightMap[cat.key] || '10%';
                          return (
                            <div
                              key={cat.key || idx}
                              className="p-2.5 bg-slate-50 border border-slate-200/90 rounded-lg flex items-start justify-between gap-2 text-xs transition-colors hover:bg-white"
                            >
                              <div className="space-y-0.5 flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className={`w-2 h-2 rounded-full shrink-0 ${
                                    cat.score >= 80 ? 'bg-emerald-500' :
                                    cat.score >= 60 ? 'bg-blue-500' :
                                    cat.score >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                  }`} />
                                  <span className="font-bold text-[#0B192C] text-[11px] truncate">{cat.label}</span>
                                  <span className="text-[9px] font-mono px-1 py-0.2 bg-slate-200/80 text-slate-600 rounded">
                                    Weight: {weight}
                                  </span>
                                </div>
                                <p className="text-[10px] text-slate-500 leading-tight">{cat.reason}</p>
                                {cat.fixSuggestion && cat.score < 80 && (
                                  <p className="text-[10px] text-blue-700 font-medium pt-0.5">💡 {cat.fixSuggestion}</p>
                                )}
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-700 block">
                                  {cat.score}/100
                                </span>
                                <span className={`text-[9px] font-bold block pt-0.5 ${
                                  cat.score >= 80 ? 'text-emerald-600' :
                                  cat.score >= 60 ? 'text-blue-600' :
                                  cat.score >= 40 ? 'text-amber-600' : 'text-red-600'
                                }`}>
                                  {cat.score >= 80 ? 'Passed' : cat.score >= 60 ? 'Good' : 'Needs Fix'}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Missing Keywords from Job Description (if JD is provided) */}
                  {atsReport && atsReport.missingKeywords && atsReport.missingKeywords.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                        MISSING FROM RESUME (FOUND IN TARGET JD)
                      </span>
                      <p className="text-[10px] text-slate-500">
                        Found in Job Description but not detected in your resume:
                      </p>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {atsReport.missingKeywords.slice(0, 10).map((item) => {
                          const kw = typeof item === 'string' ? item : item.keyword;
                          return (
                            <button
                              key={kw}
                              onClick={() => {
                                if (!skills.toLowerCase().includes(kw.toLowerCase())) {
                                  setSkills((prev) => (prev ? `${prev}, ${kw}` : kw));
                                  showToast(`Added "${kw}" to Skills section!`);
                                }
                              }}
                              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[10px] font-semibold rounded flex items-center gap-1 cursor-pointer transition-colors"
                              title={`Found in Job Description but missing from your resume. Click to review/add.`}
                            >
                              <span>+ {kw}</span>
                              <span className="text-[9px] font-mono text-amber-700">(Review)</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Button to full ATS Analysis Page */}
                  <div className="pt-1">
                    <button
                      onClick={() => navigate('/app/ats-analysis')}
                      className="w-full py-2 bg-[#0B192C] hover:bg-slate-800 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                    >
                      <FileCheck size={14} />
                      <span>View Full Detailed ATS Report</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* EXPANDABLE TAILORED RESUME PANEL (BELOW ATS ANALYSIS) */}
            <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-4">
              <div
                onClick={() => setIsTailorPanelExpanded(!isTailorPanelExpanded)}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 flex items-center justify-center font-bold text-xs">
                    <Sparkles size={14} />
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-[#0B192C]">Tailored Resume</h3>
                    <p className="text-[10px] text-slate-500">Paste a Job Description and optimize your resume for that role.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {tailoredResumeData && (
                    <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Tailored Ready
                    </span>
                  )}
                  {isTailorPanelExpanded ? (
                    <ChevronUp size={16} className="text-slate-400" />
                  ) : (
                    <ChevronDown size={16} className="text-slate-400" />
                  )}
                </div>
              </div>

              {isTailorPanelExpanded && (
                <div className="pt-3 border-t border-slate-100 space-y-3.5 text-xs animate-in fade-in duration-200">
                  {/* Mode Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
                    <button
                      onClick={() => setJdTab('upload')}
                      className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        jdTab === 'upload' ? 'bg-white text-[#0B192C] shadow-2xs' : 'text-slate-600 hover:text-[#0B192C]'
                      }`}
                    >
                      Upload JD
                    </button>
                    <button
                      onClick={() => setJdTab('paste')}
                      className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        jdTab === 'paste' ? 'bg-white text-[#0B192C] shadow-2xs' : 'text-slate-600 hover:text-[#0B192C]'
                      }`}
                    >
                      Paste JD
                    </button>
                    <button
                      onClick={() => setJdTab('linkedin')}
                      className={`flex-1 py-1.5 px-2 text-[11px] font-bold rounded-md transition-all cursor-pointer ${
                        jdTab === 'linkedin' ? 'bg-white text-[#0B192C] shadow-2xs' : 'text-slate-600 hover:text-[#0B192C]'
                      }`}
                    >
                      Import LinkedIn Job
                    </button>
                  </div>

                  {/* Input Forms */}
                  {jdTab === 'paste' && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        Job Description Text
                      </label>
                      <textarea
                        rows={5}
                        value={jdText}
                        onChange={(e) => setJdText(e.target.value)}
                        placeholder="Paste target job description requirements, responsibilities, and qualifications here..."
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-[#0B192C] focus:outline-none focus:ring-1 focus:ring-[#0B192C]"
                      />
                    </div>
                  )}

                  {jdTab === 'upload' && (
                    <div className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center space-y-2 bg-slate-50">
                      <FileText className="mx-auto text-slate-400" size={20} />
                      <p className="text-xs text-slate-600 font-medium">
                        {jdFile ? jdFile.name : 'Upload PDF, DOCX or TXT Job Description'}
                      </p>
                      <input
                        type="file"
                        accept=".pdf,.docx,.doc,.txt"
                        onChange={(e) => e.target.files?.[0] && setJdFile(e.target.files[0])}
                        className="hidden"
                        id="jd-file-input"
                      />
                      <label
                        htmlFor="jd-file-input"
                        className="inline-block px-3 py-1 bg-white border border-slate-200 text-[#0B192C] font-bold text-xs rounded-md cursor-pointer hover:bg-slate-100"
                      >
                        {jdFile ? 'Change File' : 'Browse File'}
                      </label>
                    </div>
                  )}

                  {jdTab === 'linkedin' && (
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                        LinkedIn Job URL / ID
                      </label>
                      <input
                        type="text"
                        value={jdLinkedinUrl}
                        onChange={(e) => setJdLinkedinUrl(e.target.value)}
                        placeholder="https://www.linkedin.com/jobs/view/..."
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-sans text-[#0B192C] focus:outline-none focus:ring-1 focus:ring-[#0B192C]"
                      />
                    </div>
                  )}

                  {/* Analyze Job Action Button */}
                  <button
                    onClick={handleAnalyzeJd}
                    disabled={isAnalyzingJd}
                    className="w-full py-2 bg-[#0B192C] hover:bg-slate-800 disabled:opacity-60 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <Sparkles size={14} className="text-blue-400" />
                    <span>{isAnalyzingJd ? 'Analyzing Job Description...' : 'Analyze Job'}</span>
                  </button>

                  {/* Analysis Output Section */}
                  {jdAnalysisResult && (
                    <div className="pt-3 border-t border-slate-200 space-y-3 animate-in fade-in duration-200">
                      {/* Overall Match % */}
                      <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg flex items-center justify-between">
                        <span className="font-bold text-xs text-[#0B192C]">Overall Match %</span>
                        <span className="px-2.5 py-0.5 bg-blue-600 text-white font-mono font-bold text-xs rounded-full">
                          {jdAnalysisResult.matchPercent}% Match
                        </span>
                      </div>

                      {/* Missing Keywords */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                          MISSING KEYWORDS
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {jdAnalysisResult.missingKeywords.map((kw) => (
                            <button
                              key={kw}
                              onClick={() => {
                                if (!skills.includes(kw)) {
                                  setSkills((prev) => (prev ? `${prev}, ${kw}` : kw));
                                  showToast(`Added ${kw} to Skills!`);
                                }
                              }}
                              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-semibold rounded cursor-pointer"
                            >
                              + {kw}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Required Skills */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                          REQUIRED SKILLS
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {jdAnalysisResult.requiredSkills.map((sk) => (
                            <span key={sk} className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-medium rounded">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Recommended Skills */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                          RECOMMENDED SKILLS
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {jdAnalysisResult.recommendedSkills.map((sk) => (
                            <span key={sk} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Missing Metrics */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                          MISSING METRICS
                        </span>
                        <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pl-1">
                          {jdAnalysisResult.missingMetrics.map((m, idx) => (
                            <li key={idx}>{m}</li>
                          ))}
                        </ul>
                      </div>

                      {/* AI Suggestions */}
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider block">
                          AI SUGGESTIONS
                        </span>
                        <div className="space-y-1">
                          {jdAnalysisResult.suggestions.map((sug, idx) => (
                            <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700 font-medium">
                              💡 {sug}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* One click: Generate Tailored Resume */}
                      <button
                        onClick={handleGenerateTailoredResume}
                        className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-colors"
                      >
                        <Sparkles size={15} />
                        <span>Generate Tailored Resume</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>



          </div>

          {/* ================================================================ */}
          {/* RIGHT COLUMN (60% -> lg:col-span-7): LIVE RESUME PREVIEW ONLY    */}
          {/* ================================================================ */}
          <div className="lg:col-span-7 sticky top-20">
            <div className="bg-slate-100/90 border border-slate-200/90 rounded-2xl p-4 sm:p-6 min-h-[850px] shadow-inner flex flex-col items-center relative overflow-hidden">
              
              {/* STICKY TOP PREVIEW CONTROL BAR */}
              <div className="w-full bg-white border border-slate-200/90 rounded-xl px-4 py-2 mb-4 flex items-center justify-between gap-3 text-xs shadow-2xs">
                {/* Live Status & Mode Switcher */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="font-bold text-slate-700 text-[11px]">Live Resume Preview</span>
                  </div>


                </div>

                {/* Page Nav */}
                <div className="flex items-center gap-2 text-[11px] font-mono font-semibold text-slate-500">
                  <span>Page 1 of 1</span>
                </div>

                {/* Zoom Controls */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(z - 10, 70))}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                    title="Zoom Out"
                  >
                    <ZoomOut size={13} />
                  </button>
                  <span className="font-mono text-[11px] font-bold text-slate-700 w-10 text-center">
                    {zoomLevel}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(z + 10, 130))}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                    title="Zoom In"
                  >
                    <ZoomIn size={13} />
                  </button>
                  <button
                    onClick={() => setZoomLevel(100)}
                    className="text-[10px] text-blue-600 hover:underline font-bold px-1 cursor-pointer"
                  >
                    Reset
                  </button>
                </div>
              </div>

              {/* HERO A4 RESUME DOCUMENT PAPER SHEET */}
              <div className="w-full flex justify-center overflow-auto py-2">
                <div
                  ref={documentSheetRef}
                  style={{
                    fontFamily: resumeStyling.fontFamily,
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top center',
                  }}
                  className="w-full max-w-[794px] bg-white border border-slate-200 shadow-xl rounded-xs p-8 sm:p-12 transition-all duration-300 text-slate-800"
                >
                  {resumeType === 'fresher' ? (
                    <FresherDocumentView
                      displayPersonalInfo={displayPersonalInfo}
                      displayExperiences={displayExperiences}
                      displayEducation={displayEducation}
                      displaySkills={displaySkills}
                      displayProjects={displayProjects}
                      displayCertificates={displayCertificates}
                      displayAchievements={displayAchievements}
                      customSections={customSections}
                      sections={sections}
                      activeSection={activeSection}
                      aiHighlightedSection={aiHighlightedSection}
                      handleSelectSection={handleSelectSection}
                      primaryColor={resumeStyling.primaryColor || '#000000'}
                      forceLayoutMode={fresherLayoutMode}
                    />
                  ) : (
                    <ExperiencedDocumentView
                      displayPersonalInfo={displayPersonalInfo}
                      displayExperiences={displayExperiences}
                      displayEducation={displayEducation}
                      displaySkills={displaySkills}
                      displayProjects={displayProjects}
                      displayCertificates={displayCertificates}
                      displayAchievements={displayAchievements}
                      customSections={customSections}
                      sections={sections}
                      activeSection={activeSection}
                      aiHighlightedSection={aiHighlightedSection}
                      handleSelectSection={handleSelectSection}
                      primaryColor={resumeStyling.primaryColor || '#000000'}
                    />
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* ------------------------------------------------------------------ */}
      {/* 3. ORIGINAL VS AI COMPARISON MODAL                                  */}
      {/* ------------------------------------------------------------------ */}
      {showComparisonModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-4 bg-[#0B192C] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={18} className="text-blue-400" />
                <h3 className="font-bold text-sm tracking-tight">Compare Original vs AI Optimized Version</h3>
              </div>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {preAiSnapshot ? (
              <div className="p-5 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50">
                {/* Left Column — this candidate's real content before the AI pass */}
                <div className="bg-white p-4 rounded-lg border border-slate-200 space-y-3">
                  <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider block border-b pb-1">
                    Original
                  </span>
                  <div>
                    <h4 className="font-bold text-slate-800">Summary</h4>
                    <p className="text-slate-600 mt-1">{preAiSnapshot.summary || '(empty)'}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800">Skills</h4>
                    <p className="text-slate-600 mt-1 font-mono">{preAiSnapshot.skills || '(empty)'}</p>
                  </div>
                </div>

                {/* Right Column — the resume's current (AI-updated) real content */}
                <div className="bg-white p-4 rounded-lg border border-blue-300 space-y-3 shadow-2xs">
                  <span className="font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-wider block border-b pb-1">
                    AI Optimized
                  </span>
                  <div>
                    <h4 className="font-bold text-[#0B192C]">Summary</h4>
                    <p className={`mt-1 p-2 rounded ${personalInfo.summary !== preAiSnapshot.summary ? 'font-medium bg-emerald-50/50 text-slate-700' : 'text-slate-600'}`}>
                      {personalInfo.summary || '(empty)'}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-bold text-[#0B192C]">Skills</h4>
                    <p className={`mt-1 font-mono p-2 rounded ${skills !== preAiSnapshot.skills ? 'font-medium bg-emerald-50/50 text-slate-700' : 'text-slate-600'}`}>
                      {skills || '(empty)'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-50">
                Run "Apply All AI" first to generate a before/after comparison of your actual resume content.
              </div>
            )}

            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  handleApplyAllAIReal();
                  setShowComparisonModal(false);
                }}
                className="px-4 py-1.5 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded cursor-pointer"
              >
                Accept & Apply All AI Changes
              </button>
              <button
                onClick={() => setShowComparisonModal(false)}
                className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 font-bold text-xs rounded cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GitHub Import Modal */}
      <GitHubImportModal
        isOpen={isGithubModalOpen}
        onClose={() => setIsGithubModalOpen(false)}
        mode={githubImportMode}
        username={currentUser?.github?.replace(/^https?:\/\/(www\.)?github\.com\//, '') || ''}
        currentSkillsString={skills}
        targetJobDescription=""
        onImportSkills={handleImportSkillsFromGithub}
        onImportProjects={handleImportProjectsFromGithub}
      />

      {/* ADD SECTION MODAL */}
      {isAddSectionModalOpen && (
        <div className="fixed inset-0 z-[99998] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-[#0B192C]">
              <div className="flex items-center gap-2">
                <Layers size={18} className="text-blue-400" />
                <h3 className="text-sm font-bold text-white tracking-tight">Add Section</h3>
              </div>
              <button
                onClick={() => setIsAddSectionModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-5 space-y-5">
              {/* Standard Sections */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Standard Sections
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { type: 'experience', label: 'Experience', icon: Briefcase },
                    { type: 'projects', label: 'Projects', icon: Code },
                    { type: 'education', label: 'Education', icon: GraduationCap },
                    { type: 'certificates', label: 'Certificates', icon: Award },
                    { type: 'achievements', label: 'Achievements', icon: Trophy },
                    { type: 'skills', label: 'Skills', icon: Zap },
                    { type: 'summary', label: 'Summary', icon: FileText },
                  ].map(({ type, label, icon: IconComp }) => (
                    <button
                      key={type}
                      onClick={() => handleAddStandardSection(type, label)}
                      className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 hover:bg-[#0B192C] hover:text-white border border-slate-200 hover:border-[#0B192C] text-slate-700 text-xs font-semibold rounded-xl transition-all cursor-pointer group"
                    >
                      <IconComp size={15} className="text-slate-500 group-hover:text-blue-300" />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">or create custom</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>

              {/* Custom Section */}
              <div className="space-y-2">
                <p className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                  Custom Section Title
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newCustomSectionTitle}
                    onChange={(e) => setNewCustomSectionTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateCustomSection()}
                    placeholder="e.g. Languages, Volunteer Work, Publications..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-[#0B192C] focus:bg-white focus:border-blue-600 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateCustomSection}
                    disabled={!newCustomSectionTitle.trim()}
                    className="px-4 py-2 bg-[#0B192C] hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-bold rounded-xl cursor-pointer transition-colors"
                  >
                    Create
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">Custom sections appear in your resume preview and export.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
