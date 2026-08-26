import React from 'react';
import { Loader2 } from 'lucide-react';
import GoogleIcon from './icons/GoogleIcon';

interface GoogleButtonProps {
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
  label?: string;
}

export default function GoogleButton({
  onClick,
  loading = false,
  disabled = false,
  className = '',
  label = 'Continue with Google',
}: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      aria-label={loading ? 'Connecting to Google...' : label}
      className={`w-full bg-white hover:bg-slate-50 border border-slate-300/90 text-slate-800 py-3 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-3 shadow-2xs hover:shadow-xs focus:outline-none focus:ring-2 focus:ring-[#0B192C] focus:ring-offset-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? (
        <>
          <Loader2 size={18} className="animate-spin text-slate-600 shrink-0" />
          <span className="text-slate-600 font-medium">Connecting to Google...</span>
        </>
      ) : (
        <>
          <GoogleIcon className="w-5 h-5 shrink-0" />
          <span>{label}</span>
        </>
      )}
    </button>
  );
}
