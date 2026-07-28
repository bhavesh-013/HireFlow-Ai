/**
 * ResumeAI / HireFlow AI — ATS Analysis Subview
 * Exact match to Reference Screenshot 4
 */

const AtsAnalysisView = {
  render() {
    return `
      <div>
        <!-- Page Header with Filename Pill Badge (Exact to Image 4) -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
          <div>
            <h1 class="ws-page-title">ATS Analysis</h1>
            <p class="ws-page-sub">
              See how your resume performs against Applicant Tracking Systems used by 90%+ of Fortune 500 companies.
            </p>
          </div>
          
          <div style="background: #e2e8f0; color: #334155; font-weight: 700; font-size: 0.84rem; padding: 0.5rem 1.1rem; border-radius: 999px; display: inline-flex; align-items: center; gap: 0.5rem;">
            Senior Frontend Engineer.pdf
          </div>
        </div>

        <!-- 2-Column Responsive Card Grid (Exact to Image 4) -->
        <div style="display: grid; grid-template-columns: 1fr 1.3fr; gap: 1.75rem; margin-bottom: 1.75rem;">
          
          <!-- Left Card: Overall ATS Score -->
          <div class="ws-card" style="display: flex; flex-direction: column; align-items: center; text-align: center; justify-content: center; padding: 2.5rem 2rem;">
            <div style="font-size: 0.88rem; font-weight: 700; color: #64748b; margin-bottom: 1.5rem;">
              Overall ATS Score
            </div>

            <div style="font-size: 5.5rem; font-weight: 900; color: #0284c7; line-height: 1; letter-spacing: -0.04em;">
              76
            </div>
            
            <div style="font-size: 1rem; font-weight: 700; color: #94a3b8; margin-top: 0.25rem; margin-bottom: 2rem;">
              / 100
            </div>

            <div class="ws-progress-track" style="height: 10px; max-width: 280px; margin: 0 auto 2rem auto;">
              <div class="ws-progress-fill" style="width: 76%; background-color: #0284c7;"></div>
            </div>

            <p style="font-size: 0.88rem; color: #475569; max-width: 320px; line-height: 1.5; margin: 0;">
              Passes major ATS (Greenhouse, Lever, Workday) — 4 quick fixes to hit 90+.
            </p>
          </div>

          <!-- Right Card: Section Scores (Exact scores from Image 4) -->
          <div class="ws-card">
            
            <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 1.75rem;">
              Section Scores
            </h3>

            <!-- 1. Formatting 92% -->
            <div class="ws-score-item">
              <div class="ws-score-header">
                <span class="ws-score-name">Formatting</span>
                <span class="ws-score-pct">92%</span>
              </div>
              <div class="ws-progress-track">
                <div class="ws-progress-fill" style="width: 92%; background-color: #0284c7;"></div>
              </div>
            </div>

            <!-- 2. Keywords 68% -->
            <div class="ws-score-item">
              <div class="ws-score-header">
                <span class="ws-score-name">Keywords</span>
                <span class="ws-score-pct">68%</span>
              </div>
              <div class="ws-progress-track">
                <div class="ws-progress-fill" style="width: 68%; background-color: #0284c7;"></div>
              </div>
            </div>

            <!-- 3. Content 81% -->
            <div class="ws-score-item">
              <div class="ws-score-header">
                <span class="ws-score-name">Content</span>
                <span class="ws-score-pct">81%</span>
              </div>
              <div class="ws-progress-track">
                <div class="ws-progress-fill" style="width: 81%; background-color: #0284c7;"></div>
              </div>
            </div>

            <!-- 4. Readability 88% -->
            <div class="ws-score-item">
              <div class="ws-score-header">
                <span class="ws-score-name">Readability</span>
                <span class="ws-score-pct">88%</span>
              </div>
              <div class="ws-progress-track">
                <div class="ws-progress-fill" style="width: 88%; background-color: #0284c7;"></div>
              </div>
            </div>

            <!-- 5. Skills 74% -->
            <div class="ws-score-item">
              <div class="ws-score-header">
                <span class="ws-score-name">Skills</span>
                <span class="ws-score-pct">74%</span>
              </div>
              <div class="ws-progress-track">
                <div class="ws-progress-fill" style="width: 74%; background-color: #0284c7;"></div>
              </div>
            </div>

            <!-- 6. Achievements 63% -->
            <div class="ws-score-item" style="margin-bottom: 0;">
              <div class="ws-score-header">
                <span class="ws-score-name">Achievements</span>
                <span class="ws-score-pct">63%</span>
              </div>
              <div class="ws-progress-track">
                <div class="ws-progress-fill" style="width: 63%; background-color: #0284c7;"></div>
              </div>
            </div>

          </div>

        </div>

        <!-- Bottom Card: Keyword Distribution (Exact to Image 4 bottom) -->
        <div class="ws-card">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin-bottom: 1.25rem;">
            Keyword Distribution
          </h3>

          <div style="display: flex; gap: 0.75rem; flex-wrap: wrap;">
            <span style="background: #f1f5f9; color: #0f172a; padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.84rem; font-weight: 600;">
              React.js <strong style="color: #0284c7;">(8 matches)</strong>
            </span>
            <span style="background: #f1f5f9; color: #0f172a; padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.84rem; font-weight: 600;">
              TypeScript <strong style="color: #0284c7;">(6 matches)</strong>
            </span>
            <span style="background: #f1f5f9; color: #0f172a; padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.84rem; font-weight: 600;">
              Node.js <strong style="color: #0284c7;">(4 matches)</strong>
            </span>
            <span style="background: #f1f5f9; color: #0f172a; padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.84rem; font-weight: 600;">
              System Architecture <strong style="color: #0284c7;">(3 matches)</strong>
            </span>
            <span style="background: #fef2f2; color: #ef4444; padding: 0.4rem 0.85rem; border-radius: 8px; font-size: 0.84rem; font-weight: 600; border: 1px solid #fecaca;">
              + GraphQL (0 matches - Missing)
            </span>
          </div>
        </div>

      </div>
    `;
  },

  bindEvents() {
    // Interactivity if needed
  }
};
