import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './auth.service';

export interface ResumeDocument {
  id: string;
  user_id?: string;
  title: string;
  target_role?: string;
  template_name?: string;
  resume_type?: string;
  resumeType?: string;
  targetRole?: string;
  templateName?: string;
  is_archived?: boolean;
  is_favorite?: boolean;
  isArchived?: boolean;
  isFavorite?: boolean;
  ats_score?: number | null;
  atsScore?: number | null;
  structure_score?: number | null;
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
  resumeData?: any;
  [key: string]: any;
}

const LOCAL_RESUMES_KEY = 'hireflow_local_resumes';
let inMemoryResumes: ResumeDocument[] = [];

// Centralized locking state for resume creation
export let isCreatingResume = false;
let activeCreatePromise: Promise<ResumeDocument> | null = null;

export function getIsCreatingResume(): boolean {
  return isCreatingResume;
}

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

/**
 * Creates a new resume document in Supabase with normalized sections.
 * Protected by the `isCreatingResume` locking mechanism to prevent race conditions
 * and duplicate resume record creation.
 */
export async function createResume(payload: any): Promise<ResumeDocument> {
  // If a creation is already in progress, wait for it or queue sequentially to prevent duplicate rows
  if (isCreatingResume && activeCreatePromise) {
    try {
      await activeCreatePromise;
    } catch {
      // ignore previous creation failure and proceed with lock acquisition
    }
  }

  isCreatingResume = true;

  const executeCreate = async (): Promise<ResumeDocument> => {
    try {
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
        if (payload.originalFileName) insertRow.original_file_name = payload.originalFileName;
        if (payload.filePath) insertRow.file_path = payload.filePath;
        if (payload.fileType) insertRow.file_type = payload.fileType;

        const { data: resumeDoc, error } = await supabase
          .from('resumes')
          .insert(insertRow)
          .select()
          .single();

        if (error) {
          throw new Error(error.message);
        }

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

        const { error: sectionsError } = await supabase.from('resume_sections').insert(sections);
        if (sectionsError) {
          console.warn('[supabaseService] Error inserting resume sections:', sectionsError);
        }

        const createdDoc: ResumeDocument = {
          _id: resumeDoc.id,
          id: resumeDoc.id,
          title: resumeDoc.title,
          targetRole,
          templateName: resumeDoc.template_name,
          resumeType: resumeDoc.resume_type,
          ats_score: atsScore,
          atsScore: atsScore,
          createdAt: resumeDoc.created_at,
          updatedAt: resumeDoc.updated_at,
          resumeData: rd,
        };

        const list = getLocalResumes();
        list.unshift(createdDoc);
        saveLocalResumes(list);

        return createdDoc;
      }

      // Local storage fallback when Supabase is not configured
      const id = `local_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newDoc: ResumeDocument = {
        _id: id,
        id,
        title,
        targetRole,
        templateName: payload.templateName || 'Modern',
        resumeType: payload.resumeType || rd.meta?.resumeType || 'experienced',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        resumeData: rd,
      };
      const list = getLocalResumes();
      list.unshift(newDoc);
      saveLocalResumes(list);
      return newDoc;
    } finally {
      isCreatingResume = false;
      activeCreatePromise = null;
    }
  };

  activeCreatePromise = executeCreate();
  return activeCreatePromise;
}

/**
 * Updates an existing resume document and its sections in Supabase.
 */
export async function updateResume(id: string, payload: any): Promise<ResumeDocument> {
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

    const { error: updateError } = await supabase
      .from('resumes')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      console.error('[supabaseService] updateResume error:', updateError);
      throw new Error(updateError.message);
    }

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

    const updatedDoc: ResumeDocument = {
      _id: id,
      id,
      title,
      targetRole,
      ats_score: atsScore,
      atsScore: atsScore,
      resumeData: rd,
      updatedAt: updateData.updated_at,
    };

    const list = getLocalResumes();
    const index = list.findIndex((r) => r.id === id || r._id === id);
    if (index >= 0) {
      list[index] = { ...list[index], ...updatedDoc };
      saveLocalResumes(list);
    }

    return updatedDoc;
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
    list[index] = { ...list[index], ...updatedDoc };
  } else {
    list.unshift(updatedDoc);
  }
  saveLocalResumes(list);
  return updatedDoc;
}

export async function listResumes(): Promise<ResumeDocument[]> {
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
          `[supabaseService] ⚠️ Supabase table 'resumes' does not exist in schema (PGRST205). Please run the SQL migration script from 'supabase/full_schema.sql' in your Supabase Dashboard SQL Editor.`
        );
        throw new Error(
          'Database tables have not been created yet. Please run the SQL migration from supabase/full_schema.sql in your Supabase Dashboard SQL Editor.'
        );
      } else {
        console.error('[supabaseService] list error:', error);
        throw new Error(error.message);
      }
    }

    if (data) {
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
        })
      );

      saveLocalResumes(hydrated);
      return hydrated;
    }
  }

  return getLocalResumes();
}

export async function getResume(id: string): Promise<ResumeDocument | null> {
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
}

export async function autosaveResume(id: string, payload: any): Promise<ResumeDocument> {
  return updateResume(id, payload);
}

export async function deleteResume(id: string): Promise<{ success: boolean }> {
  const user = authService.getStoredUser();
  if (isSupabaseConfigured() && user && id && !id.startsWith('local_')) {
    await supabase.from('resumes').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  }
  const list = getLocalResumes().filter((r) => r.id !== id && r._id !== id);
  saveLocalResumes(list);
  return { success: true };
}

export async function duplicateResume(id: string): Promise<ResumeDocument> {
  const original = await getResume(id);
  if (!original) throw new Error('Resume not found');
  const newPayload = {
    title: `${original.title || 'Resume'} (Copy)`,
    templateName: original.templateName || 'Modern',
    resumeType: original.resumeType || 'experienced',
    resumeData: original.resumeData || {},
  };
  return createResume(newPayload);
}

export async function renameResume(id: string, newTitle: string): Promise<ResumeDocument | null> {
  const original = await getResume(id);
  if (!original) return null;
  return updateResume(id, { ...original, title: newTitle });
}

export async function favoriteResume(id: string): Promise<{ success: boolean }> {
  const original = await getResume(id);
  if (isSupabaseConfigured() && original && !id.startsWith('local_')) {
    await supabase.from('resumes').update({ is_favorite: !original.isFavorite }).eq('id', id);
  }
  return { success: true };
}

export async function archiveResume(id: string): Promise<{ success: boolean }> {
  const original = await getResume(id);
  if (isSupabaseConfigured() && original && !id.startsWith('local_')) {
    await supabase.from('resumes').update({ is_archived: !original.isArchived }).eq('id', id);
  }
  return { success: true };
}

export async function getLatestResume(): Promise<ResumeDocument | null> {
  const list = await listResumes();
  if (!list || list.length === 0) return null;
  return list[0];
}

export const supabaseService = {
  createResume,
  updateResume,
  getResume,
  listResumes,
  deleteResume,
  duplicateResume,
  renameResume,
  favoriteResume,
  archiveResume,
  autosaveResume,
  getLatestResume,
  getIsCreatingResume,
  isCreatingResume,
};

export default supabaseService;
