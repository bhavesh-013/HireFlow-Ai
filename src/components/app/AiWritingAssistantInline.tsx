import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Wand2,
  Check,
  X,
  Undo,
  AlertCircle,
  Eye,
  RefreshCw,
  Zap,
  Info,
  ChevronDown,
  CornerDownRight
} from 'lucide-react';
import { validateField, type ValidationIssue } from '../../services/resume.validator';
import { aiService, type WritingAssistParams } from '../../services/ai.service';

export interface AiWritingAssistantInlineProps {
  value: string;
  onChange: (newValue: string) => void;
  section: 'summary' | 'experience' | 'projects' | 'skills' | 'education' | 'certificates';
  itemId?: string;
  label?: string;
  multiline?: boolean;
  rows?: number;
  placeholder?: string;
  jdText?: string;
  className?: string;
}

export function AiWritingAssistantInline({
  value,
  onChange,
  section,
  itemId,
  label,
  multiline = false,
  rows = 3,
  placeholder = 'Type here...',
  jdText,
  className = '',
}: AiWritingAssistantInlineProps) {
  const [issues, setIssues] = useState<ValidationIssue[]>([]);
  const [activeIssue, setActiveIssue] = useState<ValidationIssue | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiActionType, setAiActionType] = useState<string>('');
  const [aiSuggestion, setAiSuggestion] = useState<{
    original: string;
    suggested: string;
    reason: string;
    type: string;
  } | null>(null);

  // Undo history stack
  const [previousValue, setPreviousValue] = useState<string | null>(null);
  const [showUndo, setShowUndo] = useState(false);

  // Debounced live local validation (200ms debounce — zero LLM calls while typing!)
  useEffect(() => {
    const timer = setTimeout(() => {
      const detected = validateField(value, section, itemId);
      setIssues(detected);
    }, 200);

    return () => clearTimeout(timer);
  }, [value, section, itemId]);

  // Contextual AI Actions triggering explicit Gemini/Claude API calls
  const handleAiAction = async (action: WritingAssistParams['action']) => {
    if (!value || value.trim().length < 3) return;
    setIsAiLoading(true);
    setAiActionType(action);

    try {
      const res = await aiService.assistWriting({
        text: value,
        action,
        section,
        jdText,
      });

      if (res && res.suggested) {
        setAiSuggestion({
          original: value,
          suggested: res.suggested,
          reason: res.reason || 'AI optimization grounded in factual content.',
          type: res.type || action,
        });
      }
    } catch (err) {
      console.warn('AI Writing Assistant request notice:', err);
    } finally {
      setIsAiLoading(false);
    }
  };

  // User Approval Flow: Apply
  const handleApplySuggestion = (suggestedText: string) => {
    setPreviousValue(value);
    setShowUndo(true);
    onChange(suggestedText);
    setAiSuggestion(null);
    setActiveIssue(null);
  };

  // User Approval Flow: Dismiss / Reject
  const handleDismiss = () => {
    setAiSuggestion(null);
    setActiveIssue(null);
  };

  // User Approval Flow: Undo
  const handleUndo = () => {
    if (previousValue !== null) {
      onChange(previousValue);
      setPreviousValue(null);
      setShowUndo(false);
    }
  };

  return (
    <div className={`space-y-1.5 relative font-sans ${className}`}>
      {/* Label + Contextual AI Actions Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        {label && (
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            {label}
          </label>
        )}

        {/* Action Toolbar */}
        <div className="flex items-center gap-1 flex-wrap ml-auto">
          {section === 'experience' || section === 'projects' ? (
            <React.Fragment>
              <button
                type="button"
                onClick={() => handleAiAction('strengthen_verb')}
                disabled={isAiLoading || !value.trim()}
                className="px-2 py-0.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-md transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
                title="Strengthen Action Verb"
              >
                <Zap size={11} className="text-blue-600" />
                <span>Strengthen Verb</span>
              </button>

              <button
                type="button"
                onClick={() => handleAiAction('star_format')}
                disabled={isAiLoading || !value.trim()}
                className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-[10px] font-bold rounded-md transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
                title="Format with STAR Structure"
              >
                <Sparkles size={11} className="text-indigo-600" />
                <span>STAR Format</span>
              </button>
            </React.Fragment>
          ) : null}
          {section !== 'summary' && (
            <>
              <button
                type="button"
                onClick={() => handleAiAction('fix_grammar')}
                disabled={isAiLoading || !value.trim()}
                className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 text-[10px] font-bold rounded-md transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1"
                title="Fix Grammar & Spelling"
              >
                <Check size={11} className="text-emerald-600" />
                <span>Fix Grammar</span>
              </button>

              <button
                type="button"
                onClick={() => handleAiAction('improve')}
                disabled={isAiLoading || !value.trim()}
                className="px-2.5 py-0.5 bg-[#0B192C] hover:bg-slate-800 text-white text-[10px] font-bold rounded-md transition-colors cursor-pointer disabled:opacity-40 flex items-center gap-1 shadow-2xs"
                title="Improve Wording & Tone"
              >
                <Wand2 size={11} className="text-blue-300" />
                <span>{isAiLoading ? 'Improving...' : 'AI Improve'}</span>
              </button>
            </>
          )}

          {showUndo && (
            <button
              type="button"
              onClick={handleUndo}
              className="px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold rounded-md transition-colors cursor-pointer flex items-center gap-1"
              title="Undo last AI change"
            >
              <Undo size={11} />
              <span>Undo AI</span>
            </button>
          )}
        </div>
      </div>

      {/* Input / Textarea Field */}
      <div className="relative">
        {multiline ? (
          <textarea
            rows={rows}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-[#0B192C] font-mono focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
          />
        ) : (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-medium text-[#0B192C] focus:bg-white focus:outline-none focus:border-blue-600 transition-all"
          />
        )}

        {/* Loading Spinner */}
        {isAiLoading && (
          <div className="absolute top-2.5 right-3 flex items-center gap-1.5 text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200 shadow-2xs">
            <RefreshCw size={11} className="animate-spin text-blue-600" />
            <span>Analyzing...</span>
          </div>
        )}
      </div>

      {/* Lightweight Live Validation Badges (Red / Yellow / Blue) */}
      {issues.length > 0 && !aiSuggestion && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {issues.map((iss) => (
            <button
              key={iss.id}
              type="button"
              onClick={() => setActiveIssue(iss)}
              className={`text-[10px] font-bold px-2 py-0.5 rounded-md border flex items-center gap-1 cursor-pointer transition-colors ${
                iss.type === 'spelling' || iss.type === 'grammar'
                  ? 'bg-red-50 text-red-800 border-red-200 hover:bg-red-100'
                  : iss.type === 'ats'
                  ? 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
              }`}
            >
              <AlertCircle size={11} />
              <span>{iss.explanation}</span>
            </button>
          ))}
        </div>
      )}

      {/* Popover Card 1: Local Live Issue Popover */}
      {activeIssue && (
        <div className="p-3.5 bg-white border border-slate-300 rounded-xl shadow-lg space-y-2 animate-in fade-in duration-150 z-20">
          <div className="flex items-center justify-between font-bold text-xs text-[#0B192C]">
            <span className="flex items-center gap-1.5 text-blue-700">
              <Info size={14} />
              <span>{activeIssue.type.toUpperCase()} ISSUE</span>
            </span>
            <button onClick={() => setActiveIssue(null)} className="text-slate-400 hover:text-slate-700">
              <X size={13} />
            </button>
          </div>

          <p className="text-xs text-slate-700 leading-snug">{activeIssue.explanation}</p>

          {activeIssue.suggestion && (
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">SUGGESTED CORRECTION</span>
              <p className="font-bold text-[#0B192C]">{activeIssue.suggestion}</p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setActiveIssue(null)}
              className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-lg hover:bg-slate-200"
            >
              Dismiss
            </button>
            {activeIssue.suggestion && (
              <button
                type="button"
                onClick={() => handleApplySuggestion(activeIssue.suggestion)}
                className="px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700 flex items-center gap-1"
              >
                <Check size={12} /> Apply
              </button>
            )}
          </div>
        </div>
      )}

      {/* Minimal Before -> After Result Panel */}
      {aiSuggestion && (
        <div className="p-3 bg-white border border-slate-200 rounded-lg text-xs space-y-2.5 shadow-xs transition-all z-20">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
            <span>Proposed Change ({aiSuggestion.type === 'fix_grammar' ? 'Grammar & Clarity' : 'AI Improvement'})</span>
          </div>

          {/* Before / After Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-red-50/60 border border-red-200 rounded-md">
              <span className="block text-[9px] font-bold text-red-600 uppercase tracking-wider mb-0.5">Original</span>
              <p className="text-slate-700 line-through opacity-80 leading-snug">{aiSuggestion.original}</p>
            </div>
            <div className="p-2 bg-emerald-50/60 border border-emerald-200 rounded-md">
              <span className="block text-[9px] font-bold text-emerald-600 uppercase tracking-wider mb-0.5">Proposed</span>
              <p className="text-slate-900 font-semibold leading-snug">{aiSuggestion.suggested}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-0.5">
            <button
              type="button"
              onClick={handleDismiss}
              className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-md border border-slate-200 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleApplySuggestion(aiSuggestion.suggested)}
              className="px-3 py-1 bg-[#0B192C] hover:bg-slate-800 text-white font-semibold text-xs rounded-md flex items-center gap-1 cursor-pointer"
            >
              <Check size={12} />
              <span>Apply</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AiWritingAssistantInline;
