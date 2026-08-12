import templatesData from '../data/templatesConfig.json';
import type { ResumeType } from '../types';

export interface TemplateLayoutConfig {
  fontFamily: string;
  primaryColor: string;
  accentColor: string;
  textColor: string;
  headerAlignment: 'left' | 'center' | 'right';
  headerStyle: 'modern' | 'classic' | 'minimal' | 'harvard' | 'stanford' | 'bold';
  sectionBorder: 'bottom-line' | 'none' | 'double-line' | 'accent-left';
  sectionTitleTransform: 'uppercase' | 'capitalize' | 'none';
  sectionTitleFont: 'bold' | 'extrabold' | 'medium';
  singleColumn: boolean;
  noTables: boolean;
  noGraphics: boolean;
}

/**
 * A real, selectable resume template. Every field here is either a
 * structural/typographic fact about the layout (fontFamily, headerStyle...)
 * or an honest descriptive label — never a rating, download count, or
 * marketing badge. See templatesConfig.json for the actual data.
 */
export interface AtsTemplateItem {
  id: string;
  name: string;
  /** Legacy single-category label, kept for the compact template pickers
   *  inside the Resume Editor (dropdown + styling panel). */
  category: string;
  /** Filterable/searchable tags shown on the Templates page. Drawn from:
   *  ATS, Fresher, Experienced, Tech, Minimal, Professional. */
  tags: string[];
  /** Which explicit resume type(s) this template is designed for. */
  resumeType: ResumeType[];
  description: string;
  /** Short, factual info chips shown on the template card (never stats). */
  infoTags: string[];
  layout: TemplateLayoutConfig;
}

export const templatesConfigService = {
  getAllTemplates(): AtsTemplateItem[] {
    return templatesData as AtsTemplateItem[];
  },

  getTemplateById(id: string): AtsTemplateItem | undefined {
    const list = this.getAllTemplates();
    return list.find((t) => t.id === id || t.name.toLowerCase() === id.toLowerCase());
  },

  getTemplatesByCategory(category: string): AtsTemplateItem[] {
    const list = this.getAllTemplates();
    if (category === 'All') return list;
    return list.filter((t) => t.tags.some((tag) => tag.toLowerCase() === category.toLowerCase()));
  },

  getTemplatesByResumeType(resumeType: ResumeType): AtsTemplateItem[] {
    return this.getAllTemplates().filter((t) => t.resumeType.includes(resumeType));
  },

  searchTemplates(query: string): AtsTemplateItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getAllTemplates();
    return this.getAllTemplates().filter((t) =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q)) ||
      t.resumeType.some((rt) => rt.toLowerCase().includes(q)) ||
      t.description.toLowerCase().includes(q)
    );
  },

  toResumeStyling(template: AtsTemplateItem) {
    return {
      fontFamily: template.layout.fontFamily,
      primaryColor: template.layout.primaryColor,
      accentColor: template.layout.accentColor,
      textColor: template.layout.textColor,
      backgroundColor: '#FFFFFF',
      fontSize: 'normal',
      lineHeight: 'normal',
      sectionSpacing: 'normal',
      headerAlignment: template.layout.headerAlignment,
      headerStyle: template.layout.headerStyle,
      sectionBorder: template.layout.sectionBorder,
    };
  },
};

export default templatesConfigService;
