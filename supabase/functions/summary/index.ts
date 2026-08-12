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
    const { summary, targetRole, mode, jobTitle } = await req.json();
    const role = targetRole || jobTitle || 'Software Engineer';
    const writeMode = mode || 'ATS Friendly';

    const featureTask = `Your task is to refine and rewrite a Professional Summary for a candidate targeting the role: "${role}".
Requested mode: "${writeMode}" (Options: ATS Friendly, Executive, Shorten, Expand, Student, Professional).

Mode instructions:
- ATS Friendly: Natural industry keyword placement, clear structure, strong action verbs.
- Executive: Board-level language, strategic vision, leadership impact.
- Shorten: Condense to 2-3 punchy sentences max.
- Expand: Add depth on core competencies, 4-5 sentences.
- Student: Emphasize education, academic projects, technical foundation, enthusiasm.
- Professional: Balanced, achievement-focused, 3-4 clean sentences.

REMINDER: Never invent metrics or companies. If suggesting metric impact without existing numbers, use placeholders like [X]%.`;

    const jsonSchema = `{
  "improvedSummary": "the rewritten summary text",
  "keyHighlights": ["highlight 1", "highlight 2", "highlight 3"],
  "toneApplied": "${writeMode}",
  "wordCount": 42
}`;

    const systemPrompt = buildClaudeSystemPrompt(featureTask, jsonSchema);
    const userPrompt = `Current Summary: ${summary || 'No summary provided. Rephrase available role details into a concise opening profile statement.'}`;

    const text = await callClaudeApi({
      systemPrompt,
      userPrompt,
      temperature: 0.3,
      maxTokens: 2048,
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
