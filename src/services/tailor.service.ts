import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './auth.service';

export interface TailoredResumeRecord {
  id?: string;
  user_id?: string;
  original_resume_id: string;
  job_description_id?: string;
  ats_report_id?: string;
  tailored_content: any;
  match_percentage: number;
  created_at?: string;
}

export const tailorService = {
  async saveTailoredResume(record: TailoredResumeRecord): Promise<TailoredResumeRecord> {
    const user = authService.getStoredUser();
    if (isSupabaseConfigured() && user) {
      const { data, error } = await supabase
        .from('tailored_resumes')
        .insert({
          user_id: user.id,
          original_resume_id: record.original_resume_id,
          job_description_id: record.job_description_id,
          ats_report_id: record.ats_report_id,
          tailored_content: record.tailored_content || {},
          match_percentage: record.match_percentage || 0,
        })
        .select()
        .single();

      if (!error && data) return data;
    }
    return record;
  },

  async listTailoredResumes(): Promise<TailoredResumeRecord[]> {
    const user = authService.getStoredUser();
    if (isSupabaseConfigured() && user) {
      const { data, error } = await supabase
        .from('tailored_resumes')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    }
    return [];
  },
};

export default tailorService;
