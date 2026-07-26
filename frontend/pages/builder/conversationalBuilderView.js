/**
 * ResumeAI — AI Conversational Resume Builder View (USP #1)
 * Users construct their resume by chatting with AI one targeted question at a time.
 */

const ConversationalBuilderView = {
  step: 0,
  questions: [
    { text: "Hi! I'm your AI Resume Coach. Let's build your resume step-by-step! First, what is your Full Name and current target Job Title?", field: 'fullName' },
    { text: "Great! Where are you currently located, and what is the best email to contact you?", field: 'location' },
    { text: "Tell me about your primary technical stack or skills (e.g. React, Python, AWS, Node.js)?", field: 'skills' },
    { text: "Awesome. Describe your most impressive project or recent work achievement in your own words?", field: 'experience' },
    { text: "Fantastic! I've updated your resume structure with high-impact ATS keywords. Would you like to preview or export it now?", field: 'done' }
  ],

  render() {
    return `
      <div class="container" style="padding-top: 2rem; max-width: 900px;">
        <div class="flex items-center justify-between" style="margin-bottom: 1.5rem;">
          <div>
            <div class="badge-ai">🤖 USP #1: Chat with AI</div>
            <h2 style="font-size: 1.75rem; font-weight: 800; margin-top: 0.4rem;">Conversational Resume Builder</h2>
          </div>
          <button class="btn btn-dark-glass" id="btn-back-builder">Switch to Form Editor</button>
        </div>

        <div class="grid grid-cols-2 lg:grid-cols-1 gap-6">
          
          <!-- AI Chat Pane -->
          <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-xl); height: 520px; display: flex; flex-direction: column;">
            
            <div style="padding: 1rem 1.25rem; background: var(--bg-secondary); border-bottom: 1px solid var(--border-primary); font-weight: 700; display: flex; items-center; gap: 0.5rem;">
              <span style="color: var(--accent-purple);">✨ ResumeAI Assistant</span>
            </div>

            <div id="conv-chat-timeline" style="flex: 1; padding: 1.25rem; overflow-y: auto; display: flex; flex-direction: column; gap: 1rem;">
              <div class="chat-bubble chat-bubble-ai">
                Hi! I'm your AI Resume Coach. Let's build your resume step-by-step without filling long forms! First, what is your Full Name and current target Job Title?
              </div>
            </div>

            <div style="padding: 1rem; background: var(--bg-secondary); border-top: 1px solid var(--border-primary); display: flex; gap: 0.5rem;">
              <input type="text" id="conv-chat-input" class="form-control" placeholder="Type your answer here..." style="font-size: 0.875rem;">
              <button class="btn btn-primary-glow" id="conv-chat-send" style="padding: 0.6rem 1.2rem;">Send</button>
            </div>

          </div>

          <!-- Real-Time Auto-Generated Document Preview -->
          <div style="background: #0d111d; border: 1px solid var(--border-primary); border-radius: var(--radius-xl); padding: 1.5rem; display: flex; justify-center; overflow-y: auto; height: 520px;">
            <div class="resume-paper template-modern" style="min-height: 480px; padding: 1.5rem; font-size: 0.75rem;">
              <h2 id="conv-preview-name" style="font-size: 1.2rem; font-weight: 800;">Alexandra Chen</h2>
              <div id="conv-preview-title" style="color: #8b5cf6; font-weight: 600;">Senior Software Engineer</div>
              <div style="font-size: 0.7rem; color: #64748b; margin-bottom: 0.75rem;">alex@email.com • San Francisco, CA</div>
              
              <div class="paper-section-title" style="font-size: 0.75rem;">AI Generated Summary</div>
              <p id="conv-preview-summary">AI dynamically updates your resume details in real time as you chat!</p>
              
              <div class="paper-section-title" style="font-size: 0.75rem;">Skills</div>
              <div id="conv-preview-skills">React • TypeScript • Node.js • AWS</div>
            </div>
          </div>

        </div>
      </div>
    `;
  },

  bindEvents() {
    document.getElementById('btn-back-builder')?.addEventListener('click', () => {
      Store.setView('builder');
    });

    const sendBtn = document.getElementById('conv-chat-send');
    const input = document.getElementById('conv-chat-input');
    const timeline = document.getElementById('conv-chat-timeline');

    const handleSend = () => {
      if (!input || !input.value.trim()) return;
      const text = input.value.trim();

      // Append User message
      const userMsg = document.createElement('div');
      userMsg.className = 'chat-bubble chat-bubble-user';
      userMsg.innerText = text;
      timeline.appendChild(userMsg);
      input.value = '';
      timeline.scrollTop = timeline.scrollHeight;

      // AI Response processing
      setTimeout(() => {
        const aiMsg = document.createElement('div');
        aiMsg.className = 'chat-bubble chat-bubble-ai';

        if (this.step < this.questions.length - 1) {
          this.step++;
          aiMsg.innerText = this.questions[this.step].text;
          
          // Live update document preview mock
          if (this.step === 1) {
            document.getElementById('conv-preview-name').innerText = text;
          } else if (this.step === 2) {
            document.getElementById('conv-preview-summary').innerText = `Experienced engineer based in ${text} focused on scalable cloud architecture and high-performance frontend interfaces.`;
          } else if (this.step === 3) {
            document.getElementById('conv-preview-skills').innerText = text;
          }
        } else {
          aiMsg.innerText = "Awesome! Your resume is fully built and optimized for ATS parsers!";
        }

        timeline.appendChild(aiMsg);
        timeline.scrollTop = timeline.scrollHeight;
      }, 600);
    };

    sendBtn?.addEventListener('click', handleSend);
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
};
