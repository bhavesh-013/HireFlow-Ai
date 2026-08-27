/**
 * HireFlow Gemini AI Client for Supabase Edge Functions
 * ──────────────────────────────────────────────────────
 * Centralized Google Gemini API helper for all backend Edge Functions.
 */

export const GEMINI_MODEL = 'gemini-3.6-flash';
export const GEMINI_API_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GeminiRequestOptions {
  systemPrompt?: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callGeminiApi(options: GeminiRequestOptions): Promise<string> {
  const apiKey =
    Deno.env.get('GEMINI_API_KEY') ||
    Deno.env.get('GOOGLE_AI_API_KEY');

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment/secrets.');
  }

  const url = `${GEMINI_API_BASE}/${GEMINI_MODEL}:generateContent?key=${apiKey}`;

  const requestBody: any = {
    contents: [
      {
        role: 'user',
        parts: [{ text: options.userPrompt }],
      },
    ],
    generationConfig: {
      temperature: options.temperature ?? 0.2,
      maxOutputTokens: options.maxTokens || 4096,
      responseMimeType: 'application/json',
    },
  };

  // Add system instruction if provided
  if (options.systemPrompt) {
    requestBody.systemInstruction = {
      parts: [{ text: options.systemPrompt }],
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Gemini API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return text;
}

export function parseJsonFromGemini<T = any>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

// Backward-compatible aliases so existing imports keep working
// if any file still uses the old names
export const callClaudeApi = callGeminiApi;
export const parseJsonFromClaude = parseJsonFromGemini;
