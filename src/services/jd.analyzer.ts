/**
 * HireFlow Real JD Analyzer & Semantic Matcher
 * ──────────────────────────────────────────────
 * Extracts structured intelligence from actual raw job descriptions.
 * NO HARDCODED DATA. Everything is extracted dynamically from the user's input JD.
 */

import { normalizeTerm, textContainsTerm } from './ats.engine';
import type { JDMatchBreakdown, SemanticConfidence } from '../types';

const PROGRAMMING_LANGUAGES = [
  'python', 'javascript', 'typescript', 'java', 'golang', 'go', 'rust', 'c++',
  'c#', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'r', 'matlab', 'bash',
  'shell', 'perl', 'haskell', 'elixir', 'dart', 'lua', 'solidity', 'sql',
];

const FRAMEWORKS = [
  'react', 'next.js', 'nextjs', 'vue', 'angular', 'svelte', 'remix', 'nuxt',
  'express', 'fastapi', 'flask', 'django', 'spring', 'spring boot', 'nestjs',
  'graphql', 'redux', 'zustand', 'tailwind', 'tailwindcss', 'pytorch',
  'tensorflow', 'keras', 'scikit-learn', 'langchain', 'react native', 'flutter',
];

const DATABASES = [
  'postgresql', 'postgres', 'mysql', 'sqlite', 'mongodb', 'redis',
  'dynamodb', 'cassandra', 'elasticsearch', 'neo4j', 'supabase', 'firebase',
  'cockroachdb', 'mariadb', 'oracle', 'sql server', 'bigquery',
  'snowflake', 'redshift', 'clickhouse', 'vector database',
];

const CLOUD = [
  'aws', 'azure', 'gcp', 'google cloud', 'vercel', 'netlify', 'heroku',
  'digitalocean', 'cloudflare', 'lambda', 'ec2', 's3', 'rds', 'ecs', 'eks',
  'cloud run', 'cloud functions', 'firebase', 'app engine', 'azure functions',
];

const DEVOPS = [
  'docker', 'kubernetes', 'k8s', 'terraform', 'ansible', 'jenkins',
  'github actions', 'gitlab ci', 'circleci', 'argo cd', 'helm', 'prometheus',
  'grafana', 'datadog', 'splunk', 'ci/cd', 'cicd', 'nginx', 'apache', 'pulumi',
];

const TESTING = [
  'jest', 'vitest', 'mocha', 'jasmine', 'chai', 'cypress', 'playwright',
  'selenium', 'puppeteer', 'junit', 'pytest', 'rspec', 'tdd', 'bdd',
  'unit testing', 'integration testing', 'e2e testing',
];

const SOFT_SKILLS = [
  'communication', 'collaboration', 'teamwork', 'leadership', 'problem solving',
  'critical thinking', 'analytical', 'self-motivated', 'adaptable', 'innovative',
  'ownership', 'accountability', 'mentorship', 'cross-functional', 'agile', 'scrum',
];

export type ExperienceLevel = 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Staff' | 'Principal' | 'Director';

export interface CategorizedKeywords {
  programmingLanguages: string[];
  frameworks: string[];
  databases: string[];
  cloud: string[];
  devops: string[];
  testing: string[];
  softSkills: string[];
  other: string[];
}

