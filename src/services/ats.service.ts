import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './auth.service';
import type { ATSFullReport } from '../types';

// ─── DB Record Shape ──────────────────────────────────────────────────────────

export interface AtsReportRecord {
  id?: string;
  user_id?: string;
  resume_id?: string;
  job_description_id?: string;
  overall_score: number;
  // Category scores
  formatting_score?: number;
  sections_score?: number;
  section_order_score?: number;
  keyword_score?: number;
  hard_skills_score?: number;
  soft_skills_score?: number;
  experience_score?: number;
  projects_score?: number;
  education_score?: number;
  certificates_score?: number;
  achievements_score?: number;
  metrics_score?: number;
  star_format_score?: number;
  action_verb_score?: number;
  leadership_score?: number;
  readability_score?: number;
  bullet_quality_score?: number;
  length_score?: number;
  title_score?: number;
  contact_info_score?: number;
  github_score?: number;
  portfolio_score?: number;
  linkedin_score?: number;
  missing_skills_score?: number;
  repeated_keywords_score?: number;
  keyword_density_score?: number;
  date_consistency_score?: number;
  grammar_typos_score?: number;
  // Summary data
  missing_keywords?: string[];
  repeated_keywords?: string[];
  top_fixes?: any[];
  full_report?: any;
  analysis_source?: 'client' | 'gemini';
  // Legacy fields kept for backward compatibility
  grammar_score?: number;
  recommendations?: string[];
  ai_suggestions?: any;
  created_at?: string;
}

// ─── Map ATSFullReport → AtsReportRecord ─────────────────────────────────────

export function mapReportToRecord(
  report: ATSFullReport,
  extras?: { resumeId?: string; jobDescriptionId?: string }
): AtsReportRecord {
  const c = report.categories;
  return {
    overall_score: report.finalScore,
    formatting_score: c.formatting?.score,
    sections_score: c.sections?.score,
    section_order_score: c.sectionOrder?.score,
    keyword_score: c.keywords?.score,
    hard_skills_score: c.hardSkills?.score,
    soft_skills_score: c.softSkills?.score,
    experience_score: c.experience?.score,
    projects_score: c.projects?.score,
    education_score: c.education?.score,
    certificates_score: c.certificates?.score,
    achievements_score: c.achievements?.score,
    metrics_score: c.metrics?.score,
    star_format_score: c.starFormat?.score,
    action_verb_score: c.actionVerbs?.score,
    leadership_score: c.leadership?.score,
    readability_score: c.readability?.score,
    bullet_quality_score: c.bulletQuality?.score,
    length_score: c.length?.score,
    title_score: c.title?.score,
    contact_info_score: c.contactInfo?.score,
    github_score: c.github?.score,
    portfolio_score: c.portfolio?.score,
    linkedin_score: c.linkedin?.score,
    missing_skills_score: c.missingSkills?.score,
    repeated_keywords_score: c.repeatedKeywords?.score,
    keyword_density_score: c.keywordDensity?.score,
    date_consistency_score: c.dateConsistency?.score,
    grammar_typos_score: c.grammarTypos?.score,
    missing_keywords: report.missingKeywords.map((k) => k.keyword),
    repeated_keywords: report.repeatedKeywords.map((k) => k.keyword),
    top_fixes: report.topFixes,
    full_report: report,
    analysis_source: report.analysisSource === 'gemini' ? 'gemini' : 'client',
    resume_id: extras?.resumeId,
    job_description_id: extras?.jobDescriptionId,
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const atsService = {
  async saveReport(
    report: ATSFullReport,
    extras?: { resumeId?: string; jobDescriptionId?: string }
  ): Promise<AtsReportRecord> {
    const user = authService.getStoredUser();
    const record = mapReportToRecord(report, extras);

    if (isSupabaseConfigured() && user) {
      const { data, error } = await supabase
        .from('ats_reports')
        .insert({
          user_id: user.id,
          ...record,
        })
        .select()
        .single();

      if (!error && data) return data;
      if (error) console.warn('atsService.saveReport error:', error.message);
    }
    return record;
  },

  async listUserReports(): Promise<AtsReportRecord[]> {
    const user = authService.getStoredUser();
    if (isSupabaseConfigured() && user) {
      const { data, error } = await supabase
        .from('ats_reports')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    }
    return [];
  },

  async saveJobDescription(
    jobTitle: string,
    company: string,
    jdText: string
  ): Promise<string | null> {
    const user = authService.getStoredUser();
    if (isSupabaseConfigured() && user) {
      const { data, error } = await supabase
        .from('job_descriptions')
        .insert({
          user_id: user.id,
          job_title: jobTitle,
          company,
          jd_text: jdText,
        })
        .select('id')
        .single();

      if (!error && data) return data.id;
    }
    return null;
  },
};

export default atsService;
