/**
 * HireFlow Resume Version & Safety Service
 * ─────────────────────────────────────────
 * Ensures original resumes remain 100% UNCHANGED and IMMUTABLE.
 * Manages creation, storage, and retrieval of separate tailored resume versions per JD.
 *
 * Supported Flow:
 *  Base Resume A → Tailored Version (Google)
 *  Base Resume A → Tailored Version (Microsoft)
 *  (Both stored separately; original Base Resume A is never overwritten).
 */

import type { ParsedResumeData, TailoredResumeVersion, TailoringSuggestion } from '../types';
import { analyzeResume } from './ats.engine';
import { analyzeJobDescription } from './jd.analyzer';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './auth.service';

const STORAGE_KEY = 'hireflow_tailored_versions';

function getStoredVersions(): TailoredResumeVersion[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredVersions(versions: TailoredResumeVersion[]): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(versions));
  } catch (err) {
    console.warn('Failed to save tailored versions to localStorage:', err);
  }
}

export const versionService = {
  /**
   * Creates a NEW separate tailored resume version from a base resume and JD.
   * Does NOT mutate or overwrite the original resume.
   */
  createTailoredVersion(
    baseResume: ParsedResumeData,
    jobDescriptionText: string,
    targetCompany: string = 'Target Employer',
    targetRole: string = 'Target Role'
  ): TailoredResumeVersion {
    const originalId = baseResume.id || `res_orig_${Date.now()}`;
    const versionId = `tailored_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const jdResult = analyzeJobDescription(jobDescriptionText);
    const resolvedRole = targetRole !== 'Target Role' ? targetRole : jdResult.targetRole || baseResume.personalInfo?.jobTitle || 'Software Engineer';
    const resolvedCompany = targetCompany !== 'Target Employer' ? targetCompany : jdResult.industry || 'Target Company';

    // Deep clone base resume to ensure zero mutation
    const clonedResumeData: ParsedResumeData = JSON.parse(JSON.stringify(baseResume));
    clonedResumeData.id = versionId;
    clonedResumeData.title = `${clonedResumeData.title || 'Resume'} — Tailored for ${resolvedCompany}`;

    // Run deterministic analysis on initial cloned data
    const report = analyzeResume(clonedResumeData, { jobDescription: jobDescriptionText });

    const newVersion: TailoredResumeVersion = {
      id: versionId,
      originalResumeId: originalId,
      title: clonedResumeData.title,
      targetCompany: resolvedCompany,
      targetRole: resolvedRole,
      jobDescriptionText,
      generalAtsScore: report.finalScore,
      jdMatchScore: report.jdMatchBreakdown?.overallJdMatchScore || 70,
      jdMatchBreakdown: report.jdMatchBreakdown,
      parsedResume: clonedResumeData,
      suggestions: [],
      appliedSuggestionIds: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isOriginal: false,
    };

    // Save to local storage
    const all = getStoredVersions();
    all.unshift(newVersion);
    saveStoredVersions(all);

    // Sync to Supabase in background if logged in
    const user = authService.getStoredUser();
    if (isSupabaseConfigured() && user) {
      supabase
        .from('tailored_resumes')
        .insert({
          user_id: user.id,
          original_resume_id: originalId,
          tailored_content: newVersion,
          match_percentage: newVersion.jdMatchScore,
        })
        .then(({ error }) => {
          if (error) console.warn('Supabase tailored_resumes insert notice:', error.message);
        });
    }

    return newVersion;
  },

  /**
   * Retrieves all tailored versions created for a specific base resume ID.
   */
  listVersionsForResume(originalResumeId: string): TailoredResumeVersion[] {
    const all = getStoredVersions();
    return all.filter((v) => v.originalResumeId === originalResumeId);
  },

  /**
   * Retrieves a specific tailored version by ID.
   */
  getVersionById(versionId: string): TailoredResumeVersion | null {
    const all = getStoredVersions();
    return all.find((v) => v.id === versionId) || null;
  },

  /**
   * Updates a tailored version's content & recalculates its deterministic score.
   * Never alters the original base resume.
   */
  updateVersionContent(
    versionId: string,
    updatedResumeData: ParsedResumeData,
    appliedSuggestionIds: string[],
    suggestions?: TailoringSuggestion[]
  ): TailoredResumeVersion | null {
    const all = getStoredVersions();
    const idx = all.findIndex((v) => v.id === versionId);
    if (idx === -1) return null;

    const current = all[idx];
    const report = analyzeResume(updatedResumeData, { jobDescription: current.jobDescriptionText });

    const updatedVersion: TailoredResumeVersion = {
      ...current,
      generalAtsScore: report.finalScore,
      jdMatchScore: report.jdMatchBreakdown?.overallJdMatchScore || current.jdMatchScore,
      jdMatchBreakdown: report.jdMatchBreakdown,
      parsedResume: updatedResumeData,
      appliedSuggestionIds,
      suggestions: suggestions || current.suggestions,
      updatedAt: new Date().toISOString(),
    };

    all[idx] = updatedVersion;
    saveStoredVersions(all);
    return updatedVersion;
  },

  /**
   * Deletes a tailored version.
   */
  deleteVersion(versionId: string): boolean {
    const all = getStoredVersions();
    const filtered = all.filter((v) => v.id !== versionId);
    if (filtered.length !== all.length) {
      saveStoredVersions(filtered);
      return true;
    }
    return false;
  },

  /**
   * Restores the original un-tailored resume data.
   */
  restoreOriginal(originalResume: ParsedResumeData): ParsedResumeData {
    return JSON.parse(JSON.stringify(originalResume));
  },
};

export default versionService;
