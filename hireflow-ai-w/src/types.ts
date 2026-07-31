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
  degree: string;
  institution: string;
  period: string;
  location?: string;
  gpa?: string;
  highlights?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  link?: string;
  stars?: number;
  bullets: string[];
}

export interface CertificateItem {
  id: string;
  title: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface ParsedResumeData {
  id?: string;
  title?: string;
  targetRole?: string;
  templateName?: string;
  importSource?: 'scratch' | 'upload' | 'github' | 'linkedin' | 'template';
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    website: string;
    github?: string;
    linkedin?: string;
    summary: string;
  };
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: string;
  projects: ProjectItem[];
  certificates: CertificateItem[];
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
  selected?: boolean;
  packageJsonDeps?: string[];
  readmeSnippet?: string;
  dependencyFiles?: string[];
  extractedTech?: ExtractedTechMetadata;
  generatedTitle?: string;
  generatedDescription?: string;
  generatedBullets?: string[];
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

