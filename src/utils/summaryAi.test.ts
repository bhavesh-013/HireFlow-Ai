import { describe, it, expect } from 'vitest';
import { extractResumeMetrics, fixSummaryGrammar, improveSummaryAts } from './summaryAi';

describe('summaryAi utility', () => {
  describe('extractResumeMetrics', () => {
    it('returns empty array when resumeData is empty or null', () => {
      expect(extractResumeMetrics(null)).toEqual([]);
      expect(extractResumeMetrics({})).toEqual([]);
    });

    it('extracts numbers, percentages, and metrics from experiences and projects', () => {
      const resumeData = {
        personalInfo: { summary: 'Developer with 5 years experience.' },
        experiences: [
          {
            role: 'Frontend Engineer',
            company: 'Tech Corp',
            bullets: [
              'Improved page load speed by 40% using React and Vite.',
              'Managed a team of 6 engineers across 3 projects.',
              'Increased daily active users to 50,000.',
            ],
          },
        ],
        projects: [
          {
            description: 'Built E-commerce app generating $100k revenue.',
            highlights: ['Reduced server costs by 25%.'],
          },
        ],
      };

      const metrics = extractResumeMetrics(resumeData);
      expect(metrics).toContain('5 years');
      expect(metrics).toContain('40%');
      expect(metrics).toContain('6 engineers');
      expect(metrics).toContain('50,000');
      expect(metrics).toContain('$100k');
      expect(metrics).toContain('25%');
    });

    it('returns empty array if no numbers exist anywhere in the resume', () => {
      const resumeData = {
        personalInfo: { summary: 'Computer science graduate skilled in React and TypeScript.' },
        experiences: [
          {
            role: 'Software Engineer',
            company: 'Acme',
            bullets: ['Built REST APIs with Node.js and PostgreSQL.'],
          },
        ],
      };

      const metrics = extractResumeMetrics(resumeData);
      expect(metrics).toEqual([]);
    });
  });

  describe('fixSummaryGrammar', () => {
    it('fixes capitalization, spelling, and trailing punctuation', () => {
      const input = 'javscript developer worked on frontend using reactjs';
      const output = fixSummaryGrammar(input);
      expect(output).toContain('JavaScript');
      expect(output).toContain('React');
      expect(output.endsWith('.')).toBe(true);
    });

    it('does not invent new facts or metrics', () => {
      const input = 'Software developer with focus on full stack web applications.';
      const output = fixSummaryGrammar(input);
      expect(output).toBe('Software developer with focus on full stack web applications.');
      expect(/\d+/.test(output)).toBe(false);
    });
  });

  describe('improveSummaryAts', () => {
    it('removes first person pronouns and structures summary for ATS', () => {
      const input = 'I am a passionate software developer building scalable web applications.';
      const output = improveSummaryAts(input, 'Frontend Developer');
      expect(output).not.toMatch(/\bI am a\b/);
      expect(output.endsWith('.')).toBe(true);
    });
  });
});
