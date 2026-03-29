import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerApi, sendOtp } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
    BookOpen, Mail, Lock, User, Sparkles, Rocket, Star,
    CheckCircle2, Flame, GraduationCap, Clock, ListTodo, TrendingUp, Key
} from 'lucide-react';

const FEATURES = [
    { icon: <GraduationCap size={16} />, color: '#818cf8', text: 'GPA & CGPA tracker across all semesters' },
    { icon: <Clock size={16} />, color: '#10b981', text: 'Smart timetable with today\'s class view' },
    { icon: <CheckCircle2 size={16} />, color: '#f59e0b', text: 'Assignment deadlines & to-do lists' },
    { icon: <Flame size={16} />, color: '#ef4444', text: 'Study journal with activity heatmap' },
    { icon: <ListTodo size={16} />, color: '#a78bfa', text: 'Notes wall, portfolio & skill tracker' },
    { icon: <TrendingUp size={16} />, color: '#22d3ee', text: 'Attendance tracker with warnings' },
];

const RegisterPage = () => {
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const pwdStrength = () => {
        const p = form.password;
        if (!p) return 0;
        let score = 0;
        if (p.length >= 6) score++;
        if (p.length >= 10) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };
    const strength = pwdStrength();
    const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
    const strengthColor = ['', '#ef4444', '#f97316', '#f59e0b', '#10b981', '#06b6d4'][strength];

    const handleSendOtp = async (e) => {
        e.preventDefault();
        if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            await sendOtp({ email: form.email });
            toast.success(`OTP sent to ${form.email}`);
            setStep(2);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (!otp) { toast.error('Please enter the verification code'); return; }
        setLoading(true);
        try {
            const res = await registerApi({ ...form, otp });
            login(res.data.user, res.data.token);
            toast.success(`Welcome to StudyTrack, ${res.data.user.name}! 🚀`);
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-bg">
            {/* Left panel */}
            <div style={{
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                padding: '3rem', maxWidth: 520,
                background: 'linear-gradient(160deg, rgba(139,92,246,0.08) 0%, rgba(8,8,18,0) 70%)',
                borderRight: '1px solid rgba(99,102,241,0.08)'
            }} className="hide-mobile">
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
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '0.75rem' }}>
                        <Sparkles size={18} color="#a78bfa" />
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Start for free</span>
                    </div>
                    <h2 style={{ fontSize: '2.1rem', fontWeight: 900, lineHeight: 1.2, letterSpacing: '-0.04em', marginBottom: '0.75rem' }}>
                        Build your<br /><span className="gradient-text">student workspace</span>
                    </h2>
                    <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.7 }}>
                        Join thousands of students who track smarter — not harder.
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

                {/* Creator's Note */}
                <div style={{ marginTop: '2.5rem', padding: '1rem 1.25rem', background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.12)', borderRadius: 12, position: 'relative' }}>
                    <div style={{ position: 'absolute', top: -10, left: 16, background: '#0a0a14', padding: '0 8px', color: '#8b5cf6', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Creator's Note
                    </div>
                    <p style={{ fontSize: '0.78rem', color: '#94a3b8', fontStyle: 'italic', lineHeight: 1.6, marginTop: 4 }}>
                        "I built StudyTrack because I needed a smarter way to manage my GPA, timetable, and study habits in one place. Built for students, by a student."
                    </p>
                    <a href="https://linkedin.com/in/siddharth2006" target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: 12, textDecoration: 'none', width: 'fit-content' }}>
                        <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>S</div>
                        <div>
                            <p style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4 }}>
                                Siddharth 
                                <span style={{ opacity: 0.5 }}>
                                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                                </span>
                            </p>
                            <p style={{ fontSize: '0.6rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2 }}>Full Stack Developer</p>
                        </div>
                    </a>
                </div>

                <div style={{ marginTop: '2rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {[1, 2, 3, 4, 5].map(s => <Star key={s} size={13} fill="#f59e0b" color="#f59e0b" />)}
                    <span style={{ fontSize: '0.75rem', color: '#475569', marginLeft: 4 }}>Loved by students across campuses</span>
                </div>
            </div>

            {/* Right panel — form */}
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', zIndex: 1 }}>
                <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 460, padding: '2rem 1.75rem' }}>
                    {/* Mobile logo */}
                    <div className="hide-desktop" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                        <div style={{ width: 42, height: 42, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 8px' }}>
                            <BookOpen size={20} color="white" />
                        </div>
                        <h1 className="gradient-text" style={{ fontSize: '1.3rem', fontWeight: 900 }}>StudyTrack</h1>
                    </div>

                    <div style={{ marginBottom: '1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                            <Rocket size={16} color="#818cf8" />
                            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, letterSpacing: '-0.02em' }}>Create your workspace</h2>
                        </div>
                        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>Free forever. No credit card required.</p>
                    </div>

                    <form onSubmit={step === 1 ? handleSendOtp : handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {step === 1 ? (
                            <>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, marginBottom: 6, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name</label>
                            <div style={{ position: 'relative' }}>
                                <User size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input type="text" placeholder="Your name" className="input" style={{ paddingLeft: '2.25rem' }}
                                    value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required autoFocus />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, marginBottom: 6, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                            <div style={{ position: 'relative' }}>
                                <Mail size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input type="email" placeholder="you@example.com" className="input" style={{ paddingLeft: '2.25rem' }}
                                    value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, marginBottom: 6, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                            <div style={{ position: 'relative' }}>
                                <Lock size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                <input type={showPwd ? 'text' : 'password'} placeholder="min. 6 characters" className="input" style={{ paddingLeft: '2.25rem', paddingRight: '2.5rem' }}
                                    value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', fontSize: '0.65rem', fontWeight: 700, padding: 0 }}>
                                    {showPwd ? 'HIDE' : 'SHOW'}
                                </button>
                            </div>

                            {/* Strength bar */}
                            {form.password && (
                                <div style={{ marginTop: 8 }}>
                                    <div style={{ display: 'flex', gap: 3, marginBottom: 4 }}>
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i <= strength ? strengthColor : 'rgba(99,102,241,0.1)', transition: 'background 0.3s' }} />
                                        ))}
                                    </div>
                                    <p style={{ fontSize: '0.65rem', color: strengthColor, fontWeight: 600 }}>{strengthLabel}</p>
                                </div>
                            )}
                        </div>
                        </>
                        ) : (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.73rem', fontWeight: 700, marginBottom: 6, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Verification Code</label>
                                <div style={{ position: 'relative' }}>
                                    <Key size={15} style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                                    <input type="text" placeholder="Enter 6-digit code" className="input" style={{ paddingLeft: '2.25rem' }} value={otp} onChange={e => setOtp(e.target.value)} required autoFocus />
                                </div>
                                <p style={{ fontSize: '0.7rem', color: '#64748b', marginTop: 8 }}>We sent a code to <strong>{form.email}</strong></p>
                                <button type="button" onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#818cf8', fontSize: '0.7rem', fontWeight: 600, marginTop: 4, cursor: 'pointer', padding: 0 }}>← Back to edit details</button>
                            </div>
                        )}

                        <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: 6, width: '100%', padding: '0.78rem', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                            {loading
                                ? <><span style={{ width: 15, height: 15, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> {step === 1 ? 'Sending Code...' : 'Creating workspace...'}</>
                                : <><Rocket size={15} /> {step === 1 ? 'Continue' : 'Verify & Create Workspace'}</>
                            }
                        </button>
                    </form>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', color: '#475569', fontSize: '0.8rem' }}>
                        Already have a workspace?{' '}
                        <Link to="/login" style={{ color: '#818cf8', fontWeight: 700, textDecoration: 'none' }}>Sign in →</Link>
                    </p>

                    {/* Trust badges */}
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginTop: '1.25rem', flexWrap: 'wrap' }}>
                        {['🔒 Secure', '☁️ Cloud Sync', '📱 Mobile Ready'].map(b => (
                            <span key={b} style={{ fontSize: '0.65rem', color: '#334155', fontWeight: 500, padding: '0.2rem 0.55rem', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)', borderRadius: 20 }}>{b}</span>
                        ))}
                    </div>

                    <p style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.65rem', color: '#334155', lineHeight: 1.5 }}>
                        By creating an account, you agree to store your data securely in our cloud.
                    </p>
                </div>
            </div>

            <style>{`
        @media (max-width: 768px) { .hide-mobile { display: none !important; } }
        @media (min-width: 769px) { .hide-desktop { display: none !important; } }
      `}</style>
        </div>
    );
};

export default RegisterPage;
