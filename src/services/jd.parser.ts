/**
 * Job Description Parser & Requirements Extractor
 * ────────────────────────────────────────────────
 * Extracts structured intelligence from raw job descriptions.
 * Handles job titles, required & preferred skills, tech stacks, soft skills,
 * experience levels, responsibilities, certifications, and domain terminology.
 */

import { normalizeTerm, textContainsTerm } from './ats.engine';

export interface CategorizedKeywords {
  required: string[];
  preferred: string[];
  technical: string[];
  softSkills: string[];
  toolsAndTech: string[];
  domainTerms: string[];
}

export interface JDSkillItem {
  name: string;
  category: 'technical' | 'soft' | 'tool' | 'domain' | 'language' | 'framework' | 'database' | 'cloud' | 'devops';
  isRequired: boolean;
  frequency: number;
  importance: 'Critical' | 'High' | 'Medium' | 'Low';
}

export interface ParsedJobDescription {
  jobTitle: string;
  companyName?: string;
  experienceLevel: 'Entry' | 'Junior' | 'Mid' | 'Senior' | 'Lead' | 'Staff' | 'Principal' | 'Executive';
  minYearsExperience: number;
  maxYearsExperience?: number;
  educationalRequirements: string[];
  certifications: string[];
  responsibilities: string[];
  actionVerbs: string[];
  domainTerminology: string[];
  requiredSkills: JDSkillItem[];
  preferredSkills: JDSkillItem[];
  allSkills: JDSkillItem[];
  categorizedKeywords: CategorizedKeywords;
  rawKeywords: string[];
  rawText: string;
}

const COMMON_TECH_SKILLS = [
  'python', 'javascript', 'typescript', 'java', 'golang', 'go', 'rust', 'c++', 'c#', 'ruby', 'php',
  'swift', 'kotlin', 'scala', 'sql', 'r', 'bash', 'shell', 'html', 'html5', 'css', 'css3', 'sass',
  'react', 'react.js', 'reactjs', 'next.js', 'nextjs', 'vue', 'vue.js', 'angular', 'svelte', 'remix',
  'express', 'express.js', 'fastapi', 'flask', 'django', 'spring', 'spring boot', 'nestjs', 'node.js', 'nodejs',
  'graphql', 'rest api', 'restful apis', 'redux', 'zustand', 'tailwind', 'tailwind css', 'bootstrap',
  'postgresql', 'postgres', 'mysql', 'sqlite', 'mongodb', 'redis', 'dynamodb', 'cassandra', 'elasticsearch',
  'supabase', 'firebase', 'cockroachdb', 'oracle', 'sql server', 'bigquery', 'snowflake',
  'aws', 'amazon web services', 'azure', 'gcp', 'google cloud', 'vercel', 'docker', 'kubernetes', 'k8s',
  'terraform', 'ansible', 'jenkins', 'github actions', 'gitlab ci', 'ci/cd', 'cicd', 'microservices',
  'kafka', 'rabbitmq', 'grpc', 'linux', 'git', 'vite', 'webpack', 'jest', 'vitest', 'cypress', 'playwright',
  'pytorch', 'tensorflow', 'scikit-learn', 'langchain', 'llm', 'generative ai', 'machine learning', 'deep learning'
];

const COMMON_SOFT_SKILLS = [
  'communication', 'written communication', 'verbal communication', 'collaboration', 'teamwork',
  'leadership', 'problem solving', 'critical thinking', 'analytical thinking', 'adaptability',
  'time management', 'cross-functional collaboration', 'mentorship', 'stakeholder management',
  'ownership', 'accountability', 'agile', 'scrum', 'kanban', 'innovative', 'fast-paced'
];

const COMMON_ACTION_VERBS = [
  'architect', 'design', 'develop', 'build', 'implement', 'lead', 'manage', 'spearhead', 'engineer',
  'scale', 'optimize', 'collaborate', 'deliver', 'mentor', 'orchestrate', 'automate', 'transform',
  'integrate', 'streamline', 'deploy', 'launch', 'maintain', 'author', 'evaluate', 'investigate'
];

