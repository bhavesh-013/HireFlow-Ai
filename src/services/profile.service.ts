import { authService, UserProfile } from './auth.service';

export const profileService = {
  async getProfile(): Promise<UserProfile | null> {
    return authService.getCurrentUser();
  },

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    return authService.updateProfile(updates);
  },
};

export default profileService;
