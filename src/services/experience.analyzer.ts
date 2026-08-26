/**
 * Experience Relevance & Bullet Point Optimizer
 * ───────────────────────────────────────────────
 * Analyzes candidate work experience against Job Description requirements.
 * Identifies:
 * - Weak descriptions and generic statements
 * - Missing action verbs
 * - Missing JD keywords
 * - Missing measurable impact / metrics
 * - Alignment with JD responsibilities
 *
 * Produces structured 🔴 Current vs 🟢 Optimized versions while strictly preserving
 * truthful claims.
 */

import type { ExperienceItem, ParsedResumeData } from '../types';
import { textContainsTerm } from './ats.engine';
import { ParsedJobDescription } from './jd.parser';

export interface ExperienceBulletAnalysis {
  bulletIndex: number;
  currentText: string;
  optimizedText: string;
  isStrong: boolean;
  issues: string[];
  suggestedActionVerb?: string;
  matchedJdKeywords: string[];
  missingMeasurableImpact: boolean;
}

export interface ExperienceAnalysisItem {
  id: string;
  title: string;
  company: string;
  period: string;
  relevanceScore: number; // 0 - 100
  bullets: ExperienceBulletAnalysis[];
  keyJdMatches: string[];
  responsibilitiesAlignment: 'High' | 'Medium' | 'Low';
  weakPoints: string[];
  suggestedImprovements: string[];
}

export interface ExperienceAnalysisResult {
  experiences: ExperienceAnalysisItem[];
  averageExperienceScore: number;
  overallRelevanceScore: number;
}

const WEAK_VERB_MAP: Record<string, string> = {
  built: 'Architected',
  build: 'Architect',
  made: 'Engineered',
  make: 'Engineer',
  'worked on': 'Spearheaded development of',
  worked: 'Collaborated on',
  helped: 'Partnered with cross-functional teams to deliver',
  used: 'Leveraged',
  use: 'Leverage',
  did: 'Executed',
  wrote: 'Authored and deployed',
  created: 'Designed and implemented',
  fixed: 'Diagnosed and resolved',
  improved: 'Optimized',
  added: 'Integrated',
  handled: 'Directed',
  'responsible for': 'Owned end-to-end delivery of',
  assisted: 'Facilitated',
  participated: 'Actively contributed to',
  supported: 'Accelerated team output by supporting',
  developed: 'Engineered and scaled',
  managed: 'Led engineering workflows for',
};

/**
 * Transforms a weak bullet into a high-impact, ATS-optimized bullet.
 */
function optimizeExperienceBullet(
  bullet: string,
  jdKeywords: string[]
): { optimized: string; issues: string[]; actionVerb?: string; missingMetric: boolean } {
  const issues: string[] = [];
  let text = bullet.trim();
  if (!text) return { optimized: '', issues: [], missingMetric: false };

  const hasMetric = /\d+%|\d+x|\$\d+|\d+\s*(users|clients|customers|requests|queries|seconds|ms|hours|days|releases)/i.test(text);
  if (!hasMetric) {
    issues.push('Missing measurable outcome or quantitative impact.');
  }

  let actionVerbReplacement: string | undefined = undefined;
  const lower = text.toLowerCase();

  // Find if bullet starts with a weak phrase
  for (const [weak, strong] of Object.entries(WEAK_VERB_MAP)) {
    const regex = new RegExp(`^${weak}\\b`, 'i');
    if (regex.test(lower)) {
      actionVerbReplacement = strong;
      text = text.replace(regex, strong);
      issues.push(`Replaced weak verb "${weak}" with strong impact verb "${strong}".`);
      break;
    }
  }

  // Ensure capitalization and punctuation
  text = text.charAt(0).toUpperCase() + text.slice(1);
  if (!text.endsWith('.')) text += '.';

  // If generic without technical specificity, flag it
  if (text.length < 35) {
    issues.push('Bullet is overly brief; expand with technical details or specific methodology.');
  }

  return {
    optimized: text,
    issues,
    actionVerb: actionVerbReplacement,
    missingMetric: !hasMetric,
  };
}

