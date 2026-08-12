import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  FileText,
  Target,
  Layout,
  BarChart2,
  BarChart3,
  Lightbulb,
  FileSearch,
  Bot,
  User,
  Settings,
  LogOut,
  ChevronDown,
  ChevronRight,
  X,
  Compass
} from 'lucide-react';
import { mockUser } from '../../data/mockData';
import { auth, getStoredUser } from '../../lib/api';
import logoIcon from '../../assets/logo-icon.png';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const storedUser = getStoredUser();
  const currentUser = {
    ...mockUser,
    name: storedUser?.name || mockUser.name,
    avatar: storedUser?.name
      ? storedUser.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
      : mockUser.avatar,
  };

  const [buildGroupOpen, setBuildGroupOpen] = useState(true);
  const [analysisGroupOpen, setAnalysisGroupOpen] = useState(true);

  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLogout = () => {
    auth.logout();
    navigate('/login');
  };

  // Desktop rule: ONLY the hamburger button opens/closes the sidebar —
  // clicking a nav item must never auto-close it. Mobile keeps its normal
  // drawer behavior (picking a page closes the overlay). This checks the
  // real viewport width at click time (not a stale value from mount), so
  // it stays correct across resizes without needing new shared state.
  const handleNavClick = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      onClose?.();
    }
  };

  const navItemClass = (path: string) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
      isActive(path)
        ? 'bg-slate-800/90 text-white font-semibold shadow-xs'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
    }`;

  const subNavItemClass = (path: string) =>
    `flex items-center gap-3 pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
      isActive(path)
        ? 'bg-slate-800/90 text-white font-semibold shadow-xs'
        : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Panel */}
      <aside
        id="main-sidebar"
        className={`fixed top-0 left-0 bottom-0 w-64 bg-[#0B192C] text-slate-200 z-50 flex flex-col transition-transform duration-200 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } border-r border-slate-800/80 shadow-2xl lg:shadow-none`}
      >
        {/* Brand Logo Header */}
        <div className="p-5 border-b border-slate-800/70 flex items-center justify-between">
          <NavLink to="/app/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden p-1">
              <img src={logoIcon} alt="HireFlow AI" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-black text-lg text-white tracking-tight leading-tight">
                HireFlow AI
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">
                AI Career Workspace
              </p>
            </div>
          </NavLink>

          {/* Close button — mobile drawer only; on desktop the Navbar's
              hamburger (now a Menu/X toggle) already controls the sidebar,
              so no extra icon is introduced into the existing desktop
              sidebar header. */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="lg:hidden text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 overflow-y-auto px-3.5 py-5 space-y-1.5 custom-scrollbar">
          {/* Dashboard */}
          <NavLink to="/app/dashboard" onClick={handleNavClick} className={navItemClass('/app/dashboard')}>
            <LayoutDashboard size={18} className="shrink-0" />
            <span>Dashboard</span>
          </NavLink>

          {/* Collapsible Group 1: Build with AI */}
          <div>
            <button
              onClick={() => setBuildGroupOpen(!buildGroupOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Sparkles size={18} className="shrink-0 text-blue-400" />
                <span>Build with AI</span>
              </div>
              {buildGroupOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {buildGroupOpen && (
              <div className="mt-1 space-y-1">
                <NavLink to="/app/builder" onClick={handleNavClick} className={subNavItemClass('/app/builder')}>
                  <FileText size={16} className="shrink-0" />
                  <span>Resume Builder</span>
                </NavLink>
                <NavLink to="/app/templates" onClick={handleNavClick} className={subNavItemClass('/app/templates')}>
                  <Layout size={16} className="shrink-0" />
                  <span>Templates</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* Collapsible Group 2: Analysis */}
          <div>
            <button
              onClick={() => setAnalysisGroupOpen(!analysisGroupOpen)}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/40 transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <BarChart2 size={18} className="shrink-0 text-emerald-400" />
                <span>Analysis</span>
              </div>
              {analysisGroupOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            </button>

            {analysisGroupOpen && (
              <div className="mt-1 space-y-1">
                <NavLink
                  to="/app/ats-analysis"
                  onClick={handleNavClick}
                  className={subNavItemClass('/app/ats-analysis')}
                >
                  <BarChart3 size={16} className="shrink-0" />
                  <span>ATS Analysis</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* AI Assistant */}
          <NavLink to="/app/assistant" onClick={handleNavClick} className={navItemClass('/app/assistant')}>
            <Bot size={18} className="shrink-0 text-indigo-400" />
            <span>AI Career Coach</span>
          </NavLink>

          {/* Profile & Settings */}
          <NavLink to="/app/profile" onClick={handleNavClick} className={navItemClass('/app/profile')}>
            <User size={18} className="shrink-0" />
            <span>Profile</span>
          </NavLink>

          <NavLink to="/app/settings" onClick={handleNavClick} className={navItemClass('/app/settings')}>
            <Settings size={18} className="shrink-0 text-slate-400" />
            <span>Settings</span>
          </NavLink>
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center justify-between gap-2 p-2 rounded-xl hover:bg-slate-800/60 transition-colors">
            <NavLink
              to="/app/profile"
              onClick={handleNavClick}
              className="flex items-center gap-3 flex-1 min-w-0"
            >
              <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-white shrink-0">
                {currentUser.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                <p className="text-[11px] text-slate-400 truncate">View Profile & Settings</p>
              </div>
            </NavLink>

            <button
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
