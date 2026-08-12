import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { buildClaudeSystemPrompt } from '../_shared/ai-prompts.ts';
import { callClaudeApi, parseJsonFromClaude } from '../_shared/claude-client.ts';

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

    const featureTask = `You are an ATS resume tailoring specialist powered by Claude. Rewrite professional summary, experience bullets, and skills string to align with the provided target job description.

Instructions:
- Align phrasing with job description requirements without fabricating experience.
- DO NOT invent companies, dates, degrees, or metrics.
- Use placeholders like [X]% or [X]ms for any recommended metrics not present in the input.`;

    const jsonSchema = `{
  "tailoredSummary": "string",
  "improvedBullets": ["bullet 1", "bullet 2"],
  "updatedSkills": "string",
  "matchPercentage": 90,
  "changesMade": ["change 1", "change 2"]
}`;

    const systemPrompt = buildClaudeSystemPrompt(featureTask, jsonSchema);
    const userPrompt = `Resume Data:\n${JSON.stringify(resumeData || {}, null, 2)}\n\nJob Description:\n${jobDescription || ''}`;

    const text = await callClaudeApi({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 3000,
    });

    const parsed = parseJsonFromClaude(text);

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
