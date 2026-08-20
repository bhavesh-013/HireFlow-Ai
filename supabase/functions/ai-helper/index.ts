import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
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
    const body = await req.json();
    const systemPrompt = `You are a resume enhancement AI powered by Gemini 2.0 Flash. Return structured JSON response formatted appropriately for the requested action.`;

    const rawResponseText = await callGeminiApi({
      systemPrompt,
      userPrompt: `Input payload:\n${JSON.stringify(body, null, 2)}`,
      temperature: 0.2,
      maxTokens: 2048,
    });

    const parsed = parseJsonFromGemini(rawResponseText);

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
