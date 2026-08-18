/**
 * Shared resume-text-to-structured-data parser.
 *
 * Turns raw extracted text (from fileParser.ts's parseResumeFile — pdfjs /
 * mammoth) into a structured ParsedResumeData object via section-header
 * detection and regex-based field extraction. This is heuristic, not
 * guaranteed perfect, but it extracts REAL fields from the REAL uploaded
 * file — it never fabricates a name, company, or degree.
 *
 * Moved out of ATSAnalysisPage.tsx (which still imports parseResumeText
 * from here, unchanged in behavior) so ResumeBuilderPage's upload flow can
 * use the same real extraction logic instead of hardcoded demo data.
 */
import { ParsedResumeData, ProjectItem } from '../types';

// A single shared date-range pattern (MM/YYYY or YYYY, "Present" allowed) so
// Experience and Education both preserve the resume's REAL dates instead of
// guessing/defaulting to something like "2025 – Present".
const DATE_RANGE_RE =
  /\b(?:(0[1-9]|1[0-2])\/)?(19|20)\d{2}\s*[-–—]\s*(?:[Pp]resent|(?:(0[1-9]|1[0-2])\/)?(19|20)\d{2})\b/;

// Bullet-glyph marker at the START of a raw line — distinguishes an actual
// new bullet from a wrapped continuation line of the previous bullet.
const BULLET_MARKER_RE = /^[●•▪‣∙◦■–—*-]\s+/u;

// Deliberately narrow — only words that are unambiguous as link labels.
// "Website"/"Portfolio" are excluded: real project titles legitimately
// contain those words (e.g. "Portfolio Website"), so treating them as a
// strippable trailing label would eat real title text.
const LINK_LABEL_WORD = '(?:GitHub|Github|Live|Demo|Repo|Repository)';

/** A line that is ENTIRELY link labels, e.g. "GitHub | Live" or just "Live". */
function isPureLinkLabelLine(line: string): boolean {
  return new RegExp(`^(?:${LINK_LABEL_WORD}\\s*(?:[|,/]\\s*)?){1,3}$`, 'i').test(line.trim());
}

/** Splits trailing link labels off a title line, e.g.
 *  "Sahayak Agent & UCXP Protocol GitHub | Live" -> title + {hasGithub, hasLive}. */
function splitTrailingLinkLabels(line: string): {
  text: string;
  hasGithub: boolean;
  hasLive: boolean;
  hasDemo: boolean;
} {
  const re = new RegExp(`\\s+((?:${LINK_LABEL_WORD}\\s*(?:[|,/]\\s*)?){1,3})$`, 'i');
  const m = line.match(re);
  if (!m || m.index === undefined) {
    return { text: line.trim(), hasGithub: false, hasLive: false, hasDemo: false };
  }
  const labelPart = m[1];
  return {
    text: line.slice(0, m.index).trim(),
    hasGithub: /github/i.test(labelPart),
    hasLive: /\blive\b/i.test(labelPart),
    hasDemo: /\bdemo\b/i.test(labelPart),
  };
}

/** Only ever returns a URL that is ACTUALLY present in the text — never fabricated. */
function extractRealUrl(line: string): string | undefined {
  const httpMatch = line.match(/https?:\/\/[^\s)]+/i);
  if (httpMatch) return httpMatch[0].replace(/[.,)]+$/, '');
  const githubMatch = line.match(/\b(?:www\.)?github\.com\/[^\s),]+/i);
  if (githubMatch) return `https://${githubMatch[0].replace(/^www\./i, '')}`.replace(/[.,)]+$/, '');
  return undefined;
}

