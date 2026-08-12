/**
 * HireFlow Keyword Intelligence Engine
 * Categorizes keywords found/missing/recommended in a resume vs job description
 * utilizing term normalization (React == React.js == ReactJS, JS == JavaScript).
 */
import type { ParsedResumeData } from '../types';
import type { CategorizedKeywords } from './jd.analyzer';
import { normalizeTerm, textContainsTerm } from './ats.engine';

export interface KeywordStatus {
  keyword: string;
  category: string;
  status: 'found' | 'missing' | 'recommended';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  reason: string;
  frequencyInJD: number;
  importanceLabel?: string;
  recommendationNotice: string;
}

export interface KeywordCategoryGroup {
  label: string;
  key: keyof CategorizedKeywords;
  found: KeywordStatus[];
  missing: KeywordStatus[];
  recommended: KeywordStatus[];
  matchRate: number; // 0-100
}

export interface KeywordReport {
  categories: KeywordCategoryGroup[];
  overallMatchRate: number;
  topMissing: KeywordStatus[];
  totalFound: number;
  totalMissing: number;
  disclaimer: string;
}

// Mandatory user guidance notice required by Task 5
export const MISSING_KEYWORD_USER_NOTICE = "Only add this skill if you genuinely have experience with it.";

// Common "recommended" skills by category even without JD
const RECOMMENDED_BY_CATEGORY: Record<string, string[]> = {
  'Programming Language': ['typescript', 'python'],
  'Framework / Library': ['react', 'next.js', 'express'],
  'Database': ['postgresql', 'redis'],
  'Cloud / Infrastructure': ['aws', 'gcp'],
  'DevOps / CI-CD': ['docker', 'github actions', 'kubernetes'],
  'Testing': ['jest', 'playwright'],
};

function getResumeText(r: ParsedResumeData): string {
  const parts: string[] = [];
  if (r.personalInfo?.summary) parts.push(r.personalInfo.summary);
  if (r.skills) parts.push(r.skills);
  (r.experiences || []).forEach(e => {
    parts.push(e.title, e.company);
    (e.bullets || []).forEach(b => parts.push(b));
  });
  (r.projects || []).forEach(p => {
    parts.push(p.title, p.description || '');
    (p.techStack || []).forEach(t => parts.push(t));
    (p.bullets || []).forEach(b => parts.push(b));
  });
  (r.certificates || []).forEach(c => parts.push(c.title, c.issuer));
  return parts.join(' ');
}

function getPriority(frequencyInJD: number, isMissing: boolean): KeywordStatus['priority'] {
  if (!isMissing) return 'Low';
  if (frequencyInJD >= 4) return 'Critical';
  if (frequencyInJD >= 2) return 'High';
  if (frequencyInJD >= 1) return 'Medium';
  return 'Low';
}

export function buildKeywordReport(
  resumeData: ParsedResumeData,
  jdKeywords: CategorizedKeywords | null,
  jdText?: string
): KeywordReport {
  const resumeText = getResumeText(resumeData);

  // Build frequency map from JD text with normalized keys
  const freqMap: Record<string, number> = {};
  if (jdText) {
    const words = jdText.toLowerCase().match(/\b[a-z][a-z0-9+#.\-/]{2,}\b/g) || [];
    words.forEach(w => {
      const norm = normalizeTerm(w);
      freqMap[norm] = (freqMap[norm] || 0) + 1;
    });
  }

  const CATEGORY_META: { label: string; key: keyof CategorizedKeywords; catName: string }[] = [
    { label: 'Programming Languages', key: 'programmingLanguages', catName: 'Programming Language' },
    { label: 'Frameworks & Libraries', key: 'frameworks', catName: 'Framework / Library' },
    { label: 'Databases', key: 'databases', catName: 'Database' },
    { label: 'Cloud & Infrastructure', key: 'cloud', catName: 'Cloud / Infrastructure' },
    { label: 'DevOps & CI/CD', key: 'devops', catName: 'DevOps / CI-CD' },
    { label: 'Testing', key: 'testing', catName: 'Testing' },
    { label: 'Soft Skills', key: 'softSkills', catName: 'Soft Skill' },
  ];

  const categories: KeywordCategoryGroup[] = [];
  let totalFound = 0;
  let totalMissing = 0;
  const topMissing: KeywordStatus[] = [];

  for (const meta of CATEGORY_META) {
    const termsFromJD: string[] = jdKeywords?.[meta.key] as string[] ?? [];
    const recommendedTerms = RECOMMENDED_BY_CATEGORY[meta.catName] || [];
    const allTerms = [...new Set([...termsFromJD, ...recommendedTerms])];

    const found: KeywordStatus[] = [];
    const missing: KeywordStatus[] = [];
    const recommended: KeywordStatus[] = [];

    for (const term of allTerms) {
      const inResume = textContainsTerm(resumeText, term);
      const normTerm = normalizeTerm(term);
      const freqInJD = freqMap[normTerm] || (termsFromJD.includes(term) ? 1 : 0);
      const isFromJD = termsFromJD.includes(term);

      const status: KeywordStatus = {
        keyword: term.charAt(0).toUpperCase() + term.slice(1),
        category: meta.catName,
        status: inResume ? 'found' : (isFromJD ? 'missing' : 'recommended'),
        priority: getPriority(freqInJD, !inResume),
        importanceLabel: freqInJD >= 3 ? 'High' : freqInJD >= 2 ? 'Medium' : 'Low',
        reason: inResume
          ? `Found in your resume${freqInJD > 0 ? ` (mentioned ${freqInJD}x in JD)` : ''}`
          : isFromJD
          ? `Required in job description (${freqInJD}x) — absent from resume`
          : `Recommended for ${meta.catName} profiles`,
        frequencyInJD: freqInJD,
        recommendationNotice: MISSING_KEYWORD_USER_NOTICE,
      };

      if (inResume) {
        found.push(status);
        totalFound++;
      } else if (isFromJD) {
        missing.push(status);
        totalMissing++;
        topMissing.push(status);
      } else {
        recommended.push(status);
      }
    }

    const total = found.length + missing.length;
    const matchRate = total > 0 ? Math.round((found.length / total) * 100) : 100;

    categories.push({
      label: meta.label,
      key: meta.key,
      found,
      missing,
      recommended,
      matchRate,
    });
  }

  const grandTotal = totalFound + totalMissing;
  const overallMatchRate = grandTotal > 0 ? Math.round((totalFound / grandTotal) * 100) : 75;

  return {
    categories,
    overallMatchRate,
    topMissing: topMissing
      .sort((a, b) => b.frequencyInJD - a.frequencyInJD)
      .slice(0, 12),
    totalFound,
    totalMissing,
    disclaimer: MISSING_KEYWORD_USER_NOTICE,
  };
}

export default buildKeywordReport;
