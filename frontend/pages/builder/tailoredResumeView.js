/**
 * ResumeAI / HireFlow AI — Tailored Resume Subview
 */

const TailoredResumeView = {
  render() {
    return `
      <div>
        <!-- Page Header -->
        <div class="ws-page-header">
          <h1 class="ws-page-title">Tailored Resume Generator</h1>
          <p class="ws-page-sub">
            Customize and adapt your master resume for specific company job descriptions in seconds.
          </p>
        </div>

        <!-- 2-Column Split Layout -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.75rem; align-items: start;">
          
          <!-- Left Column: Resume Selection -->
          <div class="ws-card">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 1.25rem;">
              1. Select Base Resume
            </h3>

            <div style="margin-bottom: 1.25rem;">
              <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.4rem;">Select from Library</label>
              <select class="ws-input" id="tailor-resume-select">
                <option value="master">Master Resume (Senior Software Engineer)</option>
                <option value="google">Google Systems Resume Version</option>
                <option value="amazon">Amazon AWS Cloud Version</option>
              </select>
            </div>

            <div style="border: 2px dashed #cbd5e1; border-radius: 14px; padding: 2rem; text-align: center; background: #f8fafc;">
              <i class="fa-solid fa-cloud-arrow-up" style="font-size: 2rem; color: #94a3b8; margin-bottom: 0.75rem;"></i>
              <div style="font-size: 0.88rem; font-weight: 700; color: #0f172a;">Drag & drop new PDF/DOCX</div>
              <div style="font-size: 0.78rem; color: #64748b; margin-top: 0.25rem;">or click to upload from computer</div>
            </div>
          </div>

          <!-- Right Column: Target Job Description -->
          <div class="ws-card">
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 1.25rem;">
              2. Target Job Description
            </h3>

            <div style="margin-bottom: 1.25rem;">
              <textarea class="ws-textarea" id="tailor-jd-text" rows="6" placeholder="Paste target company JD requirements..."></textarea>
            </div>

            <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
              <button class="ws-btn-secondary" id="btn-tailor-upload-jd">
                <i class="fa-solid fa-upload"></i> Upload JD PDF
              </button>
              <button class="ws-btn-primary" id="btn-generate-tailored-resume">
                <i class="fa-solid fa-wand-magic-sparkles"></i> Generate Tailored Resume
              </button>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('btn-generate-tailored-resume')?.addEventListener('click', () => {
      Toast.show('Generating company-tailored resume with matching keywords...', 'info');
      setTimeout(() => {
        Toast.show('Tailored Resume Created! Redirecting to Editor...', 'success');
        Store.setWorkspaceView('build-editor');
      }, 1500);
    });
  }
};