export interface JDSkillGap {
  skill: string;
  category: string;
  isRequired: boolean;
  frequency: number;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface JDAnalysis {
  targetRole: string;
  experienceLevel: ExperienceLevel;
  minYearsExperience: number;
  requiredSkills: JDSkillGap[];
  preferredSkills: JDSkillGap[];
  responsibilities: string[];
  industry: string;
  isRemote: boolean;
  keywords: CategorizedKeywords;
  rawKeywords: string[];
}

export interface SemanticMatchResult {
  phrase: string;
  matchedBullet: string | null;
  confidence: SemanticConfidence;
  explanation: string;
}

function detectExperienceLevel(text: string): { level: ExperienceLevel; minYears: number } {
  const lower = text.toLowerCase();
  const yearMatches = lower.match(/(\d+)\+?\s*years?\s*(of\s+)?(experience|exp)/gi) || [];
  let maxYears = 0;
  yearMatches.forEach((m) => {
    const num = parseInt(m);
    if (!isNaN(num) && num > maxYears) maxYears = num;
  });
  if (/\b(principal|distinguished|fellow)\b/.test(lower)) return { level: 'Principal', minYears: maxYears || 10 };
  if (/\b(staff engineer|staff software)\b/.test(lower)) return { level: 'Staff', minYears: maxYears || 8 };
  if (/\b(director|vp of|head of engineering)\b/.test(lower)) return { level: 'Director', minYears: maxYears || 10 };
  if (/\b(tech lead|technical lead|lead engineer)\b/.test(lower)) return { level: 'Lead', minYears: maxYears || 6 };
  if (/\bsenior\b/.test(lower) || maxYears >= 5) return { level: 'Senior', minYears: maxYears || 5 };
  if (/\b(mid[-\s]?level|intermediate)\b/.test(lower) || maxYears >= 3) return { level: 'Mid', minYears: maxYears || 3 };
  if (/\b(junior|jr\.?)\b/.test(lower) || maxYears >= 1) return { level: 'Junior', minYears: maxYears || 1 };
  return { level: 'Entry', minYears: 0 };
}

function detectTargetRole(text: string): string {
  const header = text.slice(0, 400);
  const m = header.match(/^([A-Z][a-zA-Z\s]+(?:Engineer|Developer|Designer|Analyst|Manager|Lead|Architect|Scientist|Specialist|Consultant))/m);
  if (m?.[1]) return m[1].trim().slice(0, 70);
  const m2 = text.match(/[A-Z][a-zA-Z]+ (?:Engineer|Developer|Designer|Analyst|Manager)/);
  return m2?.[0] || 'Software Engineer';
}

function detectIndustry(text: string): string {
  const l = text.toLowerCase();
  if (/fintech|banking|financial|payments|trading|blockchain/.test(l)) return 'FinTech';
  if (/healthcare|medical|pharma|clinical|health tech/.test(l)) return 'HealthTech';
  if (/edtech|education|learning|e-learning/.test(l)) return 'EdTech';
  if (/gaming|game development|unity|unreal/.test(l)) return 'Gaming';
  if (/ai|machine learning|ml|nlp|llm|generative/.test(l)) return 'AI / ML';
  if (/cybersecurity|security|infosec/.test(l)) return 'Cybersecurity';
  if (/ecommerce|e-commerce|retail|marketplace/.test(l)) return 'E-Commerce';
  if (/saas|b2b|enterprise software/.test(l)) return 'SaaS / Enterprise';
  return 'Technology';
}

function matchTerms(text: string, terms: string[]): string[] {
  return terms.filter((t) => textContainsTerm(text, t));
}

function countFrequency(text: string, term: string): number {
  const norm = normalizeTerm(term);
  const escaped = norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return (text.toLowerCase().match(new RegExp(`\\b${escaped}\\b`, 'gi')) || []).length;
}

function buildSkillGaps(jd: string, keywords: CategorizedKeywords, requiredText: string, preferredText: string) {
  const allTerms = [
    ...keywords.programmingLanguages.map((s) => ({ s, c: 'Programming Language' })),
    ...keywords.frameworks.map((s) => ({ s, c: 'Framework / Library' })),
    ...keywords.databases.map((s) => ({ s, c: 'Database' })),
    ...keywords.cloud.map((s) => ({ s, c: 'Cloud / Infrastructure' })),
    ...keywords.devops.map((s) => ({ s, c: 'DevOps / CI-CD' })),
    ...keywords.testing.map((s) => ({ s, c: 'Testing' })),
  ];

  const required: JDSkillGap[] = [];
  const preferred: JDSkillGap[] = [];

  allTerms.forEach(({ s, c }) => {
    const freq = countFrequency(jd, s);
    if (freq === 0) return;
    const inRequired = requiredText.toLowerCase().includes(s.toLowerCase()) || freq >= 2;
    const importance = freq >= 4 ? 'Critical' : freq >= 2 ? 'High' : 'Medium';

    const gap: JDSkillGap = { skill: s, category: c, isRequired: inRequired, frequency: freq, importance };
    if (inRequired) required.push(gap);
    else preferred.push(gap);
  });

  return {
    required: required.sort((a, b) => b.frequency - a.frequency).slice(0, 20),
    preferred: preferred.sort((a, b) => b.frequency - a.frequency).slice(0, 10),
  };
}

function extractSection(text: string, keys: string[]): string {
  const lines = text.split('\n');
  const out: string[] = [];
  let active = false;
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (keys.some((k) => lower.includes(k))) { active = true; continue; }
    if (active && /^(qualifications|responsibilities|about|what you|nice to have|preferred|must have)/i.test(lower) && !keys.some((k) => lower.includes(k))) { active = false; }
    if (active && line.trim().length > 8) out.push(line.trim());
  }
  return out.join(' ');
}

