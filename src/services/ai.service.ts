import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './auth.service';
import { ATSResult } from '../types';

export interface ConvHistoryEntry {
  role: 'user' | 'assistant';
  content: string;
}

async function callDirectGeminiApi(systemPrompt: string, userPrompt: string): Promise<string> {
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as any);
  const apiKey = env.VITE_GEMINI_API_KEY || env.VITE_GOOGLE_AI_API_KEY;

  if (!apiKey || apiKey.includes('sample-gemini-key')) {
    throw new Error('No valid VITE_GEMINI_API_KEY configured in environment.');
  }

  const model = 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      systemInstruction: {
        parts: [{ text: systemPrompt }],
      },
      contents: [
        {
          role: 'user',
          parts: [{ text: userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Direct Gemini API Error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  return data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
}

async function invokeEdgeFunction<T = any>(functionName: string, body: any): Promise<T> {
  const user = authService.getStoredUser();

  // Audit AI action in `ai_history` if logged in
  if (isSupabaseConfigured() && user) {
    try {
      await supabase.from('ai_history').insert({
        user_id: user.id,
        resume_id: body.resumeId || body.resumeData?.id || null,
        action_type: functionName,
        prompt: JSON.stringify(body),
        response: {},
      });
    } catch {
      // Non-blocking — audit log failure should not break the AI call
    }
  }

  // 1. Invoke via Supabase Edge Function
  if (isSupabaseConfigured()) {
    const { data, error } = await supabase.functions.invoke(functionName, { body });
    if (!error && data) return data as T;
    
    // Throw error if Edge Function fails, no fake fallbacks.
    throw new Error(`Edge Function '${functionName}' failed: ${error?.message || 'Unknown Error'}`);
  }

  // 2. Direct Client-side Gemini API invocation if key is present in Vite environment
  const env = typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env : ({} as any);
  const clientApiKey = env.VITE_GEMINI_API_KEY || env.VITE_GOOGLE_AI_API_KEY;

  if (clientApiKey && !clientApiKey.includes('sample-gemini-key')) {
    const systemPrompt = functionName === 'chat' || functionName.includes('chat')
      ? `You are HireFlow AI Career Coach powered by Gemini 2.0 Flash.
Your ONLY purpose is to help users with resume review, ATS optimization, interview preparation, job description analysis, and career strategy.
REFUSE all off-topic requests with: "I'm your AI Career Coach. I can help with resumes, ATS optimization, job descriptions, career preparation, and interview preparation. Please ask me something related to your resume or interview."
NEVER fabricate resume content. Return strict valid JSON: {"reply": "...", "suggestions": [], "followUpQuestion": null, "rejected": false}.`
      : `You are HireFlow AI powered by Gemini 2.0 Flash — an expert in resume engineering, ATS optimization, and career coaching. Return strict valid JSON output matching requested task format.`;
    
    const userPrompt = `Action: ${functionName}\nInput: ${JSON.stringify(body, null, 2)}`;
    const rawText = await callDirectGeminiApi(systemPrompt, userPrompt);
    const cleanedJson = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanedJson);
    return { success: true, ...parsed } as T;
  }

  throw new Error('Analysis unavailable. Please try again. No valid Gemini API Key or Supabase Configuration found.');
}

export interface WritingAssistParams {
  text: string;
  action: 'fix_grammar' | 'strengthen_verb' | 'star_format' | 'improve' | 'make_professional' | 'shorten' | 'expand' | 'ats_relevance';
  section: 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'certificates';
  jdText?: string;
}

export const aiService = {
  atsAnalyze: (resumeData: any, targetJobDescription?: string): Promise<ATSResult> =>
    invokeEdgeFunction<ATSResult>('analyze-resume', { resumeData, jobDescription: targetJobDescription }),

  assistWriting: (params: WritingAssistParams) =>
    invokeEdgeFunction('assist-writing', params),

  rewriteSummary: (summary: string, targetRole?: string, mode?: string) =>
    invokeEdgeFunction('summary', { summary, targetRole, mode }),

  rewriteExperience: (title: string, company: string, bullets: string[], targetRole?: string) =>
    invokeEdgeFunction('experience-bullets', { title, company, bullets, targetRole }),

  rewriteSkills: (currentSkills: string, targetRole?: string) =>
    invokeEdgeFunction('skills', { currentSkills, targetRole }),

  careerCoach: (message: string, activeSection?: string, resumeData?: any, conversationHistory?: ConvHistoryEntry[]) =>
    invokeEdgeFunction('chat', { message, activeSection, resumeData, conversationHistory }),

  importGitHubSkills: (repos: any[], targetJobDescription?: string) =>
    invokeEdgeFunction('github-import-skills', { repos, targetJobDescription }),

  importGitHubProjects: (repos: any[], targetJobDescription?: string) =>
    invokeEdgeFunction('github-import-projects', { repos, targetJobDescription }),
};

export default aiService;
