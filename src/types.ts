export interface User {
  email: string;
  name?: string;
}

export interface SkillItem {
  id: string;
  iconName: string;
  title: string;
  description: string;
}

export interface ExperienceItem {
  id: string;
  title: string;
  company: string;
  period: string;
  location?: string;
  bullets: string[];
}

export interface EducationItem {
  id: string;
  degree: string;             // Degree / Field of Study (Required)
  institution: string;        // College / University (Required)
  startYear?: string;         // Start Year (Required)
  endYear?: string;           // End Year / Expected Graduation (Required)
  period: string;             // Formatted Year range
  location?: string;
  gpa?: string;               // GPA / Percentage (Optional)
  coursework?: string;        // Relevant Coursework (Optional)
  currentSem?: string;        // Builder/profile only
  highlights?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  period?: string;
  techStack: string[];
  link?: string;
  demoUrl?: string;
  liveUrl?: string;
  stars?: number;
  bullets: string[];
  projectType?: string;
  qualityScore?: number;
  topics?: string[];
  isFeatured?: boolean;
  isFork?: boolean;
  isPractice?: boolean;
  isArchived?: boolean;
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  description?: string;
  date?: string;
  issuer?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  description?: string;
  bullets?: string[];
}

export interface CustomSectionData {
  id: string;
  title: string;
  items: CustomSectionItem[];
}

export interface SectionNavItem {
  id: string;
  title: string;
  type: 'personal' | 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'certificates' | 'achievements' | 'styling' | 'custom';
  iconName?: string;
  num?: string;
  visible: boolean;
  isCustom?: boolean;
}

/**
 * Resume type the user explicitly chooses when creating a resume. Drives
 * default section ordering (see services/section.reorder.ts) — never
 * calculated from years-of-experience, always an explicit user choice.
 */
export type ResumeType = 'fresher' | 'experienced';

export interface ResumeStyling {
  fontFamily: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  backgroundColor: string;
  fontSize: string;
  lineHeight: string;
  sectionSpacing: string;
}

export interface ParsedResumeData {
  id?: string;
  title?: string;
  targetRole?: string;
  templateName?: string;
  /** Explicit resume type — 'fresher' or 'experienced'. See ResumeType. */
  resumeType?: ResumeType;
  resumeStyling?: ResumeStyling;
  importSource?: 'scratch' | 'upload' | 'github' | 'linkedin' | 'template';
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    github?: string;
    linkedin?: string;
    summary: string;
  };
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: string;
  projects: ProjectItem[];
  certificates: CertificateItem[];
  achievements?: AchievementItem[];
  customSections?: CustomSectionData[];
  sectionsOrder?: SectionNavItem[];
  atsScore?: number | null;
  meta?: Record<string, any>;
}

export interface UploadHistoryItem {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'docx';
  uploadedAt: string;
  status: 'Parsed' | 'Processing' | 'Failed';
  parsedResume: ParsedResumeData;
}

export interface ExtractedTechMetadata {
  languages: string[];
  frameworks: string[];
  libraries: string[];
  databases: string[];
  devops: string[];
  cloud: string[];
  apis: string[];
  testing: string[];
  buildTools: string[];
}

export interface SkillCategoryItem {
  id: string;
  name: string;
  category: 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'Cloud' | 'AI/ML' | 'Mobile' | 'Testing' | 'Tools';
  selected: boolean;
  sourceRepo?: string;
}

export interface GitHubRepoItem {
  id: string;
  name: string;
  description: string;
  stars: number;
  forks: number;
  language: string;
  topics: string[];
  updatedAt: string;
  url: string;
  homepage?: string | null;
  size?: number;
  isEmpty?: boolean;
  selected?: boolean;
  packageJsonDeps?: string[];
  readmeSnippet?: string;
  dependencyFiles?: string[];
  extractedTech?: ExtractedTechMetadata;
  generatedTitle?: string;
  generatedDescription?: string;
  generatedBullets?: string[];
  isFork?: boolean;
  isPractice?: boolean;
  isArchived?: boolean;
  defaultBranch?: string;
}

// ─── GitHub Import Pipeline Types ─────────────────────────────────────────────

export interface GitHubUserProfile {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  location?: string | null;
  blog?: string | null;
  website?: string | null;
  public_repos: number;
  followers: number;
  html_url: string;
}

export interface ExtractedSkill {
  name: string;
  sourceRepo: string;
  confidence: number;
  reason: string;
  isNew?: boolean;
  category?: string;
}

export interface ImportProgress {
  currentStep: number;
  totalSteps: number;
  stepLabel: string;
  percent: number;
  isComplete: boolean;
}

export interface GitHubTreeItem {
  path: string;
  mode: string;
  type: 'blob' | 'tree';
  sha: string;
  size?: number;
  url: string;
}

export interface WorkflowStep {
  step: string;
  title: string;
  description: string;
}

export interface CertificationItem {
  id: string;
  iconName: string;
  title: string;
  badge: string;
}

export interface ProjectTemplate {
  id: string;
  name: string;
  tag: string;
  description: string;
  variant: number;
}

// ─── ATS Scoring Engine Types ────────────────────────────────────────────────

export type ATSPriority = 'Critical' | 'High' | 'Medium' | 'Low';
export type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';

