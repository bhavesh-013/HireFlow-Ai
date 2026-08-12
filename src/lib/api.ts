/**
 * API client adapter delegating directly to Supabase services
 * (authService, resumeService, aiService, storageService).
 */
import { authService, UserProfile, AuthServiceError } from '../services/auth.service';
import { resumeService } from '../services/resume.service';
import { aiService } from '../services/ai.service';

export interface ApiUser {
  _id: string;
  id: string;
  name: string;
  email: string;
  authProvider?: string;
  [key: string]: any;
}

export class ApiRequestError extends Error {
  statusCode: number;
  constructor(message: string, statusCode: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.statusCode = statusCode;
  }
}

/**
 * Wraps any auth failure as an ApiRequestError with a user-friendly
 * message, so pages that check `err instanceof ApiRequestError` (Login,
 * Signup, Forgot/Reset Password) always get a safe, displayable message —
 * never a stack trace, and never a silently-faked success.
 */
function toApiRequestError(err: any, fallbackStatus: number): ApiRequestError {
  if (err instanceof ApiRequestError) return err;
  if (err instanceof AuthServiceError) {
    return new ApiRequestError(err.message, err.status || fallbackStatus);
  }
  return new ApiRequestError(err?.message || 'Something went wrong. Please try again.', fallbackStatus);
}

export function getToken(): string | null {
  return authService.getToken();
}

export function getStoredUser(): ApiUser | null {
  const user = authService.getStoredUser();
  if (!user) return null;
  return {
    _id: user.id,
    id: user.id,
    name: user.full_name || user.name || user.email?.split('@')[0] || 'User',
    email: user.email,
    ...user,
  };
}

export function isAuthenticated(): boolean {
  return authService.isAuthenticated();
}

export const auth = {
  async register(name: string, email: string, password: string) {
    try {
      await authService.register(name, email, password);
    } catch (err) {
      throw toApiRequestError(err, 400);
    }
    const user = getStoredUser();
    if (!user) {
      // Should not happen — register() throws instead of returning
      // without a session — but guard anyway rather than assert non-null.
      throw new ApiRequestError('Something went wrong. Please try again.', 400);
    }
    return user;
  },

  async login(email: string, password: string) {
    try {
      await authService.login(email, password);
    } catch (err) {
      throw toApiRequestError(err, 401);
    }
    const user = getStoredUser();
    if (!user) {
      throw new ApiRequestError('Email or password is incorrect.', 401);
    }
    return user;
  },

  async loginWithGoogle() {
    try {
      return await authService.loginWithGoogle();
    } catch (err) {
      throw toApiRequestError(err, 400);
    }
  },

  async logout() {
    await authService.logout();
  },

  async getCurrentUser() {
    const user = await authService.getCurrentUser();
    if (!user) return null;
    return getStoredUser();
  },

  async forgotPassword(email: string) {
    try {
      return await authService.forgotPassword(email);
    } catch (err) {
      throw toApiRequestError(err, 400);
    }
  },

  async resetPassword(token: string, password: string) {
    try {
      return await authService.resetPassword(password);
    } catch (err) {
      throw toApiRequestError(err, 400);
    }
  },

  async updateProfile(updates: Partial<ApiUser>) {
    try {
      await authService.updateProfile({
        full_name: updates.name,
        ...updates,
      });
    } catch (err) {
      throw toApiRequestError(err, 400);
    }
    const user = getStoredUser();
    if (!user) {
      throw new ApiRequestError('Something went wrong. Please try again.', 400);
    }
    return user;
  },
};

export const resumes = {
  list: () => resumeService.list(),
  get: (id: string) => resumeService.get(id),
  create: (payload: any) => resumeService.create(payload),
  update: (id: string, payload: any) => resumeService.update(id, payload),
  autosave: (id: string, payload: any) => resumeService.autosave(id, payload),
  remove: (id: string) => resumeService.remove(id),
  duplicate: (id: string) => resumeService.duplicate(id),
  favorite: (id: string) => resumeService.favorite(id),
  archive: (id: string) => resumeService.archive(id),
};

export const ai = {
  atsAnalyze: (resumeData: any, targetJobDescription?: string) =>
    aiService.atsAnalyze(resumeData, targetJobDescription),

  jdMatch: (resumeData: any, jobDescription: string) =>
    aiService.jdMatch(resumeData, jobDescription),

  suggest: (payload: any) =>
    aiService.rewriteSummary(payload.summary || payload.currentSkills || '', payload.targetRole, payload.mode),

  careerCoach: (payload: any) =>
    aiService.careerCoach(payload.message || '', payload.activeSection, payload.resumeData),
};

export default { auth, resumes, ai, getToken, getStoredUser, isAuthenticated };
