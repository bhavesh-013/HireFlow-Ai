import { describe, it, expect } from 'vitest';
import {
  validateLinkedInUrl,
  validateGitHubUrl,
  validatePortfolioUrl,
  normalizeUrl,
  isValidUrlStructure,
} from './urlValidator';

describe('urlValidator', () => {
  describe('normalizeUrl', () => {
    it('prepends https:// when missing', () => {
      expect(normalizeUrl('linkedin.com/in/test')).toBe('https://linkedin.com/in/test');
    });

    it('keeps existing http/https protocol', () => {
      expect(normalizeUrl('http://github.com/test')).toBe('http://github.com/test');
      expect(normalizeUrl('https://github.com/test')).toBe('https://github.com/test');
    });

    it('returns empty string for empty input', () => {
      expect(normalizeUrl('')).toBe('');
      expect(normalizeUrl('   ')).toBe('');
    });
  });

  describe('isValidUrlStructure', () => {
    it('returns true for valid domains and URLs', () => {
      expect(isValidUrlStructure('https://example.com')).toBe(true);
      expect(isValidUrlStructure('portfolio.dev')).toBe(true);
      expect(isValidUrlStructure('www.linkedin.com/in/john')).toBe(true);
    });

    it('returns false for invalid structures', () => {
      expect(isValidUrlStructure('justtext')).toBe(false);
      expect(isValidUrlStructure('http://')).toBe(false);
      expect(isValidUrlStructure('')).toBe(false);
    });
  });

  describe('validateLinkedInUrl', () => {
    it('allows empty strings', () => {
      expect(validateLinkedInUrl('')).toEqual({ isValid: true, error: null });
      expect(validateLinkedInUrl('   ')).toEqual({ isValid: true, error: null });
    });

    it('validates proper LinkedIn URLs', () => {
      expect(validateLinkedInUrl('https://linkedin.com/in/john-doe')).toEqual({ isValid: true, error: null });
      expect(validateLinkedInUrl('linkedin.com/in/john-doe')).toEqual({ isValid: true, error: null });
      expect(validateLinkedInUrl('https://in.linkedin.com/in/john-doe')).toEqual({ isValid: true, error: null });
      expect(validateLinkedInUrl('www.linkedin.com/in/john-doe')).toEqual({ isValid: true, error: null });
    });

    it('rejects GitHub and other platform URLs with clear error', () => {
      const res = validateLinkedInUrl('https://github.com/john-doe');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('URL must be a LinkedIn profile link (e.g., linkedin.com/in/username)');
    });

    it('rejects invalid or gibberish URLs', () => {
      const res = validateLinkedInUrl('not a url');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Please enter a valid LinkedIn URL (e.g., linkedin.com/in/username)');
    });
  });

  describe('validateGitHubUrl', () => {
    it('allows empty strings', () => {
      expect(validateGitHubUrl('')).toEqual({ isValid: true, error: null });
    });

    it('validates proper GitHub URLs', () => {
      expect(validateGitHubUrl('https://github.com/john-doe')).toEqual({ isValid: true, error: null });
      expect(validateGitHubUrl('github.com/john-doe')).toEqual({ isValid: true, error: null });
      expect(validateGitHubUrl('www.github.com/john-doe')).toEqual({ isValid: true, error: null });
    });

    it('rejects LinkedIn URLs with clear error', () => {
      const res = validateGitHubUrl('https://linkedin.com/in/john-doe');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('URL must be a GitHub profile link (e.g., github.com/username)');
    });

    it('rejects invalid inputs', () => {
      const res = validateGitHubUrl('random_text');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Please enter a valid GitHub URL (e.g., github.com/username)');
    });
  });

  describe('validatePortfolioUrl', () => {
    it('allows empty strings', () => {
      expect(validatePortfolioUrl('')).toEqual({ isValid: true, error: null });
    });

    it('validates proper personal portfolio website URLs', () => {
      expect(validatePortfolioUrl('https://john-doe.dev')).toEqual({ isValid: true, error: null });
      expect(validatePortfolioUrl('myportfolio.com')).toEqual({ isValid: true, error: null });
      expect(validatePortfolioUrl('https://www.johndoe.io/projects')).toEqual({ isValid: true, error: null });
    });

    it('rejects LinkedIn URLs with explicit error', () => {
      const res = validatePortfolioUrl('https://linkedin.com/in/john-doe');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Portfolio should be a personal website, not a LinkedIn link. Use the LinkedIn field.');
    });

    it('rejects GitHub URLs with explicit error', () => {
      const res = validatePortfolioUrl('https://github.com/john-doe');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Portfolio should be a personal website, not a GitHub link. Use the GitHub field.');
    });

    it('rejects malformed URLs', () => {
      const res = validatePortfolioUrl('not-a-site');
      expect(res.isValid).toBe(false);
      expect(res.error).toBe('Please enter a valid website URL (e.g., myportfolio.dev or https://yourdomain.com)');
    });
  });
});
