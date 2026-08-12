import React, { useState } from 'react';
import { X, ArrowUpRight, CheckCircle2, Sparkles, FileText, Scan, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface QuickActionModalProps {
  actionType: 'build' | 'analyse' | 'assistant' | null;
  onClose: () => void;
}

export default function QuickActionModal({ actionType, onClose }: QuickActionModalProps) {
  const navigate = useNavigate();
  const [inputText, setInputText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  if (!actionType) return null;

  const getTitle = () => {
    switch (actionType) {
      case 'build':
        return 'BUILD RESUME WITH AI';
      case 'analyse':
        return 'ANALYSE ATS SCORE';
      case 'assistant':
        return 'AI CAREER COACH';
      default:
        return 'QUICK ACTION';
    }
  };

  const handleAction = (e: React.FormEvent) => {
    e.preventDefault();
    setAnalyzing(true);
    setResult(null);

    setTimeout(() => {
      setAnalyzing(false);
      if (actionType === 'build') {
        setResult('Draft generated successfully! Sign up to export or save your formatted PDF.');
      } else if (actionType === 'analyse') {
        setResult('ATS Match Score: 88/100. Keywords found: React, TypeScript, Node.js, System Design. Recommendation: Add 2 quantifiable metrics.');
      } else {
        setResult('AI Advice: Highlight leadership and technical impact in your experience bullet points.');
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white border border-slate-300 rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-400">01 ACTION</span>
            <span className="text-slate-300">/</span>
            <h3 className="font-mono text-xs sm:text-sm font-bold text-[#0B192C] tracking-wider uppercase">
              {getTitle()}
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
          {actionType === 'build' && (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">
                Paste your experience or role details below. HireFlow AI will structure it into an ATS-friendly resume format.
              </p>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="E.g., Senior Software Engineer with 3 years experience building React web applications..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0B192C]"
              />
            </div>
          )}

          {actionType === 'analyse' && (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">
                Paste your resume text or job description to run a instant line-by-line ATS parsing scan.
              </p>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your resume content or job requirements here..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0B192C]"
              />
            </div>
          )}

          {actionType === 'assistant' && (
            <div className="space-y-4">
              <p className="text-slate-600 text-sm">
                Ask your career coach any question about resume phrasing, interview answers, or salary negotiation.
              </p>
              <textarea
                rows={4}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="E.g. How should I describe my project experience for a Full Stack role?"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 text-sm focus:outline-none focus:border-[#0B192C]"
              />
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-3">
              <CheckCircle2 size={18} className="text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-slate-700 font-sans leading-relaxed">
                {result}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={handleAction}
            disabled={analyzing}
            className="bg-[#0B192C] text-white px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            {analyzing ? (
              <span>Processing...</span>
            ) : (
              <>
                <span>Run with AI</span>
                <ArrowUpRight size={14} />
              </>
            )}
          </button>

          {result && (
            <button
              onClick={() => {
                onClose();
                if (actionType === 'build') navigate('/app/editor');
                else if (actionType === 'analyse') navigate('/app/ats');
                else navigate('/app/assistant');
              }}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              Open Workspace Feature
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
