export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  membership: string;
  avatar: string;
  location: string;
  phone: string;
  bio: string;
  github: string;
  linkedin: string;
  website: string;
  resumePreferences: {
    targetRole: string;
    industry: string;
    experienceLevel: string;
    autoSave: boolean;
    aiEnhanceOnExport: boolean;
  };
}

export interface ResumeItem {
  id: string;
  title: string;
  targetRole: string;
  lastModified: string;
  updatedAt: string;
  atsScore: number;
  healthScore: number;
  tailorScore: number;
  templateName: string;
  fileSize: string;
  status: 'Published' | 'Draft' | 'Tailored';
  version: string;
}

export interface ResumeTemplate {
  id: string;
  name: string;
  category: 'Tech' | 'Design' | 'Executive' | 'Minimal' | 'Academic' | 'Creative';
  rating: number;
  downloads: number;
  badge?: string;
  description: string;
  previewImage: string;
  isFavorite: boolean;
}

export interface ATSIssue {
  id: string;
  type: 'critical' | 'warning' | 'info';
  category: 'Formatting' | 'Keywords' | 'Skills' | 'Projects' | 'Readability';
  message: string;
  solution: string;
}

export interface AISuggestion {
  id: string;
  category: 'Summary' | 'Skills' | 'Experience' | 'Projects' | 'Achievements';
  originalText: string;
  suggestedText: string;
  impactScore: '+14% ATS' | '+18% Impact' | '+22% Clarity' | '+10% Keyword Match';
  confidence: 'High' | 'Medium';
  rationale: string;
  applied: boolean;
}

export interface JDMatchResult {
  jobTitle: string;
  company: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  keywordDensity: { keyword: string; countInJD: number; countInResume: number }[];
  recommendations: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'score' | 'suggestion' | 'template' | 'system';
}

export const mockUser: UserProfile = {
  id: 'usr_01',
  name: 'Alex Kumar',
  email: 'alex.kumar@hireflow.ai',
  role: 'Senior Frontend Engineer',
  membership: 'Pro Member',
  avatar: 'AK',
  location: 'San Francisco, CA',
  phone: '+1 (555) 382-9011',
  bio: 'Product-focused Senior Frontend Engineer with 6+ years of experience building scalable web apps with React, TypeScript, and modern UI systems.',
  github: 'https://github.com/alexkumar-dev',
  linkedin: 'https://linkedin.com/in/alexkumar-dev',
  website: 'https://alexkumar.dev',
  resumePreferences: {
    targetRole: 'Senior Frontend / Fullstack Engineer',
    industry: 'Technology & SaaS',
    experienceLevel: 'Senior (5-8 years)',
    autoSave: true,
    aiEnhanceOnExport: true,
  },
};

