/**
 * Shape used to render a resume in list views (Dashboard, etc.).
 * Populated from real backend/service data — never from seeded demo data.
 */
export interface ResumeItem {
  id: string;
  title: string;
  targetRole: string;
  lastModified: string;
  updatedAt: string;
  atsScore: number;
  healthScore: number;
  tailorScore: number;
  templateName: string;
  fileSize: string;
  status: 'Published' | 'Draft' | 'Tailored';
  version: string;
}
