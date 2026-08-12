import { supabase, isSupabaseConfigured } from './supabaseClient';
import { authService } from './auth.service';

export interface NotificationRecord {
  id: string;
  user_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const notificationService = {
  async listNotifications(): Promise<NotificationRecord[]> {
    const user = authService.getStoredUser();
    if (isSupabaseConfigured() && user) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) return data;
    }
    return [];
  },

  async markAsRead(id: string) {
    const user = authService.getStoredUser();
    if (isSupabaseConfigured() && user) {
      await supabase.from('notifications').update({ is_read: true }).eq('id', id);
    }
    return { success: true };
  },

  async createNotification(type: string, title: string, message: string) {
    const user = authService.getStoredUser();
    if (isSupabaseConfigured() && user) {
      await supabase.from('notifications').insert({
        user_id: user.id,
        type,
        title,
        message,
        is_read: false,
      });
    }
    return { success: true };
  },
};

export default notificationService;
