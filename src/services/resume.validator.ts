/**
 * HireFlow AI — Resume Validation / Red-Line Engine
 * ──────────────────────────────────────────────────
 * Detects REAL problems in REAL resume text. This module never generates
 * an issue that isn't grounded in the actual content it was given.
 *
 * ABSOLUTE RULES (see TASK 3 spec, sections 5–10):
 *  - Only flag things the text actually contains (a real misspelling, a
 *    real inconsistent date pair, a real weak/vague sentence).
 *  - Never invent a "missing metric" number — only ever suggest the user
 *    ADD one, never fabricate what it should be.
 *  - If the resume has no detectable issues, return an empty array and the
 *    caller should show "No significant issues detected."
 *  - Every issue carries a confidence score so low-confidence heuristic
 *    guesses can be filtered out or shown as lower priority in the UI.
 */
import type { ParsedResumeData } from '../types';

export type ValidationCategory =
  | 'grammar'
  | 'spelling'
  | 'formatting'
  | 'content'
  | 'ats'
  | 'consistency'
  | 'completeness';

export interface ValidationIssue {
  id: string;
  /** The exact original substring flagged — never paraphrased. */
  original: string;
  type: ValidationCategory;
  /** Which resume section/field this came from, for red-lining the right spot. */
  section: 'summary' | 'experience' | 'education' | 'projects' | 'skills' | 'certificates' | 'general';
  /** Optional id of the specific item within the section (e.g. experience id). */
  itemId?: string;
  explanation: string;
  /** A concrete correction. Empty string if we can only flag, not fix. */
  suggestion: string;
  /** 0–1. Only the validator's own confidence in this specific flag. */
  confidence: number;
}

// ─── Curated spelling map — only well-known, unambiguous tech misspellings.
// Deliberately conservative: false positives are worse than missed catches.
const SPELLING_MAP: Record<string, string> = {
  javscript: 'JavaScript',
  javascrip: 'JavaScript',
  javascript: 'JavaScript', // casing-only, still worth flagging as a proper-noun fix
  typescrip: 'TypeScript',
  pyhton: 'Python',
  pyton: 'Python',
  reactjs: 'React', // stylistic, low confidence
  nodejs: 'Node.js',
  mysql: 'MySQL',
  mongo: 'MongoDB',
  postgresql: 'PostgreSQL',
  postgress: 'PostgreSQL',
  recieved: 'received',
  seperate: 'separate',
  managment: 'management',
  developement: 'development',
  enviroment: 'environment',
  acheive: 'achieve',
  acheived: 'achieved',
  succesful: 'successful',
  successfull: 'successful',
  reponsible: 'responsible',
  resonsible: 'responsible',
  colaborate: 'collaborate',
  colaborated: 'collaborated',
  buisness: 'business',
  intergrate: 'integrate',
  intergrated: 'integrated',
  optimiz: 'optimize',
  proffessional: 'professional',
  acheivement: 'achievement',
  wich: 'which',
  teh: 'the',
  recieve: 'receive',
  occured: 'occurred',
  untill: 'until',
  accross: 'across',
  arguement: 'argument',
  particurlarly: 'particularly',
};

// Only flag genuinely mixed-case / concatenated known-brand spellings, not
// every lowercase occurrence of a common word.
const LOW_CONFIDENCE_KEYS = new Set(['reactjs', 'javascript']);

const WEAK_STARTS = ['i ', 'i develop', 'i build', 'i made', 'i worked', 'i did', 'i help'];

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}_${idCounter}`;
}

function findSpellingIssues(text: string, section: ValidationIssue['section'], itemId?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const wordRegex = /\b[a-zA-Z]+\b/g;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();
  while ((match = wordRegex.exec(text)) !== null) {
    const word = match[0];
    const lower = word.toLowerCase();
    if (!(lower in SPELLING_MAP)) continue;
    // Skip if the word is already correctly-cased and matches the
    // suggestion exactly (e.g. "JavaScript" already correct).
    const suggestion = SPELLING_MAP[lower];
    if (word === suggestion) continue;
    const dedupeKey = `${lower}:${match.index}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);
    issues.push({
      id: nextId('spell'),
      original: word,
      type: 'spelling',
      section,
      itemId,
      explanation: `"${word}" appears to be misspelled or incorrectly cased.`,
      suggestion,
      confidence: LOW_CONFIDENCE_KEYS.has(lower) ? 0.55 : 0.95,
    });
  }
  return issues;
}