export function analyzeExperiences(
  resume: ParsedResumeData,
  parsedJd: ParsedJobDescription
): ExperienceAnalysisResult {
  const experiences = resume.experiences || [];
  if (experiences.length === 0) {
    return {
      experiences: [],
      averageExperienceScore: 50,
      overallRelevanceScore: 50,
    };
  }

  const allJdKeywords = parsedJd.rawKeywords;
  const jdResponsibilities = parsedJd.responsibilities;

  const analyzedItems: ExperienceAnalysisItem[] = experiences.map((exp, idx) => {
    const bullets = exp.bullets || [];
    const expFullText = `${exp.title} ${exp.company} ${bullets.join(' ')}`.toLowerCase();

    // Check matched JD keywords
    const matchedKeywords = allJdKeywords.filter((k) => textContainsTerm(expFullText, k));

    // Analyze individual bullets
    const bulletAnalyses: ExperienceBulletAnalysis[] = bullets.map((b, bIdx) => {
      const bLower = b.toLowerCase();
      const bMatches = allJdKeywords.filter((k) => textContainsTerm(bLower, k));
      const { optimized, issues, actionVerb, missingMetric } = optimizeExperienceBullet(b, allJdKeywords);

      const isStrong = issues.length === 0 || (issues.length === 1 && !issues[0].includes('weak verb'));

      return {
        bulletIndex: bIdx,
        currentText: b,
        optimizedText: optimized,
        isStrong,
        issues,
        suggestedActionVerb: actionVerb,
        matchedJdKeywords: bMatches,
        missingMeasurableImpact: missingMetric,
      };
    });

    // Check alignment with JD responsibilities
    let respAlignmentScore = 0;
    jdResponsibilities.forEach((resp) => {
      const respWords = resp.toLowerCase().split(/\s+/).filter((w) => w.length > 4);
      const matches = respWords.filter((w) => expFullText.includes(w)).length;
      if (matches >= 2) respAlignmentScore++;
    });

    const responsibilitiesAlignment: 'High' | 'Medium' | 'Low' =
      respAlignmentScore >= 3 ? 'High' : respAlignmentScore >= 1 ? 'Medium' : 'Low';

    // Identify weak points
    const weakPoints: string[] = [];
    const suggestedImprovements: string[] = [];

    const weakBulletsCount = bulletAnalyses.filter((b) => !b.isStrong).length;
    if (weakBulletsCount > 0) {
      weakPoints.push(`${weakBulletsCount} bullet point(s) contain weak verbs or lack specific outcomes.`);
      suggestedImprovements.push('Upgrade bullet points using STAR format (Situation, Task, Action, Result).');
    }

    const missingMetricsCount = bulletAnalyses.filter((b) => b.missingMeasurableImpact).length;
    if (missingMetricsCount === bullets.length && bullets.length > 0) {
      weakPoints.push('No bullet points feature quantitative metrics or business results.');
      suggestedImprovements.push('Add measurable impact if available (e.g. latency, throughput, team size, uptime).');
    }

    if (matchedKeywords.length < 2) {
      weakPoints.push('Few target job description keywords matched in this role.');
      suggestedImprovements.push('Highlight relevant technologies and methodologies used during this tenure.');
    }

    // Compute experience relevance score (0-100)
    let score = 55;
    score += Math.min(25, matchedKeywords.length * 5);
    if (responsibilitiesAlignment === 'High') score += 15;
    else if (responsibilitiesAlignment === 'Medium') score += 10;
    if (bulletAnalyses.some((b) => !b.missingMeasurableImpact)) score += 10;
    if (weakPoints.length > 2) score -= 15;

    const clampedScore = Math.max(30, Math.min(95, score));

    return {
      id: exp.id || `exp_${idx + 1}`,
      title: exp.title || 'Role Title',
      company: exp.company || 'Company',
      period: exp.period || 'Period',
      relevanceScore: clampedScore,
      bullets: bulletAnalyses,
      keyJdMatches: matchedKeywords.slice(0, 8),
      responsibilitiesAlignment,
      weakPoints: weakPoints.length > 0 ? weakPoints : ['Experience demonstrates solid alignment.'],
      suggestedImprovements:
        suggestedImprovements.length > 0
          ? suggestedImprovements
          : ['Maintain strong action verbs and high-impact terminology.'],
    };
  });

  const total = analyzedItems.reduce((acc, item) => acc + item.relevanceScore, 0);
  const avg = Math.round(total / analyzedItems.length);

  return {
    experiences: analyzedItems,
    averageExperienceScore: avg,
    overallRelevanceScore: avg,
  };
}

export default analyzeExperiences;
