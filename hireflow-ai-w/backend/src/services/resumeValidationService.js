/**
 * Validates a resume object and detects completeness & quality issues
 * @param {Object} resumeData - The resumeData object from Resume document
 * @returns {{isValid: boolean, healthScore: number, issues: Array<{type: string, field: string, message: string, recommendation: string}>}}
 */
const validateResume = (resumeData = {}) => {
  const issues = [];
  let score = 100;

  const personalInfo = resumeData.personalInfo || {};
  const summary = resumeData.summary || '';
  const experience = resumeData.experience || [];
  const education = resumeData.education || [];
  const skills = resumeData.skills || [];

  // 1. Check Missing Email
  if (!personalInfo.email || !personalInfo.email.trim()) {
    score -= 20;
    issues.push({
      type: 'error',
      field: 'personalInfo.email',
      message: 'Missing Email Address',
      recommendation: 'Add a valid professional email address so recruiters can contact you.',
    });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(personalInfo.email.trim())) {
    score -= 10;
    issues.push({
      type: 'warning',
      field: 'personalInfo.email',
      message: 'Invalid Email Format',
      recommendation: 'Ensure your email address follows standard format (e.g., name@domain.com).',
    });
  }

  // 2. Check Missing Phone & Location
  if (!personalInfo.phone || !personalInfo.phone.trim()) {
    score -= 5;
    issues.push({
      type: 'warning',
      field: 'personalInfo.phone',
      message: 'Missing Phone Number',
      recommendation: 'Include a contact phone number for interview scheduling.',
    });
  }

  if (!personalInfo.location || !personalInfo.location.trim()) {
    score -= 5;
    issues.push({
      type: 'warning',
      field: 'personalInfo.location',
      message: 'Missing Location',
      recommendation: 'Add your city and country/state (e.g., San Francisco, CA).',
    });
  }

  // 3. Check Missing / Short Summary
  if (!summary || !summary.trim()) {
    score -= 15;
    issues.push({
      type: 'warning',
      field: 'summary',
      message: 'Missing Professional Summary',
      recommendation: 'Write a compelling 2-4 sentence summary outlining your core expertise and achievements.',
    });
  } else if (summary.trim().length < 40) {
    score -= 8;
    issues.push({
      type: 'warning',
      field: 'summary',
      message: 'Weak / Very Short Summary',
      recommendation: 'Expand your professional summary to at least 40-100 words.',
    });
  }

  // 4. Check Missing Skills
  if (!skills || skills.length === 0) {
    score -= 20;
    issues.push({
      type: 'error',
      field: 'skills',
      message: 'Missing Skills Section',
      recommendation: 'Add at least 5 key technical or domain skills.',
    });
  } else if (skills.length < 4) {
    score -= 10;
    issues.push({
      type: 'warning',
      field: 'skills',
      message: 'Low Skill Count',
      recommendation: 'Include at least 6-10 relevant skills to boost ATS matching scores.',
    });
  }

  // 5. Check Empty Sections (Experience & Education)
  if ((!experience || experience.length === 0) && (!education || education.length === 0)) {
    score -= 25;
    issues.push({
      type: 'error',
      field: 'experience',
      message: 'Empty Core Sections (No Work Experience or Education)',
      recommendation: 'At least one Work Experience or Education entry is required for a complete resume.',
    });
  }

  // 6. Check Experience Quality (Weak Resume Detection)
  if (experience && experience.length > 0) {
    let weakExpCount = 0;
    experience.forEach((exp, idx) => {
      if (!exp.position || !exp.company) {
        weakExpCount++;
      }
      if (!exp.bullets || exp.bullets.length === 0) {
        score -= 5;
        issues.push({
          type: 'warning',
          field: `experience[${idx}]`,
          message: `Work Experience at "${exp.company || 'Role'}" lacks achievement bullet points`,
          recommendation: 'Add 2-4 bullet points starting with strong action verbs.',
        });
      }
    });

    if (weakExpCount > 0) {
      score -= 10;
      issues.push({
        type: 'warning',
        field: 'experience',
        message: 'Incomplete Work Experience Entries',
        recommendation: 'Ensure all work experience items have job title and company name filled.',
      });
    }
  }

  // Clamp health score between 0 and 100
  const finalScore = Math.max(0, Math.min(100, Math.round(score)));
  const isValid = issues.filter((i) => i.type === 'error').length === 0;

  return {
    isValid,
    healthScore: finalScore,
    issues,
    lastValidated: new Date(),
  };
};

module.exports = {
  validateResume,
};
