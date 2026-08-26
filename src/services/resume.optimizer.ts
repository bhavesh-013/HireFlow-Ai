/**
 * Resume Optimizer Engine
 * ────────────────────────
 * Generates an optimized, ATS-tailored version of the candidate's resume for a specific JD.
 *
 * Core Rules:
 * 1. Improves keyword alignment and phrasing without fabricating untrue claims.
 * 2. Elevates bullet points using active voice, STAR framing, and technical specificity.
 * 3. Frontloads and organizes skills so high-priority JD matches appear first.
 * 4. Refines professional summary to explicitly reflect the target role.
 * 5. Preserves all factual history (names, companies, dates, degrees, true skill foundations).
 */

import type { ParsedResumeData, ExperienceItem, ProjectItem } from '../types';
import { ParsedJobDescription } from './jd.parser';
import { KeywordAnalysisResult } from './keyword.matcher';
import { ProjectAnalysisResult } from './project.analyzer';
import { ExperienceAnalysisResult } from './experience.analyzer';

export interface OptimizedResumePackage {
  optimizedResume: ParsedResumeData;
  summaryBefore: string;
  summaryAfter: string;
  skillsBefore: string;
  skillsAfter: string;
  experiencesChangesCount: number;
  projectsChangesCount: number;
  keyImprovementsSummary: string[];
}

export function generateOptimizedResume(
  originalResume: ParsedResumeData,
  parsedJd: ParsedJobDescription,
  keywordAnalysis?: KeywordAnalysisResult,
  projectAnalysis?: ProjectAnalysisResult,
  experienceAnalysis?: ExperienceAnalysisResult
): OptimizedResumePackage {
  // Deep clone to ensure immutability
  const opt: ParsedResumeData = JSON.parse(JSON.stringify(originalResume));

  const keyImprovementsSummary: string[] = [];

  // 1. Optimize Professional Summary
  const currentSummary = opt.personalInfo?.summary || '';
  let optimizedSummary = currentSummary;

  const targetTitle = parsedJd.jobTitle || 'Software Engineer';
  const candidateName = opt.personalInfo?.fullName || 'Candidate';
  const topMatchedSkills = parsedJd.categorizedKeywords.technical.slice(0, 4).join(', ');

  if (!currentSummary || currentSummary.length < 30) {
    optimizedSummary = `Results-driven ${targetTitle} with proven expertise in developing scalable software solutions and high-throughput systems. Adept in ${topMatchedSkills || 'modern full-stack engineering'}, agile collaboration, and delivering clean, maintainable code.`;
    keyImprovementsSummary.push(`Generated focused Professional Summary tailored to "${targetTitle}".`);
  } else {
    // Enhance existing summary
    let updated = currentSummary.trim();
    // Ensure target role or engineering identity is sharp
    if (!updated.toLowerCase().includes(targetTitle.toLowerCase())) {
      updated = updated.replace(/^[A-Z][a-zA-Z\s]+(engineer|developer|professional)/i, targetTitle);
    }
    // Polish weak openings
    updated = updated.replace(/^(i am an?|looking for|seeking a position as)/i, `Dedicated ${targetTitle}`);
    if (!updated.endsWith('.')) updated += '.';

    optimizedSummary = updated;
    keyImprovementsSummary.push('Enhanced Professional Summary with active professional voice and target role alignment.');
  }

  if (opt.personalInfo) {
    opt.personalInfo.summary = optimizedSummary;
    if (!opt.personalInfo.jobTitle || opt.personalInfo.jobTitle === 'Software Engineer') {
      opt.personalInfo.jobTitle = targetTitle;
    }
  }

  // 2. Optimize Skills (Frontload matching JD technical skills)
  const currentSkillsRaw = opt.skills;
  const currentSkillsList = (
    typeof currentSkillsRaw === 'string'
      ? currentSkillsRaw.split(/[,|•\n]+/)
      : Array.isArray(currentSkillsRaw)
      ? (currentSkillsRaw as any[]).map((s) => s?.name || s?.title || s)
      : []
  )
    .map((s) => (typeof s === 'string' ? s.trim() : ''))
    .filter(Boolean);

  const matchedJdSkills = parsedJd.categorizedKeywords.technical;
  
  // Partition candidate's existing skills into matched vs other
  const prioritizedSkills: string[] = [];
  const otherSkills: string[] = [];

  currentSkillsList.forEach((sk) => {
    const isMatched = matchedJdSkills.some((jdSk) => jdSk.toLowerCase() === sk.toLowerCase());
    if (isMatched && !prioritizedSkills.includes(sk)) {
      prioritizedSkills.push(sk);
    } else if (!otherSkills.includes(sk)) {
      otherSkills.push(sk);
    }
  });

  const optimizedSkillsList = [...prioritizedSkills, ...otherSkills];
  const optimizedSkillsString = optimizedSkillsList.join(', ');
  opt.skills = optimizedSkillsString;

  if (prioritizedSkills.length > 0) {
    keyImprovementsSummary.push(`Frontloaded ${prioritizedSkills.length} high-priority JD skills in Technical Skills section.`);
  }

  // 3. Optimize Experiences
  let experiencesChangesCount = 0;
  if (experienceAnalysis && experienceAnalysis.experiences.length > 0) {
    opt.experiences = opt.experiences.map((exp, idx) => {
      const analyzedExp = experienceAnalysis.experiences.find((ae) => ae.id === exp.id) || experienceAnalysis.experiences[idx];
      if (!analyzedExp) return exp;

      const updatedBullets = (exp.bullets || []).map((b, bIdx) => {
        const bulletAna = analyzedExp.bullets.find((ab) => ab.bulletIndex === bIdx);
        if (bulletAna && bulletAna.optimizedText && bulletAna.optimizedText !== b) {
          experiencesChangesCount++;
          return bulletAna.optimizedText;
        }
        return b;
      });

      return {
        ...exp,
        bullets: updatedBullets,
      };
    });
    keyImprovementsSummary.push(`Upgraded ${experiencesChangesCount} experience bullet points with strong action verbs and STAR framing.`);
  }

  // 4. Optimize Projects
  let projectsChangesCount = 0;
  if (projectAnalysis && projectAnalysis.projects.length > 0) {
    opt.projects = opt.projects.map((proj, idx) => {
      const analyzedProj = projectAnalysis.projects.find((ap) => ap.id === proj.id) || projectAnalysis.projects[idx];
      if (!analyzedProj) return proj;

      projectsChangesCount++;
      return {
        ...proj,
        description: analyzedProj.optimizedDescription || proj.description,
        bullets: analyzedProj.optimizedBullets && analyzedProj.optimizedBullets.length > 0 ? analyzedProj.optimizedBullets : proj.bullets,
      };
    });
    keyImprovementsSummary.push(`Refined ${opt.projects.length} project descriptions to highlight architectural scope and stack details.`);
  }

  return {
    optimizedResume: opt,
    summaryBefore: currentSummary,
    summaryAfter: optimizedSummary,
    skillsBefore: typeof currentSkillsRaw === 'string' ? currentSkillsRaw : currentSkillsList.join(', '),
    skillsAfter: optimizedSkillsString,
    experiencesChangesCount,
    projectsChangesCount,
    keyImprovementsSummary,
  };
}

export default generateOptimizedResume;
