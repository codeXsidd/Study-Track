import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import SubjectsPage from './pages/SubjectsPage';
import AssignmentsPage from './pages/AssignmentsPage';
import CertificatesPage from './pages/CertificatesPage';
import PomodoroPage from './pages/PomodoroPage';
import GpaCalculatorPage from './pages/GpaCalculatorPage';
import TimetablePage from './pages/TimetablePage';
import StudyJournalPage from './pages/StudyJournalPage';
import PortfolioPage from './pages/PortfolioPage';
import NotesPage from './pages/NotesPage';
import DailyPlannerPage from './pages/DailyPlannerPage';
import HabitBuilderPage from './pages/HabitBuilderPage';
import FocusRoomPage from './pages/FocusRoomPage';
import AnalyticsPage from './pages/AnalyticsPage';
import AiChatPage from './pages/AiChatPage';
import AiMindSweepPage from './pages/AiMindSweepPage';
import AiArsenalPage from './pages/AiArsenalPage';
import CodeInsightPage from './pages/CodeInsightPage';
import StudyCardPage from './pages/StudyCardPage';

const Layout = ({ children }) => {
    const { pathname } = useLocation();

    // Auto-scroll to top when route changes
    useEffect(() => {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.scrollTo({ top: 0, behavior: 'instant' });
        }
    }, [pathname]);

    return (
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: 'var(--bg)' }}>
            <Sidebar />
            <main className="main-content" style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
                {/* Key forces component to unmount/remount on navigation for a 'fresh' feel */}
                <div key={pathname} style={{ height: '100%' }}>
                    {children}
                </div>
            </main>
        </div>
    );
};
const P = ({ children }) => <ProtectedRoute><Layout>{children}</Layout></ProtectedRoute>;

const AppRoutes = () => {
    const { token } = useAuth();
    return (
        <Routes>
            <Route path="/login" element={!token ? <LoginPage /> : <Navigate to="/" replace />} />
            <Route path="/register" element={!token ? <RegisterPage /> : <Navigate to="/" replace />} />
            <Route path="/forgot-password" element={!token ? <ForgotPasswordPage /> : <Navigate to="/" replace />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

            <Route path="/" element={<P><DashboardPage /></P>} />
            <Route path="/subjects" element={<P><SubjectsPage /></P>} />
            <Route path="/assignments" element={<P><AssignmentsPage /></P>} />
            <Route path="/certificates" element={<P><CertificatesPage /></P>} />
            <Route path="/pomodoro" element={<P><PomodoroPage /></P>} />
            <Route path="/gpa" element={<P><GpaCalculatorPage /></P>} />
            <Route path="/timetable" element={<P><TimetablePage /></P>} />
            <Route path="/journal" element={<P><StudyJournalPage /></P>} />
            <Route path="/portfolio" element={<P><PortfolioPage /></P>} />
            <Route path="/notes" element={<P><NotesPage /></P>} />
            <Route path="/planner" element={<P><DailyPlannerPage /></P>} />
            <Route path="/habits" element={<P><HabitBuilderPage /></P>} />
            <Route path="/focus-room" element={<P><FocusRoomPage /></P>} />
            <Route path="/analytics" element={<P><AnalyticsPage /></P>} />
            <Route path="/ai-chat" element={<P><AiChatPage /></P>} />
            <Route path="/mind-sweep" element={<P><AiMindSweepPage /></P>} />
            <Route path="/arsenal" element={<P><AiArsenalPage /></P>} />
            <Route path="/codeinsight" element={<P><CodeInsightPage /></P>} />
            <Route path="/study-card" element={<P><StudyCardPage /></P>} />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};


function App() {
    return (
        <HelmetProvider>
            <AuthProvider>
                <BrowserRouter>
                <AppRoutes />
                <Toaster position="top-right" toastOptions={{
                    style: { background: '#1a1a2e', color: '#e2e8f0', border: '1px solid rgba(99,102,241,0.2)', borderRadius: '10px', fontFamily: 'Inter, sans-serif', fontSize: '0.875rem' },
                    success: { iconTheme: { primary: '#10b981', secondary: '#1a1a2e' } },
                    error: { iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' } }
                }} />
            </BrowserRouter>
        </AuthProvider>
        </HelmetProvider>
    );
}

export default App;