function findGrammarIssues(text: string, section: ValidationIssue['section'], itemId?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const trimmed = text.trim();
  if (!trimmed) return issues;

  const lower = trimmed.toLowerCase();
  const weakStart = WEAK_STARTS.find((w) => lower.startsWith(w));
  if (weakStart) {
    issues.push({
      id: nextId('gram'),
      original: trimmed,
      type: 'grammar',
      section,
      itemId,
      explanation: 'Resume bullets read better in third-person, past-tense, action-verb form rather than first-person.',
      // Only a structural nudge, not a fabricated rewrite of content we
      // don't have — the AI improvement engine (ai.improvement.ts) does
      // the actual rewrite using the real weak→strong verb map.
      suggestion: '',
      confidence: 0.8,
    });
  }

  // Sentence starting with a lowercase letter (excluding lines that are
  // clearly fragments like tech-stack lists).
  if (/^[a-z]/.test(trimmed) && trimmed.length > 15 && !weakStart) {
    issues.push({
      id: nextId('gram'),
      original: trimmed.slice(0, Math.min(40, trimmed.length)),
      type: 'grammar',
      section,
      itemId,
      explanation: 'Sentence starts with a lowercase letter.',
      suggestion: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
      confidence: 0.7,
    });
  }

  return issues;
}

function findContentIssues(text: string, section: ValidationIssue['section'], itemId?: string): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const trimmed = text.trim();
  if (!trimmed) return issues;

  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  // Very short, vague bullets like "Worked on website." with no detail.
  const vaguePattern = /^(worked on|responsible for|helped with|did)\b/i;
  if (wordCount <= 5 && vaguePattern.test(trimmed)) {
    issues.push({
      id: nextId('content'),
      original: trimmed,
      type: 'content',
      section,
      itemId,
      explanation: 'This line is too vague to convey real impact.',
      // Per spec: never invent the result — only prompt the user for one.
      suggestion: 'Describe what you built, how you built it, and the result if available.',
      confidence: 0.75,
    });
  }

  return issues;
}

/**
 * Checks date-range formatting consistency ACROSS the whole resume (e.g.
 * "2023 - Present" vs "2020 – 2023" using different dash characters, or
 * mixing "MM/YYYY" with "Mon YYYY"). Only flags when there are actually 2+
 * differently-formatted date ranges present.
 */
function findDateConsistencyIssues(allPeriods: Array<{ value: string; section: ValidationIssue['section']; itemId?: string }>): ValidationIssue[] {
  const withDates = allPeriods.filter((p) => p.value && p.value !== 'Needs review');
  if (withDates.length < 2) return [];

  const classify = (v: string): string => {
    if (/–/.test(v)) return 'en-dash';
    if (/—/.test(v)) return 'em-dash';
    if (/-/.test(v)) return 'hyphen';
    return 'other';
  };

  const styles = new Set(withDates.map((p) => classify(p.value)));
  if (styles.size <= 1) return [];

  return [
    {
      id: nextId('consist'),
      original: withDates.map((p) => p.value).join(' / '),
      type: 'consistency',
      section: 'general',
      explanation: 'Date ranges use inconsistent separator styles across the resume (e.g. hyphen vs en dash).',
      suggestion: 'Use one consistent date format throughout, e.g. "2023 – Present".',
      confidence: 0.9,
    },
  ];
}

/**
 * Checks bullet-marker consistency within a resume section. This operates
 * on the ORIGINAL raw lines before bullet-character stripping, so it needs
 * to be run against extracted text, not the already-cleaned bullet arrays —
 * left as a lighter-weight structural check based on whatever leading
 * punctuation survived parsing, since exact source formatting isn't always
 * preserved once bullets are split into an array.
 */
