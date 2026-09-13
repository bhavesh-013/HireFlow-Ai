/**
 * Maps between the frontend editor's flat data shapes (ParsedResumeData,
 * ExperienceItem, etc. — see src/types.ts) and the Supabase resume_sections
 * storage format.
 *
 * The editor uses convenient flat shapes (e.g. a single "period" string like
 * "2023 - Present", skills as a comma-separated string) while Supabase stores
 * normalized JSONB content per section. These functions handle best-effort,
 * lossless-where-possible conversion in both directions.
 */
import { ParsedResumeData, ExperienceItem, EducationItem, ProjectItem, CertificateItem, AchievementItem, SectionNavItem, CustomSectionData, ResumeType, ResumeStyling } from '../types';

function splitPeriod(period: string): { startDate: string; endDate: string } {
  if (!period) return { startDate: '', endDate: '' };
  const parts = period.split(/[-–—]/).map((p) => p.trim());
  if (parts.length >= 2) {
    return { startDate: parts[0], endDate: parts.slice(1).join(' - ') };
  }
  return { startDate: period, endDate: '' };
}

function joinPeriod(startDate?: string, endDate?: string): string {
  if (startDate && endDate) return `${startDate} - ${endDate}`;
  return startDate || endDate || '';
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = (fullName || '').trim();
  if (!trimmed) return { firstName: '', lastName: '' };
  const [firstName, ...rest] = trimmed.split(' ');
  return { firstName, lastName: rest.join(' ') };
}

export function extractSummaryText(value: any): string {
  if (typeof value === 'string') return value;
  if (!value || typeof value !== 'object') return '';
  let current = value;
  while (current && typeof current === 'object') {
    if (typeof current.summary === 'string') return current.summary;
    if (typeof current.content === 'string') return current.content;
    if (typeof current.text === 'string') return current.text;
    if (current.summary && typeof current.summary === 'object') {
      current = current.summary;
    } else if (current.content && typeof current.content === 'object') {
      current = current.content;
    } else {
      break;
    }
  }
  return '';
}

export function normalizeBullets(bullets: any): string[] {
  if (!bullets) return [];
  if (typeof bullets === 'string') {
    return bullets.split('\n').map((b) => b.trim()).filter(Boolean);
  }
  if (!Array.isArray(bullets)) return [];
  return bullets
    .map((b) => {
      if (typeof b === 'string') return b;
      if (b && typeof b === 'object') {
        if (typeof b.text === 'string') return b.text;
        if (typeof b.content === 'string') return b.content;
        if (typeof b.bullet === 'string') return b.bullet;
      }
      return '';
    })
    .filter(Boolean);
}

export function normalizeSkills(skills: any): string {
  if (typeof skills === 'string') return skills;
  if (Array.isArray(skills)) {
    return skills
      .map((s: any) => (typeof s === 'string' ? s : s?.name || ''))
      .filter(Boolean)
      .join(', ');
  }
  if (skills && typeof skills === 'object') {
    if (Array.isArray(skills.items)) {
      return skills.items
        .map((s: any) => (typeof s === 'string' ? s : s?.name || ''))
        .filter(Boolean)
        .join(', ');
    }
  }
  return '';
}

export interface EditorState {
  docTitle: string;
  targetRole: string;
  personalInfo: ParsedResumeData['personalInfo'];
  experiences: ExperienceItem[];
  education: EducationItem[];
  skills: string;
  projects: ProjectItem[];
  certificates: CertificateItem[];
  achievements?: AchievementItem[];
  resumeType?: ResumeType;
  sections?: SectionNavItem[];
  customSections?: CustomSectionData[];
  selectedTemplate?: string;
  resumeStyling?: ResumeStyling;
  atsScore?: number | null;
  structureScore?: number | null;
}

