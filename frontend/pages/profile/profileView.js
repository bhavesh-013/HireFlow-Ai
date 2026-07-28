/**
 * ResumeAI / HireFlow AI — Profile & Settings Subview
 * Exact match to Reference Screenshot 2
 */

const ProfileView = {
  render() {
    const profile = Store.getState().resume.personal || {};

    return `
      <div>
        <!-- Page Header with Top Right Action -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap;">
          <div>
            <h1 class="ws-page-title">Profile & Settings</h1>
            <p class="ws-page-sub">
              Manage your account details, notifications and privacy preferences.
            </p>
          </div>
          <button class="ws-btn-primary" id="btn-save-profile-settings" style="border-radius: 999px; padding: 0.65rem 1.4rem;">
            Save changes
          </button>
        </div>

        <!-- 2-Column Responsive Card Grid (Exact to Image 2) -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 1.75rem; align-items: start;">
          
          <!-- Left Card: Profile Information -->
          <div class="ws-card">
            
            <!-- Avatar & Header Banner -->
            <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 2rem; padding-bottom: 1.5rem; border-bottom: 1px solid #f1f5f9;">
              <div style="width: 64px; height: 64px; background: #0f172a; color: #ffffff; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.4rem;">
                AK
              </div>
              <div>
                <h3 style="font-size: 1.25rem; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2;">
                  Alex Kumar
                </h3>
                <span style="font-size: 0.84rem; font-weight: 600; color: #64748b;">
                  Pro Member
                </span>
              </div>
            </div>

            <!-- Form Fields Grid (2x2) -->
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.25rem;">
              
              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.4rem;">Full name</label>
                <input type="text" class="ws-input" id="prof-fullname" value="${profile.fullName || 'Alex Kumar'}" />
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.4rem;">Email</label>
                <input type="email" class="ws-input" id="prof-email" value="${profile.email || 'alex.kumar@example.com'}" />
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.4rem;">Target role</label>
                <input type="text" class="ws-input" id="prof-targetrole" value="${profile.title || 'Senior Frontend Engineer'}" />
              </div>

              <div>
                <label style="display: block; font-size: 0.8rem; font-weight: 700; color: #475569; margin-bottom: 0.4rem;">Location</label>
                <input type="text" class="ws-input" id="prof-location" value="${profile.location || 'Bengaluru, India'}" />
              </div>

            </div>

          </div>

          <!-- Right Card: Preferences -->
          <div class="ws-card">
            
            <h3 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.65rem;">
              <i class="fa-regular fa-user" style="color: #475569;"></i>
              <span>Preferences</span>
            </h3>

            <div>
              
              <!-- Toggle 1: Weekly ATS report -->
              <div class="ws-toggle-row">
                <div class="ws-toggle-info">
                  <i class="fa-regular fa-bell ws-toggle-icon"></i>
                  <div>
                    <div class="ws-toggle-label">Weekly ATS report</div>
                    <div class="ws-toggle-desc">A summary of your resume health every Monday.</div>
                  </div>
                </div>
                <label class="ws-switch">
                  <input type="checkbox" id="toggle-weekly-ats" checked />
                  <span class="ws-slider"></span>
                </label>
              </div>

              <!-- Toggle 2: Private mode -->
              <div class="ws-toggle-row">
                <div class="ws-toggle-info">
                  <i class="fa-solid fa-shield-halved ws-toggle-icon"></i>
                  <div>
                    <div class="ws-toggle-label">Private mode</div>
                    <div class="ws-toggle-desc">Never use your resume data to train models.</div>
                  </div>
                </div>
                <label class="ws-switch">
                  <input type="checkbox" id="toggle-private-mode" checked />
                  <span class="ws-slider"></span>
                </label>
              </div>

            </div>

          </div>

        </div>

      </div>
    `;
  },

  bindEvents() {
    document.getElementById('btn-save-profile-settings')?.addEventListener('click', () => {
      const name = document.getElementById('prof-fullname')?.value;
      const email = document.getElementById('prof-email')?.value;
      const role = document.getElementById('prof-targetrole')?.value;
      const loc = document.getElementById('prof-location')?.value;

      Store.updateResumePersonal('fullName', name);
      Store.updateResumePersonal('email', email);
      Store.updateResumePersonal('title', role);
      Store.updateResumePersonal('location', loc);

      Toast.show('Profile & Preferences updated successfully!', 'success');
    });
  }
};
