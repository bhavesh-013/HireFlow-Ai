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

    const featureTask = `Analyze candidate's GitHub repositories evidence (package manifests, languages, topics, dependencies) and extract verified tech stack skills.

STRICT RULES:
1. Use ONLY the supplied GitHub evidence. If a technology is not supported by actual evidence in the repository data, omit it. Never guess or invent skills.
2. Categorize all extracted skills into the 9 standard categories:
   - Languages
   - Frontend
   - Backend
   - Databases
   - Cloud
   - DevOps
   - Testing
   - Tools
   - AI/ML
3. Standardize skill names cleanly (e.g. JS -> JavaScript, TS -> TypeScript, React.js -> React).`;

    const jsonSchema = `{
  "skills": ["TypeScript", "React", "Node.js", "PostgreSQL", "Docker"],
  "formattedSkills": "Languages: TypeScript, JavaScript | Frontend: React | Backend: Node.js | Databases: PostgreSQL | DevOps: Docker",
  "categorizedSkills": {
    "Languages": ["TypeScript", "JavaScript"],
    "Frontend": ["React"],
    "Backend": ["Node.js"],
    "Databases": ["PostgreSQL"],
    "Cloud": ["Vercel"],
    "DevOps": ["Docker"],
    "Testing": ["Jest"],
    "Tools": ["Git", "Vite"],
    "AI/ML": ["Gemini API"]
  }
}`;

    const systemPrompt = buildGeminiSystemPrompt(featureTask, jsonSchema);
    const userPrompt = `GitHub Repositories:\n${JSON.stringify(repos || [], null, 2)}\n\n${targetJobDescription ? `Target Job Description:\n${targetJobDescription}` : ''}`;

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
