import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    BookOpen, Mail, Lock, LogIn, CheckCircle2, Flame,
    GraduationCap, Clock, ListTodo, StickyNote, TrendingUp
} from 'lucide-react';

const FEATURES = [
    { icon: <GraduationCap size={16} />, color: '#818cf8', text: 'GPA & CGPA tracker across all semesters' },
    { icon: <Clock size={16} />, color: '#10b981', text: 'Smart timetable with today\'s class view' },
    { icon: <CheckCircle2 size={16} />, color: '#f59e0b', text: 'Assignment deadlines & to-do lists' },
    { icon: <Flame size={16} />, color: '#ef4444', text: 'Study journal with activity heatmap' },
    { icon: <ListTodo size={16} />, color: '#a78bfa', text: 'Notes wall, portfolio & skill tracker' },
    { icon: <TrendingUp size={16} />, color: '#22d3ee', text: 'Attendance tracker with warnings' },
];

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginApi(form);
            login(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}! 👋`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            {/* Left panel — brand / features */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '3rem', maxWidth: 520,
                background: 'linear-gradient(160deg, rgba(99,102,241,0.1) 0%, rgba(8,8,18,0) 70%)',
                borderRight: '1px solid rgba(99,102,241,0.08)'
            }} className="hide-mobile">
                {/* Logo */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: '3rem' }}>
                    <div style={{
                        width: 48, height: 48, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                        borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: '0 8px 28px rgba(99,102,241,0.4)'
                    }}>
                        <BookOpen size={24} color="white" />
                    </div>
                    <div>
                        <h1 className="gradient-text" style={{ fontSize: '1.5rem', fontWeight: 900, letterSpacing: '-0.03em' }}>StudyTrack</h1>
                        <p style={{ fontSize: '0.72rem', color: '#475569', fontWeight: 500 }}>Your personal study companion</p>
                    </div>
                </div>

                <div style={{ marginBottom: '2.5rem' }}>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.04em', marginBottom: '0.75rem' }}>
                        Track everything.<br />
                        <span className="gradient-text">Achieve more.</span>
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.9rem', lineHeight: 1.7 }}>
                        Your all-in-one personal student workspace — built for students, by design.
                    </p>
                </div>

                {/* Feature list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
                    {FEATURES.map((f, i) => (
                        <div key={i} className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', animationDelay: `${i * 0.06}s` }}>
                            <div style={{
                                width: 30, height: 30, borderRadius: 8, background: `${f.color}18`,
                                border: `1px solid ${f.color}33`, display: 'flex', alignItems: 'center',
                                justifyContent: 'center', flexShrink: 0, color: f.color
                            }}>{f.icon}</div>
                            <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontWeight: 500 }}>{f.text}</span>
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '2.5rem', padding: '1rem 1.25rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 12 }}>
                    <p style={{ fontSize: '0.78rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.6 }}>
                        "The most feature-rich personal student tracker I've used. GPA tracking + timetable + journal in one place!"
                    </p>
                    <p style={{ fontSize: '0.7rem', color: '#475569', marginTop: 8, fontWeight: 600 }}>— Final year engineering student</p>
                </div>
            </div>

            {/* Right panel — form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 440, padding: '2rem 1.75rem' }}>
                    {/* Mobile logo */}
                    <div className="hide-desktop" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: 44, height: 44, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                            <BookOpen size={22} color="white" />
                        </div>
                        <h1 className="gradient-text" style={{ fontSize: '1.4rem', fontWeight: 900 }}>StudyTrack</h1>
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <h2 style={{ fontSize: '1.35rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 4 }}>Welcome back 👋</h2>
                        <p style={{ color: '#64748b', fontSize: '0.82rem' }}>Sign in to continue to your workspace</p>
                    </div>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input type="email" placeholder="you@example.com" className="input" style={{ paddingLeft: '2.25rem' }}
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoFocus />
                            </div>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                                <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                                <Link to="/forgot-password" style={{ fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Forgot?</Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" className="input" style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.7rem', fontWeight: 600, padding: 0 }}>
                                    {showPwd ? 'HIDE' : 'SHOW'}
                                </button>
                            </div>
                        </div>

                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 6, width: '100%', padding: '0.75rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {loading ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Signing in...</> : <><LogIn size={16} /> Sign In</>}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <p style={{ color: '#475569', fontSize: '0.82rem' }}>
                            New student?{' '}
                            <Link to="/register" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>Create your workspace →</Link>
                        </p>
                    </div>

                    {/* Trust badges */}
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                        {['🔒 Secure', '☁️ Cloud Sync', '📱 Mobile Ready'].map(b => (
                            <span key={b} style={{ fontSize: '0.65rem', color: '#334155', fontWeight: 500, padding: '0.2rem 0.55rem', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 20 }}>{b}</span>
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
        @media (min-width: 769px) { .hide-desktop { display: none !important; } }
      `}</style>
        </div>
    );
};

export default LoginPage;
