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
}

/** Editor state -> payload for POST/PUT /api/v1/resumes */
export function toBackendPayload(state: EditorState) {
  const { firstName, lastName } = splitName(state.personalInfo.fullName);

  return {
    title: state.docTitle || 'Untitled Resume',
    templateName: state.selectedTemplate,
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
      summary: state.personalInfo.summary || '',
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
      },
    },
  };
}

/** Backend resume document -> editor state, for populating the editor on load */
export function fromBackendResume(doc: any): EditorState {
  const rd = doc?.resumeData || {};
  const personalInfo = rd.personalInfo || {};
  const meta = rd.meta || {};

  return {
    docTitle: doc?.title || 'Untitled Resume',
    targetRole: personalInfo.jobTitle || '',
    personalInfo: {
      fullName: [personalInfo.firstName, personalInfo.lastName].filter(Boolean).join(' '),
      jobTitle: personalInfo.jobTitle || '',
      email: personalInfo.email || '',
      phone: personalInfo.phone || '',
      location: personalInfo.location || '',
      website: personalInfo.website || '',
      github: personalInfo.github || '',
      linkedin: personalInfo.linkedin || '',
      summary: rd.summary || '',
    },
    experiences: (rd.experience || []).map((exp: any) => ({
      id: exp.id,
      title: exp.position || '',
      company: exp.company || '',
      period: joinPeriod(exp.startDate, exp.endDate),
      location: exp.location || '',
      bullets: exp.bullets || [],
    })),
    education: (rd.education || []).map((edu: any) => ({
      id: edu.id,
      degree: edu.degree || '',
      institution: edu.institution || '',
      period: joinPeriod(edu.startDate, edu.endDate),
      location: edu.location || '',
      gpa: edu.gpa || '',
      highlights: (edu.bullets || [])[0] || '',
    })),
    skills: (rd.skills || []).map((s: any) => s.name).filter(Boolean).join(', '),
    projects: (rd.projects || []).map((proj: any) => ({
      id: proj.id,
      title: proj.name || '',
      description: proj.description || '',
      techStack: proj.technologies || [],
      link: proj.link || '',
      demoUrl: proj.liveUrl || '',
      bullets: proj.bullets || [],
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
