/**
 * HireFlow ATS Engine Automated Test Suite
 * ──────────────────────────────────────────
 * Tests all 11 required scenarios specified in Task 4:
 * 1. Excellent resume
 * 2. Weak resume
 * 3. Fresher resume
 * 4. Experienced resume
 * 5. Resume without email
 * 6. Resume without skills
 * 7. Resume with formatting problems
 * 8. Resume with duplicate skills
 * 9. Resume with weak bullets
 * 10. Resume with JD
 * 11. Resume without JD
 *
 * Verifies:
 * - Determinism: Same input evaluated multiple times returns exact same score.
 * - Accuracy: Rule changes strictly dictate score changes.
 * - Normalization: Term equivalence (React == React.js == ReactJS).
 */

import { analyzeResume, normalizeTerm, areTermsEquivalent } from './ats.engine';
import type { ParsedResumeData } from '../types';

// ─── Test Sample Resumes ──────────────────────────────────────────────────────

const EXCELLENT_RESUME: ParsedResumeData = {
  resumeType: 'experienced',
  personalInfo: {
    fullName: 'Jane Doe',
    jobTitle: 'Senior Software Engineer',
    email: 'jane.doe@example.com',
    phone: '+1 (555) 123-4567',
    location: 'San Francisco, CA',
    website: 'https://janedoe.dev',
    linkedin: 'https://linkedin.com/in/janedoe',
    github: 'https://github.com/janedoe',
    summary: 'Results-driven Senior Software Engineer with 7+ years of experience designing scalable microservices, high-throughput React web applications, and cloud architecture.',
  },
  skills: 'Languages: TypeScript, JavaScript, Python | Frameworks: React, Next.js, Express | Databases: PostgreSQL, Redis | DevOps: Docker, Kubernetes, AWS',
  experiences: [
    {
      id: 'exp1',
      title: 'Senior Software Engineer',
      company: 'TechCorp Solutions',
      period: '2021 - Present',
      bullets: [
        'Architected high-throughput React SPA using Zustand state management for 150k monthly active users.',
        'Engineered microservices in Node.js and TypeScript, reducing API response latency by 35%.',
        'Automated CI/CD pipelines using GitHub Actions and Docker, achieving 99.9% deployment uptime.',
      ],
    },
    {
      id: 'exp2',
      title: 'Software Engineer',
      company: 'DataFlow Inc',
      period: '2018 - 2021',
      bullets: [
        'Developed REST APIs in Python and PostgreSQL serving 500k daily requests.',
        'Optimized database queries, reducing query execution time by 40%.',
      ],
    },
  ],
  education: [
    {
      id: 'edu1',
      degree: 'B.S. in Computer Science',
      institution: 'Stanford University',
      period: '2014 - 2018',
    },
  ],
  projects: [
    {
      id: 'proj1',
      title: 'Open Source Cloud Monitor',
      description: 'Distributed monitoring tool built with Go and React.',
      techStack: ['Go', 'React', 'Docker'],
      bullets: ['Scaled monitoring system to handle 10k metric points per second.'],
    },
  ],
  certificates: [
    { id: 'c1', title: 'AWS Certified Solutions Architect', issuer: 'Amazon Web Services', date: '2022' },
  ],
};

const WEAK_RESUME: ParsedResumeData = {
  resumeType: 'experienced',
  personalInfo: {
    fullName: 'J',
    jobTitle: '',
    email: '',
    phone: '',
    location: '',
    website: '',
    summary: 'I did some coding and worked on things.',
  },
  skills: '',
  experiences: [
    {
      id: 'e1',
      title: '',
      company: '',
      period: '',
      bullets: ['worked on code', 'helped team'],
    },
  ],
  education: [],
  projects: [],
  certificates: [],
};

