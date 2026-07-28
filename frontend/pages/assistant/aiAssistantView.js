/**
 * ResumeAI / HireFlow AI — AI Career Coach Subview
 * Exact match to Reference Screenshot 3
 */

const AiAssistantView = {
  render() {
    return `
      <div>
        <!-- Page Header -->
        <div class="ws-page-header">
          <h1 class="ws-page-title">AI Career Coach</h1>
          <p class="ws-page-sub">
            Personalised to your resume, goals and target roles.
          </p>
        </div>

        <!-- 2-Column Grid Layout (Exact to Image 3) -->
        <div class="ws-coach-grid">
          
          <!-- Left Panel: Conversation History -->
          <div class="ws-coach-history-card">
            
            <button class="ws-btn-primary" id="btn-new-chat" style="width: 100%; border-radius: 999px; padding: 0.75rem; margin-bottom: 1.5rem; justify-content: center;">
              <i class="fa-solid fa-plus"></i>
              <span>New conversation</span>
            </button>

            <div style="font-size: 0.72rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;">
              HISTORY
            </div>

            <div style="flex: 1; overflow-y: auto;">
              <div class="ws-history-item" data-prompt="Prep for Vercel loop">
                <div class="ws-history-title">Prep for Vercel loop</div>
                <div class="ws-history-time">Today</div>
              </div>

              <div class="ws-history-item" data-prompt="Rewrite LinkedIn headline">
                <div class="ws-history-title">Rewrite LinkedIn headline</div>
                <div class="ws-history-time">Yesterday</div>
              </div>

              <div class="ws-history-item" data-prompt="Salary negotiation script">
                <div class="ws-history-title">Salary negotiation script</div>
                <div class="ws-history-time">3d ago</div>
              </div>
            </div>

          </div>

          <!-- Right Main Panel: Career Coach Chat & Prompt Suggestions -->
          <div class="ws-card" style="display: flex; flex-direction: column;">
            
            <!-- Bot Header Info Box -->
            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.75rem; padding-bottom: 1.25rem; border-bottom: 1px solid #f1f5f9;">
              <div style="width: 44px; height: 44px; background: #0f172a; color: #ffffff; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.2rem;">
                <i class="fa-solid fa-robot"></i>
              </div>
              <div>
                <h3 style="font-size: 1.15rem; font-weight: 800; color: #0f172a; margin: 0; line-height: 1.2;">
                  AI Career Coach
                </h3>
                <p style="font-size: 0.82rem; color: #64748b; margin: 0;">
                  Personalized to your resume, goals and target roles.
                </p>
              </div>
            </div>

            <!-- Scrollable Content Area: Prompts or Active Chat Messages -->
            <div id="coach-messages-container" style="flex: 1; overflow-y: auto; margin-bottom: 1.5rem;">
              
              <!-- Category Chips: What I can help with -->
              <div style="margin-bottom: 1.75rem;">
                <h4 style="font-size: 0.92rem; font-weight: 700; color: #0f172a; margin-bottom: 0.85rem;">
                  What I can help with
                </h4>
                
                <div class="ws-chip-grid">
                  <button class="ws-chip-item" data-coach-chip="Resume Review">
                    <i class="fa-regular fa-file-lines"></i> Resume Review
                  </button>
                  <button class="ws-chip-item" data-coach-chip="Career Guidance">
                    <i class="fa-solid fa-briefcase"></i> Career Guidance
                  </button>
                  <button class="ws-chip-item" data-coach-chip="Interview Prep">
                    <i class="fa-regular fa-comments"></i> Interview Prep
                  </button>
                  <button class="ws-chip-item" data-coach-chip="Project Ideas">
                    <i class="fa-solid fa-wand-magic-sparkles"></i> Project Ideas
                  </button>
                  <button class="ws-chip-item" data-coach-chip="Learning Roadmap">
                    <i class="fa-solid fa-graduation-cap"></i> Learning Roadmap
                  </button>
                  <button class="ws-chip-item" data-coach-chip="Certifications">
                    <i class="fa-solid fa-ribbon"></i> Certifications
                  </button>
                  <button class="ws-chip-item" data-coach-chip="Salary Insights">
                    <i class="fa-solid fa-dollar-sign"></i> Salary Insights
                  </button>
                  <button class="ws-chip-item" data-coach-chip="Cover Letters">
                    <i class="fa-regular fa-envelope"></i> Cover Letters
                  </button>
                  <button class="ws-chip-item" data-coach-chip="LinkedIn Optim.">
                    <i class="fa-brands fa-linkedin"></i> LinkedIn Optim.
                  </button>
                </div>
              </div>

              <!-- 2x2 Grid: Try a prompt -->
              <div>
                <h4 style="font-size: 0.92rem; font-weight: 700; color: #0f172a; margin-bottom: 0.85rem;">
                  Try a prompt
                </h4>
                
                <div class="ws-prompt-cards-grid">
                  <button class="ws-prompt-card-btn" data-coach-prompt="Review my resume for a Staff Frontend role.">
                    Review my resume for a Staff Frontend role.
                  </button>
                  <button class="ws-prompt-card-btn" data-coach-prompt="Give me a 90-day plan to break into ML engineering.">
                    Give me a 90-day plan to break into ML engineering.
                  </button>
                  <button class="ws-prompt-card-btn" data-coach-prompt="Write a cover letter for Vercel based on my resume.">
                    Write a cover letter for Vercel based on my resume.
                  </button>
                  <button class="ws-prompt-card-btn" data-coach-prompt="What salary range should I ask for in SF as a Sr. FE?">
                    What salary range should I ask for in SF as a Sr. FE?
                  </button>
                </div>
              </div>

            </div>

            <!-- Chat Input Box -->
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 16px; padding: 0.5rem 0.75rem; display: flex; align-items: center; gap: 0.75rem;">
              <input type="text" id="coach-chat-input" placeholder="Ask your AI Career Coach anything about your resume, career, or interviews..." style="flex: 1; border: none; background: transparent; outline: none; font-size: 0.9rem; color: #0f172a; padding: 0.5rem;" />
              <button class="ws-btn-primary" id="btn-send-coach" style="border-radius: 12px; padding: 0.6rem 1rem;">
                <i class="fa-solid fa-paper-plane"></i>
              </button>
            </div>

          </div>

        </div>

      </div>
    `;
  },

  bindEvents() {
    const handlePrompt = async (promptText) => {
      const messagesContainer = document.getElementById('coach-messages-container');
      if (!messagesContainer) return;

      // Append User message
      const userBubble = document.createElement('div');
      userBubble.style.cssText = 'background: #0f172a; color: #ffffff; padding: 0.85rem 1.1rem; border-radius: 16px 16px 4px 16px; max-width: 80%; margin-left: auto; margin-bottom: 1rem; font-size: 0.9rem; line-height: 1.5;';
      userBubble.textContent = promptText;
      messagesContainer.appendChild(userBubble);

      // Scroll
      messagesContainer.scrollTop = messagesContainer.scrollHeight;

      Toast.show('AI Coach generating response...', 'info');

      // Append Assistant typing placeholder
      const assistantBubble = document.createElement('div');
      assistantBubble.style.cssText = 'background: #f1f5f9; color: #0f172a; border: 1px solid #e2e8f0; padding: 1rem 1.25rem; border-radius: 16px 16px 16px 4px; max-width: 85%; margin-bottom: 1rem; font-size: 0.9rem; line-height: 1.6;';
      assistantBubble.innerHTML = '<i class="fa-solid fa-robot" style="margin-right: 0.5rem; color: #3b82f6;"></i> Analyzing your profile and career goals...';
      messagesContainer.appendChild(assistantBubble);

      const response = await AIService.chatCoach(promptText);
      assistantBubble.innerHTML = `<i class="fa-solid fa-robot" style="margin-right: 0.5rem; color: #3b82f6;"></i> ${response.replace(/\n/g, '<br>')}`;

      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    // Chat submit
    document.getElementById('btn-send-coach')?.addEventListener('click', () => {
      const input = document.getElementById('coach-chat-input');
      if (input?.value.trim()) {
        const text = input.value.trim();
        input.value = '';
        handlePrompt(text);
      }
    });

    document.getElementById('coach-chat-input')?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const text = e.target.value.trim();
        if (text) {
          e.target.value = '';
          handlePrompt(text);
        }
      }
    });

    // Prompt Card buttons
    document.querySelectorAll('[data-coach-prompt]').forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.getAttribute('data-coach-prompt');
        handlePrompt(prompt);
      });
    });

    // Chip item buttons
    document.querySelectorAll('[data-coach-chip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-coach-chip');
        handlePrompt(`Give me strategic advice and best practices for ${category} based on my resume.`);
      });
    });

    // History items
    document.querySelectorAll('.ws-history-item').forEach(item => {
      item.addEventListener('click', () => {
        const prompt = item.getAttribute('data-prompt');
        handlePrompt(prompt);
      });
    });

    // New conversation
    document.getElementById('btn-new-chat')?.addEventListener('click', () => {
      const messagesContainer = document.getElementById('coach-messages-container');
      if (messagesContainer) {
        messagesContainer.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #64748b;">
            <i class="fa-solid fa-robot" style="font-size: 2.5rem; color: #3b82f6; margin-bottom: 1rem;"></i>
            <h4 style="font-size: 1.1rem; font-weight: 700; color: #0f172a; margin-bottom: 0.5rem;">New Conversation Started</h4>
            <p style="font-size: 0.88rem;">Ask any question about your resume, interview prep, or target role guidance.</p>
          </div>
        `;
      }
    });
  }
};