export const mockResumes: ResumeItem[] = [
  {
    id: 'res_01',
    title: 'Senior Frontend Engineer.pdf',
    targetRole: 'Senior Frontend Engineer',
    lastModified: '2h ago',
    updatedAt: '2026-07-30T06:30:00Z',
    atsScore: 88,
    healthScore: 92,
    tailorScore: 74,
    templateName: 'Modern Technical',
    fileSize: '184 KB',
    status: 'Published',
    version: 'v3.2',
  },
  {
    id: 'res_02',
    title: 'Product Designer — Stripe.pdf',
    targetRole: 'Lead UI/UX Designer',
    lastModified: 'yesterday',
    updatedAt: '2026-07-29T14:20:00Z',
    atsScore: 81,
    healthScore: 85,
    tailorScore: 66,
    templateName: 'Minimal Executive',
    fileSize: '210 KB',
    status: 'Tailored',
    version: 'v2.1',
  },
  {
    id: 'res_03',
    title: 'Full Stack Engineer — General.pdf',
    targetRole: 'Full Stack Engineer',
    lastModified: '3 days ago',
    updatedAt: '2026-07-27T09:15:00Z',
    atsScore: 79,
    healthScore: 84,
    tailorScore: 70,
    templateName: 'Clean Serif',
    fileSize: '162 KB',
    status: 'Draft',
    version: 'v1.4',
  },
  {
    id: 'res_04',
    title: 'Staff Software Architect.pdf',
    targetRole: 'Staff Software Engineer',
    lastModified: '5 days ago',
    updatedAt: '2026-07-25T11:45:00Z',
    atsScore: 91,
    healthScore: 95,
    tailorScore: 88,
    templateName: 'Enterprise Dark',
    fileSize: '198 KB',
    status: 'Published',
    version: 'v4.0',
  },
  {
    id: 'res_05',
    title: 'AI Product Lead — Tech Startup.pdf',
    targetRole: 'AI Product Specialist',
    lastModified: '1 week ago',
    updatedAt: '2026-07-22T16:00:00Z',
    atsScore: 73,
    healthScore: 78,
    tailorScore: 82,
    templateName: 'Creative Tech',
    fileSize: '220 KB',
    status: 'Tailored',
    version: 'v1.0',
  },
  {
    id: 'res_06',
    title: 'Frontend Tech Lead.pdf',
    targetRole: 'Engineering Manager',
    lastModified: '2 weeks ago',
    updatedAt: '2026-07-15T10:30:00Z',
    atsScore: 85,
    healthScore: 89,
    tailorScore: 79,
    templateName: 'Executive Bold',
    fileSize: '175 KB',
    status: 'Published',
    version: 'v2.0',
  },
  {
    id: 'res_07',
    title: 'React Native Developer.pdf',
    targetRole: 'Mobile Engineer',
    lastModified: '3 weeks ago',
    updatedAt: '2026-07-08T08:10:00Z',
    atsScore: 77,
    healthScore: 80,
    tailorScore: 68,
    templateName: 'Compact Mobile',
    fileSize: '155 KB',
    status: 'Draft',
    version: 'v1.1',
  },
];

export const mockTemplates: ResumeTemplate[] = [
  {
    id: 'tmpl_01',
    name: 'Modern Tech Stack',
    category: 'Tech',
    rating: 4.9,
    downloads: 14200,
    badge: 'Popular',
    description: 'Clean two-column technical format optimized for software engineers & tech leads.',
    previewImage: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600&auto=format&fit=crop&q=80',
    isFavorite: true,
  },
  {
    id: 'tmpl_02',
    name: 'Silicon Valley Executive',
    category: 'Executive',
    rating: 4.8,
    downloads: 9800,
    badge: 'ATS Approved',
    description: 'High-impact layout with emphasis on leadership outcomes and quantified metric metrics.',
    previewImage: 'https://images.unsplash.com/photo-1512295767273-ac109ac3acfa?w=600&auto=format&fit=crop&q=80',
    isFavorite: false,
  },
  {
    id: 'tmpl_03',
    name: 'Minimalist Clean',
    category: 'Minimal',
    rating: 4.9,
    downloads: 18500,
    badge: 'Top Pick',
    description: 'Single-column scannable format with high readability score for traditional corporate ATS.',
    previewImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
    isFavorite: true,
  },
  {
    id: 'tmpl_04',
    name: 'Creative Product Designer',
    category: 'Design',
    rating: 4.7,
    downloads: 8300,
    badge: 'New',
    description: 'Sleek portfolio-oriented typography layout tailored for UI/UX & Product Designers.',
    previewImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=600&auto=format&fit=crop&q=80',
    isFavorite: false,
  },
  {
    id: 'tmpl_05',
    name: 'Academic Scholar',
    category: 'Academic',
    rating: 4.6,
    downloads: 5400,
    description: 'Extended multi-page formatting suitable for research positions, publications, and grants.',
    previewImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80',
    isFavorite: false,
  },
  {
    id: 'tmpl_06',
    name: 'Startup Founder & Lead',
    category: 'Creative',
    rating: 4.8,
    downloads: 11200,
    badge: 'Trending',
    description: 'Bold header typography with highlight boxes for venture achievements & key growth numbers.',
    previewImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&auto=format&fit=crop&q=80',
    isFavorite: true,
  },
];

