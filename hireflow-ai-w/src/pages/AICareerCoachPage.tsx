import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, User, Sparkles, Lightbulb, CheckCircle2 } from 'lucide-react';
import { mockCoachMessages, ChatMessage } from '../data/mockData';

export default function AICareerCoachPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(mockCoachMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const aiReply: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: `Based on your request regarding "${inputText}", here is my career recommendation:\n\n1. Focus on emphasizing quantifiable metric achievements (e.g. latency reduced, user retention improved, revenue impact).\n2. Format section headers with standard keywords so Workday & Lever ATS engines extract them smoothly.\n3. Tailor your skills list to reflect high-priority keywords from the job description.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiReply]);
    }, 1000);
  };

  const handlePromptClick = (promptText: string) => {
    setInputText(promptText);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <Bot size={22} />
          </div>
          <div>
            <h1 className="text-xl font-black text-[#0B192C]">HireFlow AI Career Coach</h1>
            <p className="text-xs text-slate-500">
              Personalized guidance on resume crafting, interview prep, and offer negotiation.
            </p>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="flex-1 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-2xs overflow-y-auto space-y-4 custom-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : ''
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-[#0B192C] text-white'
                  : 'bg-indigo-100 text-indigo-700'
              }`}
            >
              {msg.sender === 'user' ? <User size={15} /> : <Bot size={15} />}
            </div>

            <div
              className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-[#0B192C] text-white rounded-tr-xs'
                  : 'bg-slate-100 text-[#0B192C] rounded-tl-xs whitespace-pre-line'
              }`}
            >
              {msg.text}
              <span
                className={`block text-[10px] font-mono mt-1.5 ${
                  msg.sender === 'user' ? 'text-slate-400 text-right' : 'text-slate-400'
                }`}
              >
                {msg.timestamp}
              </span>
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium italic">
            <Bot size={16} className="text-indigo-600 animate-pulse" />
            <span>AI Career Coach is analyzing your request...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar text-xs">
        <span className="text-slate-400 font-mono text-[10px] uppercase font-bold shrink-0">
          PROMPTS:
        </span>
        <button
          onClick={() => handlePromptClick('How can I optimize my resume for Senior Frontend roles?')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer"
        >
          Optimize for Senior Frontend
        </button>
        <button
          onClick={() => handlePromptClick('Give me 5 behavioral interview questions for Stripe.')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer"
        >
          Interview prep questions
        </button>
        <button
          onClick={() => handlePromptClick('How should I negotiate a staff engineer compensation package?')}
          className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium px-3 py-1.5 rounded-full whitespace-nowrap cursor-pointer"
        >
          Salary negotiation tips
        </button>
      </div>

      {/* Chat Input Form */}
      <form onSubmit={handleSend} className="flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask your AI Career Coach anything about resumes, interviews, or strategy..."
          className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-[#0B192C] focus:outline-none focus:border-[#0B192C] shadow-2xs"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="bg-[#0B192C] hover:bg-slate-800 text-white p-3 rounded-xl cursor-pointer disabled:opacity-40 shadow-xs transition-colors"
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
