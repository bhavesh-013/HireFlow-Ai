import React from 'react';
import { X } from 'lucide-react';

interface InfoModalProps {
  title: string | null;
  content: string | null;
  onClose: () => void;
}

export default function InfoModal({ title, content, onClose }: InfoModalProps) {
  if (!title || !content) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400">INFO</span>
            <span className="text-slate-300">/</span>
            <h3 className="font-mono text-xs sm:text-sm font-bold text-[#0B192C] tracking-wider uppercase">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="my-6">
          <p className="text-slate-700 text-sm leading-relaxed">
            {content}
          </p>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="bg-[#0B192C] text-white px-5 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