export const mockATSScores = {
  overall: 76,
  status: 'Passes major ATS',
  breakdown: [
    { name: 'Formatting & Layout', score: 92, target: 100, status: 'Excellent' },
    { name: 'Keyword Optimization', score: 68, target: 100, status: 'Needs Improvement' },
    { name: 'Technical Skills Alignment', score: 84, target: 100, status: 'Good' },
    { name: 'Project Metric Impact', score: 71, target: 100, status: 'Average' },
    { name: 'Readability & Grammar', score: 95, target: 100, status: 'Excellent' },
  ],
  issues: [
    {
      id: 'iss_1',
      type: 'warning',
      category: 'Keywords',
      message: 'Missing essential target keyword "GraphQL & Next.js" in work experience bullets.',
      solution: 'Add GraphQL query performance optimization experience under Senior Frontend role.',
    },
    {
      id: 'iss_2',
      type: 'critical',
      category: 'Formatting',
      message: 'Non-standard header tag found in Education section ("Deg. & Inst.").',
      solution: 'Rename section title to standard "Education" to ensure ATS parser accuracy.',
    },
    {
      id: 'iss_3',
      type: 'info',
      category: 'Readability',
      message: '3 bullet points exceed the recommended length of 25 words per line.',
      solution: 'Split complex accomplishment statements into concise single-line bullet statements.',
    },
  ] as ATSIssue[],
};

export const mockAISuggestions: AISuggestion[] = [
  {
    id: 'sug_1',
    category: 'Experience',
    originalText: 'Built the front end application using React and handled state management.',
    suggestedText: 'Architected high-throughput React SPA utilizing Zustand state management, lowering initial load latency by 38% for 120k monthly active users.',
    impactScore: '+18% Impact',
    confidence: 'High',
    rationale: 'Includes quantifiable performance metrics and specific modern architecture keywords.',
    applied: false,
  },
  {
    id: 'sug_2',
    category: 'Summary',
    originalText: 'Experienced frontend developer looking for a challenging engineering role.',
    suggestedText: 'Results-driven Senior Frontend Engineer with 6+ years specializing in React, TypeScript, and micro-frontends, delivering 99.9% uptime UI systems for fintech platforms.',
    impactScore: '+14% ATS',
    confidence: 'High',
    rationale: 'Replaces generic introductory text with specialized domain authority and years of experience.',
    applied: true,
  },
  {
    id: 'sug_3',
    category: 'Skills',
    originalText: 'JavaScript, React, CSS, HTML, Webpack, Git',
    suggestedText: 'TypeScript, React 18, Next.js, Tailwind CSS, Redux Toolkit, Webpack/Vite, Web Vitals Optimization, CI/CD, Jest & Playwright',
    impactScore: '+22% Clarity',
    confidence: 'High',
    rationale: 'Grouped technical skills into modern industry standard tooling and testing frameworks.',
    applied: false,
  },
  {
    id: 'sug_4',
    category: 'Projects',
    originalText: 'Created a collaborative dashboard with real-time analytics for client users.',
    suggestedText: 'Engineered real-time analytics dashboard with WebSockets and D3.js visualization, reducing query render times by 450ms across 10k concurrent streams.',
    impactScore: '+10% Keyword Match',
    confidence: 'Medium',
    rationale: 'Highlights real-time streaming technology stack and measurable response latency reductions.',
    applied: false,
  },
];

export const mockJDMatch: JDMatchResult = {
  jobTitle: 'Senior Frontend Engineer (Design Systems & Performance)',
  company: 'Stripe Inc.',
  matchScore: 68,
  matchedSkills: ['React', 'TypeScript', 'Tailwind CSS', 'Vite', 'REST API', 'Unit Testing', 'CI/CD'],
  missingSkills: ['GraphQL', 'A11y (WCAG 2.1)', 'Framer Motion', 'Micro-Frontends', 'Performance Profiling'],
  keywordDensity: [
    { keyword: 'React 18', countInJD: 6, countInResume: 4 },
    { keyword: 'TypeScript', countInJD: 8, countInResume: 7 },
    { keyword: 'GraphQL', countInJD: 5, countInResume: 0 },
    { keyword: 'Design System', countInJD: 7, countInResume: 2 },
    { keyword: 'Web Vitals', countInJD: 4, countInResume: 1 },
  ],
  recommendations: [
    'Add mention of WCAG accessibility standards compliance in your component library experience.',
    'Highlight experience with GraphQL query caching or Apollo Client.',
    'Include performance metrics showing how you optimized Core Web Vitals (LCP, CLS, INP).',
  ],
};

