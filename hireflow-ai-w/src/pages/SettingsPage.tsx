import React, { useState } from 'react';
import { Settings, Bell, Lock, Sparkles, CheckCircle2 } from 'lucide-react';

export default function SettingsPage() {
  const [autoSave, setAutoSave] = useState(true);
  const [aiSuggestions, setAiSuggestions] = useState(true);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div>
        <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">Workspace Settings</h1>
        <p className="text-sm text-slate-600 mt-1">Configure AI suggestions, notifications, and document preferences.</p>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Settings updated successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6 max-w-3xl">
        <div className="space-y-4">
          <h3 className="font-bold text-base text-[#0B192C] pb-2 border-b border-slate-100 flex items-center gap-2">
            <Sparkles size={18} className="text-blue-600" />
            <span>AI Assistance Controls</span>
          </h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold text-xs text-[#0B192C]">Auto-Save Documents</p>
              <p className="text-xs text-slate-500">Automatically sync edits to cloud storage while typing.</p>
            </div>
            <input
              type="checkbox"
              checked={autoSave}
              onChange={(e) => setAutoSave(e.target.checked)}
              className="w-4 h-4 accent-[#0B192C]"
            />
          </div>

          <div className="flex items-center justify-between py-2 border-t border-slate-100">
            <div>
              <p className="font-bold text-xs text-[#0B192C]">Real-Time AI Bullet Suggestions</p>
              <p className="text-xs text-slate-500">Show verb & metric suggestions while editing experience bullets.</p>
            </div>
            <input
              type="checkbox"
              checked={aiSuggestions}
              onChange={(e) => setAiSuggestions(e.target.checked)}
              className="w-4 h-4 accent-[#0B192C]"
            />
          </div>
        </div>

        <div className="space-y-4 pt-2">
          <h3 className="font-bold text-base text-[#0B192C] pb-2 border-b border-slate-100 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            <span>Notifications</span>
          </h3>

          <div className="flex items-center justify-between py-2">
            <div>
              <p className="font-bold text-xs text-[#0B192C]">Email ATS Performance Reports</p>
              <p className="text-xs text-slate-500">Receive weekly updates on your resume ATS scores.</p>
            </div>
            <input
              type="checkbox"
              checked={emailNotifs}
              onChange={(e) => setEmailNotifs(e.target.checked)}
              className="w-4 h-4 accent-[#0B192C]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
