/**
 * ResumeAI — Project Recommendation Library (USP #5)
 * Curated list of beginner & intermediate projects with difficulty, time required, tech stack, and 1-click add.
 */

const ProjectLibraryView = {
  projects: [
    {
      title: 'Real-Time Chat & Messaging Application',
      difficulty: 'Intermediate',
      time: '12 Hours',
      stack: 'React, Node.js, Socket.io, Redis',
      skills: ['WebSockets', 'Real-Time Sync', 'Session Store'],
      desc: 'Built end-to-end multi-room messaging app supporting WebSocket channels, typing indicators, and message history.'
    },
    {
      title: 'AI Weather & Forecast Dashboard',
      difficulty: 'Beginner',
      time: '6 Hours',
      stack: 'React, OpenWeather API, Tailwind CSS',
      skills: ['REST APIs', 'Async/Await', 'Responsive UI'],
      desc: 'Interactive weather web app fetching 7-day location forecasts with weather icon visualization.'
    },
    {
      title: 'Expense Tracker & Budget Planner',
      difficulty: 'Beginner',
      time: '8 Hours',
      stack: 'JavaScript, HTML5, Chart.js, LocalStorage',
      skills: ['DOM Manipulation', 'Data Visualization', 'CRUD Operations'],
      desc: 'Personal finance planner calculating income vs expenditures with interactive spending breakdown charts.'
    },
    {
      title: 'Distributed Rate Limiter Service',
      difficulty: 'Advanced',
      time: '20 Hours',
      stack: 'Go, Redis, Docker, gRPC',
      skills: ['Distributed Systems', 'Sliding Window Log', 'Concurrency'],
      desc: 'High-performance API rate limiter middleware preventing DDoS attacks using Redis sliding window algorithms.'
    }
  ],

  render() {
    return `
      <div class="container" style="padding-top: 2.5rem; padding-bottom: 4rem;">
        
        <div class="section-header" style="text-align: left; margin-bottom: 2rem;">
          <div class="badge-ai">📂 USP #5: Recommended Projects</div>
          <h1 class="section-title">Project Recommendation Library</h1>
          <p class="section-subtitle">No impressive projects yet? Select beginner to advanced curated tech projects to build and add directly to your resume.</p>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-1 gap-6">
          ${this.projects.map(p => `
            <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-xl); padding: 1.75rem; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="flex justify-between items-center" style="margin-bottom: 0.75rem;">
                  <span style="background: rgba(139, 92, 246, 0.15); color: #c084fc; font-size: 0.75rem; font-weight: 700; padding: 0.2rem 0.6rem; border-radius: var(--radius-sm);">${p.difficulty}</span>
                  <span style="font-size: 0.78rem; color: var(--text-tertiary);"><i class="fa-solid fa-clock"></i> Est. ${p.time}</span>
                </div>

                <h3 style="font-size: 1.2rem; font-weight: 700; margin-bottom: 0.5rem;">${p.title}</h3>
                <div style="font-size: 0.82rem; color: var(--accent-gold); font-weight: 600; margin-bottom: 0.75rem;">
                  Tech Stack: ${p.stack}
                </div>

                <p style="font-size: 0.875rem; color: var(--text-secondary); margin-bottom: 1.25rem; line-height: 1.5;">
                  ${p.desc}
                </p>

                <div class="flex flex-wrap gap-2" style="margin-bottom: 1.5rem;">
                  ${p.skills.map(s => `<span style="font-size: 0.72rem; background: rgba(255,255,255,0.06); padding: 0.2rem 0.5rem; border-radius: 4px;">${s}</span>`).join('')}
                </div>
              </div>

              <button class="btn btn-dark-glass add-lib-proj-btn" data-title="${p.title}" data-stack="${p.stack}" style="width: 100%; color: var(--accent-purple);">
                <i class="fa-solid fa-plus"></i> Add Project to My Resume
              </button>
            </div>
          `).join('')}
        </div>

      </div>
    `;
  },

  bindEvents() {
    document.querySelectorAll('.add-lib-proj-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const title = e.currentTarget.getAttribute('data-title');
        const stack = e.currentTarget.getAttribute('data-stack');

        Store.addProject({ name: title, tech: stack });
        Toast.show(`Added "${title}" to your resume!`, 'success');
      });
    });
  }
};
