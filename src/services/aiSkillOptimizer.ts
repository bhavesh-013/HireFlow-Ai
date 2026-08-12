/**
 * AI Skill Optimizer Service
 * Uses Claude / Gemini AI to clean, deduplicate, expand abbreviations (JS -> JavaScript),
 * and format extracted skills into ATS-friendly tech keywords.
 * Includes client-side fallback if AI fails or is unconfigured.
 */

import { ExtractedSkill } from '../types';
import { aiService } from './ai.service';

/** Standard ATS normalization mapping for client-side fallback */
const ATS_NORMALIZATION_RULES: Record<string, string> = {
  js: 'JavaScript',
  ts: 'TypeScript',
  node: 'Node.js',
  nodejs: 'Node.js',
  express: 'Express.js',
  expressjs: 'Express.js',
  react: 'React',
  reactjs: 'React',
  vue: 'Vue.js',
  vuejs: 'Vue.js',
  next: 'Next.js',
  nextjs: 'Next.js',
  tailwind: 'Tailwind CSS',
  tailwindcss: 'Tailwind CSS',
  postgres: 'PostgreSQL',
  postgresql: 'PostgreSQL',
  mongo: 'MongoDB',
  mongodb: 'MongoDB',
  docker: 'Docker',
  k8s: 'Kubernetes',
  aws: 'AWS',
  gcp: 'Google Cloud Platform (GCP)',
  azure: 'Microsoft Azure',
  py: 'Python',
  cpp: 'C++',
  csharp: 'C#',
};

export async function optimizeSkillsWithAI(
  rawSkills: ExtractedSkill[],
  targetRole?: string
): Promise<ExtractedSkill[]> {
  if (!rawSkills || rawSkills.length === 0) {
    return [];
  }

  try {
    const rawSkillNames = rawSkills.map((s) => s.name);

    // Call AI Edge function or direct Claude endpoint
    const response = await aiService.importGitHubSkills(
      rawSkills.map((s) => ({ language: s.name, description: s.reason })),
      targetRole
    );

    if (response && response.skills && Array.isArray(response.skills) && response.skills.length > 0) {
      // Map AI returned strings back into ExtractedSkill structures
      const aiSkillsList: string[] = response.skills;

      return aiSkillsList.map((skillName) => {
        // Find existing match if possible to keep original confidence & sourceRepo
        const existing = rawSkills.find(
          (r) => r.name.toLowerCase() === skillName.toLowerCase()
        );

        return {
          name: skillName,
          sourceRepo: existing?.sourceRepo || 'GitHub Analyzed',
          confidence: existing?.confidence || 90,
          reason: existing?.reason || 'AI Optimized & Industry Validated',
          category: existing?.category || inferCategory(skillName),
        };
      });
    }
  } catch (err) {
    console.warn('AI Skill Optimization failed, using heuristic ATS normalization fallback:', err);
  }

  // Fallback: Apply client-side heuristic normalization and deduplication
  return fallbackHeuristicOptimization(rawSkills);
}

function fallbackHeuristicOptimization(rawSkills: ExtractedSkill[]): ExtractedSkill[] {
  const resultMap = new Map<string, ExtractedSkill>();

  for (const skill of rawSkills) {
    const lower = skill.name.trim().toLowerCase();
    const normalizedName = ATS_NORMALIZATION_RULES[lower] || skill.name;
    const key = normalizedName.toLowerCase();

    const existing = resultMap.get(key);
    if (!existing || existing.confidence < skill.confidence) {
      resultMap.set(key, {
        ...skill,
        name: normalizedName,
        category: skill.category || inferCategory(normalizedName),
      });
    }
  }

  return Array.from(resultMap.values()).sort((a, b) => b.confidence - a.confidence);
}

function inferCategory(skillName: string): string {
  const lower = skillName.toLowerCase();
  if (['react', 'vue', 'next.js', 'angular', 'svelte', 'tailwind css', 'bootstrap', 'html', 'css', 'typescript', 'javascript', 'frontend'].some(k => lower.includes(k))) {
    return 'Frontend';
  }
  if (['node.js', 'express.js', 'nestjs', 'python', 'django', 'flask', 'fastapi', 'java', 'spring', 'go', 'rust', 'c++', 'graphql', 'rest api', 'backend'].some(k => lower.includes(k))) {
    return 'Backend';
  }
  if (['postgresql', 'mongodb', 'mysql', 'redis', 'prisma', 'supabase', 'firebase', 'sqlite', 'database'].some(k => lower.includes(k))) {
    return 'Database';
  }
  if (['docker', 'kubernetes', 'github actions', 'ci/cd', 'terraform'].some(k => lower.includes(k))) {
    return 'DevOps';
  }
  if (['aws', 'gcp', 'azure', 'vercel', 'netlify', 'cloud'].some(k => lower.includes(k))) {
    return 'Cloud';
  }
  if (['pytorch', 'tensorflow', 'scikit-learn', 'openai', 'gemini', 'langchain', 'pinecone', 'ai', 'ml'].some(k => lower.includes(k))) {
    return 'AI/ML';
  }
  if (['jest', 'vitest', 'cypress', 'playwright', 'testing'].some(k => lower.includes(k))) {
    return 'Testing';
  }
  return 'Tools';
}

export const aiSkillOptimizer = {
  optimizeSkillsWithAI,
};

export default aiSkillOptimizer;
