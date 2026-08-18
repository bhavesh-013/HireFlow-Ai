import type { ParsedResumeData, SectionNavItem } from '../types';

export const EXPERIENCED_DEFAULT_SECTIONS: SectionNavItem[] = [
  { id: 'personal', title: 'Personal Information', type: 'personal', visible: true, num: '01' },
  { id: 'summary', title: 'Summary', type: 'summary', visible: true, num: '02' },
  { id: 'experience', title: 'Work Experience', type: 'experience', visible: true, num: '03' },
  { id: 'projects', title: 'Projects', type: 'projects', visible: true, num: '04' },
  { id: 'achievements', title: 'Achievements', type: 'achievements', visible: true, num: '05' },
  { id: 'education', title: 'Education', type: 'education', visible: true, num: '06' },
  { id: 'skills', title: 'Skills', type: 'skills', visible: true, num: '07' },
  { id: 'certificates', title: 'Certifications', type: 'certificates', visible: true, num: '08' },
  { id: 'styling', title: 'Font & Layout', type: 'styling', visible: true, num: '09' },
];

export const EXPERIENCED_DEFAULT_RESUME: ParsedResumeData = {
  title: 'Akash_Meruva_Experienced_Resume.pdf',
  targetRole: 'Software Development Engineer',
  templateName: 'ATS Professional',
  importSource: 'scratch',
  resumeType: 'experienced',
  resumeStyling: {
    fontFamily: 'Georgia, serif',
    primaryColor: '#000000',
    accentColor: '#000000',
    textColor: '#111827',
    backgroundColor: '#FFFFFF',
    fontSize: 'normal',
    lineHeight: 'normal',
    sectionSpacing: 'normal',
  },
  sectionsOrder: EXPERIENCED_DEFAULT_SECTIONS,
  personalInfo: {
    fullName: 'Akash Meruva',
    jobTitle: 'Software Development Engineer',
    email: 'akash.meruva2003@gmail.com',
    phone: '+91 8247540461',
    location: 'Bangalore, Karnataka, India',
    github: 'akashmeruva9',
    linkedin: 'akash-meruva-ab1420222',
    summary:
      'Innovative Software Development Engineer with extensive experience building autonomous AI workflows, multi-agent systems, and scalable backend platforms saving human hours and infrastructure cost.',
  },
  experiences: [
    {
      id: 'exp_1',
      title: 'Software Development Engineer',
      company: 'Autodesk',
      period: '07/2025 – present',
      location: 'Remote – Bangalore, Karnataka, India',
      bullets: [
        'Built SAOMA, an AI workflow that autonomously maintains and self-remediates 15+ servers behind Storebox, Autodesk’s desktop build lifecycle and management platform, saving $20,400 /year and 75 hours/month.',
        'Designed and developed StoreboxAI, a Hierarchical Multi-Agent ChatAgent of 10 agents in Slack for real-time Filer insights and health monitoring, cutting daily monitoring from 6 to 1 hour and saving $25,200 /year.',
        'Built observability, business dashboards, and agentic testing & evaluation frameworks for DNSQ, StoreboxAI, and SAOMA, surfacing CSAT, Accuracy, cost savings, and human hours saved.',
      ],
    },
    {
      id: 'exp_2',
      title: 'Software Development Engineer Intern',
      company: 'Autodesk',
      period: '01/2025 – 06/2025',
      location: 'On-Site – Bangalore, Karnataka, India',
      bullets: [
        'Built DNSQ, an AI agent for DNS operations using 13 tools and RAG (GPT-5.5, ChromaDB, AWS) in Slack and a DNS web portal, cutting request processing time by 75% and saving $20,000/year.',
        'DNSQ delivers scalable end-to-end CRUD across 50,000+ resource records in 920+ DNS zones, enabling efficient and reliable DNS management at enterprise scale across Autodesk.',
      ],
    },
    {
      id: 'exp_3',
      title: 'Mentor',
      company: 'Google Summer Of Code',
      period: '03/2025 – 08/2025',
      location: 'Remote',
      bullets: [
        'Mentored GSOC contributors building biometric and face-based authentication across Android, iOS, macOS, Windows, and Linux for the Mifos Passcode Library, a Compose Multiplatform library.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj_exp_1',
      title: 'Sahayak Agent & UCXP Protocol',
      link: 'https://github.com',
      demoUrl: 'https://live-demo.com',
      period: '',
      bullets: [
        'Built Sahayak Agent and the UCXP Protocol, a manifest-driven platform where businesses onboard via JSON manifests and are served across chat, voice, WhatsApp, web, and Android with zero custom code.',
        'Architected a LangGraph-based UCXP Runtime on Sarvam AI (STT, LLM, TTS, translation), deployed on Railway/Vercel with Shopify and Sarvam Samvaad voice support.',
      ],
    },
  ],
  achievements: [
    {
      id: 'ach_exp_1',
      title: "2nd Place at Sarvam AI Epoch Buildathon'26",
      description: '220+ teams, 3000+ builders winning a prize of Rs. 1 lakh.',
    },
    {
      id: 'ach_exp_2',
      title: 'Winner in the National Smart India Hackathon 2024',
      description: 'PS - 1747 securing a prize of 1 lakh rupees.',
    },
    {
      id: 'ach_exp_3',
      title: 'Winner in 5+ hackathons',
      description: "Sarvam Buildathon'26, SIH'24, Coindcx Unfold'23, IndianOil Hackathon'23, etc.",
    },
    {
      id: 'ach_exp_4',
      title: 'Published a Research Paper',
      description: 'based on Real-Time Object Detection with AI - ML at IEEE.',
    },
    {
      id: 'ach_exp_5',
      title: 'DSA - CP Ranks',
      description: 'Codeforces Specialist (1434), CodeChef 3-Star (1601), LeetCode (1644).',
    },
  ],
  education: [
    {
      id: 'edu_exp_1',
      degree: 'B.Tech in Computer Science – AI & ML',
      institution: 'SRM University, AP.',
      period: '09/2021 – 06/2025',
      gpa: 'Grade: 8.54/10',
    },
    {
      id: 'edu_exp_2',
      degree: 'Class 12 in P.C.M',
      institution: 'Pandit Junior College',
      period: '07/2019 – 07/2021',
      gpa: 'Grade: 92.6%',
    },
    {
      id: 'edu_exp_3',
      degree: 'Class 10 in C.B.S.E',
      institution: 'Sri Sathya Sai Vidya Vihar School',
      period: '05/2018 – 05/2019',
      gpa: 'Grade: 86.0%',
    },
  ],
  skills: `Languages : C, C++, Python.
Agentic AI : LangGraph, LangChain, RAG, Guardrails, ADLC, Agent Security, Prompt Engineering, AI Observability.
AI Tools : Claude Code, Cursor, Crew AI, Retool.
Cloud : AWS Lambda, CloudFormation, DynamoDB, Docker, API Gateway, Websockets.
Android : Android Studio, Kotlin, Jetpack Compose, Compose Multiplatform, MVVM, etc.
Course Work : Data Structures and Algorithms, Artificial Intelligence, Machine Learning, Data Base Management Systems, Computer Networks, Operating Systems, Object-Oriented Programming & Software Engineering.`,
  certificates: [],
  customSections: [],
};