export const mockCoachMessages: ChatMessage[] = [
  {
    id: 'msg_1',
    sender: 'ai',
    text: "Hello Alex! I'm your HireFlow AI Career Coach. I've analyzed your Senior Frontend Engineer resume. How can I assist your job search strategy today?",
    timestamp: '10:00 AM',
  },
  {
    id: 'msg_2',
    sender: 'user',
    text: "How can I improve my ATS match score for Senior Frontend positions at tier-1 tech companies?",
    timestamp: '10:02 AM',
  },
  {
    id: 'msg_3',
    sender: 'ai',
    text: "Great question! Here are 3 targeted improvements based on your latest scan:\n\n1. **Quantify Frontend Performance**: Add precise numbers like *'reduced bundle size by 35%'* or *'improved LCP from 2.8s to 1.1s'*\n2. **Include Micro-Frontend / State Architecture**: Mention Zustand, Redux Toolkit, or Module Federation keywords.\n3. **Strengthen Bullet Verbs**: Replace *'Worked on'* or *'Helped build'* with action verbs like *'Engineered'*, *'Architected'*, and *'Spearheaded'*.",
    timestamp: '10:03 AM',
  },
];

export const mockNotifications: NotificationItem[] = [
  {
    id: 'notif_1',
    title: 'ATS Report Completed',
    message: 'Your "Senior Frontend Engineer.pdf" achieved an 88% ATS Score.',
    timestamp: '10 min ago',
    read: false,
    type: 'score',
  },
  {
    id: 'notif_2',
    title: 'New AI Suggestions Available',
    message: '4 new action-verb bullet enhancements ready for review.',
    timestamp: '1 hour ago',
    read: false,
    type: 'suggestion',
  },
  {
    id: 'notif_3',
    title: 'Template Updated',
    message: 'Silicon Valley Executive template got updated with ATS v4 compatibility.',
    timestamp: 'Yesterday',
    read: true,
    type: 'template',
  },
];

