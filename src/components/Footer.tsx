import React from 'react';

interface FooterProps {
  onOpenInfo?: (title: string, content: string) => void;
}

export default function Footer({ onOpenInfo }: FooterProps) {
  const handleLinkClick = (e: React.MouseEvent, type: string) => {
    e.preventDefault();
    if (!onOpenInfo) return;

    if (type === 'GITHUB') {
      onOpenInfo(
        'GITHUB REPOSITORY',
        'HireFlow AI is an open-source, privacy-first career workspace. Explore our public repository on GitHub for ATS parsers, template definitions, and AI prompt engineering tools.'
      );
    } else if (type === 'EMAIL') {
      window.location.href = 'mailto:hello@hireflow.ai';
    } else if (type === 'ABOUT') {
      onOpenInfo(
        'ABOUT HIREFLOW AI',
        'HireFlow AI was built to simplify the job application process for students and professionals. By unifying resume creation, ATS scoring, and interview practice in one calm workspace, we help applicants present their best self.'
      );
    } else if (type === 'PRIVACY') {
      onOpenInfo(
        'PRIVACY & DATA SECURITY',
        'Your data stays yours. HireFlow AI processes documents locally in your browser session or through secure encrypted end-to-end endpoints. We never sell, store, or train models on your personal resume content.'
      );
    }
  };

  return (
    <footer className="mt-16 sm:mt-24 border-t border-slate-300/70 pt-8 pb-20 font-mono text-xs sm:text-sm text-slate-500 uppercase tracking-widest">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center flex-wrap justify-center sm:justify-start gap-6 sm:gap-8">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => handleLinkClick(e, 'GITHUB')}
            className="hover:text-[#0B192C] transition-colors cursor-pointer"
          >
            GITHUB
          </a>
          <a
            href="mailto:hello@hireflow.ai"
            className="hover:text-[#0B192C] transition-colors cursor-pointer"
          >
            EMAIL
          </a>
          <button
            onClick={(e) => handleLinkClick(e, 'ABOUT')}
            className="hover:text-[#0B192C] transition-colors cursor-pointer"
          >
            ABOUT
          </button>
          <button
            onClick={(e) => handleLinkClick(e, 'PRIVACY')}
            className="hover:text-[#0B192C] transition-colors cursor-pointer"
          >
            PRIVACY
          </button>
        </div>

        <div className="text-slate-400">
          &copy; 2026 HIREFLOW AI
        </div>
      </div>
    </footer>
  );
}
