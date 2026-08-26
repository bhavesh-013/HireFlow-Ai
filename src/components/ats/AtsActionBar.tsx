import React, { useState } from 'react';
import {
  Sparkles,
  Download,
  Copy,
  Check,
  Edit3,
  Save,
  Share2,
  FileDown,
  Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ParsedResumeData } from '../../types';

interface AtsActionBarProps {
  optimizedResume: ParsedResumeData;
  scoreLift: number;
  onSaveTailored?: (resume: ParsedResumeData) => Promise<void>;
}

export default function AtsActionBar({
  optimizedResume,
  scoreLift,
  onSaveTailored,
}: AtsActionBarProps) {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleApplyToEditor = () => {
    try {
      localStorage.setItem('hireflow_current_resume', JSON.stringify(optimizedResume));
      localStorage.setItem('hireflow_builder_data', JSON.stringify(optimizedResume));
    } catch {}

    // Navigate to Resume Editor with the optimized state
    navigate('/editor', { state: { resumeData: optimizedResume, fromAtsOptimization: true } });
  };

  const handleCopyText = () => {
    let plainText = `${optimizedResume.personalInfo?.fullName || 'Candidate'}\n`;
    plainText += `${optimizedResume.personalInfo?.jobTitle || ''}\n`;
    plainText += `${optimizedResume.personalInfo?.email || ''} | ${optimizedResume.personalInfo?.phone || ''} | ${optimizedResume.personalInfo?.location || ''}\n\n`;

    if (optimizedResume.personalInfo?.summary) {
      plainText += `PROFESSIONAL SUMMARY\n${optimizedResume.personalInfo.summary}\n\n`;
    }

    if (optimizedResume.skills) {
      plainText += `TECHNICAL SKILLS\n${optimizedResume.skills}\n\n`;
    }

    if (optimizedResume.experiences && optimizedResume.experiences.length > 0) {
      plainText += `WORK EXPERIENCE\n`;
      optimizedResume.experiences.forEach((exp) => {
        plainText += `${exp.title} - ${exp.company} (${exp.period})\n`;
        (exp.bullets || []).forEach((b) => {
          plainText += `• ${b}\n`;
        });
        plainText += `\n`;
      });
    }

    if (optimizedResume.projects && optimizedResume.projects.length > 0) {
      plainText += `PROJECTS\n`;
      optimizedResume.projects.forEach((proj) => {
        plainText += `${proj.title}\n`;
        if (proj.description) plainText += `${proj.description}\n`;
        (proj.bullets || []).forEach((b) => {
          plainText += `• ${b}\n`;
        });
        plainText += `\n`;
      });
    }

    navigator.clipboard.writeText(plainText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(optimizedResume, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${(optimizedResume.personalInfo?.fullName || 'resume').replace(/\s+/g, '_')}_ats_optimized.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleSaveTailored = async () => {
    if (onSaveTailored) {
      setIsSaving(true);
      try {
        await onSaveTailored(optimizedResume);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      } finally {
        setIsSaving(false);
      }
    }
  };

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl flex flex-wrap items-center justify-between gap-4 sticky bottom-4 z-40 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
          <Sparkles size={22} className="text-emerald-300 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-base font-bold text-white tracking-tight">
              Ready to use your optimized resume?
            </h4>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              +{scoreLift} pts projected ATS boost
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Apply changes directly to the live editor or export to apply to jobs.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        <button
          type="button"
          onClick={handleCopyText}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer"
        >
          {copied ? (
            <>
              <Check size={14} className="text-emerald-400" />
              <span className="text-emerald-400">Copied Plain Text</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copy Text</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={handleDownloadJSON}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer"
        >
          <FileDown size={14} />
          <span>Export JSON</span>
        </button>

        {onSaveTailored && (
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveTailored}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 transition-all cursor-pointer"
          >
            {savedSuccess ? (
              <>
                <Check size={14} className="text-emerald-400" />
                <span className="text-emerald-400">Saved to Cloud</span>
              </>
            ) : (
              <>
                <Save size={14} />
                <span>{isSaving ? 'Saving...' : 'Save Tailored Copy'}</span>
              </>
            )}
          </button>
        )}

        <button
          type="button"
          onClick={handleApplyToEditor}
          className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Edit3 size={15} />
          <span>Apply to Resume Editor</span>
        </button>
      </div>
    </div>
  );
}
