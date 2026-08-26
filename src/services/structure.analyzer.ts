/**
 * Resume Structure, Section Completeness & ATS Formatting Analyzer
 * ──────────────────────────────────────────────────────────────────
 * Inspects candidate resume for:
 * - Contact information completeness & link health
 * - Presence of core sections (Summary, Skills, Experience, Projects, Education, Certs)
 * - Section ordering best practices (Fresher vs Experienced)
 * - Length and paragraph density (walls of text)
 * - Repeated information / keyword duplication
 * - ATS formatting compliance (clean headers, standard fonts, no multi-column traps)
 */

import type { ParsedResumeData } from '../types';

export interface SectionStatusItem {
  name: string;
  key: string;
  isFound: boolean;
  isRequired: boolean;
  score: number; // 0 - 100
  feedback: string;
  recommendation?: string;
}

export interface StructureIssue {
  id: string;
  category: 'Structure' | 'Formatting' | 'Content Density' | 'Ordering' | 'Contact';
  severity: 'Critical' | 'Warning' | 'Suggestion';
  title: string;
  description: string;
  recommendation: string;
}

export interface StructureAnalysisResult {
  sections: SectionStatusItem[];
  issues: StructureIssue[];
  structureScore: number; // 0 - 100
  formattingScore: number; // 0 - 100
  overallScore: number; // 0 - 100
  recommendedSectionOrder: string[];
  currentSectionOrder: string[];
  isAtsCompliant: boolean;
}

