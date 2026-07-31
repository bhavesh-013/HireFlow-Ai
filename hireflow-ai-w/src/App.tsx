import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import FloatingToolbar from './components/FloatingToolbar';
import InfoModal from './components/InfoModal';

import AppLayout from './components/app/AppLayout';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import NotFoundPage from './pages/NotFoundPage';

import DashboardPage from './pages/DashboardPage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import ResumeEditorPage from './pages/ResumeEditorPage';
import TailoredResumePage from './pages/TailoredResumePage';
import ResumeTemplatesPage from './pages/ResumeTemplatesPage';
import ATSAnalysisPage from './pages/ATSAnalysisPage';
import AISuggestionsPage from './pages/AISuggestionsPage';
import JDMatchPage from './pages/JDMatchPage';
import AICareerCoachPage from './pages/AICareerCoachPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

function PublicLayout({ children }: { children: React.ReactNode }) {
  const [infoModal, setInfoModal] = useState<{ title: string | null; content: string | null }>({
    title: null,
    content: null,
  });

  const handleOpenInfo = (title: string, content: string) => {
    setInfoModal({ title, content });
  };

  return (
    <div className="min-h-screen bg-[#F7F9FA] text-[#0B192C] flex flex-col font-sans relative selection:bg-[#0B192C] selection:text-white">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex-1 flex flex-col">
        {/* Top Header Navigation */}
        <Header />

        {/* Main Route Content */}
        <main className="flex-1">{children}</main>

        {/* Footer */}
        <Footer onOpenInfo={handleOpenInfo} />
      </div>

      {/* Floating Bottom Toolbar (Browse / Comment) */}
      <FloatingToolbar />

      {/* Info Overlay Modal */}
      <InfoModal
        title={infoModal.title}
        content={infoModal.content}
        onClose={() => setInfoModal({ title: null, content: null })}
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        />
        <Route
          path="/login"
          element={
            <PublicLayout>
              <LoginPage />
            </PublicLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicLayout>
              <SignupPage />
            </PublicLayout>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicLayout>
              <ForgotPasswordPage />
            </PublicLayout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <PublicLayout>
              <ResetPasswordPage />
            </PublicLayout>
          }
        />

        <Route
          path="/privacy"
          element={
            <PublicLayout>
              <LandingPage />
            </PublicLayout>
          }
        />

        {/* Workspace App Routes with Sidebar & Top Navbar */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/builder" element={<ResumeBuilderPage />} />
          <Route path="/editor" element={<ResumeEditorPage />} />
          <Route path="/tailored" element={<TailoredResumePage />} />
          <Route path="/templates" element={<ResumeTemplatesPage />} />
          <Route path="/ats-analysis" element={<ATSAnalysisPage />} />
          <Route path="/ai-suggestions" element={<AISuggestionsPage />} />
          <Route path="/jd-match" element={<JDMatchPage />} />
          <Route path="/assistant" element={<AICareerCoachPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          {/* Explicit /app/* aliases specified in user requirements */}
          <Route path="/app/dashboard" element={<DashboardPage />} />
          <Route path="/app/builder" element={<ResumeBuilderPage />} />
          <Route path="/app/editor" element={<ResumeEditorPage />} />
          <Route path="/app/tailored" element={<TailoredResumePage />} />
          <Route path="/app/templates" element={<ResumeTemplatesPage />} />
          <Route path="/app/ats" element={<ATSAnalysisPage />} />
          <Route path="/app/ats-analysis" element={<ATSAnalysisPage />} />
          <Route path="/app/suggestions" element={<AISuggestionsPage />} />
          <Route path="/app/ai-suggestions" element={<AISuggestionsPage />} />
          <Route path="/app/jd-match" element={<JDMatchPage />} />
          <Route path="/app/assistant" element={<AICareerCoachPage />} />
          <Route path="/app/profile" element={<ProfilePage />} />
          <Route path="/app/settings" element={<SettingsPage />} />
          <Route path="/app" element={<Navigate to="/app/dashboard" replace />} />
        </Route>

        {/* Fallback 404 */}
        <Route
          path="*"
          element={
            <PublicLayout>
              <NotFoundPage />
            </PublicLayout>
          }
        />
      </Routes>
    </Router>
  );
}
