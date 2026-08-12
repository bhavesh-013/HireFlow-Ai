/**
 * HireFlow Claude AI Client for Supabase Edge Functions
 * ───────────────────────────────────────────────────
 * Centralized Anthropic Claude API helper for all backend Edge Functions.
 */

export const CLAUDE_MODEL = 'claude-3-5-sonnet-20241022';

export interface ClaudeRequestOptions {
  systemPrompt?: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
}

export async function callClaudeApi(options: ClaudeRequestOptions): Promise<string> {
  const apiKey =
    Deno.env.get('ANTHROPIC_API_KEY') ||
    Deno.env.get('CLAUDE_API_KEY') ||
    Deno.env.get('GEMINI_API_KEY');

  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured in environment/secrets.');
  }

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: options.maxTokens || 4096,
      temperature: options.temperature ?? 0.2,
      system: options.systemPrompt || 'You are an expert AI resume & career assistant. Always respond with clean, valid JSON when requested.',
      messages: [
        {
          role: 'user',
          content: options.userPrompt,
        },
      ],
    }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Claude API Error (${res.status}): ${errorText}`);
  }

  const data = await res.json();
  const text = data?.content?.[0]?.text || '';
  return text;
}

export function parseJsonFromClaude<T = any>(text: string): T {
  const cleaned = text
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();
  return JSON.parse(cleaned);
}
