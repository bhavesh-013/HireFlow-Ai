import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import {
  callGeminiApi,
  parseJsonFromGemini,
} from '../_shared/gemini-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const ATS_WEIGHTS = {
  contact: 10,
  structure: 10,
  experience: 20,
  skills: 15,
  projects: 15,
  education: 10,
  formatting: 10,
  contentQuality: 10,
} as const;

type CategoryName = keyof typeof ATS_WEIGHTS;

interface CategoryAnalysis {
  score: number;
  maxScore: number;
  findings: string[];
  issues: string[];
  suggestions: string[];
}

interface JDAnalysis {
  available: boolean;
  matchScore: number | null;
  matchedKeywords: string[];
  missingKeywords: string[];
  matchedSkills: string[];
  missingSkills: string[];
  recommendedKeywords: string[];
  priorityProjects: Array<{
    project: string;
    priority: 'high' | 'medium' | 'low';
    reason: string;
  }>;
}

interface GeminiATSResponse {
  categories: Record<CategoryName, CategoryAnalysis>;
  issues: Array<{
    severity: 'critical' | 'warning' | 'info';
    category: CategoryName;
    title: string;
    message: string;
    suggestion: string;
  }>;
  jdMatch: JDAnalysis;
  summary: string;
}

function buildSystemPrompt(): string {
  return `
You are HireFlow AI's ATS resume analysis engine.

Analyze ONLY information explicitly present in the supplied resume and optional
job description. You are an analysis engine, not a resume writer.

ABSOLUTE RULES:
- Never invent companies, jobs, projects, skills, technologies, certifications,
  achievements, dates, education, responsibilities, links, metrics, percentages,
  salaries, users, revenue, or performance numbers.
- Never assume a skill because it is common for a role.
- Missing information must be reported as missing.
- Never create fake metrics.
- Never claim a resume is guaranteed to pass an ATS.
- Never calculate an overall ATS score.
- Return category scores only; the application calculates the final score.

Analyze exactly these 8 categories:

1. contact
   Check name, email, phone, location, LinkedIn, GitHub, portfolio.

2. structure
   Check clear headings, logical order, useful sections, duplicate sections,
   missing important sections, and organization.

3. experience
   Check role/company clarity, dates, responsibilities, accomplishments,
   bullet quality, action verbs, and real measurable results.
   Do not unfairly penalize freshers who lack professional experience.

4. skills
   Check technical skills, relevant technologies, organization, duplication,
   clarity, and relevance to the supplied JD when available.

5. projects
   Check project title, technologies, description, contribution,
   implementation details, real results, and actual links.

6. education
   Check degree, institution, dates, academic information, and consistency.

7. formatting
   Check standard headings, readable text, consistent dates and bullets,
   excessive decoration, tables/text structures that may hinder parsing,
   and unusual symbols.

8. contentQuality
   Check grammar, spelling, clarity, conciseness, action verbs, repetition,
   vague statements, bullet quality, and professional tone.

Score every category from 0 to 10:
10 excellent, 8-9 strong, 6-7 acceptable, 4-5 needs improvement,
2-3 weak, 0-1 severely incomplete.

JOB DESCRIPTION:
If a JD is supplied:
- compare resume keywords and skills against the JD;
- identify matched and genuinely missing keywords;
- recommend a keyword only when it is relevant and supported by existing
  resume evidence;
- rank existing resume projects by relevance;
- do not invent projects or skills.

If no JD is supplied:
jdMatch.available = false
matchScore = null
matchedKeywords = []
missingKeywords = []
matchedSkills = []
missingSkills = []
recommendedKeywords = []
priorityProjects = []

IMPORTANT:
A keyword is not "matched" merely because it is vaguely related.
Use clear semantic equivalence only.
Do not recommend unrelated technologies.

ISSUES:
Return only meaningful issues. Every issue must contain:
severity, category, title, message, suggestion.

Suggestions must be actionable using existing resume information or tell the
user to provide their own missing information.

Return ONLY valid JSON with this shape:

{
  "categories": {
    "contact": {
      "score": 0,
      "maxScore": 10,
      "findings": [],
      "issues": [],
      "suggestions": []
    },
    "structure": {},
    "experience": {},
    "skills": {},
    "projects": {},
    "education": {},
    "formatting": {},
    "contentQuality": {}
  },
  "issues": [],
  "jdMatch": {
    "available": false,
    "matchScore": null,
    "matchedKeywords": [],
    "missingKeywords": [],
    "matchedSkills": [],
    "missingSkills": [],
    "recommendedKeywords": [],
    "priorityProjects": []
  },
  "summary": ""
}
`;
}

function clamp(value: unknown, min = 0, max = 10): number {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function cleanStringArray(value: unknown, limit = 20): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, limit);
}

function normalizeCategory(value: unknown): CategoryAnalysis {
  const item =
    value && typeof value === 'object'
      ? (value as Record<string, unknown>)
      : {};

  return {
    score: clamp(item.score),
    maxScore: 10,
    findings: cleanStringArray(item.findings),
    issues: cleanStringArray(item.issues),
    suggestions: cleanStringArray(item.suggestions),
  };
}