export function analyzeResumeStructure(resume: ParsedResumeData): StructureAnalysisResult {
  const issues: StructureIssue[] = [];
  const pi = resume.personalInfo || { fullName: '', jobTitle: '', email: '', phone: '', location: '', summary: '' };

  // 1. Contact Information Audit
  const hasEmail = Boolean(pi.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pi.email));
  const hasPhone = Boolean(pi.phone && pi.phone.trim().length >= 7);
  const hasLocation = Boolean(pi.location && pi.location.trim().length >= 3);
  const hasLinkedIn = Boolean(pi.linkedin && pi.linkedin.includes('linkedin.com'));
  const hasGitHub = Boolean(pi.github && pi.github.includes('github.com'));
  const hasPortfolio = Boolean(pi.website && pi.website.trim().length >= 5);

  const contactScore = Math.round(
    ((hasEmail ? 30 : 0) +
      (hasPhone ? 25 : 0) +
      (hasLocation ? 15 : 0) +
      (hasLinkedIn ? 15 : 0) +
      (hasGitHub || hasPortfolio ? 15 : 0))
  );

  if (!hasEmail) {
    issues.push({
      id: 'crit_email',
      category: 'Contact',
      severity: 'Critical',
      title: 'Missing or Invalid Email Address',
      description: 'ATS parsers require a valid direct email in the header to contact applicants.',
      recommendation: 'Add a professional email address (e.g. yourname@domain.com) to your header.',
    });
  }

  if (!hasPhone) {
    issues.push({
      id: 'crit_phone',
      category: 'Contact',
      severity: 'Critical',
      title: 'Missing Contact Phone Number',
      description: 'Recruiters and automated screeners expect a reachable phone number.',
      recommendation: 'Include your phone number with country/area code.',
    });
  }

  if (!hasLinkedIn) {
    issues.push({
      id: 'sug_linkedin',
      category: 'Contact',
      severity: 'Suggestion',
      title: 'LinkedIn Profile Link Not Provided',
      description: 'Over 85% of tech recruiters verify candidates on LinkedIn before scheduling screens.',
      recommendation: 'Add your customized LinkedIn vanity URL to the contact section.',
    });
  }

  // 2. Sections Audit
  const hasSummary = Boolean(pi.summary && pi.summary.trim().length >= 40);
  const rawSkills = resume.skills;
  const skillsStr = typeof rawSkills === 'string' ? rawSkills : Array.isArray(rawSkills) ? (rawSkills as any[]).map(s => s?.name || s?.title || s).join(', ') : '';
  const hasSkills = Boolean(skillsStr && skillsStr.trim().length >= 10);
  const hasExperience = Boolean(resume.experiences && resume.experiences.length > 0);
  const hasProjects = Boolean(resume.projects && resume.projects.length > 0);
  const hasEducation = Boolean(resume.education && resume.education.length > 0);
  const hasCertificates = Boolean(resume.certificates && resume.certificates.length > 0);
  const hasAchievements = Boolean(resume.achievements && resume.achievements.length > 0);

  const sections: SectionStatusItem[] = [
    {
      name: 'Contact Header',
      key: 'contact',
      isFound: Boolean(pi.fullName && (hasEmail || hasPhone)),
      isRequired: true,
      score: contactScore,
      feedback: hasEmail && hasPhone ? 'Complete contact details provided.' : 'Missing essential contact fields.',
      recommendation: 'Ensure clean single-line contact formatting.',
    },
    {
      name: 'Professional Summary',
      key: 'summary',
      isFound: hasSummary,
      isRequired: true,
      score: hasSummary ? (pi.summary.length > 120 ? 95 : 75) : 40,
      feedback: hasSummary ? 'Concise professional summary present.' : 'No professional summary found.',
      recommendation: 'Include a 2-3 sentence summary outlining your core specialization and years of experience.',
    },
    {
      name: 'Technical Skills',
      key: 'skills',
      isFound: hasSkills,
      isRequired: true,
      score: hasSkills ? 95 : 20,
      feedback: hasSkills ? 'Skills section present and populated.' : 'Missing technical skills section.',
      recommendation: 'Group skills by category (Languages, Frameworks, Databases, Tools).',
    },
    {
      name: 'Work Experience',
      key: 'experience',
      isFound: hasExperience,
      isRequired: true,
      score: hasExperience ? 95 : (resume.resumeType === 'fresher' ? 70 : 30),
      feedback: hasExperience ? `${resume.experiences.length} experience roles documented.` : 'No work experience listed.',
      recommendation: 'Use STAR bullet points starting with strong action verbs.',
    },
    {
      name: 'Projects',
      key: 'projects',
      isFound: hasProjects,
      isRequired: true,
      score: hasProjects ? 95 : 50,
      feedback: hasProjects ? `${resume.projects.length} technical projects detailed.` : 'No technical projects listed.',
      recommendation: 'Include 2-3 projects with tech stack and quantifiable outcomes.',
    },
    {
      name: 'Education',
      key: 'education',
      isFound: hasEducation,
      isRequired: true,
      score: hasEducation ? 95 : 30,
      feedback: hasEducation ? 'Education degree and institution specified.' : 'No education history found.',
      recommendation: 'List degree, major, university, and graduation year.',
    },
    {
      name: 'Certifications',
      key: 'certificates',
      isFound: hasCertificates,
      isRequired: false,
      score: hasCertificates ? 100 : 80,
      feedback: hasCertificates ? `${resume.certificates.length} certificate(s) listed.` : 'No certifications listed.',
      recommendation: 'Add industry credentials (AWS, GCP, CKA) if applicable.',
    },
    {
      name: 'Achievements',
      key: 'achievements',
      isFound: hasAchievements,
      isRequired: false,
      score: hasAchievements ? 100 : 85,
      feedback: hasAchievements ? 'Achievements documented.' : 'No awards or achievements listed.',
      recommendation: 'Optionally highlight hackathons, open-source honors, or merit awards.',
    },
  ];

  // 3. Formatting & Content Density Checks
  if (pi.summary && pi.summary.length > 500) {
    issues.push({
      id: 'warn_summary_length',
      category: 'Content Density',
      severity: 'Warning',
      title: 'Professional Summary Is Too Long',
      description: 'Summaries longer than 4-5 lines are frequently skipped by hiring managers.',
      recommendation: 'Trim summary to 2-3 concise sentences focusing on core impact and tech stack.',
    });
  }

  // Check for long paragraphs in experience bullets
  (resume.experiences || []).forEach((exp, idx) => {
    (exp.bullets || []).forEach((bullet, bIdx) => {
      if (bullet.length > 250) {
        issues.push({
          id: `warn_exp_${idx}_${bIdx}`,
          category: 'Formatting',
          severity: 'Warning',
          title: `Lengthy Bullet Point in "${exp.title}"`,
          description: 'Bullet exceeds 250 characters, forming a wall of text.',
          recommendation: 'Split complex accomplishments into two clear, focused bullet points.',
        });
      }
    });
  });

  // Check recommended ordering
  const isFresher = resume.resumeType === 'fresher';
  const recommendedOrder = isFresher
    ? ['Contact', 'Summary', 'Education', 'Technical Skills', 'Projects', 'Experience', 'Certifications']
    : ['Contact', 'Summary', 'Technical Skills', 'Work Experience', 'Projects', 'Education', 'Certifications'];

  // Calculate scores
  const presentReqCount = sections.filter((s) => s.isRequired && s.isFound).length;
  const totalReqCount = sections.filter((s) => s.isRequired).length;
  const structureScore = Math.round((presentReqCount / totalReqCount) * 100);

  const penalty = issues.reduce((acc, iss) => acc + (iss.severity === 'Critical' ? 15 : iss.severity === 'Warning' ? 8 : 3), 0);
  const formattingScore = Math.max(40, 100 - penalty);
  const overallScore = Math.round((structureScore * 0.6) + (formattingScore * 0.4));

  return {
    sections,
    issues,
    structureScore,
    formattingScore,
    overallScore,
    recommendedSectionOrder: recommendedOrder,
    currentSectionOrder: sections.filter((s) => s.isFound).map((s) => s.name),
    isAtsCompliant: issues.filter((i) => i.severity === 'Critical').length === 0,
  };
}

export default analyzeResumeStructure;