const FRESHER_RESUME: ParsedResumeData = {
  resumeType: 'fresher',
  personalInfo: {
    fullName: 'Alex Student',
    jobTitle: 'Graduate Software Developer',
    email: 'alex.student@university.edu',
    phone: '+1 (555) 987-6543',
    location: 'Boston, MA',
    website: '',
    linkedin: 'https://linkedin.com/in/alexstudent',
    github: 'https://github.com/alexstudent',
    summary: 'Enthusiastic Computer Science graduate with strong foundational knowledge in React, Data Structures, and Python.',
  },
  skills: 'Languages: JavaScript, Python, C++ | Web: React, HTML, CSS | Tools: Git, VS Code',
  experiences: [],
  education: [
    {
      id: 'edu1',
      degree: 'B.S. in Computer Science',
      institution: 'MIT',
      period: '2020 - 2024',
    },
  ],
  projects: [
    {
      id: 'proj1',
      title: 'Smart Campus Event Finder',
      description: 'Full-stack web application built for university events.',
      techStack: ['React', 'Node.js', 'MongoDB'],
      bullets: [
        'Built responsive web frontend in React serving 2,500 active university students.',
        'Implemented authentication using JWT tokens and Node.js backend.',
      ],
    },
    {
      id: 'proj2',
      title: 'Algorithm Visualizer',
      description: 'Interactive sorting algorithm visualizer.',
      techStack: ['JavaScript', 'HTML5', 'CSS3'],
      bullets: ['Designed interactive visualizer for 8 sorting algorithms.'],
    },
  ],
  certificates: [],
};

const TEST_JD = `We are looking for a Senior Full Stack Engineer with 5+ years of experience.
Requirements:
- Strong experience with React, TypeScript, and Node.js
- Proficiency with PostgreSQL and Redis caching
- Experience with Docker, Kubernetes, and AWS Cloud
- Experience writing Jest unit tests`;

// ─── Test Runner ──────────────────────────────────────────────────────────────

