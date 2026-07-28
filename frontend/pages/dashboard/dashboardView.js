/**
 * ResumeAI / HireFlow AI — Main Workspace Dashboard Overview Subview
 */

const DashboardView = {
  render() {
    return `
      <div>
        <!-- Page Header -->
        <div class="ws-page-header">
          <h1 class="ws-page-title">Dashboard</h1>
          <p class="ws-page-sub">
            Overview of your active resumes, ATS performance metrics, and AI optimization goals.
          </p>
        </div>

        <!-- Metric Cards Row 1 (Matching prompt specs) -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
          
          <div class="ws-card">
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Resume Health</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: #0f172a; margin-top: 0.5rem;">92%</div>
            <div style="font-size: 0.78rem; font-weight: 600; color: #10b981; margin-top: 0.25rem;">
              <i class="fa-solid fa-circle-check"></i> Excellent ATS compliance
            </div>
          </div>

          <div class="ws-card">
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">ATS Score</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: #0284c7; margin-top: 0.5rem;">76 / 100</div>
            <div style="font-size: 0.78rem; font-weight: 600; color: #0284c7; margin-top: 0.25rem;">
              4 quick fixes available
            </div>
          </div>

          <div class="ws-card">
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">Job Match Rate</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: #8b5cf6; margin-top: 0.5rem;">89%</div>
            <div style="font-size: 0.78rem; font-weight: 600; color: #8b5cf6; margin-top: 0.25rem;">
              Matches Staff FE roles
            </div>
          </div>

          <div class="ws-card">
            <div style="font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase;">AI Projection</div>
            <div style="font-size: 2.2rem; font-weight: 800; color: #10b981; margin-top: 0.5rem;">+15%</div>
            <div style="font-size: 0.78rem; font-weight: 600; color: #10b981; margin-top: 0.25rem;">
              After applying suggestions
            </div>
          </div>

        </div>

        <!-- Metric Cards Row 2 -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.25rem;">
          <div class="ws-card" style="padding: 1.25rem 1.5rem;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #64748b;">TOTAL RESUMES</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-top: 0.25rem;">3</div>
          </div>

          <div class="ws-card" style="padding: 1.25rem 1.5rem;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #64748b;">TAILORED RESUMES</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-top: 0.25rem;">5</div>
          </div>

          <div class="ws-card" style="padding: 1.25rem 1.5rem;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #64748b;">RESUME VERSIONS</div>
            <div style="font-size: 1.5rem; font-weight: 800; color: #0f172a; margin-top: 0.25rem;">4</div>
          </div>

          <div class="ws-card" style="padding: 1.25rem 1.5rem;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #64748b;">RECENT ACTIVITY</div>
            <div style="font-size: 0.85rem; font-weight: 600; color: #3b82f6; margin-top: 0.25rem;">Scanned 2 hours ago</div>
          </div>
        </div>

        <!-- Recent Resumes List Card -->
        <div class="ws-card">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem;">
            <h2 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0;">
              Recent Resumes
            </h2>
            <button class="ws-btn-primary" id="btn-create-new-resume" style="border-radius: 999px;">
              <i class="fa-solid fa-plus"></i> Create New Resume
            </button>
          </div>

          <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; text-align: left; font-size: 0.88rem;">
              <thead>
                <tr style="border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 0.78rem; text-transform: uppercase;">
                  <th style="padding: 0.75rem 1rem;">Resume Name</th>
                  <th style="padding: 0.75rem 1rem;">Target Role</th>
                  <th style="padding: 0.75rem 1rem;">ATS Score</th>
                  <th style="padding: 0.75rem 1rem;">Last Modified</th>
                  <th style="padding: 0.75rem 1rem; text-align: right;">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 1rem; font-weight: 700; color: #0f172a;">
                    <i class="fa-regular fa-file-lines" style="color: #3b82f6; margin-right: 0.5rem;"></i> Senior Frontend Engineer.pdf
                  </td>
                  <td style="padding: 1rem; color: #475569;">Staff / Sr. Frontend Engineer</td>
                  <td style="padding: 1rem;">
                    <span style="background: #e0f2fe; color: #0284c7; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 999px; font-size: 0.78rem;">76%</span>
                  </td>
                  <td style="padding: 1rem; color: #64748b;">Today, 4:12 PM</td>
                  <td style="padding: 1rem; text-align: right;">
                    <button class="ws-btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;" data-open-editor>Edit</button>
                  </td>
                </tr>

                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 1rem; font-weight: 700; color: #0f172a;">
                    <i class="fa-regular fa-file-lines" style="color: #3b82f6; margin-right: 0.5rem;"></i> Google Systems Engineer.pdf
                  </td>
                  <td style="padding: 1rem; color: #475569;">Google Systems Lead</td>
                  <td style="padding: 1rem;">
                    <span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 999px; font-size: 0.78rem;">94%</span>
                  </td>
                  <td style="padding: 1rem; color: #64748b;">Yesterday</td>
                  <td style="padding: 1rem; text-align: right;">
                    <button class="ws-btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;" data-open-editor>Edit</button>
                  </td>
                </tr>

                <tr>
                  <td style="padding: 1rem; font-weight: 700; color: #0f172a;">
                    <i class="fa-regular fa-file-lines" style="color: #3b82f6; margin-right: 0.5rem;"></i> Vercel Fullstack Engineer.pdf
                  </td>
                  <td style="padding: 1rem; color: #475569;">Vercel Core Team</td>
                  <td style="padding: 1rem;">
                    <span style="background: #dcfce7; color: #166534; font-weight: 700; padding: 0.25rem 0.65rem; border-radius: 999px; font-size: 0.78rem;">91%</span>
                  </td>
                  <td style="padding: 1rem; color: #64748b;">3 days ago</td>
                  <td style="padding: 1rem; text-align: right;">
                    <button class="ws-btn-secondary" style="padding: 0.4rem 0.8rem; font-size: 0.78rem;" data-open-editor>Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

      </div>
    `;
  }
// ,
  // bindEvents() {
  //   document.querySelectorAll('[data-open-editor]').forEach(btn => {
  //     btn.addEventListener('click', () => {
  //       Store.setWorkspaceView('build-editor');
  //     });
  //   });

  //   document.getElementById('btn-create-new-resume')?.addEventListener('click', () => {
  //     Store.setWorkspaceView('build-editor');
  //   });
  // }
};
