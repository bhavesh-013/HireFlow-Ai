/**
 * Skill Merger Utility
 * Intelligently merges extracted skills with the existing resume's skills string.
 * Preserves user-written skills, eliminates duplicates, highlights new skills,
 * and formats everything back into an ATS-friendly string.
 */

import { ExtractedSkill } from '../types';

export interface SkillMergeResult {
  mergedSkills: ExtractedSkill[];
  newSkillsCount: number;
  existingSkillsCount: number;
  formattedSkillsString: string;
}

/**
 * Parses existing skills string (comma or pipe separated, or category grouped)
 * into a set of normalized skill names.
 */
export function parseExistingSkills(skillsString: string): Set<string> {
  const existingSet = new Set<string>();
  if (!skillsString || !skillsString.trim()) return existingSet;

  // Handles both "Category: Skill1, Skill2 | Category2: Skill3" and simple "Skill1, Skill2, Skill3"
  const sections = skillsString.split('|');

  for (const section of sections) {
    const parts = section.split(':');
    const rawSkillsList = parts.length > 1 ? parts[1] : parts[0];
    const skillItems = rawSkillsList.split(',');

    for (const item of skillItems) {
      const clean = item.trim();
      if (clean) {
        existingSet.add(clean.toLowerCase());
      }
    }
  }

  return existingSet;
}

/**
 * Merges newly extracted skills with existing skills string.
 */
export function mergeSkills(
  existingSkillsString: string,
  newSkills: ExtractedSkill[]
): SkillMergeResult {
  const existingSet = parseExistingSkills(existingSkillsString);
  const mergedSkillsMap = new Map<string, ExtractedSkill>();
  let newSkillsCount = 0;

  // First, populate existing skills from current resume
  if (existingSkillsString && existingSkillsString.trim()) {
    const sections = existingSkillsString.split('|');
    for (const section of sections) {
      const parts = section.split(':');
      const cat = parts.length > 1 ? parts[0].trim() : 'Technical Skills';
      const rawSkillsList = parts.length > 1 ? parts[1] : parts[0];
      const skillItems = rawSkillsList.split(',');

      for (const item of skillItems) {
        const cleanName = item.trim();
        if (cleanName) {
          mergedSkillsMap.set(cleanName.toLowerCase(), {
            name: cleanName,
            sourceRepo: 'User Resume',
            confidence: 100,
            reason: 'Existing skill in resume',
            isNew: false,
            category: cat,
          });
        }
      }
    }
  }

  // Second, merge newly extracted skills
  for (const skill of newSkills) {
    const key = skill.name.toLowerCase();
    if (!existingSet.has(key) && !mergedSkillsMap.has(key)) {
      mergedSkillsMap.set(key, {
        ...skill,
        isNew: true,
      });
      newSkillsCount++;
    }
  }

  const mergedList = Array.from(mergedSkillsMap.values());
  const existingSkillsCount = existingSet.size;
  const formattedSkillsString = formatSkillsString(mergedList);

  return {
    mergedSkills: mergedList,
    newSkillsCount,
    existingSkillsCount,
    formattedSkillsString,
  };
}

/**
 * Formats a list of skills into an ATS-friendly categorized string.
 * Example: "Frontend: React, TypeScript | Backend: Node.js, Express | Database: PostgreSQL"
 */
export function formatSkillsString(skills: ExtractedSkill[]): string {
  const categoryMap = new Map<string, string[]>();

  for (const skill of skills) {
    const cat = skill.category || 'Technical Skills';
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, []);
    }
    const list = categoryMap.get(cat)!;
    if (!list.includes(skill.name)) {
      list.push(skill.name);
    }
  }

  const sections: string[] = [];
  // Standard category order for ATS readability
  const categoryOrder = [
    'Frontend',
    'Backend',
    'Database',
    'DevOps',
    'Cloud',
    'AI/ML',
    'Mobile',
    'Testing',
    'Tools',
    'Languages',
    'Technical Skills',
  ];

  for (const cat of categoryOrder) {
    if (categoryMap.has(cat) && categoryMap.get(cat)!.length > 0) {
      sections.push(`${cat}: ${categoryMap.get(cat)!.join(', ')}`);
      categoryMap.delete(cat);
    }
  }

  // Add any remaining custom categories
  for (const [cat, list] of categoryMap.entries()) {
    if (list.length > 0) {
      sections.push(`${cat}: ${list.join(', ')}`);
    }
  }

  return sections.join(' | ');
}

export const skillMerger = {
  parseExistingSkills,
  mergeSkills,
  formatSkillsString,
};

export default skillMerger;
