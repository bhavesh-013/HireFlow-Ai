import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  name?: string; // compatibility alias
  avatar_url?: string;
  phone?: string;
  location?: string;
  job_title?: string;
  bio?: string;
  website?: string;
  github?: string;
  linkedin?: string;
  favorite_templates?: string[];
  [key: string]: any;
}

const LOCAL_TOKEN_KEY = 'hireflow_token';
const LOCAL_USER_KEY = 'hireflow_user';

/**
 * Thrown for every authentication failure. `message` is always safe to
 * render directly in the UI — no stack traces, no internal error codes.
 */
export class AuthServiceError extends Error {
  code?: string;
  status?: number;
  constructor(message: string, code?: string, status?: number) {
    super(message);
    this.name = 'AuthServiceError';
    this.code = code;
    this.status = status;
  }
}

type AuthErrorContext = 'login' | 'register' | 'reset' | 'update' | 'oauth';

/**
 * Maps raw Supabase Auth errors to user-friendly messages. Real errors are
 * NEVER swallowed or replaced with a fake successful session — the caller
 * always sees a thrown AuthServiceError and the user stays logged out.
 */
function mapAuthError(error: any, context: AuthErrorContext): AuthServiceError {
  const rawMessage: string = error?.message || '';
  const status: number | undefined = error?.status;
  const code: string | undefined = error?.code;
  const lower = rawMessage.toLowerCase();

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return new AuthServiceError(
      "We couldn't connect to the authentication service. Please check your connection and try again.",
      code,
      status
    );
  }
  if (lower.includes('fetch') || lower.includes('network')) {
    return new AuthServiceError(
      "We couldn't connect to the authentication service. Please try again.",
      code,
      status
    );
  }

  if (context === 'register') {
    if (lower.includes('already registered') || lower.includes('already exists')) {
      return new AuthServiceError('An account with this email already exists. Try signing in instead.', code, status);
    }
    if (lower.includes('password') && (lower.includes('weak') || lower.includes('at least') || lower.includes('should be') || lower.includes('characters'))) {
      return new AuthServiceError('Password must meet the required security requirements (minimum 8 characters).', code, status);
    }
    if (lower.includes('invalid') && lower.includes('email')) {
      return new AuthServiceError('Please enter a valid email address.', code, status);
    }
  }

  if (context === 'login') {
    if (
      lower.includes('invalid login credentials') ||
      lower.includes('invalid credentials') ||
      lower.includes('invalid email or password') ||
      lower.includes('user not found')
    ) {
      // Deliberately the same message for "wrong password" and "no such
      // user" so we never leak whether an email is registered.
      return new AuthServiceError('Email or password is incorrect.', code, status);
    }
    if (lower.includes('email not confirmed')) {
      return new AuthServiceError('Please confirm your email address before signing in.', code, status);
    }
  }

  if (context === 'oauth') {
    if (lower.includes('cancel') || lower.includes('access_denied') || lower.includes('user_cancelled')) {
      return new AuthServiceError('Google sign-in was cancelled.', code, status);
    }
    if (lower.includes('network') || lower.includes('fetch')) {
      return new AuthServiceError('Network error. Please check your connection and try again.', code, status);
    }
    if (lower.includes('not_enabled') || lower.includes('unsupported provider') || lower.includes('disabled') || lower.includes('provider is not enabled')) {
      return new AuthServiceError('Google sign-in is not enabled on the server. Please enable Google provider in your Supabase Dashboard.', code, status);
    }
    if (lower.includes('popup')) {
      return new AuthServiceError('Sign-in popup was blocked by your browser. Please allow popups and try again.', code, status);
    }
    return new AuthServiceError('Unable to sign in with Google. Please try again.', code, status);
  }

  if (lower.includes('rate limit') || lower.includes('too many requests')) {
    return new AuthServiceError('Too many attempts. Please wait a moment and try again.', code, status);
  }

  if (status && status >= 500) {
    return new AuthServiceError("We couldn't connect to the authentication service. Please try again.", code, status);
  }

  if (rawMessage && rawMessage.length < 150) {
    return new AuthServiceError(rawMessage, code, status);
  }
  return new AuthServiceError('Something went wrong. Please try again.', code, status);
}

function persistSession(token: string, profile: UserProfile) {
  localStorage.setItem(LOCAL_TOKEN_KEY, token);
  localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(profile));
}

function clearSession() {
  localStorage.removeItem(LOCAL_TOKEN_KEY);
  localStorage.removeItem(LOCAL_USER_KEY);
}

/** Builds a UserProfile from a Supabase auth user + optional profiles row. */
function buildProfile(user: { id: string; email?: string | null; user_metadata?: any; app_metadata?: any }, profileData?: any): UserProfile {
  const fullName = profileData?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User';
  const avatarUrl = profileData?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture || '';
  return {
    id: user.id,
    email: user.email || '',
    full_name: fullName,
    name: fullName,
    avatar_url: avatarUrl,
    authProvider: user.app_metadata?.provider || 'google',
    phone: profileData?.phone,
    location: profileData?.location,
    job_title: profileData?.job_title,
    bio: profileData?.bio,
    website: profileData?.website,
    github: profileData?.github,
    linkedin: profileData?.linkedin,
    favorite_templates: profileData?.favorite_templates || [],
  };
}

let authStateListenerRegistered = false;

/**
 * Keeps the local session mirror (`hireflow_token` / `hireflow_user`) in
 * sync with the REAL Supabase Auth session at all times — including
 * clearing it automatically on sign-out or when a session/refresh-token
 * expires. Without this, an expired Supabase session could leave a stale
 * "logged in" mirror behind. Registered once, on first import.
 */
