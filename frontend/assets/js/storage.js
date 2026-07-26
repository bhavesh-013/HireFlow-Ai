/**
 * HireFlow AI — Storage Utility
 * Wrapper around localStorage with JSON support and token management.
 */

const Storage = {
  /**
   * Get an item from localStorage, parsed from JSON
   * @param {string} key
   * @returns {*}
   */
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return localStorage.getItem(key);
    }
  },

  /**
   * Set an item in localStorage, stringified as JSON
   * @param {string} key
   * @param {*} value
   */
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error('Storage.set error:', e);
    }
  },

  /**
   * Remove an item from localStorage
   * @param {string} key
   */
  remove(key) {
    localStorage.removeItem(key);
  },

  /**
   * Clear all localStorage
   */
  clear() {
    localStorage.clear();
  },

  /* ── Token Management ── */

  /**
   * Save auth token
   * @param {string} token
   */
  setToken(token) {
    this.set('hf_token', token);
  },

  /**
   * Get auth token
   * @returns {string|null}
   */
  getToken() {
    return this.get('hf_token');
  },

  /**
   * Remove auth token
   */
  removeToken() {
    this.remove('hf_token');
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /* ── User Data ── */

  /**
   * Save user data
   * @param {Object} user
   */
  setUser(user) {
    this.set('hf_user', user);
  },

  /**
   * Get user data
   * @returns {Object|null}
   */
  getUser() {
    return this.get('hf_user');
  },

  /**
   * Remove user data
   */
  removeUser() {
    this.remove('hf_user');
  },

  /* ── Theme ── */

  /**
   * Save theme preference
   * @param {string} theme - 'dark' or 'light'
   */
  setTheme(theme) {
    this.set('hf_theme', theme);
  },

  /**
   * Get theme preference
   * @returns {string}
   */
  getTheme() {
    return this.get('hf_theme') || 'dark';
  },

  /* ── Resume Drafts ── */

  /**
   * Save resume draft
   * @param {string} resumeId
   * @param {Object} data
   */
  saveDraft(resumeId, data) {
    const drafts = this.get('hf_drafts') || {};
    drafts[resumeId] = { data, savedAt: new Date().toISOString() };
    this.set('hf_drafts', drafts);
  },

  /**
   * Get resume draft
   * @param {string} resumeId
   * @returns {Object|null}
   */
  getDraft(resumeId) {
    const drafts = this.get('hf_drafts') || {};
    return drafts[resumeId] || null;
  },

  /**
   * Clear all auth data (logout)
   */
  clearAuth() {
    this.removeToken();
    this.removeUser();
  },
};