export interface ATSRuleResult {
  id: string;
  category: string;
  severity: RuleSeverity;
  passed: boolean;
  score: number;
  maxScore: number;
  message: string;
  recommendation: string | null;
}

export type ATSCategoryKey =
  | 'formatting'
  | 'sections'
  | 'sectionOrder'
  | 'keywords'
  | 'hardSkills'
  | 'softSkills'
  | 'experience'
  | 'projects'
  | 'education'
  | 'certificates'
  | 'achievements'
  | 'metrics'
  | 'starFormat'
  | 'actionVerbs'
  | 'leadership'
  | 'readability'
  | 'bulletQuality'
  | 'length'
  | 'title'
  | 'contactInfo'
  | 'github'
  | 'portfolio'
  | 'linkedin'
  | 'missingSkills'
  | 'repeatedKeywords'
  | 'keywordDensity'
  | 'dateConsistency'
  | 'grammarTypos';

export interface ATSCategoryResult {
  /** Category key matching atsRules.json scoringWeights */
  key: ATSCategoryKey;
  /** Human-readable category name */
  label: string;
  /** Score 0–100 for this category */
  score: number;
  /** Points earned for rules in this category */
  pointsEarned?: number;
  /** Maximum points available in this category */
  pointsMax?: number;
  /** Explanation of why this score was given (grounded in resume content) */
  reason: string;
  /** Specific, actionable improvement suggestion (no invented content) */
  fixSuggestion: string;
  /** Priority level determining fix urgency */
  priority: ATSPriority;
  /** Estimated overall ATS score gain if this category is fixed */
  estimatedAtsGain: number;
  /** Whether this passed the minimum threshold */
  passed: boolean;
  /** Specific sub-rules evaluated under this category */
  rules?: ATSRuleResult[];
}

export interface JDMatchBreakdown {
  keywordMatch: number;      // 0–100%
  skillMatch: number;        // 0–100%
  jobTitleMatch: number;     // 0–100%
  responsibilityMatch: number; // 0–100%
  technologyMatch: number;   // 0–100%
  experienceMatch: number;   // 0–100%
  educationMatch: number;    // 0–100%
  semanticRelevance: number; // 0–100%
  overallJdMatchScore: number; // 0–100% (Separate from General ATS score!)
}

export interface CategorizedMissingKeyword {
  keyword: string;
  category: string;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  found: boolean;
  recommended: boolean;
  frequency: number;
  estimatedGain: number;
}

export interface ATSFullReport {
  /** Final weighted deterministic score 0–100 */
  finalScore: number;
  /** General ATS Compatibility label */
  scoreLabel: string;
  /** Per-category breakdown */
  categories: Record<ATSCategoryKey, ATSCategoryResult>;
  /** The 8 standard categories evaluated by the ATS engine */
  standardCategories?: ATSCategoryResult[];
  /** Complete list of rule results evaluated by deterministic engine */
  ruleResults: ATSRuleResult[];
  /** Breakdown of points: totalEarned and totalMax */
  scoringBreakdown: {
    totalPointsEarned: number;
    totalMaxPoints: number;
  };
  /** Keywords present in job description but absent from resume */
  missingKeywords: Array<{ keyword: string; category?: string; importance?: string; found?: boolean; recommended?: boolean; frequency: number; estimatedGain: number }>;
  /** Detailed missing keywords list by category */
  categorizedMissingKeywords?: CategorizedMissingKeyword[];
  /** Keywords repeated excessively in the resume */
  repeatedKeywords: Array<{ keyword: string; count: number }>;
  /** Top 5 fixes sorted by estimatedAtsGain descending */
  topFixes: ATSCategoryResult[];
  /** JD Match breakdown if JD is provided (Kept SEPARATE from General ATS Compatibility) */
  jdMatchBreakdown?: JDMatchBreakdown;
  /** Whether analysis came from client engine, Claude AI, or Gemini AI */
  analysisSource: 'client' | 'claude' | 'gemini';
  /** ISO timestamp of analysis */
  analyzedAt: string;
}

// ─── Tailored Resume & Version Management Types ─────────────────────────────

export type SuggestionStatus = 'pending' | 'preview' | 'applied' | 'rejected';
export type SemanticConfidence = 'Strong Match' | 'Partial Match' | 'Weak Match' | 'No Match';

export interface TailoringSuggestion {
  id: string;
  section: 'summary' | 'experience' | 'projects' | 'skills';
  entryId?: string;
  bulletIndex?: number;
  type: 'action_verb' | 'star_structure' | 'jd_alignment' | 'skill_highlight' | 'section_reorder' | 'clarity';
  originalText: string;
  suggestedText: string;
  reason: string;
  impactScoreGain?: number;
  status: SuggestionStatus;
}

export interface TailoredResumeVersion {
  id: string;
  originalResumeId: string;
  title: string;
  targetCompany: string;
  targetRole: string;
  jobDescriptionText: string;
  generalAtsScore: number;
  jdMatchScore: number;
  jdMatchBreakdown?: JDMatchBreakdown;
  parsedResume: ParsedResumeData;
  suggestions: TailoringSuggestion[];
  appliedSuggestionIds: string[];
  createdAt: string;
  updatedAt: string;
  isOriginal?: boolean;
}


