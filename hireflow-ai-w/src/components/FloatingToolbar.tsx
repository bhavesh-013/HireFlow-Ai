import React, { useState } from 'react';
import { Navigation, MessageSquare, X } from 'lucide-react';

interface FloatingToolbarProps {
  onBrowseClick?: () => void;
  onCommentClick?: () => void;
}

export default function FloatingToolbar({ onBrowseClick, onCommentClick }: FloatingToolbarProps) {
  const [activeTab, setActiveTab] = useState<'browse' | 'comment'>('browse');
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [commentsList, setCommentsList] = useState<string[]>([]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setCommentsList(prev => [...prev, commentText.trim()]);
    setCommentText('');
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
      {/* Floating Comment Box overlay if clicked */}
      {commentOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white border border-slate-300 rounded-2xl shadow-xl p-4 text-slate-800 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wider">
              Workspace Feedback
            </span>
            <button
              onClick={() => setCommentOpen(false)}
              className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>

          <div className="max-h-36 overflow-y-auto my-3 space-y-2 text-xs">
            {commentsList.length === 0 ? (
              <p className="text-slate-400 italic font-mono text-[11px]">
                No comments yet. Leave a note or suggestion on the HireFlow AI interface.
              </p>
            ) : (
              commentsList.map((c, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded-lg border border-slate-200/60 font-sans">
                  {c}
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendComment} className="flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Type your suggestion..."
              className="flex-1 bg-slate-100 border border-slate-300 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#0B192C]"
            />
            <button
              type="submit"
              className="bg-[#0B192C] text-white text-xs font-semibold px-3 py-1.5 rounded-xl hover:bg-slate-800 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* Pill Container */}
      <div className="bg-[#475569]/90 backdrop-blur-md p-1.5 rounded-full shadow-lg border border-slate-500/30 flex items-center gap-1 select-none">
        <button
          onClick={() => {
            setActiveTab('browse');
            setCommentOpen(false);
            if (onBrowseClick) onBrowseClick();
          }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'browse'
              ? 'bg-[#3B82F6] text-white shadow-sm'
              : 'text-slate-200 hover:text-white'
          }`}
        >
          <Navigation size={14} className="-rotate-45" />
          Browse
        </button>

        <button
          onClick={() => {
            setActiveTab('comment');
            setCommentOpen(prev => !prev);
            if (onCommentClick) onCommentClick();
          }}
          className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer ${
            activeTab === 'comment'
              ? 'bg-[#3B82F6] text-white shadow-sm'
              : 'text-slate-200 hover:text-white'
          }`}
        >
          <MessageSquare size={14} />
          Comment
        </button>
      </div>
    </div>
  );
}
