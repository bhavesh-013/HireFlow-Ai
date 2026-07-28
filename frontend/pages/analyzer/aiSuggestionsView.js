/**
 * ResumeAI / HireFlow AI — AI Suggestions Subview
 * Exact match to Reference Screenshot 5
 */

const AiSuggestionsView = {
  render() {
    return `
      <div>
        <!-- Page Header -->
        <div class="ws-page-header">
          <h1 class="ws-page-title">AI Suggestions</h1>
          <p class="ws-page-sub">
            Every suggestion explains why it matters, its impact, and applies with one click.
          </p>
        </div>

        <!-- Filter Pill Tabs (Exact to Image 5) -->
        <div class="ws-pill-tabs">
          <button class="ws-tab-btn active" data-sug-tab="skills">Skills</button>
          <button class="ws-tab-btn" data-sug-tab="projects">Projects</button>
          <button class="ws-tab-btn" data-sug-tab="certificates">Certificates</button>
          <button class="ws-tab-btn" data-sug-tab="achievements">Achievements</button>
          <button class="ws-tab-btn" data-sug-tab="summary">Summary</button>
          <button class="ws-tab-btn" data-sug-tab="experience">Experience</button>
        </div>

        <!-- Suggestions Cards Stack (Exact to Image 5) -->
        <div id="suggestions-stack">
          
          <!-- Suggestion Card 1: Add TypeScript -->
          <div class="ws-suggestion-card" id="sug-card-ts">
            <div class="ws-suggestion-info">
              <div class="ws-suggestion-title">
                <i class="fa-solid fa-wand-magic-sparkles" style="color: #0284c7; font-size: 0.9rem;"></i>
                <span>Add TypeScript</span>
              </div>
              <div class="ws-suggestion-why">
                <strong>Why:</strong> Required in 78% of matched JDs.
              </div>
              <div class="ws-suggestion-impact">
                <i class="fa-solid fa-chart-line"></i>
                <span>Impact: +8% match</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button class="ws-btn-secondary" style="padding: 0.55rem 1.1rem;" data-btn-preview="Add TypeScript">
                Preview
              </button>
              <button class="ws-btn-primary" style="padding: 0.55rem 1.1rem; border-radius: 10px;" data-btn-apply="Add TypeScript">
                Apply
              </button>
            </div>
          </div>

          <!-- Suggestion Card 2: Add Playwright -->
          <div class="ws-suggestion-card" id="sug-card-pw">
            <div class="ws-suggestion-info">
              <div class="ws-suggestion-title">
                <i class="fa-solid fa-wand-magic-sparkles" style="color: #0284c7; font-size: 0.9rem;"></i>
                <span>Add Playwright</span>
              </div>
              <div class="ws-suggestion-why">
                <strong>Why:</strong> Testing skill missing; appears in 6/10 JDs.
              </div>
              <div class="ws-suggestion-impact">
                <i class="fa-solid fa-chart-line"></i>
                <span>Impact: +5% ATS</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button class="ws-btn-secondary" style="padding: 0.55rem 1.1rem;" data-btn-preview="Add Playwright">
                Preview
              </button>
              <button class="ws-btn-primary" style="padding: 0.55rem 1.1rem; border-radius: 10px;" data-btn-apply="Add Playwright">
                Apply
              </button>
            </div>
          </div>

          <!-- Suggestion Card 3: Group cloud skills -->
          <div class="ws-suggestion-card" id="sug-card-cloud">
            <div class="ws-suggestion-info">
              <div class="ws-suggestion-title">
                <i class="fa-solid fa-wand-magic-sparkles" style="color: #0284c7; font-size: 0.9rem;"></i>
                <span>Group cloud skills</span>
              </div>
              <div class="ws-suggestion-why">
                <strong>Why:</strong> AWS, GCP, Vercel are scattered.
              </div>
              <div class="ws-suggestion-impact">
                <i class="fa-solid fa-chart-line"></i>
                <span>Impact: Better parsing</span>
              </div>
            </div>

            <div style="display: flex; gap: 0.75rem;">
              <button class="ws-btn-secondary" style="padding: 0.55rem 1.1rem;" data-btn-preview="Group cloud skills">
                Preview
              </button>
            </div>
          </div>

        </div>

      </div>
    `;
  },

  bindEvents() {
    // Tab switching
    document.querySelectorAll('[data-sug-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('[data-sug-tab]').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        Toast.show(`Filtered suggestions by ${tab.textContent}`, 'info');
      });
    });

    // Apply actions
    document.querySelectorAll('[data-btn-apply]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.getAttribute('data-btn-apply');
        Store.addSkill(item.replace('Add ', ''));
        Toast.show(`Applied "${item}" to your resume skills!`, 'success');
        btn.textContent = 'Applied';
        btn.disabled = true;
        btn.style.opacity = '0.7';
      });
    });

    // Preview actions
    document.querySelectorAll('[data-btn-preview]').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.getAttribute('data-btn-preview');
        Toast.show(`Previewing live changes for "${item}" in Resume Editor...`, 'info');
      });
    });
  }
};
