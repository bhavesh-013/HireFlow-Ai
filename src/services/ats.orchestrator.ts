/**
 * Master ATS Live Optimization & Job Description Orchestrator
 * ─────────────────────────────────────────────────────────────
 * Coordinates the full analysis and optimization lifecycle:
 * JD → JD Analysis → Resume Analysis → ATS Matching → Optimization → Before/After Comparison
 */

import type { ParsedResumeData } from '../types';
import { parseJobDescription, ParsedJobDescription } from './jd.parser';
import { analyzeKeywords, KeywordAnalysisResult } from './keyword.matcher';
import { analyzeSkillGaps, SkillGapAnalysisResult } from './skill.matcher';
import { analyzeProjects, ProjectAnalysisResult } from './project.analyzer';
import { analyzeExperiences, ExperienceAnalysisResult } from './experience.analyzer';
import { analyzeResumeStructure, StructureAnalysisResult } from './structure.analyzer';
import { computeComprehensiveAtsScores, DetailedAtsScoreBreakdown } from './ats.scoring';
import { generateOptimizedResume, OptimizedResumePackage } from './resume.optimizer';
import { generateResumeDiff, FullResumeDiffReport } from './diff.generator';

export interface FullAtsOptimizationResult {
  parsedJd: ParsedJobDescription;
  keywordAnalysis: KeywordAnalysisResult;
  skillGapAnalysis: SkillGapAnalysisResult;
  projectAnalysis: ProjectAnalysisResult;
  experienceAnalysis: ExperienceAnalysisResult;
  structureAnalysis: StructureAnalysisResult;
  scoringBreakdown: DetailedAtsScoreBreakdown;
  optimizedPackage: OptimizedResumePackage;
  diffReport: FullResumeDiffReport;
  timestamp: string;
}

export type ProgressCallback = (stepText: string, progressPercent: number) => void;

/**
 * Runs the live ATS analysis and optimization pipeline with asynchronous step progression.
 */
export async function runAtsLiveOptimization(
  resume: ParsedResumeData,
  jdText: string,
  onProgress?: ProgressCallback
): Promise<FullAtsOptimizationResult> {
  const update = (text: string, percent: number) => {
    if (onProgress) onProgress(text, percent);
  };

  // Step 1: Parse Job Description
  update('Analyzing Job Description...', 14);
  await new Promise((r) => setTimeout(r, 120));
  const parsedJd = parseJobDescription(jdText);

  // Step 2: Extract Requirements
  update('Extracting role requirements & skills...', 28);
  await new Promise((r) => setTimeout(r, 120));
  const keywordAnalysis = analyzeKeywords(resume, parsedJd);
  const skillGapAnalysis = analyzeSkillGaps(resume, parsedJd);

  // Step 3: Analyze Resume Structure
  update('Auditing resume structure & formatting...', 42);
  await new Promise((r) => setTimeout(r, 120));
  const structureAnalysis = analyzeResumeStructure(resume);

  // Step 4: Analyze Projects & Experience
  update('Matching keywords & evaluating experience bullets...', 58);
  await new Promise((r) => setTimeout(r, 120));
  const projectAnalysis = analyzeProjects(resume, parsedJd);
  const experienceAnalysis = analyzeExperiences(resume, parsedJd);

  // Step 5: Generate Optimization
  update('Generating optimized resume content & STAR bullets...', 74);
  await new Promise((r) => setTimeout(r, 140));
  const optimizedPackage = generateOptimizedResume(
    resume,
    parsedJd,
    keywordAnalysis,
    projectAnalysis,
    experienceAnalysis
  );

  // Step 6: Diff Generation
  update('Generating visual diff comparison...', 88);
  await new Promise((r) => setTimeout(r, 100));
  const diffReport = generateResumeDiff(resume, optimizedPackage.optimizedResume);

  // Step 7: Final ATS Scoring
  update('Calculating final ATS before/after score...', 100);
  await new Promise((r) => setTimeout(r, 100));
  const scoringBreakdown = computeComprehensiveAtsScores(
    resume,
    parsedJd,
    keywordAnalysis,
    skillGapAnalysis,
    projectAnalysis,
    experienceAnalysis,
    structureAnalysis
  );

  return {
    parsedJd,
    keywordAnalysis,
    skillGapAnalysis,
    projectAnalysis,
    experienceAnalysis,
    structureAnalysis,
    scoringBreakdown,
    optimizedPackage,
    diffReport,
    timestamp: new Date().toISOString(),
  };
}

export default runAtsLiveOptimization;
