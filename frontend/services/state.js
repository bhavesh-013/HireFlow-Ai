/**
 * ResumeAI — Reactive Application State Store
 * Manages active resume data, user profile flow, version targets, ATS analysis history.
 */

const Store = {
  listeners: [],

  state: {
    theme: localStorage.getItem('resumeai_theme') || 'dark',
    activeView: 'landing', // 'landing', 'workspace'
    activeWorkspaceView: 'dashboard', // 'dashboard', 'build-editor', 'build-tailored', 'build-templates', 'analysis-ats', 'analysis-suggestions', 'analysis-jd', 'assistant', 'profile'
    userProfileType: 'experienced', // 'student', 'fresher', 'experienced'
    activeTemplate: 'ats', // 'ats', 'modern', 'minimal', 'professional'
    
    // Master Resume Data
    resume: {
      personal: {
        fullName: 'Alexandra Chen',
        title: 'Senior Software Engineer',
        email: 'alex@email.com',
        phone: '+1 (555) 234-5678',
        location: 'San Francisco, CA',
        linkedin: 'linkedin.com/in/alex',
        github: 'github.com/alexchen',
        website: 'alexchen.dev'
      },
      summary: 'Results-driven engineer with 6+ years building scalable distributed systems. Led teams at Google and Stripe delivering 40% performance improvements. Expert in React, TypeScript, Node.js, and cloud architecture.',
      experience: [
        {
          id: 'exp-1',
          company: 'Google',
          role: 'Senior Software Engineer',
          period: '2021 - Present',
          location: 'Mountain View, CA',
          bullets: [
            'Architected distributed search indexing engine processing 40M daily queries, reducing query latency by 40%.',
            'Led a cross-functional engineering team of 8 building real-time telemetry streaming platforms on Kubernetes.',
            'Mentored 5 junior developers and instituted automated CI/CD security scanning pipelines.'
          ]
        },
        {
          id: 'exp-2',
          company: 'Stripe',
          role: 'Software Engineer',
          period: '2018 - 2021',
          location: 'San Francisco, CA',
          bullets: [
            'Built core payment checkout service handling $2B/month in transactional volume with 99.999% availability.',
            'Migrated legacy monolithic billing infrastructure to microservices using Node.js and AWS SQS.'
          ]
        }
      ],
      education: [
        {
          id: 'edu-1',
          institution: 'University of California, Berkeley',
          degree: 'B.S. in Computer Science',
          period: '2014 - 2018',
          gpa: '3.9 / 4.0'
        }
      ],
      projects: [
        {
          id: 'proj-1',
          name: 'AI Resume Synthesizer',
          tech: 'React, Node.js, OpenAI API, Tailwind CSS',
          link: 'github.com/alexchen/resume-synth',
          bullets: [
            'Engineered automated ATS keyword match scoring algorithm with instant PDF export capability.',
            'Acquired 15,000 active monthly users and maintained a 4.9/5 satisfaction rating.'
          ]
        }
      ],
      skills: ['React', 'TypeScript', 'Node.js', 'Python', 'Go', 'AWS', 'Docker', 'GraphQL', 'Kubernetes', 'REST APIs'],
      certifications: ['AWS Certified Solutions Architect - Associate', 'Certified Kubernetes Administrator (CKA)'],
      achievements: ['1st Place - Berkeley Global Hackathon 2018', 'Published Author - IEEE Scalable Computing 2020'],
      positions: ['Tech Lead - Open Source Guild', 'Mentor - Women in Tech Techstars'],
      languages: ['English (Native)', 'Mandarin (Fluent)'],
      interests: ['Distributed Systems', 'Cloud Native Architectures', 'Generative AI']
    },

    // Company Tailored Versions
    versions: {
      master: 'Master Resume',
      google: {
        title: 'Google (Systems & Performance Focus)',
        summary: 'Performance-obsessed Senior Systems Engineer with 6+ years designing ultra-low-latency distributed infrastructure at scale. Specialized in query optimization and Kubernetes orchestration.',
        matchScore: 94
      },
      amazon: {
        title: 'Amazon (AWS & Cloud Infrastructure Focus)',
        summary: 'Cloud Solutions Architect and Senior Developer with extensive background building mission-critical fault-tolerant microservices handling billions in volume on AWS.',
        matchScore: 91
      },
      microsoft: {
        title: 'Microsoft (Enterprise & Full Stack Focus)',
        summary: 'Full Stack Engineering Lead experienced in enterprise React/Node.js web applications, API integrations, and developer tooling.',
        matchScore: 88
      }
    },

    // ATS Analysis Demo State
    atsAnalysis: {
      overallScore: 92,
      interviewChance: 84,
      jdMatch: 89,
      healthStatus: 'Excellent',
      formattingScore: 95,
      grammarScore: 98,
      readabilityScore: 90,
      missingKeywords: ['CI/CD Pipeline Security', 'Terraform', 'gRPC'],
      missingSkills: ['Terraform', 'gRPC'],
      experienceGap: 'None detected (6+ years meets requirements)',
      strengths: ['Strong quantitative metric bullets', 'Clean single-column ATS formatting', 'High tech stack keyword density']
    }
  },

  getState() {
    return this.state;
  },

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  },

  notify() {
    this.listeners.forEach(l => l(this.state));
  },

  setView(viewName) {
    this.state.activeView = viewName;
    this.notify();
  },

  setWorkspaceView(subView) {
    this.state.activeView = 'workspace';
    this.state.activeWorkspaceView = subView;
    this.notify();
  },

  setTheme(theme) {
    this.state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('resumeai_theme', theme);
    this.notify();
  },

  setProfileType(type) {
    this.state.userProfileType = type;
    this.notify();
  },

  setTemplate(template) {
    this.state.activeTemplate = template;
    this.notify();
  },

  updateResumePersonal(field, value) {
    this.state.resume.personal[field] = value;
    this.notify();
  },

  updateSummary(summary) {
    this.state.resume.summary = summary;
    this.notify();
  },

  addSkill(skill) {
    if (skill && !this.state.resume.skills.includes(skill)) {
      this.state.resume.skills.push(skill);
      this.notify();
    }
  },

  addProject(project) {
    this.state.resume.projects.push({
      id: 'proj-' + Date.now(),
      name: project.name,
      tech: project.tech,
      bullets: [project.desc || 'Developed responsive web application incorporating modern software patterns.']
    });
    this.notify();
  }
};
