import React from 'react';
import ResumeTemplateRenderer from './ResumeTemplateRenderer';
import type { TemplateLayoutConfig } from '../../services/templateConfig.service';
import type { PreviewResumeData } from './previewData';

/**
 * ModernProfessionalTemplate — a thin wrapper around the shared rendering engine.
 * No resume data lives here; it always receives the same
 * PreviewResumeData / real resume data as every other template.
 */
export default function ModernProfessionalTemplate({ layout, data }: { layout: TemplateLayoutConfig; data: PreviewResumeData }) {
  return <ResumeTemplateRenderer layout={layout} variant="modern-professional" data={data} />;
}
