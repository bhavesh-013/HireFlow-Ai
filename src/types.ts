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
  type: 'personal' | 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'certificates' | 'achievements' | 'styling' | 'custom' | string;
  iconName?: string;
  num?: string;
  order?: number;
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


// ─── ATS Analysis Types (Unified) ────────────────────────────────────────────────

export interface ATSRecommendation {
  text: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ATSResult {
  overallScore: number;
  breakdown: {
    keywords: number;
    skills: number;
    experience: number;
    projects: number;
    education: number;
    structure: number;
    formatting: number;
  };
  matchedKeywords: string[];
  missingKeywords: {
    keyword: string;
    importance: 'High' | 'Medium' | 'Low';
    reason: string;
    recommendedLocation?: string;
  }[];
  matchedSkills: string[];
  missingSkills: {
    skill: string;
    required: boolean;
  }[];
  sectionIssues: string[];
  formattingIssues: string[];
  recommendations: ATSRecommendation[];
}
