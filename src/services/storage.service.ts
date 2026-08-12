import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './auth.service';

export const storageService = {
  async uploadAvatar(file: File): Promise<string> {
    const user = authService.getStoredUser();
    if (!user) throw new Error('Not authenticated');

    if (isSupabaseConfigured()) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw new Error(uploadError.message);

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      return data.publicUrl;
    }

    return URL.createObjectURL(file);
  },

  async uploadResumeFile(file: File): Promise<string> {
    const user = authService.getStoredUser();
    if (!user) throw new Error('Not authenticated');

    if (isSupabaseConfigured()) {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      const { error } = await supabase.storage
        .from('resumes')
        .upload(filePath, file, { upsert: true });

      if (error) throw new Error(error.message);
      return filePath;
    }

    return file.name;
  },

  async saveExportFile(resumeId: string, fileType: 'pdf' | 'docx', blob: Blob): Promise<string> {
    const user = authService.getStoredUser();
    if (!user) throw new Error('Not authenticated');

    const fileName = `export_${resumeId}_${Date.now()}.${fileType}`;
    const filePath = `${user.id}/${fileName}`;

    if (isSupabaseConfigured()) {
      const { error } = await supabase.storage
        .from('exports')
        .upload(filePath, blob, { contentType: fileType === 'pdf' ? 'application/pdf' : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', upsert: true });

      if (!error) {
        // Record in exports table
        await supabase.from('exports').insert({
          user_id: user.id,
          resume_id: resumeId && !resumeId.startsWith('local_') ? resumeId : null,
          file_type: fileType,
          file_url: filePath,
          status: 'completed',
        });
      }
    }

    return URL.createObjectURL(blob);
  },
};

export default storageService;
