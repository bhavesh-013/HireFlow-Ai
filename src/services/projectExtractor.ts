/**
 * Project Extractor & Job Description Ranker Service
 * Extracts full resume project entries from GitHub repositories and orders them
 * according to relevance to a target Job Description.
 */

import { GitHubRepoItem, ProjectItem } from '../types';
import { skillExtractor } from './skillExtractor';
import { aiService } from './ai.service';

export interface ExtractedProjectItem extends ProjectItem {
  relevanceScore?: number; // 0-100% match with target Job Description
  qualityScore?: number;   // 0-100% ATS quality score
  sourceRepo?: string;
  matchedKeywords?: string[];
}

/**
 * Clean and format raw repository names into professional project titles.
 */
export function formatProjectTitle(repoName: string): string {
  if (!repoName) return 'Untitled Project';

  return repoName
    .replace(/[-_]/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .split(' ')
    .map((word) => {
      const w = word.trim();
      if (!w) return '';
      // Retain standard capitalized acronyms
      if (['ai', 'api', 'ui', 'ux', 'db', 'cli', 'iot', 'sdk', 'pwa', 'e2e'].includes(w.toLowerCase())) {
        return w.toUpperCase();
      }
      return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
    })
    .join(' ')
    .trim();
}

/**
 * Extracts a complete ProjectItem structure from a repository and its analyzed files.
 */
export function extractProjectFromRepo(
  repo: GitHubRepoItem,
  files: Map<string, string>,
  tree?: any[]
): ExtractedProjectItem {
  const cleanTitle = formatProjectTitle(repo.name);
  const extractedSkills = skillExtractor.extractSkillsFromRepo(repo, files, tree);
  const rawTech = Array.from(new Set(extractedSkills.map((s) => s.name)));

  // Fallback to repo language if valid and not Unknown
  if (rawTech.length === 0 && repo.language && repo.language.toLowerCase() !== 'unknown') {
    rawTech.push(repo.language);
  }

  // Filter out any 'Unknown' strings or empty values
  const filteredTech = rawTech.filter(
    (t) => t && t.trim() && t.toLowerCase() !== 'unknown'
  );

  // Extract description snippet from README if available
  let readmeSnippet = '';
  for (const [path, content] of files.entries()) {
    if (path.toLowerCase().startsWith('readme')) {
      const cleanLines = content
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#') && !l.startsWith('!['))
        .slice(0, 3);
      readmeSnippet = cleanLines.join(' ');
      break;
    }
  }

  const description =
    repo.description ||
    readmeSnippet.slice(0, 160) ||
    (filteredTech.length > 0
      ? `Full-stack application built with ${filteredTech.slice(0, 3).join(', ')}.`
      : `Full-stack web application with modern architecture.`);

  // Generate 3 STAR formatted accomplishment bullets without 'Unknown'
  const primaryTechStr = filteredTech.length > 0 ? ` utilizing ${filteredTech.slice(0, 3).join(', ')}` : '';
  const secondaryTechStr = filteredTech.length > 3 ? ` with ${filteredTech.slice(3, 5).join(' & ')}` : '';
  const starCountStr = repo.stars > 0 ? ` with ${repo.stars} GitHub stars` : '';

  const bullets = [
    `Architected and deployed open-source project "${cleanTitle}"${starCountStr}${primaryTechStr}.`,
    `Engineered modular component architecture and automated data processing pipeline${secondaryTechStr}.`,
    `Implemented production-ready testing suite and continuous integration workflows ensuring high availability.`,
  ];

  // Base ATS quality score
  const qualityScore = Math.min(98, 85 + Math.min(10, repo.stars) + (filteredTech.length > 2 ? 3 : 0));

  const liveUrl = repo.homepage && repo.homepage.startsWith('http') ? repo.homepage : undefined;

  return {
    id: `gh_proj_${repo.id}_${Date.now()}`,
    title: cleanTitle,
    description,
    techStack: filteredTech.slice(0, 6),
    link: repo.url,
    demoUrl: liveUrl,
    liveUrl: liveUrl,
    stars: repo.stars,
    bullets,
    projectType: filteredTech.includes('React') || filteredTech.includes('Next.js') ? 'Full Stack' : 'Open Source',
    qualityScore,
    sourceRepo: repo.name,
    relevanceScore: 0,
    matchedKeywords: [],
  };
}

/**
 * Extracts key technical terms and concepts from a Job Description.
 */
function extractJobKeywords(jobDescription: string): string[] {
  if (!jobDescription) return [];
  const normalized = jobDescription.toLowerCase();

  const commonKeywords = [
    'react', 'next.js', 'typescript', 'javascript', 'node.js', 'express',
    'python', 'django', 'fastapi', 'flask', 'java', 'spring', 'go', 'rust',
    'postgresql', 'mongodb', 'mysql', 'redis', 'graphql', 'rest api',
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'tailwind',
    'frontend', 'backend', 'full stack', 'news', 'dashboard', 'ai', 'machine learning',
    'automation', 'analytics', 'testing', 'cypress', 'jest', 'playwright',
  ];

  return commonKeywords.filter((kw) => normalized.includes(kw));
}

/**
 * Ranks projects based on relevance to a target Job Description.
 */
export function rankProjectsByJobDescription(
  projects: ExtractedProjectItem[],
  jobDescription?: string
): ExtractedProjectItem[] {
  if (!jobDescription || !jobDescription.trim()) {
    // Default sort by stars and quality score if no JD provided
    return [...projects].sort((a, b) => (b.stars || 0) - (a.stars || 0) || (b.qualityScore || 0) - (a.qualityScore || 0));
  }

  const jdKeywords = extractJobKeywords(jobDescription);
  if (jdKeywords.length === 0) {
    return [...projects].sort((a, b) => (b.stars || 0) - (a.stars || 0));
  }

  const scoredProjects = projects.map((proj) => {
    const projContent = `${proj.title} ${proj.description} ${proj.techStack.join(' ')} ${proj.bullets.join(' ')}`.toLowerCase();
    const matched = jdKeywords.filter((kw) => projContent.includes(kw));

    // Calculate score based on matched percentage & total matches
    const matchPercentage = Math.round((matched.length / jdKeywords.length) * 100);
    const relevanceScore = Math.min(99, Math.max(40, matchPercentage + matched.length * 5));

    return {
      ...proj,
      relevanceScore,
      matchedKeywords: matched,
    };
  });

  // Sort descending by relevance score
  return scoredProjects.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
}

/**
 * High-level orchestration for project extraction & AI enhancement.
 */
export async function extractAndRankProjects(
  repos: GitHubRepoItem[],
  filesMap: Map<string, Map<string, string>>,
  targetJobDescription?: string
): Promise<ExtractedProjectItem[]> {
  const rawProjects: ExtractedProjectItem[] = [];

  for (const repo of repos) {
    const repoFiles = filesMap.get(repo.id) || new Map();
    const proj = extractProjectFromRepo(repo, repoFiles);
    rawProjects.push(proj);
  }

  // Attempt AI enhancement if configured
  try {
    const aiResponse = await aiService.importGitHubProjects(repos, targetJobDescription);
    if (aiResponse && aiResponse.projects && Array.isArray(aiResponse.projects) && aiResponse.projects.length > 0) {
      // Merge AI generated bullets into our extracted structures
      const enhancedMap = new Map<string, any>();
      aiResponse.projects.forEach((p: any) => {
        enhancedMap.set((p.title || '').toLowerCase().replace(/ /g, ''), p);
      });

      rawProjects.forEach((proj) => {
        const key = proj.title.toLowerCase().replace(/ /g, '');
        const aiProj = enhancedMap.get(key);
        if (aiProj) {
          if (aiProj.bullets && aiProj.bullets.length > 0) proj.bullets = aiProj.bullets;
          if (aiProj.description) proj.description = aiProj.description;
          if (aiProj.techStack && aiProj.techStack.length > 0) proj.techStack = aiProj.techStack;
        }
      });
    }
  } catch (err) {
    console.warn('AI Project enhancement fallback to heuristic ranking:', err);
  }

  // Rank by Job Description
  return rankProjectsByJobDescription(rawProjects, targetJobDescription);
}

export const projectExtractor = {
  formatProjectTitle,
  extractProjectFromRepo,
  rankProjectsByJobDescription,
  extractAndRankProjects,
};

export default projectExtractor;
