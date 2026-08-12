import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { callClaudeApi, parseJsonFromClaude } from '../_shared/claude-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ─── ATS Rules (mirrored from atsRules.json for Claude prompt embedding) ─────
const ATS_RULES = {
  scoringWeights: {
    formatting: 5, sections: 4, sectionOrder: 3, keywords: 8,
    hardSkills: 7, softSkills: 3, experience: 8, projects: 5,
    education: 4, certificates: 3, achievements: 5, metrics: 6,
    starFormat: 5, actionVerbs: 5, leadership: 4, readability: 4,
    bulletQuality: 4, length: 3, title: 2, contactInfo: 3,
    github: 2, portfolio: 2, linkedin: 2, missingSkills: 5,
    repeatedKeywords: 2, keywordDensity: 3, dateConsistency: 2, grammarTypos: 3,
  },
  thresholds: {
    idealWordCount: { min: 400, max: 800 },
    idealBulletCount: { min: 2, max: 6 },
    keywordDensityPercent: { min: 1.5, max: 3.5 },
    maxRepeatedKeywordCount: 3,
    minMetricsPerExperienceEntry: 1,
  },
};

// ─── System Prompt ─────────────────────────────────────────────────────────────
const buildSystemPrompt = (rulesJson: string): string => `
You are HireFlow's enterprise ATS Scoring Engine powered by Claude 3.5 Sonnet. Your role is to evaluate a resume against
the scoring rules provided and return a structured JSON analysis report.

## ABSOLUTE CONSTRAINTS — NEVER VIOLATE THESE

1. **NO INVENTION**: You MUST NOT invent, fabricate, or assume any metric, company name,
   job title, certification, project, technology, achievement, statistic, or any other
   claim that is NOT explicitly present in the original resume text provided.

2. **IMPROVE ONLY**: You may only rephrase, restructure, or improve content ALREADY
   present in the resume. You may NOT add new information that does not appear in the input.

3. **NO FAKE METRICS**: Never add percentages, dollar amounts, user counts, response
   times, or any performance numbers unless those exact numbers appear verbatim in the
   original resume text.

4. **PRESERVE FACTS**: All company names, dates, locations, degrees, job titles, and
   project names must remain exactly as provided in the input. Do not embellish or guess.

5. **GROUNDED FIX SUGGESTIONS**: Every fixSuggestion must be actionable using ONLY what
   is already in the resume. Reference actual content from the resume in your suggestions.
   For missing items (no github, no metrics), instruct the user to add their OWN real data.

## SCORING RULES

Use these exact weights and thresholds when computing scores:
${rulesJson}

## OUTPUT FORMAT

Return ONLY a strict JSON object matching the ATSFullReport schema without any markdown surrounding text:
Set "analysisSource": "claude".
`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resumeData, targetJobDescription } = await req.json();
    const systemPrompt = buildSystemPrompt(JSON.stringify(ATS_RULES, null, 2));

    const userPrompt = `
Analyze this resume and produce the complete ATSFullReport JSON.

RESUME DATA:
${JSON.stringify(resumeData || {}, null, 2)}

${targetJobDescription ? `TARGET JOB DESCRIPTION:\n${targetJobDescription}` : 'No job description provided. Skip keyword/JD-match scoring (score those categories at 70).'}

REMINDER: Do NOT invent any metrics, companies, certifications, or achievements not present above.
Return strict JSON output.
`;

    const rawResponseText = await callClaudeApi({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 4096,
    });

    const parsed = parseJsonFromClaude(rawResponseText);
    parsed.analysisSource = 'claude';

    return new Response(JSON.stringify({ success: true, ...parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('analyze-resume error:', err.message);
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
