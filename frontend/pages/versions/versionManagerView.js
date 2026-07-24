/**
 * ResumeAI — Resume Version Manager View (USP #10)
 * Maintain one Master Resume and create tailored company variants (Google, Amazon, Microsoft).
 */

const VersionManagerView = {
  activeVersion: 'google',

  render() {
    const state = Store.getState();
    const versions = state.versions;
    const current = versions[this.activeVersion];

    return `
      <div class="container" style="padding-top: 2.5rem; padding-bottom: 4rem;">
        
        <div class="section-header" style="text-align: left; margin-bottom: 2rem;">
          <div class="badge-ai">📝 USP #10: Version Branching</div>
          <h1 class="section-title">Resume Version Manager</h1>
          <p class="section-subtitle">Maintain one Master Resume and easily generate tailored versions for target companies.</p>
        </div>

        <!-- Version Selector Tabs -->
        <div class="tabs-nav">
          <button class="tab-btn ${this.activeVersion === 'google' ? 'active' : ''}" data-ver="google">
            <i class="fa-brands fa-google"></i> Google Resume (94% Match)
          </button>
          <button class="tab-btn ${this.activeVersion === 'amazon' ? 'active' : ''}" data-ver="amazon">
            <i class="fa-brands fa-amazon"></i> Amazon Resume (91% Match)
          </button>
          <button class="tab-btn ${this.activeVersion === 'microsoft' ? 'active' : ''}" data-ver="microsoft">
            <i class="fa-brands fa-microsoft"></i> Microsoft Resume (88% Match)
          </button>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-1 gap-8">
          
          <!-- Master Resume View (Left) -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-xl); padding: 1.75rem;">
            <div class="flex justify-between items-center" style="margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-primary);">
              <h3 style="font-size: 1.1rem; font-weight: 700;">🌐 Master Resume</h3>
              <span style="font-size: 0.75rem; color: var(--text-tertiary);">Primary Base Document</span>
            </div>

            <div style="font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
              <div style="font-weight: 700; color: #fff; margin-bottom: 0.4rem;">Master Summary:</div>
              <p style="background: rgba(0,0,0,0.2); padding: 0.85rem; border-radius: var(--radius-md); margin-bottom: 1rem;">
                ${state.resume.summary}
              </p>
            </div>
          </div>

          <!-- Tailored Version Diff View (Right) -->
          <div style="background: var(--bg-card); border: 1px solid var(--accent-purple); border-radius: var(--radius-xl); padding: 1.75rem; box-shadow: var(--shadow-glow-purple);">
            <div class="flex justify-between items-center" style="margin-bottom: 1rem; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-primary);">
              <h3 style="font-size: 1.1rem; font-weight: 700; color: var(--accent-purple);">${current.title}</h3>
              <span style="background: rgba(16, 185, 129, 0.15); color: #10b981; font-weight: 700; font-size: 0.78rem; padding: 0.25rem 0.6rem; border-radius: var(--radius-full);">
                Match: ${current.matchScore}%
              </span>
            </div>

            <div style="font-size: 0.85rem; line-height: 1.6;">
              <div style="font-weight: 700; color: var(--accent-gold); margin-bottom: 0.4rem;">AI Tailored Summary Diff:</div>
              <p style="background: rgba(139, 92, 246, 0.12); border: 1px solid rgba(139, 92, 246, 0.3); padding: 0.85rem; border-radius: var(--radius-md); color: #e2e8f0; margin-bottom: 1.25rem;">
                ${current.summary}
              </p>

              <div class="flex gap-2" style="margin-top: 1.5rem;">
                <button class="btn btn-primary-glow" id="btn-export-version-pdf" style="flex: 1; font-size: 0.85rem;">
                  <i class="fa-solid fa-download"></i> Export ${this.activeVersion.toUpperCase()} Version PDF
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    `;
  },

  bindEvents() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const ver = e.currentTarget.getAttribute('data-ver');
        this.activeVersion = ver;
        Store.notify();
      });
    });

    document.getElementById('btn-export-version-pdf')?.addEventListener('click', () => {
      window.print();
    });
  }
};
