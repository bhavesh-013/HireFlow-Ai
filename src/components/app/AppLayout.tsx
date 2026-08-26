import React, { useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { isAuthenticated } from '../../lib/api';
import { rememberCurrentLocationForRedirect } from '../../lib/authGate';

// Protected routes requiring authentication to access
const ACCOUNT_ONLY_PREFIXES = [
  '/dashboard',
  '/app/dashboard',
  '/profile',
  '/app/profile',
  '/settings',
  '/app/settings',
];

export default function AppLayout() {
  // Single source of truth for sidebar state — shared between Sidebar and
  // Navbar via props (no duplicate state in either child component).
  //
  // Default: open on desktop, closed on mobile — this matches exactly how
  // the app already looked before this fix (desktop previously forced the
  // sidebar visible via CSS regardless of state; mobile defaulted closed).
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.matchMedia('(min-width: 1024px)').matches : true
  );
  const location = useLocation();

  const requiresAccount = ACCOUNT_ONLY_PREFIXES.some((p) => location.pathname.startsWith(p));
  if (requiresAccount && !isAuthenticated()) {
    rememberCurrentLocationForRedirect(location.pathname, location.search);
    return <Navigate to="/?auth=login" replace />;
  }

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#0B192C] flex font-sans relative selection:bg-[#0B192C] selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area — padding only reserves space for the sidebar
          on desktop while it's open; on mobile the sidebar is always an
          overlay so content never reflows for it. */}
      <div
        className={`flex-1 flex flex-col min-w-0 min-h-screen transition-[padding] duration-200 ease-in-out ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        {/* Top Navbar */}
        <Navbar sidebarOpen={sidebarOpen} onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />

        {/* Page Main Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
