/**
 * Red / Green / Yellow Diff Generator
 * ────────────────────────────────────
 * Generates visual diff representations between Original and Optimized Resumes:
 * 🔴 Red: Removed / replaced text
 * 🟢 Green: Added / improved text
 * 🟡 Yellow: Modified / recommended improvements
 */

import type { ParsedResumeData } from '../types';

export type DiffChangeType = 'added' | 'removed' | 'modified' | 'unchanged';

export interface DiffBlock {
  id: string;
  section: 'Header' | 'Summary' | 'Skills' | 'Experience' | 'Projects' | 'Education';
  itemTitle: string;
  type: DiffChangeType;
  originalText: string;
  optimizedText: string;
  explanation: string;
  categoryTag?: string;
}

export interface FullResumeDiffReport {
  blocks: DiffBlock[];
  totalModifications: number;
  addedCount: number;
  improvedCount: number;
  preservedFactualCount: number;
}

export function generateResumeDiff(
  original: ParsedResumeData,
  optimized: ParsedResumeData
): FullResumeDiffReport {
  const blocks: DiffBlock[] = [];
  let addedCount = 0;
  let improvedCount = 0;

  // 1. Summary Diff
  const origSummary = original.personalInfo?.summary || '';
  const optSummary = optimized.personalInfo?.summary || '';

  if (origSummary !== optSummary) {
    blocks.push({
      id: 'diff_summary',
      section: 'Summary',
      itemTitle: 'Professional Summary',
      type: 'modified',
      originalText: origSummary || '(No initial summary provided)',
      optimizedText: optSummary,
      explanation: 'Aligned with target job title and restructured into concise, high-impact phrasing.',
      categoryTag: 'Target Role Alignment',
    });
    improvedCount++;
  }

  // 2. Skills Diff
  const origSkills = typeof original.skills === 'string' ? original.skills : '';
  const optSkills = typeof optimized.skills === 'string' ? optimized.skills : '';

  if (origSkills !== optSkills) {
    blocks.push({
      id: 'diff_skills',
      section: 'Skills',
      itemTitle: 'Technical Skills Order & Focus',
      type: 'modified',
      originalText: origSkills,
      optimizedText: optSkills,
      explanation: 'Re-prioritized technical skills to emphasize JD-matching technologies first.',
      categoryTag: 'Skill Prioritization',
    });
    improvedCount++;
  }

  // 3. Experience Diffs (Bullet by bullet)
  const origExp = original.experiences || [];
  const optExp = optimized.experiences || [];

  origExp.forEach((exp, eIdx) => {
    const matchingOpt = optExp.find((o) => o.id === exp.id) || optExp[eIdx];
    if (!matchingOpt) return;

    (exp.bullets || []).forEach((origBullet, bIdx) => {
      const optBullet = matchingOpt.bullets?.[bIdx];
      if (optBullet && optBullet !== origBullet) {
        blocks.push({
          id: `diff_exp_${eIdx}_${bIdx}`,
          section: 'Experience',
          itemTitle: `${exp.title} at ${exp.company} (Bullet #${bIdx + 1})`,
          type: 'modified',
          originalText: origBullet,
          optimizedText: optBullet,
          explanation: 'Replaced weak action verbs with active technical verbs and reinforced STAR phrasing.',
          categoryTag: 'Action Verb Upgrade',
        });
        improvedCount++;
      }
    });
  });

  // 4. Project Diffs
  const origProj = original.projects || [];
  const optProj = optimized.projects || [];

  origProj.forEach((proj, pIdx) => {
    const matchingOpt = optProj.find((o) => o.id === proj.id) || optProj[pIdx];
    if (!matchingOpt) return;

    if (proj.description !== matchingOpt.description && matchingOpt.description) {
      blocks.push({
        id: `diff_proj_desc_${pIdx}`,
        section: 'Projects',
        itemTitle: `${proj.title} (Overview)`,
        type: 'modified',
        originalText: proj.description || '(No initial description)',
        optimizedText: matchingOpt.description,
        explanation: 'Clarified technical architecture and highlighted core technology stack.',
        categoryTag: 'Project Clarity',
      });
      improvedCount++;
    }

    (proj.bullets || []).forEach((origBullet, bIdx) => {
      const optBullet = matchingOpt.bullets?.[bIdx];
      if (optBullet && optBullet !== origBullet) {
        blocks.push({
          id: `diff_proj_b_${pIdx}_${bIdx}`,
          section: 'Projects',
          itemTitle: `${proj.title} (Bullet #${bIdx + 1})`,
          type: 'modified',
          originalText: origBullet,
          optimizedText: optBullet,
          explanation: 'Elevated technical specificity and improved readability for ATS parsers.',
          categoryTag: 'Technical Framing',
        });
        improvedCount++;
      }
    });
  });

  return {
    blocks,
    totalModifications: blocks.length,
    addedCount,
    improvedCount,
    preservedFactualCount: (original.experiences?.length || 0) + (original.education?.length || 0),
  };
}

export default generateResumeDiff;