/** "Tech: React, Node.js" / "Technologies: X, Y" / "Stack: X, Y" -> ['React', 'Node.js'] */
function extractTechLine(line: string): string[] | null {
  const m = line.match(/^(?:tech(?:nologies)?|stack|built with)\s*:\s*(.+)$/i);
  if (!m) return null;
  return m[1]
    .split(/[,|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

/** Removes common PDF-text-extraction spacing artifacts without touching
 * real words — "Protocol , a" -> "Protocol, a", "( STT , LLM )" -> "(STT, LLM)". */
function cleanupSpacing(s: string): string {
  return s
    .replace(/\s+([,.;:!?)])/g, '$1')
    .replace(/\(\s+/g, '(')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

const BULLET_VERB_RE =
  /^(Built|Designed|Developed|Implemented|Created|Architected|Led|Managed|Used|Optimized|Improved|Reduced|Increased|Wrote|Integrated|Automated|Deployed|Engineered|Collaborated|Delivered|Launched|Maintained|Enhanced|Refactored|Migrated|Configured|Added|Fixed)\b/i;

/** Heuristic: does this line look like the start of a NEW project title
 * (as opposed to a bullet/description sentence)? Short, capitalized,
 * doesn't end in a period, doesn't open with an achievement verb. */
function looksLikeNewProjectTitle(line: string): boolean {
  const t = line.trim();
  if (!t || t.length > 80) return false;
  if (/[.]$/.test(t)) return false;
  if (BULLET_VERB_RE.test(t)) return false;
  if (!/^[A-Z0-9]/.test(t)) return false;
  return true;
}

/**
 * Groups an ordered list of raw text lines from a Projects section into
 * real project objects (title, description, bullets, techStack, link,
 * demoUrl). This is the SINGLE source of truth for turning line-based text
 * into structured projects — used both for fresh PDF/DOCX text extraction
 * and (via normalizeProjects below) to repair already-saved/cached data
 * that was produced before this grouping existed.
 */
export function groupProjectLines(rawLines: string[]): ProjectItem[] {
  const projLines = rawLines.map((l) => l.trim()).filter((l) => l.length > 0);
  const projects: ProjectItem[] = [];
  let currentProj: ProjectItem | null = null;
  let projCounter = 0;

  const pushCurrentProject = () => {
    if (currentProj && (currentProj.title.trim() || currentProj.bullets.length || currentProj.description)) {
      projects.push(currentProj);
    }
  };

  projLines.forEach((line) => {
    // (a) A line that's purely "GitHub | Live" style labels — metadata
    // for the CURRENT project, never a heading/paragraph/bullet of its own.
    if (isPureLinkLabelLine(line)) {
      if (currentProj) {
        const realUrl = extractRealUrl(line);
        if (/github/i.test(line) && !currentProj.link) currentProj.link = realUrl;
        if (/live|demo/i.test(line) && !currentProj.demoUrl) currentProj.demoUrl = realUrl;
      }
      return;
    }

    // (b) "Tech: X, Y, Z" — attach to current project, never invented.
    const techList = extractTechLine(line);
    if (techList) {
      if (currentProj) currentProj.techStack = Array.from(new Set([...(currentProj.techStack || []), ...techList]));
      return;
    }

    // (c) An actual bullet line (glyph survived extraction).
    if (BULLET_MARKER_RE.test(line)) {
      const cleanBullet = cleanupSpacing(line.replace(BULLET_MARKER_RE, ''));
      if (cleanBullet.length > 3) {
        if (!currentProj) {
          // A bullet appeared before any title — don't drop real
          // content, but flag it for review rather than inventing a name.
          projCounter++;
          currentProj = {
            id: `proj_${projCounter}`,
            title: 'Project',
            description: '',
            bullets: [cleanBullet],
            techStack: [],
          };
        } else {
          currentProj.bullets.push(cleanBullet);
        }
      }
      return;
    }

    // (d) Title line, possibly with trailing "GitHub | Live" labels on
    // the same line (the common single-line format).
    const { text: textWithoutLinksRaw, hasGithub, hasLive, hasDemo } = splitTrailingLinkLabels(line);
    const textWithoutLinks = cleanupSpacing(textWithoutLinksRaw);
    const linkSignalPresent = hasGithub || hasLive || hasDemo;

    const startsNewProject =
      !currentProj ||
      linkSignalPresent ||
      (currentProj.bullets.length > 0 && looksLikeNewProjectTitle(textWithoutLinks));

    if (startsNewProject) {
      pushCurrentProject();
      projCounter++;
      currentProj = {
        id: `proj_${projCounter}`,
        title: textWithoutLinks || line,
        description: '',
        bullets: [],
        techStack: [],
        link: hasGithub ? extractRealUrl(line) : undefined,
        demoUrl: hasLive || hasDemo ? extractRealUrl(line) : undefined,
      };
      return;
    }

    if (!currentProj) return; // unreachable — startsNewProject is true whenever currentProj is null

    // (e) No bullet glyph survived extraction, but this line reads as a
    // new achievement-style sentence (starts with a strong action verb) —
    // treat it as a bullet rather than a description/continuation. This is
    // the "use semantic structure, never invent a fake bullet" fallback for
    // PDFs whose bullet characters don't extract as text. Real one-line
    // descriptions are written as noun phrases ("Manifest-driven platform
    // for...") and essentially never open with a past-tense action verb
    // like "Built"/"Architected", so this is a safe signal even for the
    // very first line after the title.
    if (BULLET_VERB_RE.test(textWithoutLinks)) {
      currentProj.bullets.push(textWithoutLinks);
      return;
    }

    // (f) Otherwise: the project's short description, or a wrapped
    // continuation of the description/last bullet — never a new block.
    if (currentProj.bullets.length === 0 && !currentProj.description) {
      currentProj.description = textWithoutLinks;
    } else if (currentProj.bullets.length === 0) {
      currentProj.description = cleanupSpacing(`${currentProj.description} ${textWithoutLinks}`);
    } else {
      const lastIdx = currentProj.bullets.length - 1;
      currentProj.bullets[lastIdx] = cleanupSpacing(`${currentProj.bullets[lastIdx]} ${textWithoutLinks}`);
    }
  });

  pushCurrentProject();
  return projects.map((p) => ({ ...p, title: cleanupSpacing(p.title) }));
}

/** True for a project object that looks like a leftover fragment from the
 * old line-per-project bug: a bare link label, an achievement sentence, or
 * a lowercase-starting wrapped continuation — never a real project title. */
function looksLikeFragment(p: ProjectItem): boolean {
  if (p.bullets.length > 0 || p.description) return false;
  const t = (p.title || '').trim();
  if (!t) return true;
  if (isPureLinkLabelLine(t)) return true;
  if (BULLET_VERB_RE.test(t)) return true;
  if (t.length > 90) return true;
  if (/^[a-z]/.test(t)) return true;
  return false;
}

/**
 * Self-heals already-saved/cached project data that predates proper
 * grouping (e.g. one project object per raw PDF line, with "GitHub | Live"
 * or a wrapped bullet fragment sitting in the `title` field). Runs on every
 * load — from localStorage, from a saved backend resume, or from a fresh
 * parse — so a resume that was corrupted before this fix existed gets
 * repaired automatically instead of requiring a re-upload. Leaves
 * already-well-structured project lists untouched.
 */
export function normalizeProjects(projects: ProjectItem[] | null | undefined): ProjectItem[] {
  const list = projects || [];
  if (list.length === 0) return list;

  const fragmentCount = list.filter(looksLikeFragment).length;
  const looksCorrupted = list.length >= 2 && fragmentCount / list.length >= 0.4;

  if (!looksCorrupted) {
    // Still run real titles/descriptions/bullets through the spacing
    // cleanup so old PDF-extraction artifacts (stray spaces before commas,
    // etc.) don't linger even when the structure itself is fine.
    return list.map((p) => ({
      ...p,
      title: cleanupSpacing(p.title || ''),
      description: p.description ? cleanupSpacing(p.description) : p.description,
      bullets: (p.bullets || []).map((b) => cleanupSpacing(b)),
    }));
  }

  const flattenedLines: string[] = [];
  list.forEach((p) => {
    if (p.title) flattenedLines.push(p.title);
    if (p.description) flattenedLines.push(p.description);
    (p.bullets || []).forEach((b) => flattenedLines.push(b));
    if (p.techStack && p.techStack.length > 0) flattenedLines.push(`Tech: ${p.techStack.join(', ')}`);
    if (p.link) flattenedLines.push(p.link);
    if (p.demoUrl) flattenedLines.push(p.demoUrl);
  });

  return groupProjectLines(flattenedLines);
}



export const isPdfSyntaxLine = (line: string): boolean => {
    if (!line) return true;
    const l = line.trim().toLowerCase();
    return (
      l.startsWith('%pdf') ||
      l.startsWith('%') ||
      l === 'startxref' ||
      l.startsWith('startxref') ||
      l === 'xref' ||
      l.startsWith('xref') ||
      l === 'trailer' ||
      l === 'endstream' ||
      l === 'stream' ||
      l === 'endobj' ||
      l === 'obj' ||
      l.includes('flatedecode') ||
      l.includes('fontdescriptor') ||
      l.includes('/root') ||
      l.includes('/info') ||
      l.includes('/index') ||
      l.includes('/prev') ||
      l.includes('/size') ||
      l.startsWith('pk') ||
      /^\d+$/.test(l) || // purely numeric like "216"
      /^\d+\s+\d+\s+obj/.test(l) ||
      /^%[\uFFFD\S]+/.test(l)
    );
  };

  // Extract clean plain text from DOCX, PDF, or text files, removing ZIP/binary headers
export const extractCleanTextFromFileContent = (rawText: string, fileName: string): string => {
    // 1. PDF File Text Extraction
    if (rawText.startsWith('%PDF-') || rawText.includes('%PDF-')) {
      const pdfLines: string[] = [];
      
      // Match parenthesized text strings in PDF streams: (Sahil Nagpal) Tj or (StockX India...)
      const literalMatches = rawText.match(/\(([^()]{2,200})\)/g) || [];
      if (literalMatches.length > 0) {
        literalMatches.forEach((m) => {
          const cleanStr = m
            .slice(1, -1)
            .replace(/\\([()])/g, '$1')
            .replace(/\\n/g, ' ')
            .replace(/\\r/g, ' ')
            .trim();
          
          const lower = cleanStr.toLowerCase();
          if (
            cleanStr.length >= 2 &&
            !lower.startsWith('/f') &&
            !lower.startsWith('/font') &&
            !lower.startsWith('pdf') &&
            !lower.includes('startxref') &&
            !lower.includes('endstream') &&
            !lower.includes('flatedecode') &&
            !lower.includes('fontdescriptor') &&
            !lower.includes('identity-h') &&
            !/^\d+$/.test(cleanStr) &&
            !isPdfSyntaxLine(cleanStr)
          ) {
            pdfLines.push(cleanStr);
          }
        });
      }

      if (pdfLines.length > 0) {
        return pdfLines.join('\n');
      }

      // Fallback PDF cleaning: purge all PDF metadata tags and structural markers
      return rawText
        .replace(/%PDF-[0-9.]+/gi, '')
        .replace(/%\uFFFD+/gi, '')
        .replace(/%\S+/gi, '')
        .replace(/startxref[\s\S]*?%%EOF/gi, '')
        .replace(/\d+\s+\d+\s+obj[\s\S]*?endobj/gi, '')
        .replace(/stream[\s\S]*?endstream/gi, '')
        .replace(/\/(Root|Info|Size|Prev|ID|W|Index|Catalog|Type|Pages|Font|Encoding)\b[^\n]*/gi, '')
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\xFF]/g, ' ')
        .replace(/\s{2,}/g, ' ')
        .trim();
    }

    // 2. DOCX File Text Extraction
    if (rawText.includes('word/document.xml') || rawText.includes('<w:t') || rawText.includes('PK')) {
      const paragraphs = rawText.split(/<\/w:p>/gi);
      const extractedLines = paragraphs
        .map((p) => {
          const wtMatches = p.match(/<w:t[^>]*>(.*?)<\/w:t>/gi) || [];
          return wtMatches
            .map((m) => m.replace(/<[^>]+>/g, '').trim())
            .filter(Boolean)
            .join(' ');
        })
        .filter((line) => line.length > 0 && !line.startsWith('PK') && !line.includes('word/'));

      if (extractedLines.length > 0) {
        return extractedLines.join('\n');
      }

      const allWt = rawText.match(/<w:t[^>]*>(.*?)<\/w:t>/gi);
      if (allWt && allWt.length > 0) {
        return allWt
          .map((m) => m.replace(/<[^>]+>/g, '').trim())
          .filter(Boolean)
          .join(' ');
      }
    }

    // 3. Generic Text Cleaning
    return rawText
      .replace(/PK[\s\S]*?document\.xml[^\s]*/gi, '')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .trim();
  };

  // Parse raw resume text into a structured ParsedResumeData object
export const parseResumeText = (rawContent: string, fileName: string): ParsedResumeData => {
    const cleanedText = (rawContent && !rawContent.includes('%PDF-')) ? rawContent : extractCleanTextFromFileContent(rawContent, fileName);
    const lines = cleanedText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.length > 0 && !isPdfSyntaxLine(l) && !l.includes('document.xml'));

    const cleanTitleName = fileName
      .replace(/\.(pdf|docx|doc|txt|rtf)$/i, '')
      .replace(/[-_]/g, ' ')
      .replace(/\b(resume|cv|curriculum|vitae)\b/gi, '')
      .trim();

    // ─── 1. Section Chunking Map ──────────────────────────────────────────────
    const isSectionHeader = (line: string) => {
      return /^(objective|summary|profile|about|education|academic|experience|work experience|employment|history|projects|personal projects|skills|technical skills|computer skills|achievements|certifications|awards|honors)/i.test(
        line.trim()
      );
    };

    const sectionsMap: Record<string, string[]> = {};
    let currentKey = 'HEADER';
    sectionsMap[currentKey] = [];

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (
        isSectionHeader(trimmed) &&
        trimmed.length < 50 &&
        !trimmed.includes('@') &&
        !trimmed.includes('http')
      ) {
        if (/objective|summary|profile|about/i.test(trimmed)) currentKey = 'SUMMARY';
        else if (/education|academic/i.test(trimmed)) currentKey = 'EDUCATION';
        else if (/experience|work|employment|history/i.test(trimmed)) currentKey = 'EXPERIENCE';
        else if (/projects/i.test(trimmed)) currentKey = 'PROJECTS';
        else if (/skills/i.test(trimmed)) currentKey = 'SKILLS';
        else if (/achievements|certifications|awards|honors/i.test(trimmed)) currentKey = 'ACHIEVEMENTS';
        else currentKey = 'OTHER';

        if (!sectionsMap[currentKey]) sectionsMap[currentKey] = [];
      } else {
        if (!sectionsMap[currentKey]) sectionsMap[currentKey] = [];
        sectionsMap[currentKey].push(line);
      }
    });

    // ─── 2. Personal Info Extraction ──────────────────────────────────────────
    const emailMatch = cleanedText.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = cleanedText.match(/(\+?[\d\s\-().]{7,18})/);
    const linkedinMatch = cleanedText.match(/linkedin\.com\/in\/([^\s/,]+)/i);
    const githubMatch = cleanedText.match(/github\.com\/([^\s/,]+)/i);
    const websiteMatch = cleanedText.match(/https?:\/\/(?!linkedin|github)[^\s,]+/i);

    const headerLines = sectionsMap['HEADER'] || [];
    let fullName = headerLines.find(
      (l) => l.length >= 2 && l.length < 50 && !l.includes('@') && !/\d/.test(l) && !l.includes('http')
    ) || cleanTitleName || 'Candidate';

    // Job title: only use a real header line if one is found. Do NOT guess a
    // generic title — an empty/"Needs review" value is more honest than a
    // fabricated "Software Engineer / Specialist" for every resume.
    let jobTitleRaw = headerLines.find(
      (l) => l !== fullName && !l.includes('@') && !l.includes('http') && !/\+?\d{7,}/.test(l) && l.length < 80
    ) || '';
    jobTitleRaw = jobTitleRaw.replace(/Noida|India|Delhi|USA|Remote|\|\s*\+?\d+.*/gi, '').trim();
    const jobTitle = jobTitleRaw || '';

    // Summary: only the user's actual summary/objective text. Never
    // synthesize a generic sentence when the section is missing.
    const summaryLines = sectionsMap['SUMMARY'] || [];
    const summary = summaryLines.join(' ').trim();

    // ─── 3. Education Extraction ──────────────────────────────────────────────
    const educationLines = sectionsMap['EDUCATION'] || [];
    const education: ParsedResumeData['education'] = [];
    if (educationLines.length > 0) {
      let inst = educationLines[0] || '';
      let degreeLine = educationLines.find((l) => /B\.Tech|B\.S|Bachelor|M\.S|Master|Diploma|Ph\.D/i.test(l)) || educationLines[1] || educationLines[0];
      const periodMatch = educationLines.join(' ').match(DATE_RANGE_RE);

      education.push({
        id: 'edu_1',
        degree: degreeLine || '',
        institution: inst && inst !== degreeLine ? inst : '',
        period: periodMatch?.[0] || '',
        location: '',
      });
    }

    // ─── 4. Experience Extraction ─────────────────────────────────────────────
    const expLines = sectionsMap['EXPERIENCE'] || [];
    const experiences: ParsedResumeData['experiences'] = [];
    let currentExp: any = null;

    expLines.forEach((line) => {
      const isHeaderLine = (line.includes('|') || line.includes(' at ') || line.includes(' — ') || /Intern|Engineer|Lead|Developer|Designer|Manager/i.test(line)) && line.length < 90 && !line.startsWith('•') && !line.startsWith('-');

      if (isHeaderLine) {
        if (currentExp && currentExp.bullets.length > 0) {
          experiences.push(currentExp);
        }
        let parts = line.split(/\||—| at /);
        let titlePart = parts[0]?.trim() || line;
        // Do not invent a company name — leave it flagged for review if the
        // line didn't actually contain one.
        let compPart = parts[1]?.trim() || '';
        const lineDate = line.match(DATE_RANGE_RE)?.[0];

        currentExp = {
          id: `exp_${experiences.length + 1}`,
          title: titlePart,
          company: compPart,
          period: lineDate || '',
          location: '',
          bullets: [],
        };
      } else if (currentExp) {
        const hasBulletMarker = BULLET_MARKER_RE.test(line);
        const cleanBullet = line.replace(BULLET_MARKER_RE, '').trim();
        if (cleanBullet.length > 3) {
          if (hasBulletMarker || currentExp.bullets.length === 0) {
            currentExp.bullets.push(cleanBullet);
          } else {
            const lastIdx = currentExp.bullets.length - 1;
            currentExp.bullets[lastIdx] = `${currentExp.bullets[lastIdx]} ${cleanBullet}`.trim();
          }
        }
      }
    });

    if (currentExp && currentExp.bullets.length > 0) {
      experiences.push(currentExp);
    }

    if (experiences.length === 0 && expLines.length > 0) {
      const rawBullets = expLines.filter((l) => l.length > 15).map((l) => l.replace(/^[●•*■–—\-]\s*/u, ''));
      if (rawBullets.length > 0) {
        experiences.push({
          id: 'exp_1',
          title: jobTitle || 'Experience',
          company: '',
          period: '',
          location: '',
          bullets: rawBullets.slice(0, 5),
        });
      }
    }
    // If there is no Experience section at all in the document, leave
    // `experiences` empty — do not invent a placeholder job.

    // ─── 5. Skills Extraction ─────────────────────────────────────────────────
    const skillLines = sectionsMap['SKILLS'] || [];
    let skills = skillLines.join(', ').replace(/\s{2,}/g, ' ').trim();
    if (!skills || skills.length < 5) {
      // Fall back to scanning the rest of the REAL document text for known
      // tech terms (this still only reports things actually present in the
      // file) — but never invent a generic skills list when nothing is found.
      const techKeywords = ['ChatGPT', 'Midjourney', 'Claude', 'Runway', 'Figma', 'Canva', 'HTML', 'CSS', 'C++', 'C', 'Java', 'MongoDB', 'SQL', 'Notion', 'React', 'Node.js', 'Python', 'TypeScript', 'Docker', 'AWS'];
      const found = techKeywords.filter((k) => new RegExp(`\\b${k}\\b`, 'i').test(cleanedText));
      skills = found.length > 0 ? found.join(', ') : '';
    }

    // ─── 6. Projects Extraction ───────────────────────────────────────────────
    // Delegates to the single shared grouping function (see groupProjectLines
    // above) instead of duplicating the line-classification logic here — the
    // same function also repairs already-corrupted saved data on load (see
    // normalizeProjects), so there is exactly one place that understands how
    // a Projects section's raw lines become real project objects.
    const projects: ProjectItem[] = groupProjectLines(sectionsMap['PROJECTS'] || []);

    // ─── 7. Achievements / Certifications Extraction ─────────────────────────
    const certLines = sectionsMap['ACHIEVEMENTS'] || [];
    const certificates: ParsedResumeData['certificates'] = certLines
      .filter((l) => l.length > 4)
      .map((l, i) => ({
        id: `cert_${i + 1}`,
        title: l.replace(/^[●•*■–—\-]\s*/u, '').trim(),
        issuer: '',
        date: '',
      }));

    return {
      title: fileName.replace(/\.(pdf|docx|doc|txt|rtf)$/i, ''),
      targetRole: jobTitle,
      personalInfo: {
        fullName,
        jobTitle,
        email: emailMatch?.[0] || '',
        phone: phoneMatch?.[0]?.trim() || '',
        location: '',
        website: websiteMatch?.[0] || '',
        github: githubMatch ? `https://github.com/${githubMatch[1]}` : '',
        linkedin: linkedinMatch ? `https://linkedin.com/in/${linkedinMatch[1]}` : '',
        summary,
      },
      skills,
      experiences,
      education,
      certificates,
      projects,
    };
  };
