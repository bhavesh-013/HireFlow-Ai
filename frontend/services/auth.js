/**
 * HireFlow AI — Auth Service
 */

const AuthService = {
  /**
   * Register a new user
   * @param {Object} userData - { name, email, password, userType }
   * @returns {Promise<Object>}
   */
  async register(userData) {
    const data = await Api.post('/auth/register', userData);
    if (data.token) {
      Storage.setToken(data.token);
      Storage.setUser(data.user);
    }
    return data;
  },

  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise<Object>}
   */
  async login(credentials) {
    const data = await Api.post('/auth/login', credentials);
    if (data.token) {
      Storage.setToken(data.token);
      Storage.setUser(data.user);
    }
    return data;
  },

  /**
   * Get current user profile
   * @returns {Promise<Object>}
   */
  async getProfile() {
    const data = await Api.get('/auth/me');
    if (data.user) {
      Storage.setUser(data.user);
    }
    return data;
  },

  /**
   * Update user profile
   * @param {Object} updates
   * @returns {Promise<Object>}
   */
  async updateProfile(updates) {
    const data = await Api.put('/auth/profile', updates);
    if (data.user) {
      Storage.setUser(data.user);
    }
    return data;
  },

  /**
   * Logout user
   */
  logout() {
    Storage.clearAuth();
    window.location.href = ROUTES.LOGIN;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return Storage.isAuthenticated();
  },

  /**
   * Get current user data from storage
   * @returns {Object|null}
   */
  getCurrentUser() {
    return Storage.getUser();
  },

  /**
   * Redirect to dashboard if already authenticated
   */
  redirectIfAuthenticated() {
    if (this.isAuthenticated()) {
      window.location.href = ROUTES.DASHBOARD;
    }
  },

  /**
   * Redirect to login if not authenticated
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      window.location.href = ROUTES.LOGIN;
    }
  },
};