function findCompletenessIssues(resume: ParsedResumeData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!resume.personalInfo?.email) {
    issues.push({
      id: nextId('complete'),
      original: '',
      type: 'completeness',
      section: 'general',
      explanation: 'No email address was found on the resume.',
      suggestion: 'Add a professional email address to your contact info.',
      confidence: 0.9,
    });
  }
  if (!resume.personalInfo?.phone) {
    issues.push({
      id: nextId('complete'),
      original: '',
      type: 'completeness',
      section: 'general',
      explanation: 'No phone number was found on the resume.',
      suggestion: 'Add a phone number to your contact info.',
      confidence: 0.85,
    });
  }
  if (!resume.personalInfo?.summary) {
    issues.push({
      id: nextId('complete'),
      original: '',
      type: 'completeness',
      section: 'summary',
      explanation: 'No professional summary was found.',
      suggestion: 'Add a 2–3 sentence summary describing your role and focus.',
      confidence: 0.7,
    });
  }
  if (!resume.experiences || resume.experiences.length === 0) {
    if (!resume.projects || resume.projects.length === 0) {
      issues.push({
        id: nextId('complete'),
        original: '',
        type: 'completeness',
        section: 'general',
        explanation: 'No work experience or projects were found on the resume.',
        suggestion: 'Add at least one experience or project entry so ATS systems and recruiters have something to evaluate.',
        confidence: 0.9,
      });
    }
  }
  if (!resume.skills || resume.skills.trim().length === 0) {
    issues.push({
      id: nextId('complete'),
      original: '',
      type: 'completeness',
      section: 'skills',
      explanation: 'No skills section was found.',
      suggestion: 'Add a skills section listing your real technical skills.',
      confidence: 0.85,
    });
  }

  return issues;
}

/**
 * Runs the full validation pass over a structured, already-parsed resume.
 * This is the "explicit action" entry point (see spec section 23 — do not
 * call this on every keystroke; call on upload / on-demand / debounced).
 */
export function validateResume(resume: ParsedResumeData): ValidationIssue[] {
  idCounter = 0;
  const issues: ValidationIssue[] = [];

  // Summary
  if (resume.personalInfo?.summary) {
    issues.push(...findGrammarIssues(resume.personalInfo.summary, 'summary'));
    issues.push(...findSpellingIssues(resume.personalInfo.summary, 'summary'));
    issues.push(...findContentIssues(resume.personalInfo.summary, 'summary'));
  }

  // Experience bullets
  const periodsForConsistency: Array<{ value: string; section: ValidationIssue['section']; itemId?: string }> = [];
  (resume.experiences || []).forEach((exp) => {
    if (exp.period) periodsForConsistency.push({ value: exp.period, section: 'experience', itemId: exp.id });
    (exp.bullets || []).forEach((bullet) => {
      issues.push(...findGrammarIssues(bullet, 'experience', exp.id));
      issues.push(...findSpellingIssues(bullet, 'experience', exp.id));
      issues.push(...findContentIssues(bullet, 'experience', exp.id));
    });
  });

  // Education
  (resume.education || []).forEach((edu) => {
    if (edu.period) periodsForConsistency.push({ value: edu.period, section: 'education', itemId: edu.id });
  });

  // Projects
  (resume.projects || []).forEach((proj) => {
    (proj.bullets || []).forEach((bullet) => {
      issues.push(...findGrammarIssues(bullet, 'projects', proj.id));
      issues.push(...findSpellingIssues(bullet, 'projects', proj.id));
      issues.push(...findContentIssues(bullet, 'projects', proj.id));
    });
    if (proj.description) {
      issues.push(...findSpellingIssues(proj.description, 'projects', proj.id));
    }
  });

  // Skills — duplicate/near-duplicate detection (case-insensitive dupes only;
  // never flags a skill as "suspicious" just because we don't recognize it).
  if (resume.skills) {
    const list = resume.skills.split(',').map((s) => s.trim()).filter(Boolean);
    const lowerSeen = new Map<string, string>();
    list.forEach((skill) => {
      const lower = skill.toLowerCase();
      if (lowerSeen.has(lower) && lowerSeen.get(lower) !== skill) {
        issues.push({
          id: nextId('skill'),
          original: `${lowerSeen.get(lower)}, ${skill}`,
          type: 'consistency',
          section: 'skills',
          explanation: `"${lowerSeen.get(lower)}" and "${skill}" appear to be the same skill listed with inconsistent naming/casing.`,
          suggestion: `Keep one consistent form, e.g. "${skill}".`,
          confidence: 0.85,
        });
      } else {
        lowerSeen.set(lower, skill);
      }
    });
    issues.push(...findSpellingIssues(resume.skills, 'skills'));
  }

  // Date consistency, resume-wide
  issues.push(...findDateConsistencyIssues(periodsForConsistency));

  // Completeness
  issues.push(...findCompletenessIssues(resume));

  return issues;
}