const DOMAIN_DICTIONARY: Record<string, string[]> = {
  FinTech: ['fintech', 'payments', 'pci-dss', 'banking', 'ledger', 'trading', 'crypto', 'blockchain', 'reconciliation', 'fraud detection', 'kyc', 'aml'],
  HealthTech: ['healthcare', 'hipaa', 'ehr', 'emr', 'fhir', 'hl7', 'clinical', 'medical device', 'patient records', 'telehealth'],
  Ecommerce: ['e-commerce', 'ecommerce', 'checkout', 'inventory', 'shopping cart', 'shopify', 'stripe', 'merchandising', 'fulfillment', 'catalog'],
  Security: ['cybersecurity', 'soc2', 'iso27001', 'penetration testing', 'vulnerability', 'encryption', 'zero trust', 'iam', 'oauth2', 'saml'],
  AI_ML: ['machine learning', 'deep learning', 'nlp', 'llm', 'computer vision', 'rag', 'embeddings', 'model training', 'fine-tuning', 'prompt engineering'],
  CloudSaaS: ['saas', 'multi-tenant', 'b2b', 'high availability', 'slas', 'scalability', 'distributed systems', 'tenancy', 'rate limiting', 'observability']
};

/**
 * Extracts the job title from job description text.
 */
function extractJobTitle(text: string): string {
  const firstLines = text.split('\n').slice(0, 8).map(l => l.trim()).filter(Boolean);
  
  // Look for standard Title headers
  for (const line of firstLines) {
    if (/^(job title|position|role|title):\s*(.+)$/i.test(line)) {
      const match = line.match(/^(?:job title|position|role|title):\s*(.+)$/i);
      if (match?.[1]) return match[1].trim();
    }
  }

  // Look for prominent engineering/business titles in top lines
  for (const line of firstLines) {
    if (
      /(?:senior|junior|lead|principal|staff|associate|chief)?\s*(?:full[\s-]stack|frontend|backend|software|devops|cloud|data|ml|ai|product|security|qa|system)\s*(?:engineer|developer|architect|specialist|manager|analyst|consultant)/i.test(line)
    ) {
      return line.replace(/^(we are looking for|we are hiring|seeking a|hiring:)\s*/i, '').trim();
    }
  }

  return 'Software Engineer';
}

/**
 * Detects experience requirements from text.
 */
function detectExperience(text: string): { level: ParsedJobDescription['experienceLevel']; minYears: number; maxYears?: number } {
  const lower = text.toLowerCase();
  
  // Extract explicit years
  const yearPattern = /(\d+)(?:\s*-\s*(\d+))?\+?\s*years?(?:\s+of)?\s+(?:relevant\s+)?(?:experience|exp)/gi;
  let minYears = 0;
  let maxYears: number | undefined = undefined;

  let match;
  while ((match = yearPattern.exec(lower)) !== null) {
    const val1 = parseInt(match[1], 10);
    const val2 = match[2] ? parseInt(match[2], 10) : undefined;
    if (!isNaN(val1) && val1 > minYears) {
      minYears = val1;
      maxYears = val2;
    }
  }

  // Title-based experience level override
  if (/\b(principal|distinguished|fellow|architect)\b/i.test(lower)) return { level: 'Principal', minYears: minYears || 10, maxYears };
  if (/\b(staff engineer|staff developer)\b/i.test(lower)) return { level: 'Staff', minYears: minYears || 8, maxYears };
  if (/\b(tech lead|lead software|lead engineer|engineering manager)\b/i.test(lower)) return { level: 'Lead', minYears: minYears || 6, maxYears };
  if (/\b(senior|sr\.)\b/i.test(lower) || minYears >= 5) return { level: 'Senior', minYears: minYears || 5, maxYears };
  if (/\b(mid|intermediate)\b/i.test(lower) || minYears >= 2) return { level: 'Mid', minYears: minYears || 2, maxYears };
  if (/\b(junior|jr\.|entry[-\s]level|associate|graduate)\b/i.test(lower) || minYears <= 1) return { level: 'Junior', minYears: minYears || 0, maxYears };

  return { level: 'Mid', minYears: minYears || 2, maxYears };
}

/**
 * Extracts educational requirements.
 */
function extractEducation(text: string): string[] {
  const eduReqs: string[] = [];
  const lower = text.toLowerCase();

  if (/bachelor|b\.?s\.?|b\.?tech|b\.?e\.?|undergraduate/i.test(lower)) {
    eduReqs.push("Bachelor's Degree in Computer Science, Engineering, or related field");
  }
  if (/master|m\.?s\.?|m\.?tech|graduate degree/i.test(lower)) {
    eduReqs.push("Master's Degree in CS, Data Science, or related field (Preferred)");
  }
  if (/ph\.?d\.?|doctorate/i.test(lower)) {
    eduReqs.push("Ph.D. in Computer Science or relevant technical discipline");
  }
  if (eduReqs.length === 0) {
    eduReqs.push("Bachelor's Degree in CS/related field or equivalent practical experience");
  }
  return eduReqs;
}

