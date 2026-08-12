import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from './api';

export const REDIRECT_KEY = 'hireflow_redirect_after_login';
export const PENDING_ACTION_KEY = 'hireflow_pending_action';

/** Stashing pending user actions (e.g. Export PDF, Save Resume) across logins */
export function savePendingAction(actionName: string, payload?: any) {
  try {
    sessionStorage.setItem(PENDING_ACTION_KEY, JSON.stringify({ actionName, payload }));
  } catch {}
}

export function consumePendingAction(): { actionName: string; payload?: any } | null {
  try {
    const raw = sessionStorage.getItem(PENDING_ACTION_KEY);
    if (raw) {
      sessionStorage.removeItem(PENDING_ACTION_KEY);
      return JSON.parse(raw);
    }
  } catch {}
  return null;
}

export function rememberCurrentLocationForRedirect(pathname: string, search: string) {
  try {
    sessionStorage.setItem(REDIRECT_KEY, `${pathname}${search}`);
  } catch {}
}

export function consumeRedirectAfterLogin(fallback: string = '/dashboard'): string {
  try {
    const stored = sessionStorage.getItem(REDIRECT_KEY);
    if (stored) {
      sessionStorage.removeItem(REDIRECT_KEY);
      return stored;
    }
  } catch {}
  return fallback;
}

/**
 * Gates an action behind authentication. Guests trigger a "Login Required"
 * modal; logged-in users execute immediately. Upon login, the action runs automatically.
 */
export function useAuthGate() {
  const [isGateOpen, setIsGateOpen] = useState(false);
  const [pendingCallback, setPendingCallback] = useState<(() => void) | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const isGuest = !isAuthenticated();

  const requireAuth = (action: () => void, actionName?: string, payload?: any) => {
    if (isAuthenticated()) {
      action();
      return;
    }
    setPendingCallback(() => action);
    if (actionName) {
      savePendingAction(actionName, payload);
    }
    setIsGateOpen(true);
  };

  const handleAuthSuccess = () => {
    setIsGateOpen(false);
    if (pendingCallback) {
      const cb = pendingCallback;
      setPendingCallback(null);
      cb();
    }
  };

  const goToAuth = (mode: 'login' | 'signup') => {
    rememberCurrentLocationForRedirect(location.pathname, location.search);
    setIsGateOpen(false);
    navigate(mode === 'login' ? '/login' : '/signup');
  };

  return {
    isGuest,
    isGateOpen,
    closeGate: () => setIsGateOpen(false),
    requireAuth,
    goToAuth,
    handleAuthSuccess,
  };
}
