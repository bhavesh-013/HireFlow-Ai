/**
 * ResumeAI — Main Application Controller & SPA Router
 * Initializes reactive state, navigation handlers, theme toggle, and view rendering.
 */

// Toast Notifications Helper
const Toast = {
  show(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'warning') icon = 'fa-triangle-exclamation';

    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Main App Controller
const App = {
  init() {
    console.log('🚀 Initializing ResumeAI Frontend Application...');

    // Restore saved theme
    const theme = Store.getState().theme;
    document.documentElement.setAttribute('data-theme', theme);

    // Render Initial View
    this.renderView(Store.getState().activeView);

    // Render Fixed Components
    this.renderCoachDrawer();

    // Subscribe to State Changes
    Store.subscribe((state) => {
      this.renderView(state.activeView);
    });

    // Global Event Listeners
    this.bindGlobalEvents();
  },

  renderView(viewName) {
    const root = document.getElementById('app-root');
    if (!root) return;

    // Highlight Active Nav Link
    document.querySelectorAll('.nav-link').forEach(link => {
      const target = link.getAttribute('data-nav');
      if (target === viewName || (viewName === 'landing' && target === 'landing')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // View Routing Switcher
    switch (viewName) {
      case 'landing':
        root.innerHTML = LandingView.render() + this.renderFooter();
        LandingView.bindEvents();
        break;

      case 'builder':
        root.innerHTML = BuilderView.render();
        BuilderView.bindEvents();
        break;

      case 'conversational':
        root.innerHTML = ConversationalBuilderView.render();
        ConversationalBuilderView.bindEvents();
        break;

      case 'analyzer':
        root.innerHTML = AtsAnalyzerView.render();
        AtsAnalyzerView.bindEvents();
        break;

      case 'github':
        root.innerHTML = GithubImportView.render();
        GithubImportView.bindEvents();
        break;

      case 'projects':
        root.innerHTML = ProjectLibraryView.render();
        ProjectLibraryView.bindEvents();
        break;

      case 'versions':
        root.innerHTML = VersionManagerView.render();
        VersionManagerView.bindEvents();
        break;

      default:
        root.innerHTML = LandingView.render() + this.renderFooter();
        LandingView.bindEvents();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  renderCoachDrawer() {
    const host = document.getElementById('coach-drawer-host');
    if (host) {
      host.innerHTML = CareerCoachDrawer.render();
      CareerCoachDrawer.bindEvents();
    }
  },

  renderFooter() {
    return `
      <footer class="footer">
        <div class="container">
          <div class="footer-grid">
            
            <div class="footer-col">
              <div class="brand-logo" style="margin-bottom: 1rem;">
                <div class="brand-icon"><i class="fa-solid fa-sparkles"></i></div>
                <span>Resume<span style="color: var(--accent-purple);">AI</span></span>
              </div>
              <p style="max-width: 320px; line-height: 1.6; margin-bottom: 1.5rem;">
                Empowering job seekers worldwide with AI-driven resume optimization, ATS matching, and GitHub project integration.
              </p>
            </div>

            <div class="footer-col">
              <h4>Product</h4>
              <ul class="footer-links">
                <li><a href="#" data-nav="builder" class="footer-nav-link">AI Resume Builder</a></li>
                <li><a href="#" data-nav="conversational" class="footer-nav-link">Conversational AI Chat</a></li>
                <li><a href="#" data-nav="analyzer" class="footer-nav-link">ATS & JD Analyzer</a></li>
                <li><a href="#" data-nav="github" class="footer-nav-link">Smart GitHub Import</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Features</h4>
              <ul class="footer-links">
                <li><a href="#" data-nav="projects" class="footer-nav-link">Project Recommendation</a></li>
                <li><a href="#" data-nav="versions" class="footer-nav-link">Version Manager</a></li>
                <li><a href="#" data-nav="templates" class="footer-nav-link">ATS Templates</a></li>
                <li><a href="#" data-nav="pricing" class="footer-nav-link">Pricing Plans</a></li>
              </ul>
            </div>

            <div class="footer-col">
              <h4>Connect</h4>
              <ul class="footer-links">
                <li><a href="https://github.com" target="_blank"><i class="fa-brands fa-github"></i> GitHub</a></li>
                <li><a href="https://linkedin.com" target="_blank"><i class="fa-brands fa-linkedin"></i> LinkedIn</a></li>
                <li><a href="https://twitter.com" target="_blank"><i class="fa-brands fa-x-twitter"></i> Twitter</a></li>
              </ul>
            </div>

          </div>

          <div class="footer-bottom">
            <div>© 2026 ResumeAI. All rights reserved. Designed with modern web standards.</div>
            <div style="display: flex; gap: 1.5rem;">
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    `;
  },

  bindGlobalEvents() {
    // Nav Brand Logo click
    document.getElementById('nav-brand-logo')?.addEventListener('click', (e) => {
      e.preventDefault();
      Store.setView('landing');
    });

    // Banner close button
    document.getElementById('btn-close-banner')?.addEventListener('click', () => {
      const banner = document.getElementById('top-preview-banner');
      if (banner) banner.style.display = 'none';
    });

    // Theme Switch Pill click
    document.getElementById('theme-toggle-switch')?.addEventListener('click', () => {
      const current = Store.getState().theme;
      const nextTheme = current === 'dark' ? 'light' : 'dark';
      Store.setTheme(nextTheme);
      Toast.show(`Switched to ${nextTheme.toUpperCase()} theme`, 'info');
    });

    // Header Nav links
    document.querySelectorAll('.nav-link, .footer-nav-link').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const target = link.getAttribute('data-nav');
        if (target === 'features' || target === 'templates' || target === 'pricing') {
          if (Store.getState().activeView !== 'landing') {
            Store.setView('landing');
            setTimeout(() => {
              document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          } else {
            document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' });
          }
        } else {
          Store.setView(target);
        }
      });
    });

    // Auth Buttons
    document.getElementById('btn-nav-signin')?.addEventListener('click', () => {
      AuthModal.open('login');
    });

    document.getElementById('btn-nav-getstarted')?.addEventListener('click', () => {
      Store.setView('builder');
    });
  }
};

// Start application on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
