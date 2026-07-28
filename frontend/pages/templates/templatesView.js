/**
 * ResumeAI / HireFlow AI — Resume Templates Subview
 */

const TemplatesView = {
  render() {
    const templates = [
      { id: 'ats', name: 'ATS Standard', tag: 'ATS Friendly', desc: 'Single column, high-density text layout optimized for 100% parsing accuracy.' },
      { id: 'modern', name: 'Modern Tech Lead', tag: 'Modern', desc: 'Clean typography with subtle color accents for senior developers.' },
      { id: 'minimal', name: 'Minimalist Clean', tag: 'Minimal', desc: 'Sleek whitespace layout ideal for designers and product engineers.' },
      { id: 'professional', name: 'Executive Suite', tag: 'Professional', desc: 'Classic layout suited for engineering managers and C-suite.' },
      { id: 'corporate', name: 'Corporate Enterprise', tag: 'Corporate', desc: 'Formal grid structure tailored for enterprise tech applicants.' },
      { id: 'academic', name: 'Academic Research', tag: 'Academic', desc: 'Publication & certification heavy structure.' }
    ];

    return `
      <div>
        <!-- Page Header -->
        <div class="ws-page-header">
          <h1 class="ws-page-title">Resume Templates</h1>
          <p class="ws-page-sub">
            Pick from ATS-tested templates built to pass company recruitment portals.
          </p>
        </div>

        <!-- Filter Pills -->
        <div class="ws-pill-tabs">
          <button class="ws-tab-btn active" data-tpl-filter="All">All</button>
          <button class="ws-tab-btn" data-tpl-filter="ATS Friendly">ATS Friendly</button>
          <button class="ws-tab-btn" data-tpl-filter="Modern">Modern</button>
          <button class="ws-tab-btn" data-tpl-filter="Minimal">Minimal</button>
          <button class="ws-tab-btn" data-tpl-filter="Professional">Professional</button>
          <button class="ws-tab-btn" data-tpl-filter="Corporate">Corporate</button>
          <button class="ws-tab-btn" data-tpl-filter="Academic">Academic</button>
        </div>

        <!-- Templates Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.75rem;">
          ${templates.map(tpl => `
            <div class="ws-card" style="display: flex; flex-direction: column; overflow: hidden; position: relative;">
              
              <!-- Preview Paper Placeholder Mock -->
              <div style="height: 220px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; margin: -1.75rem -1.75rem 1.25rem -1.75rem; padding: 1.5rem; display: flex; flex-direction: column; justify-content: center; align-items: center; position: relative;" class="tpl-preview-hover">
                <div style="width: 140px; height: 170px; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 4px; box-shadow: 0 4px 12px rgba(15,23,42,0.06); padding: 0.75rem;">
                  <div style="width: 60%; height: 6px; background: #0f172a; margin-bottom: 0.5rem;"></div>
                  <div style="width: 100%; height: 3px; background: #e2e8f0; margin-bottom: 0.25rem;"></div>
                  <div style="width: 90%; height: 3px; background: #e2e8f0; margin-bottom: 0.25rem;"></div>
                  <div style="width: 80%; height: 3px; background: #e2e8f0; margin-bottom: 0.75rem;"></div>
                  <div style="width: 40%; height: 4px; background: #3b82f6; margin-bottom: 0.35rem;"></div>
                  <div style="width: 100%; height: 3px; background: #e2e8f0; margin-bottom: 0.25rem;"></div>
                  <div style="width: 95%; height: 3px; background: #e2e8f0;"></div>
                </div>
              </div>

              <div style="flex: 1; display: flex; flex-direction: column;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                  <h3 style="font-size: 1.1rem; font-weight: 800; color: #0f172a; margin: 0;">${tpl.name}</h3>
                  <span style="font-size: 0.72rem; font-weight: 700; background: #f1f5f9; color: #334155; padding: 0.2rem 0.6rem; border-radius: 999px;">${tpl.tag}</span>
                </div>
                <p style="font-size: 0.82rem; color: #64748b; margin-bottom: 1.25rem; line-height: 1.5; flex: 1;">${tpl.desc}</p>
                
                <button class="ws-btn-primary" style="width: 100%;" data-use-template="${tpl.id}">
                  Use Template
                </button>
              </div>

            </div>
          `).join('')}
        </div>

      </div>
    `;
  },

  bindEvents() {
    document.querySelectorAll('[data-use-template]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-use-template');
        Store.setTemplate(id);
        Toast.show(`Selected template: ${id.toUpperCase()}. Opening Editor...`, 'success');
        Store.setWorkspaceView('build-editor');
      });
    });

    document.querySelectorAll('[data-tpl-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-tpl-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Toast.show(`Filtered by ${btn.getAttribute('data-tpl-filter')}`, 'info');
      });
    });
  }
};
