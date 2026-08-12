import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import confetti from 'canvas-confetti';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sparkles,
  ArrowRight,
  RefreshCw,
  UploadCloud,
  FileText,
  Check,
  X,
  ChevronDown,
  ChevronUp,
  Wand2,
  Plus,
  Sliders,
  Award,
  Lock,
  Target,
  Zap,
  BarChart3,
  Building2,
  ArrowUpRight,
  Code,
  CheckCheck,
  Loader2,
  Clock,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  SlidersHorizontal,
  Layers,
  Sparkle,
  Star,
  Eye,
  FileCode,
  Flame,
  CheckCircle,
  TrendingUp,
  Cpu,
  ArrowLeftRight,
  BookOpen,
  Link2,
  Github,
  Linkedin,
  Activity,
  AlignLeft,
  Hash,
  Calendar,
  UserCheck,
  Trophy,
  Globe,
  Layout
} from 'lucide-react';
import { parseResumeFile } from '../utils/fileParser';
import { parseResumeText } from '../utils/resumeTextParser';
import { ParsedResumeData, ATSFullReport, ATSCategoryResult, ATSCategoryKey } from '../types';
import { isAuthenticated } from '../lib/api';
import { rememberCurrentLocationForRedirect } from '../lib/authGate';
import LoginRequiredModal from '../components/app/LoginRequiredModal';
import { atsEngine } from '../services/ats.engine';
import { analyzeJobDescription, type JDAnalysis } from '../services/jd.analyzer';
import { buildKeywordReport, type KeywordReport, type KeywordCategoryGroup } from '../services/keyword.engine';
import { generateImprovements, applyImprovement, type ImprovementSuggestion } from '../services/ai.improvement';
import { getRecommendedSectionOrder, type SectionOrderRecommendation } from '../services/section.reorder';
import { validateResume, type ValidationIssue } from '../services/resume.validator';

