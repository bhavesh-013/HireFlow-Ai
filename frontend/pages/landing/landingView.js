/**
 * ResumeAI / HireFlow AI — Landing View Component
 * Renders the landing page content and binds CTA buttons to open the Workspace.
 */

const LandingView = {
  render() {
    return `
      <div class="wrap">
        <header class="top-header" style="padding-top: 2rem;">
          <div class="top-header-row" style="display: flex; justify-content: space-between; align-items: flex-end;">
            <div>
              <h1 class="wordmark fade-up d1" style="font-size: 2.5rem; font-weight: 900; letter-spacing: -0.03em; margin: 0; color: var(--text-primary, #ffffff);">HIREFLOW AI</h1>
              <p class="tagline fade-up d2" style="color: var(--accent-blue, #3b82f6); font-weight: 700; margin-top: 0.25rem;">Your AI Career Workspace</p>
            </div>
            <div class="top-meta fade-up d3" style="text-align: right; font-size: 0.8rem; color: var(--text-secondary, #94a3b8); line-height: 1.5;">
              RESUME · ATS · INTERVIEW<br>
              BUILT FOR STUDENTS &amp; PROFESSIONALS<br>
              HELLO@HIREFLOW.AI
            </div>
          </div>
        </header>

        <div class="divider-line div-delay-1" style="height: 1px; background: rgba(255,255,255,0.1); margin: 1.5rem 0;"></div>

        <nav class="nav-row nav-slide-in" style="display: flex; gap: 1rem; align-items: center; font-weight: 600; font-size: 0.9rem;">
          <a href="#" data-nav-btn="landing">Home</a><span class="nav-sep">/</span>
          <a href="#" data-ws-btn="build-templates">Templates</a><span class="nav-sep">/</span>
          <a href="#" data-ws-btn="assistant">AI Assistant</a><span class="nav-sep">/</span>
          <a href="#" id="landing-btn-workspace" style="color: #3b82f6;">Open AI Workspace ↗</a>
        </nav>

        <div class="divider-line div-delay-2" style="height: 1px; background: rgba(255,255,255,0.1); margin: 1.5rem 0;"></div>

        <main style="padding-bottom: 4rem;">
          <!-- 01 PROFILE / HERO -->
          <section id="profile" style="margin-bottom: 4rem;">
            <div class="section-heading-row" style="margin-bottom: 2rem;">
              <span class="section-num reveal-kicker" style="color: #3b82f6; font-weight: 800;">01</span>
              <h2 class="section-title reveal-heading" style="font-size: 2rem; font-weight: 800; display: inline-block; margin-left: 0.5rem;">PROFILE & WORKSPACE</h2>
            </div>

            <div class="profile-grid" style="display: grid; grid-template-columns: 1.2fr 1fr; gap: 2.5rem; align-items: center;">
              <div class="profile-copy reveal">
                <p style="font-size: 1.1rem; line-height: 1.7; color: var(--text-secondary, #cbd5e1); margin-bottom: 2rem;">
                  HireFlow AI helps you create resumes, analyse ATS scores, tailor documents for specific jobs and prepare for interviews — all inside one calm, focused workspace. No scattered tools, no guesswork: write, score, refine and export from the same place.
                </p>
                <div class="profile-actions" style="display: flex; gap: 1rem; flex-wrap: wrap;">
                  <button class="btn btn-primary" id="btn-landing-build" style="background: #3b82f6; color: #fff; border: none; border-radius: 12px; padding: 0.85rem 1.75rem; font-weight: 700; cursor: pointer;">
                    Build Resume ↗
                  </button>
                  <button class="btn btn-secondary" id="btn-landing-ats" style="background: transparent; color: #fff; border: 1px solid rgba(255,255,255,0.2); border-radius: 12px; padding: 0.85rem 1.75rem; font-weight: 700; cursor: pointer;">
                    Analyse ATS Score
                  </button>
                </div>
              </div>

              <!-- Quick Actions Grid -->
              <div class="quick-actions-col reveal" style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.75rem;">
                <span class="quick-actions-label" style="font-size: 0.78rem; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; display: block; margin-bottom: 1.25rem;">Quick Actions</span>
                <div class="quick-actions" style="display: flex; flex-direction: column; gap: 1rem;">
                  
                  <div class="quick-action-card" data-ws-btn="build-editor" style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 14px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                      <i class="fa-solid fa-pen-to-square" style="color: #3b82f6; font-size: 1.2rem;"></i>
                      <div>
                        <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700;">Build Resume</h4>
                        <p style="margin: 0; font-size: 0.78rem; color: #94a3b8;">Start a new draft with AI.</p>
                      </div>
                    </div>
                    <span style="font-size: 1.1rem; color: #3b82f6;">↗</span>
                  </div>

                  <div class="quick-action-card" data-ws-btn="analysis-ats" style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 14px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                      <i class="fa-solid fa-chart-column" style="color: #10b981; font-size: 1.2rem;"></i>
                      <div>
                        <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700;">Analyse Resume</h4>
                        <p style="margin: 0; font-size: 0.78rem; color: #94a3b8;">Run an ATS report.</p>
                      </div>
                    </div>
                    <span style="font-size: 1.1rem; color: #10b981;">↗</span>
                  </div>

                  <div class="quick-action-card" data-ws-btn="assistant" style="display: flex; align-items: center; justify-content: space-between; background: rgba(255,255,255,0.05); padding: 1rem; border-radius: 14px; cursor: pointer; border: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 1rem;">
                      <i class="fa-solid fa-robot" style="color: #8b5cf6; font-size: 1.2rem;"></i>
                      <div>
                        <h4 style="margin: 0; font-size: 0.95rem; font-weight: 700;">AI Assistant</h4>
                        <p style="margin: 0; font-size: 0.78rem; color: #94a3b8;">Ask your career coach.</p>
                      </div>
                    </div>
                    <span style="font-size: 1.1rem; color: #8b5cf6;">↗</span>
                  </div>

                </div>
              </div>
            </div>
          </section>

          <!-- 02 FEATURES PREVIEW -->
          <section id="features" style="margin-top: 4rem;">
            <div class="section-heading-row" style="margin-bottom: 2rem;">
              <span class="section-num reveal-kicker" style="color: #3b82f6; font-weight: 800;">02</span>
              <h2 class="section-title reveal-heading" style="font-size: 2rem; font-weight: 800; display: inline-block; margin-left: 0.5rem;">AI FEATURES & CAPABILITIES</h2>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1.75rem;">
              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 1.75rem;">
                <i class="fa-solid fa-expand" style="font-size: 1.8rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.5rem;">JD Match Scan</h3>
                <p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.6;">Compare your resume with target job descriptions to identify missing skills and project match score projections.</p>
              </div>

              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 1.75rem;">
                <i class="fa-regular fa-lightbulb" style="font-size: 1.8rem; color: #f59e0b; margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.5rem;">One-Click AI Suggestions</h3>
                <p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.6;">Get actionable suggestions for skills, projects, certificates, and achievements that apply with a single click.</p>
              </div>

              <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 1.75rem;">
                <i class="fa-solid fa-chart-column" style="font-size: 1.8rem; color: #10b981; margin-bottom: 1rem;"></i>
                <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 0.5rem;">Detailed ATS Analysis</h3>
                <p style="font-size: 0.88rem; color: #94a3b8; line-height: 1.6;">Section scores for Formatting, Readability, Keywords, Skills, and Achievements with density distribution.</p>
              </div>
            </div>
          </section>

        </main>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('landing-btn-workspace')?.addEventListener('click', (e) => {
      e.preventDefault();
      Store.setWorkspaceView('dashboard');
    });

    document.getElementById('btn-landing-build')?.addEventListener('click', () => {
      Store.setWorkspaceView('build-editor');
    });

    document.getElementById('btn-landing-ats')?.addEventListener('click', () => {
      Store.setWorkspaceView('analysis-ats');
    });

    document.querySelectorAll('[data-ws-btn]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        const target = el.getAttribute('data-ws-btn');
        Store.setWorkspaceView(target);
      });
    });
  }
};
