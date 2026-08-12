import { getStoredUser } from '../../lib/api';
import type { ParsedResumeData, ResumeType } from '../../types';

/**
 * The small, template-agnostic slice of resume data every preview
 * component renders. Templates never invent or duplicate this data —
 * they all receive the exact same object and only change how it looks.
 */
export interface PreviewResumeData {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  github?: string;
  linkedin?: string;
  website?: string;
  summary: string;
  education: { degree: string; institution: string; period: string }[];
  skills: string[];
  projects: { title: string; bullets: string[] }[];
  experience: { title: string; company: string; period: string; bullets: string[] }[];
  achievements?: { title: string; description?: string }[];
  certificates?: { title: string; issuer: string; date: string }[];
  resumeType: ResumeType;
}

const NEUTRAL_PLACEHOLDER: PreviewResumeData = {
  fullName: 'YOUR NAME',
  jobTitle: 'Professional Title',
  email: 'email@example.com',
  phone: '(000) 000-0000',
  location: 'City, Country',
  summary:
    'A concise, results-oriented summary of your professional background, key strengths, and what you bring to the role.',
  education: [{ degree: 'Degree, Field of Study', institution: 'Institution Name', period: '20XX – 20XX' }],
  skills: ['Skill One', 'Skill Two', 'Skill Three', 'Skill Four'],
  projects: [{ title: 'Project Name', bullets: ['Brief description of the project and your contribution.'] }],
  experience: [{ title: 'Job Title', company: 'Company Name', period: '20XX – Present', bullets: ['Key responsibility or achievement.'] }],
  resumeType: 'experienced',
};

/**
 * Builds the resume snapshot used to render template previews. If the
 * user has an in-progress resume (same localStorage key the Editor reads
 * from) or a logged-in profile, that real data is used. Otherwise falls
 * back to neutral placeholder copy — never a fabricated identity.
 */
export function getPreviewResumeData(): PreviewResumeData {
  let draft: ParsedResumeData | null = null;
  try {
    const raw = localStorage.getItem('hireflow_current_resume');
    draft = raw ? (JSON.parse(raw) as ParsedResumeData) : null;
  } catch {
    draft = null;
  }

  const user = getStoredUser();

  if (!draft && !user) return NEUTRAL_PLACEHOLDER;

  const fullName = draft?.personalInfo?.fullName || user?.full_name || user?.name || NEUTRAL_PLACEHOLDER.fullName;
  const jobTitle = draft?.personalInfo?.jobTitle || NEUTRAL_PLACEHOLDER.jobTitle;
  const email = draft?.personalInfo?.email || user?.email || NEUTRAL_PLACEHOLDER.email;
  const phone = draft?.personalInfo?.phone || NEUTRAL_PLACEHOLDER.phone;
  const location = draft?.personalInfo?.location || NEUTRAL_PLACEHOLDER.location;
  const github = draft?.personalInfo?.github;
  const linkedin = draft?.personalInfo?.linkedin;
  const website = draft?.personalInfo?.website;
  const summary = draft?.personalInfo?.summary || NEUTRAL_PLACEHOLDER.summary;

  const education = draft?.education?.length
    ? draft.education.map((e) => ({ degree: e.degree, institution: e.institution, period: e.period }))
    : NEUTRAL_PLACEHOLDER.education;

  const skills = draft?.skills
    ? draft.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : NEUTRAL_PLACEHOLDER.skills;

  const projects = draft?.projects?.length
    ? draft.projects.map((p) => ({ title: p.title, bullets: p.bullets?.length ? p.bullets : [p.description].filter(Boolean) as string[] }))
    : NEUTRAL_PLACEHOLDER.projects;

  const experience = draft?.experiences?.length
    ? draft.experiences.map((e) => ({ title: e.title, company: e.company, period: e.period, bullets: e.bullets || [] }))
    : NEUTRAL_PLACEHOLDER.experience;

  const achievements = draft?.achievements?.length
    ? draft.achievements.map((a) => ({ title: a.title, description: a.description }))
    : undefined;

  const certificates = draft?.certificates?.length
    ? draft.certificates.map((c) => ({ title: c.title, issuer: c.issuer, date: c.date }))
    : undefined;

  return {
    fullName,
    jobTitle,
    email,
    phone,
    location,
    github,
    linkedin,
    website,
    summary,
    education,
    skills,
    projects,
    experience,
    achievements,
    certificates,
    resumeType: draft?.resumeType || 'experienced',
  };
}