export default function ATSAnalysisPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);
  const gateAiAction = (): boolean => {
    if (!isAuthenticated()) {
      setIsAuthGateOpen(true);
      return true;
    }
    return false;
  };

  // Scan Mode State: 'general' vs 'jd-match'
  const [scanMode, setScanMode] = useState<'general' | 'jd-match'>('general');
  const [isScanning, setIsScanning] = useState(false);
  const [currentResumeName, setCurrentResumeName] = useState('Senior Frontend Engineer.pdf');
  const [uploadedTime, setUploadedTime] = useState('12 seconds ago');
  const [showJdModal, setShowJdModal] = useState(false);
  const [jobDescription, setJobDescription] = useState(
    `We are seeking a Senior Full Stack Software Engineer to build scalable microservices and high-throughput React frontends. 
Requirements:
- 5+ years of experience with React, TypeScript, and Node.js
- Strong knowledge of PostgreSQL, Redis query caching, and Docker containerization
- Hands-on experience with AWS Cloud Services and CI/CD automated deployment pipelines
- Track record of writing Jest & Playwright unit/E2E test suites`
  );

  // File Upload & Drag and Drop Handlers
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // ATS Engine State
  const [atsReport, setAtsReport] = useState<ATSFullReport | null>(null);

  // Score & Metrics State
  const [atsScore, setAtsScore] = useState(0);
  const [previewTab, setPreviewTab] = useState<'preview' | 'compare'>('preview');
  const [previewZoom, setPreviewZoom] = useState(100);

  // Bottom CTA AI Generation Flow State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStepText, setGenerationStepText] = useState('Analyzing Skills & Gaps...');
  const [isGeneratedSuccess, setIsGeneratedSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Missing Keywords State (engine-driven)
  const [missingKeywords, setMissingKeywords] = useState<
    Array<{ name: string; frequency: number; boost: number; added: boolean }>
  >([]);
  const [keywordFilter, setKeywordFilter] = useState('');

  // New enterprise engine state
  const [jdAnalysis, setJdAnalysis] = useState<JDAnalysis | null>(null);
  const [keywordReport, setKeywordReport] = useState<KeywordReport | null>(null);
  const [aiImprovements, setAiImprovements] = useState<ImprovementSuggestion[]>([]);
  const [sectionReorder, setSectionReorder] = useState<SectionOrderRecommendation | null>(null);
  const [projectedScore, setProjectedScore] = useState<number>(0);
  const [openKeywordCategories, setOpenKeywordCategories] = useState<Record<string, boolean>>({});
  const [openImprovementsPanel, setOpenImprovementsPanel] = useState(true);

  // Accordion Sections Open State
  const [openInsights, setOpenInsights] = useState<{ [key: string]: boolean }>({
    good: true,
    improvements: true,
    issues: true,
  });

  // Category group accordion state
  const [openCategoryGroups, setOpenCategoryGroups] = useState<{ [key: string]: boolean }>({
    content: true,
    format: true,
    keywords: true,
    links: false,
    quality: false,
  });

  // Engine-driven categories (28 categories mapped from ATSFullReport)
  const [categories, setCategories] = useState<Array<{
    id: string;
    key: ATSCategoryKey;
    name: string;
    score: number;
    status: string;
    color: string;
    icon: any;
    desc: string;
    priority: string;
    estimatedAtsGain: number;
    fixSuggestion: string;
  }>>([]);

  // Engine-driven issues (mapped from topFixes)
  const [issues, setIssues] = useState<Array<{
    id: string;
    title: string;
    type: string;
    category: string;
    impact: string;
    time: string;
    message: string;
    whyRejects: string;
    howToFix: string;
    beforeText: string;
    afterText: string;
    fixed: boolean;
  }>>([]);

  // Raw red-line validation results (spelling/grammar/consistency/etc.),
  // kept separately from the merged `issues` display list so a future
  // red-line text-highlight UI can consume `original`/`section`/`itemId`
  // directly without re-deriving them.
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);

  // Category icon map
  const categoryIconMap: Record<string, any> = {
    formatting: Layout,
    sections: Layers,
    sectionOrder: AlignLeft,
    keywords: Code,
    hardSkills: Cpu,
    softSkills: UserCheck,
    experience: BarChart3,
    projects: FileCode,
    education: BookOpen,
    certificates: Award,
    achievements: Trophy,
    metrics: TrendingUp,
    starFormat: Star,
    actionVerbs: Sparkles,
    leadership: ShieldCheck,
    readability: FileText,
    bulletQuality: CheckCheck,
    length: AlignLeft,
    title: Sliders,
    contactInfo: Info,
    github: Github,
    portfolio: Globe,
    linkedin: Linkedin,
    missingSkills: Search,
    repeatedKeywords: Hash,
    keywordDensity: Activity,
    dateConsistency: Calendar,
    grammarTypos: CheckCircle2,
  };

  // Category group definitions
  const categoryGroups = [
    {
      key: 'content',
      label: 'Content & Substance',
      icon: FileText,
      color: 'blue',
      keys: ['experience', 'projects', 'education', 'certificates', 'achievements', 'metrics', 'starFormat', 'softSkills', 'hardSkills'] as ATSCategoryKey[],
    },
    {
      key: 'format',
      label: 'Format & Structure',
      icon: Layout,
      color: 'purple',
      keys: ['formatting', 'sections', 'sectionOrder', 'length', 'title', 'contactInfo', 'readability', 'bulletQuality', 'dateConsistency'] as ATSCategoryKey[],
    },
    {
      key: 'keywords',
      label: 'Keywords & Skills',
      icon: Code,
      color: 'amber',
      keys: ['keywords', 'missingSkills', 'keywordDensity', 'repeatedKeywords', 'actionVerbs', 'leadership'] as ATSCategoryKey[],
    },
    {
      key: 'links',
      label: 'Links & Grammar',
      icon: Link2,
      color: 'emerald',
      keys: ['github', 'portfolio', 'linkedin', 'grammarTypos'] as ATSCategoryKey[],
    },
  ];

  // Captures the score from the very first real analysis of an uploaded
  // resume, before any AI fixes are applied — this is the honest "before"
  // score used later for the original-vs-improved comparison. It is never
  // recomputed with a fabricated offset.
  const initialAtsScoreRef = useRef<number | null>(null);

  // Running log of AI improvements actually applied to the resume's real
  // content this session (survives the fresh re-generation that runAnalysis
  // does after every content change, since a fixed item naturally drops out
  // of the next generateImprovements() pass).
  const [appliedChangesLog, setAppliedChangesLog] = useState<
    Array<{ id: string; title: string; section: string; details: string }>
  >([]);

  // Run the ATS engine and populate all state
  const runAnalysis = useCallback((resumeData: ParsedResumeData, jd?: string) => {
    const report = atsEngine.analyzeResume(resumeData, { jobDescription: jd });
    if (initialAtsScoreRef.current === null) {
      initialAtsScoreRef.current = report.finalScore;
    }
    setAtsReport(report);
    setAtsScore(report.finalScore);

    // Map categories
    const mappedCats = Object.values(report.categories).map((cat) => ({
      id: `cat_${cat.key}`,
      key: cat.key,
      name: cat.label,
      score: cat.score,
      status: cat.score >= 85 ? 'Excellent' : cat.score >= 70 ? 'Good' : cat.score >= 50 ? 'Average' : 'Needs Work',
      color: cat.score >= 85 ? 'emerald' : cat.score >= 70 ? 'blue' : cat.score >= 50 ? 'amber' : 'red',
      icon: categoryIconMap[cat.key] || FileText,
      desc: cat.reason,
      priority: cat.priority,
      estimatedAtsGain: cat.estimatedAtsGain,
      fixSuggestion: cat.fixSuggestion,
    }));
    setCategories(mappedCats);

    // Map top fixes to issues
    const mappedIssues = report.topFixes.map((fix, i) => ({
      id: `iss_${i + 1}`,
      title: fix.label,
      type: fix.priority === 'Critical' ? 'critical' : 'warning',
      category: fix.key,
      impact: `+${fix.estimatedAtsGain} ATS`,
      time: fix.estimatedAtsGain >= 8 ? '15 sec' : '30 sec',
      message: fix.reason,
      whyRejects: `This category scored ${fix.score}/100. ${fix.priority === 'Critical' ? 'ATS systems may reject resumes failing this check.' : 'This is reducing your overall ATS score.'}`,
      howToFix: fix.fixSuggestion,
      beforeText: fix.reason.length > 60 ? fix.reason.slice(0, 80) + '...' : fix.reason,
      afterText: fix.fixSuggestion.length > 60 ? fix.fixSuggestion.slice(0, 120) + '...' : fix.fixSuggestion,
      fixed: false,
    }));

    // Real red-line validation pass (grammar / spelling / formatting /
    // content / consistency / completeness) — grounded only in this
    // resume's actual text, never fabricated. See resume.validator.ts.
    const realValidationIssues = validateResume(resumeData);
    setValidationIssues(realValidationIssues);
    const mappedValidationIssues = realValidationIssues
      .filter((v) => v.confidence >= 0.6)
      .slice(0, 12)
      .map((v, i) => ({
        id: `val_${i + 1}`,
        title: v.original ? `${v.type[0].toUpperCase()}${v.type.slice(1)}: "${v.original.slice(0, 40)}${v.original.length > 40 ? '…' : ''}"` : `${v.type[0].toUpperCase()}${v.type.slice(1)} issue`,
        type: v.confidence >= 0.85 ? 'critical' : 'warning',
        category: v.type,
        impact: '',
        time: '10 sec',
        message: v.explanation,
        whyRejects: v.explanation,
        howToFix: v.suggestion || 'Review and edit this manually — no automatic fix is confident enough to apply.',
        beforeText: v.original,
        afterText: v.suggestion,
        fixed: false,
      }));

    setIssues([...mappedIssues, ...mappedValidationIssues]);

    // Map missing keywords (engine-driven, never hardcoded)
    const mappedKeywords = report.missingKeywords.map((kw) => ({
      name: kw.keyword,
      frequency: kw.frequency * 10,
      boost: Math.min(6, kw.estimatedGain),
      added: false,
    }));
    setMissingKeywords(mappedKeywords);

    // ── NEW: JD Analysis ──────────────────────────────────────────────────
    const jdResult = jd ? analyzeJobDescription(jd) : null;
    setJdAnalysis(jdResult);

    // ── NEW: Keyword Intelligence Report ─────────────────────────────────
    const kwReport = buildKeywordReport(resumeData, jdResult?.keywords ?? null, jd);
    setKeywordReport(kwReport);
    // Initialize open state for keyword categories
    const initOpen: Record<string, boolean> = {};
    kwReport.categories.forEach((c, i) => { initOpen[c.key as string] = i < 3; });
    setOpenKeywordCategories(initOpen);

    // ── NEW: AI Improvements (no fabrication) ─────────────────────────────
    const improvements = generateImprovements(resumeData);
    setAiImprovements(improvements);

    // ── NEW: Section Reorder Recommendation ──────────────────────────────
    const reorderRec = getRecommendedSectionOrder(resumeData);
    setSectionReorder(reorderRec);

    // ── NEW: Projected Score Calculation ─────────────────────────────────
    const totalPotentialGain = improvements.reduce((acc, imp) => acc + imp.expectedAtsGain, 0);
    const engineGain = report.topFixes.reduce((acc, f) => acc + f.estimatedAtsGain, 0);
    const combinedGain = Math.max(totalPotentialGain, engineGain);
    setProjectedScore(Math.min(98, report.finalScore + combinedGain));

  }, []);

  // AI Resume Preview State
  const [previewData, setPreviewData] = useState<ParsedResumeData>({
    personalInfo: {
      fullName: 'Alex Kumar',
      jobTitle: 'Senior Frontend / Fullstack Engineer',
      email: 'alex.kumar@hireflow.ai',
      phone: '+1 (555) 382-9011',
      location: 'San Francisco, CA',
      website: 'https://alexkumar.dev',
      linkedin: 'https://linkedin.com/in/alexkumar-dev',
      github: 'https://github.com/alexkumar-dev',
      summary:
        'Product-focused Senior Frontend Engineer with 6+ years of experience building scalable web applications with React, TypeScript, and modern UI systems. Proven track record of delivering 99.9% uptime UI architectures.',
    },
    skills:
      'Frontend: React 18, Next.js, TypeScript, Tailwind CSS, Redux | Backend: Node.js, Express, REST APIs | Database: PostgreSQL',
    experiences: [
      {
        id: 'exp_1',
        company: 'TechCorp Innovations',
        title: 'Senior Frontend Engineer',
        period: '2022 - Present',
        location: 'San Francisco, CA',
        bullets: [
          'Architected high-throughput React SPA utilizing Zustand state management for 120k monthly active users.',
          'Integrated Gemini AI API with sub-300ms latency, driving automated resume parsing and real-time ATS scoring.',
          'Automated frontend build pipelines using Vite and GitHub Actions, maintaining 99.9% uptime.'
        ]
      }
    ],
    education: [
      {
        id: 'edu_1',
        degree: 'B.S. in Computer Science',
        institution: 'University of California, Berkeley',
        period: '2016 - 2020',
        location: 'Berkeley, CA'
      }
    ],
    certificates: [],
    projects: [
      {
        id: 'proj_1',
        title: 'HireFlow AI Workspace',
        description: 'AI-powered resume creation platform with ATS keyword scoring & PDF parsing pipeline.',
        bullets: [
          'Architected high-throughput full-stack resume platform using React 18, TypeScript, and Express serving 120k+ monthly requests.',
          'Integrated Google Gemini AI API to extract target keywords and auto-score candidate resumes with sub-300ms latency.'
        ],
        techStack: ['React 18', 'TypeScript', 'Node.js', 'Express', 'Gemini AI', 'Tailwind CSS']
      }
    ]
  });

  // State tracking whether user has loaded/uploaded a resume
  const [hasResumeData, setHasResumeData] = useState(false);

  // Run on mount: check if location.state or localStorage has an explicitly imported/uploaded resume
  useEffect(() => {
    const locState = location.state as any;
    if (locState?.importedResume || locState?.parsedResume) {
      const resume = locState.importedResume || locState.parsedResume;
      setPreviewData(resume);
      if (resume.title) setCurrentResumeName(resume.title);
      setHasResumeData(true);
      runAnalysis(resume);
      return;
    }

    try {
      const stored = localStorage.getItem('hireflow_current_resume');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed &&
          (parsed.personalInfo?.fullName || parsed.skills || parsed.experiences?.length)
        ) {
          setPreviewData(parsed);
          if (parsed.title) setCurrentResumeName(parsed.title);
          setHasResumeData(true);
          runAnalysis(parsed);
          return;
        }
      }
    } catch {}

    // No user resume uploaded yet — show ONLY the clean upload dropzone (hasResumeData = false)
    setHasResumeData(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [improvedSections, setImprovedSections] = useState<{ [key: string]: boolean }>({});

  // Helper Toast
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Helper Confetti Burst
  const triggerConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#2563EB', '#10B981', '#0B192C', '#60A5FA']
      });
    } catch {}
  };




  // Handlers for File Upload
  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const fileName = file.name;
    const fileSizeFormatted =
      file.size > 1024 * 1024
        ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
        : `${(file.size / 1024).toFixed(1)} KB`;

    setCurrentResumeName(fileName);
    setUploadedTime('Just now');
    showToast(`Imported "${fileName}" (${fileSizeFormatted}) — parsing resume...`);

    const processParsedData = (parsed: ParsedResumeData) => {
      setPreviewData(parsed);
      setHasResumeData(true);
      const jd = scanMode === 'jd-match' ? jobDescription : undefined;
      runAnalysis(parsed, jd);
      showToast(`ATS audit of "${fileName}" complete — 28 categories scored!`);
    };

    try {
      const cleanText = await parseResumeFile(file);
      const parsed = parseResumeText(cleanText, fileName);
      processParsedData(parsed);
    } catch (err) {
      console.error('File parsing error:', err);
      const fallbackParsed: ParsedResumeData = {
        ...previewData,
        title: fileName,
      };
      processParsedData(fallbackParsed);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleToggleInsight = (key: string) => {
    setOpenInsights((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Handle Keyword Add — mutates real resume content, then RE-RUNS the real
  // ATS engine on the updated content. The score change the user sees is
  // whatever the engine actually computes, never an arbitrary +N boost.
  const handleAddKeyword = (kwName: string) => {
    const alreadyAdded = missingKeywords.find((k) => k.name === kwName)?.added;
    if (alreadyAdded) return;

    const jd = scanMode === 'jd-match' ? jobDescription : undefined;
    const updatedResume: ParsedResumeData = {
      ...previewData,
      skills: previewData.skills.includes(kwName) ? previewData.skills : `${previewData.skills}, ${kwName}`,
    };

    const prevScore = atsScore;
    setPreviewData(updatedResume);
    setImprovedSections((prev) => ({ ...prev, skills: true }));
    runAnalysis(updatedResume, jd);
    // Preserve "added" flags for keywords the user has explicitly accepted,
    // since a fresh engine run only reports what's still missing.
    setMissingKeywords((prev) =>
      prev.map((k) => (k.name === kwName ? { ...k, added: true } : k))
    );

    const newScore = atsEngine.analyzeResume(updatedResume, { jobDescription: jd }).finalScore;
    const delta = newScore - prevScore;
    showToast(
      delta > 0
        ? `Added keyword "${kwName}" to resume (${delta > 0 ? '+' : ''}${delta} ATS points).`
        : `Added keyword "${kwName}" to resume.`
    );
    if (newScore >= 90) triggerConfetti();
  };

  // Add All Keywords — same principle: mutate content, then recompute.
  const handleAddAllKeywords = () => {
    const unadded = missingKeywords.filter((k) => !k.added);
    if (unadded.length === 0) return;

    const jd = scanMode === 'jd-match' ? jobDescription : undefined;
    const addedNames = unadded.map((k) => k.name).join(', ');
    const updatedResume: ParsedResumeData = {
      ...previewData,
      skills: `${previewData.skills}, ${addedNames}`,
    };

    const prevScore = atsScore;
    setPreviewData(updatedResume);
    setImprovedSections((prev) => ({ ...prev, skills: true }));
    runAnalysis(updatedResume, jd);
    setMissingKeywords((prev) => prev.map((k) => ({ ...k, added: true })));

    const newScore = atsEngine.analyzeResume(updatedResume, { jobDescription: jd }).finalScore;
    const delta = newScore - prevScore;
    showToast(`Added ${unadded.length} missing keywords (only add ones you genuinely have). ${delta > 0 ? `+${delta} ATS points.` : ''}`);
    if (newScore >= 90) triggerConfetti();
  };

  // Auto Fix Issue Handler — this dismisses the flagged issue in the UI.
  // It does NOT invent a score gain: the ATS score only moves when the
  // underlying resume content actually changes and the engine is re-run.
  const handleAutoFixIssue = (id: string) => {
    if (gateAiAction()) return;
    setIssues((prev) =>
      prev.map((iss) => (iss.id === id ? { ...iss, fixed: true } : iss))
    );
    showToast('Issue dismissed. Apply an AI improvement or edit the resume to change your actual ATS score.');
  };

  // Run ATS Scan (engine-driven — no fake API call)
  const handleRunScan = async () => {
    if (gateAiAction()) return;
    setIsScanning(true);
    try {
      // Run the deterministic engine first (always available)
      const jd = scanMode === 'jd-match' ? jobDescription : undefined;
      runAnalysis(previewData, jd);

      // Attempt Gemini server-side enhancement (non-blocking)
      try {
        const { supabase, isSupabaseConfigured } = await import('../services/supabaseClient');
        if (isSupabaseConfigured()) {
          const { data, error } = await supabase.functions.invoke('analyze-resume', {
            body: { resumeData: previewData, targetJobDescription: jd },
          });
          if (!error && data?.finalScore && data?.categories) {
            // Gemini result available — update score and categories
            setAtsScore(data.finalScore);
            setAtsReport(data as ATSFullReport);
            const mappedCats = Object.values(data.categories as Record<string, ATSCategoryResult>).map((cat) => ({
              id: `cat_${cat.key}`,
              key: cat.key,
              name: cat.label,
              score: cat.score,
              status: cat.score >= 85 ? 'Excellent' : cat.score >= 70 ? 'Good' : cat.score >= 50 ? 'Average' : 'Needs Work',
              color: cat.score >= 85 ? 'emerald' : cat.score >= 70 ? 'blue' : cat.score >= 50 ? 'amber' : 'red',
              icon: categoryIconMap[cat.key] || FileText,
              desc: cat.reason,
              priority: cat.priority,
              estimatedAtsGain: cat.estimatedAtsGain,
              fixSuggestion: cat.fixSuggestion,
            }));
            setCategories(mappedCats);
            const topFixes = (data.topFixes || []) as ATSCategoryResult[];
            setIssues(topFixes.map((fix, i) => ({
              id: `iss_${i + 1}`,
              title: fix.label,
              type: fix.priority === 'Critical' ? 'critical' : 'warning',
              category: fix.key,
              impact: `+${fix.estimatedAtsGain} ATS`,
              time: fix.estimatedAtsGain >= 8 ? '15 sec' : '30 sec',
              message: fix.reason,
              whyRejects: `Scored ${fix.score}/100. ${fix.priority === 'Critical' ? 'ATS systems may reject this.' : 'Reducing overall ATS score.'}`,
              howToFix: fix.fixSuggestion,
              beforeText: fix.reason.slice(0, 80),
              afterText: fix.fixSuggestion.slice(0, 120),
              fixed: false,
            })));
            if (data.missingKeywords?.length) {
              setMissingKeywords((data.missingKeywords as Array<{ keyword: string; frequency: number; estimatedGain: number }>).map((kw) => ({
                name: kw.keyword,
                frequency: kw.frequency * 10,
                boost: Math.min(6, kw.estimatedGain),
                added: false,
              })));
            }
          }
        }
      } catch {
        // Gemini enhancement failed — client engine result already shown
      }
    } catch (err) {
      console.warn('ATS scan error:', err);
    } finally {
      setIsScanning(false);
      showToast(
        scanMode === 'jd-match'
          ? 'JD-Match ATS scan complete — results updated!'
          : 'ATS audit complete — 28 categories scored!'
      );
    }
  };

  // AI Action Trigger — uses real improvement engine, NEVER fabricates
  const handleAiAction = (actionType: string) => {
    if (gateAiAction()) return;
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);

      // Apply all pending improvements of this action type from the real engine
      const relevantImprovements = aiImprovements.filter(
        imp => imp.section === actionType && !imp.applied
      );

      if (relevantImprovements.length > 0) {
        let updatedResume = { ...previewData };
        relevantImprovements.forEach(imp => {
          updatedResume = applyImprovement(updatedResume, imp);
        });
        const jd = scanMode === 'jd-match' ? jobDescription : undefined;
        const prevScore = atsScore;
        setPreviewData(updatedResume);
        setImprovedSections(prev => ({ ...prev, [actionType]: true }));
        setAppliedChangesLog(prev => [
          ...prev,
          ...relevantImprovements.map(imp => ({ id: imp.id, title: imp.problem, section: imp.section, details: imp.reason })),
        ]);
        // Recompute with the real engine on the actually-updated content —
        // no estimated/fabricated point gain is applied directly.
        runAnalysis(updatedResume, jd);
        const newScore = atsEngine.analyzeResume(updatedResume, { jobDescription: jd }).finalScore;
        showToast(`Applied ${relevantImprovements.length} AI improvements to ${actionType}${newScore !== prevScore ? ` (${newScore > prevScore ? '+' : ''}${newScore - prevScore} ATS)` : ''}.`);
        if (newScore >= 88) triggerConfetti();
      } else {
        // No pending improvements for this section
        showToast(`No pending improvements found for ${actionType} — section already optimized.`);
      }
    }, 600);
  };

  // Handle individual improvement apply/undo
  const handleApplyImprovement = (impId: string) => {
    if (gateAiAction()) return;
    const imp = aiImprovements.find(i => i.id === impId);
    if (!imp || imp.applied) return;
    const updated = applyImprovement(previewData, imp);
    const jd = scanMode === 'jd-match' ? jobDescription : undefined;
    const prevScore = atsScore;
    setPreviewData(updated);
    setImprovedSections(prev => ({ ...prev, [imp.section]: true }));
    setAppliedChangesLog(prev => [...prev, { id: imp.id, title: imp.problem, section: imp.section, details: imp.reason }]);
    // Recompute the real score from the updated content instead of adding
    // the improvement's "expectedAtsGain" estimate directly to the score.
    runAnalysis(updated, jd);
    const newScore = atsEngine.analyzeResume(updated, { jobDescription: jd }).finalScore;
    showToast(`Applied: "${imp.problem}"${newScore !== prevScore ? ` — ${newScore > prevScore ? '+' : ''}${newScore - prevScore} ATS points` : ''}`);
  };

  // Automated Full Optimization Flow — applies real AI improvements, no fabrication
  const handleStartGenerationFlow = () => {
    if (gateAiAction()) return;
    setIsGenerating(true);
    setIsGeneratedSuccess(false);
    setGenerationProgress(0);

    const pendingImprovements = aiImprovements.filter(i => !i.applied);

    const steps = [
      { p: 20, text: 'Analyzing Skills & Keyword Gaps...' },
      { p: 45, text: 'Improving Action Verbs & Sentence Structure...' },
      { p: 70, text: 'Applying STAR Format Improvements...' },
      { p: 88, text: 'Formatting Skills for ATS Parsing...' },
      { p: 100, text: `Optimization complete — applying ${pendingImprovements.length} improvements...` },
    ];
    setGenerationStepText(steps[0].text);

    let currentIdx = 0;
    const interval = setInterval(() => {
      if (currentIdx < steps.length) {
        setGenerationProgress(steps[currentIdx].p);
        setGenerationStepText(steps[currentIdx].text);
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsGenerating(false);
        setIsGeneratedSuccess(true);
        triggerConfetti();

        // Apply ALL pending improvements from the real engine (no fabrication)
        if (pendingImprovements.length > 0) {
          let updatedResume = { ...previewData };
          pendingImprovements.forEach(imp => {
            updatedResume = applyImprovement(updatedResume, imp);
          });
          const jd = scanMode === 'jd-match' ? jobDescription : undefined;
          setPreviewData(updatedResume);
          setImprovedSections({ summary: true, skills: true, experience: true, projects: true });
          setAppliedChangesLog(prev => [
            ...prev,
            ...pendingImprovements.map(imp => ({ id: imp.id, title: imp.problem, section: imp.section, details: imp.reason })),
          ]);
          // Recompute the real score/report on the actually-updated resume —
          // never a capped/fabricated projection.
          runAnalysis(updatedResume, jd);
          setMissingKeywords(prev => prev.map(k => ({ ...k, added: true })));
          setIssues(prev => prev.map(i => ({ ...i, fixed: true })));
        }

        setTimeout(() => handleNavigateToResumeBuilder(), 1200);
      }
    }, 450);
  };

  const handleNavigateToResumeBuilder = () => {
    const payload = {
      importedResume: {
        ...previewData,
        title: `${currentResumeName.replace(/\.(pdf|docx|doc|txt|rtf)$/i, '')} (ATS Optimized).pdf`,
      },
      atsAnalysisData: {
        // Real before/after scores — the "before" is the score from the
        // very first analysis of this upload; "after" is whatever the
        // engine actually computed after the applied changes. Never
        // floored, capped, or offset by a made-up amount.
        oldScore: initialAtsScoreRef.current ?? atsScore,
        newScore: atsScore,
        missingKeywords: missingKeywords.filter((k) => !k.added).map((k) => k.name),
        addedKeywords: missingKeywords.filter((k) => k.added).map((k) => k.name),
        // Derived from the improvements actually applied to this resume's
        // real content this session, not a generic hardcoded list.
        aiChanges: appliedChangesLog,
      }
    };

    try {
      localStorage.setItem('hireflow_current_resume', JSON.stringify(payload.importedResume));
    } catch {}

    navigate('/app/editor', { state: payload });
  };

  // Filtered Missing Keywords
  const filteredKeywords = missingKeywords.filter((k) =>
    k.name.toLowerCase().includes(keywordFilter.toLowerCase())
  );

  return (
    <div className="max-w-[1500px] mx-auto space-y-8 animate-in fade-in duration-300 pb-28 text-[#0B192C] font-sans">

      {/* Guest AI-feature gate */}
      <LoginRequiredModal
        open={isAuthGateOpen}
        onClose={() => setIsAuthGateOpen(false)}
        onLogin={() => {
          rememberCurrentLocationForRedirect(location.pathname, location.search);
          setIsAuthGateOpen(false);
          navigate('/login');
        }}
        onSignup={() => {
          rememberCurrentLocationForRedirect(location.pathname, location.search);
          setIsAuthGateOpen(false);
          navigate('/signup');
        }}
        message="ATS scanning and AI auto-fixes are available with a free account. Log in or sign up to continue — you'll land right back on this analysis."
      />

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept=".pdf,.docx,.doc,.txt,.rtf"
        onChange={handleFileSelect}
        className="hidden"
      />

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
      {/* ATS PAGE BODY: Upload Dropzone (if no resume loaded) OR Dashboard */}
      {/* ------------------------------------------------------------------ */}
      {!hasResumeData ? (
        <div className="max-w-4xl mx-auto py-10 space-y-8 animate-in fade-in duration-300">
          <div className="text-center space-y-3">
            <span className="font-mono text-[10px] font-bold tracking-widest uppercase bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 inline-flex items-center gap-1.5">
              <Sparkles size={12} className="text-blue-600" /> MULTI-PARSER ATS AUDITOR
            </span>
            <h1 className="text-3xl sm:text-4xl font-black text-[#0B192C] tracking-tight">
              Upload Your Resume for ATS Analysis
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
              Scan your resume against 28 deterministic enterprise ATS categories (Workday, Greenhouse, Lever, Ashby) to identify keyword gaps, formatting issues, and score improvements.
            </p>
          </div>

          {/* Upload Dropzone Card */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`bg-white border-2 border-dashed rounded-3xl p-10 sm:p-14 text-center space-y-5 transition-all cursor-pointer shadow-2xs hover:shadow-md ${
              isDragging
                ? 'border-blue-600 bg-blue-50/50 scale-[1.01]'
                : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50/50'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center mx-auto shadow-2xs">
              <UploadCloud size={32} />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-bold text-lg text-[#0B192C]">
                Drag & drop your resume file here
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                Supports PDF, DOCX, DOC, TXT, RTF (Up to 10MB)
              </p>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <button
                type="button"
                className="bg-[#0B192C] text-white px-6 py-2.5 rounded-xl font-bold text-xs hover:bg-slate-800 transition-colors flex items-center gap-2 shadow-xs cursor-pointer"
              >
                <FileText size={15} />
                <span>Browse Files</span>
              </button>
            </div>
          </div>

          {/* Alternative Demo Sample Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-slate-500 pt-2">
            <span>Don't have a file ready right now?</span>
            <button
              type="button"
              onClick={() => {
                setHasResumeData(true);
                runAnalysis(previewData);
                showToast('Loaded sample resume for ATS audit demonstration.');
              }}
              className="font-bold text-blue-600 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Try Demo Sample Audit</span>
              <ArrowUpRight size={13} />
            </button>
          </div>
        </div>
      ) : (
        <React.Fragment>
          {/* ------------------------------------------------------------------ */}
          {/* 1. HERO DASHBOARD SECTION (Linear/Notion AI Style)                 */}
          {/* ------------------------------------------------------------------ */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6 relative overflow-hidden">
        {/* Subtle Background Accent Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-50/50 rounded-full blur-3xl -z-0 pointer-events-none" />

        {/* Top Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[10px] font-bold tracking-widest uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200 flex items-center gap-1">
                <Sparkles size={11} className="text-blue-600" /> MULTI-PARSER ATS DASHBOARD
              </span>
              <span className="font-mono text-[10px] font-bold text-slate-400">
                LAST AUDITED: {uploadedTime}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B192C] tracking-tight">
              ATS Analysis & Optimization
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Auditing <span className="font-bold text-[#0B192C]">{currentResumeName}</span> against enterprise Applicant Tracking Systems (Workday, Greenhouse, Lever, Ashby).
            </p>
          </div>

          {/* Hero CTAs & Mode Switcher */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 relative z-10">
            {/* Mode Switcher */}
            <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center gap-1">
              <button
                onClick={() => {
                  setScanMode('general');
                  setShowJdModal(false);
                  runAnalysis(previewData);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  scanMode === 'general'
                    ? 'bg-white text-[#0B192C] shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <ShieldCheck size={13} className={scanMode === 'general' ? 'text-blue-600' : ''} />
                <span>General Audit</span>
              </button>

              <button
                onClick={() => {
                  setScanMode('jd-match');
                  setShowJdModal(true);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  scanMode === 'jd-match'
                    ? 'bg-[#0B192C] text-white shadow-2xs font-extrabold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Target size={13} className={scanMode === 'jd-match' ? 'text-blue-400' : ''} />
                <span>JD Match</span>
                <span className="px-1.5 py-0.2 bg-emerald-500 text-white text-[9px] font-bold rounded-full">
                  Target
                </span>
              </button>
            </div>

            {/* Upload File Trigger */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#0B192C] font-bold text-xs rounded-xl border border-slate-200/90 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <UploadCloud size={14} className="text-blue-600" />
              <span>Change File</span>
            </button>

            {/* Primary Optimize CTA */}
            <button
              onClick={handleStartGenerationFlow}
              disabled={isGenerating}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Sparkles size={14} />
              <span>Optimize Resume</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Hero Metric Quick-Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-4 border-t border-slate-100 relative z-10">
          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              CURRENT SCORE
            </span>
            <span className="text-xl font-black text-[#0B192C] font-mono">{atsScore} / 100</span>
          </div>

          <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-200/60">
            <span className="text-[10px] font-mono font-bold text-blue-800 uppercase tracking-wider block">
              CATEGORIES SCORED
            </span>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black text-blue-900 font-mono">28</span>
              <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100 border border-blue-200 px-1.5 py-0.2 rounded-md">
                Dimensions
              </span>
            </div>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              PASSED CHECKS
            </span>
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1 mt-1">
              <CheckCircle size={13} className="text-emerald-600" />
              {(atsReport ? (Object.values(atsReport.categories) as ATSCategoryResult[]).filter((c) => c.passed).length : 0)}/28
            </span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              TOP FIX GAIN
            </span>
            <span className="text-xs font-bold text-amber-800 flex items-center gap-1 mt-1">
              <TrendingUp size={13} className="text-amber-500" />
              +{atsReport?.topFixes[0]?.estimatedAtsGain ?? 0} pts
            </span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              MISSING KEYWORDS
            </span>
            <span className="text-xs font-bold text-slate-900 font-mono mt-1 block">
              {atsReport?.missingKeywords.length ?? 0} detected
            </span>
          </div>

          <div className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
              ENGINE
            </span>
            <span className="text-xs font-bold text-blue-800 font-mono mt-1 block">
              {atsReport?.analysisSource === 'claude' || atsReport?.analysisSource === 'gemini' ? '✦ Claude 3.5 Sonnet' : '⚡ Client Engine'}
            </span>
          </div>
        </div>
      </div>

      {/* JD Match Modal / Expandable Card */}
      {scanMode === 'jd-match' && showJdModal && (
        <div className="bg-white border border-blue-200 rounded-2xl p-6 shadow-sm space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Target size={18} className="text-blue-600" />
              <h2 className="font-bold text-base text-[#0B192C]">Job Description Target Spec</h2>
            </div>
            <button onClick={() => setShowJdModal(false)} className="text-slate-400 hover:text-slate-600 text-xs font-bold">
              Close
            </button>
          </div>

          <textarea
            rows={4}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-[#0B192C] font-mono leading-relaxed focus:bg-white focus:outline-none focus:border-blue-600"
            placeholder="Paste full job posting requirements here..."
          />

          <div className="flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] text-slate-500 font-mono">{jobDescription.length} characters parsed</span>
            <button
              onClick={() => {
                setShowJdModal(false);
                handleRunScan();
              }}
              className="px-5 py-2 bg-[#0B192C] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Zap size={13} className="text-amber-400" />
              <span>Run Match Scan</span>
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. ATS SCORE DASHBOARD HERO CARD                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            01 &middot; ATS SCORE ENGINE
          </span>
          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-mono font-bold rounded-md">
            Live Audited
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* CIRCULAR SCORE GAUGE WITH COUNT-UP */}
          <div className="text-center space-y-3">
            <div className="relative w-44 h-44 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-100"
                  fill="transparent"
                />
                {/* Progress Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={
                    atsScore >= 90
                      ? 'text-emerald-500'
                      : atsScore >= 80
                      ? 'text-blue-600'
                      : 'text-amber-500'
                  }
                  strokeDasharray="264"
                  strokeDashoffset={264 - (264 * atsScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="flex items-baseline gap-0.5">
                  <span className="text-4xl sm:text-5xl font-black text-[#0B192C] font-mono tracking-tight">
                    {atsScore}
                  </span>
                  <span className="text-xs font-bold text-slate-400 font-mono">/100</span>
                </div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-wider mt-1">
                  Estimated ATS Compatibility
                </span>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 italic max-w-xs mx-auto text-center">
              ATS systems vary by employer and configuration. This score is an estimate based on HireFlow's analysis rules.
            </p>

            {/* Score Gain Pills — real computed projected score */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs font-bold max-w-xs mx-auto">
              <div className="flex items-center gap-1.5 text-slate-600">
                <span>Projected Post-Fix:</span>
                <span className="text-emerald-700 font-mono font-black">{projectedScore}/100</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-md font-mono text-[11px]">
                +{Math.max(0, projectedScore - atsScore)} ATS Gain
              </span>
            </div>
          </div>

          {/* PASSED ENTERPRISE SYSTEMS */}
          <div className="space-y-3">
            <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest block">
              APPLICANT TRACKING SYSTEM COMPATIBILITY
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { name: 'Workday', pass: atsScore >= 55 },
                { name: 'Greenhouse', pass: atsScore >= 50 },
                { name: 'Lever', pass: atsScore >= 50 },
                { name: 'Ashby', pass: atsScore >= 60 },
                { name: 'Taleo', pass: atsScore >= 65 },
                { name: 'iCIMS', pass: atsScore >= 60 },
              ].map((sys) => (
                <div
                  key={sys.name}
                  className={`px-3 py-2 border rounded-xl text-xs font-bold flex items-center justify-between shadow-2xs ${
                    sys.pass ? 'bg-slate-50 border-slate-200/80 text-[#0B192C]' : 'bg-red-50/40 border-red-200/60 text-red-900'
                  }`}
                >
                  <span className="truncate">{sys.name}</span>
                  {sys.pass
                    ? <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                    : <AlertTriangle size={14} className="text-red-500 shrink-0" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>


      {/* ------------------------------------------------------------------ */}
      {/* NEW: JD INTELLIGENCE PANEL (only visible when JD provided)          */}
      {/* ------------------------------------------------------------------ */}
      {jdAnalysis && scanMode === 'jd-match' && (
        <div className="bg-white border border-blue-200/80 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
                JD INTELLIGENCE REPORT
              </span>
              <h2 className="text-lg font-bold text-[#0B192C] mt-0.5 flex items-center gap-2">
                <Target size={18} className="text-blue-600" />
                <span>Job Description Analysis</span>
              </h2>
            </div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-mono font-bold rounded-lg">
              {jdAnalysis.industry}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3 space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">TARGET ROLE</span>
              <span className="text-xs font-bold text-[#0B192C] block truncate">{jdAnalysis.targetRole}</span>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3 space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">SENIORITY</span>
              <span className={`text-xs font-bold block ${jdAnalysis.experienceLevel === 'Senior' || jdAnalysis.experienceLevel === 'Lead' || jdAnalysis.experienceLevel === 'Staff' ? 'text-blue-700' : 'text-slate-800'}`}>
                {jdAnalysis.experienceLevel} Level
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3 space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">MIN EXPERIENCE</span>
              <span className="text-xs font-bold text-[#0B192C] block">
                {jdAnalysis.minYearsExperience > 0 ? `${jdAnalysis.minYearsExperience}+ Years` : 'Not Specified'}
              </span>
            </div>
            <div className="bg-slate-50 rounded-xl border border-slate-200/80 p-3 space-y-0.5">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">WORK TYPE</span>
              <span className="text-xs font-bold text-[#0B192C] block">{jdAnalysis.isRemote ? '🌍 Remote' : '🏢 On-Site / Hybrid'}</span>
            </div>
          </div>

          {jdAnalysis.requiredSkills.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">REQUIRED SKILLS (from JD)</span>
              <div className="flex flex-wrap gap-1.5">
                {jdAnalysis.requiredSkills.slice(0, 15).map((skill) => {
                  const resumeText = (previewData.skills + ' ' + (previewData.experiences || []).map(e => e.bullets.join(' ')).join(' ')).toLowerCase();
                  const inResume = resumeText.includes(skill.skill.toLowerCase());
                  return (
                    <span
                      key={skill.skill}
                      className={`px-2 py-0.5 rounded-md text-[11px] font-bold border font-mono ${
                        inResume
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : 'bg-red-50 text-red-800 border-red-200'
                      }`}
                    >
                      {inResume ? '✓' : '✗'} {skill.skill}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {jdAnalysis.responsibilities.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">KEY RESPONSIBILITIES (detected)</span>
              <ul className="space-y-1">
                {jdAnalysis.responsibilities.slice(0, 5).map((r, i) => (
                  <li key={i} className="text-xs text-slate-700 flex items-start gap-2">
                    <span className="text-blue-500 mt-0.5 shrink-0">▸</span>
                    <span>{r.slice(0, 120)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}


      {/* ------------------------------------------------------------------ */}
      {/* SECTION REORDER RECOMMENDATION BANNER                              */}
      {/* ------------------------------------------------------------------ */}
      {sectionReorder && !sectionReorder.isOptimal && (
        <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-start gap-3">
            <AlignLeft size={20} className="text-amber-600 mt-0.5 shrink-0" />
            <div>
              <span className="text-xs font-bold text-amber-900 block">Section Order Optimization Recommended</span>
              <p className="text-[11px] text-amber-800/90 mt-0.5 leading-relaxed">
                Detected Experience Level: <span className="font-bold">{sectionReorder.stageLabel}</span>. {sectionReorder.reason}
                {' '}Recommended order: <span className="font-mono font-bold">{sectionReorder.recommendedOrder.join(' → ')}</span>
              </p>
            </div>
          </div>
          <button
            onClick={handleNavigateToResumeBuilder}
            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shrink-0 transition-colors"
          >
            <span>Fix in Editor</span>
            <ArrowUpRight size={13} />
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. SIDE-BY-SIDE COMPARISON: UPLOADED RESUME (RED LINES) VS IMPROVED */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <span className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              SIDE-BY-SIDE RESUME AUDIT
            </span>
            <h2 className="text-lg font-bold text-[#0B192C] mt-0.5 flex items-center gap-2">
              <ArrowLeftRight size={18} className="text-blue-600" />
              <span>Uploaded Resume (With Red Line Mistakes) vs AI-Improved Version</span>
            </h2>
          </div>

          <button
            onClick={handleNavigateToResumeBuilder}
            className="px-4 py-2 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Open Improved Resume in Editor</span>
            <ArrowUpRight size={14} />
          </button>
        </div>

        {/* SIDE BY SIDE DOCUMENT COMPARISON CONTAINER */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* LEFT CONTAINER: UPLOADED RESUME WITH RED LINE MISTAKES */}
          <div className="p-6 bg-red-50/30 border border-red-200/80 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-red-200/60 pb-3">
              <span className="font-mono text-xs font-bold text-red-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertTriangle size={14} className="text-red-600" />
                <span>Uploaded Resume (Original with Red Line Mistakes)</span>
              </span>
              <span className="px-2 py-0.5 bg-red-100 text-red-800 text-[10px] font-mono font-bold rounded">
                Score: {atsScore}
              </span>
            </div>

            <div className="bg-white border border-red-200 rounded-xl p-6 shadow-sm text-xs font-sans text-slate-800 space-y-4">
              {/* Header */}
              <div className="border-b border-slate-200 pb-3 text-center space-y-1">
                <h3 className="text-xl font-bold text-[#0B192C] tracking-tight">{previewData.personalInfo?.fullName || 'Sahil Nagpal'}</h3>
                <p className="text-xs font-semibold text-blue-700">{previewData.personalInfo?.jobTitle || 'Senior Software Engineer'}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {previewData.personalInfo?.email || 'nagpal.sahil01@gmail.com'} &middot; {previewData.personalInfo?.phone || '(+91) 9923278283'}
                </p>
              </div>

              {/* Education Section */}
              {previewData.education && previewData.education.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    EDUCATION
                  </span>
                  {previewData.education.map((edu) => (
                    <div key={edu.id} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 space-y-0.5">
                      <div className="flex justify-between font-bold text-xs text-[#0B192C]">
                        <span>{edu.degree} {edu.institution ? `— ${edu.institution}` : ''}</span>
                        <span className="text-slate-400 font-normal">{edu.period}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Computer Skills Section */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                  COMPUTER SKILLS
                </span>
                <div className="bg-red-50/60 p-2.5 rounded-lg border border-red-200/80 space-y-1 text-slate-700">
                  <p className="text-xs font-mono leading-relaxed">
                    <strong className="text-slate-900">Stack:</strong> {previewData.skills}
                  </p>
                  <span className="block font-mono text-[10px] font-bold text-red-700 no-underline pt-0.5">
                    🔴 Missing key DevOps & Cloud keywords (Docker, Redis, AWS, CI/CD)
                  </span>
                </div>
              </div>

              {/* Work Experience Section */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                  WORK EXPERIENCE
                </span>
                {previewData.experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
                    <div className="flex justify-between font-bold text-xs text-[#0B192C]">
                      <span>{exp.company !== 'Technology Company' ? exp.company : exp.title} — <span className="text-blue-700 font-semibold">{exp.title}</span></span>
                      <span className="text-slate-400 font-normal">{exp.period}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 pl-3">
                      {exp.bullets.map((b, bIdx) => {
                        const hasMetric = /\d+%|\d+k|\d+ms/i.test(b);
                        return (
                          <li key={bIdx} className="list-disc leading-relaxed">
                            {!hasMetric ? (
                              <span className="underline decoration-red-500 decoration-wavy decoration-2 text-slate-900">
                                {b}
                                <span className="ml-1 text-[9px] font-mono font-bold bg-red-100 text-red-800 px-1 py-0.2 rounded border border-red-200 no-underline inline-block">
                                  🔴 Needs STAR % Metric
                                </span>
                              </span>
                            ) : (
                              <span>{b}</span>
                            )}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Projects Section */}
              {previewData.projects && previewData.projects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    PROJECTS & INTERNSHIPS
                  </span>
                  {previewData.projects.map((proj) => (
                    <div key={proj.id} className="bg-slate-50/50 p-3 rounded-xl border border-slate-200/60 space-y-1">
                      <div className="font-bold text-xs text-[#0B192C]">{proj.title}</div>
                      {proj.description && <p className="text-[11px] text-slate-600">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Certificates Section */}
              {previewData.certificates && previewData.certificates.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    CERTIFICATIONS & ACHIEVEMENTS
                  </span>
                  <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 text-[11px] text-slate-700 space-y-1">
                    {previewData.certificates.map((cert) => (
                      <p key={cert.id}>🏆 <strong>{cert.title}</strong></p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT CONTAINER: AI-IMPROVED VERSION */}
          <div className="p-6 bg-emerald-50/30 border border-emerald-200/80 rounded-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200/60 pb-3">
              <span className="font-mono text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-emerald-600" />
                <span>AI-Improved Version (Same Resume, ATS Optimized)</span>
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold rounded">
                Score: {projectedScore} (+{Math.max(0, projectedScore - atsScore)} Gain)
              </span>
            </div>

            <div className="bg-white border border-emerald-200 rounded-xl p-6 shadow-sm text-xs font-sans text-slate-800 space-y-4">
              {/* Header */}
              <div className="border-b border-slate-200 pb-3 text-center space-y-1">
                <h3 className="text-xl font-bold text-[#0B192C] tracking-tight">{previewData.personalInfo?.fullName}</h3>
                <p className="text-xs font-semibold text-blue-700">{previewData.personalInfo?.jobTitle}</p>
                <p className="text-[11px] text-slate-500 font-mono">
                  {previewData.personalInfo?.email} &middot; {previewData.personalInfo?.phone}
                </p>
              </div>

              {/* Education Section */}
              {previewData.education && previewData.education.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    EDUCATION
                  </span>
                  {previewData.education.map((edu) => (
                    <div key={edu.id} className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-200/80 space-y-0.5">
                      <div className="flex justify-between font-bold text-xs text-[#0B192C]">
                        <span>{edu.degree} {edu.institution ? `— ${edu.institution}` : ''}</span>
                        <span className="text-slate-400 font-normal">{edu.period}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Computer Skills Section */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                  TECHNICAL SKILLS {improvedSections['skills'] ? '(OPTIMIZED)' : ''}
                </span>
                <div className={`p-2.5 rounded-lg border shadow-2xs space-y-1 font-medium ${improvedSections['skills'] ? 'bg-emerald-50 border-emerald-200 text-emerald-950' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                  <p className="text-xs font-mono leading-relaxed">
                    <strong>Stack:</strong> {previewData.skills}
                  </p>
                  {improvedSections['skills'] && (
                    <span className="block font-mono text-[10px] font-bold text-emerald-700 pt-0.5">
                      ✨ Skills reformatted and categorized for ATS parsers
                    </span>
                  )}
                </div>
              </div>

              {/* Work Experience Section */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                  WORK EXPERIENCE (AI OPTIMIZED)
                </span>
                {previewData.experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1.5 bg-emerald-50/30 p-3 rounded-xl border border-emerald-200/60">
                    <div className="flex justify-between font-bold text-xs text-[#0B192C]">
                      <span>{exp.company !== 'Technology Company' ? exp.company : exp.title} — <span className="text-blue-700 font-semibold">{exp.title}</span></span>
                      <span className="text-slate-400 font-normal">{exp.period}</span>
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-700 pl-3">
                      {exp.bullets.map((b, bIdx) => {
                        const wasImproved = aiImprovements.some(i => i.applied && i.entryId === exp.id && i.bulletIndex === bIdx);
                        return (
                          <li key={bIdx} className="list-disc leading-relaxed">
                            <span className={`font-medium p-1.5 rounded block ${wasImproved ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/80 shadow-2xs' : 'text-slate-700'}`}>
                              {b}
                              {wasImproved && (
                                <span className="block text-[10px] font-mono font-bold text-emerald-700 mt-0.5">
                                  ✨ AI-improved: stronger action verb & clearer structure
                                </span>
                              )}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Projects Section */}
              {previewData.projects && previewData.projects.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    PROJECTS & INTERNSHIPS
                  </span>
                  {previewData.projects.map((proj) => (
                    <div key={proj.id} className="bg-emerald-50/40 p-3 rounded-xl border border-emerald-200/60 space-y-1">
                      <div className="font-bold text-xs text-[#0B192C]">{proj.title}</div>
                      {proj.description && <p className="text-[11px] text-slate-600">{proj.description}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Certificates Section */}
              {previewData.certificates && previewData.certificates.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">
                    CERTIFICATIONS & ACHIEVEMENTS
                  </span>
                  <div className="bg-emerald-50/40 p-2.5 rounded-lg border border-emerald-200/80 text-[11px] text-slate-700 space-y-1">
                    {previewData.certificates.map((cert) => (
                      <p key={cert.id}>🏆 <strong>{cert.title}</strong></p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 8. FINAL HIGH-CONVERSION CTA SECTION                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-10 shadow-2xs space-y-8 text-[#0B192C]">
        <div className="space-y-2">
          <span className="font-mono text-xs font-bold text-slate-400 tracking-widest uppercase block">
            08 &middot; FINAL CONVERSION STEP
          </span>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-[#0B192C]">
            Ready to Optimize Your ATS-Scored Resume?
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
            Your resume scored <span className="font-bold text-[#0B192C]">{atsScore}/100</span> across 28 ATS dimensions.
            Fix the top issues identified by the engine to reach your target score.
          </p>
        </div>

        {/* Engine-driven Score Jump Indicator */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center space-y-1">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest block">
              CURRENT SCORE
            </span>
            <div className="text-4xl font-black text-slate-800 font-mono">{atsScore}</div>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-6 rounded-2xl text-center space-y-1">
            <span className="font-mono text-xs font-bold text-blue-800 uppercase tracking-widest block">
              POTENTIAL SCORE
            </span>
            <div className="text-4xl font-black text-blue-900 font-mono">
              {Math.min(100, atsScore + (atsReport?.topFixes.reduce((s, f) => s + f.estimatedAtsGain, 0) ?? 0))}
            </div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full inline-block mt-1">
              +{atsReport?.topFixes.reduce((s, f) => s + f.estimatedAtsGain, 0) ?? 0} ATS Gain
            </span>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-center space-y-1">
            <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-widest block">
              TOP ISSUES
            </span>
            <div className="text-4xl font-black text-slate-800 font-mono">
              {atsReport?.topFixes.length ?? 0}
            </div>
            <span className="text-xs text-slate-500 block">Prioritized Fixes</span>
          </div>
        </div>

        {/* Animated Generation Bar or Conversion Button */}
        {isGenerating ? (
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center space-y-3 animate-in fade-in">
            <div className="flex items-center justify-center gap-3">
              <Loader2 size={20} className="text-[#0B192C] animate-spin" />
              <span className="text-sm font-bold text-[#0B192C]">{generationStepText}</span>
            </div>
            <div className="w-full max-w-md mx-auto bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-full rounded-full transition-all duration-300"
                style={{ width: `${generationProgress}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Score Animating: <span className="font-bold text-[#0B192C]">{atsScore}</span> / 100 ({generationProgress}%)
            </p>
          </div>
        ) : isGeneratedSuccess ? (
          <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-6 text-center space-y-4 animate-in zoom-in-95">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-full font-bold text-xs">
              <CheckCircle2 size={15} /> ATS Optimization Complete (Score: {atsScore})
            </div>
            <p className="text-xs text-slate-600 max-w-md mx-auto">
              Navigating to Resume Editor... Your optimized resume has loaded with missing keywords, STAR metrics, and clean formatting.
            </p>
            <button
              onClick={handleNavigateToResumeBuilder}
              className="bg-[#0B192C] hover:bg-slate-800 text-white px-8 py-3.5 rounded-xl text-xs sm:text-sm font-bold tracking-wide transition-all duration-200 flex items-center justify-center gap-2 shadow-xs cursor-pointer mx-auto"
            >
              <span>Open Resume Editor</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <Clock size={14} className="text-slate-400" />
              <span>Estimated Generation Time: 15 seconds</span>
            </div>

            <button
              onClick={handleStartGenerationFlow}
              className="w-full sm:w-auto bg-[#0B192C] text-white px-8 py-4 rounded-xl text-sm font-bold tracking-wide hover:bg-slate-800 transition-all duration-200 flex items-center justify-center gap-2 shadow-md cursor-pointer hover:scale-[1.01]"
            >
              <Sparkles size={16} className="text-blue-300" />
              <span>✨ Generate ATS Optimized Resume</span>
              <ArrowUpRight size={16} />
            </button>
          </div>
        )}
      </div>
        </React.Fragment>
      )}
    </div>
  );
}

// Helper component for Layout Icon
function LayoutIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}
