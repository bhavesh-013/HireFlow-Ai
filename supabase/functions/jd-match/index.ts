import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { buildGeminiSystemPrompt } from '../_shared/ai-prompts.ts';
import { callGeminiApi, parseJsonFromGemini } from '../_shared/gemini-client.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { resumeData, jobDescription } = await req.json();

    const featureTask = `Perform a detailed analysis comparing this resume against the target job description using Gemini 2.0 Flash.

Dimensions:
1. Keyword matching (skills present vs required)
2. Experience alignment
3. Missing essential skill terms
4. Recommendations grounded strictly in candidate's existing experience (do NOT tell candidate to fabricate skills or experience).`;

    const jsonSchema = `{
  "matchScore": 85,
  "matchPercentage": 85,
  "overallScore": 88,
  "matchedKeywords": ["keyword1"],
  "missingKeywords": ["missing1"],
  "sectionScores": {
    "summary": 80,
    "experience": 90,
    "skills": 75,
    "education": 85
  },
  "recommendations": ["recommendation 1"],
  "strengthAreas": ["strength 1"],
  "gapAreas": ["gap 1"]
}`;

    const systemPrompt = buildGeminiSystemPrompt(featureTask, jsonSchema);
    const userPrompt = `Resume Data:\n${JSON.stringify(resumeData || {}, null, 2)}\n\nJob Description:\n${jobDescription || 'No job description provided'}`;

    const text = await callGeminiApi({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 3000,
    });

    const parsed = parseJsonFromGemini(text);

    return new Response(JSON.stringify({ success: true, ...parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