function normalizePriorityProjects(value: unknown) {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const p = item as Record<string, unknown>;
      const priority =
        p.priority === 'high' ||
        p.priority === 'medium' ||
        p.priority === 'low'
          ? p.priority
          : 'medium';

      return {
        project:
          typeof p.project === 'string' ? p.project.trim() : '',
        priority,
        reason:
          typeof p.reason === 'string' ? p.reason.trim() : '',
      };
    })
    .filter((item) => item.project && item.reason)
    .slice(0, 10);
}

function normalizeGeminiResponse(input: unknown): GeminiATSResponse {
  const data =
    input && typeof input === 'object'
      ? (input as Record<string, unknown>)
      : {};

  const rawCategories =
    data.categories && typeof data.categories === 'object'
      ? (data.categories as Record<string, unknown>)
      : {};

  const categories = {} as Record<CategoryName, CategoryAnalysis>;

  for (const category of Object.keys(ATS_WEIGHTS) as CategoryName[]) {
    categories[category] = normalizeCategory(rawCategories[category]);
  }

  const rawIssues = Array.isArray(data.issues) ? data.issues : [];

  const issues = rawIssues
    .filter((item) => item && typeof item === 'object')
    .map((item) => {
      const issue = item as Record<string, unknown>;

      const severity =
        issue.severity === 'critical' ||
        issue.severity === 'warning' ||
        issue.severity === 'info'
          ? issue.severity
          : 'warning';

      const category =
        typeof issue.category === 'string' &&
        Object.prototype.hasOwnProperty.call(ATS_WEIGHTS, issue.category)
          ? (issue.category as CategoryName)
          : 'contentQuality';

      return {
        severity,
        category,
        title:
          typeof issue.title === 'string'
            ? issue.title.trim()
            : 'Resume issue',
        message:
          typeof issue.message === 'string'
            ? issue.message.trim()
            : '',
        suggestion:
          typeof issue.suggestion === 'string'
            ? issue.suggestion.trim()
            : '',
      };
    })
    .filter((item) => item.title && item.message)
    .slice(0, 30);

  const rawJD =
    data.jdMatch && typeof data.jdMatch === 'object'
      ? (data.jdMatch as Record<string, unknown>)
      : {};

  const available = rawJD.available === true;

  let matchScore: number | null = null;

  if (available && Number.isFinite(Number(rawJD.matchScore))) {
    matchScore = Math.round(
      Math.min(100, Math.max(0, Number(rawJD.matchScore))),
    );
  }

  const jdMatch: JDAnalysis = {
    available,
    matchScore,
    matchedKeywords: available
      ? cleanStringArray(rawJD.matchedKeywords, 50)
      : [],
    missingKeywords: available
      ? cleanStringArray(rawJD.missingKeywords, 50)
      : [],
    matchedSkills: available
      ? cleanStringArray(rawJD.matchedSkills, 50)
      : [],
    missingSkills: available
      ? cleanStringArray(rawJD.missingSkills, 50)
      : [],
    recommendedKeywords: available
      ? cleanStringArray(rawJD.recommendedKeywords, 50)
      : [],
    priorityProjects: available
      ? normalizePriorityProjects(rawJD.priorityProjects)
      : [],
  };

  return {
    categories,
    issues,
    jdMatch,
    summary:
      typeof data.summary === 'string'
        ? data.summary.trim()
        : '',
  };
}

function calculateATSScore(
  categories: Record<CategoryName, CategoryAnalysis>,
) {
  let total = 0;

  const breakdown = {} as Record<
    CategoryName,
    {
      score: number;
      maxScore: number;
      weight: number;
      contribution: number;
    }
  >;

  for (const category of Object.keys(ATS_WEIGHTS) as CategoryName[]) {
    const weight = ATS_WEIGHTS[category];
    const score = clamp(categories[category]?.score, 0, 10);
    const contribution = (score / 10) * weight;

    total += contribution;

    breakdown[category] = {
      score,
      maxScore: 10,
      weight,
      contribution: Number(contribution.toFixed(2)),
    };
  }

  return {
    score: Math.round(Math.min(100, Math.max(0, total))),
    breakdown,
  };
}

function stringifyResumeData(resumeData: unknown): string {
  try {
    return JSON.stringify(resumeData ?? {});
  } catch {
    return '';
  }
}

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function extractEmails(text: string): string[] {
  return Array.from(
    new Set(
      text.match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      ) ?? [],
    ),
  );
}

function extractPhones(text: string): string[] {
  return Array.from(
    new Set(
      text.match(/(?:\+?\d[\d\s().-]{8,}\d)/g) ?? [],
    ),
  );
}

function getResumeFacts(resumeData: unknown) {
  const text = stringifyResumeData(resumeData);
  const emails = extractEmails(text);
  const phones = extractPhones(text);

  return {
    wordCount: countWords(text),
    hasEmail: emails.length > 0,
    hasPhone: phones.length > 0,
    emails,
    phones,
    hasGithub: /github\.com/i.test(text),
    hasLinkedIn: /linkedin\.com/i.test(text),
    hasPortfolio: /portfolio|personal website/i.test(text),
  };
}

