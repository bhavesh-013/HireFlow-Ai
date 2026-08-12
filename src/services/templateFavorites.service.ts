import { getStoredUser, isAuthenticated } from '../lib/api';
import { authService } from './auth.service';

const LOCAL_KEY = 'hireflow_favorite_templates';

function readLocal(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(ids: string[]) {
  try {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(ids));
  } catch {
    // ignore — favorites are a nice-to-have, never block the UI on this
  }
}

/**
 * Functional template favoriting. Reads/writes localStorage immediately
 * for instant UI feedback, and — when the user is signed in — persists
 * the same list to their Supabase profile (favorite_templates column) in
 * the background so favorites follow them across devices.
 */
export const templateFavoritesService = {
  getFavoriteIds(): string[] {
    const user = getStoredUser();
    if (isAuthenticated() && user?.favorite_templates) {
      // Keep localStorage in sync as a fast local cache.
      writeLocal(user.favorite_templates);
      return user.favorite_templates;
    }
    return readLocal();
  },

  isFavorite(templateId: string): boolean {
    return this.getFavoriteIds().includes(templateId);
  },

  toggleFavorite(templateId: string): string[] {
    const current = this.getFavoriteIds();
    const next = current.includes(templateId)
      ? current.filter((id) => id !== templateId)
      : [...current, templateId];

    writeLocal(next);

    if (isAuthenticated()) {
      authService.updateProfile({ favorite_templates: next }).catch(() => {
        // Local state already updated; a failed sync isn't user-facing.
      });
    }

    return next;
  },
};

export default templateFavoritesService;