/** Editor state -> payload for POST/PUT /api/v1/resumes */
export function toBackendPayload(state: EditorState) {
  const { firstName, lastName } = splitName(state.personalInfo.fullName);
  const atsScore = typeof state.atsScore === 'number' ? state.atsScore : null;
  const structureScore = typeof state.structureScore === 'number' ? state.structureScore : null;
  const cleanSummary = extractSummaryText(state.personalInfo?.summary);

  return {
    title: state.docTitle || 'Untitled Resume',
    templateName: state.selectedTemplate,
    ats_score: atsScore,
    atsScore,
    structure_score: structureScore,
    resumeData: {
      personalInfo: {
        firstName,
        lastName,
        email: state.personalInfo.email || '',
        phone: state.personalInfo.phone || '',
        location: state.personalInfo.location || '',
        jobTitle: state.personalInfo.jobTitle || '',
        website: state.personalInfo.website || '',
        linkedin: state.personalInfo.linkedin || '',
        github: state.personalInfo.github || '',
      },
      summary: cleanSummary,
      experience: state.experiences.map((exp) => ({
        id: exp.id,
        company: exp.company,
        position: exp.title,
        location: exp.location || '',
        ...splitPeriod(exp.period),
        current: /present/i.test(exp.period || ''),
        bullets: exp.bullets || [],
      })),
      education: state.education.map((edu) => ({
        id: edu.id,
        institution: edu.institution,
        degree: edu.degree,
        location: edu.location || '',
        ...splitPeriod(edu.period),
        gpa: edu.gpa || '',
        currentSem: edu.currentSem || '',
        bullets: edu.highlights ? [edu.highlights] : [],
      })),
      projects: state.projects.map((proj) => ({
        id: proj.id,
        name: proj.title,
        description: proj.description,
        link: proj.link || '',
        liveUrl: proj.demoUrl || '',
        technologies: proj.techStack || [],
        bullets: proj.bullets || [],
      })),
      skills: (state.skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
        .map((name, idx) => ({
          id: `skill-${idx}`,
          category: 'General',
          name,
          level: 'Intermediate',
        })),
      certifications: state.certificates.map((cert) => ({
        id: cert.id,
        name: cert.title,
        issuer: cert.issuer,
        date: cert.date,
        url: cert.link || '',
      })),
      achievements: (state.achievements || []).map((ach) => ({
        id: ach.id,
        title: ach.title,
        description: ach.description || '',
        date: ach.date || '',
        issuer: ach.issuer || '',
      })),
      // Layout/meta — resume type, section order, custom sections and
      // styling, stored alongside content so autosave persists the whole
      // editor state, not just resume text (see resume.service.ts, which
      // writes this to a 'meta' resume_sections row).
      meta: {
        resumeType: state.resumeType || 'experienced',
        sections: state.sections || [],
        customSections: state.customSections || [],
        resumeStyling: state.resumeStyling || null,
        atsScore,
        structureScore,
      },
    },
  };
}

/** Backend resume document -> editor state, for populating the editor on load */
export function fromBackendResume(doc: any): EditorState {
  const rd = doc?.resumeData || {};
  const personalInfo = rd.personalInfo || {};
  const meta = rd.meta || {};

  const atsScore =
    typeof doc?.ats_score === 'number'
      ? doc.ats_score
      : typeof doc?.atsScore === 'number'
      ? doc.atsScore
      : typeof meta.atsScore === 'number'
      ? meta.atsScore
      : null;

  const structureScore =
    typeof doc?.structure_score === 'number'
      ? doc.structure_score
      : typeof meta.structureScore === 'number'
      ? meta.structureScore
      : null;

  const cleanSummary =
    extractSummaryText(personalInfo.summary) ||
    extractSummaryText(rd.summary) ||
    '';

  return {
    docTitle: doc?.title || 'Untitled Resume',
    targetRole: personalInfo.jobTitle || '',
    atsScore,
    structureScore,
    personalInfo: {
      fullName: [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(' '),
      jobTitle: typeof personalInfo.jobTitle === 'string' ? personalInfo.jobTitle : '',
      email: typeof personalInfo.email === 'string' ? personalInfo.email : '',
      phone: typeof personalInfo.phone === 'string' ? personalInfo.phone : '',
      location: typeof personalInfo.location === 'string' ? personalInfo.location : '',
      website: typeof personalInfo.website === 'string' ? personalInfo.website : '',
      github: typeof personalInfo.github === 'string' ? personalInfo.github : '',
      linkedin: typeof personalInfo.linkedin === 'string' ? personalInfo.linkedin : '',
      summary: cleanSummary,
    },
    experiences: (rd.experience || []).map((exp: any) => ({
      id: exp.id || `exp_${Math.random().toString(36).substring(2, 9)}`,
      title: exp.position || exp.title || '',
      company: exp.company || '',
      period: joinPeriod(exp.startDate, exp.endDate) || exp.period || '',
      location: exp.location || '',
      bullets: normalizeBullets(exp.bullets),
    })),
    education: (rd.education || []).map((edu: any) => ({
      id: edu.id || `edu_${Math.random().toString(36).substring(2, 9)}`,
      degree: edu.degree || '',
      institution: edu.institution || '',
      period: joinPeriod(edu.startDate, edu.endDate) || edu.period || '',
      location: edu.location || '',
      gpa: edu.gpa || '',
      currentSem: edu.currentSem || '',
      highlights: (edu.bullets || [])[0] || edu.highlights || '',
    })),
    skills: normalizeSkills(rd.skills),
    projects: (rd.projects || []).map((proj: any) => ({
      id: proj.id || `proj_${Math.random().toString(36).substring(2, 9)}`,
      title: proj.name || proj.title || '',
      description: typeof proj.description === 'string' ? proj.description : '',
      techStack: Array.isArray(proj.technologies)
        ? proj.technologies
        : Array.isArray(proj.techStack)
        ? proj.techStack
        : [],
      link: proj.link || '',
      demoUrl: proj.liveUrl || proj.demoUrl || '',
      bullets: normalizeBullets(proj.bullets),
    })),
    certificates: (rd.certifications || []).map((cert: any) => ({
      id: cert.id,
      title: cert.name || '',
      issuer: cert.issuer || '',
      date: cert.date || '',
      link: cert.url || '',
    })),
    achievements: (rd.achievements || []).map((ach: any) => ({
      id: ach.id,
      title: ach.title || '',
      description: ach.description || '',
      date: ach.date || '',
      issuer: ach.issuer || '',
    })),
    resumeType: (meta.resumeType === 'fresher' ? 'fresher' : 'experienced') as ResumeType,
    sections: Array.isArray(meta.sections) && meta.sections.length > 0 ? meta.sections : undefined,
    customSections: Array.isArray(meta.customSections) ? meta.customSections : [],
    selectedTemplate: doc?.templateName || undefined,
    resumeStyling: meta.resumeStyling || undefined,
  };
}
