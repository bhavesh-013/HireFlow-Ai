/**
 * ResumeAI / HireFlow AI — JD Match Subview
 * Exact match to Reference Screenshot 1
 */

const JdMatchView = {
  render() {
    return `
      <div>
        <!-- Page Header -->
        <div class="ws-page-header">
          <h1 class="ws-page-title">JD Match</h1>
          <p class="ws-page-sub">
            Compare your resume with any job description. See what matches, what's missing, and get a score projection after improvements.
          </p>
        </div>

        <!-- Main Job Description Input Card -->
        <div class="ws-card" style="margin-bottom: 2rem;">
          <h2 style="font-size: 1.15rem; font-weight: 700; color: #0f172a; margin-bottom: 1.25rem;">
            Job Description
          </h2>

          <div style="margin-bottom: 1.5rem;">
            <textarea class="ws-textarea" id="jd-match-textarea" rows="7" placeholder="Paste job description requirements, tech stack, or qualification details...">Staff Product Engineer — React, TypeScript, Node, GraphQL, Postgres. Ship customer-facing surfaces, own perf and accessibility. Prior startup exp preferred.</textarea>
          </div>

          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="ws-btn-secondary" id="btn-upload-jd-pdf">
              <i class="fa-solid fa-arrow-up-from-bracket"></i>
              <span>Upload JD PDF</span>
            </button>
            <button class="ws-btn-primary" id="btn-analyze-jd-match">
              <i class="fa-solid fa-crop-simple"></i>
              <span>Analyze Match</span>
            </button>
          </div>
        </div>

        <!-- Dynamic Scan Results (Appears on click or pre-rendered) -->
        <div class="ws-card" id="jd-match-results-panel" style="display: none;">
          <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between;">
            <span>Match Diagnostics Report</span>
            <span style="font-size: 0.82rem; font-weight: 600; padding: 0.25rem 0.75rem; background: #ecfdf5; color: #059669; border-radius: 999px;">
              Predicted Score: 89%
            </span>
          </h3>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.25rem; margin-bottom: 1.5rem;">
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 14px;">
              <div style="font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Interview Chance</div>
              <div style="font-size: 1.8rem; font-weight: 800; color: #0f172a; margin-top: 0.25rem;">84%</div>
              <p style="font-size: 0.78rem; color: #10b981; margin-top: 0.25rem;">High response likelihood</p>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 14px;">
              <div style="font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Missing Keywords</div>
              <div style="font-size: 1.1rem; font-weight: 700; color: #ef4444; margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                <span style="background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.78rem;">GraphQL</span>
                <span style="background: #fef2f2; color: #ef4444; border: 1px solid #fecaca; padding: 0.2rem 0.6rem; border-radius: 6px; font-size: 0.78rem;">Postgres</span>
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 1.25rem; border-radius: 14px;">
              <div style="font-size: 0.78rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Experience Gap</div>
              <div style="font-size: 0.88rem; font-weight: 600; color: #334155; margin-top: 0.5rem;">
                None detected (6+ years meets requirement)
              </div>
            </div>
          </div>

          <div style="background: #fffbeb; border: 1px solid #fef3c7; border-radius: 12px; padding: 0.85rem 1.1rem; font-size: 0.82rem; color: #92400e;">
            <i class="fa-solid fa-circle-info"></i> <strong>Important:</strong> This is an AI estimate and not a guarantee.
          </div>
        </div>

      </div>
    `;
  },

  bindEvents() {
    document.getElementById('btn-analyze-jd-match')?.addEventListener('click', () => {
      const text = document.getElementById('jd-match-textarea')?.value;
      if (!text) {
        Toast.show('Please enter or upload a job description text', 'warning');
        return;
      }
      Toast.show('Analyzing job description match...', 'info');
      const resultsPanel = document.getElementById('jd-match-results-panel');
      if (resultsPanel) {
        resultsPanel.style.display = 'block';
        resultsPanel.scrollIntoView({ behavior: 'smooth' });
      }
    });

    document.getElementById('btn-upload-jd-pdf')?.addEventListener('click', () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.pdf,.txt,.docx';
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          Toast.show(`Uploaded ${file.name} successfully`, 'success');
        }
      };
      fileInput.click();
    });
  }
};