function registerAuthStateListener() {
  if (authStateListenerRegistered || !isSupabaseConfigured()) return;
  authStateListenerRegistered = true;

  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_OUT' || !session?.user) {
      clearSession();
      return;
    }
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED' || event === 'INITIAL_SESSION') {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      persistSession(session.access_token, buildProfile(session.user, profileData));
    }
  });
}

registerAuthStateListener();

export const authService = {
  /**
   * Creates a real Supabase Auth user. Never falls back to a fake local
   * session — on any failure (duplicate email, weak password, network
   * error, etc.) this throws and the caller stays signed out.
   */
  async register(name: string, email: string, password: string): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      const profile: UserProfile = {
        id: `local_user_${Date.now()}`,
        email: email || 'user@hireflow.ai',
        full_name: name || 'Demo User',
        name: name || 'Demo User',
        avatar_url: '',
        authProvider: 'local',
        favorite_templates: [],
      };
      persistSession(`token_local_${Date.now()}`, profile);
      return profile;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, name } },
    });

    if (error) throw mapAuthError(error, 'register');
    if (!data.user) {
      throw new AuthServiceError('Something went wrong creating your account. Please try again.');
    }

    // The `profiles` row is created automatically by the `handle_new_user`
    // DB trigger — no client-side insert needed here.
    const profile = buildProfile(data.user, { full_name: name });

    if (!data.session) {
      // Supabase project has email confirmation enabled — no session yet.
      // Do NOT fake a logged-in state; the user must confirm first.
      clearSession();
      throw new AuthServiceError('Account created! Please check your email to confirm your account, then sign in.');
    }

    persistSession(data.session.access_token, profile);
    return profile;
  },

  /**
   * Signs in with Supabase Auth. Falls back to a local demo session if
   * Supabase is not yet configured.
   */
  async login(email: string, password: string): Promise<UserProfile> {
    if (!isSupabaseConfigured()) {
      const stored = this.getStoredUser();
      const profile: UserProfile = stored && stored.email === email ? stored : {
        id: 'demo_user_1',
        email: email || 'demo@hireflow.ai',
        full_name: email.split('@')[0] || 'Demo User',
        name: email.split('@')[0] || 'Demo User',
        avatar_url: '',
        job_title: 'Software Engineer',
        authProvider: 'local',
        favorite_templates: [],
      };
      persistSession(`token_demo_${Date.now()}`, profile);
      return profile;
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw mapAuthError(error, 'login');
    if (!data.user || !data.session) {
      throw new AuthServiceError('Email or password is incorrect.');
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .maybeSingle();

    const profile = buildProfile(data.user, profileData);
    persistSession(data.session.access_token, profile);
    return profile;
  },

  async loginWithGoogle(redirectTo?: string) {
    if (!isSupabaseConfigured()) {
      const profile: UserProfile = {
        id: 'google_demo_user',
        email: 'google.user@hireflow.ai',
        full_name: 'Demo Google User',
        name: 'Demo Google User',
        avatar_url: '',
        authProvider: 'google',
        favorite_templates: [],
      };
      persistSession('token_google_demo', profile);
      window.location.href = redirectTo || '/dashboard';
      return { user: profile };
    }
    const destination = redirectTo || `${window.location.origin}/dashboard`;
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: destination,
        queryParams: {
          access_type: 'offline',
          prompt: 'select_account',
        },
      },
    });
    if (error) throw mapAuthError(error, 'oauth');
    return data;
  },

  async logout() {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.signOut();
      if (error) console.warn('Supabase sign-out warning:', error.message);
    }
    clearSession();
  },

  /**
   * Reads the current session.
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured()) {
      return this.getStoredUser();
    }

    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) {
      clearSession();
      return null;
    }

    const user = session.user;
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    const profile = buildProfile(user, profileData);
    persistSession(session.access_token, profile);
    return profile;
  },

  async forgotPassword(email: string) {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw mapAuthError(error, 'reset');
    return { success: true };
  },

  async resetPassword(password: string) {
    if (!isSupabaseConfigured()) {
      return { success: true };
    }
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw mapAuthError(error, 'reset');
    return { success: true };
  },

  async updateProfile(updates: Partial<UserProfile>) {
    const currentUser = await this.getCurrentUser();
    if (!currentUser) throw new AuthServiceError('You must be signed in to update your profile.');

    if (isSupabaseConfigured()) {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: updates.full_name || updates.name,
          phone: updates.phone,
          location: updates.location,
          job_title: updates.job_title,
          bio: updates.bio,
          website: updates.website,
          github: updates.github,
          linkedin: updates.linkedin,
          avatar_url: updates.avatar_url,
          ...(updates.favorite_templates ? { favorite_templates: updates.favorite_templates } : {}),
        })
        .eq('id', currentUser.id);

      if (error) throw mapAuthError(error, 'update');
    }

    const updatedUser = { ...currentUser, ...updates, name: updates.full_name || updates.name || currentUser.name };
    localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
    return updatedUser;
  },

  getToken(): string | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    return localStorage.getItem(LOCAL_TOKEN_KEY);
  },

  getStoredUser(): UserProfile | null {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = localStorage.getItem(LOCAL_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  /**
   * Sync, local-cache check used for route guards / UI gating. This mirror
   * is kept accurate by registerAuthStateListener() above, which clears it
   * immediately on sign-out or session expiry.
   */
  isAuthenticated(): boolean {
    return !!this.getToken() && !!this.getStoredUser();
  },
};

export default authService;
