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
    const { repos, targetJobDescription } = await req.json();

    const featureTask = `Transform selected GitHub repositories into polished ATS resume project items.

STRICT EVIDENCE & NO-FABRICATION RULES:
1. Use ONLY the supplied GitHub evidence (repository name, description, topics, languages, dependencies, README). If something is not supported by evidence, omit it. Never guess.
2. ABSOLUTE PROHIBITION ON FABRICATION:
   NEVER invent:
   - percentages (e.g. "Reduced latency by 40%")
   - user counts (e.g. "Served 120k users")
   - revenue / dollar figures
   - latency / request rate numbers
   - performance metrics or cost savings
   - dates, companies, or fake production scale
3. If metrics are unavailable, write factual technical bullet points instead (e.g. "Engineered component architecture with React and TypeScript", "Integrated PostgreSQL database using Prisma ORM", "Configured CI/CD automation workflow with GitHub Actions").
4. Provide 2-4 concise, factual bullet points per project.
5. Include clean title, accurate description, verified tech stack tags, repository URL (link), and live URL if available.`;

    const jsonSchema = `{
  "projects": [
    {
      "id": "proj_1",
      "title": "Project Title",
      "description": "Factual description based strictly on repo evidence",
      "techStack": ["React", "TypeScript"],
      "link": "https://github.com/user/repo",
      "liveUrl": "https://demo.app",
      "bullets": [
        "Engineered modular frontend application using React and TypeScript.",
        "Configured database integration with PostgreSQL and Prisma ORM."
      ]
    }
  ]
}`;

    const systemPrompt = buildGeminiSystemPrompt(featureTask, jsonSchema);
    const userPrompt = `GitHub Repositories:\n${JSON.stringify(repos || [], null, 2)}\n\n${targetJobDescription ? `Target Job Description:\n${targetJobDescription}` : ''}`;

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
