/**
 * Keyword Matcher Engine
 * ───────────────────────
 * Categorizes keywords into:
 * 🟢 Matched Keywords (Present in candidate resume)
 * 🟡 Partial Keywords (Related concepts or semantic synonyms)
 * 🔴 Missing Keywords (In JD, missing from resume)
 *
 * For EVERY missing keyword, provides an explicit natural fit recommendation:
 * - Specific section (Skills, Experience, Projects, Summary, Certifications)
 * - Safe contextual guidance that preserves candidate truthfulness
 */

import type { ParsedResumeData } from '../types';
import { normalizeTerm, textContainsTerm, areTermsEquivalent } from './ats.engine';
import { ParsedJobDescription } from './jd.parser';

export type KeywordStatus = 'matched' | 'partial' | 'missing';

export interface KeywordMatchItem {
  name: string;
  category: 'Required' | 'Preferred' | 'Technical' | 'Soft Skill' | 'Tool' | 'Domain';
  status: KeywordStatus;
  foundLocations: Array<'skills' | 'experience' | 'projects' | 'summary' | 'education' | 'certificates'>;
  frequencyInJd: number;
  frequencyInResume: number;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  /** Where this missing keyword could naturally fit if the candidate has legitimate experience */
  naturalFitSection?: 'Skills' | 'Experience' | 'Projects' | 'Summary' | 'Certifications';
  /** Actionable, context-specific suggestion */
  placementSuggestion?: string;
}

export interface KeywordAnalysisResult {
  matchedKeywords: KeywordMatchItem[];
  partialKeywords: KeywordMatchItem[];
  missingKeywords: KeywordMatchItem[];
  totalJdKeywordsCount: number;
  matchPercentage: number;
  keywordScore: number; // 0 - 100
}

/**
 * Maps a keyword to its most natural resume section placement.
 */
function determineNaturalFit(keyword: string, category: KeywordMatchItem['category']): {
  section: KeywordMatchItem['naturalFitSection'];
  suggestion: string;
} {
  const norm = normalizeTerm(keyword);

  if (category === 'Soft Skill') {
    return {
      section: 'Experience',
      suggestion: `Demonstrate "${keyword}" within work experience bullet points by describing how you collaborated or solved problems, rather than listing it as a standalone word.`,
    };
  }

  if (category === 'Domain') {
    return {
      section: 'Summary',
      suggestion: `Incorporate domain familiarity with "${keyword}" into your Professional Summary or relevant project overview.`,
    };
  }

  if (['aws', 'azure', 'gcp', 'docker', 'kubernetes', 'jenkins', 'git', 'vite', 'webpack'].includes(norm)) {
    return {
      section: 'Skills',
      suggestion: `Add "${keyword}" under Tools & Infrastructure in your Skills section, and cite it in projects where you deployed or configured it.`,
    };
  }

  if (['pmp', 'scrum master', 'cissp', 'aws certified', 'ckad', 'comptia'].includes(norm)) {
    return {
      section: 'Certifications',
      suggestion: `If certified, list "${keyword}" in your Certifications section with issuing body and year.`,
    };
  }

  if (['react', 'node.js', 'typescript', 'python', 'java', 'postgresql', 'mongodb', 'graphql'].includes(norm)) {
    return {
      section: 'Projects',
      suggestion: `Explicitly mention "${keyword}" in the Tech Stack of relevant projects or experience bullet points where you developed software.`,
    };
  }

  return {
    section: 'Skills',
    suggestion: `If you have hands-on exposure to "${keyword}", include it in your Technical Skills section and mention it in relevant projects.`,
  };
}

/**
 * Gathers all sectional text representations from a candidate's resume.
 */
export function extractResumeSectionTexts(r: ParsedResumeData): Record<
  'skills' | 'experience' | 'projects' | 'summary' | 'education' | 'certificates' | 'full',
  string
> {
  const summaryText = r.personalInfo?.summary || '';
  const skillsText = typeof r.skills === 'string' ? r.skills : Array.isArray(r.skills) ? (r.skills as any[]).map(s => s?.title || s?.name || s).join(' ') : '';
  
  const expText = (r.experiences || [])
    .map((e) => `${e.title} ${e.company} ${e.location || ''} ${(e.bullets || []).join(' ')}`)
    .join(' ');

  const projText = (r.projects || [])
    .map((p) => `${p.title} ${p.description || ''} ${(p.bullets || []).join(' ')} ${(p.techStack || []).join(' ')}`)
    .join(' ');

  const eduText = (r.education || [])
    .map((ed) => `${ed.degree} ${ed.institution} ${ed.coursework || ''} ${ed.highlights || ''}`)
    .join(' ');

  const certText = (r.certificates || [])
    .map((c) => `${c.title} ${c.issuer}`)
    .join(' ');

  const full = `${summaryText} ${skillsText} ${expText} ${projText} ${eduText} ${certText}`;

  return {
    summary: summaryText,
    skills: skillsText,
    experience: expText,
    projects: projText,
    education: eduText,
    certificates: certText,
    full,
  };
}

/**
 * Analyzes candidate resume against parsed Job Description keywords.
 */
