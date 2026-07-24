/**
 * ResumeAI — Smart GitHub Import View (USP #2)
 * Connect GitHub profile, fetch repos, languages, stars, descriptions, and auto-convert into resume projects.
 */

const GithubImportView = {
  repos: [],

  render() {
    return `
      <div class="container" style="padding-top: 2.5rem; padding-bottom: 4rem; max-width: 1000px;">
        
        <div class="section-header" style="text-align: left; margin-bottom: 2rem;">
          <div class="badge-ai">💻 USP #2: GitHub Project Extractor</div>
          <h1 class="section-title">Smart GitHub Import</h1>
          <p class="section-subtitle">Connect your GitHub username to automatically convert repositories into polished resume projects with bullet points.</p>
        </div>

        <!-- Username Input Form -->
        <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-xl); padding: 1.5rem 2rem; margin-bottom: 2rem;" class="flex items-center gap-4 md:flex-col">
          <div class="flex items-center gap-2" style="font-size: 1.5rem; color: #fff;">
            <i class="fa-brands fa-github"></i>
            <span style="font-size: 1rem; font-weight: 700;">github.com/</span>
          </div>
          <input type="text" class="form-control" id="github-username-input" value="alexchen" placeholder="Enter GitHub username..." style="flex: 1;">
          <button class="btn btn-primary-glow" id="btn-fetch-repos">Fetch Repositories</button>
        </div>

        <!-- Repositories Grid Container -->
        <div id="github-repos-container" class="grid grid-cols-2 md:grid-cols-1 gap-6">
          <div style="color: var(--text-tertiary); grid-column: 1 / -1; text-align: center; padding: 3rem;">
            Click "Fetch Repositories" to analyze public repos.
          </div>
        </div>

      </div>
    `;
  },

  bindEvents() {
    document.getElementById('btn-fetch-repos')?.addEventListener('click', async () => {
      const username = document.getElementById('github-username-input')?.value || 'alexchen';
      Toast.show(`Fetching GitHub repositories for @${username}...`, 'info');

      this.repos = await AIService.fetchGitHubRepos(username);
      this.renderRepos();
      Toast.show(`Extracted ${this.repos.length} repositories with AI bullet suggestions!`, 'success');
    });
  },

  renderRepos() {
    const container = document.getElementById('github-repos-container');
    if (!container) return;

    container.innerHTML = this.repos.map(repo => `
      <div style="background: var(--bg-card); border: 1px solid var(--border-primary); border-radius: var(--radius-lg); padding: 1.5rem; display: flex; flex-direction: column; justify-content: space-between;">
        <div>
          <div class="flex justify-between items-center" style="margin-bottom: 0.5rem;">
            <h3 style="font-size: 1.1rem; font-weight: 700; color: #fff;">${repo.name}</h3>
            <span style="background: rgba(245, 158, 11, 0.15); color: #fcd34d; padding: 0.2rem 0.6rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700;">
              ⭐ ${repo.stars} stars
            </span>
          </div>

          <div style="font-size: 0.8rem; color: var(--accent-purple); font-weight: 600; margin-bottom: 0.75rem;">
            Primary Tech: ${repo.language}
          </div>

          <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 1rem; line-height: 1.4;">
            ${repo.description}
          </p>

          <div style="font-size: 0.78rem; font-weight: 700; color: var(--text-tertiary); margin-bottom: 0.4rem;">
            AI GENERATED RESUME BULLETS:
          </div>
          <ul style="padding-left: 1rem; font-size: 0.8rem; color: #cbd5e1; margin-bottom: 1.25rem;">
            ${repo.suggestedBullets.map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>

        <button class="btn btn-dark-glass add-github-proj-btn" data-repo-name="${repo.name}" data-repo-tech="${repo.skillsDetected.join(', ')}" style="width: 100%; font-size: 0.85rem; padding: 0.5rem; color: var(--accent-teal);">
          <i class="fa-solid fa-plus"></i> Add to Resume Projects
        </button>
      </div>
    `).join('');

    // Bind Add Project Buttons
    container.querySelectorAll('.add-github-proj-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.target.getAttribute('data-repo-name');
        const tech = e.target.getAttribute('data-repo-tech');
        
        Store.addProject({ name, tech, desc: `Engineered ${name} GitHub project using ${tech}.` });
        Toast.show(`Added "${name}" project to your resume!`, 'success');
      });
    });
  }
};
