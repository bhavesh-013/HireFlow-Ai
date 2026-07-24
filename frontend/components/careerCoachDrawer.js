/**
 * ResumeAI — AI Career Coach Drawer Component (USP #11)
 * Interactive drawer answering career advice, project suggestions, and interview preparation.
 */

const CareerCoachDrawer = {
  isOpen: false,

  render() {
    return `
      <!-- Trigger Floating Action Button -->
      <button class="coach-trigger-btn" id="btn-toggle-coach" title="Ask AI Career Coach">
        <i class="fa-solid fa-robot"></i>
      </button>

      <!-- Slide-Out Drawer -->
      <div class="coach-drawer ${this.isOpen ? 'open' : ''}" id="coach-drawer-element">
        
        <div class="coach-header">
          <div class="coach-title">
            <span style="color: var(--accent-gold);">🎤</span>
            <span>AI Career Coach</span>
          </div>
          <button class="modal-close" id="btn-close-coach">&times;</button>
        </div>

        <div class="coach-body" id="coach-chat-timeline">
          <div class="chat-bubble chat-bubble-ai">
            👋 Hi Alexandra! I am your 24/7 AI Career Coach. Ask me anything:
            <ul style="padding-left: 1rem; margin-top: 0.4rem;">
              <li>• "How can I improve my resume ATS score?"</li>
              <li>• "What projects should I build next?"</li>
              <li>• "What interview questions should I prepare?"</li>
            </ul>
          </div>
        </div>

        <div class="coach-footer">
          <input type="text" class="coach-input" id="coach-chat-input" placeholder="Ask your AI Career Coach...">
          <button class="btn btn-primary-glow" id="coach-chat-send" style="padding: 0.5rem 0.9rem; font-size: 0.85rem;">Send</button>
        </div>

      </div>
    `;
  },

  bindEvents() {
    document.getElementById('btn-toggle-coach')?.addEventListener('click', () => {
      this.isOpen = !this.isOpen;
      const el = document.getElementById('coach-drawer-element');
      if (el) {
        if (this.isOpen) el.classList.add('open');
        else el.classList.remove('open');
      }
    });

    document.getElementById('btn-close-coach')?.addEventListener('click', () => {
      this.isOpen = false;
      document.getElementById('coach-drawer-element')?.classList.remove('open');
    });

    const sendBtn = document.getElementById('coach-chat-send');
    const input = document.getElementById('coach-chat-input');
    const timeline = document.getElementById('coach-chat-timeline');

    const handleSend = async () => {
      if (!input || !input.value.trim()) return;
      const text = input.value.trim();

      const userMsg = document.createElement('div');
      userMsg.className = 'chat-bubble chat-bubble-user';
      userMsg.innerText = text;
      timeline.appendChild(userMsg);
      input.value = '';
      timeline.scrollTop = timeline.scrollHeight;

      const aiReplyText = await AIService.askCareerCoach(text);

      const aiMsg = document.createElement('div');
      aiMsg.className = 'chat-bubble chat-bubble-ai';
      aiMsg.innerHTML = aiReplyText.replace(/\n/g, '<br>');
      timeline.appendChild(aiMsg);
      timeline.scrollTop = timeline.scrollHeight;
    };

    sendBtn?.addEventListener('click', handleSend);
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSend();
    });
  }
};
