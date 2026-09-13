export interface JDRequirements {
  requiredSkills: string[];
  preferredSkills: string[];
  keywords: string[];
}

export interface ResumeFacts {
  skills: string[];
  keywords: string[];
  sections: string[];
  projectsCount: number;
  projectsWithMetrics: number;
  experienceBullets: number;
  experienceBulletsWithMetrics: number;
  hasActionVerbs: boolean;
  formattingScore: number;
}

export interface ATSRecommendation {
  text: string;
  priority: 'High' | 'Medium' | 'Low';
}

export interface ATSResult {
  overallScore: number;
  breakdown: {
    keywords: number;
    skills: number;
    experience: number;
    projects: number;
    education: number;
    structure: number;
    formatting: number;
  };
  matchedKeywords: string[];
  missingKeywords: {
    keyword: string;
    importance: 'High' | 'Medium' | 'Low';
    reason: string;
    recommendedLocation?: string;
  }[];
  matchedSkills: string[];
  missingSkills: {
    skill: string;
    required: boolean;
  }[];
  sectionIssues: string[];
  formattingIssues: string[];
  recommendations: ATSRecommendation[];
}

// Token normalization: e.g., "React.js" -> "react", "Node.js" -> "node"
function normalizeToken(token: string): string {
  return token.toLowerCase()
    .replace(/\\.js$/, '')
    .replace(/[^a-z0-9+#]/g, '');
}

export function calculateDeterministicScore(resume: ResumeFacts, jd: JDRequirements | null): ATSResult {
  const recommendations: ATSRecommendation[] = [];
  const sectionIssues: string[] = [];
  const formattingIssues: string[] = [];

  const normalizedResumeSkills = new Set(resume.skills.map(normalizeToken));
  const normalizedResumeKeywords = new Set(resume.keywords.map(normalizeToken));

  // --- 1. SKILLS SCORING (25%) ---
  let skillScore = 0;
  const matchedSkills: string[] = [];
  const missingSkills: { skill: string; required: boolean }[] = [];

  if (jd) {
    let requiredEarned = 0;
    let preferredEarned = 0;

    jd.requiredSkills.forEach(skill => {
      if (normalizedResumeSkills.has(normalizeToken(skill))) {
        matchedSkills.push(skill);
        requiredEarned += 1;
      } else {
        missingSkills.push({ skill, required: true });
        recommendations.push({
          text: `Missing required skill: ${skill}. Add it if you have experience with it.`,
          priority: 'High'
        });
      }
    });

    jd.preferredSkills.forEach(skill => {
      if (normalizedResumeSkills.has(normalizeToken(skill))) {
        matchedSkills.push(skill);
        preferredEarned += 1;
      } else {
        missingSkills.push({ skill, required: false });
      }
    });

    const reqTotal = jd.requiredSkills.length;
    const prefTotal = jd.preferredSkills.length;

    // Weight Required skills at 80%, Preferred at 20%
    const reqScore = reqTotal > 0 ? (requiredEarned / reqTotal) * 80 : 80;
    const prefScore = prefTotal > 0 ? (preferredEarned / prefTotal) * 20 : 20;

    skillScore = reqScore + prefScore;
    if (reqTotal === 0 && prefTotal === 0) skillScore = 100;

  } else {
    // If no JD, score purely on having a good number of skills
    skillScore = Math.min(100, resume.skills.length * 10);
  }

  // --- 2. KEYWORDS SCORING (25%) ---
  let keywordScore = 0;
  const matchedKeywords: string[] = [];
  const missingKeywords: { keyword: string; importance: 'High'|'Medium'|'Low'; reason: string; recommendedLocation?: string }[] = [];

  if (jd) {
    let kwEarned = 0;
    jd.keywords.forEach(kw => {
      // Do not double count if it's already a matched skill
      if (matchedSkills.map(normalizeToken).includes(normalizeToken(kw))) {
         kwEarned += 1; // It's implicitly covered
         return;
      }

      if (normalizedResumeKeywords.has(normalizeToken(kw))) {
        matchedKeywords.push(kw);
        kwEarned += 1;
      } else {
        missingKeywords.push({
          keyword: kw,
          importance: 'Medium',
          reason: 'Mentioned in Job Description',
          recommendedLocation: 'Experience or Summary'
        });
      }
    });

    const kwTotal = jd.keywords.length;
    keywordScore = kwTotal > 0 ? (kwEarned / kwTotal) * 100 : 100;
  } else {
    keywordScore = Math.min(100, resume.keywords.length * 8);
  }

  // --- 3. EXPERIENCE SCORING (15%) ---
  let expScore = 0;
  const isFresher = resume.experienceBullets === 0;

  if (isFresher) {
    // For freshers, experience penalty is waived if they have projects/education
    expScore = 100;
  } else {
    const metricRatio = resume.experienceBullets > 0 ? resume.experienceBulletsWithMetrics / resume.experienceBullets : 0;
    
    let baseExpScore = 50;
    if (resume.hasActionVerbs) baseExpScore += 20;
    baseExpScore += (metricRatio * 30);
    
    expScore = Math.min(100, baseExpScore);

    if (metricRatio < 0.3) {
      recommendations.push({
        text: 'Add more quantifiable metrics to your experience bullets (e.g. percentages, revenue, user counts).',
        priority: 'Medium'
      });
    }
  }

  // --- 4. PROJECTS SCORING (10%) ---
  let projScore = 0;
  if (resume.projectsCount === 0) {
    if (isFresher) {
      projScore = 0;
      sectionIssues.push('Missing Projects section');
      recommendations.push({ text: 'Add a Projects section. This is critical for freshers.', priority: 'High' });
    } else {
      // Experienced devs don't strictly *need* projects, but it helps
      projScore = 50; 
    }
  } else {
    const projMetricRatio = resume.projectsWithMetrics / resume.projectsCount;
    projScore = 70 + (projMetricRatio * 30);
  }

  // --- 5. EDUCATION SCORING (10%) ---
  let eduScore = 100;
  const hasEdu = resume.sections.map(s => s.toLowerCase()).includes('education');
  if (!hasEdu) {
    eduScore = 0;
    sectionIssues.push('Missing Education section');
    recommendations.push({ text: 'Add an Education section.', priority: isFresher ? 'High' : 'Low' });
  }

  // --- 6. STRUCTURE SCORING (10%) ---
  let structScore = 100;
  const standardSections = ['summary', 'skills', 'experience', 'education'];
  const normalizedSections = resume.sections.map(s => s.toLowerCase());
  
  standardSections.forEach(reqSec => {
    if (reqSec === 'experience' && isFresher) return; // Allow freshers to skip exp
    
    if (!normalizedSections.some(s => s.includes(reqSec))) {
      structScore -= 25;
      sectionIssues.push(`Missing standard section: ${reqSec}`);
    }
  });
  structScore = Math.max(0, structScore);

  // --- 7. FORMATTING SCORING (5%) ---
  const formatScore = Math.min(100, Math.max(0, resume.formattingScore));

  // --- AGGREGATION ---
  let overall = (keywordScore * 0.25) +
                (skillScore * 0.25) +
                (expScore * 0.15) +
                (projScore * 0.10) +
                (eduScore * 0.10) +
                (structScore * 0.10) +
                (formatScore * 0.05);

  overall = Math.round(Math.max(0, Math.min(100, overall)));

  return {
    overallScore: overall,
    breakdown: {
      keywords: Math.round(keywordScore),
      skills: Math.round(skillScore),
      experience: Math.round(expScore),
      projects: Math.round(projScore),
      education: Math.round(eduScore),
      structure: Math.round(structScore),
      formatting: Math.round(formatScore),
    },
    matchedKeywords,
    missingKeywords,
    matchedSkills,
    missingSkills,
    sectionIssues,
    formattingIssues,
    recommendations
  };
}
