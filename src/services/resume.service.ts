import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './auth.service';

export interface ResumeDocument {
  id: string;
  user_id?: string;
  title: string;
  target_role?: string;
  template_name?: string;
  is_archived?: boolean;
  is_favorite?: boolean;
  created_at?: string;
  updated_at?: string;
  resumeData?: any;
  [key: string]: any;
}

const LOCAL_RESUMES_KEY = 'hireflow_local_resumes';
let inMemoryResumes: ResumeDocument[] = [];

function getLocalResumes(): ResumeDocument[] {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return inMemoryResumes;
    const raw = localStorage.getItem(LOCAL_RESUMES_KEY);
    let list: ResumeDocument[] = raw ? JSON.parse(raw) : inMemoryResumes;
    // Fallback: merge current in-progress local resume if not already in list
    const currentRaw = localStorage.getItem('hireflow_current_resume');
    if (currentRaw) {
      try {
        const curData = JSON.parse(currentRaw);
        const curId = curData.id || curData._id || 'local_current';
        if (!list.some((r) => r.id === curId || r._id === curId)) {
          list = [
            {
              _id: curId,
              id: curId,
              title: curData.title || 'Untitled Resume',
              targetRole: curData.targetRole || curData.personalInfo?.jobTitle || '',
              templateName: curData.templateName || 'Modern',
              resumeType: curData.resumeType || 'experienced',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              resumeData: curData,
            },
            ...list,
          ];
        }
      } catch {}
    }
    return list;
  } catch {
    return inMemoryResumes;
  }
}

function saveLocalResumes(resumes: ResumeDocument[]) {
  inMemoryResumes = resumes;
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(LOCAL_RESUMES_KEY, JSON.stringify(resumes));
  } catch {}
}

