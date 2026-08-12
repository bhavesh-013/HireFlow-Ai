/**
 * HireFlow Section Reorder Engine
 * Detects career stage and recommends optimal ATS section ordering.
 */
import type { ParsedResumeData, ResumeType, SectionNavItem } from '../types';

export type CareerStage = 'fresher' | 'experienced' | 'senior';

export interface SectionOrderRecommendation {
  stage: CareerStage;
  stageLabel: string;
  currentOrder: string[];
  recommendedOrder: string[];
  isOptimal: boolean;
  reason: string;
}

export const FRESHER_ORDER = ['header', 'summary', 'education', 'skills', 'projects', 'experience', 'achievements', 'certificates'];
export const EXPERIENCED_ORDER = ['header', 'summary', 'experience', 'projects', 'achievements', 'education', 'skills'];
const SENIOR_ORDER = EXPERIENCED_ORDER;

/**
 * Builds the default Section Navigator items for a resume, given the
 * user's explicit Fresher / Experienced choice (see types.ResumeType).
 * Reuses FRESHER_ORDER / EXPERIENCED_ORDER above rather than a second copy.
 *
 * For Fresher resumes, "experience" (used for internships) starts hidden
 * — per the "don't force empty sections" rule — but stays in the
 * navigator so the user can turn it on with one click if they've had an
 * internship. Every other native section stays visible; empty ones are
 * simply not rendered in the final one-page output.
 */
export function getDefaultSectionItems(resumeType: ResumeType): SectionNavItem[] {
  const order = resumeType === 'fresher' ? FRESHER_ORDER : EXPERIENCED_ORDER;

  const titleFor: Record<string, string> = {
    header: 'Personal',
    summary: 'Summary',
    education: 'Education',
    skills: 'Skills',
    projects: 'Projects',
    experience: resumeType === 'fresher' ? 'Internships / Experience' : 'Experience',
    certificates: 'Certificates',
    achievements: 'Achievements',
  };
  const typeFor: Record<string, SectionNavItem['type']> = {
    header: 'personal',
    summary: 'summary',
    education: 'education',
    skills: 'skills',
    projects: 'projects',
    experience: 'experience',
    certificates: 'certificates',
    achievements: 'achievements',
  };

  const items: SectionNavItem[] = order.map((key, idx) => ({
    id: typeFor[key],
    title: titleFor[key],
    type: typeFor[key],
    visible: resumeType === 'fresher' && key === 'experience' ? false : true,
    num: String(idx + 1).padStart(2, '0'),
  }));

  items.push({
    id: 'styling',
    title: 'Font & Layout',
    type: 'styling',
    visible: true,
    num: String(items.length + 1).padStart(2, '0'),
  });

  return items;
}

export function detectCareerStage(resumeData: ParsedResumeData): CareerStage {
  const title = (resumeData.personalInfo?.jobTitle || '').toLowerCase();
  const targetRole = (resumeData.targetRole || '').toLowerCase();
  const combinedTitle = `${title} ${targetRole}`;

  const expCount = resumeData.experiences?.length ?? 0;
  const totalBullets = (resumeData.experiences || []).reduce((acc, e) => acc + (e.bullets?.length ?? 0), 0);
  const hasSubstantialExp = totalBullets >= 4 && expCount >= 2;

  // If title indicates senior/lead/architect, classify as senior
  if (/\b(senior|lead|principal|staff|director|head|vp|architect)\b/.test(combinedTitle)) {
    return 'senior';
  }

  // If years of experience mentioned in summary indicates senior
  const summary = (resumeData.personalInfo?.summary || '').toLowerCase();
  if (/\b([5-9]|\d{2})\+?\s*years?\b/.test(summary)) {
    return 'senior';
  }

  if (hasSubstantialExp || expCount >= 2) return 'experienced';
  return 'fresher';
}

/** Collapses the 3-way CareerStage heuristic down to the 2-way explicit
 * ResumeType choice, for suggesting a default when importing (upload /
 * GitHub) — the user can always change it afterward. */
export function suggestResumeType(resumeData: ParsedResumeData): ResumeType {
  return detectCareerStage(resumeData) === 'fresher' ? 'fresher' : 'experienced';
}

export function getRecommendedSectionOrder(resumeData: ParsedResumeData): SectionOrderRecommendation {
  const stage = detectCareerStage(resumeData);

  const stageLabels: Record<CareerStage, string> = {
    fresher: 'Entry Level',
    experienced: 'Mid Level',
    senior: 'Senior / Lead',
  };

  const recommendedOrders: Record<CareerStage, string[]> = {
    fresher: FRESHER_ORDER,
    experienced: EXPERIENCED_ORDER,
    senior: SENIOR_ORDER,
  };

  const stageReasons: Record<CareerStage, string> = {
    fresher: 'For Entry Level candidates, Skills and Projects appear before Experience to highlight capabilities over work history.',
    experienced: 'For Mid Level candidates, Experience leads after Summary to immediately showcase work history to ATS parsers.',
    senior: 'For Senior / Lead roles, Experience and Skills lead to demonstrate depth and leadership early in the resume.',
  };

  // Detect current order from sections presence
  const currentOrder: string[] = [];
  if (resumeData.personalInfo?.fullName) currentOrder.push('header');
  if (resumeData.personalInfo?.summary) currentOrder.push('summary');
  if (resumeData.experiences?.length) currentOrder.push('experience');
  if (resumeData.projects?.length) currentOrder.push('projects');
  if (resumeData.skills) currentOrder.push('skills');
  if (resumeData.education?.length) currentOrder.push('education');
  if (resumeData.certificates?.length) currentOrder.push('certificates');

  const recommended = recommendedOrders[stage];
  const filteredRecommended = recommended.filter(s => currentOrder.includes(s));

  // Check if current order matches recommended (for present sections)
  const isOptimal = JSON.stringify(currentOrder.filter(s => filteredRecommended.includes(s))) === JSON.stringify(filteredRecommended);

  return {
    stage,
    stageLabel: stageLabels[stage],
    currentOrder,
    recommendedOrder: filteredRecommended,
    isOptimal,
    reason: stageReasons[stage],
  };
}
