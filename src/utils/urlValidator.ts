export interface ValidationResult {
  isValid: boolean;
  error: string | null;
}

/**
 * Normalizes input URL by trimming and adding https:// protocol if missing.
 */
export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Validates whether a string can be parsed as a valid web URL with TLD.
 */
export function isValidUrlStructure(input: string): boolean {
  const normalized = normalizeUrl(input);
  if (!normalized) return false;
  try {
    const urlObj = new URL(normalized);
    const hostname = urlObj.hostname;
    if (!hostname || !hostname.includes('.')) return false;
    const parts = hostname.split('.');
    const tld = parts[parts.length - 1];
    return tld.length >= 2 && /^[a-zA-Z]+$/.test(tld);
  } catch {
    return false;
  }
}

/**
 * Validates LinkedIn profile URL.
 * Accepts: linkedin.com, www.linkedin.com, in.linkedin.com, etc.
 */
export function validateLinkedInUrl(url?: string): ValidationResult {
  if (!url || !url.trim()) {
    return { isValid: true, error: null };
  }

  const trimmed = url.trim();
  if (!isValidUrlStructure(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid LinkedIn URL (e.g., linkedin.com/in/username)',
    };
  }

  try {
    const parsed = new URL(normalizeUrl(trimmed));
    const hostname = parsed.hostname.toLowerCase();
    const isLinkedInDomain = hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com');

    if (!isLinkedInDomain) {
      return {
        isValid: false,
        error: 'URL must be a LinkedIn profile link (e.g., linkedin.com/in/username)',
      };
    }

    return { isValid: true, error: null };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid LinkedIn URL (e.g., linkedin.com/in/username)',
    };
  }
}

/**
 * Validates GitHub profile URL.
 * Accepts: github.com, www.github.com
 */
export function validateGitHubUrl(url?: string): ValidationResult {
  if (!url || !url.trim()) {
    return { isValid: true, error: null };
  }

  const trimmed = url.trim();
  if (!isValidUrlStructure(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid GitHub URL (e.g., github.com/username)',
    };
  }

  try {
    const parsed = new URL(normalizeUrl(trimmed));
    const hostname = parsed.hostname.toLowerCase();
    const isGitHubDomain = hostname === 'github.com' || hostname.endsWith('.github.com');

    if (!isGitHubDomain) {
      return {
        isValid: false,
        error: 'URL must be a GitHub profile link (e.g., github.com/username)',
      };
    }

    return { isValid: true, error: null };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid GitHub URL (e.g., github.com/username)',
    };
  }
}

/**
 * Validates Personal Portfolio Website URL.
 * Rejects LinkedIn and GitHub links to prevent misallocation.
 */
export function validatePortfolioUrl(url?: string): ValidationResult {
  if (!url || !url.trim()) {
    return { isValid: true, error: null };
  }

  const trimmed = url.trim();
  if (!isValidUrlStructure(trimmed)) {
    return {
      isValid: false,
      error: 'Please enter a valid website URL (e.g., myportfolio.dev or https://yourdomain.com)',
    };
  }

  try {
    const parsed = new URL(normalizeUrl(trimmed));
    const hostname = parsed.hostname.toLowerCase();

    if (hostname === 'linkedin.com' || hostname.endsWith('.linkedin.com')) {
      return {
        isValid: false,
        error: 'Portfolio should be a personal website, not a LinkedIn link. Use the LinkedIn field.',
      };
    }

    if (hostname === 'github.com' || hostname.endsWith('.github.com')) {
      return {
        isValid: false,
        error: 'Portfolio should be a personal website, not a GitHub link. Use the GitHub field.',
      };
    }

    return { isValid: true, error: null };
  } catch {
    return {
      isValid: false,
      error: 'Please enter a valid website URL (e.g., myportfolio.dev or https://yourdomain.com)',
    };
  }
}