function getCategorySummary(score: number): string {
  if (score >= 9) return 'Excellent';
  if (score >= 8) return 'Strong';
  if (score >= 6) return 'Good';
  if (score >= 4) return 'Needs improvement';
  return 'Weak';
}

function buildCategoryUI(
  categories: Record<CategoryName, CategoryAnalysis>,
) {
  return (Object.keys(ATS_WEIGHTS) as CategoryName[]).map(
    (category) => {
      const item = categories[category];

      const nameMap: Record<CategoryName, string> = {
        contact: 'Contact',
        structure: 'Structure',
        experience: 'Experience',
        skills: 'Skills',
        projects: 'Projects',
        education: 'Education',
        formatting: 'Formatting',
        contentQuality: 'Content Quality',
      };

      return {
        id: category,
        name: nameMap[category],
        score: item.score,
        maxScore: 10,
        status: getCategorySummary(item.score),
        weight: ATS_WEIGHTS[category],
        findings: item.findings,
        issues: item.issues,
        suggestions: item.suggestions,
      };
    },
  );
}

function errorResponse(message: string, status = 500) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
    }),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
    },
  );
}

serve(async (req) => {
  // Browser CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      status: 200,
      headers: corsHeaders,
    });
  }

  // Only POST is supported
  if (req.method !== 'POST') {
    return errorResponse('Method not allowed', 405);
  }

  try {
    const body = await req.json();

    const resumeData = body?.resumeData ?? {};

    const targetJobDescription =
      typeof body?.targetJobDescription === 'string'
        ? body.targetJobDescription.trim()
        : '';

    const resumeString = stringifyResumeData(resumeData);

    if (!resumeString || resumeString === '{}') {
      return errorResponse(
        'No resume data was provided.',
        400,
      );
    }

    const systemPrompt = buildSystemPrompt();

    const userPrompt = `
Analyze this resume using the rules in the system prompt.

RESUME DATA:
${resumeString}

TARGET JOB DESCRIPTION:
${
  targetJobDescription ||
  'NO JOB DESCRIPTION PROVIDED'
}

IMPORTANT:
- Analyze only supplied information.
- Do not invent facts.
- Do not calculate an overall ATS score.
- If there is no JD, disable jdMatch.
- Return strict JSON only.
`;

    const rawResponse = await callGeminiApi({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 8192,
    });

    const parsed = parseJsonFromGemini(rawResponse);
    const analysis = normalizeGeminiResponse(parsed);

    // Final ATS score is deterministic and calculated by TypeScript.
    const scoring = calculateATSScore(analysis.categories);

    const facts = getResumeFacts(resumeData);
    const categoryList = buildCategoryUI(analysis.categories);

    const passedCategories = categoryList.filter(
      (category) => category.score >= 7,
    ).length;

    const totalCategories = categoryList.length;

    const criticalIssues = analysis.issues.filter(
      (issue) => issue.severity === 'critical',
    ).length;

    const warningIssues = analysis.issues.filter(
      (issue) => issue.severity === 'warning',
    ).length;

    let verdict = 'Needs improvement';

    if (scoring.score >= 85) {
      verdict = 'Strong ATS readiness';
    } else if (scoring.score >= 70) {
      verdict = 'Good ATS readiness';
    } else if (scoring.score >= 50) {
      verdict = 'Moderate ATS readiness';
    }

    const response = {
      success: true,
      analysisSource: 'gemini',

      // Final score calculated by TypeScript.
      finalScore: scoring.score,
      currentScore: scoring.score,
      score: scoring.score,
      maxScore: 100,
      verdict,

      // Transparent breakdown.
      scoreBreakdown: scoring.breakdown,

      // Exactly 8 categories.
      categories: analysis.categories,
      categoryList,
      categoryCount: totalCategories,
      passedChecks: passedCategories,
      totalChecks: totalCategories,

      // Issues.
      issues: analysis.issues,
      issueSummary: {
        critical: criticalIssues,
        warnings: warningIssues,
        total: analysis.issues.length,
      },

      // JD analysis.
      jdMatch: analysis.jdMatch,
      missingKeywords: analysis.jdMatch.available
        ? analysis.jdMatch.missingKeywords
        : [],
      matchedKeywords: analysis.jdMatch.available
        ? analysis.jdMatch.matchedKeywords
        : [],
      missingSkills: analysis.jdMatch.available
        ? analysis.jdMatch.missingSkills
        : [],
      matchedSkills: analysis.jdMatch.available
        ? analysis.jdMatch.matchedSkills
        : [],
      recommendedKeywords: analysis.jdMatch.available
        ? analysis.jdMatch.recommendedKeywords
        : [],
      priorityProjects: analysis.jdMatch.available
        ? analysis.jdMatch.priorityProjects
        : [],

      // Deterministic resume facts.
      resumeFacts: facts,

      // AI-generated short summary.
      summary: analysis.summary,
    };

    return new Response(
      JSON.stringify(response),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('analyze-resume error:', error);

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error';

    return errorResponse(message, 500);
  }
});
