/**
 * HireFlow AI — API Service
 * Fetch wrapper with JWT auth headers, error handling, and base URL config.
 */

const Api = {
  baseUrl: typeof API_BASE_URL !== 'undefined' ? API_BASE_URL : 'http://localhost:3000/api',

  /**
   * Make an HTTP request
   * @param {string} endpoint
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = Storage.getToken();

    const config = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
      ...options,
    };

    if (options.body && typeof options.body === 'object') {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          Storage.clearAuth();
          window.location.href = ROUTES.LOGIN;
          return;
        }
        throw { status: response.status, message: data.message || 'Request failed', data };
      }

      return data;
    } catch (error) {
      if (error.status) throw error;
      throw { status: 0, message: ERROR_MESSAGES.NETWORK_ERROR, data: null };
    }
  },

  /**
   * GET request
   * @param {string} endpoint
   * @returns {Promise<Object>}
   */
  get(endpoint) {
    return this.request(endpoint);
  },

  /**
   * POST request
   * @param {string} endpoint
   * @param {Object} body
   * @returns {Promise<Object>}
   */
  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body });
  },

  /**
   * PUT request
   * @param {string} endpoint
   * @param {Object} body
   * @returns {Promise<Object>}
   */
  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body });
  },

  /**
   * DELETE request
   * @param {string} endpoint
   * @returns {Promise<Object>}
   */
  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  /**
   * Upload a file via multipart form data
   * @param {string} endpoint
   * @param {FormData} formData
   * @returns {Promise<Object>}
   */
  async upload(endpoint, formData) {
    const url = `${this.baseUrl}${endpoint}`;
    const token = Storage.getToken();

    const response = await fetch(url, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw { status: response.status, message: data.message || 'Upload failed', data };
    }

    return data;
  },
};
