/**
 * ResumeAI / HireFlow AI — Workspace Shell Component
 * Provides the dark navy sidebar, top header navbar with search, profile badge,
 * and bottom floating toolbar pill exact to reference screenshots.
 */

const WorkspaceLayout = {
  render(activeSubView, contentHtml) {
    const isBuildActive = ['build-editor', 'build-tailored', 'build-templates'].includes(activeSubView);
    const isAnalysisActive = ['analysis-ats', 'analysis-suggestions', 'analysis-jd'].includes(activeSubView);

    return `
      <div class="app-workspace-layout" id="workspace-layout-root">
        
        <!-- Left Dark Navy Sidebar (Exact to screenshots) -->
        <aside class="ws-sidebar" id="ws-sidebar-drawer">
          
          <!-- Sidebar Brand -->
          <div class="ws-sidebar-brand" id="ws-brand-click" style="cursor: pointer;">
            <div class="ws-brand-avatar">R</div>
            <div class="ws-brand-info">
              <h2>HireFlow AI</h2>
              <p>AI Career Workspace</p>
            </div>
          </div>

          <!-- Sidebar Navigation Menu -->
          <nav class="ws-sidebar-nav">
            
            <!-- 1. Dashboard -->
            <a href="#" class="ws-nav-item ${activeSubView === 'dashboard' ? 'active' : ''}" data-ws-nav="dashboard">
              <i class="fa-solid fa-table-cells-large ws-icon"></i>
              <span>Dashboard</span>
            </a>

            <!-- 2. Build with AI (Accordion) -->
            <div class="ws-nav-group ${isBuildActive ? 'expanded' : ''}" id="ws-group-build">
              <div class="ws-nav-item ws-nav-accordion-header ${isBuildActive ? 'active' : ''}" data-ws-toggle="group-build">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                  <i class="fa-solid fa-wand-magic-sparkles ws-icon"></i>
                  <span>Build with AI</span>
                </div>
                <i class="fa-solid fa-chevron-down ws-chevron"></i>
              </div>
              <div class="ws-nav-subitems">
                <a href="#" class="ws-nav-subitem ${activeSubView === 'build-editor' ? 'active' : ''}" data-ws-nav="build-editor">
                  <i class="fa-regular fa-file-lines"></i>
                  <span>Editor</span>
                </a>
                <a href="#" class="ws-nav-subitem ${activeSubView === 'build-tailored' ? 'active' : ''}" data-ws-nav="build-tailored">
                  <i class="fa-solid fa-bullseye"></i>
                  <span>Tailored Resume</span>
                </a>
                <a href="#" class="ws-nav-subitem ${activeSubView === 'build-templates' ? 'active' : ''}" data-ws-nav="build-templates">
                  <i class="fa-solid fa-border-all"></i>
                  <span>Templates</span>
                </a>
              </div>
            </div>

            <!-- 3. Analysis (Accordion) -->
            <div class="ws-nav-group ${isAnalysisActive ? 'expanded' : ''}" id="ws-group-analysis">
              <div class="ws-nav-item ws-nav-accordion-header ${isAnalysisActive ? 'active' : ''}" data-ws-toggle="group-analysis">
                <div style="display: flex; align-items: center; gap: 0.85rem;">
                  <i class="fa-solid fa-chart-line ws-icon"></i>
                  <span>Analysis</span>
                </div>
                <i class="fa-solid fa-chevron-down ws-chevron"></i>
              </div>
              <div class="ws-nav-subitems">
                <a href="#" class="ws-nav-subitem ${activeSubView === 'analysis-ats' ? 'active' : ''}" data-ws-nav="analysis-ats">
                  <i class="fa-solid fa-chart-column"></i>
                  <span>ATS Analysis</span>
                </a>
                <a href="#" class="ws-nav-subitem ${activeSubView === 'analysis-suggestions' ? 'active' : ''}" data-ws-nav="analysis-suggestions">
                  <i class="fa-regular fa-lightbulb"></i>
                  <span>AI Suggestions</span>
                </a>
                <a href="#" class="ws-nav-subitem ${activeSubView === 'analysis-jd' ? 'active' : ''}" data-ws-nav="analysis-jd">
                  <i class="fa-solid fa-expand"></i>
                  <span>JD Match</span>
                </a>
              </div>
            </div>

            <!-- 4. AI Assistant -->
            <a href="#" class="ws-nav-item ${activeSubView === 'assistant' ? 'active' : ''}" data-ws-nav="assistant">
              <i class="fa-solid fa-robot ws-icon"></i>
              <span>AI Assistant</span>
            </a>

            <!-- 5. Profile & Settings -->
            <a href="#" class="ws-nav-item ${activeSubView === 'profile' ? 'active' : ''}" data-ws-nav="profile">
              <i class="fa-regular fa-user ws-icon"></i>
              <span>Profile & Settings</span>
            </a>

          </nav>

          <!-- Sidebar Footer Profile Card (Exact to screenshots) -->
          <div class="ws-sidebar-footer">
            <div class="ws-user-badge" id="ws-profile-footer-btn" data-ws-nav="profile">
              <div class="ws-user-avatar">AK</div>
              <div class="ws-user-details">
                <span class="ws-user-name">Alex Kumar</span>
                <span class="ws-user-sub">View Profile & Settings</span>
              </div>
            </div>
            <button class="ws-btn-logout" id="ws-btn-logout" title="Exit Workspace">
              <i class="fa-solid fa-arrow-right-from-bracket"></i>
            </button>
          </div>

        </aside>

        <!-- Main View Area + Top Bar -->
        <div class="ws-main-wrapper">
          
          <!-- Top Header Navbar (Exact to screenshots) -->
          <header class="ws-topbar">
            
            <div class="ws-topbar-left">
              <button class="ws-hamburger-btn" id="ws-btn-hamburger">
                <i class="fa-solid fa-bars"></i>
              </button>
              <div class="ws-search-box">
                <i class="fa-solid fa-magnifying-glass"></i>
                <input type="text" id="ws-global-search" placeholder="Search resumes, jobs, suggestions..." />
              </div>
            </div>

            <div class="ws-topbar-right">
              <!-- Landing Page Toggle Button -->
              <button class="ws-btn-landing" id="ws-btn-to-landing">
                <i class="fa-solid fa-house"></i>
                <span>Landing Page</span>
              </button>

              <!-- Notification Bell -->
              <button class="ws-topbar-icon-btn" id="ws-btn-notifications" title="Notifications">
                <i class="fa-regular fa-bell"></i>
                <span class="badge-dot"></span>
              </button>

              <!-- User Profile Header Badge -->
              <div class="ws-topbar-profile" id="ws-profile-header-btn" data-ws-nav="profile">
                <div class="ws-topbar-avatar">AK</div>
                <div class="ws-topbar-userinfo">
                  <span class="ws-topbar-username">Alex Kumar</span>
                  <span class="ws-topbar-userrole">Pro Member</span>
                </div>
              </div>
            </div>

          </header>

          <!-- Dynamic Workspace Subview Container -->
          <main class="ws-content-container">
            ${contentHtml}
          </main>

          <!-- Bottom Floating Action Bar Pill (Matching screenshots 1, 2, 3, 5) -->
          <div class="ws-floating-toolbar">
            <button class="ws-floating-btn" title="Expand Canvas" id="ws-float-expand"><i class="fa-solid fa-expand"></i></button>
            <button class="ws-floating-btn" title="Typography" id="ws-float-type"><i class="fa-solid fa-font"></i></button>
            <button class="ws-floating-btn" title="Edit Quick Note" id="ws-float-edit"><i class="fa-regular fa-pen-to-square"></i></button>
            <button class="ws-floating-btn" title="AI Feedback" id="ws-float-comment"><i class="fa-regular fa-comment"></i></button>
          </div>

        </div>

      </div>
    `;
  },

  bindEvents() {
    // Sidebar brand click -> navigate to dashboard
    document.getElementById('ws-brand-click')?.addEventListener('click', () => {
      Store.setWorkspaceView('dashboard');
    });

    // Navigation links
    document.querySelectorAll('[data-ws-nav]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-ws-nav');
        Store.setWorkspaceView(target);
        // On mobile close sidebar drawer
        document.getElementById('ws-sidebar-drawer')?.classList.remove('open');
      });
    });

    // Accordion headers
    document.querySelectorAll('[data-ws-toggle]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const groupKey = el.getAttribute('data-ws-toggle');
        const groupEl = document.getElementById(`ws-${groupKey}`);
        groupEl?.classList.toggle('expanded');
      });
    });

    // Hamburger button
    document.getElementById('ws-btn-hamburger')?.addEventListener('click', () => {
      document.getElementById('ws-sidebar-drawer')?.classList.toggle('open');
    });

    // Return to Landing Page
    document.getElementById('ws-btn-to-landing')?.addEventListener('click', () => {
      Store.setView('landing');
    });

    // Exit Workspace
    document.getElementById('ws-btn-logout')?.addEventListener('click', () => {
      Toast.show('Exited AI Workspace', 'info');
      Store.setView('landing');
    });

    // Global Search Bar input action
    document.getElementById('ws-global-search')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = e.target.value;
        Toast.show(`Searching workspace for "${query}"...`, 'info');
      }
    });

    // Floating toolbar quick actions
    document.getElementById('ws-float-expand')?.addEventListener('click', () => {
      Toast.show('Canvas view expanded', 'info');
    });

    document.getElementById('ws-float-type')?.addEventListener('click', () => {
      Toast.show('Font & Layout settings opened', 'info');
    });

    document.getElementById('ws-float-edit')?.addEventListener('click', () => {
      Toast.show('Quick Editor mode toggled', 'info');
    });

    document.getElementById('ws-float-comment')?.addEventListener('click', () => {
      Store.setWorkspaceView('assistant');
    });
  }
};
