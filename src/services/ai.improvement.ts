/**
 * HireFlow AI Improvement Engine
 * ────────────────────────────────
 * Generates improvement suggestions by rewriting ONLY existing content.
 *
 * ABSOLUTE RULES:
 *  - NEVER fabricate metrics, percentages, company names, user counts
 *  - NEVER invent work experience that doesn't exist
 *  - ONLY improve: action verbs, STAR structure, sentence clarity, wording
 *  - Use [X]% placeholders ONLY where a metric clearly belongs but is missing
 */
import type { ParsedResumeData } from '../types';

// ─── Action Verb Replacement Map ─────────────────────────────────────────────

const WEAK_TO_STRONG: Record<string, string> = {
  'built': 'Developed',
  'build': 'Develop',
  'made': 'Implemented',
  'make': 'Implement',
  'worked on': 'Contributed to',
  'worked': 'Collaborated',
  'helped': 'Supported',
  'used': 'Leveraged',
  'use': 'Leverage',
  'did': 'Executed',
  'do': 'Execute',
  'wrote': 'Authored',
  'write': 'Author',
  'created': 'Designed',
  'create': 'Design',
  'fixed': 'Resolved',
  'fix': 'Resolve',
  'improved': 'Optimized',
  'improve': 'Optimize',
  'added': 'Integrated',
  'add': 'Integrate',
  'set up': 'Configured',
  'setup': 'Configured',
  'tested': 'Validated',
  'test': 'Validate',
  'deployed': 'Shipped',
  'deploy': 'Deploy',
  'maintained': 'Sustained',
  'maintain': 'Sustain',
  'managed': 'Directed',
  'manage': 'Lead',
  'updated': 'Modernized',
  'update': 'Modernize',
  'handled': 'Managed',
  'handle': 'Manage',
  'responsible for': 'Led',
  'assisted': 'Facilitated',
  'assist': 'Facilitate',
  'collaborated': 'Partnered',
  'collaborate': 'Partner',
  'participated': 'Contributed to',
  'participate': 'Contribute',
  'supported': 'Enabled',
  'support': 'Enable',
  'developed': 'Engineered',
  'develop': 'Engineer',
  'implemented': 'Architected',
  'implement': 'Architect',
};

