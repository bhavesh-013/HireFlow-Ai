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
    const { title, company, bullets, targetRole } = await req.json();

    const featureTask = `You are a senior technical resume writer powered by Gemini 2.0 Flash specializing in experience bullet points.
Target role: "${targetRole || 'Software Engineer'}"
Position: "${title || 'Engineer'}" at "${company || 'Company'}"

Instructions:
- Rewrite existing bullets using strong action verbs (Led, Architected, Engineered, Optimized, Designed, Implemented, Automated).
- Structure into STAR format (Situation/Task implied, Action, Result).
- Keep each bullet to 1-2 lines maximum.
- IF A BULLET LACKS NUMERICAL METRICS, USE PLACEHOLDERS LIKE [X]%, [X]k, $[X], or [X]ms. DO NOT invent concrete numbers!`;

    const jsonSchema = `{
  "bullets": ["bullet 1 with [X]% placeholder if no metric in input", "bullet 2", "bullet 3"],
  "improvementsMade": ["description of change 1", "description of change 2"],
  "suggestedMetrics": ["suggested metric area to quantify (e.g. latency, user count)"]
}`;

    const systemPrompt = buildGeminiSystemPrompt(featureTask, jsonSchema);
    const userPrompt = `Current experience bullets:
${(bullets || []).map((b: string, i: number) => `${i + 1}. ${b}`).join('\n') || 'No bullets provided. Provide 3 template bullet structures using [X]% placeholders for this role.'}

Rewrite and improve these bullets strictly following the no-fabrication and metric placeholder rules.`;

    const text = await callGeminiApi({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
      maxTokens: 2048,
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
