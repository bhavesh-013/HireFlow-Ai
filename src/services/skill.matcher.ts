/**
 * Skills Gap Analyzer & Matcher
 * ──────────────────────────────
 * Categorizes every important JD skill:
 * 🟢 Strong Match (Directly proven in candidate resume with strong context)
 * 🟡 Partial Match (Related technology, partial mention, or peripheral context)
 * 🔴 Missing (Not evidenced anywhere in candidate resume)
 *
 * Enforces strict truthful non-fabrication principles.
 */

import type { ParsedResumeData } from '../types';
import { textContainsTerm, normalizeTerm } from './ats.engine';
import { ParsedJobDescription, JDSkillItem } from './jd.parser';
import { extractResumeSectionTexts } from './keyword.matcher';

export type SkillMatchGrade = 'strong' | 'partial' | 'missing';

export interface SkillGapItem {
  name: string;
  category: string;
  isRequired: boolean;
  frequency: number;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
  grade: SkillMatchGrade;
  evidenceContext?: string;
  recommendation: string;
}

export interface SkillGapAnalysisResult {
  skills: SkillGapItem[];
  strongMatches: SkillGapItem[];
  partialMatches: SkillGapItem[];
  missingSkills: SkillGapItem[];
  strongCount: number;
  partialCount: number;
  missingCount: number;
  skillsMatchPercentage: number;
  skillsScore: number; // 0-100
}

export function analyzeSkillGaps(
  resume: ParsedResumeData,
  parsedJd: ParsedJobDescription
): SkillGapAnalysisResult {
  const sections = extractResumeSectionTexts(resume);
  const fullText = sections.full.toLowerCase();

  const skillItems: SkillGapItem[] = [];

  parsedJd.allSkills.forEach((jdSkill) => {
    const term = jdSkill.name;
    const isDirectInSkills = textContainsTerm(sections.skills, term);
    const isDirectInExp = textContainsTerm(sections.experience, term);
    const isDirectInProj = textContainsTerm(sections.projects, term);
    const isDirectInSummary = textContainsTerm(sections.summary, term);

    let grade: SkillMatchGrade = 'missing';
    let evidenceContext = '';
    let recommendation = '';

    // Direct multi-section presence = Strong Match
    if ((isDirectInSkills && (isDirectInExp || isDirectInProj)) || (isDirectInExp && isDirectInProj)) {
      grade = 'strong';
      evidenceContext = `Evidenced across multiple sections (${[
        isDirectInSkills && 'Skills',
        isDirectInExp && 'Work Experience',
        isDirectInProj && 'Projects',
      ]
        .filter(Boolean)
        .join(', ')}).`;
      recommendation = `Strong match. Keep this skill highlighted in the top section of your resume.`;
    } else if (isDirectInSkills || isDirectInExp || isDirectInProj || isDirectInSummary) {
      // Single location mention
      grade = 'strong';
      evidenceContext = `Found in ${[
        isDirectInSkills && 'Skills list',
        isDirectInExp && 'Experience bullet',
        isDirectInProj && 'Project tech stack',
        isDirectInSummary && 'Summary',
      ]
        .filter(Boolean)
        .join(', ')}.`;
      recommendation = `Good match. Reinforce this skill by mentioning a concrete achievement or library tool in relevant experience.`;
    } else {
      // Check partial / semantic relationship
      const norm = normalizeTerm(term);
      let partialFound = false;

      if (norm === 'react' && fullText.includes('vue')) {
        partialFound = true;
        evidenceContext = 'Candidate has Vue.js experience (related modern component-based UI framework).';
      } else if (norm === 'postgresql' && (fullText.includes('mysql') || fullText.includes('sql'))) {
        partialFound = true;
        evidenceContext = 'Candidate has SQL / relational database experience.';
      } else if (norm === 'docker' && fullText.includes('container')) {
        partialFound = true;
        evidenceContext = 'Candidate has containerization experience.';
      } else if (norm === 'aws' && (fullText.includes('gcp') || fullText.includes('azure') || fullText.includes('cloud'))) {
        partialFound = true;
        evidenceContext = 'Candidate has cloud infrastructure experience (GCP/Azure).';
      } else if (norm === 'jest' && (fullText.includes('test') || fullText.includes('vitest') || fullText.includes('cypress'))) {
        partialFound = true;
        evidenceContext = 'Candidate has automated software testing experience.';
      }

      if (partialFound) {
        grade = 'partial';
        recommendation = `Candidate has foundational knowledge in related technologies. Mention "${term}" explicitly if you have practical familiarity.`;
      } else {
        grade = 'missing';
        recommendation = jdSkill.isRequired
          ? `Missing required skill. If you have practical project or work experience with ${term}, add it to your Technical Skills section.`
          : `Missing preferred skill. Optional to add if you possess working experience.`;
      }
    }

    skillItems.push({
      name: term,
      category: jdSkill.category,
      isRequired: jdSkill.isRequired,
      frequency: jdSkill.frequency,
      importance: jdSkill.importance,
      grade,
      evidenceContext,
      recommendation,
    });
  });

  const strongMatches = skillItems.filter((s) => s.grade === 'strong');
  const partialMatches = skillItems.filter((s) => s.grade === 'partial');
  const missingSkills = skillItems.filter((s) => s.grade === 'missing');

  const total = skillItems.length;
  const skillsMatchPercentage =
    total > 0
      ? Math.round(((strongMatches.length + partialMatches.length * 0.5) / total) * 100)
      : 80;

  // Calculate weighted score
  let earnedScore = 0;
  let maxScore = 0;
  skillItems.forEach((s) => {
    const weight = s.importance === 'Critical' ? 4 : s.importance === 'High' ? 3 : s.importance === 'Medium' ? 2 : 1;
    maxScore += weight;
    if (s.grade === 'strong') earnedScore += weight;
    else if (s.grade === 'partial') earnedScore += weight * 0.5;
  });

  const skillsScore = maxScore > 0 ? Math.min(100, Math.round((earnedScore / maxScore) * 100)) : 80;

  return {
    skills: skillItems,
    strongMatches,
    partialMatches,
    missingSkills,
    strongCount: strongMatches.length,
    partialCount: partialMatches.length,
    missingCount: missingSkills.length,
    skillsMatchPercentage,
    skillsScore,
  };
}

export default analyzeSkillGaps;