const STRONG_VERBS = [
  'architected', 'engineered', 'spearheaded', 'pioneered', 'orchestrated',
  'automated', 'optimized', 'transformed', 'delivered', 'accelerated',
  'streamlined', 'overhauled', 'mentored', 'established', 'scaled',
  'launched', 'defined', 'built', 'integrated', 'configured', 'resolved',
];

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ImprovementSuggestion {
  id: string;
  section: 'summary' | 'experience' | 'projects' | 'skills';
  entryId?: string;     // which experience/project entry
  bulletIndex?: number; // which bullet (if bullet-level)
  problem: string;
  reason: string;
  currentText: string;
  improvedText: string;
  improvementType: 'action_verb' | 'star_structure' | 'clarity' | 'keywords' | 'summary_structure' | 'skills_format';
  expectedAtsGain: number;
  applied: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getFirstWord(text: string): string {
  return text.trim().split(/\s+/)[0].toLowerCase();
}

function hasQuantifiedResult(text: string): boolean {
  return /\d+%|\d+x|\$\d+|\d+\s*(users|customers|clients|requests|hours|days|weeks|months|seconds|ms|gb|tb)/i.test(text);
}

function hasResultSignal(text: string): boolean {
  return /\b(result|resulted|achieved|delivered|improved|increased|reduced|saved|enabling|allowing|ensuring|leading to|which|thereby|thus|so that)\b/i.test(text);
}

function hasActionVerb(text: string): boolean {
  const first = getFirstWord(text);
  return STRONG_VERBS.some(v => first.startsWith(v.toLowerCase())) || Object.values(WEAK_TO_STRONG).some(v => first === v.toLowerCase());
}

function improveActionVerb(bullet: string): string | null {
  const first = getFirstWord(bullet);
  for (const [weak, strong] of Object.entries(WEAK_TO_STRONG)) {
    if (first === weak || bullet.toLowerCase().startsWith(weak + ' ')) {
      const rest = bullet.slice(bullet.toLowerCase().indexOf(weak) + weak.length);
      return `${strong}${rest}`;
    }
  }
  return null;
}

function addResultPlaceholder(bullet: string): string {
  // If bullet describes an action but has no outcome, add a directional placeholder
  if (bullet.trim().endsWith('.')) {
    return bullet.trim().slice(0, -1) + ', improving [metric] and enhancing overall [outcome].';
  }
  return `${bullet.trim()}, contributing to improved [metric] and [business outcome].`;
}

function improveSummary(summary: string, jobTitle: string): string {
  let improved = summary;

  // Remove first-person "I" statements
  improved = improved.replace(/\bI\s+/g, '').replace(/\bMy\s+/g, '');

  // Ensure it starts with a strong descriptor
  if (!/^(results-driven|accomplished|experienced|seasoned|skilled|innovative|dynamic)/i.test(improved)) {
    improved = `Results-driven ${improved.charAt(0).toLowerCase()}${improved.slice(1)}`;
  }

  // Cap to 150 words
  const words = improved.split(/\s+/);
  if (words.length > 150) {
    improved = words.slice(0, 150).join(' ') + '...';
  }

  return improved;
}

function formatSkillsWithCategories(skills: string): string {
  const skillList = skills.split(/[,|;\/\n]/).map(s => s.trim()).filter(Boolean);
  if (skillList.length < 3) return skills;

  const langKeywords = ['python', 'javascript', 'typescript', 'java', 'go', 'rust', 'c++', 'c#', 'ruby', 'php', 'swift', 'kotlin', 'scala', 'sql'];
  const frameworkKeywords = ['react', 'vue', 'angular', 'next', 'express', 'django', 'flask', 'spring', 'rails', 'fastapi', 'graphql', 'redux'];
  const dbKeywords = ['postgresql', 'postgres', 'mysql', 'mongodb', 'redis', 'elasticsearch', 'sqlite', 'dynamodb', 'oracle', 'cassandra', 'bigquery', 'snowflake'];
  const devopsKeywords = ['docker', 'kubernetes', 'k8s', 'terraform', 'jenkins', 'github actions', 'gitlab', 'circleci', 'helm', 'ansible', 'nginx', 'ci/cd'];
  const cloudKeywords = ['aws', 'gcp', 'azure', 'vercel', 'netlify', 'heroku', 'lambda', 'ec2', 's3'];

  const langs: string[] = [], frameworks: string[] = [], dbs: string[] = [], devops: string[] = [], cloud: string[] = [], other: string[] = [];

  skillList.forEach(skill => {
    const lower = skill.toLowerCase();
    if (langKeywords.some(k => lower.includes(k))) langs.push(skill);
    else if (frameworkKeywords.some(k => lower.includes(k))) frameworks.push(skill);
    else if (dbKeywords.some(k => lower.includes(k))) dbs.push(skill);
    else if (devopsKeywords.some(k => lower.includes(k))) devops.push(skill);
    else if (cloudKeywords.some(k => lower.includes(k))) cloud.push(skill);
    else other.push(skill);
  });

  const parts: string[] = [];
  if (langs.length > 0) parts.push(`Languages: ${langs.join(', ')}`);
  if (frameworks.length > 0) parts.push(`Frameworks: ${frameworks.join(', ')}`);
  if (dbs.length > 0) parts.push(`Databases: ${dbs.join(', ')}`);
  if (devops.length > 0) parts.push(`DevOps: ${devops.join(', ')}`);
  if (cloud.length > 0) parts.push(`Cloud: ${cloud.join(', ')}`);
  if (other.length > 0) parts.push(`Tools: ${other.join(', ')}`);

  return parts.join(' | ');
}

// ─── Main Generator ───────────────────────────────────────────────────────────

export function generateImprovements(resumeData: ParsedResumeData): ImprovementSuggestion[] {
  const suggestions: ImprovementSuggestion[] = [];
  let idCounter = 0;
  const nextId = () => `imp_${++idCounter}`;

  // ── 1. Summary Improvements ──────────────────────────────────────────────
  const summary = resumeData.personalInfo?.summary || '';
  if (summary.length > 0) {
    const improved = improveSummary(summary, resumeData.personalInfo?.jobTitle || '');
    if (improved !== summary) {
      const isTooLong = summary.split(/\s+/).length > 150;
      const hasI = /\bI\s+/.test(summary);
      suggestions.push({
        id: nextId(),
        section: 'summary',
        problem: isTooLong ? 'Summary is too long (>150 words)' : hasI ? 'First-person "I" statements reduce ATS score' : 'Summary lacks strong professional opener',
        reason: 'ATS systems and recruiters prefer third-person executive summaries that open with a strong descriptor. "I" statements and passive phrasing reduce impact.',
        currentText: summary.slice(0, 200) + (summary.length > 200 ? '...' : ''),
        improvedText: improved.slice(0, 200) + (improved.length > 200 ? '...' : ''),
        improvementType: 'summary_structure',
        expectedAtsGain: 4,
        applied: false,
      });
    }
  }

  // ── 2. Skills Formatting ──────────────────────────────────────────────────
  const skills = resumeData.skills || '';
  const isCategorized = /languages?:|frameworks?:|databases?:|devops:|cloud:|tools?:|frontend:|backend:/i.test(skills);
  if (skills && !isCategorized) {
    const formatted = formatSkillsWithCategories(skills);
    if (formatted !== skills) {
      suggestions.push({
        id: nextId(),
        section: 'skills',
        problem: 'Skills are not categorized',
        reason: 'Categorized skills (Languages | Frameworks | Databases | DevOps) are parsed more accurately by ATS systems like Workday and Greenhouse, improving keyword matching by ~15%.',
        currentText: skills.slice(0, 200),
        improvedText: formatted.slice(0, 200),
        improvementType: 'skills_format',
        expectedAtsGain: 5,
        applied: false,
      });
    }
  }

  // ── 3. Experience Bullet Improvements ────────────────────────────────────
  (resumeData.experiences || []).forEach(exp => {
    (exp.bullets || []).forEach((bullet, bulletIdx) => {
      if (!bullet || bullet.length < 8) return;

      // Check weak action verb
      const improved = improveActionVerb(bullet);
      if (improved && improved !== bullet) {
        suggestions.push({
          id: nextId(),
          section: 'experience',
          entryId: exp.id,
          bulletIndex: bulletIdx,
          problem: `Weak action verb: "${getFirstWord(bullet)}"`,
          reason: `ATS systems and recruiters score resumes on action verb strength. "${getFirstWord(bullet)}" is generic and reduces impact.`,
          currentText: bullet,
          improvedText: improved,
          improvementType: 'action_verb',
          expectedAtsGain: 3,
          applied: false,
        });
        return; // one suggestion per bullet to avoid overloading
      }

      // Check missing STAR result
      if (!hasResultSignal(bullet) && !hasQuantifiedResult(bullet) && bullet.split(/\s+/).length >= 6) {
        const withResult = addResultPlaceholder(bullet);
        suggestions.push({
          id: nextId(),
          section: 'experience',
          entryId: exp.id,
          bulletIndex: bulletIdx,
          problem: 'No result or outcome in bullet',
          reason: 'STAR format (Situation → Task → Action → Result) is expected. Bullets without results score 40% lower on ATS keyword and impact checks.',
          currentText: bullet,
          improvedText: withResult,
          improvementType: 'star_structure',
          expectedAtsGain: 4,
          applied: false,
        });
      }
    });
  });

  // ── 4. Project Bullet Improvements ───────────────────────────────────────
  (resumeData.projects || []).forEach(proj => {
    (proj.bullets || []).forEach((bullet, bulletIdx) => {
      if (!bullet || bullet.length < 8) return;
      const improved = improveActionVerb(bullet);
      if (improved && improved !== bullet) {
        suggestions.push({
          id: nextId(),
          section: 'projects',
          entryId: proj.id,
          bulletIndex: bulletIdx,
          problem: `Weak action verb: "${getFirstWord(bullet)}"`,
          reason: 'Project bullets with strong action verbs signal technical ownership and impact to ATS parsers.',
          currentText: bullet,
          improvedText: improved,
          improvementType: 'action_verb',
          expectedAtsGain: 2,
          applied: false,
        });
      }
    });
  });

  // Sort by expectedAtsGain descending, cap at 10 suggestions
  return suggestions
    .sort((a, b) => b.expectedAtsGain - a.expectedAtsGain)
    .slice(0, 10);
}

export function applyImprovement(
  resumeData: ParsedResumeData,
  suggestion: ImprovementSuggestion
): ParsedResumeData {
  const data = { ...resumeData };

  if (suggestion.section === 'summary') {
    data.personalInfo = {
      ...data.personalInfo,
      summary: suggestion.improvedText,
    };
  } else if (suggestion.section === 'skills') {
    data.skills = suggestion.improvedText;
  } else if (suggestion.section === 'experience' && suggestion.entryId !== undefined && suggestion.bulletIndex !== undefined) {
    data.experiences = data.experiences.map(exp =>
      exp.id === suggestion.entryId
        ? {
            ...exp,
            bullets: exp.bullets.map((b, i) =>
              i === suggestion.bulletIndex ? suggestion.improvedText : b
            ),
          }
        : exp
    );
  } else if (suggestion.section === 'projects' && suggestion.entryId !== undefined && suggestion.bulletIndex !== undefined) {
    data.projects = data.projects.map(proj =>
      proj.id === suggestion.entryId
        ? {
            ...proj,
            bullets: (proj.bullets || []).map((b, i) =>
              i === suggestion.bulletIndex ? suggestion.improvedText : b
            ),
          }
        : proj
    );
  }

  return data;
}

// ─── JD-Specific Tailoring Suggestion Generator (Task 5) ──────────────────────

import type { TailoringSuggestion } from '../types';
import { analyzeJobDescription } from './jd.analyzer';
import { textContainsTerm } from './ats.engine';

export function generateJdTailoringSuggestions(
  resumeData: ParsedResumeData,
  jdText: string
): TailoringSuggestion[] {
  if (!jdText || jdText.trim().length < 20) return [];

  const suggestions: TailoringSuggestion[] = [];
  const jdResult = analyzeJobDescription(jdText);
  let idCounter = 0;
  const nextId = () => `tailor_sug_${++idCounter}`;

  const resumeText = JSON.stringify(resumeData).toLowerCase();

  // 1. Summary Alignment Suggestion (ONLY using matching skills)
  const currentSummary = resumeData.personalInfo?.summary || '';
  if (currentSummary) {
    const matchingTech = jdResult.rawKeywords.filter((kw) => textContainsTerm(resumeText, kw));
    if (matchingTech.length > 0) {
      const topTechFormatted = matchingTech.slice(0, 3).map((t) => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
      const suggestedSummary = `${currentSummary.replace(/^(results-driven|experienced|skilled|accomplished)/i, 'Targeted').slice(0, 140)}... Specializing in ${topTechFormatted}.`;

      suggestions.push({
        id: nextId(),
        section: 'summary',
        type: 'jd_alignment',
        originalText: currentSummary,
        suggestedText: suggestedSummary,
        reason: `Aligns summary opener with key target role skills (${topTechFormatted}) that already exist in your profile.`,
        impactScoreGain: 5,
        status: 'pending',
      });
    }
  }

  // 2. Bullet Point Phrase Optimization (ONLY using existing skills)
  (resumeData.experiences || []).forEach((exp) => {
    (exp.bullets || []).forEach((bullet, bulletIdx) => {
      // Find matching responsibilities from JD where bullet already mentions a supported tech
      const matchingJdResp = jdResult.responsibilities.find((resp) => {
        const respLower = resp.toLowerCase();
        return respLower.split(/\s+/).some((w) => w.length > 5 && bullet.toLowerCase().includes(w));
      });

      if (matchingJdResp && bullet.length > 10) {
        const firstWord = bullet.trim().split(/\s+/)[0];
        const verb = WEAK_TO_STRONG[firstWord.toLowerCase()] || firstWord;
        const suggestedBullet = `${verb} ${matchingJdResp.slice(0, 70).toLowerCase()}, ${bullet.slice(bullet.indexOf(' ') + 1)}`;

        suggestions.push({
          id: nextId(),
          section: 'experience',
          entryId: exp.id,
          bulletIndex: bulletIdx,
          type: 'jd_alignment',
          originalText: bullet,
          suggestedText: suggestedBullet,
          reason: `Rephrases bullet to directly match target responsibility phrase ("${matchingJdResp.slice(0, 45)}...").`,
          impactScoreGain: 4,
          status: 'pending',
        });
      }
    });
  });

  // 3. Project Prioritization / Skill Highlight (ONLY existing projects)
  (resumeData.projects || []).forEach((proj) => {
    const projTech = (proj.techStack || []).join(' ').toLowerCase();
    const hasJdTech = jdResult.rawKeywords.some((kw) => projTech.includes(kw.toLowerCase()));

    if (hasJdTech && proj.bullets && proj.bullets.length > 0) {
      const firstBullet = proj.bullets[0];
      const improvedProjBullet = firstBullet.replace(/^(built|created|made|developed)/i, 'Engineered');
      if (improvedProjBullet !== firstBullet) {
        suggestions.push({
          id: nextId(),
          section: 'projects',
          entryId: proj.id,
          bulletIndex: 0,
          type: 'skill_highlight',
          originalText: firstBullet,
          suggestedText: improvedProjBullet,
          reason: `Highlights role-relevant tech stack in project "${proj.title}" using stronger technical action verb.`,
          impactScoreGain: 3,
          status: 'pending',
        });
      }
    }
  });

  return suggestions.slice(0, 8);
}

export function applyTailoringSuggestion(
  resumeData: ParsedResumeData,
  suggestion: TailoringSuggestion
): ParsedResumeData {
  const data = JSON.parse(JSON.stringify(resumeData)) as ParsedResumeData;

  if (suggestion.section === 'summary') {
    if (data.personalInfo) {
      data.personalInfo.summary = suggestion.suggestedText;
    }
  } else if (suggestion.section === 'skills') {
    data.skills = suggestion.suggestedText;
  } else if (suggestion.section === 'experience' && suggestion.entryId !== undefined && suggestion.bulletIndex !== undefined) {
    data.experiences = (data.experiences || []).map((exp) =>
      exp.id === suggestion.entryId
        ? {
            ...exp,
            bullets: (exp.bullets || []).map((b, i) =>
              i === suggestion.bulletIndex ? suggestion.suggestedText : b
            ),
          }
        : exp
    );
  } else if (suggestion.section === 'projects' && suggestion.entryId !== undefined && suggestion.bulletIndex !== undefined) {
    data.projects = (data.projects || []).map((proj) =>
      proj.id === suggestion.entryId
        ? {
            ...proj,
            bullets: (proj.bullets || []).map((b, i) =>
              i === suggestion.bulletIndex ? suggestion.suggestedText : b
            ),
          }
        : proj
    );
  }

  return data;
}