function extractResponsibilities(text: string): string[] {
  return text.split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 20 && l.length < 200)
    .filter((l) => /^[•\-*●]|^(design|build|develop|implement|create|lead|manage|own|drive|architect|collaborate)/i.test(l))
    .map((l) => l.replace(/^[•\-*●]\s*/, '').trim())
    .slice(0, 8);
}

export function analyzeJobDescription(jdText: string): JDAnalysis {
  if (!jdText || jdText.trim().length < 20) {
    return {
      targetRole: 'Software Engineer', experienceLevel: 'Mid', minYearsExperience: 0,
      requiredSkills: [], preferredSkills: [], responsibilities: [], industry: 'Technology',
      isRemote: false,
      keywords: { programmingLanguages: [], frameworks: [], databases: [], cloud: [], devops: [], testing: [], softSkills: [], other: [] },
      rawKeywords: [],
    };
  }

  const lower = jdText.toLowerCase();
  const requiredSection = extractSection(jdText, ['required', 'requirements', 'must have', 'qualifications', 'you have']);
  const preferredSection = extractSection(jdText, ['preferred', 'nice to have', 'bonus', 'a plus', 'desirable']);
  const { level, minYears } = detectExperienceLevel(jdText);

  const keywords: CategorizedKeywords = {
    programmingLanguages: matchTerms(jdText, PROGRAMMING_LANGUAGES),
    frameworks: matchTerms(jdText, FRAMEWORKS),
    databases: matchTerms(jdText, DATABASES),
    cloud: matchTerms(jdText, CLOUD),
    devops: matchTerms(jdText, DEVOPS),
    testing: matchTerms(jdText, TESTING),
    softSkills: matchTerms(jdText, SOFT_SKILLS),
    other: [],
  };

  const { required, preferred } = buildSkillGaps(jdText, keywords, requiredSection, preferredSection);

  return {
    targetRole: detectTargetRole(jdText),
    experienceLevel: level,
    minYearsExperience: minYears,
    requiredSkills: required,
    preferredSkills: preferred,
    responsibilities: extractResponsibilities(jdText),
    industry: detectIndustry(jdText),
    isRemote: /\b(remote|work from home|wfh|fully remote)\b/.test(lower),
    keywords,
    rawKeywords: [...keywords.programmingLanguages, ...keywords.frameworks, ...keywords.databases, ...keywords.cloud, ...keywords.devops, ...keywords.testing],
  };
}

/**
 * Checks semantic alignment of a JD responsibility phrase against candidate experience bullets.
 * Returns a confidence level (Strong Match, Partial Match, Weak Match, No Match).
 */
export function checkSemanticResponsibilityMatch(
  jdPhrase: string,
  bullets: string[]
): SemanticMatchResult {
  if (!jdPhrase || bullets.length === 0) {
    return { phrase: jdPhrase, matchedBullet: null, confidence: 'No Match', explanation: 'No bullet points available to compare.' };
  }

  const phraseLower = jdPhrase.toLowerCase();
  const phraseWords = phraseLower.match(/\b[a-z]{4,}\b/g) || [];

  let bestBullet: string | null = null;
  let maxMatchedWords = 0;

  bullets.forEach((b) => {
    const bLower = b.toLowerCase();
    let matched = 0;
    phraseWords.forEach((w) => {
      if (bLower.includes(w)) matched++;
    });
    if (matched > maxMatchedWords) {
      maxMatchedWords = matched;
      bestBullet = b;
    }
  });

  const matchRatio = phraseWords.length > 0 ? maxMatchedWords / phraseWords.length : 0;
  let confidence: SemanticConfidence = 'No Match';

  if (matchRatio >= 0.6 || maxMatchedWords >= 4) confidence = 'Strong Match';
  else if (matchRatio >= 0.35 || maxMatchedWords >= 2) confidence = 'Partial Match';
  else if (maxMatchedWords >= 1) confidence = 'Weak Match';

  return {
    phrase: jdPhrase,
    matchedBullet: bestBullet,
    confidence,
    explanation: confidence === 'Strong Match'
      ? 'Direct semantic alignment found in experience bullets.'
      : confidence === 'Partial Match'
      ? 'Related terminology found, but context could be strengthened.'
      : 'Responsibility is absent or weakly represented in current bullets.',
  };
}

export default analyzeJobDescription;
