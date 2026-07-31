import React from 'react';
import { X, ArrowUpRight, Check, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface TemplateModalProps {
  templateId: string | null;
  onClose: () => void;
}

export default function TemplateModal({ templateId, onClose }: TemplateModalProps) {
  const navigate = useNavigate();

  if (!templateId) return null;

  const getTemplateInfo = () => {
    switch (templateId) {
      case '1':
        return {
          title: 'STANDARD ATS EXECUTIVE',
          description: 'A clean 2-column sidebar layout optimized for tech leads and senior engineers. Maximizes content density with strict section hierarchy.',
          features: ['99.4% ATS Parsing Rate', 'Compact 2-Column Format', 'Skills & Impact Highlights']
        };
      case '2':
        return {
          title: 'CLASSIC SINGLE COLUMN',
          description: 'The universally recommended single-column layout for top software companies, startups, and enterprise applications.',
          features: ['100% Keyword Compliance', 'Optimal Bullet Reader', 'PDF & Word Export Ready']
        };
      case '3':
        return {
          title: 'MODERN MINIMALIST',
          description: 'Designed for product engineers and creative technologists. Features balanced whitespace with precise serif/sans typographic pairings.',
          features: ['Clean Visual Hierarchy', 'Custom Education Blocks', 'Interactive Link Formatting']
        };
      default:
        return {
          title: 'TECHNICAL CORE RESUME',
          description: 'Tailored for specialized engineering disciplines, data analysis, and technical project management.',
          features: ['Multi-Project Bullet Grid', 'Certifications & Skills Index', 'Real-time Line Tuning']
        };
    }
  };

  const info = getTemplateInfo();

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
          {/* Mock Document Graphic */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col gap-2 shadow-inner">
            <div className="h-4 bg-slate-800 rounded w-1/3 mb-1" />
            <div className="h-2 bg-slate-400 rounded w-1/2 mb-4" />
            <div className="h-2 bg-slate-300 rounded w-full" />
            <div className="h-2 bg-slate-300 rounded w-5/6" />
            <div className="h-2 bg-slate-300 rounded w-4/6" />
            <div className="h-3 bg-slate-600 rounded w-1/4 mt-4 mb-1" />
            <div className="h-2 bg-slate-300 rounded w-full" />
            <div className="h-2 bg-slate-300 rounded w-11/12" />
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
              navigate('/app/editor');
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
