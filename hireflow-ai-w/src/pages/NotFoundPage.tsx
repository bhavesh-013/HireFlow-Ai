import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Home, HelpCircle } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="max-w-md mx-auto my-12 sm:my-20 text-center">
      {/* Page Header Tag */}
      <div className="flex items-center gap-3 mb-8">
        <span className="font-mono text-xs font-bold text-slate-400 tracking-widest">404</span>
        <h2 className="font-mono text-sm font-bold text-[#0B192C] tracking-widest uppercase">
          PAGE NOT FOUND
        </h2>
        <div className="flex-1 border-b border-slate-300/70 ml-2" />
      </div>

      {/* Card */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-xl space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-[#0B192C] mb-2">
          <HelpCircle size={32} />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black text-[#0B192C] tracking-tight">
            404 Error
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            The workspace route you are looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="bg-[#0B192C] text-white w-full py-3.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Home size={16} />
            <span>Return to Workspace</span>
            <ArrowUpRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
