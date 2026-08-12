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
    const { message, activeSection, resumeData, conversationHistory } = await req.json();

    const featureTask = `You are HireFlow AI Career Coach — an expert in resume optimization, career strategy, and job search powered by Claude.

Current context:
- Active section: "${activeSection || 'general'}"
- Resume data available: ${resumeData ? 'Yes' : 'No'}

Guidelines:
- Give specific, actionable advice based ONLY on the user's actual resume data.
- NEVER fabricate companies, projects, metrics, or titles.
- If suggesting metric additions, instruct the user to add their own numbers or use placeholders like [X]%.
- Keep responses concise (2-4 paragraphs max).`;

    const jsonSchema = `{
  "reply": "your conversational response here",
  "suggestions": ["quick action 1", "quick action 2"],
  "followUpQuestion": "optional follow-up question"
}`;

    const systemPrompt = buildClaudeSystemPrompt(featureTask, jsonSchema);

    let userPrompt = '';
    if (conversationHistory && Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      userPrompt += `CONVERSATION HISTORY:\n${conversationHistory.map((h: any) => `${h.role}: ${h.content}`).join('\n')}\n\n`;
    }
    userPrompt += resumeData ? `RESUME CONTEXT:\n${JSON.stringify(resumeData, null, 2)}\n\nUSER MESSAGE: ${message}` : `USER MESSAGE: ${message}`;

    const text = await callClaudeApi({
      systemPrompt,
      userPrompt,
      temperature: 0.5,
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
