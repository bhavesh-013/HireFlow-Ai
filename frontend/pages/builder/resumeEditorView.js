/**
 * ResumeAI / HireFlow AI — Canva-like 3-Column Split Resume Editor
 */

const ResumeEditorView = {
  render() {
    const resume = Store.getState().resume || {};
    const personal = resume.personal || {};

    return `
      <div>
        <!-- Page Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
          <div>
            <h1 class="ws-page-title" style="font-size: 1.8rem; margin-bottom: 0.25rem;">Resume Editor</h1>
            <p class="ws-page-sub" style="font-size: 0.85rem;">
              Canva-like live editor. Changes sync automatically to live A4 document.
            </p>
          </div>

          <div style="display: flex; gap: 0.75rem;">
            <button class="ws-btn-secondary" id="btn-export-pdf-editor">
              <i class="fa-solid fa-download"></i> Export PDF
            </button>
            <button class="ws-btn-primary" id="btn-save-editor">
              <i class="fa-solid fa-floppy-disk"></i> Save Changes
            </button>
          </div>
        </div>

        <!-- 3-Column Split Editor Workspace -->
        <div style="display: grid; grid-template-columns: 280px 1fr 280px; gap: 1.5rem; align-items: start;">
          
          <!-- Left Column: Section Fields Nav & Form Inputs -->
          <div class="ws-card" style="padding: 1.25rem;">
            <h3 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; text-transform: uppercase; letter-spacing: 0.05em;">
              Resume Sections
            </h3>

            <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1.5rem;">
              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: #475569;">Full Name</label>
                <input type="text" class="ws-input" id="ed-fullname" value="${personal.fullName || ''}" style="padding: 0.5rem 0.75rem; font-size: 0.84rem;" />
              </div>

              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: #475569;">Title / Target Role</label>
                <input type="text" class="ws-input" id="ed-title" value="${personal.title || ''}" style="padding: 0.5rem 0.75rem; font-size: 0.84rem;" />
              </div>

              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: #475569;">Professional Summary</label>
                <textarea class="ws-textarea" id="ed-summary" rows="4" style="padding: 0.5rem 0.75rem; font-size: 0.82rem;">${resume.summary || ''}</textarea>
              </div>

              <div>
                <label style="font-size: 0.78rem; font-weight: 700; color: #475569;">Skills (comma separated)</label>
                <input type="text" class="ws-input" id="ed-skills" value="${(resume.skills || []).join(', ')}" style="padding: 0.5rem 0.75rem; font-size: 0.84rem;" />
              </div>
            </div>
          </div>

          <!-- Center Column: Live A4 Resume Preview Page -->
          <div style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 8px; padding: 2.5rem; box-shadow: 0 10px 25px rgba(15,23,42,0.08); min-height: 700px;" id="a4-resume-paper">
            
            <!-- Resume Header -->
            <div style="border-bottom: 2px solid #0f172a; padding-bottom: 1rem; margin-bottom: 1.5rem; text-align: center;">
              <h1 style="font-size: 2rem; font-weight: 900; color: #0f172a; margin: 0; letter-spacing: -0.02em;" id="prev-fullname">
                ${personal.fullName || 'Alexandra Chen'}
              </h1>
              <p style="font-size: 1rem; font-weight: 700; color: #3b82f6; margin: 0.25rem 0;" id="prev-title">
                ${personal.title || 'Senior Software Engineer'}
              </p>
              <div style="font-size: 0.8rem; color: #64748b; display: flex; justify-content: center; gap: 1rem; flex-wrap: wrap; margin-top: 0.5rem;">
                <span>${personal.email || 'alex@email.com'}</span> |
                <span>${personal.phone || '+1 (555) 234-5678'}</span> |
                <span>${personal.location || 'San Francisco, CA'}</span>
              </div>
            </div>

            <!-- Summary Section -->
            <div style="margin-bottom: 1.5rem;">
              <h3 style="font-size: 0.9rem; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; margin-bottom: 0.5rem;">
                PROFESSIONAL SUMMARY
              </h3>
              <p style="font-size: 0.85rem; color: #334155; line-height: 1.6; margin: 0;" id="prev-summary">
                ${resume.summary || 'Results-driven engineer with 6+ years building scalable distributed systems...'}
              </p>
            </div>

            <!-- Experience Section -->
            <div style="margin-bottom: 1.5rem;">
              <h3 style="font-size: 0.9rem; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; margin-bottom: 0.75rem;">
                EXPERIENCE
              </h3>
              
              ${(resume.experience || []).map(exp => `
                <div style="margin-bottom: 1rem;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.88rem; font-weight: 800; color: #0f172a;">
                    <span>${exp.company} — ${exp.role}</span>
                    <span style="color: #64748b; font-weight: 600;">${exp.period}</span>
                  </div>
                  <ul style="margin: 0.35rem 0 0 1.25rem; font-size: 0.82rem; color: #475569; line-height: 1.5;">
                    ${(exp.bullets || []).map(b => `<li>${b}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}
            </div>

            <!-- Skills Section -->
            <div>
              <h3 style="font-size: 0.9rem; font-weight: 800; text-transform: uppercase; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.25rem; margin-bottom: 0.5rem;">
                TECHNICAL SKILLS
              </h3>
              <p style="font-size: 0.85rem; color: #334155; margin: 0;" id="prev-skills">
                ${(resume.skills || []).join(', ')}
              </p>
            </div>

          </div>

          <!-- Right Column: AI Assistant Actions Toolbar -->
          <div class="ws-card" style="padding: 1.25rem;">
            <h3 style="font-size: 0.95rem; font-weight: 800; color: #0f172a; margin-bottom: 1rem; display: flex; align-items: center; gap: 0.5rem;">
              <i class="fa-solid fa-wand-magic-sparkles" style="color: #3b82f6;"></i>
              <span>AI Assistant</span>
            </h3>

            <p style="font-size: 0.78rem; color: #64748b; margin-bottom: 1.25rem;">
              Click an AI action to rewrite or optimize active summary & bullet points in real time.
            </p>

            <div style="display: flex; flex-direction: column; gap: 0.65rem;">
              <button class="ws-btn-secondary" style="justify-content: flex-start; padding: 0.65rem;" data-ai-act="Improve">
                <i class="fa-solid fa-sparkles" style="color: #8b5cf6;"></i> Improve Wording
              </button>

              <button class="ws-btn-secondary" style="justify-content: flex-start; padding: 0.65rem;" data-ai-act="Rewrite">
                <i class="fa-solid fa-arrows-rotate" style="color: #3b82f6;"></i> Rewrite for Impact
              </button>

              <button class="ws-btn-secondary" style="justify-content: flex-start; padding: 0.65rem;" data-ai-act="ATS Optimize">
                <i class="fa-solid fa-chart-line" style="color: #10b981;"></i> ATS Keyword Boost
              </button>

              <button class="ws-btn-secondary" style="justify-content: flex-start; padding: 0.65rem;" data-ai-act="Fix Grammar">
                <i class="fa-solid fa-spell-check" style="color: #f59e0b;"></i> Fix Grammar & Tone
              </button>

              <button class="ws-btn-secondary" style="justify-content: flex-start; padding: 0.65rem;" data-ai-act="Shorten">
                <i class="fa-solid fa-compress" style="color: #ec4899;"></i> Shorten Summary
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  bindEvents() {
    // Real time update listeners
    const updatePreview = () => {
      const fn = document.getElementById('ed-fullname')?.value;
      const title = document.getElementById('ed-title')?.value;
      const summary = document.getElementById('ed-summary')?.value;
      const skills = document.getElementById('ed-skills')?.value;

      if (document.getElementById('prev-fullname')) document.getElementById('prev-fullname').textContent = fn;
      if (document.getElementById('prev-title')) document.getElementById('prev-title').textContent = title;
      if (document.getElementById('prev-summary')) document.getElementById('prev-summary').textContent = summary;
      if (document.getElementById('prev-skills')) document.getElementById('prev-skills').textContent = skills;
    };

    ['ed-fullname', 'ed-title', 'ed-summary', 'ed-skills'].forEach(id => {
      document.getElementById(id)?.addEventListener('input', updatePreview);
    });

    // AI Actions
    document.querySelectorAll('[data-ai-act]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const act = btn.getAttribute('data-ai-act');
        const summaryInput = document.getElementById('ed-summary');
        if (!summaryInput) return;

        Toast.show(`Running AI "${act}" on summary...`, 'info');
        const updated = await AIService.optimizeSummary(summaryInput.value, act);
        summaryInput.value = updated;
        updatePreview();
        Toast.show(`AI ${act} applied!`, 'success');
      });
    });

    document.getElementById('btn-save-editor')?.addEventListener('click', () => {
      Toast.show('Resume changes saved!', 'success');
    });

    document.getElementById('btn-export-pdf-editor')?.addEventListener('click', () => {
      Toast.show('Generating high-res ATS PDF download...', 'info');
    });
  }
};
