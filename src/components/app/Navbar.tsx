import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import { auth } from '../../lib/api';
import {
  Menu,
  X,
  Search,
  Home,
  Bell,
  ChevronDown,
  User,
  Settings,
  HelpCircle,
  LogOut,
  CheckCircle2,
  Sparkles,
  BarChart3
} from 'lucide-react';
import { getStoredUser } from '../../lib/api';
import { notificationService, NotificationRecord } from '../../services/notification.service';

interface NavbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export default function Navbar({ sidebarOpen, onToggleSidebar }: NavbarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const storedUser = getStoredUser();
  const initials = storedUser?.name
    ? storedUser.name
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';
  const currentUser = {
    name: storedUser?.name || 'User',
    email: storedUser?.email || '',
    avatar: initials,
  };

  useEffect(() => {
    let cancelled = false;
    notificationService.listNotifications().then((data) => {
      if (!cancelled) setNotifications(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const [notifPos, setNotifPos] = useState<{ top: number; right: number } | null>(null);
  const [profilePos, setProfilePos] = useState<{ top: number; right: number } | null>(null);

  const toggleNotifications = () => {
    if (!notificationsOpen && notifRef.current) {
      const rect = notifRef.current.getBoundingClientRect();
      setNotifPos({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }
    setNotificationsOpen(!notificationsOpen);
    setProfileOpen(false);
  };

  const toggleProfile = () => {
    if (!profileOpen && profileRef.current) {
      const rect = profileRef.current.getBoundingClientRect();
      setProfilePos({
        top: rect.bottom + 8,
        right: Math.max(16, window.innerWidth - rect.right),
      });
    }
    setProfileOpen(!profileOpen);
    setNotificationsOpen(false);
  };

  // Recalculate positions on scroll / resize while open
  useEffect(() => {
    const updatePositions = () => {
      if (notificationsOpen && notifRef.current) {
        const rect = notifRef.current.getBoundingClientRect();
        setNotifPos({
          top: rect.bottom + 8,
          right: Math.max(16, window.innerWidth - rect.right),
        });
      }
      if (profileOpen && profileRef.current) {
        const rect = profileRef.current.getBoundingClientRect();
        setProfilePos({
          top: rect.bottom + 8,
          right: Math.max(16, window.innerWidth - rect.right),
        });
      }
    };

    window.addEventListener('resize', updatePositions);
    window.addEventListener('scroll', updatePositions, true);
    return () => {
      window.removeEventListener('resize', updatePositions);
      window.removeEventListener('scroll', updatePositions, true);
    };
  }, [notificationsOpen, profileOpen]);

  // Close dropdowns on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (
        notifRef.current &&
        !notifRef.current.contains(target) &&
        notifDropdownRef.current &&
        !notifDropdownRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
      if (
        profileRef.current &&
        !profileRef.current.contains(target) &&
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(target)
      ) {
        setProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAllAsRead = () => {
    const unread = notifications.filter((n) => !n.is_read);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
    unread.forEach((n) => {
      notificationService.markAsRead(n.id).catch(() => {
        // Non-fatal: local state already reflects "read"; a retry can
        // happen next time the list is refetched.
      });
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/app/builder?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
      {/* Left section: Mobile Hamburger & Search */}
      <div className="flex items-center gap-3 flex-1 max-w-xl">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="p-2 text-slate-600 hover:text-[#0B192C] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          title="Toggle Navigation Menu"
          aria-label={sidebarOpen ? 'Close navigation' : 'Open navigation'}
          aria-expanded={sidebarOpen}
          aria-controls="main-sidebar"
        >
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resumes, jobs, suggestions..."
            className="w-full bg-slate-50 border border-slate-200/90 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-[#0B192C] placeholder-slate-400 focus:outline-none focus:border-[#0B192C] focus:bg-white transition-all shadow-2xs"
          />
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
        </form>
      </div>

      {/* Right Section: Landing Page Button, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Landing Page Link Button (Connects App Workspace to Public Landing) */}
        <Link
          to="/"
          className="hidden sm:inline-flex items-center gap-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 hover:text-[#0B192C] px-3.5 py-2 rounded-xl text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          title="Return to Public Landing Page"
        >
          <Home size={15} className="text-slate-500" />
          <span>Landing Page</span>
        </Link>

        {/* Notifications Dropdown Trigger */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={toggleNotifications}
            className="relative p-2.5 text-slate-600 hover:text-[#0B192C] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
            )}
          </button>
        </div>

        {/* Notifications Panel Portal */}
        {notificationsOpen &&
          notifPos &&
          createPortal(
            <div
              ref={notifDropdownRef}
              style={{
                position: 'fixed',
                top: `${notifPos.top}px`,
                right: `${notifPos.right}px`,
                zIndex: 99999,
              }}
              className="w-80 sm:w-96 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm text-[#0B192C]">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 hover:underline font-medium cursor-pointer"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    You're all caught up — no notifications yet.
                  </div>
                ) : (
                  notifications.map((item) => (
                    <div
                      key={item.id}
                      className={`p-3.5 text-left flex items-start gap-3 transition-colors ${
                        item.is_read ? 'bg-white' : 'bg-blue-50/30'
                      }`}
                    >
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0 mt-0.5">
                        {item.type === 'score' ? (
                          <BarChart3 size={15} />
                        ) : item.type === 'suggestion' ? (
                          <Sparkles size={15} />
                        ) : (
                          <CheckCircle2 size={15} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-[#0B192C] leading-snug">
                          {item.title}
                        </p>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {item.message}
                        </p>
                        <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                          {new Date(item.created_at).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="p-2 border-t border-slate-100 bg-slate-50 text-center">
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="text-xs font-medium text-slate-500 hover:text-[#0B192C]"
                >
                  Close
                </button>
              </div>
            </div>,
            document.body
          )}

        {/* User Profile Avatar Dropdown Trigger */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={toggleProfile}
            className="flex items-center gap-2.5 p-1 sm:p-1.5 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-full bg-[#0B192C] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {currentUser.avatar}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-[#0B192C] leading-tight">
                {currentUser.name}
              </p>
            </div>
            <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
          </button>
        </div>

        {/* Profile Dropdown Portal */}
        {profileOpen &&
          profilePos &&
          createPortal(
            <div
              ref={profileDropdownRef}
              style={{
                position: 'fixed',
                top: `${profilePos.top}px`,
                right: `${profilePos.right}px`,
                zIndex: 99999,
              }}
              className="w-56 bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden py-1.5 animate-in fade-in slide-in-from-top-2 duration-150"
            >
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-[#0B192C]">{currentUser.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
              </div>

              <div className="py-1">
                <Link
                  to="/app/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B192C]"
                >
                  <User size={15} className="text-slate-400" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/app/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B192C]"
                >
                  <Settings size={15} className="text-slate-400" />
                  <span>Settings</span>
                </Link>

                <Link
                  to="/"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0B192C]"
                >
                  <Home size={15} className="text-slate-400" />
                  <span>Public Landing Page</span>
                </Link>
              </div>

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={() => {
                    setProfileOpen(false);
                    auth.logout();
                    navigate('/login');
                  }}
                  className="flex items-center gap-2.5 w-full text-left px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>,
            document.body
          )}
      </div>
    </header>
  );
}