export function analyzeKeywords(
  resume: ParsedResumeData,
  parsedJd: ParsedJobDescription
): KeywordAnalysisResult {
  const sectionTexts = extractResumeSectionTexts(resume);
  const candidateTextLower = sectionTexts.full.toLowerCase();

  const matchedKeywords: KeywordMatchItem[] = [];
  const partialKeywords: KeywordMatchItem[] = [];
  const missingKeywords: KeywordMatchItem[] = [];

  // Deduplicate JD keywords across all categories
  const seenKeywords = new Set<string>();

  const processKeyword = (
    keywordName: string,
    category: KeywordMatchItem['category'],
    importance: KeywordMatchItem['importance'] = 'Medium',
    jdFreq = 1
  ) => {
    const norm = normalizeTerm(keywordName);
    if (!norm || seenKeywords.has(norm)) return;
    seenKeywords.add(norm);

    const locations: Array<'skills' | 'experience' | 'projects' | 'summary' | 'education' | 'certificates'> = [];
    if (textContainsTerm(sectionTexts.skills, keywordName)) locations.push('skills');
    if (textContainsTerm(sectionTexts.experience, keywordName)) locations.push('experience');
    if (textContainsTerm(sectionTexts.projects, keywordName)) locations.push('projects');
    if (textContainsTerm(sectionTexts.summary, keywordName)) locations.push('summary');
    if (textContainsTerm(sectionTexts.education, keywordName)) locations.push('education');
    if (textContainsTerm(sectionTexts.certificates, keywordName)) locations.push('certificates');

    // Count occurrences in resume
    const escaped = norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const resumeMatches = candidateTextLower.match(new RegExp(`\\b${escaped}\\b`, 'gi'));
    const resumeFreq = resumeMatches ? resumeMatches.length : 0;

    const isDirectMatch = locations.length > 0 || resumeFreq > 0;
    
    // Check partial / semantic match (e.g., term appears as substring or related token)
    let isPartialMatch = false;
    if (!isDirectMatch) {
      const words = keywordName.toLowerCase().split(/\s+/).filter(w => w.length > 3);
      if (words.length > 1 && words.some(w => candidateTextLower.includes(w))) {
        isPartialMatch = true;
      }
    }

    if (isDirectMatch) {
      matchedKeywords.push({
        name: keywordName,
        category,
        status: 'matched',
        foundLocations: locations,
        frequencyInJd: jdFreq,
        frequencyInResume: Math.max(1, resumeFreq),
        importance,
      });
    } else if (isPartialMatch) {
      partialKeywords.push({
        name: keywordName,
        category,
        status: 'partial',
        foundLocations: [],
        frequencyInJd: jdFreq,
        frequencyInResume: 0,
        importance,
      });
    } else {
      const naturalFit = determineNaturalFit(keywordName, category);
      missingKeywords.push({
        name: keywordName,
        category,
        status: 'missing',
        foundLocations: [],
        frequencyInJd: jdFreq,
        frequencyInResume: 0,
        importance,
        naturalFitSection: naturalFit.section,
        placementSuggestion: naturalFit.suggestion,
      });
    }
  };

  // Process required skills
  parsedJd.requiredSkills.forEach((skill) => {
    processKeyword(skill.name, 'Required', skill.importance, skill.frequency);
  });

  // Process technical skills
  parsedJd.categorizedKeywords.technical.forEach((tech) => {
    processKeyword(tech, 'Technical', 'High', 2);
  });

  // Process domain terms
  parsedJd.domainTerminology.forEach((term) => {
    processKeyword(term, 'Domain', 'Medium', 1);
  });

  // Process preferred skills
  parsedJd.preferredSkills.forEach((skill) => {
    processKeyword(skill.name, 'Preferred', skill.importance, skill.frequency);
  });

  // Process soft skills
  parsedJd.categorizedKeywords.softSkills.forEach((soft) => {
    processKeyword(soft, 'Soft Skill', 'Low', 1);
  });

  const totalJdKeywordsCount = matchedKeywords.length + partialKeywords.length + missingKeywords.length;
  const matchPercentage =
    totalJdKeywordsCount > 0
      ? Math.round(((matchedKeywords.length + partialKeywords.length * 0.5) / totalJdKeywordsCount) * 100)
      : 80;

  // Weight required/critical keywords more heavily in score
  let totalScorePoints = 0;
  let maxScorePoints = 0;

  [...matchedKeywords, ...partialKeywords, ...missingKeywords].forEach((item) => {
    const weight = item.importance === 'Critical' ? 3 : item.importance === 'High' ? 2 : 1;
    maxScorePoints += weight;
    if (item.status === 'matched') totalScorePoints += weight;
    else if (item.status === 'partial') totalScorePoints += weight * 0.5;
  });

  const keywordScore =
    maxScorePoints > 0 ? Math.min(100, Math.round((totalScorePoints / maxScorePoints) * 100)) : 80;

  return {
    matchedKeywords,
    partialKeywords,
    missingKeywords,
    totalJdKeywordsCount,
    matchPercentage,
    keywordScore,
  };
}

export default analyzeKeywords;
