import React from 'react';
import ResumeTemplateRenderer from './ResumeTemplateRenderer';
import type { TemplateLayoutConfig } from '../../services/templateConfig.service';
import type { PreviewResumeData } from './previewData';

/**
 * ExecutiveTemplate — a thin wrapper around the shared rendering engine.
 * No resume data lives here; it always receives the same
 * PreviewResumeData / real resume data as every other template.
 */
export default function ExecutiveTemplate({ layout, data }: { layout: TemplateLayoutConfig; data: PreviewResumeData }) {
  return <ResumeTemplateRenderer layout={layout} variant="executive" data={data} />;
}
