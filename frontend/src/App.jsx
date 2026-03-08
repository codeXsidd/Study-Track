import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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
import AttendancePage from './pages/AttendancePage';
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
const Layout = ({ children }) => (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg)' }}>
        <Sidebar />
        <main className="main-content">
            {children}
        </main>
    </div>
);
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
            <Route path="/attendance" element={<P><AttendancePage /></P>} />
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

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};


function App() {
    return (
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
    );
}

export default App;
