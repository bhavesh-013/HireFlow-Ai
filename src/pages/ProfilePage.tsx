import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Target,
  Award,
  Building2,
  Sparkles,
  Github,
  Linkedin,
  Globe,
  Twitter,
  Check,
  X,
  Camera,
  Loader2,
  CheckCircle2,
  Info,
  Sliders,
  SlidersHorizontal,
  AlertCircle
} from 'lucide-react';
import { getStoredUser } from '../lib/api';
import { validateLinkedInUrl, validateGitHubUrl, validatePortfolioUrl } from '../utils/urlValidator';

export default function ProfilePage() {
  const storedUser = getStoredUser();

  const initialProfileState = {
    name: storedUser?.full_name || storedUser?.name || '',
    email: storedUser?.email || '',
    phone: storedUser?.phone || '',
    location: storedUser?.location || '',
    role: storedUser?.job_title || '',
    targetRole: storedUser?.targetRole || '',
    yearsOfExperience: storedUser?.yearsOfExperience || '',
    industry: storedUser?.industry || '',
    bio: storedUser?.bio || '',
    github: storedUser?.github || '',
    linkedin: storedUser?.linkedin || '',
    website: storedUser?.website || '',
    twitter: storedUser?.twitter || '',
    avatar: storedUser?.avatar_url || '',
    aiTone: 'STAR Impact Metrics',
    atsStrictness: 'High (Strict Keyword Match)',
    emailNotifications: true
  };

  const [profile, setProfile] = useState(initialProfileState);
  const [initialState, setInitialState] = useState(initialProfileState);

  const [urlErrors, setUrlErrors] = useState<{
    github?: string | null;
    linkedin?: string | null;
    website?: string | null;
  }>({});

  const handleProfileGithubChange = (val: string) => {
    setProfile((prev) => ({ ...prev, github: val }));
    setUrlErrors((prev) => ({ ...prev, github: validateGitHubUrl(val).error }));
  };

  const handleProfileLinkedinChange = (val: string) => {
    setProfile((prev) => ({ ...prev, linkedin: val }));
    setUrlErrors((prev) => ({ ...prev, linkedin: validateLinkedInUrl(val).error }));
  };

  const handleProfileWebsiteChange = (val: string) => {
    setProfile((prev) => ({ ...prev, website: val }));
    setUrlErrors((prev) => ({ ...prev, website: validatePortfolioUrl(val).error }));
  };

  const [activeSection, setActiveSection] = useState('personal');
  const [isImprovingBio, setIsImprovingBio] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState('Saved just now');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if form has unsaved changes
  const isDirty = JSON.stringify(profile) !== JSON.stringify(initialState);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;

    setInitialState(profile);
    setSavedSuccess(true);
    setLastSavedTime('Saved just now');
    showToast('Profile changes saved successfully!');
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleReset = () => {
    setProfile(initialState);
    showToast('Reverted unsaved changes');
  };

  const handleImproveBioWithAI = () => {
    setIsImprovingBio(true);
    setTimeout(() => {
      setIsImprovingBio(false);
      setProfile((prev) => ({
        ...prev,
        bio: 'Results-driven Senior Frontend Engineer with 6+ years of experience engineering resilient, high-performance React & TypeScript web applications. Streamlined page load speed by 38%, led a team of 5 engineers, and optimized core web vitals across SaaS platforms serving 120k+ active users.'
      }));
      showToast('Enhanced executive summary with STAR impact metrics!');
    }, 800);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      showToast(`Profile photo "${file.name}" uploaded!`);
    }
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
    const sections = ['personal', 'career', 'about', 'social'];
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
    { id: 'personal', label: 'Personal Information', icon: User },
    { id: 'career', label: 'Career Information', icon: Briefcase },
    { id: 'about', label: 'About Me', icon: Sparkles },
    { id: 'social', label: 'Social Links', icon: Globe }
  ];

  return (
    <div className="max-w-[1240px] mx-auto space-y-8 animate-in fade-in duration-300 pb-28 text-[#0B192C] font-sans">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleAvatarFileChange}
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 bg-[#0B192C] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-in slide-in-from-top-4 duration-200 text-xs font-bold">
          <div className="p-1 bg-blue-500/20 text-blue-400 rounded-lg">
            <CheckCircle2 size={15} />
          </div>
          <span>{toastMsg}</span>
          <button onClick={() => setToastMsg(null)} className="text-slate-400 hover:text-white ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B192C] tracking-tight">Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your personal information and career preferences.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {lastSavedTime}
          </span>
        </div>
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ================================================================= */}
        {/* LEFT SIDEBAR (25% - Sticky Settings Navigation)                   */}
        {/* ================================================================= */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-20">
          {/* User Minimal Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-4">
            <div className="flex items-center gap-4">
              {/* Circular Profile Avatar */}
              <div
                onClick={handleAvatarClick}
                className="relative w-14 h-14 rounded-full bg-[#0B192C] text-white flex items-center justify-center font-bold text-lg shrink-0 cursor-pointer group shadow-xs border border-slate-200 transition-transform hover:scale-105"
                title="Click to change photo"
              >
                <span>{profile.avatar}</span>

                {/* Hover overlay with camera icon */}
                <div className="absolute inset-0 bg-[#0B192C]/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white">
                  <Camera size={14} />
                  <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">Edit</span>
                </div>
              </div>

              <div className="min-w-0">
                <h2 className="font-bold text-sm text-[#0B192C] truncate">{profile.name}</h2>
                <p className="text-xs text-slate-500 truncate">{profile.role}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAvatarClick}
              className="w-full py-1.5 text-xs font-semibold text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Camera size={13} className="text-slate-500" />
              <span>Change Photo</span>
            </button>
          </div>

          {/* Resume Statistics Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-3">
            <h3 className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">Resume Statistics</h3>
            <div className="grid grid-cols-3 gap-2 text-center pt-1">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="block text-lg font-black text-[#0B192C]">3</span>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Resumes</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="block text-lg font-black text-emerald-600">82%</span>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Avg ATS</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
                <span className="block text-lg font-black text-blue-600">12</span>
                <span className="text-[10px] font-bold text-slate-500 block uppercase">Exports</span>
              </div>
            </div>
          </div>

          {/* Vertical Settings Navigation */}
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
        {/* RIGHT CONTENT (75% - Clean Card Stack)                            */}
        {/* ================================================================= */}
        <div className="lg:col-span-9 space-y-6">
          {/* SECTION 1: PERSONAL INFORMATION */}
          <div id="personal" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-[#0B192C]">Personal Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">Update your personal contact details.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full h-12 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                    placeholder="e.g. Alex Kumar"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full h-12 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                    placeholder="alex@example.com"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Phone Number</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    className="w-full h-12 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Location</label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={profile.location}
                    onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                    className="w-full h-12 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                    placeholder="City, State, Country"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: CAREER INFORMATION */}
          <div id="career" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-[#0B192C]">Career Information</h2>
              <p className="text-xs text-slate-500 mt-0.5">Define your current role and target career goals.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Current Role */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Current Role</label>
                <div className="relative">
                  <Briefcase size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={profile.role}
                    onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                    className="w-full h-12 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
              </div>

              {/* Target Role */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Target Role</label>
                <div className="relative">
                  <Target size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="text"
                    value={profile.targetRole}
                    onChange={(e) => setProfile({ ...profile, targetRole: e.target.value })}
                    className="w-full h-12 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                    placeholder="e.g. Lead Frontend Architect"
                  />
                </div>
              </div>

              {/* Experience Level */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Years of Experience</label>
                <div className="relative">
                  <Award size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={profile.yearsOfExperience}
                    onChange={(e) => setProfile({ ...profile, yearsOfExperience: e.target.value })}
                    className="w-full h-12 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-8 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="0-2 Years (Entry)">0-2 Years (Entry)</option>
                    <option value="3-5 Years (Mid)">3-5 Years (Mid)</option>
                    <option value="6+ Years (Senior)">6+ Years (Senior)</option>
                    <option value="8+ Years (Lead / Staff)">8+ Years (Lead / Staff)</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Industry</label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <select
                    value={profile.industry}
                    onChange={(e) => setProfile({ ...profile, industry: e.target.value })}
                    className="w-full h-12 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-8 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all cursor-pointer appearance-none"
                  >
                    <option value="Technology & SaaS">Technology & SaaS</option>
                    <option value="Finance & Fintech">Finance & Fintech</option>
                    <option value="Healthcare & BioTech">Healthcare & BioTech</option>
                    <option value="E-commerce & Retail">E-commerce & Retail</option>
                    <option value="Consulting & Agency">Consulting & Agency</option>
                  </select>
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-xs">▼</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 3: ABOUT ME */}
          <div id="about" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 flex-wrap gap-2">
              <div>
                <h2 className="text-lg font-bold text-[#0B192C]">About Me</h2>
                <p className="text-xs text-slate-500 mt-0.5">Brief summary of your executive background and expertise.</p>
              </div>

              {/* AI Improve Button */}
              <button
                type="button"
                onClick={handleImproveBioWithAI}
                disabled={isImprovingBio}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200/80 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                {isImprovingBio ? (
                  <Loader2 size={14} className="animate-spin text-blue-600" />
                ) : (
                  <Sparkles size={14} className="text-blue-600" />
                )}
                <span>Improve with AI</span>
              </button>
            </div>

            <div className="space-y-2">
              <textarea
                rows={4}
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                className="w-full bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 text-xs leading-relaxed text-[#0B192C] font-normal focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                placeholder="Write a brief professional summary..."
              />

              <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2">
                <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                  <Info size={13} className="text-blue-500" />
                  Tip: Adding measurable achievements improves recruiter visibility.
                </span>
                <span className="font-mono text-[11px] text-slate-400">{profile.bio.length} / 500 characters</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: SOCIAL LINKS */}
          <div id="social" className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-2xs space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-[#0B192C]">Social Links</h2>
              <p className="text-xs text-slate-500 mt-0.5">Add links to your online profiles and portfolio.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* GitHub */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">GitHub</label>
                <div className="relative">
                  <Github size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    value={profile.github}
                    onChange={(e) => handleProfileGithubChange(e.target.value)}
                    className={`w-full h-12 bg-slate-50/70 border rounded-xl pl-10 pr-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:outline-none transition-all ${
                      urlErrors.github
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-400/20'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                    }`}
                    placeholder="https://github.com/..."
                  />
                </div>
                {urlErrors.github && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{urlErrors.github}</span>
                  </p>
                )}
              </div>

              {/* LinkedIn */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">LinkedIn</label>
                <div className="relative">
                  <Linkedin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" />
                  <input
                    type="url"
                    value={profile.linkedin}
                    onChange={(e) => handleProfileLinkedinChange(e.target.value)}
                    className={`w-full h-12 bg-slate-50/70 border rounded-xl pl-10 pr-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:outline-none transition-all ${
                      urlErrors.linkedin
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-400/20'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                    }`}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                {urlErrors.linkedin && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{urlErrors.linkedin}</span>
                  </p>
                )}
              </div>

              {/* Portfolio */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">Portfolio Website</label>
                <div className="relative">
                  <Globe size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    value={profile.website}
                    onChange={(e) => handleProfileWebsiteChange(e.target.value)}
                    className={`w-full h-12 bg-slate-50/70 border rounded-xl pl-10 pr-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:outline-none transition-all ${
                      urlErrors.website
                        ? 'border-red-400 focus:border-red-500 ring-2 ring-red-400/20'
                        : 'border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10'
                    }`}
                    placeholder="https://yourportfolio.dev"
                  />
                </div>
                {urlErrors.website && (
                  <p className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{urlErrors.website}</span>
                  </p>
                )}
              </div>

              {/* X (Twitter) */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-medium text-slate-700">X (Twitter)</label>
                <div className="relative">
                  <Twitter size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="url"
                    value={profile.twitter}
                    onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                    className="w-full h-12 bg-slate-50/70 border border-slate-200 rounded-xl pl-10 pr-3.5 text-xs font-semibold text-[#0B192C] focus:bg-white focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:outline-none transition-all"
                    placeholder="https://x.com/username"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM ACTION BAR (Sticky at bottom when editing) */}
          <div className="sticky bottom-4 z-40 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl p-4 shadow-xl flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={handleReset}
              disabled={!isDirty}
              className={`px-4 py-2 text-xs font-semibold rounded-xl border transition-colors cursor-pointer ${
                isDirty
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  : 'bg-slate-50/50 text-slate-300 border-slate-100 cursor-not-allowed'
              }`}
            >
              Cancel
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
