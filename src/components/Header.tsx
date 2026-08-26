import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleScrollTo = (id: string) => {
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="pt-8 sm:pt-12 pb-2">
      {/* Top Banner Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link to="/" className="inline-block">
            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-[#0B192C] tracking-tighter leading-none select-none">
              HIREFLOW AI
            </h1>
          </Link>
          <p className="text-slate-600 font-medium text-base sm:text-lg mt-2 sm:mt-3 tracking-tight">
            Your AI Career Workspace
          </p>
        </div>

        <div className="font-mono text-[11px] sm:text-xs text-slate-500 tracking-widest uppercase flex flex-col md:items-end gap-1">
          <div>RESUME &middot; ATS &middot; INTERVIEW</div>
          <div>BUILT FOR STUDENTS &amp; PROFESSIONALS</div>
          <a
            href="mailto:hello@hireflow.ai"
            className="hover:text-[#0B192C] transition-colors"
          >
            HELLO@HIREFLOW.AI
          </a>
        </div>
      </div>

      {/* Hairline Divider */}
      <div className="border-b border-slate-300/70 mt-6 sm:mt-8 mb-4 sm:mb-5" />

      {/* Navigation Bar */}
      <nav className="flex items-center flex-wrap gap-x-4 sm:gap-x-8 gap-y-2 text-xs sm:text-sm font-bold font-mono tracking-wider text-[#0B192C] uppercase py-1">
        <Link
          to="/"
          className={`hover:text-blue-600 transition-colors cursor-pointer ${
            location.pathname === '/' ? 'text-blue-600 underline underline-offset-4' : ''
          }`}
        >
          HOME
        </Link>
        <span className="text-slate-300 select-none">/</span>
        
        <Link
          to="/app/templates"
          className={`hover:text-blue-600 transition-colors cursor-pointer ${
            location.pathname.includes('templates') ? 'text-blue-600 underline underline-offset-4' : ''
          }`}
        >
          TEMPLATES
        </Link>
        <span className="text-slate-300 select-none">/</span>
        
        <Link
          to="/app/assistant"
          className={`hover:text-blue-600 transition-colors cursor-pointer ${
            location.pathname.includes('assistant') ? 'text-blue-600 underline underline-offset-4' : ''
          }`}
        >
          AI ASSISTANT
        </Link>
        <span className="text-slate-300 select-none">/</span>

        <Link
          to="/?auth=login"
          className={`hover:text-blue-600 transition-colors ${
            location.pathname === '/login' || location.search.includes('auth=login') ? 'text-blue-600 underline underline-offset-4' : ''
          }`}
        >
          SIGN IN
        </Link>
        <span className="text-slate-300 select-none">/</span>

        <Link
          to="/?auth=signup"
          className={`hover:text-blue-600 transition-colors ${
            location.pathname === '/signup' || location.search.includes('auth=signup') ? 'text-blue-600 underline underline-offset-4' : ''
          }`}
        >
          SIGN UP
        </Link>
      </nav>

      {/* Bottom Hairline Divider */}
      <div className="border-b border-slate-300/70 mt-4 sm:mt-5 mb-8 sm:mb-12" />
    </header>
  );
}
