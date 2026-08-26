/**
 * HireFlow AI — Resume Activity Service
 * ──────────────────────────────────────
 * Logs and retrieves user resume activity (uploads, edits, exports, etc.)
 * backed by the `resume_activity` Supabase table.
 *
 * Every operation is scoped to the currently authenticated user via RLS.
 */

import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './auth.service';

export type ActivityType =
  | 'RESUME_UPLOADED'
  | 'RESUME_CREATED'
  | 'RESUME_UPDATED'
  | 'ATS_ANALYZED'
  | 'RESUME_EXPORTED_PDF'
  | 'RESUME_EXPORTED_DOCX'
  | 'RESUME_DELETED';

export interface ActivityRecord {
  id: string;
  user_id: string;
  resume_id: string | null;
  activity_type: ActivityType;
  description: string;
  created_at: string;
}

/** Human-readable labels for timeline display */
const ACTIVITY_LABELS: Record<ActivityType, string> = {
  RESUME_UPLOADED: 'Resume uploaded',
  RESUME_CREATED: 'Resume created',
  RESUME_UPDATED: 'Resume updated',
  ATS_ANALYZED: 'ATS analysis completed',
  RESUME_EXPORTED_PDF: 'Exported as PDF',
  RESUME_EXPORTED_DOCX: 'Exported as DOCX',
  RESUME_DELETED: 'Resume deleted',
};

export const activityService = {
  /**
   * Logs an activity event. Fails silently (console.warn) — activity logging
   * should never block or crash the primary user flow.
   */
  async logActivity(
    activityType: ActivityType,
    resumeId?: string | null,
    description?: string
  ): Promise<void> {
    const user = authService.getStoredUser();
    if (!isSupabaseConfigured() || !user) return;

    const desc = description || ACTIVITY_LABELS[activityType] || activityType;

    try {
      const row: any = {
        user_id: user.id,
        activity_type: activityType,
        description: desc,
      };
      // Only set resume_id if it's a real Supabase UUID (not a local/draft id)
      if (resumeId && !resumeId.startsWith('local_') && !resumeId.startsWith('draft_')) {
        row.resume_id = resumeId;
      }

      const { error } = await supabase.from('resume_activity').insert(row);
      if (error) {
        console.warn('[activityService] insert failed:', error.message);
      }
    } catch (err) {
      console.warn('[activityService] logActivity error:', err);
    }
  },

  /**
   * Fetches the most recent activities for the current user.
   * Returns an empty array for guests or when Supabase is not configured.
   */
  async listRecent(limit: number = 15): Promise<ActivityRecord[]> {
    const user = authService.getStoredUser();
    if (!isSupabaseConfigured() || !user) return [];

    try {
      const { data, error } = await supabase
        .from('resume_activity')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.warn('[activityService] listRecent failed:', error.message);
        return [];
      }
      return (data || []) as ActivityRecord[];
    } catch (err) {
      console.warn('[activityService] listRecent error:', err);
      return [];
    }
  },
};

export default activityService;
