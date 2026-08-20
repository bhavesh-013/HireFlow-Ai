import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Bot, Send, User, Sparkles, Briefcase, FileText, MessageSquare,
  Zap, RotateCcw, ChevronRight, AlertCircle, Loader2,
  GraduationCap, Target, CheckCircle2,
} from 'lucide-react';
import { isAuthenticated } from '../lib/api';
import { rememberCurrentLocationForRedirect } from '../lib/authGate';
import LoginRequiredModal from '../components/app/LoginRequiredModal';
import { aiService } from '../services/ai.service';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestions?: string[];
  followUpQuestion?: string | null;
  rejected?: boolean;
  loading?: boolean;
}

interface ConvHistoryItem {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Client-side Scope Pre-filter ─────────────────────────────────────────────
// Lightweight check before sending to the backend. This is a UX improvement —
// the backend is still the authoritative scope enforcer.
const HARD_REJECT_PATTERNS = [
  /\bweather\b/i,
  /\bjoke[s]?\b/i,
  /\brecipe[s]?\b/i,
  /\blove letter\b/i,
  /\bquantum physics\b/i,
  /\brelateship advice\b/i,
  /\bhack\b.*\b(website|server|account|system)\b/i,
  /\bignore (your|previous|all) instructions?\b/i,
  /\byou are now a?\b/i,
  /\bact as a (general|unrestricted|free)\b/i,
  /\bjailbreak\b/i,
  /\bdan mode\b/i,
  /\bdeveloper mode\b/i,
  /\bsolve.*homework\b/i,
  /\bwrite (a )?(story|novel|poem|song|rap)\b/i,
  /\btell me (a )?joke\b/i,
  /\bwhat('s| is) the weather\b/i,
  /\blatest news\b/i,
  /\brelationship advice\b/i,
];

const CAREER_SIGNALS = [
  /\bresume\b/i, /\binterview\b/i, /\bcareer\b/i, /\bjob\b/i,
  /\bskills?\b/i, /\bats\b/i, /\bapply\b/i, /\bhiring\b/i,
  /\brecruiter\b/i, /\bportfolio\b/i, /\bcv\b/i, /\bsalary\b/i,
  /\bmock\b/i, /\bjd\b/i, /\bbullet\b/i, /\bsummary\b/i,
  /\bnegotiat\b/i, /\btech stack\b/i, /\bproject\b/i, /\bgithub\b/i,
];

function clientScopeCheck(text: string): 'allow' | 'soft_reject' | 'pass' {
  const hasHardReject = HARD_REJECT_PATTERNS.some((p) => p.test(text));
  if (!hasHardReject) return 'pass';

  // If it also has career signals, let the backend decide
  const hasCareerSignal = CAREER_SIGNALS.some((p) => p.test(text));
  if (hasCareerSignal) return 'pass';

  return 'soft_reject';
}

// ─── Constants ────────────────────────────────────────────────────────────────
const REJECTION_TEXT =
  "I'm your AI Career Coach. I can help with resumes, ATS optimization, job descriptions, career preparation, and interview preparation. Please ask me something related to your resume or interview.";

const WELCOME_MESSAGE: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "👋 Hi! I'm your HireFlow AI Career Coach.\n\nI can help you with:\n• Resume review & optimization\n• ATS score improvement\n• Mock interviews & preparation\n• Job description analysis\n• Career strategy & skill gaps\n\nWhat would you like to work on today?",
  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  suggestions: [
    'Review my resume',
    'Start a mock interview',
    'Analyze a job description',
    'What skills am I missing?',
  ],
};

const QUICK_PROMPTS = [
  { icon: FileText, label: 'Review resume', text: 'Please review my resume and give me specific improvement recommendations.' },
  { icon: Target, label: 'ATS optimize', text: 'How can I improve my resume\'s ATS score?' },
  { icon: GraduationCap, label: 'Mock interview', text: 'Start a mock interview for a Software Engineer role.' },
  { icon: Briefcase, label: 'Analyze JD', text: 'I have a job description I want to analyze against my resume.' },
  { icon: CheckCircle2, label: 'Missing skills', text: 'What important skills am I missing from my resume?' },
  { icon: Zap, label: 'Strengthen bullets', text: 'Help me improve my experience bullet points.' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function AICareerCoachPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAuthGateOpen, setIsAuthGateOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const conversationHistory = useRef<ConvHistoryItem[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // ─── Send Message ───────────────────────────────────────────────────────────
  const handleSend = useCallback(
    async (textOverride?: string) => {
      const text = (textOverride ?? inputText).trim();
      if (!text || isLoading) return;

      if (!isAuthenticated()) {
        rememberCurrentLocationForRedirect(location.pathname, location.search);
        setIsAuthGateOpen(true);
        return;
      }

      setInputText('');
      setError(null);

      // Add user message
      const userMsg: Message = {
        id: `u_${Date.now()}`,
        role: 'user',
        content: text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      // Add loading placeholder
      const loadingId = `a_${Date.now()}`;
      const loadingMsg: Message = {
        id: loadingId,
        role: 'assistant',
        content: '',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        loading: true,
      };

      setMessages((prev) => [...prev, userMsg, loadingMsg]);
      setIsLoading(true);

      try {
        // ── Client-side pre-filter (UX shortcut — backend enforces authoritatively) ──
        const scopeResult = clientScopeCheck(text);
        if (scopeResult === 'soft_reject') {
          const rejectedMsg: Message = {
            id: loadingId,
            role: 'assistant',
            content: REJECTION_TEXT,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            rejected: true,
            suggestions: ['Review my resume', 'Prepare me for an interview', 'Analyze a job description'],
          };
          setMessages((prev) => prev.map((m) => (m.id === loadingId ? rejectedMsg : m)));
          return;
        }

        // ── Call backend (Supabase Edge Function → Gemini) ──────────────────
        const response = await aiService.careerCoach(
          text,
          undefined,     // activeSection — can be wired to resume section later
          undefined,     // resumeData — can be wired to active resume later
          conversationHistory.current,
        );

        const replyText = response?.reply || response?.message || "I'm here to help with your resume and career. What would you like to work on?";
        const suggestions: string[] = response?.suggestions || [];
        const followUpQuestion: string | null = response?.followUpQuestion || null;
        const rejected: boolean = response?.rejected || false;

        const assistantMsg: Message = {
          id: loadingId,
          role: 'assistant',
          content: replyText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions,
          followUpQuestion,
          rejected,
        };

        setMessages((prev) => prev.map((m) => (m.id === loadingId ? assistantMsg : m)));

        // Update conversation history (keep last 20 turns)
        conversationHistory.current = [
          ...conversationHistory.current,
          { role: 'user' as const, content: text },
          { role: 'assistant' as const, content: replyText },
        ].slice(-20);

      } catch (err: any) {
        const errMsg: Message = {
          id: loadingId,
          role: 'assistant',
          content: 'Something went wrong. Please try again in a moment.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          rejected: false,
        };
        setMessages((prev) => prev.map((m) => (m.id === loadingId ? errMsg : m)));
        setError(err?.message || 'Unknown error');
      } finally {
        setIsLoading(false);
        inputRef.current?.focus();
      }
    },
    [inputText, isLoading, location]
  );

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const handleQuickPrompt = (text: string) => {
    handleSend(text);
  };

  const handleSuggestionClick = (text: string) => {
    handleSend(text);
  };

  const handleReset = () => {
    setMessages([WELCOME_MESSAGE]);
    conversationHistory.current = [];
    setError(null);
    setInputText('');
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-in fade-in duration-200 h-[calc(100vh-140px)] flex flex-col">
      {/* Auth Gate */}
      <LoginRequiredModal
        open={isAuthGateOpen}
        onClose={() => setIsAuthGateOpen(false)}
        onLogin={() => { setIsAuthGateOpen(false); navigate('/login'); }}
        onSignup={() => { setIsAuthGateOpen(false); navigate('/signup'); }}
        message="Chatting with the AI Career Coach requires a free account. Log in or sign up to continue."
      />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0B192C]">HireFlow AI Career Coach</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Powered by Gemini 2.0 Flash · Resume &amp; Interview focused
            </p>
          </div>
        </div>

        <button
          onClick={handleReset}
          title="Start new conversation"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <RotateCcw size={13} />
          New chat
        </button>
      </div>

      {/* ── Quick Prompts ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 custom-scrollbar">
        {QUICK_PROMPTS.map(({ icon: Icon, label, text }) => (
          <button
            key={label}
            onClick={() => handleQuickPrompt(text)}
            disabled={isLoading}
            className="flex items-center gap-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-600 text-[11px] font-medium px-3 py-1.5 rounded-full whitespace-nowrap transition-all cursor-pointer disabled:opacity-40"
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Chat Messages ───────────────────────────────────────────────────── */}
      <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-sm overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-[#0B192C] text-white'
                  : msg.rejected
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {msg.role === 'user' ? (
                <User size={15} />
              ) : msg.loading ? (
                <Loader2 size={15} className="animate-spin" />
              ) : msg.rejected ? (
                <AlertCircle size={15} />
              ) : (
                <Bot size={15} />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-xl space-y-2 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col`}>
              <div
                className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-[#0B192C] text-white rounded-tr-xs'
                    : msg.rejected
                    ? 'bg-amber-50 border border-amber-200 text-amber-900 rounded-tl-xs'
                    : msg.loading
                    ? 'bg-slate-100 text-slate-400 rounded-tl-xs animate-pulse'
                    : 'bg-slate-100 text-[#0B192C] rounded-tl-xs'
                }`}
              >
                {msg.loading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 size={13} className="animate-spin text-indigo-500" />
                    <span className="text-slate-500 italic text-xs">Analyzing your request...</span>
                  </span>
                ) : (
                  <span className="whitespace-pre-line">{msg.content}</span>
                )}

                <span
                  className={`block text-[10px] font-mono mt-1.5 ${
                    msg.role === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                  }`}
                >
                  {msg.timestamp}
                </span>
              </div>

              {/* Suggestion chips */}
              {!msg.loading && msg.suggestions && msg.suggestions.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {msg.suggestions.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSuggestionClick(s)}
                      disabled={isLoading}
                      className="flex items-center gap-1 bg-white border border-indigo-200 text-indigo-700 text-[11px] font-medium px-2.5 py-1 rounded-full hover:bg-indigo-50 transition-colors cursor-pointer disabled:opacity-40"
                    >
                      <ChevronRight size={10} />
                      {s}
                    </button>
                  ))}
                </div>
              )}

              {/* Follow-up question */}
              {!msg.loading && msg.followUpQuestion && (
                <button
                  onClick={() => handleSuggestionClick(msg.followUpQuestion!)}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 text-[11px] text-slate-500 hover:text-indigo-600 italic transition-colors cursor-pointer disabled:opacity-40 text-left"
                >
                  <MessageSquare size={11} />
                  {msg.followUpQuestion}
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-xs px-3 py-2 rounded-xl">
            <AlertCircle size={14} />
            <span>Connection error. Make sure your API key is set. <button onClick={() => setError(null)} className="underline cursor-pointer">Dismiss</button></span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ── Input ───────────────────────────────────────────────────────────── */}
      <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            id="career-coach-input"
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask about your resume, interviews, or career…"
            disabled={isLoading}
            className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0B192C] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 shadow-sm transition-all disabled:opacity-60"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 size={16} className="animate-spin text-indigo-500" />
            </div>
          )}
        </div>
        <button
          type="submit"
          id="career-coach-send-btn"
          disabled={!inputText.trim() || isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white p-3 rounded-xl cursor-pointer disabled:cursor-not-allowed shadow-sm transition-colors"
        >
          {isLoading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
        </button>
      </form>

      {/* ── Scope disclaimer ─────────────────────────────────────────────────── */}
      <p className="text-center text-[10px] text-slate-400 font-mono -mt-1">
        Scope: Resume · ATS · Interviews · Career Prep only · All responses grounded in your resume data
      </p>
    </div>
  );
}
