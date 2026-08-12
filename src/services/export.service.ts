/**
 * HireFlow Production Export & Document Rendering Engine
 * ───────────────────────────────────────────────────────
 * Core Principle: ResumeData -> Template Engine -> Live Preview -> PDF Exporter -> DOCX Exporter.
 * Live Preview, PDF Export, and DOCX Export ALL consume the EXACT SAME active ParsedResumeData object.
 * ZERO HARDCODED OR DEMO DATA DURING EXPORT.
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  ExternalHyperlink,
  Packer,
  BorderStyle,
  AlignmentType,
  UnderlineType,
} from 'docx';
import type { ParsedResumeData, SectionNavItem } from '../types';
import { getDefaultSectionItems } from './section.reorder';
import { templatesConfigService, type AtsTemplateItem } from './templateConfig.service';

/**
 * Produces clean, safe filenames for PDF and DOCX downloads.
 * Example: "Bhavesh_Kumawat_Resume.pdf" or "Bhavesh_Kumawat_Frontend_Developer_Resume.docx"
 */
export function generateSafeFilename(
  resumeData: ParsedResumeData,
  ext: 'pdf' | 'docx' = 'pdf'
): string {
  const name = (resumeData.personalInfo?.fullName || 'Resume')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_');
  
  const role = (resumeData.targetRole || resumeData.personalInfo?.jobTitle || '')
    .trim()
    .replace(/[^a-zA-Z0-9]/g, '_')
    .replace(/_+/g, '_');

  const base = role && role.toLowerCase() !== 'software_engineer' ? `${name}_${role}_Resume` : `${name}_Resume`;
  return `${base}.${ext}`;
}

/**
 * Validates obvious URLs and ensures proper http/https scheme.
 */
function sanitizeUrl(rawUrl?: string): string | null {
  if (!rawUrl || rawUrl.trim().length < 4) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
  if (trimmed.includes('github.com/') || trimmed.includes('linkedin.com/') || trimmed.includes('.')) {
    return `https://${trimmed}`;
  }
  return null;
}

/**
 * Generates a REAL, valid Microsoft Word .docx binary file using the `docx` package.
 * Respects user's selected section order, section visibility, template styling, and resumeType hierarchy.
 */