export const mockUploadHistory = [
  {
    id: 'upl_01',
    fileName: 'Alex_Kumar_Senior_Engineer_2026.pdf',
    fileSize: '2.4 MB',
    fileType: 'pdf' as const,
    uploadedAt: 'Today at 2:15 PM',
    status: 'Parsed' as const,
    parsedResume: {
      title: 'Alex_Kumar_Senior_Engineer_2026.pdf',
      targetRole: 'Senior Frontend Engineer',
      templateName: 'Modern Tech Stack',
      importSource: 'upload' as const,
      personalInfo: {
        fullName: 'Alex Kumar',
        jobTitle: 'Senior Frontend Engineer',
        email: 'alex.kumar@hireflow.ai',
        phone: '+1 (555) 382-9011',
        location: 'San Francisco, CA',
        website: 'https://alexkumar.dev',
        github: 'https://github.com/alexkumar-dev',
        linkedin: 'https://linkedin.com/in/alexkumar-dev',
        summary: 'Product-focused Senior Frontend Engineer with 6+ years of experience architecting high-performance React applications, design systems, and modern web architectures.',
      },
      experiences: [
        {
          id: 'exp_u1',
          title: 'Senior Frontend Engineer',
          company: 'Vercel / Tech Corp',
          period: '2023 - Present',
          location: 'San Francisco, CA',
          bullets: [
            'Architected high-throughput React SPA utilizing Zustand state management, lowering initial load latency by 38% for 120k monthly active users.',
            'Engineered reusable design system component library adopted by 14 cross-functional engineering pods.',
            'Mentored 5 junior frontend developers and established automated Web Vitals performance benchmarks in CI/CD.',
          ],
        },
        {
          id: 'exp_u2',
          title: 'Frontend Developer',
          company: 'Scale AI',
          period: '2020 - 2023',
          location: 'Remote',
          bullets: [
            'Built real-time data annotation canvas using TypeScript and HTML5 Canvas API handling 50k+ nodes without frame drops.',
            'Optimized GraphQL query caching, resulting in a 250ms speedup in search index results.',
          ],
        },
      ],
      education: [
        {
          id: 'edu_u1',
          degree: 'B.S. in Computer Science & Engineering',
          institution: 'University of California, Berkeley',
          period: '2016 - 2020',
          location: 'Berkeley, CA',
          gpa: '3.88 / 4.00',
          highlights: 'Dean’s Honor List, Specialization in Distributed Systems & Web Technologies',
        },
      ],
      skills: 'React 18, TypeScript, Next.js, Tailwind CSS, Redux Toolkit, Webpack, Vite, Web Vitals, GraphQL, Jest, Playwright, Node.js, Git',
      projects: [
        {
          id: 'proj_u1',
          title: 'HireFlow AI Workspace',
          description: 'AI-assisted resume builder and ATS analyzer platform for tech candidates.',
          techStack: ['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express'],
          link: 'https://github.com/alexkumar-dev/hireflow-ai',
          stars: 480,
          bullets: [
            'Implemented custom document parsing pipeline converting PDF/DOCX into structured ATS JSON objects.',
            'Designed real-time keyword matching algorithm scoring candidate alignment against target job descriptions.',
          ],
        },
      ],
      certificates: [
        {
          id: 'cert_u1',
          title: 'AWS Certified Solutions Architect',
          issuer: 'Amazon Web Services',
          date: '2024',
          link: 'https://aws.amazon.com/verification',
        },
      ],
    },
  },
  {
    id: 'upl_02',
    fileName: 'FullStack_Architect_Draft_V2.docx',
    fileSize: '1.1 MB',
    fileType: 'docx' as const,
    uploadedAt: 'Yesterday at 4:40 PM',
    status: 'Parsed' as const,
    parsedResume: {
      title: 'FullStack_Architect_Draft_V2.docx',
      targetRole: 'Staff Full Stack Engineer',
      templateName: 'Silicon Valley Executive',
      importSource: 'upload' as const,
      personalInfo: {
        fullName: 'Alex Kumar',
        jobTitle: 'Staff Full Stack Engineer',
        email: 'alex.kumar@hireflow.ai',
        phone: '+1 (555) 382-9011',
        location: 'San Francisco, CA',
        website: 'https://alexkumar.dev',
        github: 'https://github.com/alexkumar-dev',
        linkedin: 'https://linkedin.com/in/alexkumar-dev',
        summary: 'Staff Software Engineer with deep expertise in scalable cloud microservices, React UI frameworks, and high-frequency PostgreSQL data stores.',
      },
      experiences: [
        {
          id: 'exp_u3',
          title: 'Staff Engineer',
          company: 'Cloud Scale Systems',
          period: '2022 - Present',
          location: 'San Francisco, CA',
          bullets: [
            'Led microservices backend refactor serving 4.2 million requests/day with 99.99% operational uptime.',
            'Reduced AWS infrastructure expenditures by $120k annually through automated container autoscaling.',
          ],
        },
      ],
      education: [
        {
          id: 'edu_u2',
          degree: 'B.S. in Computer Science',
          institution: 'UC Berkeley',
          period: '2016 - 2020',
        },
      ],
      skills: 'TypeScript, React, Node.js, PostgreSQL, Docker, AWS, Kubernetes, Redis, System Design',
      projects: [],
      certificates: [],
    },
  },
];