export function runAtsEngineTests(): { total: number; passed: number; results: string[] } {
  const log: string[] = [];
  let passedCount = 0;
  let totalCount = 0;

  const assert = (condition: boolean, testName: string, detail?: string) => {
    totalCount++;
    if (condition) {
      passedCount++;
      log.push(`✅ [PASS] ${testName}${detail ? ` (${detail})` : ''}`);
    } else {
      log.push(`❌ [FAIL] ${testName}${detail ? ` (${detail})` : ''}`);
    }
  };

  log.push('=====================================================');
  log.push('  HIREFLOW ATS ENGINE AUTOMATED TEST SUITE (11 CASES) ');
  log.push('=====================================================');

  // Test Case 1: Excellent Resume
  const r1 = analyzeResume(EXCELLENT_RESUME);
  assert(r1.finalScore >= 80, 'Test 1: Excellent Resume', `Score = ${r1.finalScore}/100`);

  // Test Case 2: Weak Resume
  const r2 = analyzeResume(WEAK_RESUME);
  assert(r2.finalScore <= 50, 'Test 2: Weak Resume', `Score = ${r2.finalScore}/100`);

  // Test Case 3: Fresher Resume (Not penalized for zero work experience)
  const r3 = analyzeResume(FRESHER_RESUME);
  assert(r3.finalScore >= 65, 'Test 3: Fresher Resume', `Score = ${r3.finalScore}/100`);

  // Test Case 4: Experienced Resume
  const r4 = analyzeResume(EXCELLENT_RESUME);
  assert(r4.finalScore >= 80, 'Test 4: Experienced Resume', `Score = ${r4.finalScore}/100`);

  // Test Case 5: Resume without Email
  const noEmailResume: ParsedResumeData = {
    ...EXCELLENT_RESUME,
    personalInfo: { ...EXCELLENT_RESUME.personalInfo, email: '' },
  };
  const r5 = analyzeResume(noEmailResume);
  const emailRulePassed = r5.ruleResults.find(r => r.id === 'contact_email')?.passed;
  assert(!emailRulePassed && r5.finalScore < r1.finalScore, 'Test 5: Resume without Email', `Score dropped from ${r1.finalScore} to ${r5.finalScore}`);

  // Test Case 6: Resume without Skills
  const noSkillsResume: ParsedResumeData = { ...EXCELLENT_RESUME, skills: '' };
  const r6 = analyzeResume(noSkillsResume);
  const skillsRulePassed = r6.ruleResults.find(r => r.id === 'skills_presence_count')?.passed;
  assert(!skillsRulePassed && r6.finalScore < r1.finalScore, 'Test 6: Resume without Skills', `Score dropped from ${r1.finalScore} to ${r6.finalScore}`);

  // Test Case 7: Resume with Formatting Problems
  const formatProbResume: ParsedResumeData = {
    ...EXCELLENT_RESUME,
    personalInfo: { ...EXCELLENT_RESUME.personalInfo, fullName: 'Jane 🚀 Doe' },
    skills: 'table column textbox layout',
  };
  const r7 = analyzeResume(formatProbResume);
  assert(r7.finalScore < r1.finalScore, 'Test 7: Resume with Formatting Problems', `Score = ${r7.finalScore}/100`);

  // Test Case 8: Resume with Duplicate Skills
  const dupSkillsResume: ParsedResumeData = {
    ...EXCELLENT_RESUME,
    skills: 'React, React.js, ReactJS, TypeScript, TS, Node.js, NodeJS',
  };
  const r8 = analyzeResume(dupSkillsResume);
  const dupRule = r8.ruleResults.find(r => r.id === 'skills_duplication');
  assert(!dupRule?.passed, 'Test 8: Resume with Duplicate Skills', `Dup rule passed = ${dupRule?.passed}`);

  // Test Case 9: Resume with Weak Bullets
  const weakBulletsResume: ParsedResumeData = {
    ...EXCELLENT_RESUME,
    experiences: [
      {
        id: 'e1',
        title: 'Developer',
        company: 'Corp',
        period: '2020 - 2022',
        bullets: ['Worked on React code.', 'Helped with bug fixes.', 'Assisted team.'],
      },
    ],
  };
  const r9 = analyzeResume(weakBulletsResume);
  const verbRule = r9.ruleResults.find(r => r.id === 'exp_action_verbs');
  assert(r9.finalScore < r1.finalScore && verbRule?.score! < 4, 'Test 9: Resume with Weak Bullets', `Verb score = ${verbRule?.score}/4`);

  // Test Case 10: Resume with JD (JD Match Score calculated separately)
  const r10 = analyzeResume(EXCELLENT_RESUME, { jobDescription: TEST_JD });
  assert(
    r10.jdMatchBreakdown !== undefined &&
    r10.jdMatchBreakdown.overallJdMatchScore > 0 &&
    r10.finalScore > 0,
    'Test 10: Resume with JD',
    `General ATS = ${r10.finalScore}/100, JD Match = ${r10.jdMatchBreakdown?.overallJdMatchScore}%`
  );

  // Test Case 11: Resume without JD
  const r11 = analyzeResume(EXCELLENT_RESUME);
  assert(r11.jdMatchBreakdown === undefined, 'Test 11: Resume without JD', `JD Match Breakdown is undefined as expected`);

  // ─── Verification: Same Input -> Same Score (100% Deterministic) ────────────
  const runA = analyzeResume(EXCELLENT_RESUME, { jobDescription: TEST_JD });
  const runB = analyzeResume(EXCELLENT_RESUME, { jobDescription: TEST_JD });
  const runC = analyzeResume(EXCELLENT_RESUME, { jobDescription: TEST_JD });
  const isDeterministic = runA.finalScore === runB.finalScore && runB.finalScore === runC.finalScore;

  assert(isDeterministic, 'Verification: 100% Determinism', `Runs: ${runA.finalScore} -> ${runB.finalScore} -> ${runC.finalScore}`);

  // ─── Verification: Term Normalization ───────────────────────────────────────
  const norm1 = areTermsEquivalent('React.js', 'ReactJS');
  const norm2 = areTermsEquivalent('JS', 'JavaScript');
  const norm3 = areTermsEquivalent('PostgreSQL', 'Postgres');
  assert(norm1 && norm2 && norm3, 'Verification: Term Normalization Engine', `React.js==ReactJS (${norm1}), JS==JavaScript (${norm2}), PostgreSQL==Postgres (${norm3})`);

  log.push('=====================================================');
  log.push(`  TEST SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
  log.push('=====================================================');

  return { total: totalCount, passed: passedCount, results: log };
}

// Run if executed directly
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  const result = runAtsEngineTests();
  result.results.forEach(line => console.log(line));
}

export default runAtsEngineTests;
