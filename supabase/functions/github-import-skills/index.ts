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
    const { repos, targetJobDescription } = await req.json();

    const featureTask = `Analyze candidate's GitHub repositories and extract tech stack skills. Group by category and format for ATS resume.`;

    const jsonSchema = `{
  "skills": ["TypeScript", "React", "Node.js"],
  "formattedSkills": "Frontend: React, TypeScript | Backend: Node.js, Express",
  "topLanguages": ["TypeScript", "JavaScript"]
}`;

    const systemPrompt = buildClaudeSystemPrompt(featureTask, jsonSchema);
    const userPrompt = `GitHub Repositories:\n${JSON.stringify(repos || [], null, 2)}\n\n${targetJobDescription ? `Target Job Description:\n${targetJobDescription}` : ''}`;

    const text = await callClaudeApi({
      systemPrompt,
      userPrompt,
      temperature: 0.2,
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
