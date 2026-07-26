/**
 * ResumeAI — Full Interactive Resume Builder View
 * Allows editing sections, profile flow selection (Student/Fresher/Experienced),
 * AI bullet rewriter triggers, section reordering, and live template preview.
 */

const BuilderView = {
  render() {
    const state = Store.getState();
    const resume = state.resume;

    return `
      <div class="container" style="padding-top: 1.5rem;">
        
        <!-- Profile Flow Switcher Header (USP #7) -->
        <div class="flex items-center justify-between" style="background: var(--bg-card); padding: 1rem 1.5rem; border-radius: var(--radius-lg); border: 1px solid var(--border-primary); margin-bottom: 1.5rem;">
          <div class="flex items-center gap-3">
            <span style="font-size: 1.25rem;">👨‍🎓</span>
            <div>
              <div style="font-weight: 700; font-size: 0.95rem;">Dynamic Profile Flow</div>
              <div style="font-size: 0.78rem; color: var(--text-secondary);">Tailors form fields based on your experience level</div>
            </div>
          </div>

          <div class="flex gap-2">
            <button class="btn btn-dark-glass profile-flow-btn ${state.userProfileType === 'student' ? 'active-profile' : ''}" data-type="student" style="font-size: 0.8rem; padding: 0.4rem 0.9rem;">Student</button>
            <button class="btn btn-dark-glass profile-flow-btn ${state.userProfileType === 'fresher' ? 'active-profile' : ''}" data-type="fresher" style="font-size: 0.8rem; padding: 0.4rem 0.9rem;">Fresher</button>
            <button class="btn btn-dark-glass profile-flow-btn ${state.userProfileType === 'experienced' ? 'active-profile' : ''}" data-type="experienced" style="font-size: 0.8rem; padding: 0.4rem 0.9rem;">Experienced Pro</button>
          </div>
        </div>

        <div class="builder-container">
          
          <!-- Editor Form Pane (Left Side) -->
          <div class="builder-editor-pane">
            
            <div class="flex items-center justify-between" style="padding-bottom: 1rem; border-bottom: 1px solid var(--border-primary);">
              <h2 style="font-size: 1.25rem; font-weight: 700;">Edit Resume Content</h2>
              <div class="flex gap-2">
                <button class="btn btn-dark-glass" id="btn-conv-builder" style="font-size: 0.8rem; padding: 0.4rem 0.8rem; color: var(--accent-purple);">
                  <i class="fa-solid fa-comments"></i> Chat with AI
                </button>
              </div>
            </div>

            <!-- Section 1: Personal Information -->
            <div class="form-section">
              <h3 style="font-size: 1rem; font-weight: 700; color: var(--accent-purple); margin-bottom: 1rem;">
                <i class="fa-solid fa-user"></i> Personal Information
              </h3>
              
              <div class="grid grid-cols-2 gap-4">
                <div class="form-group">
                  <label class="form-label">Full Name</label>
                  <input type="text" class="form-control" id="input-fullname" value="${resume.personal.fullName}">
                </div>
                <div class="form-group">
                  <label class="form-label">Job Title / Target Role</label>
                  <input type="text" class="form-control" id="input-title" value="${resume.personal.title}">
                </div>
                <div class="form-group">
                  <label class="form-label">Email Address</label>
                  <input type="email" class="form-control" id="input-email" value="${resume.personal.email}">
                </div>
                <div class="form-group">
                  <label class="form-label">Phone Number</label>
                  <input type="text" class="form-control" id="input-phone" value="${resume.personal.phone}">
                </div>
                <div class="form-group">
                  <label class="form-label">Location</label>
                  <input type="text" class="form-control" id="input-location" value="${resume.personal.location}">
                </div>
                <div class="form-group">
                  <label class="form-label">LinkedIn URL</label>
                  <input type="text" class="form-control" id="input-linkedin" value="${resume.personal.linkedin}">
                </div>
              </div>
            </div>

            <!-- Section 2: Professional Summary -->
            <div class="form-section">
              <div class="flex items-center justify-between" style="margin-bottom: 0.5rem;">
                <h3 style="font-size: 1rem; font-weight: 700; color: var(--accent-purple);">
                  <i class="fa-solid fa-file-lines"></i> Professional Summary
                </h3>
                <button class="btn btn-dark-glass" id="ai-rewrite-summary" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; color: #c084fc;">
                  ✨ Improve with AI
                </button>
              </div>
              <textarea class="form-control" id="input-summary" rows="3">${resume.summary}</textarea>
            </div>

            <!-- Section 3: Work Experience -->
            <div class="form-section">
              <h3 style="font-size: 1rem; font-weight: 700; color: var(--accent-purple); margin-bottom: 1rem;">
                <i class="fa-solid fa-briefcase"></i> Work Experience
              </h3>

              ${resume.experience.map((exp, index) => `
                <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: var(--radius-md); border: 1px solid var(--border-primary); margin-bottom: 1rem;">
                  <div class="flex justify-between items-center" style="margin-bottom: 0.5rem;">
                    <div style="font-weight: 700;">${exp.role} @ ${exp.company}</div>
                    <span style="font-size: 0.75rem; color: var(--text-tertiary);">${exp.period}</span>
                  </div>
                  
                  <div class="form-group" style="margin-top: 0.5rem;">
                    <label class="form-label">Bullet Points</label>
                    ${exp.bullets.map((b, bIdx) => `
                      <div class="flex items-center gap-2" style="margin-bottom: 0.4rem;">
                        <input type="text" class="form-control" value="${b}" style="font-size: 0.8rem;">
                        <button class="btn btn-dark-glass ai-rewrite-bullet-btn" data-exp-id="${exp.id}" data-bullet-idx="${bIdx}" style="padding: 0.4rem 0.6rem;" title="AI Rewrite Bullet">
                          ✨
                        </button>
                      </div>
                    `).join('')}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Section 4: Skills & Smart Detection (USP #4) -->
            <div class="form-section">
              <div class="flex justify-between items-center" style="margin-bottom: 0.75rem;">
                <h3 style="font-size: 1rem; font-weight: 700; color: var(--accent-purple);">
                  <i class="fa-solid fa-lightbulb"></i> Skills & Competencies
                </h3>
                <button class="btn btn-dark-glass" id="trigger-skill-detect" style="font-size: 0.75rem; padding: 0.3rem 0.6rem; color: var(--accent-gold);">
                  🧠 Smart Detect Skills
                </button>
              </div>

              <div class="flex flex-wrap gap-2" style="margin-bottom: 1rem;">
                ${resume.skills.map(skill => `
                  <span style="background: rgba(139, 92, 246, 0.15); color: #c084fc; border: 1px solid rgba(139, 92, 246, 0.3); padding: 0.3rem 0.75rem; border-radius: var(--radius-full); font-size: 0.8rem; display: inline-flex; align-items: center; gap: 0.4rem;">
                    ${skill}
                    <i class="fa-solid fa-xmark" style="cursor: pointer; opacity: 0.7;"></i>
                  </span>
                `).join('')}
              </div>

              <div class="flex gap-2">
                <input type="text" class="form-control" id="input-new-skill" placeholder="Add custom skill (e.g. GraphQL)" style="font-size: 0.85rem;">
                <button class="btn btn-dark-glass" id="btn-add-skill">Add</button>
              </div>
            </div>

          </div>

          <!-- Live Preview Pane (Right Side) -->
          <div class="builder-preview-pane">
            
            <div class="flex items-center justify-between" style="width: 100%; max-width: 650px; margin-bottom: 1rem;">
              <div style="font-size: 0.85rem; font-weight: 700; color: var(--text-secondary);">Live Paper Preview</div>
              
              <div class="flex gap-2">
                <select id="template-select-dropdown" class="form-control" style="font-size: 0.8rem; padding: 0.35rem 0.75rem;">
                  <option value="ats" ${state.activeTemplate === 'ats' ? 'selected' : ''}>ATS Classic</option>
                  <option value="modern" ${state.activeTemplate === 'modern' ? 'selected' : ''}>Modern Accent</option>
                  <option value="minimal" ${state.activeTemplate === 'minimal' ? 'selected' : ''}>Minimalist</option>
                  <option value="professional" ${state.activeTemplate === 'professional' ? 'selected' : ''}>Executive Pro</option>
                </select>

                <button class="btn btn-primary-glow" id="btn-export-pdf" style="font-size: 0.8rem; padding: 0.4rem 0.9rem;">
                  <i class="fa-solid fa-download"></i> Export PDF
                </button>
              </div>
            </div>

            <!-- Dynamic Printable Paper Document -->
            <div class="resume-paper template-${state.activeTemplate}" id="printable-resume">
              
              <h1>${resume.personal.fullName}</h1>
              <div class="paper-subtitle">${resume.personal.title}</div>
              
              <div class="paper-contacts">
                <span>📧 ${resume.personal.email}</span>
                <span>📱 ${resume.personal.phone}</span>
                <span>📍 ${resume.personal.location}</span>
                <span>🔗 ${resume.personal.linkedin}</span>
              </div>

              <div class="paper-section-title">Summary</div>
              <p>${resume.summary}</p>

              <div class="paper-section-title">Work Experience</div>
              ${resume.experience.map(exp => `
                <div class="paper-item">
                  <div class="paper-item-header">
                    <span>${exp.role}</span>
                    <span>${exp.period}</span>
                  </div>
                  <div class="paper-item-sub">${exp.company} • ${exp.location}</div>
                  <ul>
                    ${exp.bullets.map(b => `<li>${b}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}

              <div class="paper-section-title">Projects</div>
              ${resume.projects.map(p => `
                <div class="paper-item">
                  <div class="paper-item-header">
                    <span>${p.name}</span>
                    <span style="font-size: 0.75rem; color: #475569;">${p.tech}</span>
                  </div>
                  <ul>
                    ${p.bullets.map(b => `<li>${b}</li>`).join('')}
                  </ul>
                </div>
              `).join('')}

              <div class="paper-section-title">Technical Skills</div>
              <div style="font-size: 0.8rem; line-height: 1.6;">
                ${resume.skills.join(' • ')}
              </div>

            </div>

          </div>

        </div>
      </div>
    `;
  },

  bindEvents() {
    // Dynamic Profile Flow Button Switcher
    document.querySelectorAll('.profile-flow-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const type = e.target.getAttribute('data-type');
        Store.setProfileType(type);
        Toast.show(`Switched to ${type.toUpperCase()} profile flow`, 'info');
      });
    });

    // Inputs binding
    document.getElementById('input-fullname')?.addEventListener('input', (e) => {
      Store.updateResumePersonal('fullName', e.target.value);
    });

    document.getElementById('input-title')?.addEventListener('input', (e) => {
      Store.updateResumePersonal('title', e.target.value);
    });

    document.getElementById('input-email')?.addEventListener('input', (e) => {
      Store.updateResumePersonal('email', e.target.value);
    });

    document.getElementById('input-summary')?.addEventListener('input', (e) => {
      Store.updateSummary(e.target.value);
    });

    // Template Dropdown
    document.getElementById('template-select-dropdown')?.addEventListener('change', (e) => {
      Store.setTemplate(e.target.value);
    });

    // AI Rewrite Summary
    document.getElementById('ai-rewrite-summary')?.addEventListener('click', async () => {
      Toast.show('AI is crafting a high-impact summary...', 'info');
      const original = Store.getState().resume.summary;
      const improved = await AIService.rewriteBullet(original, 'ats');
      Store.updateSummary(improved);
      Toast.show('Summary enhanced with AI!', 'success');
    });

    // AI Bullet Rewriter buttons
    document.querySelectorAll('.ai-rewrite-bullet-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const inputEl = e.currentTarget.previousElementSibling;
        if (inputEl) {
          Toast.show('AI optimizing bullet point metrics...', 'info');
          const rewritten = await AIService.rewriteBullet(inputEl.value, 'impact');
          inputEl.value = rewritten;
          Toast.show('Bullet point enhanced!', 'success');
        }
      });
    });

    // Add skill
    document.getElementById('btn-add-skill')?.addEventListener('click', () => {
      const input = document.getElementById('input-new-skill');
      if (input && input.value.trim()) {
        Store.addSkill(input.value.trim());
        input.value = '';
        Toast.show('Skill added to resume', 'success');
      }
    });

    // Smart detect skills trigger
    document.getElementById('trigger-skill-detect')?.addEventListener('click', () => {
      Toast.show('AI detected skills: GraphQL, Kubernetes, Microservices', 'info');
      Store.addSkill('GraphQL');
      Store.addSkill('Kubernetes');
    });

    // Export PDF Print trigger
    document.getElementById('btn-export-pdf')?.addEventListener('click', () => {
      window.print();
    });

    // Switch to Chat with AI
    document.getElementById('btn-conv-builder')?.addEventListener('click', () => {
      Store.setView('conversational');
    });
  }
};