/**
 * Extracts responsibilities bullet points.
 */
function extractResponsibilities(text: string): string[] {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const responsibilities: string[] = [];
  let inSection = false;

  for (const line of lines) {
    const lower = line.toLowerCase();
    if (/^(responsibilities|what you('ll| will) do|key duties|role & responsibilities|job responsibilities|your role):?/i.test(lower)) {
      inSection = true;
      continue;
    }
    if (inSection && /^(requirements|qualifications|what you bring|skills|nice to have|about you|benefits):?/i.test(lower)) {
      inSection = false;
      break;
    }
    if (inSection) {
      if (/^[•\-*●]/.test(line) || line.length > 25) {
        responsibilities.push(line.replace(/^[•\-*●]\s*/, '').trim());
      }
    }
  }

  if (responsibilities.length === 0) {
    // Fallback: look for action verbs in bullet points across the whole text
    return lines
      .filter(l => /^[•\-*●]/.test(l) && l.length > 25 && l.length < 240)
      .map(l => l.replace(/^[•\-*●]\s*/, '').trim())
      .slice(0, 6);
  }

  return responsibilities.slice(0, 8);
}

/**
 * Extracts certifications.
 */
function extractCertifications(text: string): string[] {
  const certs: string[] = [];
  const CERT_PATTERNS = [
    { regex: /\b(aws certified|solutions architect|aws developer)\b/i, name: 'AWS Certified Solutions Architect / Developer' },
    { regex: /\b(ckad|cka|kubernetes administrator)\b/i, name: 'CKA / CKAD (Certified Kubernetes Administrator)' },
    { regex: /\b(pmp|project management professional)\b/i, name: 'PMP (Project Management Professional)' },
    { regex: /\b(cism|cisp|cissp|comptia)\b/i, name: 'Security Certification (CISSP / CompTIA Security+)' },
    { regex: /\b(azure certified|azure administrator)\b/i, name: 'Microsoft Azure Certification' },
    { regex: /\b(gcp certified|google cloud professional)\b/i, name: 'Google Cloud Professional Cloud Architect' },
  ];

  CERT_PATTERNS.forEach(({ regex, name }) => {
    if (regex.test(text)) certs.push(name);
  });

  return certs;
}

/**
 * Main JD Parser
 */
export function parseJobDescription(jdText: string): ParsedJobDescription {
  if (!jdText || jdText.trim().length === 0) {
    return {
      jobTitle: 'Software Engineer',
      experienceLevel: 'Mid',
      minYearsExperience: 2,
      educationalRequirements: ["Bachelor's Degree in Computer Science or equivalent"],
      certifications: [],
      responsibilities: [],
      actionVerbs: ['Design', 'Develop', 'Implement', 'Deploy', 'Optimize'],
      domainTerminology: ['Software Architecture', 'Scalability', 'APIs'],
      requiredSkills: [],
      preferredSkills: [],
      allSkills: [],
      categorizedKeywords: {
        required: [],
        preferred: [],
        technical: [],
        softSkills: [],
        toolsAndTech: [],
        domainTerms: []
      },
      rawKeywords: [],
      rawText: ''
    };
  }

  const cleanText = jdText.trim();
  const lower = cleanText.toLowerCase();

  // Extract sections
  const requiredSectionMatch = cleanText.match(/(?:requirements|qualifications|must have|what you bring)[\s\S]*?(?=(?:preferred|nice to have|benefits|about us|$))/i);
  const requiredSectionText = requiredSectionMatch ? requiredSectionMatch[0].toLowerCase() : lower;
  const preferredSectionMatch = cleanText.match(/(?:preferred|nice to have|bonus|plus)[\s\S]*?(?=(?:benefits|about us|$))/i);
  const preferredSectionText = preferredSectionMatch ? preferredSectionMatch[0].toLowerCase() : '';

  const jobTitle = extractJobTitle(cleanText);
  const { level, minYears, maxYears } = detectExperience(cleanText);
  const educationalRequirements = extractEducation(cleanText);
  const responsibilities = extractResponsibilities(cleanText);
  const certifications = extractCertifications(cleanText);

  // Extract Action Verbs found in JD
  const actionVerbs = COMMON_ACTION_VERBS.filter(verb => {
    const regex = new RegExp(`\\b${verb}(?:s|ed|ing)?\\b`, 'i');
    return regex.test(lower);
  });

  // Extract Domain Terminology
  const domainTerminology: string[] = [];
  Object.entries(DOMAIN_DICTIONARY).forEach(([_, terms]) => {
    terms.forEach(term => {
      if (textContainsTerm(cleanText, term) && !domainTerminology.includes(term)) {
        domainTerminology.push(term);
      }
    });
  });

  // Extract Tech Skills
  const technicalSkillsFound: string[] = [];
  COMMON_TECH_SKILLS.forEach(skill => {
    if (textContainsTerm(cleanText, skill) && !technicalSkillsFound.includes(normalizeTerm(skill))) {
      technicalSkillsFound.push(skill);
    }
  });

  // Extract Soft Skills
  const softSkillsFound: string[] = [];
  COMMON_SOFT_SKILLS.forEach(skill => {
    if (textContainsTerm(cleanText, skill) && !softSkillsFound.includes(skill)) {
      softSkillsFound.push(skill);
    }
  });

  // Build Structured Skill Gaps with Frequencies
  const requiredSkills: JDSkillItem[] = [];
  const preferredSkills: JDSkillItem[] = [];
  const allSkills: JDSkillItem[] = [];

  technicalSkillsFound.forEach(skill => {
    const isExplicitlyRequired = textContainsTerm(requiredSectionText, skill);
    const isPreferred = preferredSectionText.length > 0 && textContainsTerm(preferredSectionText, skill);
    
    // Calculate occurrences
    const escaped = normalizeTerm(skill).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const freq = (lower.match(new RegExp(`\\b${escaped}\\b`, 'gi')) || []).length || 1;

    const isRequired = isExplicitlyRequired || (!isPreferred && freq >= 2);
    const importance: JDSkillItem['importance'] = freq >= 4 ? 'Critical' : freq >= 2 ? 'High' : 'Medium';

    const item: JDSkillItem = {
      name: skill.charAt(0).toUpperCase() + skill.slice(1),
      category: 'technical',
      isRequired,
      frequency: freq,
      importance
    };

    allSkills.push(item);
    if (isRequired) requiredSkills.push(item);
    else preferredSkills.push(item);
  });

  softSkillsFound.forEach(skill => {
    const escaped = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const freq = (lower.match(new RegExp(`\\b${escaped}\\b`, 'gi')) || []).length || 1;
    const isRequired = textContainsTerm(requiredSectionText, skill) || freq >= 2;

    const item: JDSkillItem = {
      name: skill.charAt(0).toUpperCase() + skill.slice(1),
      category: 'soft',
      isRequired,
      frequency: freq,
      importance: freq >= 3 ? 'High' : 'Medium'
    };

    allSkills.push(item);
    if (isRequired) requiredSkills.push(item);
    else preferredSkills.push(item);
  });

  // Sort by frequency descending
  requiredSkills.sort((a, b) => b.frequency - a.frequency);
  preferredSkills.sort((a, b) => b.frequency - a.frequency);
  allSkills.sort((a, b) => b.frequency - a.frequency);

  const toolsAndTech = technicalSkillsFound.filter(t => 
    ['git', 'docker', 'kubernetes', 'jenkins', 'github actions', 'vite', 'webpack', 'jira', 'figma', 'postman', 'aws', 'gcp', 'azure'].includes(normalizeTerm(t))
  );

  const categorizedKeywords: CategorizedKeywords = {
    required: requiredSkills.map(s => s.name),
    preferred: preferredSkills.map(s => s.name),
    technical: technicalSkillsFound.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    softSkills: softSkillsFound.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    toolsAndTech: toolsAndTech.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
    domainTerms: domainTerminology.map(s => s.charAt(0).toUpperCase() + s.slice(1))
  };

  const rawKeywords = Array.from(new Set([
    ...categorizedKeywords.required,
    ...categorizedKeywords.technical,
    ...categorizedKeywords.toolsAndTech,
    ...categorizedKeywords.domainTerms,
    ...categorizedKeywords.softSkills
  ]));

  return {
    jobTitle,
    experienceLevel: level,
    minYearsExperience: minYears,
    maxYearsExperience: maxYears,
    educationalRequirements,
    certifications,
    responsibilities,
    actionVerbs: actionVerbs.map(v => v.charAt(0).toUpperCase() + v.slice(1)),
    domainTerminology,
    requiredSkills,
    preferredSkills,
    allSkills,
    categorizedKeywords,
    rawKeywords,
    rawText: cleanText
  };
}

export default parseJobDescription;
