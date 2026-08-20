/**
 * @deprecated Use gemini-client.ts instead.
 * This file now re-exports from the Gemini client for backward compatibility.
 */
export {
  callGeminiApi as callClaudeApi,
  parseJsonFromGemini as parseJsonFromClaude,
  GeminiRequestOptions as ClaudeRequestOptions,
  GEMINI_MODEL as CLAUDE_MODEL,
} from './gemini-client.ts';
export { buildGeminiSystemPrompt as buildClaudeSystemPrompt } from './ai-prompts.ts';