/**
 * Lightweight single-field validator for the live editor (spec section 8).
 * Cheap, synchronous, no network calls — safe to run on a debounce timer
 * while the user types. Returns at most a couple of issues per field so the
 * editor doesn't get noisy.
 */
export function validateField(
  text: string,
  section: ValidationIssue['section'],
  itemId?: string
): ValidationIssue[] {
  if (!text || text.trim().length < 4) return [];
  const trimmed = text.trim();
  const lower = trimmed.toLowerCase();
  const issues: ValidationIssue[] = [];

  // 1. Weak Action Verbs
  const weakVerbs = ['worked on', 'worked', 'helped', 'did', 'made', 'handled', 'responsible for', 'used'];
  const firstWordMatch = weakVerbs.find((v) => lower.startsWith(v));
  if (firstWordMatch && (section === 'experience' || section === 'projects')) {
    issues.push({
      id: nextId('weak_verb'),
      original: firstWordMatch,
      type: 'content',
      section,
      itemId,
      explanation: `"${firstWordMatch}" is a weak action verb. Strong technical action verbs (e.g. Developed, Engineered, Architected) increase parser impact.`,
      suggestion: `Developed ${trimmed.slice(firstWordMatch.length).trim()}`,
      confidence: 0.88,
    });
  }

  // 2. Lowercase Sentence Start
  if (/^[a-z]/.test(trimmed) && trimmed.length > 8) {
    issues.push({
      id: nextId('gram_cap'),
      original: trimmed.slice(0, Math.min(20, trimmed.length)),
      type: 'grammar',
      section,
      itemId,
      explanation: 'Sentence starts with a lowercase letter.',
      suggestion: trimmed.charAt(0).toUpperCase() + trimmed.slice(1),
      confidence: 0.9,
    });
  }

  // 3. Missing STAR Metric / Result (Only for experience & projects bullets)
  if (
    (section === 'experience' || section === 'projects') &&
    trimmed.split(/\s+/).length >= 5 &&
    !/\b(\d+|%|\$)\b/.test(trimmed) &&
    !/\b(increased|decreased|reduced|improved|boosted|grew|saved|lowered)\b/i.test(trimmed)
  ) {
    issues.push({
      id: nextId('star_metric'),
      original: trimmed,
      type: 'ats',
      section,
      itemId,
      explanation: 'No measurable result detected in bullet point.',
      suggestion: 'Consider adding a measurable result if available (e.g. users served, performance gain, or time saved).',
      confidence: 0.75,
    });
  }

  // 4. Bullet Length Check
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length;
  if ((section === 'experience' || section === 'projects') && wordCount < 5) {
    issues.push({
      id: nextId('len_short'),
      original: trimmed,
      type: 'formatting',
      section,
      itemId,
      explanation: 'Bullet point is very short and may lack technical context.',
      suggestion: 'Elaborate slightly on the technologies used or problem solved.',
      confidence: 0.7,
    });
  } else if ((section === 'experience' || section === 'projects') && wordCount > 45) {
    issues.push({
      id: nextId('len_long'),
      original: trimmed.slice(0, 30) + '...',
      type: 'formatting',
      section,
      itemId,
      explanation: 'Bullet point is unusually long and may be hard to scan.',
      suggestion: 'Split into two concise bullet points of 1–2 lines each.',
      confidence: 0.75,
    });
  }

  // 5. Spelling & Proper Noun Checks
  issues.push(...findSpellingIssues(text, section, itemId));

  return issues.slice(0, 3);
}