export const mockGithubRepos: GitHubRepoItem[] = [
  {
    id: 'gh_1',
    name: 'hireflow-ai-workspace',
    description: 'AI-powered resume creation platform with ATS keyword scoring & PDF parsing pipeline.',
    stars: 840,
    forks: 142,
    language: 'TypeScript',
    topics: ['react', 'typescript', 'tailwind', 'gemini-ai', 'express', 'pdf-parser', 'docker', 'postgresql'],
    updatedAt: '2 days ago',
    url: 'https://github.com/alexkumar-dev/hireflow-ai-workspace',
    selected: true,
    packageJsonDeps: ['react', 'react-dom', 'express', 'tailwindcss', '@google/genai', 'pdf-parse', 'jest', 'vite', 'pg', 'zod'],
    readmeSnippet: '# HireFlow AI Workspace\nFull-stack ATS resume optimization engine with real-time scoring. Deployed on Vercel with Dockerized Express backend and PostgreSQL data store.',
    dependencyFiles: ['package.json', 'README.md', 'Dockerfile', 'drizzle.config.ts', '.github/workflows/ci.yml'],
    extractedTech: {
      languages: ['TypeScript', 'JavaScript', 'HTML5/CSS3'],
      frameworks: ['React 18', 'Next.js', 'Express.js', 'Tailwind CSS'],
      libraries: ['Zustand', 'Lucide React', 'PDF-Parse', 'Zod'],
      databases: ['PostgreSQL', 'Redis'],
      devops: ['Docker', 'GitHub Actions', 'CI/CD'],
      cloud: ['Vercel', 'AWS Cloud Run'],
      apis: ['Gemini AI API', 'REST API'],
      testing: ['Jest', 'Vitest'],
      buildTools: ['Vite', 'npm', 'ESLint'],
    },
    generatedTitle: 'HireFlow AI Workspace',
    generatedDescription: 'AI-assisted resume builder and ATS keyword scoring engine built with React 18, Express, and Gemini AI.',
    generatedBullets: [
      'Architected high-throughput full-stack resume platform using React 18, TypeScript, and Express serving 120k+ monthly active requests.',
      'Integrated Google Gemini AI API to extract target keywords and auto-score candidate resumes with sub-300ms latency.',
      'Configured containerized Docker environment and GitHub Actions CI/CD pipeline deploying automatically to Vercel and Cloud Run.',
    ],
  },
  {
    id: 'gh_2',
    name: 'react-canvas-graph-engine',
    description: 'High performance 60fps HTML5 Canvas graph rendering library for complex node visualization.',
    stars: 1250,
    forks: 210,
    language: 'TypeScript',
    topics: ['canvas-api', 'react', 'webgl', 'performance', 'data-viz', 'cypress', 'react-native'],
    updatedAt: '1 week ago',
    url: 'https://github.com/alexkumar-dev/react-canvas-graph-engine',
    selected: true,
    packageJsonDeps: ['react', 'typescript', 'three', 'd3-force', 'cypress', 'rollup'],
    readmeSnippet: '# React Canvas Graph Engine\n60 FPS interactive node graph visualizer written in TypeScript using HTML5 Canvas 2D & WebGL hardware acceleration.',
    dependencyFiles: ['package.json', 'README.md', 'tsconfig.json', 'rollup.config.js'],
    extractedTech: {
      languages: ['TypeScript', 'JavaScript'],
      frameworks: ['React 18', 'React Native'],
      libraries: ['HTML5 Canvas API', 'WebGL', 'D3.js', 'Three.js'],
      databases: [],
      devops: ['GitHub Actions'],
      cloud: ['Cloudflare Pages'],
      apis: ['Canvas 2D API', 'DOM Matrix API'],
      testing: ['Cypress', 'Jest'],
      buildTools: ['Rollup', 'TypeScript Compiler'],
    },
    generatedTitle: 'React Canvas Graph Engine',
    generatedDescription: '60fps HTML5 Canvas graph rendering library for complex node visualization and interactive diagrams.',
    generatedBullets: [
      'Engineered open-source 60fps graph layout engine utilizing HTML5 Canvas 2D and WebGL acceleration, accumulating 1,250+ GitHub stars.',
      'Optimized matrix math spatial indexing algorithm handling 50,000+ interactive SVG/Canvas nodes without frame drops.',
      'Published npm package with zero external dependencies and 98% Cypress E2E test coverage across modern browsers.',
    ],
  },
  {
    id: 'gh_3',
    name: 'nextjs-enterprise-boilerplate',
    description: 'Production-ready Next.js 14 template with Tailwind CSS, Zustand, and automated Playwright E2E suite.',
    stars: 620,
    forks: 88,
    language: 'TypeScript',
    topics: ['nextjs', 'react18', 'zustand', 'playwright', 'pwa', 'terraform', 'aws'],
    updatedAt: '2 weeks ago',
    url: 'https://github.com/alexkumar-dev/nextjs-enterprise-boilerplate',
    selected: true,
    packageJsonDeps: ['next', 'react', 'zustand', 'tailwindcss', '@playwright/test', 'prisma', 'next-auth'],
    readmeSnippet: '# Next.js Enterprise Boilerplate\nModular full-stack starter template featuring Next.js App Router, Prisma ORM, NextAuth, and Terraform AWS deployment scripts.',
    dependencyFiles: ['package.json', 'README.md', 'prisma/schema.prisma', 'main.tf', 'playwright.config.ts'],
    extractedTech: {
      languages: ['TypeScript', 'HCL (Terraform)'],
      frameworks: ['Next.js 14', 'React 18', 'Tailwind CSS'],
      libraries: ['Zustand', 'Prisma ORM', 'NextAuth.js'],
      databases: ['PostgreSQL', 'SQLite'],
      devops: ['Terraform', 'Docker', 'GitHub Actions'],
      cloud: ['AWS (ECS / S3)', 'Vercel'],
      apis: ['Next.js App Router API', 'OAuth 2.0'],
      testing: ['Playwright', 'Vitest'],
      buildTools: ['SWC', 'npm', 'pnpm'],
    },
    generatedTitle: 'Next.js Enterprise Starter',
    generatedDescription: 'Production-ready Next.js 14 template with Tailwind CSS, Zustand, Prisma ORM, and automated Playwright E2E suite.',
    generatedBullets: [
      'Designed modular Next.js 14 App Router starter stack adopted by 800+ developers for enterprise web projects.',
      'Implemented robust authentication pipeline using NextAuth.js, OAuth 2.0, and Prisma ORM backed by PostgreSQL.',
      'Automated end-to-end testing with Playwright and codified cloud infrastructure using HashiCorp Terraform scripts.',
    ],
  },
  {
    id: 'gh_4',
    name: 'graphql-mesh-caching-proxy',
    description: 'Ultra-fast GraphQL proxy layer with automatic Redis query caching and sub-10ms response latency.',
    stars: 340,
    forks: 45,
    language: 'Node.js',
    topics: ['graphql', 'redis', 'express', 'microservices', 'kubernetes', 'gcp'],
    updatedAt: '1 month ago',
    url: 'https://github.com/alexkumar-dev/graphql-mesh-caching-proxy',
    selected: false,
    packageJsonDeps: ['express', 'graphql', 'ioredis', 'apollo-server-express', 'winston'],
    readmeSnippet: '# GraphQL Mesh Caching Proxy\nMicroservice proxy for schema stitching and sub-10ms Redis caching across legacy REST endpoints. Deployed on Google Kubernetes Engine.',
    dependencyFiles: ['package.json', 'README.md', 'k8s/deployment.yaml', 'Dockerfile'],
    extractedTech: {
      languages: ['JavaScript', 'Node.js'],
      frameworks: ['Express.js', 'Apollo Server'],
      libraries: ['GraphQL', 'ioRedis', 'Winston'],
      databases: ['Redis'],
      devops: ['Kubernetes (GKE)', 'Docker', 'Nginx'],
      cloud: ['Google Cloud Platform (GCP)'],
      apis: ['GraphQL API', 'REST API Proxy'],
      testing: ['Jest'],
      buildTools: ['npm'],
    },
    generatedTitle: 'GraphQL Mesh Caching Proxy',
    generatedDescription: 'Ultra-fast GraphQL proxy layer with automatic Redis query caching and sub-10ms response latency.',
    generatedBullets: [
      'Engineered sub-10ms GraphQL middleware layer proxying high-volume microservices requests with Redis memory caching.',
      'Implemented schema stitching and rate-limiting policies protecting downstream database instances during traffic surges.',
      'Deployed production workloads on Google Kubernetes Engine (GKE) with automated Horizontal Pod Autoscaling (HPA).',
    ],
  },
  {
    id: 'gh_5',
    name: 'ats-keyword-matcher-cli',
    description: 'CLI tool to calculate TF-IDF keyword overlap between technical job specs and candidate resumes.',
    stars: 290,
    forks: 32,
    language: 'Python',
    topics: ['nlp', 'ats-resume', 'python', 'cli-tool', 'pytorch', 'scikit-learn'],
    updatedAt: '2 months ago',
    url: 'https://github.com/alexkumar-dev/ats-keyword-matcher-cli',
    selected: false,
    packageJsonDeps: ['spacy', 'scikit-learn', 'torch', 'click', 'rich'],
    readmeSnippet: '# ATS Keyword Matcher CLI\nCommand-line tool utilizing Natural Language Processing (TF-IDF & Cosine Similarity) to analyze resume keyword alignment.',
    dependencyFiles: ['requirements.txt', 'README.md', 'pyproject.toml'],
    extractedTech: {
      languages: ['Python'],
      frameworks: ['PyTorch', 'Click'],
      libraries: ['Scikit-Learn', 'SpaCy', 'NumPy', 'Rich'],
      databases: [],
      devops: ['GitHub Actions'],
      cloud: [],
      apis: ['OpenAI API'],
      testing: ['PyTest'],
      buildTools: ['Pip', 'Poetry'],
    },
    generatedTitle: 'ATS Keyword Matcher CLI',
    generatedDescription: 'Command-line tool utilizing NLP and TF-IDF cosine similarity to analyze technical resume alignment.',
    generatedBullets: [
      'Developed Python CLI utility using SpaCy and Scikit-Learn to evaluate semantic alignment between resumes and job specifications.',
      'Implemented vector TF-IDF scoring algorithm processing multi-page documents in under 150ms.',
      'Packaged open-source CLI with PyTest suite and automated release workflows via GitHub Actions.',
    ],
  },
];

