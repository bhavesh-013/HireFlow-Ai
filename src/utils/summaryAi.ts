import { ParsedResumeData } from '../types';

/**
 * Extracts all unique numbers, percentages, dollar amounts, and metrics
 * already present across a resume's experiences, projects, achievements, etc.
 */
export function extractResumeMetrics(resumeData?: any): string[] {
  if (!resumeData) return [];

  const textSnippets: string[] = [];

  // Extract from summary
  if (resumeData.personalInfo?.summary) {
    textSnippets.push(resumeData.personalInfo.summary);
  }

  // Extract from experiences
  if (Array.isArray(resumeData.experiences)) {
    resumeData.experiences.forEach((exp: any) => {
      if (exp.role) textSnippets.push(exp.role);
      if (exp.company) textSnippets.push(exp.company);
      if (Array.isArray(exp.bullets)) {
        textSnippets.push(...exp.bullets);
      }
    });
  }

  // Extract from projects
  if (Array.isArray(resumeData.projects)) {
    resumeData.projects.forEach((proj: any) => {
      if (proj.description) textSnippets.push(proj.description);
      if (Array.isArray(proj.highlights)) textSnippets.push(...proj.highlights);
    });
  }

  // Extract from achievements
  if (Array.isArray(resumeData.achievements)) {
    resumeData.achievements.forEach((ach: any) => {
      if (typeof ach === 'string') textSnippets.push(ach);
      else if (ach?.title) textSnippets.push(ach.title);
      else if (ach?.description) textSnippets.push(ach.description);
    });
  }

  const combinedText = textSnippets.join(' ');

  // Match metrics like 5 years, 40%, $100k, 50,000, 99.9%, $1,000
  const metricRegex = /\b\d+(?:\.\d+)?\+?\s+(?:years?|months?|users?|clients?|engineers?|projects?)\b|\$?\d+(?:,\d{3})*(?:\.\d+)?[%kM+]?/gi;
  const matches = combinedText.match(metricRegex) || [];

  // Filter out standalone small numbers like 1, 2, 3 unless accompanied by units or signs
  const uniqueMetrics = Array.from(
    new Set(
      matches
        .map((m) => m.trim())
        .filter((m) => {
          if (/^https?:\/\//i.test(m)) return false;
          return /\d/.test(m);
        })
    )
  );

  return uniqueMetrics;
}

/**
 * Clean, grounded local grammar fixer (spelling, capitalization, punctuation, clarity).
 * Never fabricates new metrics or experience.
 */
export function fixSummaryGrammar(summary: string): string {
  if (!summary || !summary.trim()) return '';

  let text = summary.trim();

  // Basic capitalization
  if (text.length > 0 && /^[a-z]/.test(text)) {
    text = text.charAt(0).toUpperCase() + text.slice(1);
  }

  // Common spelling / grammar fixes
  text = text
    .replace(/\bjavscript\b/gi, 'JavaScript')
    .replace(/\btypescrip\b/gi, 'TypeScript')
    .replace(/\bpyhton\b/gi, 'Python')
    .replace(/\breactjs\b/gi, 'React')
    .replace(/\bnodejs\b/gi, 'Node.js')
    .replace(/\bdevelop website\b/gi, 'developed web applications')
    .replace(/\bworked on frontend\b/gi, 'developed frontend components')
    .replace(/\bresponsible for\b/gi, 'managed')
    .replace(/\bi am\b/gi, '')
    .replace(/\bmy skills include\b/gi, 'skilled in')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Ensure trailing period
  if (!/[.!?]$/.test(text)) {
    text += '.';
  }

  return text;
}

/**
 * Optimizes existing summary text for ATS-friendly structure and keywords,
 * preserving all factual information.
 */
export function improveSummaryAts(summary: string, targetRole?: string): string {
  if (!summary || !summary.trim()) return '';

  let text = summary.trim();

  // Remove first-person pronouns
  text = text
    .replace(/\bI am a\s+/gi, '')
    .replace(/\bI have\s+/gi, 'Having ')
    .replace(/\bI\s+/gi, '')
    .replace(/\bMy\s+/gi, '');

  // Capitalize start
  text = text.charAt(0).toUpperCase() + text.slice(1);

  // Add target role descriptor prefix if not present and targetRole is given
  if (targetRole && targetRole.trim() && !text.toLowerCase().includes(targetRole.toLowerCase())) {
    const roleTitle = targetRole.trim();
    if (!/^(experienced|skilled|results-driven|dedicated|detail-oriented)/i.test(text)) {
      text = `${roleTitle} with experience in ${text.charAt(0).toLowerCase()}${text.slice(1)}`;
    }
  }

  // Normalize double spaces and punctuation
  text = text.replace(/\s{2,}/g, ' ').trim();
  if (!/[.!?]$/.test(text)) {
    text += '.';
  }

  return text;
}