export async function generateDocxBlob(
  resumeData: ParsedResumeData,
  templateName: string = 'Modern Executive'
): Promise<Blob> {
  const tmpl = templatesConfigService.getTemplateById(templateName);
  const primaryColor = tmpl?.layout?.primaryColor || '#0B192C';
  const accentColor = tmpl?.layout?.accentColor || '#2563EB';
  const isFresher = resumeData.resumeType === 'fresher';

  // Section order & visibility
  const defaultSections = getDefaultSectionItems(resumeData.resumeType || 'experienced');
  const sectionsToRender: SectionNavItem[] = (
    resumeData.sectionsOrder || defaultSections
  ).filter((s) => s.visible);

  const docParagraphs: Paragraph[] = [];

  // ── 1. Contact Header ─────────────────────────────────────────────────────
  const fullName = resumeData.personalInfo?.fullName || 'Untitled Candidate';
  const jobTitle = resumeData.personalInfo?.jobTitle || resumeData.targetRole || '';

  docParagraphs.push(
    new Paragraph({
      alignment: AlignmentType.LEFT,
      heading: HeadingLevel.TITLE,
      children: [
        new TextRun({
          text: fullName,
          bold: true,
          size: 32, // 16pt
          color: primaryColor ? primaryColor.replace('#', '') : '0B192C',
        }),
      ],
    })
  );

  if (jobTitle) {
    docParagraphs.push(
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          new TextRun({
            text: jobTitle,
            bold: true,
            size: 24, // 12pt
            color: accentColor ? accentColor.replace('#', '') : '2563EB',
          }),
        ],
      })
    );
  }

  // Contact Meta Line
  const contactParts: string[] = [
    resumeData.personalInfo?.email,
    resumeData.personalInfo?.phone,
    resumeData.personalInfo?.location,
  ].filter(Boolean) as string[];

  if (contactParts.length > 0) {
    docParagraphs.push(
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: contactParts.join('  •  '),
            size: 19, // 9.5pt
            color: '475569',
          }),
        ],
      })
    );
  }

  // Links line (LinkedIn, GitHub, Portfolio)
  const linkChildren: (TextRun | ExternalHyperlink)[] = [];
  const linkedinUrl = sanitizeUrl(resumeData.personalInfo?.linkedin);
  const githubUrl = sanitizeUrl(resumeData.personalInfo?.github);
  const websiteUrl = sanitizeUrl(resumeData.personalInfo?.website);

  if (linkedinUrl) {
    linkChildren.push(
      new ExternalHyperlink({
        children: [new TextRun({ text: 'LinkedIn Profile', style: 'Hyperlink', size: 18, color: '2563EB', underline: { type: UnderlineType.SINGLE } })],
        link: linkedinUrl,
      })
    );
  }
  if (githubUrl) {
    if (linkChildren.length > 0) linkChildren.push(new TextRun({ text: '  •  ', size: 18, color: '475569' }));
    linkChildren.push(
      new ExternalHyperlink({
        children: [new TextRun({ text: 'GitHub Portfolio', style: 'Hyperlink', size: 18, color: '2563EB', underline: { type: UnderlineType.SINGLE } })],
        link: githubUrl,
      })
    );
  }
  if (websiteUrl) {
    if (linkChildren.length > 0) linkChildren.push(new TextRun({ text: '  •  ', size: 18, color: '475569' }));
    linkChildren.push(
      new ExternalHyperlink({
        children: [new TextRun({ text: 'Website', style: 'Hyperlink', size: 18, color: '2563EB', underline: { type: UnderlineType.SINGLE } })],
        link: websiteUrl,
      })
    );
  }

  if (linkChildren.length > 0) {
    docParagraphs.push(
      new Paragraph({
        spacing: { after: 200 },
        children: linkChildren,
      })
    );
  }

  // Helper for Section Heading
  const addSectionHeading = (title: string) => {
    docParagraphs.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 80 },
        border: {
          bottom: { color: 'CBD5E1', space: 4, style: BorderStyle.SINGLE, size: 6 },
        },
        children: [
          new TextRun({
            text: title.toUpperCase(),
            bold: true,
            size: 22, // 11pt
            color: primaryColor ? primaryColor.replace('#', '') : '0B192C',
          }),
        ],
      })
    );
  };

  // ── 2. Sections in User-Customized Order ──────────────────────────────────
  sectionsToRender.forEach((sec) => {
    // SUMMARY
    if (sec.type === 'summary' && resumeData.personalInfo?.summary) {
      addSectionHeading(sec.title || 'Professional Summary');
      docParagraphs.push(
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: resumeData.personalInfo.summary,
              size: 20, // 10pt
              color: '1E293B',
            }),
          ],
        })
      );
    }

    // EXPERIENCE
    else if (sec.type === 'experience' && resumeData.experiences && resumeData.experiences.length > 0) {
      addSectionHeading(sec.title || 'Work Experience');
      resumeData.experiences.forEach((exp) => {
        docParagraphs.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: [
              new TextRun({ text: exp.title || 'Position', bold: true, size: 21, color: '0B192C' }),
              new TextRun({ text: exp.company ? `  —  ${exp.company}` : '', bold: true, size: 21, color: '334155' }),
              new TextRun({ text: exp.period ? ` (${exp.period})` : '', size: 19, color: '64748B' }),
            ],
          })
        );

        (exp.bullets || []).forEach((b) => {
          if (!b || !b.trim()) return;
          docParagraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [new TextRun({ text: b.trim(), size: 20, color: '1E293B' })],
            })
          );
        });
      });
    }

    // SKILLS
    else if (sec.type === 'skills' && resumeData.skills) {
      addSectionHeading(sec.title || 'Technical Skills');
      docParagraphs.push(
        new Paragraph({
          spacing: { after: 140 },
          children: [
            new TextRun({
              text: resumeData.skills,
              size: 20,
              color: '1E293B',
            }),
          ],
        })
      );
    }

    // PROJECTS
    else if (sec.type === 'projects' && resumeData.projects && resumeData.projects.length > 0) {
      addSectionHeading(sec.title || 'Projects');
      resumeData.projects.forEach((proj) => {
        // Title + compact "GitHub | Live" links on the same line — never a
        // large heading, never a fabricated URL if none was actually found.
        const projHeaderChildren: (TextRun | ExternalHyperlink)[] = [
          new TextRun({ text: proj.title || 'Project', bold: true, size: 21, color: '0B192C' }),
        ];

        const githubUrl = sanitizeUrl(proj.link);
        const liveUrl = sanitizeUrl(proj.demoUrl);
        if (githubUrl || liveUrl) {
          projHeaderChildren.push(new TextRun({ text: '   ', size: 18 }));
          if (githubUrl) {
            projHeaderChildren.push(
              new ExternalHyperlink({
                children: [new TextRun({ text: 'GitHub', style: 'Hyperlink', size: 18, color: '2563EB' })],
                link: githubUrl,
              })
            );
          }
          if (githubUrl && liveUrl) {
            projHeaderChildren.push(new TextRun({ text: '  |  ', size: 18, color: '64748B' }));
          }
          if (liveUrl) {
            projHeaderChildren.push(
              new ExternalHyperlink({
                children: [new TextRun({ text: 'Live', style: 'Hyperlink', size: 18, color: '2563EB' })],
                link: liveUrl,
              })
            );
          }
        }

        docParagraphs.push(
          new Paragraph({
            spacing: { before: 120, after: 40 },
            children: projHeaderChildren,
          })
        );

        if (proj.description) {
          docParagraphs.push(
            new Paragraph({
              spacing: { after: 40 },
              children: [new TextRun({ text: proj.description, size: 20, color: '334155' })],
            })
          );
        }

        (proj.bullets || []).forEach((b) => {
          if (!b || !b.trim()) return;
          docParagraphs.push(
            new Paragraph({
              bullet: { level: 0 },
              spacing: { after: 40 },
              children: [new TextRun({ text: b.trim(), size: 20, color: '1E293B' })],
            })
          );
        });

        const techStack = (proj.techStack || []).filter((t) => t && t.trim() && t.toLowerCase() !== 'unknown');
        if (techStack.length > 0) {
          docParagraphs.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({ text: 'Tech: ', bold: true, size: 18, color: '64748B' }),
                new TextRun({ text: techStack.join(', '), size: 18, color: '64748B' }),
              ],
            })
          );
        }
      });
    }

    // EDUCATION
    else if (sec.type === 'education' && resumeData.education && resumeData.education.length > 0) {
      addSectionHeading(sec.title || 'Education');
      resumeData.education.forEach((edu) => {
        docParagraphs.push(
          new Paragraph({
            spacing: { before: 100, after: 40 },
            children: [
              new TextRun({ text: edu.degree || 'Degree', bold: true, size: 21, color: '0B192C' }),
              new TextRun({ text: edu.institution ? `  —  ${edu.institution}` : '', size: 20, color: '334155' }),
              new TextRun({ text: edu.period ? ` (${edu.period})` : '', size: 19, color: '64748B' }),
            ],
          })
        );
      });
    }

    // CERTIFICATES
    else if (sec.type === 'certificates' && resumeData.certificates && resumeData.certificates.length > 0) {
      addSectionHeading(sec.title || 'Certifications');
      resumeData.certificates.forEach((cert) => {
        docParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: cert.title || 'Certification', bold: true, size: 20, color: '0B192C' }),
              new TextRun({ text: cert.issuer ? `  —  ${cert.issuer}` : '', size: 20, color: '334155' }),
              new TextRun({ text: cert.date ? ` (${cert.date})` : '', size: 19, color: '64748B' }),
            ],
          })
        );
      });
    }

    // ACHIEVEMENTS
    else if (sec.type === 'achievements' && resumeData.achievements && resumeData.achievements.length > 0) {
      addSectionHeading(sec.title || 'Achievements');
      resumeData.achievements.forEach((ach) => {
        docParagraphs.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [
              new TextRun({ text: ach.title || 'Achievement', bold: true, size: 20, color: '0B192C' }),
              new TextRun({ text: ach.description ? `  —  ${ach.description}` : '', size: 20, color: '334155' }),
              new TextRun({ text: ach.date ? ` (${ach.date})` : '', size: 19, color: '64748B' }),
            ],
          })
        );
      });
    }
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: 720, bottom: 720, left: 720, right: 720 }, // 0.5 in margins for compact 1-page target
          },
        },
        children: docParagraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

/**
 * Triggers DOCX download using native document binary.
 */
export async function downloadDocxExport(
  resumeData: ParsedResumeData,
  templateName: string = 'Modern Executive'
): Promise<string> {
  const blob = await generateDocxBlob(resumeData, templateName);
  const filename = generateSafeFilename(resumeData, 'docx');

  if (typeof window !== 'undefined' && window.document) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return filename;
}

export default {
  generateSafeFilename,
  generateDocxBlob,
  downloadDocxExport,
};
