import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import {
  callGeminiApi,
  parseJsonFromGemini,
} from '../_shared/gemini-client.ts';
import { calculateDeterministicScore, ResumeFacts, JDRequirements } from '../_shared/atsScoring.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// --- ZOD SCHEMAS ---
const ResumeFactsSchema = z.object({
  skills: z.array(z.string()),
  keywords: z.array(z.string()),
  sections: z.array(z.string()),
  projectsCount: z.number(),
  projectsWithMetrics: z.number(),
  experienceBullets: z.number(),
  experienceBulletsWithMetrics: z.number(),
  hasActionVerbs: z.boolean(),
  formattingScore: z.number().min(0).max(100),
});

const JDRequirementsSchema = z.object({
  requiredSkills: z.array(z.string()),
  preferredSkills: z.array(z.string()),
  keywords: z.array(z.string()),
}).nullable();

const ExtractionSchema = z.object({
  resumeFacts: ResumeFactsSchema,
  jdRequirements: JDRequirementsSchema,
});

type ExtractionResult = z.infer<typeof ExtractionSchema>;

// --- PROMPTS ---
function buildSystemPrompt(hasJd: boolean): string {
  let prompt = `
You are an expert AI Resume extractor. You will be provided with a candidate's resume (JSON format).
${hasJd ? 'You will also be provided with a target Job Description (JD).' : ''}

CRITICAL RULES:
1. NEVER invent or hallucinate skills, technologies, companies, job titles, dates, metrics, percentages, achievements, certifications, responsibilities, or experience.
2. Your output MUST be a valid JSON object matching the requested schema.
3. DO NOT score the resume overall. Your job is ONLY to extract facts.
4. "formattingScore" should be an objective measure of how well the provided resume JSON is structured (0-100).

Extract the following facts from the Resume:
- skills: Only concrete technologies or domains explicitly mentioned in the resume.
- keywords: Business/domain terms or tools NOT categorized as core skills.
- sections: List of section headers present (e.g. "Experience", "Summary", "Education", "Projects").
- projectsCount: Total number of projects.
- projectsWithMetrics: How many projects contain quantifiable metrics.
- experienceBullets: Total number of bullet points under Experience.
- experienceBulletsWithMetrics: How many of those bullet points contain metrics.
- hasActionVerbs: True if the bullets mostly start with strong action verbs.
`;

  if (hasJd) {
    prompt += `
Extract the following facts from the Job Description:
- requiredSkills: Explicitly required programming languages, tools, frameworks.
- preferredSkills: "Nice to have" or "Bonus" skills.
- keywords: Other domain terms, tools, or responsibilities.
`;
  }

  prompt += `
JSON OUTPUT SCHEMA:
{
  "resumeFacts": {
    "skills": ["string"],
    "keywords": ["string"],
    "sections": ["string"],
    "projectsCount": 0,
    "projectsWithMetrics": 0,
    "experienceBullets": 0,
    "experienceBulletsWithMetrics": 0,
    "hasActionVerbs": true,
    "formattingScore": 90
  },
  "jdRequirements": ${hasJd ? `{
    "requiredSkills": ["string"],
    "preferredSkills": ["string"],
    "keywords": ["string"]
  }` : 'null'}
}
`;
  return prompt;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resumeData, jobDescription } = await req.json();

    if (!resumeData || Object.keys(resumeData).length === 0) {
      throw new Error('Invalid or empty resume data.');
    }

    const hasJd = typeof jobDescription === 'string' && jobDescription.trim().length > 0;
    const systemPrompt = buildSystemPrompt(hasJd);
    const userPrompt = `
RESUME DATA:
${JSON.stringify(resumeData)}

${hasJd ? `TARGET JOB DESCRIPTION:\n${jobDescription}` : ''}
`;

    const rawResponse = await callGeminiApi({
      systemPrompt,
      userPrompt,
      temperature: 0.1,
      maxTokens: 8192,
    });

    const parsedData = parseJsonFromGemini(rawResponse);
    
    // Zod Validation
    const validationResult = ExtractionSchema.safeParse(parsedData);
    if (!validationResult.success) {
      throw new Error(`AI Extraction validation failed: ${validationResult.error.message}`);
    }

    const extraction: ExtractionResult = validationResult.data;

    // Deterministic Calculation
    const atsResult = calculateDeterministicScore(
      extraction.resumeFacts as ResumeFacts,
      extraction.jdRequirements as JDRequirements | null
    );

    // Return the ATSResult directly conforming to the frontend contract
    return new Response(JSON.stringify(atsResult), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    console.error('analyze-resume error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
