const fs = require('fs');
const path = './src/types.ts';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split('\n');

const newTypes = `
// ─── ATS Analysis Types (Unified) ────────────────────────────────────────────────

export type CategoryName =
  | 'contactAndHeader'
  | 'summary'
  | 'skillsAndKeywords'
  | 'experience'
  | 'projects'
  | 'education'
  | 'certificationsAndAchievements'
  | 'formattingAndAtsCompatibility';

export interface ResumeCategory {
  score: number;
  strengths: string[];
  problems: string[];
  evidence: string[];
  recommendation: string;
}

export interface AtsAnalysisResponse {
  success: boolean;
  resumeAnalysis: Record<CategoryName, ResumeCategory>;
  jdAnalysis?: {
    requiredSkills: string[];
    preferredSkills: string[];
    technicalKeywords: string[];
    softSkills: string[];
    responsibilities: string[];
    experienceRequirements: string;
    educationRequirements: string;
    certifications: string[];
    importantPhrases: string[];
  } | null;
  matching?: Array<{
    requirement: string;
    status: 'MATCHED' | 'PARTIAL' | 'MISSING' | 'NOT_APPLICABLE';
    evidence: string;
  }> | null;
  atsScore: {
    score: number;
    breakdown: Record<string, { score: number; weight: number; contribution: number }>;
  };
  issues: Array<{
    category: string;
    issue: string;
    recommendation: string;
  }>;
  projectRelevance?: Array<{
    projectName: string;
    relevanceScore: number;
    matchedRequirements: string[];
    missingRequirements: string[];
    explanation: string;
  }> | null;
  optimization?: {
    originalResume: any;
    optimizedResume: any;
    changes: Array<{
      section: string;
      original: string;
      optimized: string;
      reason: string;
    }>;
  } | null;
  validation: {
    passed: boolean;
    errors: string[];
  };
}
`;

const updatedLines = lines.slice(0, 265);
updatedLines.push(newTypes);

fs.writeFileSync(path, updatedLines.join('\n'));
console.log('Updated types.ts');
