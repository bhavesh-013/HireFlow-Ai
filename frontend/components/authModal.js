/**
 * ResumeAI — Auth Modal Component (Login & Sign Up)
 */

const AuthModal = {
  isOpen: false,
  mode: 'login', // 'login' or 'signup'

  render() {
    return `
      <div class="modal-backdrop ${this.isOpen ? 'open' : ''}" id="auth-modal-backdrop">
        <div class="modal-card">
          <div class="modal-header">
            <h3 class="modal-title" id="auth-modal-title">
              ${this.mode === 'login' ? 'Sign In to ResumeAI' : 'Create Free Account'}
            </h3>
            <span class="modal-close" id="btn-close-auth">&times;</span>
          </div>

          <form id="auth-form" onsubmit="return false;">
            ${this.mode === 'signup' ? `
              <div class="form-group">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control" placeholder="Alexandra Chen" required>
              </div>
            ` : ''}

            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-control" placeholder="alex@email.com" required>
            </div>

            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-control" placeholder="••••••••" required>
            </div>

            <button type="submit" class="btn btn-primary-glow" style="width: 100%; margin-top: 1rem;">
              ${this.mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div style="margin-top: 1.5rem; text-align: center; font-size: 0.85rem; color: var(--text-secondary);">
            ${this.mode === 'login' ? `
              Don't have an account? <a href="#" id="toggle-auth-mode" style="color: var(--accent-purple); font-weight: 600;">Sign Up Free</a>
            ` : `
              Already have an account? <a href="#" id="toggle-auth-mode" style="color: var(--accent-purple); font-weight: 600;">Sign In</a>
            `}
          </div>
        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('btn-close-auth')?.addEventListener('click', () => {
      this.close();
    });

    document.getElementById('toggle-auth-mode')?.addEventListener('click', (e) => {
      e.preventDefault();
      this.mode = this.mode === 'login' ? 'signup' : 'login';
      const root = document.getElementById('auth-modal-host');
      if (root) {
        root.innerHTML = this.render();
        this.bindEvents();
      }
    });

    document.getElementById('auth-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      Toast.show(this.mode === 'login' ? 'Successfully signed in!' : 'Account created successfully!', 'success');
      this.close();
    });
  },

  open(mode = 'login') {
    this.mode = mode;
    this.isOpen = true;
    const root = document.getElementById('auth-modal-host');
    if (root) {
      root.innerHTML = this.render();
      this.bindEvents();
    }
  },

  close() {
    this.isOpen = false;
    const root = document.getElementById('auth-modal-host');
    if (root) root.innerHTML = '';
  }
};
