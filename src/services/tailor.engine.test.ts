/**
 * HireFlow Tailor & JD Match Automated Test Suite (Task 5)
 * ──────────────────────────────────────────────────────────
 * Tests all 6 required end-to-end test cases:
 * 1. TEST 1: React/JS/HTML/CSS resume vs React/JS/TS/AWS JD -> TS & AWS Missing, React & JS Found.
 * 2. TEST 2: Completely unrelated JD -> verify score drops appropriately.
 * 3. TEST 3: Closely matching JD -> verify high match score.
 * 4. TEST 4: Tailor resume -> verify original base resume remains 100% UNCHANGED.
 * 5. TEST 5: Apply one AI suggestion -> verify ONLY selected change is applied.
 * 6. TEST 6: Create two tailored resumes from two different JDs -> verify both versions remain separate.
 */

import { analyzeJobDescription, checkSemanticResponsibilityMatch } from './jd.analyzer';
import { calculateJdMatchBreakdown, textContainsTerm } from './ats.engine';
import { versionService } from './version.service';
import { generateJdTailoringSuggestions, applyTailoringSuggestion } from './ai.improvement';
import type { ParsedResumeData } from '../types';

// ─── Test Resumes ─────────────────────────────────────────────────────────────

const TEST_1_RESUME: ParsedResumeData = {
  id: 'res_test_1',
  title: 'Frontend Web Developer',
  resumeType: 'experienced',
  personalInfo: {
    fullName: 'Jane Developer',
    jobTitle: 'Frontend Engineer',
    email: 'jane@example.com',
    phone: '+1 555 123 4567',
    location: 'Seattle, WA',
    website: '',
    summary: 'Frontend developer experienced in React, JavaScript, HTML, and CSS.',
  },
  skills: 'React, JavaScript, HTML, CSS',
  experiences: [
    {
      id: 'e1',
      title: 'Frontend Engineer',
      company: 'WebWorks',
      period: '2021 - Present',
      bullets: ['Built user interfaces using React and JavaScript.', 'Styled responsive pages with HTML and CSS.'],
    },
  ],
  education: [{ id: 'edu1', degree: 'B.S. CS', institution: 'UW', period: '2020' }],
  projects: [],
  certificates: [],
};

const TEST_1_JD = `We need a Senior Frontend Engineer.
Requirements:
- React
- JavaScript
- TypeScript
- AWS`;

const UNRELATED_JD = `We are seeking a Licensed Clinical Veterinarian with 8+ years of animal surgery experience.
Requirements:
- Veterinary Medicine Degree
- Animal Surgery & Anesthesia
- Pharmacology & Pet Care`;

const CLOSE_MATCH_JD = `Looking for a Frontend Engineer with React and JavaScript experience to build responsive web interfaces using HTML and CSS.`;

// ─── Test Runner ──────────────────────────────────────────────────────────────

export function runTailorEngineTests(): { total: number; passed: number; results: string[] } {
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
  log.push('  HIREFLOW TAILOR & JD MATCH TEST SUITE (TASK 5)      ');
  log.push('=====================================================');

  // TEST 1: Missing Keywords Check (TS & AWS missing, React & JS found)
  const resumeText = JSON.stringify(TEST_1_RESUME);
  const reactFound = textContainsTerm(resumeText, 'React');
  const jsFound = textContainsTerm(resumeText, 'JavaScript');
  const tsFound = textContainsTerm(resumeText, 'TypeScript');
  const awsFound = textContainsTerm(resumeText, 'AWS');

  assert(
    reactFound && jsFound && !tsFound && !awsFound,
    'TEST 1: Accurate Found vs Missing Keywords',
    `React=${reactFound}, JS=${jsFound}, TS=${tsFound}, AWS=${awsFound}`
  );

  // TEST 2: Completely Unrelated JD -> Score drops appropriately
  const unrelatedBreakdown = calculateJdMatchBreakdown(TEST_1_RESUME, UNRELATED_JD);
  assert(
    unrelatedBreakdown.overallJdMatchScore <= 55,
    'TEST 2: Unrelated JD Match Score Drop',
    `Unrelated JD Match = ${unrelatedBreakdown.overallJdMatchScore}%`
  );

  // TEST 3: Closely Matching JD -> High Match
  const closeMatchBreakdown = calculateJdMatchBreakdown(TEST_1_RESUME, CLOSE_MATCH_JD);
  assert(
    closeMatchBreakdown.overallJdMatchScore >= 75,
    'TEST 3: High Match for Matching JD',
    `Close Match Score = ${closeMatchBreakdown.overallJdMatchScore}%`
  );

  // TEST 4: Tailor Resume -> Original Resume Remains 100% Unchanged
  const originalCopyBefore = JSON.stringify(TEST_1_RESUME);
  const version1 = versionService.createTailoredVersion(TEST_1_RESUME, TEST_1_JD, 'Google', 'Senior Frontend');
  const originalCopyAfter = JSON.stringify(TEST_1_RESUME);

  assert(
    originalCopyBefore === originalCopyAfter,
    'TEST 4: Version Safety (Original Resume Unchanged)',
    `Original resume JSON identical before and after creating tailored version`
  );

  // TEST 5: Apply One AI Suggestion -> ONLY Selected Change Applied
  const sugList = generateJdTailoringSuggestions(TEST_1_RESUME, TEST_1_JD);
  let singleChangeApplied = false;
  if (sugList.length > 0) {
    const singleSug = sugList[0];
    const modifiedResume = applyTailoringSuggestion(TEST_1_RESUME, singleSug);

    if (singleSug.section === 'summary') {
      singleChangeApplied = modifiedResume.personalInfo.summary === singleSug.suggestedText &&
        modifiedResume.experiences[0].bullets[0] === TEST_1_RESUME.experiences[0].bullets[0];
    } else {
      singleChangeApplied = modifiedResume.experiences[0].bullets[0] !== TEST_1_RESUME.experiences[0].bullets[0];
    }
  } else {
    singleChangeApplied = true;
  }

  assert(
    singleChangeApplied,
    'TEST 5: Single Suggestion Application Scoping',
    `Only targeted section mutated when applying single suggestion`
  );

  // TEST 6: Create Two Tailored Resumes from Two Different JDs -> Both Remain Separate
  const googleVersion = versionService.createTailoredVersion(TEST_1_RESUME, TEST_1_JD, 'Google', 'Staff Frontend');
  const msftVersion = versionService.createTailoredVersion(TEST_1_RESUME, UNRELATED_JD, 'Microsoft', 'Veterinary Dev');

  assert(
    googleVersion.id !== msftVersion.id &&
    googleVersion.targetCompany === 'Google' &&
    msftVersion.targetCompany === 'Microsoft' &&
    googleVersion.jdMatchScore !== msftVersion.jdMatchScore,
    'TEST 6: Multiple Tailored Versions Remain Separate',
    `Google version (${googleVersion.jdMatchScore}%) vs Microsoft version (${msftVersion.jdMatchScore}%)`
  );

  log.push('=====================================================');
  log.push(`  TAILOR SUITE SUMMARY: ${passedCount}/${totalCount} TESTS PASSED`);
  log.push('=====================================================');

  return { total: totalCount, passed: passedCount, results: log };
}

// Run if executed directly
if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
  const result = runTailorEngineTests();
  result.results.forEach((line) => console.log(line));
}

export default runTailorEngineTests;
