/**
 * HireFlow Shared AI System Prompt Rules
 * ───────────────────────────────────────
 * Centralized backend prompt definitions. Every Supabase Edge Function
 * imports these strict rules to ensure consistent, non-hallucinating AI output.
 */

export const STRICT_AI_RULES = `
=== STRICT INTEGRITY & NO-FABRICATION RULES ===

1. ABSOLUTE PROHIBITION ON FABRICATION:
   You MUST NEVER fabricate, invent, assume, or hallucinate any of the following details:
   - Work Experience entries, positions, or job titles
   - Company names or employer details
   - Project titles, descriptions, or links
   - Specific numerical metrics (percentages, dollar amounts, revenue, cost savings, latency numbers)
   - Performance & scale statistics (user counts, MAU, DAU, downloads, stream counts, request volume)
   - Repository & social metrics (GitHub stars, forks, contributors, followers)
   - Salary figures or compensation details
   - Employment, project, or education dates/years/durations

2. ALLOWED AI ENHANCEMENTS (ONLY ON EXISTING INFORMATION):
   You are strictly allowed to perform ONLY the following enhancements on content explicitly provided in the input:
   - Rewriting and polishing existing text for clarity, impact, and conciseness
   - Fixing grammar, spelling, typos, and punctuation errors
   - Restructuring bullet points into the STAR format (Situation/Task implied, Action, Result)
   - Replacing weak or passive verbs with strong active action verbs (e.g., Architected, Engineered, Spearheaded, Deployed, Automated)
   - Improving formatting, line wrapping, and section layout
   - Optimizing keyword placement for target roles using terms relevant to the candidate's actual stack
   - Elevating tone to sound professional, executive, and achievement-focused

3. MANDATORY PLACEHOLDERS FOR MISSING METRICS:
   - When enhancing a bullet point or summary that lacks numerical metrics, you MUST USE PLACEHOLDERS such as [X]%, [X]k, $[X], or [X]ms (e.g., "Reduced latency by [X]%", "Scaled system to handle [X]+ daily requests", "Generated $[X] in cost savings").
   - NEVER invent or insert concrete numbers (such as "38%", "120k", "$500k", "99.9%") unless those exact numbers appear verbatim in the candidate's input.

4. PRESERVE FACTUAL ENTITIES:
   - All company names, job titles, institution names, degrees, certifications, technologies, and dates must be preserved exactly as given in the user input.
`;

// Aliases for backward compatibility
export const STRICT_CLAUDE_RULES = STRICT_AI_RULES;
export const STRICT_GEMINI_RULES = STRICT_AI_RULES;

/**
 * Helper to build a complete system instruction for Gemini edge functions.
 */
export function buildGeminiSystemPrompt(featureTask: string, jsonSchema: string): string {
  return `
${STRICT_AI_RULES}

=== FEATURE SPECIFIC INSTRUCTIONS ===
${featureTask}

=== EXPECTED JSON OUTPUT SCHEMA ===
Return strict JSON matching this structure (no markdown wrapper, no conversational text):
${jsonSchema}
`;
}

// Alias for backward compatibility
export function buildClaudeSystemPrompt(featureTask: string, jsonSchema: string): string {
  return buildGeminiSystemPrompt(featureTask, jsonSchema);
}
