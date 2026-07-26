/**
 * ResumeAI — ATS Score & Job Description Analyzer View
 * Compares resume content against job descriptions to predict interview chances
 * and highlights missing keywords/skills & experience gaps.
 */

const AtsAnalyzerView = {
  render() {
    const state = Store.getState();
    const ats = state.atsAnalysis;

    return `
      <div class="container" style="padding-top: 2.5rem; padding-bottom: 4rem;">
        
        <div class="section-header" style="margin-bottom: 2rem; text-align: left;">
          <div class="badge-ai">🎯 USP #9: ATS & JD Matching</div>
          <h1 class="section-title">Resume & Job Description Matcher</h1>
          <p class="section-subtitle">Paste target job description to get an estimated interview chance percentage and keyword gap analysis.</p>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-1 gap-8">
          
          <!-- Input Form -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-xl); padding: 2rem;">
            
            <div class="form-group">
              <label class="form-label">Upload or Paste Resume</label>
              <textarea class="form-control" id="ats-resume-input" rows="5" placeholder="Paste resume text or plain content...">${state.resume.summary}\n\nSkills: ${state.resume.skills.join(', ')}</textarea>
            </div>

            <div class="form-group" style="margin-top: 1.5rem;">
              <label class="form-label">Paste Target Job Description (JD)</label>
              <textarea class="form-control" id="ats-jd-input" rows="6" placeholder="Paste job requirements, tech stack specs, or responsibility bullets from LinkedIn / Indeed..."></textarea>
            </div>

            <button class="btn btn-primary-glow" id="btn-run-ats-scan" style="width: 100%; margin-top: 1rem;">
              ⚡ Run AI Match Scan & Predict Chance
            </button>
          </div>

          <!-- Report Dashboard -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-xl); padding: 2rem;" id="ats-report-container">
            
            <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
              <h3 style="font-size: 1.2rem; font-weight: 700;">Scan Diagnostics</h3>
              <span class="badge-ai" style="background: rgba(16, 185, 129, 0.15); color: #10b981;">Health: ${ats.healthStatus}</span>
            </div>

            <!-- Gauge Meters Grid -->
            <div class="grid grid-cols-3 md:grid-cols-1 gap-4" style="margin-bottom: 2rem;">
              
              <div class="gauge-box">
                <div class="gauge-circle" style="--gauge-pct: ${ats.overallScore}%;">
                  <div class="gauge-text">${ats.overallScore}%</div>
                </div>
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-top: 0.75rem;">ATS Score</div>
              </div>

              <div class="gauge-box" style="border-color: rgba(245, 158, 11, 0.3);">
                <div class="gauge-circle" style="--gauge-pct: ${ats.interviewChance}%; background: conic-gradient(#f59e0b 0% ${ats.interviewChance}%, rgba(255,255,255,0.08) ${ats.interviewChance}% 100%);">
                  <div class="gauge-text" style="color: #fcd34d;">${ats.interviewChance}%</div>
                </div>
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-top: 0.75rem;">Interview Chance</div>
              </div>

              <div class="gauge-box">
                <div class="gauge-circle" style="--gauge-pct: ${ats.jdMatch}%;">
                  <div class="gauge-text">${ats.jdMatch}%</div>
                </div>
                <div style="font-size: 0.8rem; font-weight: 700; color: var(--text-secondary); margin-top: 0.75rem;">JD Match</div>
              </div>

            </div>

            <!-- AI Disclaimer Notice -->
            <div style="background: rgba(245, 158, 11, 0.1); border: 1px solid rgba(245, 158, 11, 0.25); padding: 0.75rem 1rem; border-radius: var(--radius-md); font-size: 0.78rem; color: #fcd34d; margin-bottom: 1.5rem;">
              💡 <strong>AI Disclaimer:</strong> Interview readiness score is an AI estimate based on ATS keyword alignment and historical hiring metrics, not a guarantee.
            </div>

            <!-- Missing Keywords & Skills Breakdown -->
            <div style="margin-bottom: 1.5rem;">
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: #f87171;">
                <i class="fa-solid fa-triangle-exclamation"></i> Missing Keywords & Skills
              </h4>
              <div class="flex flex-wrap gap-2">
                ${ats.missingKeywords.map(k => `
                  <span style="background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); padding: 0.25rem 0.65rem; border-radius: var(--radius-full); font-size: 0.78rem;">
                    + ${k}
                  </span>
                `).join('')}
              </div>
            </div>

            <div>
              <h4 style="font-size: 0.95rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--accent-teal);">
                <i class="fa-solid fa-circle-check"></i> Actionable AI Suggestions
              </h4>
              <ul style="padding-left: 1.1rem; font-size: 0.85rem; color: var(--text-secondary); line-height: 1.6;">
                <li>Include <strong>Terraform</strong> and <strong>gRPC</strong> under technical skills section.</li>
                <li>Add quantifiable latency metrics to your Senior Engineer experience bullets.</li>
              </ul>
            </div>

          </div>

        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('btn-run-ats-scan')?.addEventListener('click', async () => {
      const resumeInput = document.getElementById('ats-resume-input')?.value;
      const jdInput = document.getElementById('ats-jd-input')?.value;

      Toast.show('Analyzing ATS score & predicting interview chance...', 'info');
      const result = await AIService.analyzeJobDescription(resumeInput, jdInput);

      Toast.show(`Scan complete! Estimated Interview Chance: ${result.interviewChance}%`, 'success');
    });
  }
};
