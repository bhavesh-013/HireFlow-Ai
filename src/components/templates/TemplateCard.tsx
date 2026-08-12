import React from 'react';
import { Heart, Eye, Sparkles } from 'lucide-react';
import type { AtsTemplateItem } from '../../services/templateConfig.service';
import type { PreviewResumeData } from './previewData';
import { getTemplateComponent } from './templateRegistry';

interface Props {
  template: AtsTemplateItem;
  data: PreviewResumeData;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onPreview: () => void;
  onUse: () => void;
}

export default function TemplateCard({ template, data, isFavorite, onToggleFavorite, onPreview, onUse }: Props) {
  const TemplateComponent = getTemplateComponent(template.id);

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs hover:shadow-lg hover:border-slate-300 transition-all group flex flex-col justify-between">
      {/* Real, rendered resume preview — scaled, not an image */}
      <div className="relative h-64 bg-slate-100 overflow-hidden border-b border-slate-200/80">
        <div
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: '340px', height: '440px', transform: 'scale(0.75)' }}
        >
          <TemplateComponent layout={template.layout} data={data} />
        </div>

        <button
          onClick={onToggleFavorite}
          className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg backdrop-blur-sm border transition-colors cursor-pointer ${
            isFavorite
              ? 'bg-red-50/90 border-red-200 text-red-600'
              : 'bg-white/80 border-slate-200 text-slate-500 hover:text-red-600'
          }`}
          title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart size={14} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>

        <div className="absolute inset-x-0 bottom-0 p-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-slate-950/50 via-slate-950/10 to-transparent">
          <button
            onClick={onPreview}
            className="flex-1 bg-white/95 hover:bg-white text-[#0B192C] font-bold text-[11px] py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye size={13} />
            <span>Preview</span>
          </button>
          <button
            onClick={onUse}
            className="flex-1 bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-[11px] py-2 rounded-lg shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Sparkles size={13} className="text-blue-400" />
            <span>Use Template</span>
          </button>
        </div>
      </div>

      {/* Info content — honest, factual, no ratings/downloads */}
      <div className="p-4 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-[#0B192C]">{template.name}</h3>
          <span className="bg-slate-100 text-slate-600 text-[10px] font-bold font-mono px-2 py-0.5 rounded-md whitespace-nowrap">
            {template.category}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{template.description}</p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {template.infoTags.map((tag) => (
            <span key={tag} className="text-[10px] font-mono font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {template.resumeType.map((rt) => (
            <span key={rt} className="text-[10px] font-mono font-semibold text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded capitalize">
              {rt}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
