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
    const { currentSkills, targetRole } = await req.json();

    const featureTask = `You are a technical skills optimization specialist powered by Claude for the target role: "${targetRole || 'Software Engineer'}".

Instructions:
1. Reformat the candidate's existing skills into clear ATS categories (e.g. Frontend, Backend, DevOps, Tools).
2. Suggest related skills relevant to the role for the candidate to review.
3. DO NOT claim the candidate possesses skills they do not have — present suggestions as optional additions.`;

    const jsonSchema = `{
  "suggestedSkills": ["skill1", "skill2"],
  "trendingSkills": ["trending1", "trending2"],
  "formattedSkills": "Category1: skill1, skill2 | Category2: skill3, skill4",
  "missingCriticalSkills": ["critical1"],
  "organizedByCategory": {
    "Frontend": ["skill1"],
    "Backend": ["skill2"]
  }
}`;

    const systemPrompt = buildClaudeSystemPrompt(featureTask, jsonSchema);
    const userPrompt = `Current skills: ${currentSkills || 'No skills listed yet.'}`;

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
