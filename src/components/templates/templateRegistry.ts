import type { ComponentType } from 'react';
import type { TemplateLayoutConfig } from '../../services/templateConfig.service';
import type { PreviewResumeData } from './previewData';
import ATSClassicTemplate from './ATSClassicTemplate';
import ModernProfessionalTemplate from './ModernProfessionalTemplate';
import TechnicalTemplate from './TechnicalTemplate';
import MinimalTemplate from './MinimalTemplate';
import ExecutiveTemplate from './ExecutiveTemplate';

type TemplateComponent = ComponentType<{ layout: TemplateLayoutConfig; data: PreviewResumeData }>;

/**
 * Maps a template id (from templatesConfig.json) to the real React
 * component that renders it. Metadata (name, tags, description, layout)
 * stays in templateConfig.service — this registry only owns "how to draw
 * it", so there is exactly one place that duplicates nothing.
 */
export const templateComponentRegistry: Record<string, TemplateComponent> = {
  'ats-classic': ATSClassicTemplate,
  'modern-professional': ModernProfessionalTemplate,
  'technical': TechnicalTemplate,
  'minimal': MinimalTemplate,
  'executive': ExecutiveTemplate,
};

export function getTemplateComponent(id: string): TemplateComponent {
  return templateComponentRegistry[id] || ATSClassicTemplate;
}
