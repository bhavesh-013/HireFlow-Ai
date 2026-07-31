import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Github, Linkedin, Globe, CheckCircle2, Shield, Sparkles } from 'lucide-react';
import { mockUser } from '../data/mockData';

export default function ProfilePage() {
  const [profile, setProfile] = useState(mockUser);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#0B192C] tracking-tight">User Profile & Account</h1>
        <p className="text-sm text-slate-600 mt-1">Manage your career identity, social links, and target role preferences.</p>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs font-bold text-emerald-800">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>Profile preferences saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Avatar & Plan Card */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs text-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-[#0B192C] text-white flex items-center justify-center font-black text-2xl mx-auto shadow-md">
              {profile.avatar}
            </div>
            <div>
              <h2 className="font-bold text-lg text-[#0B192C]">{profile.name}</h2>
              <p className="text-xs text-slate-500 font-medium">{profile.role}</p>
            </div>
            <span className="inline-block bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-200/80">
              {profile.membership}
            </span>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#0B192C] pb-2 border-b border-slate-100">
              <Shield size={16} className="text-blue-600" />
              <span>Subscription & Usage</span>
            </div>
            <div className="text-xs text-slate-600 space-y-2">
              <p className="flex justify-between">
                <span>Resumes Created:</span>
                <strong className="text-[#0B192C]">7 / Unlimited</strong>
              </p>
              <p className="flex justify-between">
                <span>AI Enhancements:</span>
                <strong className="text-[#0B192C]">42 Used</strong>
              </p>
              <p className="flex justify-between">
                <span>Renews On:</span>
                <strong className="text-[#0B192C]">Aug 28, 2026</strong>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Profile Form Details */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-6">
          <h3 className="font-bold text-base text-[#0B192C] pb-3 border-b border-slate-100 flex items-center gap-2">
            <User size={18} className="text-blue-600" />
            <span>Personal Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-[#0B192C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Target Professional Role</label>
              <input
                type="text"
                value={profile.role}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-[#0B192C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#0B192C]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 uppercase tracking-wider mb-1">Location</label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-[#0B192C]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-500 uppercase tracking-wider text-xs mb-1">Bio Statement</label>
            <textarea
              rows={3}
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs leading-relaxed text-[#0B192C]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="bg-[#0B192C] hover:bg-slate-800 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
