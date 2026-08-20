import { serve } from 'https://deno.land/std@0.270.0/http/server.ts';
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

/**
 * ============================================================
 * HIRE FLOW ATS ANALYSIS ENGINE
 * ============================================================
 *
 * Architecture:
 *
 * Resume
 *   ↓
 * Gemini analysis
 *   ↓
 * Validated category scores
 *   ↓
 * Deterministic TypeScript scoring
 *   ↓
 * Final ATS score /100
 *
 * Gemini NEVER decides the final ATS score.
 *
 * ============================================================
 */

/**
 * Total = exactly 100
 */
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

/**
 * Maximum score for each Gemini category.
 *
 * Gemini scores each category from 0 -> 10.
 *
 * TypeScript then converts:
 *
 * category score / 10 * category weight
 */
const CATEGORY_MAX_SCORE = 10;

/**
 * ============================================================
 * TYPES
 * ============================================================
 */

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

/**
 * ============================================================
 * SYSTEM PROMPT
 * ============================================================
 */

function buildSystemPrompt(): string {
  return `
You are HireFlow AI's resume analysis engine.

Your task is to analyze ONLY the resume information supplied by the user.

You are NOT the final ATS scoring engine.

Your job is to provide evidence-based category evaluations.

============================================================
ABSOLUTE NO-FABRICATION RULES
============================================================

NEVER invent:

- companies
- job titles
- projects
- technologies
- certifications
- achievements
- dates
- education
- metrics
- percentages
- salary
- users
- revenue
- performance numbers
- GitHub statistics
- responsibilities
- links

NEVER assume information that is not present.

If something is missing, report it as missing.

Do NOT create fake metrics.

Do NOT create fake achievements.

Do NOT create fake ATS compatibility claims.

Do NOT say that a resume is "100% ATS compatible".

Do NOT say that the resume will definitely pass an ATS.

ATS systems differ by employer and configuration.

============================================================
SCORING
============================================================

Score each category from 0 to 10.

10 = excellent evidence and implementation
8-9 = strong
6-7 = acceptable
4-5 = needs improvement
2-3 = weak
0-1 = severely incomplete

The category score MUST be based only on evidence in the supplied resume.

Do not inflate scores simply because the resume looks professional.

============================================================
CATEGORIES
============================================================

1. CONTACT

Evaluate:

- name
- email
- phone
- location
- LinkedIn if provided
- GitHub if provided
- portfolio if provided

Do not penalize the candidate for optional links excessively.

============================================================

2. STRUCTURE

Evaluate:

- clear section headings
- logical ordering
- appropriate sections
- duplicate sections
- missing important sections
- section organization

============================================================

3. EXPERIENCE

Evaluate:

- clarity of roles
- company information
- dates
- responsibilities
- accomplishments
- bullet quality
- measurable results when they actually exist

IMPORTANT:

Do not penalize a candidate simply because they do not have
professional experience if they are a fresher.

For fresher resumes, projects/internships/education should carry
more importance.

============================================================

4. SKILLS

Evaluate:

- technical skills
- relevant technologies
- organization
- duplication
- clarity
- relevance to the supplied target job if a JD exists

Do not recommend a technology merely because it is popular.

If a skill is missing from the resume and the JD requires it,
report it as a missing keyword.

============================================================

5. PROJECTS

Evaluate:

- project title
- technology stack
- project description
- contribution
- implementation details
- measurable results if actually provided
- links if actually provided

Never invent project metrics.

============================================================

6. EDUCATION

Evaluate:

- degree
- institution
- dates
- academic information
- consistency

============================================================

7. FORMATTING

Evaluate ATS-readable characteristics such as:

- standard headings
- readable text
- consistent formatting
- consistent dates
- bullet consistency
- excessive decoration
- tables/text structures that may make parsing harder
- unusual symbols

Do NOT claim compatibility with a specific proprietary ATS.

============================================================

8. CONTENT QUALITY

Evaluate:

- grammar
- spelling
- clarity
- concise writing
- action verbs
- unnecessary repetition
- vague statements
- bullet quality
- professional tone

============================================================
JOB DESCRIPTION
============================================================

If a job description is provided:

Perform keyword and skill comparison.

Only report a keyword as missing when:

1. it is meaningfully present in the job description, AND
2. it is genuinely absent from the supplied resume.

Do not recommend unrelated technologies.

If no job description is provided:

jdMatch.available MUST be false.

jdMatch.matchScore MUST be null.

matchedKeywords MUST be [].

missingKeywords MUST be [].

matchedSkills MUST be [].

missingSkills MUST be [].

DO NOT assign a fake JD score such as 70.

============================================================
ISSUES
============================================================

Return only meaningful issues.

Prioritize:

critical
warning
info

Each issue must contain:

- category
- title
- message
- actionable suggestion

Every suggestion must be possible using existing resume information,
OR clearly tell the user to provide their own missing information.

Example:

GOOD:
"Add your actual GitHub URL if you have one."

BAD:
"Add GitHub: github.com/example-user"

============================================================
IMPORTANT
============================================================

Do NOT calculate an overall ATS score.

Do NOT return projected ATS score.

Do NOT return ATS gain.

Do NOT claim the resume will pass ATS.

Return category scores only.

The application code will calculate the final score.

============================================================
OUTPUT
============================================================

Return ONLY valid JSON.

No markdown.

No explanation outside JSON.

Schema:

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

  "issues": [
    {
      "severity": "critical",
      "category": "experience",
      "title": "",
      "message": "",
      "suggestion": ""
    }
  ],

  "jdMatch": {
    "available": false,
    "matchScore": null,
    "matchedKeywords": [],
    "missingKeywords": [],
    "matchedSkills": [],
    "missingSkills": []
  },

  "summary": ""
}
`;
}

