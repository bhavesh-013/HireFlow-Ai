/**
 * ResumeAI — Landing Page View Component
 * Renders the hero section matching the exact prompt screenshot design
 * with dark glassmorphic cards, floating stats, feature showcases, templates gallery, pricing.
 */

const LandingView = {
  render() {
    return `
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-bg-glow"></div>
        <div class="container hero-grid">
          
          <!-- Hero Left Content -->
          <div class="hero-content">
            <div class="badge-ai">
              <span>✨ AI-powered</span>
              <span style="opacity: 0.5">•</span>
              <span>Trusted by 50,000+ Job Seekers</span>
            </div>

            <h1 class="hero-title">
              Build, Tailor & <span class="text-gradient-purple">Optimize</span> Your Resume with <span class="text-gradient-gold">AI</span>
            </h1>

            <p class="hero-subtitle">
              Create ATS-friendly resumes, import GitHub projects, analyze ATS compatibility, compare against job descriptions, and improve interview readiness using AI.
            </p>

            <div class="hero-actions">
              <button class="btn btn-primary-glow" id="hero-btn-build">
                <span>✨ Build Resume with AI</span>
              </button>
              <button class="btn btn-dark-glass" id="hero-btn-upload">
                <i class="fa-solid fa-file-arrow-up"></i>
                <span>📄 Upload Resume</span>
              </button>
              <button class="btn btn-dark-glass" id="hero-btn-github">
                <i class="fa-brands fa-github"></i>
                <span>💻 Import GitHub</span>
              </button>
            </div>

            <div class="hero-features-list">
              <span><i class="fa-solid fa-check"></i> ATS Optimized</span>
              <span><i class="fa-solid fa-check"></i> AI Powered</span>
              <span><i class="fa-solid fa-check"></i> Export PDF</span>
              <span><i class="fa-solid fa-check"></i> Free Templates</span>
            </div>
          </div>

          <!-- Hero Right Stage: Interactive Document Preview with Floating Badges (Prompt Image replica) -->
          <div class="hero-stage">
            
            <!-- Top Left Badge: ATS Score 92% -->
            <div class="floating-badge badge-ats-score">
              <div class="label">ATS SCORE</div>
              <div class="val">92<span>%</span></div>
              <div class="bar"><div class="bar-fill"></div></div>
            </div>

            <!-- Top Right Badge: AI Improved Resume Avatar -->
            <div class="floating-badge badge-top-right flex items-center gap-2">
              <div style="width: 28px; height: 28px; border-radius: 50%; background: linear-gradient(135deg, #a78bfa, #f472b6); display: flex; align-items: center; justify-content: center; font-size: 0.75rem;">🧁</div>
              <div style="font-size: 0.75rem; font-weight: 700;">AI Improved <br><span style="color: var(--accent-purple);">Resume</span></div>
            </div>

            <!-- Right Middle Badge: Interview Readiness 84% -->
            <div class="floating-badge badge-interview-readiness">
              <div class="label" style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">INTERVIEW READINESS</div>
              <div class="val" style="font-size: 1.5rem; font-weight: 800;">84<span>%</span></div>
              <div class="bar" style="height: 4px; background: rgba(255,255,255,0.1); margin-top: 0.3rem; border-radius: 2px; overflow: hidden;">
                <div class="bar-fill"></div>
              </div>
            </div>

            <!-- Right Bottom Badge: JD Match 89% -->
            <div class="floating-badge badge-jd-match">
              <div class="label" style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">JD MATCH</div>
              <div class="val">89<span>%</span></div>
              <div class="bar" style="height: 4px; background: rgba(255,255,255,0.1); margin-top: 0.3rem; border-radius: 2px; overflow: hidden;">
                <div class="bar-fill"></div>
              </div>
            </div>

            <!-- Left Bottom Badge: Resume Health Excellent -->
            <div class="floating-badge badge-health-excellent">
              <div class="badge-health-icon"><i class="fa-solid fa-check"></i></div>
              <div>
                <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700;">Resume Health</div>
                <div style="font-weight: 800; color: #10b981; font-size: 0.85rem;">Excellent</div>
              </div>
            </div>

            <!-- Central Document Mockup -->
            <div class="hero-document-card">
              <div class="doc-browser-bar">
                <div class="doc-dots">
                  <div class="doc-dot doc-dot-red"></div>
                  <div class="doc-dot doc-dot-yellow"></div>
                  <div class="doc-dot doc-dot-green"></div>
                </div>
                <div class="doc-url">ai.app/editor</div>
              </div>

              <div class="doc-preview-body">
                <div class="doc-name">Alexandra Chen</div>
                <div class="doc-role">Senior Software Engineer</div>
                <div class="doc-meta">
                  <span>✉ alex@email.com</span>
                  <span>🔗 linkedin.com/in/alex</span>
                  <span>📍 San Francisco, CA</span>
                </div>

                <div class="doc-section-title">Summary</div>
                <p style="line-height: 1.4; color: #cbd5e1; margin-bottom: 0.8rem; font-size: 0.78rem;">
                  Results-driven engineer with 6+ years building scalable distributed systems. Led teams at Google and Stripe delivering 40% performance improvements. Expert in React, TypeScript, and cloud architecture.
                </p>

                <div class="doc-section-title">Experience</div>
                <div style="font-weight: 700; color: #fff; font-size: 0.8rem;">Senior Software Engineer</div>
                <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.3rem;">Google • 2021-Present</div>
                <ul style="padding-left: 1rem; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.6rem;">
                  <li>Reduced latency by 40% across search pipeline</li>
                  <li>Led team of 8 engineers on Ads infrastructure</li>
                </ul>

                <div style="font-weight: 700; color: #fff; font-size: 0.8rem;">Software Engineer</div>
                <div style="font-size: 0.72rem; color: #94a3b8; margin-bottom: 0.3rem;">Stripe • 2018-2021</div>
                <ul style="padding-left: 1rem; font-size: 0.75rem; color: #94a3b8; margin-bottom: 0.6rem;">
                  <li>Built payment system handling $2B/month</li>
                  <li>Migrated monolith to microservices, 99.99% uptime</li>
                </ul>

                <div class="doc-section-title">Skills</div>
                <div class="doc-skills-tags">
                  <span class="doc-skill-tag">React</span>
                  <span class="doc-skill-tag">TypeScript</span>
                  <span class="doc-skill-tag">Node.js</span>
                  <span class="doc-skill-tag">Python</span>
                  <span class="doc-skill-tag">Go</span>
                  <span class="doc-skill-tag">AWS</span>
                  <span class="doc-skill-tag">Docker</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <!-- USP Features Showcase Grid -->
      <section class="section container" id="features">
        <div class="section-header">
          <div class="badge-ai">⭐ Standout Superpowers</div>
          <h2 class="section-title">Features Designed to Get You Hired</h2>
          <p class="section-subtitle">Everything you need to craft high-converting, ATS-proof resumes tailored for top tech companies.</p>
        </div>

        <div class="grid grid-cols-3 lg:grid-cols-2 md:grid-cols-1 gap-6">
          
          <div class="feature-card" id="card-conv-builder" style="cursor: pointer;">
            <div class="feature-tag">USP #1</div>
            <div class="feature-icon-box"><i class="fa-solid fa-comments"></i></div>
            <h3 class="feature-card-title">🤖 AI Conversational Builder</h3>
            <p class="feature-card-desc">No tedious forms. Chat naturally with our AI assistant which asks one targeted question at a time and auto-builds your resume.</p>
          </div>

          <div class="feature-card" id="card-github-import" style="cursor: pointer;">
            <div class="feature-tag">USP #2</div>
            <div class="feature-icon-box"><i class="fa-brands fa-github"></i></div>
            <h3 class="feature-card-title">💻 Smart GitHub Import</h3>
            <p class="feature-card-desc">Connect your GitHub profile. AI extracts repos, star counts, languages, and converts them into professional resume project bullets.</p>
          </div>

          <div class="feature-card" id="card-skill-detection" style="cursor: pointer;">
            <div class="feature-tag">USP #4</div>
            <div class="feature-icon-box"><i class="fa-solid fa-wand-magic-sparkles"></i></div>
            <h3 class="feature-card-title">🧠 Smart Skill Detection</h3>
            <p class="feature-card-desc">AI scans your project descriptions (e.g. Weather App with React & REST API) and automatically prompts missing skills to add.</p>
          </div>

          <div class="feature-card" id="card-proj-library" style="cursor: pointer;">
            <div class="feature-tag">USP #5</div>
            <div class="feature-icon-box"><i class="fa-solid fa-folder-open"></i></div>
            <h3 class="feature-card-title">📂 Project Recommendation Library</h3>
            <p class="feature-card-desc">Lacking projects? Explore beginner to advanced curated project ideas with tech stacks, difficulty levels, and 1-click add.</p>
          </div>

          <div class="feature-card" id="card-version-mgr" style="cursor: pointer;">
            <div class="feature-tag">USP #10</div>
            <div class="feature-icon-box"><i class="fa-solid fa-code-branch"></i></div>
            <h3 class="feature-card-title">📝 Resume Version Manager</h3>
            <p class="feature-card-desc">Maintain one Master Resume and easily spawn targeted versions for Google, Amazon, or Microsoft with custom keyword diffs.</p>
          </div>

          <div class="feature-card" id="card-ats-analyzer" style="cursor: pointer;">
            <div class="feature-tag">USP #9</div>
            <div class="feature-icon-box"><i class="fa-solid fa-chart-line"></i></div>
            <h3 class="feature-card-title">🎯 Interview Chance Prediction</h3>
            <p class="feature-card-desc">Compare your resume against any Job Description to get an estimated interview call probability, missing keywords, and experience gap report.</p>
          </div>

        </div>
      </section>

      <!-- Template Showcase Section -->
      <section class="section" id="templates" style="background: rgba(16, 20, 34, 0.4); border-y: 1px solid var(--border-primary);">
        <div class="container">
          <div class="section-header">
            <div class="badge-ai">🎨 Proven Resume Layouts</div>
            <h2 class="section-title">ATS-Friendly & Modern Templates</h2>
            <p class="section-subtitle">Single-column, high white space templates engineered to bypass ATS screeners effortlessly.</p>
          </div>

          <div class="grid grid-cols-4 lg:grid-cols-2 md:grid-cols-1 gap-6">
            
            <div class="feature-card text-center" style="padding: 1.5rem;">
              <div style="background: #fff; height: 180px; border-radius: 6px; padding: 1rem; color: #000; font-size: 0.55rem; text-align: left; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="font-weight: 800; font-size: 0.75rem;">ALEXANDRA CHEN</div>
                <div style="color: #2563eb; font-weight: 600;">Software Engineer</div>
                <div style="height: 1px; background: #e2e8f0; margin: 0.4rem 0;"></div>
                <div style="font-weight: 700; margin-top: 0.3rem;">EXPERIENCE</div>
                <div>Senior Engineer • Google</div>
                <ul style="padding-left: 0.8rem;"><li>Built scalable backend services</li></ul>
              </div>
              <h4 style="font-weight: 700; margin-top: 1rem;">ATS Classic</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">100% ATS parser compliant</p>
              <button class="btn btn-dark-glass select-template-btn" data-template="ats" style="width: 100%; font-size: 0.8rem; padding: 0.4rem;">Use Template</button>
            </div>

            <div class="feature-card text-center" style="padding: 1.5rem;">
              <div style="background: #fff; height: 180px; border-radius: 6px; padding: 1rem; color: #000; font-size: 0.55rem; text-align: left; overflow: hidden; border-left: 5px solid #8b5cf6; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="font-weight: 800; font-size: 0.75rem; color: #8b5cf6;">ALEXANDRA CHEN</div>
                <div style="color: #64748b; font-weight: 600;">Software Engineer</div>
                <div style="height: 1px; background: #e2e8f0; margin: 0.4rem 0;"></div>
                <div style="font-weight: 700; margin-top: 0.3rem; color: #8b5cf6;">SUMMARY</div>
                <div>Results driven tech lead</div>
              </div>
              <h4 style="font-weight: 700; margin-top: 1rem;">Modern Accent</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Sleek vertical border accent</p>
              <button class="btn btn-dark-glass select-template-btn" data-template="modern" style="width: 100%; font-size: 0.8rem; padding: 0.4rem;">Use Template</button>
            </div>

            <div class="feature-card text-center" style="padding: 1.5rem;">
              <div style="background: #fff; height: 180px; border-radius: 6px; padding: 1rem; color: #000; font-size: 0.55rem; text-align: left; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="font-weight: 800; font-size: 0.75rem; text-align: center;">ALEXANDRA CHEN</div>
                <div style="color: #64748b; font-weight: 500; text-align: center;">San Francisco, CA • alex@email.com</div>
                <div style="height: 1px; background: #000; margin: 0.4rem 0;"></div>
                <div style="font-weight: 700; margin-top: 0.3rem;">SKILLS</div>
                <div>React, Node, Go, Python</div>
              </div>
              <h4 style="font-weight: 700; margin-top: 1rem;">Minimalist</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Ultra clean typography focus</p>
              <button class="btn btn-dark-glass select-template-btn" data-template="minimal" style="width: 100%; font-size: 0.8rem; padding: 0.4rem;">Use Template</button>
            </div>

            <div class="feature-card text-center" style="padding: 1.5rem;">
              <div style="background: #fafafa; height: 180px; border-radius: 6px; padding: 1rem; color: #000; font-size: 0.55rem; text-align: left; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
                <div style="font-weight: 800; font-size: 0.75rem; color: #1e3a8a;">ALEXANDRA CHEN</div>
                <div style="color: #1e3a8a; font-weight: 600;">Tech Lead & Architect</div>
                <div style="height: 2px; background: #1e3a8a; margin: 0.4rem 0;"></div>
                <div style="font-weight: 700; margin-top: 0.3rem; color: #1e3a8a;">PROJECTS</div>
                <div>AI Resume Synth</div>
              </div>
              <h4 style="font-weight: 700; margin-top: 1rem;">Executive Pro</h4>
              <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 0.75rem;">Classic deep blue header accent</p>
              <button class="btn btn-dark-glass select-template-btn" data-template="professional" style="width: 100%; font-size: 0.8rem; padding: 0.4rem;">Use Template</button>
            </div>

          </div>
        </div>
      </section>

      <!-- Pricing Section -->
      <section class="section container" id="pricing">
        <div class="section-header">
          <div class="badge-ai">💎 Transparent Pricing</div>
          <h2 class="section-title">Invest in Your Career Growth</h2>
          <p class="section-subtitle">Start for free. Upgrade to unlocked unlimited AI bullet rewrites and job description matching.</p>
        </div>

        <div class="grid grid-cols-3 lg:grid-cols-1 gap-8 max-w-4xl" style="margin: 0 auto;">
          
          <div class="feature-card flex flex-col justify-between" style="padding: 2rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Free Starter</h3>
              <div style="font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem;">$0 <span style="font-size: 0.9rem; color: var(--text-tertiary); font-weight: 500;">/ forever</span></div>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> 1 Master Resume</li>
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> 3 ATS Templates</li>
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> Basic GitHub Import</li>
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> 5 AI Bullet Rewrites/mo</li>
              </ul>
            </div>
            <button class="btn btn-dark-glass" style="width: 100%; margin-top: 2rem;">Get Started Free</button>
          </div>

          <div class="feature-card flex flex-col justify-between" style="padding: 2rem; border-color: var(--accent-purple); box-shadow: var(--shadow-glow-purple); position: relative;">
            <div style="position: absolute; top: -12px; right: 20px; background: linear-gradient(135deg, #7c3aed, #db2777); color: #fff; padding: 0.2rem 0.75rem; border-radius: var(--radius-full); font-size: 0.75rem; font-weight: 700;">MOST POPULAR</div>
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem; color: var(--accent-purple);">Pro Job Seeker</h3>
              <div style="font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem;">$12 <span style="font-size: 0.9rem; color: var(--text-tertiary); font-weight: 500;">/ month</span></div>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> Unlimited Resumes & Versions</li>
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> Unlimited AI Bullet Rewrites</li>
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> Job Description Match Analyzer</li>
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> Interview Chance Prediction</li>
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> AI Career Coach 24/7</li>
              </ul>
            </div>
            <button class="btn btn-primary-glow" style="width: 100%; margin-top: 2rem;">Upgrade to Pro</button>
          </div>

          <div class="feature-card flex flex-col justify-between" style="padding: 2rem;">
            <div>
              <h3 style="font-size: 1.25rem; font-weight: 700; margin-bottom: 0.5rem;">Team & Bootcamp</h3>
              <div style="font-size: 2.25rem; font-weight: 800; margin-bottom: 1rem;">$49 <span style="font-size: 0.9rem; color: var(--text-tertiary); font-weight: 500;">/ month</span></div>
              <ul style="list-style: none; display: flex; flex-direction: column; gap: 0.75rem; font-size: 0.875rem; color: var(--text-secondary);">
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> 10 User Licenses</li>
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> Recruiter Review Dashboard</li>
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> Custom Branding</li>
                <li><i class="fa-solid fa-check" style="color: var(--accent-teal);"></i> Priority Support</li>
              </ul>
            </div>
            <button class="btn btn-dark-glass" style="width: 100%; margin-top: 2rem;">Contact Sales</button>
          </div>

        </div>
      </section>
    `;
  },

  bindEvents() {
    document.getElementById('hero-btn-build')?.addEventListener('click', () => {
      Store.setView('builder');
    });

    document.getElementById('hero-btn-upload')?.addEventListener('click', () => {
      Store.setView('analyzer');
    });

    document.getElementById('hero-btn-github')?.addEventListener('click', () => {
      Store.setView('github');
    });

    document.getElementById('card-conv-builder')?.addEventListener('click', () => {
      Store.setView('conversational');
    });

    document.getElementById('card-github-import')?.addEventListener('click', () => {
      Store.setView('github');
    });

    document.getElementById('card-skill-detection')?.addEventListener('click', () => {
      Store.setView('builder');
    });

    document.getElementById('card-proj-library')?.addEventListener('click', () => {
      Store.setView('projects');
    });

    document.getElementById('card-version-mgr')?.addEventListener('click', () => {
      Store.setView('versions');
    });

    document.getElementById('card-ats-analyzer')?.addEventListener('click', () => {
      Store.setView('analyzer');
    });

    document.querySelectorAll('.select-template-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tmpl = e.target.getAttribute('data-template');
        Store.setTemplate(tmpl);
        Store.setView('builder');
      });
    });
  }
};