export const mockLinkedInProfileData = {
  fullName: 'Alex Kumar',
  headline: 'Senior Frontend Engineer | React & TypeScript Specialist | Ex-Scale AI',
  summary: 'Passionate Senior Frontend Engineer with 6+ years of experience delivering robust web applications, design systems, and frontend architecture. Skilled in scaling frontend pipelines and mentoring engineers.',
  experiences: [
    {
      id: 'exp_li1',
      title: 'Senior Frontend Engineer',
      company: 'Vercel / Tech Corp',
      period: 'Jan 2023 - Present',
      location: 'San Francisco, CA',
      bullets: [
        'Architected high-throughput React SPA utilizing Zustand state management, lowering initial load latency by 38% for 120k monthly active users.',
        'Engineered reusable design system component library adopted by 14 cross-functional engineering pods.',
        'Mentored 5 junior frontend developers and established automated Web Vitals performance benchmarks in CI/CD.',
      ],
    },
    {
      id: 'exp_li2',
      title: 'Frontend Developer',
      company: 'Scale AI',
      period: 'Mar 2020 - Dec 2022',
      location: 'San Francisco, CA',
      bullets: [
        'Built real-time data annotation canvas using TypeScript and HTML5 Canvas API handling 50k+ nodes without frame drops.',
        'Optimized GraphQL query caching, resulting in a 250ms speedup in search index results.',
      ],
    },
  ],
  education: [
    {
      id: 'edu_li1',
      degree: 'Bachelor of Science (B.S.), Computer Science',
      institution: 'University of California, Berkeley',
      period: '2016 - 2020',
      location: 'Berkeley, CA',
      gpa: '3.88 GPA',
      highlights: 'Relevant Coursework: Data Structures, Algorithms, UI Design, Distributed Systems',
    },
  ],
  skills: 'React, TypeScript, Next.js, JavaScript (ES6+), HTML5/CSS3, Tailwind CSS, GraphQL, Redux Toolkit, Webpack, Vite, Jest, CI/CD, Git',
  certifications: [
    {
      id: 'cert_li1',
      title: 'Meta Certified Professional Frontend Developer',
      issuer: 'Meta',
      date: 'Issued Nov 2023',
    },
  ],
};

