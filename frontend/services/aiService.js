/**
 * ResumeAI — AI Simulation Engine
 * Powers interactive AI chat builder, ATS scan generator, bullet rewriter,
 * GitHub project extractor, smart skill detector, and career advisor.
 */

const AIService = {
  /**
   * Improve or rewrite a bullet point with high-impact action verbs and quantitative metrics
   */
  async rewriteBullet(originalText, mode = 'impact') {
    await new Promise(res => setTimeout(res, 600)); // Simulating AI processing delay

    const actionVerbs = ['Architected', 'Spearheaded', 'Optimized', 'Engineered', 'Pioneered', 'Accelerated'];
    const metrics = ['45% efficiency boost', 'reducing latency by 60ms', 'saving 150 hours annually', 'scaling to 5M active users'];

    const verb = actionVerbs[Math.floor(Math.random() * actionVerbs.length)];
    const metric = metrics[Math.floor(Math.random() * metrics.length)];

    if (mode === 'ats') {
      return `Optimized ${originalText.toLowerCase().replace(/^(built|led|worked|engineered)/i, '')} utilizing cloud-native patterns, automated CI/CD pipelines, and industry best practices (${metric}).`;
    }

    return `${verb} ${originalText.toLowerCase().replace(/^(built|led|worked|engineered)/i, '')}, resulting in a ${metric} and elevated system reliability.`;
  },

  /**
   * Generate an ATS analysis scan based on resume content and job description
   */
  async analyzeJobDescription(resumeText, jobDescriptionText) {
    await new Promise(res => setTimeout(res, 800));

    const keywords = ['React', 'TypeScript', 'Node.js', 'System Architecture', 'CI/CD', 'AWS', 'Docker', 'Kubernetes', 'GraphQL'];
    const missing = ['Kubernetes', 'gRPC', 'Terraform'];

    const matchScore = Math.floor(Math.random() * 12) + 84; // 84-95%
    const interviewChance = Math.floor(matchScore * 0.95);

    return {
      overallScore: matchScore,
      interviewChance: interviewChance,
      jdMatch: matchScore - 3,
      healthStatus: matchScore > 88 ? 'Excellent' : 'Good',
      missingKeywords: missing,
      missingSkills: ['Terraform', 'gRPC', 'Microservices Security'],
      formattingScore: 96,
      grammarScore: 98,
      readabilityScore: 92,
      recommendations: [
        'Add quantitative metrics to your 2nd job role at Stripe.',
        'Include Terraform under Cloud Infrastructure skills.',
        'Tailor your professional summary to explicitly mention gRPC and system scalability.'
      ]
    };
  },

  /**
   * Simulate fetching public GitHub repositories for a username
   */
  async fetchGitHubRepos(username = 'alexchen') {
    await new Promise(res => setTimeout(res, 700));

    return [
      {
        name: 'cloud-telemetry-stream',
        stars: 342,
        language: 'Go',
        description: 'High-throughput real-time log ingestion pipeline supporting Kafka and ClickHouse integrations.',
        skillsDetected: ['Go', 'Kafka', 'ClickHouse', 'Docker', 'gRPC'],
        suggestedBullets: [
          'Designed high-throughput telemetry stream pipeline in Go processing 10k events/sec.',
          'Integrated ClickHouse database for sub-second analytical dashboard queries.'
        ]
      },
      {
        name: 'ai-resume-optimizer',
        stars: 1250,
        language: 'TypeScript',
        description: 'AI-driven parser and ATS optimizer using LLMs and modern React dashboard components.',
        skillsDetected: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'OpenAI API'],
        suggestedBullets: [
          'Engineered React + Next.js frontend web app with real-time markdown resume renderer.',
          'Integrated OpenAI API to score bullet points against standard ATS parser criteria.'
        ]
      },
      {
        name: 'distributed-kv-store',
        stars: 180,
        language: 'Rust',
        description: 'Raft consensus implementation in Rust for distributed in-memory key-value data store.',
        skillsDetected: ['Rust', 'Raft Consensus', 'Distributed Systems'],
        suggestedBullets: [
          'Implemented Raft consensus protocol in Rust for leader election and log replication.'
        ]
      }
    ];
  },

  /**
   * Career Coach advisor responses
   */
  async askCareerCoach(question) {
    await new Promise(res => setTimeout(res, 600));

    const q = question.toLowerCase();

    if (q.includes('improve') || q.includes('resume')) {
      return `To make your resume top 1%: 
1. Use the **XYZ formula**: *Accomplished [X], as measured by [Y], by doing [Z]*.
2. Add quantitative metrics to every bullet (e.g. %, $, numbers of users).
3. Keep your ATS score above 85% by incorporating job description keywords.`;
    }

    if (q.includes('project') || q.includes('build')) {
      return `Based on current tech hiring trends in 2026, building these 2 projects will boost your call-back rate:
• **AI Multi-Agent Task Orchestrator** (Tech: TypeScript, Node.js, WebSockets, Docker)
• **Real-Time Analytics Dashboard** (Tech: Go/Python, Kafka, ClickHouse, React)`;
    }

    if (q.includes('interview') || q.includes('question')) {
      return `Top 3 interview questions for your profile:
1. *"How do you handle data consistency in distributed systems under high load?"*
2. *"Walk me through a time you optimized a slow query or API endpoint."*
3. *"How do you approach designing scalable microservice APIs?"*`;
    }

    return `Great question! Focus on highlighting measurable impact on your resume, matching target job keywords, and having 2-3 standout GitHub projects with live demose. Would you like me to analyze a specific section?`;
  }
};
