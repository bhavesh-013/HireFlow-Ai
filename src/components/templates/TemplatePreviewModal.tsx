import React from 'react';
import { X, Sparkles } from 'lucide-react';
import type { AtsTemplateItem } from '../../services/templateConfig.service';
import type { PreviewResumeData } from './previewData';
import { getTemplateComponent } from './templateRegistry';

interface Props {
  template: AtsTemplateItem | null;
  data: PreviewResumeData;
  onClose: () => void;
  onUse: (templateId: string) => void;
}

export default function TemplatePreviewModal({ template, data, onClose, onUse }: Props) {
  if (!template) return null;
  const TemplateComponent = getTemplateComponent(template.id);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 sticky top-0 bg-white z-10">
          <h3 className="font-black text-lg text-[#0B192C] tracking-tight">{template.name}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-800 transition-colors cursor-pointer">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Real, full-size rendered template */}
          <div className="w-full flex justify-center">
            <div
              className="border border-slate-200 shadow-lg rounded-xs overflow-hidden"
              style={{ width: '680px', height: '880px' }}
            >
              <TemplateComponent layout={template.layout} data={data} />
            </div>
          </div>

          <div className="max-w-xl mx-auto space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed">{template.description}</p>
            <div className="flex flex-wrap gap-1.5">
              {template.infoTags.map((tag) => (
                <span key={tag} className="text-[10px] font-mono font-semibold text-slate-600 bg-slate-50 border border-slate-200 px-2 py-1 rounded">
                  {tag}
                </span>
              ))}
              {template.resumeType.map((rt) => (
                <span key={rt} className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded capitalize">
                  {rt}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 sticky bottom-0 bg-white">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => onUse(template.id)}
            className="bg-[#0B192C] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Sparkles size={14} className="text-blue-400" />
            <span>Use This Template</span>
          </button>
        </div>
      </div>
    </div>
  );
}