export const resumeService = {
  async list(): Promise<ResumeDocument[]> {
    const user = authService.getStoredUser();

    if (isSupabaseConfigured() && user) {
      const { data, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false });

      if (error) {
        if (error.code === 'PGRST205') {
          console.error(
            `[resumeService] ⚠️ Supabase table 'resumes' does not exist in schema (PGRST205). Please run the SQL migration script from 'supabase/full_schema.sql' in your Supabase Dashboard SQL Editor.`
          );
          // Throw so callers get a meaningful error instead of silently falling back to stale localStorage
          throw new Error(
            'Database tables have not been created yet. Please run the SQL migration from supabase/full_schema.sql in your Supabase Dashboard SQL Editor.'
          );
        } else {
          console.error('[resumeService] list error:', error);
          throw new Error(error.message);
        }
      }

      if (data) {
        // Hydrate resumeData from sections for each resume
        const hydrated = await Promise.all(
          data.map(async (doc) => {
            const { data: sections } = await supabase
              .from('resume_sections')
              .select('*')
              .eq('resume_id', doc.id)
              .order('section_order', { ascending: true });

            let resumeData: any = {};
            if (sections && sections.length > 0) {
              sections.forEach((sec) => {
                if (sec.section_type === 'personal_info') resumeData.personalInfo = sec.content;
                else if (sec.section_type === 'summary') resumeData.summary = sec.content?.summary || sec.content;
                else if (sec.section_type === 'experience') resumeData.experience = sec.content?.items || sec.content;
                else if (sec.section_type === 'education') resumeData.education = sec.content?.items || sec.content;
                else if (sec.section_type === 'projects') resumeData.projects = sec.content?.items || sec.content;
                else if (sec.section_type === 'skills') resumeData.skills = sec.content?.items || sec.content;
                else if (sec.section_type === 'certifications') resumeData.certifications = sec.content?.items || sec.content;
                else if (sec.section_type === 'achievements') resumeData.achievements = sec.content?.items || sec.content;
                else if (sec.section_type === 'meta') resumeData.meta = sec.content;
              });
            }

            return {
              _id: doc.id, // compatibility
              id: doc.id,
              title: doc.title,
              targetRole: doc.target_role,
              templateName: doc.template_name || 'Modern',
              resumeType: doc.resume_type || 'experienced',
              isArchived: doc.is_archived,
              isFavorite: doc.is_favorite,
              ats_score: typeof doc.ats_score === 'number' ? doc.ats_score : typeof resumeData.meta?.atsScore === 'number' ? resumeData.meta.atsScore : null,
              atsScore: typeof doc.ats_score === 'number' ? doc.ats_score : typeof resumeData.meta?.atsScore === 'number' ? resumeData.meta.atsScore : null,
              structure_score: doc.structure_score ?? null,
              createdAt: doc.created_at,
              updatedAt: doc.updated_at,
              resumeData,
            };
          })
        );

        // Keep localStorage cache in sync with the authoritative Supabase data
        saveLocalResumes(hydrated);
        return hydrated;
      }
    }

    return getLocalResumes();
  },

  async get(id: string): Promise<ResumeDocument | null> {
    const user = authService.getStoredUser();

    if (isSupabaseConfigured() && user && id && !id.startsWith('draft_') && !id.startsWith('local_')) {
      const { data: doc, error } = await supabase
        .from('resumes')
        .select('*')
        .eq('id', id)
        .single();

      if (!error && doc) {
        const { data: sections } = await supabase
          .from('resume_sections')
          .select('*')
          .eq('resume_id', id)
          .order('section_order', { ascending: true });

        let resumeData: any = {};
        if (sections && sections.length > 0) {
          sections.forEach((sec) => {
            if (sec.section_type === 'personal_info') resumeData.personalInfo = sec.content;
            else if (sec.section_type === 'summary') resumeData.summary = sec.content?.summary || sec.content;
            else if (sec.section_type === 'experience') resumeData.experience = sec.content?.items || sec.content;
            else if (sec.section_type === 'education') resumeData.education = sec.content?.items || sec.content;
            else if (sec.section_type === 'projects') resumeData.projects = sec.content?.items || sec.content;
            else if (sec.section_type === 'skills') resumeData.skills = sec.content?.items || sec.content;
            else if (sec.section_type === 'certifications') resumeData.certifications = sec.content?.items || sec.content;
                else if (sec.section_type === 'achievements') resumeData.achievements = sec.content?.items || sec.content;
            else if (sec.section_type === 'meta') resumeData.meta = sec.content;
          });
        }

        return {
          _id: doc.id,
          id: doc.id,
          title: doc.title,
          targetRole: doc.target_role,
          templateName: doc.template_name || 'Modern',
          resumeType: doc.resume_type || 'experienced',
          isArchived: doc.is_archived,
          isFavorite: doc.is_favorite,
          ats_score: typeof doc.ats_score === 'number' ? doc.ats_score : typeof resumeData.meta?.atsScore === 'number' ? resumeData.meta.atsScore : null,
          atsScore: typeof doc.ats_score === 'number' ? doc.ats_score : typeof resumeData.meta?.atsScore === 'number' ? resumeData.meta.atsScore : null,
          structure_score: doc.structure_score ?? null,
          createdAt: doc.created_at,
          updatedAt: doc.updated_at,
          resumeData,
        };
      }
    }

    const localList = getLocalResumes();
    return localList.find((r) => r.id === id || r._id === id) || null;
  },

  async create(payload: any): Promise<ResumeDocument> {
    const user = authService.getStoredUser();
    const title = payload.title || 'Untitled Resume';
    const rd = payload.resumeData || {};
    const targetRole = rd.personalInfo?.jobTitle || payload.targetRole || '';

    if (isSupabaseConfigured() && user) {
      const atsScore =
        typeof payload.ats_score === 'number'
          ? payload.ats_score
          : typeof payload.atsScore === 'number'
          ? payload.atsScore
          : typeof rd.meta?.atsScore === 'number'
          ? rd.meta.atsScore
          : null;

      const insertRow: any = {
        user_id: user.id,
        title,
        target_role: targetRole,
        template_name: payload.templateName || 'Modern',
        resume_type: rd.meta?.resumeType === 'fresher' ? 'fresher' : 'experienced',
      };
      if (atsScore !== null) insertRow.ats_score = atsScore;
      // Attach optional file metadata from uploads
      if (payload.originalFileName) insertRow.original_file_name = payload.originalFileName;
      if (payload.filePath) insertRow.file_path = payload.filePath;
      if (payload.fileType) insertRow.file_type = payload.fileType;

      const { data: resumeDoc, error } = await supabase
        .from('resumes')
        .insert(insertRow)
        .select()
        .single();

      if (error) throw new Error(error.message);

      // Insert normalized sections into resume_sections
      const sections = [
        { resume_id: resumeDoc.id, section_type: 'personal_info', section_order: 1, content: rd.personalInfo || {} },
        { resume_id: resumeDoc.id, section_type: 'summary', section_order: 2, content: { summary: rd.summary || '' } },
        { resume_id: resumeDoc.id, section_type: 'experience', section_order: 3, content: { items: rd.experience || [] } },
        { resume_id: resumeDoc.id, section_type: 'education', section_order: 4, content: { items: rd.education || [] } },
        { resume_id: resumeDoc.id, section_type: 'projects', section_order: 5, content: { items: rd.projects || [] } },
        { resume_id: resumeDoc.id, section_type: 'skills', section_order: 6, content: { items: rd.skills || [] } },
        { resume_id: resumeDoc.id, section_type: 'certifications', section_order: 7, content: { items: rd.certifications || [] } },
        { resume_id: resumeDoc.id, section_type: 'achievements', section_order: 9, content: { items: rd.achievements || [] } },
        { resume_id: resumeDoc.id, section_type: 'meta', section_order: 8, content: rd.meta || {} },
      ];

      await supabase.from('resume_sections').insert(sections);

      return {
        _id: resumeDoc.id,
        id: resumeDoc.id,
        title: resumeDoc.title,
        targetRole,
        templateName: resumeDoc.template_name,
        resumeType: resumeDoc.resume_type,
        createdAt: resumeDoc.created_at,
        updatedAt: resumeDoc.updated_at,
        resumeData: rd,
      };
    }

    // Local Storage fallback
    const id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const newDoc: ResumeDocument = {
      _id: id,
      id,
      title,
      targetRole,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      resumeData: rd,
    };
    const list = getLocalResumes();
    list.unshift(newDoc);
    saveLocalResumes(list);
    return newDoc;
  },

  async update(id: string, payload: any): Promise<ResumeDocument> {
    const user = authService.getStoredUser();
    const rd = payload.resumeData || payload;
    const title = payload.title || rd.personalInfo?.fullName || 'Untitled Resume';
    const targetRole = rd.personalInfo?.jobTitle || payload.targetRole || '';

    if (isSupabaseConfigured() && user && id && !id.startsWith('local_') && !id.startsWith('draft_')) {
      const atsScore =
        typeof payload.ats_score === 'number'
          ? payload.ats_score
          : typeof payload.atsScore === 'number'
          ? payload.atsScore
          : typeof rd.meta?.atsScore === 'number'
          ? rd.meta.atsScore
          : undefined;

      const updateData: any = {
        title,
        target_role: targetRole,
        template_name: payload.templateName || undefined,
        resume_type: rd.meta?.resumeType === 'fresher' ? 'fresher' : rd.meta?.resumeType === 'experienced' ? 'experienced' : undefined,
        updated_at: new Date().toISOString(),
      };
      if (atsScore !== undefined) {
        updateData.ats_score = atsScore;
      }

      await supabase
        .from('resumes')
        .update(updateData)
        .eq('id', id);

      // Upsert sections
      const sections = [
        { resume_id: id, section_type: 'personal_info', section_order: 1, content: rd.personalInfo || {} },
        { resume_id: id, section_type: 'summary', section_order: 2, content: { summary: rd.summary || '' } },
        { resume_id: id, section_type: 'experience', section_order: 3, content: { items: rd.experience || [] } },
        { resume_id: id, section_type: 'education', section_order: 4, content: { items: rd.education || [] } },
        { resume_id: id, section_type: 'projects', section_order: 5, content: { items: rd.projects || [] } },
        { resume_id: id, section_type: 'skills', section_order: 6, content: { items: rd.skills || [] } },
        { resume_id: id, section_type: 'certifications', section_order: 7, content: { items: rd.certifications || [] } },
        { resume_id: id, section_type: 'achievements', section_order: 9, content: { items: rd.achievements || [] } },
        { resume_id: id, section_type: 'meta', section_order: 8, content: rd.meta || {} },
      ];

      for (const sec of sections) {
        const { data: existing } = await supabase
          .from('resume_sections')
          .select('id')
          .eq('resume_id', id)
          .eq('section_type', sec.section_type)
          .maybeSingle();

        if (existing) {
          await supabase.from('resume_sections').update({ content: sec.content }).eq('id', existing.id);
        } else {
          await supabase.from('resume_sections').insert(sec);
        }
      }

      return { _id: id, id, title, targetRole, resumeData: rd, updatedAt: new Date().toISOString() };
    }

    const list = getLocalResumes();
    const index = list.findIndex((r) => r.id === id || r._id === id);
    const updatedDoc: ResumeDocument = {
      _id: id,
      id,
      title,
      targetRole,
      updatedAt: new Date().toISOString(),
      resumeData: rd,
    };
    if (index >= 0) {
      list[index] = updatedDoc;
    } else {
      list.unshift(updatedDoc);
    }
    saveLocalResumes(list);
    return updatedDoc;
  },

  async autosave(id: string, payload: any): Promise<ResumeDocument> {
    return this.update(id, payload);
  },

  async remove(id: string) {
    const user = authService.getStoredUser();
    if (isSupabaseConfigured() && user && id && !id.startsWith('local_')) {
      await supabase.from('resumes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
    }
    const list = getLocalResumes().filter((r) => r.id !== id && r._id !== id);
    saveLocalResumes(list);
    return { success: true };
  },

  async duplicate(id: string): Promise<ResumeDocument> {
    const original = await this.get(id);
    if (!original) throw new Error('Resume not found');
    const newPayload = {
      title: `${original.title || 'Resume'} (Copy)`,
      resumeData: original.resumeData || {},
    };
    return this.create(newPayload);
  },

  async getLatestResume(): Promise<ResumeDocument | null> {
    const list = await this.list();
    if (!list || list.length === 0) return null;
    // list is sorted by updated_at descending
    return list[0];
  },

  async rename(id: string, newTitle: string): Promise<ResumeDocument | null> {
    const original = await this.get(id);
    if (!original) return null;
    original.title = newTitle;
    return this.update(id, { ...original, title: newTitle });
  },

  async favorite(id: string) {
    const original = await this.get(id);
    if (isSupabaseConfigured() && original && !id.startsWith('local_')) {
      await supabase.from('resumes').update({ is_favorite: !original.isFavorite }).eq('id', id);
    }
    return { success: true };
  },

  async archive(id: string) {
    const original = await this.get(id);
    if (isSupabaseConfigured() && original && !id.startsWith('local_')) {
      await supabase.from('resumes').update({ is_archived: !original.isArchived }).eq('id', id);
    }
    return { success: true };
  },
};

export default resumeService;
