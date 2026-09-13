/**
 * HireFlow JD Analysis Types
 * ──────────────────────────
 * Structured response interfaces for Job Description analysis,
 * matching, and tailored resume generation.
 */

// ─── Matched Keywords ─────────────────────────────────────────────────────────

export interface MatchedKeyword {
  keyword: string;
  /** Where in the resume this keyword was found */
  foundIn: string;
}

// ─── Categorized Missing Keywords ─────────────────────────────────────────────

export interface CategorizedMissingKeywords {
  technicalSkills: string[];
  tools: string[];
  frameworks: string[];
  concepts: string[];
  domainKeywords: string[];
}

// ─── Recommended Skills ───────────────────────────────────────────────────────

export type SkillStatus = 'already_present' | 'relevant_missing' | 'consider_learning';

export interface RecommendedSkill {
  skill: string;
  reason: string;
  status: SkillStatus;
}

// ─── Experience & Project Gaps ────────────────────────────────────────────────

export interface ExperienceGap {
  gap: string;
  details: string;
}

export interface ProjectRecommendation {
  recommendation: string;
  details: string;
}

// ─── Resume Improvements ──────────────────────────────────────────────────────

export interface ResumeImprovement {
  section: string;
  current: string;
  suggested: string;
  reason: string;
}

// ─── Full JD Analysis Result ──────────────────────────────────────────────────

export interface JdAnalysisResult {
  /** Overall match score 0–100 (AI + keyword analysis estimate) */
  matchScore: number;
  /** Important JD keywords already present in the resume */
  matchedKeywords: MatchedKeyword[];
  /** Important JD keywords NOT found in the resume, categorized */
  missingKeywords: CategorizedMissingKeywords;
  /** Skills to consider, with reasons and status */
  recommendedSkills: RecommendedSkill[];
  /** Gaps between JD requirements and resume experience */
  experienceGaps: ExperienceGap[];
  /** Recommendations for project section improvements */
  projectRecommendations: ProjectRecommendation[];
  /** Concrete, before/after resume improvement suggestions */
  resumeImprovements: ResumeImprovement[];
  /** Suggested improved summary, or null if current is adequate */
  summarySuggestion: string | null;
}

// ─── Tailored Resume AI Response ──────────────────────────────────────────────

export interface TailoredResumeAiResponse {
  /** Optimized summary for the target role */
  summary: string;
  /** Skills string, reordered/optimized for ATS relevance */
  skills: string;
  /** Experience bullets rewritten for JD alignment (keyed by experience entry id) */
  experienceBullets: Record<string, string[]>;
  /** Project bullets rewritten for JD alignment (keyed by project entry id) */
  projectBullets: Record<string, string[]>;
  /** Recommended section order for this JD */
  sectionPriority: string[];
}
