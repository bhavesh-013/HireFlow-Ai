import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Check, ArrowUpRight } from 'lucide-react';
import { templatesConfigService } from '../services/templateConfig.service';
import { getPreviewResumeData } from './templates/previewData';
import { getTemplateComponent } from './templates/templateRegistry';

interface TemplateModalProps {
  templateId: string | null;
  onClose: () => void;
}

export default function TemplateModal({ templateId, onClose }: TemplateModalProps) {
  const navigate = useNavigate();

  if (!templateId) return null;

  const tmpl = templatesConfigService.getTemplateById(templateId) || templatesConfigService.getAllTemplates()[0];
  const TemplateComponent = getTemplateComponent(tmpl.id);
  const previewData = getPreviewResumeData();
  const info = {
    title: tmpl.name.toUpperCase(),
    description: tmpl.description,
    features: [
      'ATS Single-Column Format',
      'Table-Free & Graphics-Free (Parser Safe)',
      'PDF & Word Export Ready',
      `${tmpl.category} Industry Optimized`
    ],
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400">04 TEMPLATE</span>
            <span className="text-slate-300">/</span>
            <h3 className="font-mono text-xs sm:text-sm font-bold text-[#0B192C] tracking-wider uppercase">
              {info.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-6 space-y-4">
          {/* Real, rendered template preview — not a mock graphic */}
          <div className="bg-slate-100 border border-slate-200 rounded-xl overflow-hidden shadow-inner flex justify-center p-4">
            <div className="border border-slate-200 shadow-md" style={{ width: '340px', height: '440px' }}>
              <TemplateComponent layout={tmpl.layout} data={previewData} />
            </div>
          </div>

          <p className="text-slate-600 text-sm">
            {info.description}
          </p>

          <div className="space-y-2 pt-2">
            <h4 className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
              HIGHLIGHTS
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {info.features.map((f, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Check size={14} className="text-emerald-600 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Close
          </button>
          
          <button
            onClick={() => {
              onClose();
              navigate(`/app/builder?template=${tmpl.id}`);
            }}
            className="bg-[#0B192C] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <span>Use Template</span>
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