/**
 * ============================================================
 * HELPERS
 * ============================================================
 */

function clamp(value: unknown, min = 0, max = 10): number {
  const numeric = Number(value);

  if (!Number.isFinite(numeric)) {
    return min;
  }

  return Math.min(max, Math.max(min, numeric));
}

function cleanStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item) => typeof item === 'string')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 20);
}

function normalizeCategory(
  value: unknown,
): CategoryAnalysis {
  const category =
    value && typeof value === 'object'
      ? value as Record<string, unknown>
      : {};

  return {
    score: clamp(category.score),
    maxScore: 10,
    findings: cleanStringArray(category.findings),
    issues: cleanStringArray(category.issues),
    suggestions: cleanStringArray(category.suggestions),
  };
}

/**
 * Convert Gemini output into a safe predictable object.
 */
function normalizeGeminiResponse(
  input: unknown,
): GeminiATSResponse {
  const data =
    input && typeof input === 'object'
      ? input as Record<string, unknown>
      : {};

  const rawCategories =
    data.categories &&
    typeof data.categories === 'object'
      ? data.categories as Record<string, unknown>
      : {};

  const categories = {} as Record<CategoryName, CategoryAnalysis>;

  for (const category of Object.keys(
    ATS_WEIGHTS,
  ) as CategoryName[]) {
    categories[category] = normalizeCategory(
      rawCategories[category],
    );
  }

  const rawIssues = Array.isArray(data.issues)
    ? data.issues
    : [];

  const issues = rawIssues
    .filter(
      (issue) =>
        issue &&
        typeof issue === 'object',
    )
    .map((issue) => {
      const item = issue as Record<string, unknown>;

      const severity =
        item.severity === 'critical' ||
        item.severity === 'warning' ||
        item.severity === 'info'
          ? item.severity
          : 'warning';

      const category =
        Object.prototype.hasOwnProperty.call(
          ATS_WEIGHTS,
          item.category,
        )
          ? item.category as CategoryName
          : 'contentQuality';

      return {
        severity,
        category,
        title:
          typeof item.title === 'string'
            ? item.title.trim()
            : 'Resume issue',
        message:
          typeof item.message === 'string'
            ? item.message.trim()
            : '',
        suggestion:
          typeof item.suggestion === 'string'
            ? item.suggestion.trim()
            : '',
      };
    })
    .filter(
      (issue) =>
        issue.title &&
        issue.message,
    )
    .slice(0, 30);

  const rawJD =
    data.jdMatch &&
    typeof data.jdMatch === 'object'
      ? data.jdMatch as Record<string, unknown>
      : {};

  const jdAvailable =
    rawJD.available === true;

  const jdMatch: JDAnalysis = {
    available: jdAvailable,

    matchScore:
      jdAvailable &&
      Number.isFinite(Number(rawJD.matchScore))
        ? Math.round(
            Math.min(
              100,
              Math.max(
                0,
                Number(rawJD.matchScore),
              ),
            ),
          )
        : null,

    matchedKeywords: jdAvailable
      ? cleanStringArray(
          rawJD.matchedKeywords,
        )
      : [],

    missingKeywords: jdAvailable
      ? cleanStringArray(
          rawJD.missingKeywords,
        )
      : [],

    matchedSkills: jdAvailable
      ? cleanStringArray(
          rawJD.matchedSkills,
        )
      : [],

    missingSkills: jdAvailable
      ? cleanStringArray(
          rawJD.missingSkills,
        )
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

/**
 * ============================================================
 * DETERMINISTIC SCORE CALCULATION
 * ============================================================
 *
 * Gemini provides category scores 0-10.
 *
 * This function alone calculates the final ATS score.
 *
 * Example:
 *
 * Experience = 8/10
 * Weight = 20
 *
 * contribution = 8 / 10 * 20
 *             = 16
 *
 * All category contributions total exactly 100.
 */
function calculateATSScore(
  categories: Record<
    CategoryName,
    CategoryAnalysis
  >,
): {
  score: number;
  breakdown: Record<
    CategoryName,
    {
      score: number;
      maxScore: number;
      weight: number;
      contribution: number;
    }
  >;
} {
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

  for (
    const category of Object.keys(
      ATS_WEIGHTS,
    ) as CategoryName[]
  ) {
    const weight = ATS_WEIGHTS[category];

    const categoryScore = clamp(
      categories[category]?.score ?? 0,
      0,
      10,
    );

    const contribution =
      (categoryScore / CATEGORY_MAX_SCORE) *
      weight;

    total += contribution;

    breakdown[category] = {
      score: categoryScore,
      maxScore: CATEGORY_MAX_SCORE,
      weight,
      contribution: Number(
        contribution.toFixed(2),
      ),
    };
  }

  return {
    score: Math.round(
      Math.min(
        100,
        Math.max(0, total),
      ),
    ),

    breakdown,
  };
}

/**
 * ============================================================
 * DETERMINISTIC RESUME FACTS
 * ============================================================
 *
 * These facts are NOT AI generated.
 *
 * They are used to give the frontend useful information without
 * allowing Gemini to invent things.
 */

function stringifyResumeData(
  resumeData: unknown,
): string {
  try {
    return JSON.stringify(
      resumeData ?? {},
    );
  } catch {
    return '';
  }
}

function countWords(text: string): number {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function extractEmails(
  text: string,
): string[] {
  return Array.from(
    new Set(
      text.match(
        /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      ) ?? [],
    ),
  );
}

function extractPhones(
  text: string,
): string[] {
  return Array.from(
    new Set(
      text.match(
        /(?:\+?\d[\d\s().-]{8,}\d)/g,
      ) ?? [],
    ),
  );
}

function getResumeFacts(
  resumeData: unknown,
) {
  const text =
    stringifyResumeData(
      resumeData,
    );

  const words = countWords(text);

  const emails =
    extractEmails(text);

  const phones =
    extractPhones(text);

  return {
    wordCount: words,

    hasEmail:
      emails.length > 0,

    hasPhone:
      phones.length > 0,

    emails,

    phones,

    hasGithub:
      /github\.com/i.test(text),

    hasLinkedIn:
      /linkedin\.com/i.test(text),

    hasPortfolio:
      /portfolio|personal website/i.test(
        text,
      ),
  };
}

/**
 * ============================================================
 * CATEGORY HELPERS
 * ============================================================
 */

function getCategorySummary(
  score: number,
): string {
  if (score >= 9) {
    return 'Excellent';
  }

  if (score >= 8) {
    return 'Strong';
  }

  if (score >= 6) {
    return 'Good';
  }

  if (score >= 4) {
    return 'Needs improvement';
  }

  return 'Weak';
}

function buildCategoryUI(
  categories: Record<
    CategoryName,
    CategoryAnalysis
  >,
) {
  return (
    Object.keys(
      ATS_WEIGHTS,
    ) as CategoryName[]
  ).map((category) => {
    const item =
      categories[category];

    return {
      id: category,

      name:
        category === 'contentQuality'
          ? 'Content Quality'
          : category.charAt(0).toUpperCase() +
            category.slice(1),

      score: item.score,

      maxScore: 10,

      status:
        getCategorySummary(
          item.score,
        ),

      weight:
        ATS_WEIGHTS[category],

      findings:
        item.findings,

      issues:
        item.issues,

      suggestions:
        item.suggestions,
    };
  });
}

/**
 * ============================================================
 * MAIN SERVER
 * ============================================================
 */

serve(async (req) => {
  /**
   * CORS
   */
  if (req.method === 'OPTIONS') {
    return new Response(
      'ok',
      {
        headers: corsHeaders,
      },
    );
  }

  /**
   * Only POST allowed.
   */
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Method not allowed',
      }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          'Content-Type':
            'application/json',
        },
      },
    );
  }

  try {
    /**
     * --------------------------------------------------------
     * READ REQUEST
     * --------------------------------------------------------
     */

    const body =
      await req.json();

    const resumeData =
      body?.resumeData ?? {};

    const targetJobDescription =
      typeof body?.targetJobDescription ===
      'string'
        ? body.targetJobDescription.trim()
        : '';

    /**
     * --------------------------------------------------------
     * VALIDATE RESUME
     * --------------------------------------------------------
     */

    const resumeString =
      stringifyResumeData(
        resumeData,
      );

    if (
      !resumeString ||
      resumeString === '{}'
    ) {
      return new Response(
        JSON.stringify({
          success: false,
          error:
            'No resume data was provided.',
        }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type':
              'application/json',
          },
        },
      );
    }

    /**
     * --------------------------------------------------------
     * BUILD PROMPT
     * --------------------------------------------------------
     */

    const systemPrompt =
      buildSystemPrompt();

    const userPrompt = `
Analyze the following resume.

============================================================
RESUME DATA
============================================================

${resumeString}

============================================================
TARGET JOB DESCRIPTION
============================================================

${
  targetJobDescription
    ? targetJobDescription
    : 'NO JOB DESCRIPTION PROVIDED'
}

============================================================
FINAL INSTRUCTIONS
============================================================

Analyze only the supplied information.

If there is no job description:

- jdMatch.available = false
- jdMatch.matchScore = null
- matchedKeywords = []
- missingKeywords = []
- matchedSkills = []
- missingSkills = []

Do not create an overall ATS score.

Do not create a projected score.

Do not create ATS gain.

Return strict JSON only.
`;

    /**
     * --------------------------------------------------------
     * GEMINI
     * --------------------------------------------------------
     */

    const rawResponse =
      await callGeminiApi({
        systemPrompt,
        userPrompt,

        /**
         * Low temperature is intentional.
         *
         * Resume analysis should be consistent,
         * not creative.
         */
        temperature: 0.1,

        maxTokens: 8192,
      });

    /**
     * --------------------------------------------------------
     * PARSE GEMINI
     * --------------------------------------------------------
     */

    const rawParsed =
      parseJsonFromGemini(
        rawResponse,
      );

    const analysis =
      normalizeGeminiResponse(
        rawParsed,
      );

    /**
     * --------------------------------------------------------
     * DETERMINISTIC SCORE
     * --------------------------------------------------------
     */

    const scoring =
      calculateATSScore(
        analysis.categories,
      );

    /**
     * --------------------------------------------------------
     * RESUME FACTS
     * --------------------------------------------------------
     */

    const facts =
      getResumeFacts(
        resumeData,
      );

    /**
     * --------------------------------------------------------
     * PASSED CHECKS
     * --------------------------------------------------------
     */

    const categoryList =
      buildCategoryUI(
        analysis.categories,
      );

    const passedCategories =
      categoryList.filter(
        (category) =>
          category.score >= 7,
      ).length;

    const totalCategories =
      categoryList.length;

    /**
     * --------------------------------------------------------
     * ISSUE COUNTS
     * --------------------------------------------------------
     */

    const criticalIssues =
      analysis.issues.filter(
        (issue) =>
          issue.severity ===
          'critical',
      ).length;

    const warningIssues =
      analysis.issues.filter(
        (issue) =>
          issue.severity ===
          'warning',
      ).length;

    /**
     * --------------------------------------------------------
     * SCORE VERDICT
     * --------------------------------------------------------
     */

    let verdict =
      'Needs improvement';

    if (scoring.score >= 85) {
      verdict =
        'Strong ATS readiness';
    } else if (scoring.score >= 70) {
      verdict =
        'Good ATS readiness';
    } else if (scoring.score >= 50) {
      verdict =
        'Moderate ATS readiness';
    }

    /**
     * --------------------------------------------------------
     * RESPONSE
     * --------------------------------------------------------
     *
     * This response intentionally includes both:
     *
     * - new clean fields
     * - useful fields your existing UI can consume
     *
     * The frontend should display currentScore rather than
     * asking Gemini for a score.
     */

    const response = {
  success: true,

  analysisSource: 'gemini',

  // ============================================================
  // FINAL ATS SCORE
  // ============================================================
  // This is calculated by TypeScript.
  // Gemini NEVER directly determines this value.
  finalScore: scoring.score,

  // Backward-compatible aliases
  currentScore: scoring.score,
  score: scoring.score,
  maxScore: 100,

  verdict,

  // ============================================================
  // TRANSPARENT SCORE BREAKDOWN
  // ============================================================
  scoreBreakdown: scoring.breakdown,

  // ============================================================
  // 8 ATS CATEGORIES
  // ============================================================
  // Object format for ATSAnalysisPage.tsx
  categories: analysis.categories,

  // Array format for UI components that prefer .map()
  categoryList,

  categoryCount: totalCategories,

  passedChecks: passedCategories,

  totalChecks: totalCategories,

  // ============================================================
  // ISSUES
  // ============================================================
  issues: analysis.issues,

  issueSummary: {
    critical: criticalIssues,
    warnings: warningIssues,
    total: analysis.issues.length,
  },

  // ============================================================
  // JD MATCH
  // ============================================================
  // Completely separate from the main ATS score.
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

  // ============================================================
  // DETERMINISTIC RESUME FACTS
  // ============================================================
  resumeFacts: facts,

  // ============================================================
  // AI SUMMARY
  // ============================================================
  summary: analysis.summary,
};

}
catch (error) {
    console.error(
      'analyze-resume error:',
      error,
    );

    const message =
      error instanceof Error
        ? error.message
        : 'Unknown error';

    return new Response(
      JSON.stringify({
        success: false,
        error: message,
      }),
      {
        status: 500,

        headers: {
          ...corsHeaders,
          'Content-Type':
            'application/json',
        },
      },
    );
  }
);