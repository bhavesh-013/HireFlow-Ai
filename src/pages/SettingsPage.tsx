import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Bell,
  FileText,
  Palette,
  ShieldCheck,
  Zap,
  Check,
  RotateCcw,
  CheckCircle2,
  X,
  Command,
  Sun,
  Moon,
  Monitor,
  LogOut,
  Lock,
  Cloud,
  Database,
  Key
} from 'lucide-react';

export default function SettingsPage() {
  const initialSettings = {
    // AI Preferences
    enableAiSuggestions: true,
    showAtsRecommendations: true,
    autoRewriteResume: false,
    smartKeywordSuggestions: true,
    autoSaveAiChanges: true,

    // Notifications
    emailReports: true,
    atsScoreUpdates: true,
    resumeProcessingComplete: true,
    weeklyCareerTips: false,
    securityAlerts: true,

    // Resume Preferences
    defaultTemplate: 'Executive Professional',
    atsFriendlyMode: true,
    defaultExportFormat: 'PDF',
    defaultFont: 'Plus Jakarta Sans',
    language: 'English (US)',

    // Appearance
    theme: 'Light',
    accentColor: 'Blue',
    density: 'Comfortable',

    // Privacy & Security
    autoBackup: true,
    cloudSync: true,
    twoFactorAuth: false
  };

  const [settings, setSettings] = useState(initialSettings);
  const [initialState, setInitialState] = useState(initialSettings);

  const [activeSection, setActiveSection] = useState('notifications');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [lastSavedStatus, setLastSavedStatus] = useState('All changes saved');

  // Check if modified
  const isDirty = JSON.stringify(settings) !== JSON.stringify(initialState);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!isDirty) return;

    setInitialState(settings);
    setLastSavedStatus('Saved just now');
    showToast('Workspace settings saved successfully!');
  };

  const handleReset = () => {
    setSettings(initialSettings);
    setInitialState(initialSettings);
    setLastSavedStatus('All changes saved');
    showToast('Reset settings to system defaults');
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -80;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // ScrollSpy to highlight active navigation item on scroll
  useEffect(() => {
    const sections = ['notifications', 'resume', 'privacy', 'shortcuts'];
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 120;
      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(sectionId);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'resume', label: 'Resume Preferences', icon: FileText },
    { id: 'privacy', label: 'Privacy & Security', icon: ShieldCheck },
    { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Zap }
  ];

  // Modern iOS-Style Toggle Switch
  const ToggleSwitch = ({
    checked,
    onChange,
    label,
    description
  }: {
    checked: boolean;
    onChange: (val: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-100/80 last:border-b-0 gap-4">
      <div className="space-y-0.5 min-w-0 pr-2">
        <p className="font-semibold text-xs text-[#0B192C]">{label}</p>
        {description && <p className="text-[11px] text-slate-500 leading-normal">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600/20 ${
          checked ? 'bg-blue-600' : 'bg-slate-200'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="max-w-[1240px] mx-auto space-y-8 animate-in fade-in duration-300 pb-28 text-[#0B192C] font-sans">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#0B192C] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 text-xs font-bold">
          <div className="p-1 bg-blue-500/20 text-blue-400 rounded-lg">
            <CheckCircle2 size={15} />
          </div>
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white ml-2 cursor-pointer">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">Settings</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your AI workspace preferences.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className={`inline-flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${
            isDirty
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80'
          }`}>
            <span className={`w-2 h-2 rounded-full ${isDirty ? 'bg-amber-500' : 'bg-emerald-500'} animate-pulse`} />
            {isDirty ? 'Unsaved changes' : lastSavedStatus}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================================================================= */}
        {/* LEFT SIDEBAR (Sticky Navigation - 240px)                          */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 space-y-3 lg:sticky lg:top-20">
          <nav className="bg-white border border-slate-200 rounded-2xl p-2 shadow-2xs space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer text-left ${
                    isActive
                      ? 'bg-blue-50/80 text-blue-700 font-bold border-l-4 border-l-blue-600 border-t border-r border-b border-blue-200/60 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-transparent'
                  }`}
                >
                  <Icon
                    size={15}
                    className={isActive ? 'text-blue-600' : 'text-slate-400'}
                  />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* ================================================================= */}
        {/* RIGHT CONTENT (Cards Stack)                                       */}
        {/* ================================================================= */}
        <div className="lg:col-span-9 space-y-6">
          {/* SECTION 1: NOTIFICATIONS */}
          <div id="notifications" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Bell size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0B192C]">Notifications</h2>
                <p className="text-xs text-slate-500">Manage email digests and real-time processing alerts.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              <ToggleSwitch
                label="Email Reports"
                description="Get periodic summaries of your resume application performance."
                checked={settings.emailReports}
                onChange={(val) => setSettings({ ...settings, emailReports: val })}
              />
              <ToggleSwitch
                label="ATS Score Updates"
                description="Notify when target job posting requirements change or rescoring completes."
                checked={settings.atsScoreUpdates}
                onChange={(val) => setSettings({ ...settings, atsScoreUpdates: val })}
              />
              <ToggleSwitch
                label="Resume Processing Complete"
                description="Alert when heavy PDF parsing or batch AI tailoring is finished."
                checked={settings.resumeProcessingComplete}
                onChange={(val) => setSettings({ ...settings, resumeProcessingComplete: val })}
              />
              <ToggleSwitch
                label="Weekly Career Tips"
                description="Curated recruiter insights and interview preparation strategies."
                checked={settings.weeklyCareerTips}
                onChange={(val) => setSettings({ ...settings, weeklyCareerTips: val })}
              />
              <ToggleSwitch
                label="Security Alerts"
                description="Immediate emails for new device sign-ins or session changes."
                checked={settings.securityAlerts}
                onChange={(val) => setSettings({ ...settings, securityAlerts: val })}
              />
            </div>
          </div>

          {/* SECTION 3: RESUME PREFERENCES */}
          <div id="resume" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <FileText size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0B192C]">Resume Preferences</h2>
                <p className="text-xs text-slate-500">Default layout formats, export types, and typography.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Default Resume Template */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Default Resume Template</label>
                <select
                  value={settings.defaultTemplate}
                  onChange={(e) => setSettings({ ...settings, defaultTemplate: e.target.value })}
                  className="w-full h-11 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Executive Professional">Executive Professional</option>
                  <option value="Modern Minimal">Modern Minimal</option>
                  <option value="Tech Specialist">Tech Specialist</option>
                  <option value="Creative Minimal">Creative Minimal</option>
                </select>
              </div>

              {/* Default Export Format */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Default Export Format</label>
                <div className="flex items-center gap-2 h-11">
                  {['PDF', 'DOCX'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setSettings({ ...settings, defaultExportFormat: fmt })}
                      className={`flex-1 h-full rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                        settings.defaultExportFormat === fmt
                          ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                          : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Default Font */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Default Font</label>
                <select
                  value={settings.defaultFont}
                  onChange={(e) => setSettings({ ...settings, defaultFont: e.target.value })}
                  className="w-full h-11 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern)</option>
                  <option value="Inter">Inter (Clean)</option>
                  <option value="Roboto">Roboto (Standard)</option>
                  <option value="Playfair Display">Playfair Display (Executive)</option>
                </select>
              </div>

              {/* Language */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Language</label>
                <select
                  value={settings.language}
                  onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                  className="w-full h-11 bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all cursor-pointer"
                >
                  <option value="English (US)">English (US)</option>
                  <option value="English (UK)">English (UK)</option>
                  <option value="German">German (Deutsch)</option>
                  <option value="Spanish">Spanish (Español)</option>
                  <option value="French">French (Français)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <ToggleSwitch
                label="ATS Friendly Mode"
                description="Ensure single-column structure and standard system fonts for 100% parser compatibility."
                checked={settings.atsFriendlyMode}
                onChange={(val) => setSettings({ ...settings, atsFriendlyMode: val })}
              />
            </div>
          </div>

          {/* SECTION 3: PRIVACY & SECURITY */}
          <div id="privacy" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <ShieldCheck size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0B192C]">Privacy & Security</h2>
                <p className="text-xs text-slate-500">Security protocols, cloud backups, and active session management.</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100">
              <ToggleSwitch
                label="Auto Backup"
                description="Maintain encrypted local and cloud snapshots after every major revision."
                checked={settings.autoBackup}
                onChange={(val) => setSettings({ ...settings, autoBackup: val })}
              />
              <ToggleSwitch
                label="Cloud Sync"
                description="Seamlessly synchronize changes across web, desktop, and mobile devices."
                checked={settings.cloudSync}
                onChange={(val) => setSettings({ ...settings, cloudSync: val })}
              />
              <ToggleSwitch
                label="Two Factor Authentication"
                description="Require an authenticator app code on login for enhanced account security."
                checked={settings.twoFactorAuth}
                onChange={(val) => setSettings({ ...settings, twoFactorAuth: val })}
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="font-semibold text-xs text-[#0B192C]">Session Management</p>
                <p className="text-[11px] text-slate-500">Currently active on 1 browser session (San Francisco, CA).</p>
              </div>
              <button
                type="button"
                onClick={() => showToast('Signed out from all other active browser sessions')}
                className="px-3.5 py-2 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Logout from all devices</span>
              </button>
            </div>
          </div>

          {/* SECTION 6: KEYBOARD SHORTCUTS */}
          <div id="shortcuts" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-4">
            <div className="border-b border-slate-100 pb-4 flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <Zap size={18} />
              </div>
              <div>
                <h2 className="text-base font-bold text-[#0B192C]">Keyboard Shortcuts</h2>
                <p className="text-xs text-slate-500">Speed up your workflow with global keyboard commands.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {[
                { shortcut: ['⌘', 'S'], label: 'Save Changes' },
                { shortcut: ['⌘', 'E'], label: 'Export Resume (PDF/DOCX)' },
                { shortcut: ['⌘', '/'], label: 'AI Assistant Panel' },
                { shortcut: ['⌘', 'Shift', 'P'], label: 'Command Palette' }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-slate-50/70 border border-slate-200/80 rounded-xl"
                >
                  <span className="text-xs font-semibold text-slate-700">{item.label}</span>
                  <div className="flex items-center gap-1">
                    {item.shortcut.map((key, kIdx) => (
                      <kbd
                        key={kIdx}
                        className="px-2 py-0.5 text-[11px] font-mono font-bold text-slate-700 bg-white border border-slate-300 rounded-md shadow-2xs"
                      >
                        {key}
                      </kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* BOTTOM ACTION BAR (Sticky Footer) */}
          <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw size={13} className="text-slate-400" />
              <span>Reset to Default</span>
            </button>

            <div className="flex items-center gap-3">
              {isDirty && (
                <span className="text-xs text-amber-600 font-medium hidden sm:inline">
                  You have unsaved changes
                </span>
              )}
              <button
                type="submit"
                disabled={!isDirty}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-2 cursor-pointer ${
                  isDirty
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Check size={14} />
                <span>Save Changes</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
