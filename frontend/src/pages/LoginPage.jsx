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

const CuteLampLogin = ({ form, setForm, loading, showPwd, setShowPwd, handleSubmit, onToggle }) => {
    const [isFocused, setIsFocused] = useState('');
    const [isBeaming, setIsBeaming] = useState(true);

    const getRotation = () => {
        if (!isBeaming) return '0deg';
        if (isFocused === 'email') return '-8deg';
        if (isFocused === 'password') return '8deg';
        return '0deg';
    };

    return (
        <div style={{
            minHeight: '100vh',
            background: isBeaming ? '#12121c' : '#050508',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'background 0.5s ease',
            width: '100%'
        }}>
            {/* Toggle mapping back to old login screen */}
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#fff', fontSize: '0.8rem', fontWeight: 600 }}>Standard View</span>
                    <button onClick={onToggle} style={{
                        width: 50, height: 26, borderRadius: 13, background: '#444',
                        border: 'none', position: 'relative', cursor: 'pointer', transition: '0.3s'
                    }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: '50%', background: '#fff',
                            position: 'absolute', top: 3, right: 3, transition: '0.3s'
                        }} />
                    </button>
                    <span style={{ color: '#f8b500', fontSize: '0.8rem', fontWeight: 600 }}>Lamp View</span>
                </div>
            </div>

            {/* The Lamp */}
            <div style={{
                position: 'absolute',
                top: -10,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                zIndex: 20,
                filter: 'drop-shadow(0 15px 25px rgba(0,0,0,0.6))'
            }}>
                {/* Cord */}
                <div style={{ width: 6, height: 90, background: '#111', zIndex: 1 }} />
                
                {/* Base */}
                <div style={{ width: 70, height: 20, background: '#222', borderRadius: '30px 30px 0 0', zIndex: 2 }} />

                {/* Head */}
                <div style={{
                    width: 90, height: 60, 
                    background: 'linear-gradient(to bottom, #333, #1a1a1a)',
                    borderRadius: '45px 45px 15px 15px',
                    transformOrigin: 'top center',
                    transform: `rotate(${getRotation()})`,
                    transition: 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    position: 'relative',
                    zIndex: 3,
                    display: 'flex',
                    justifyContent: 'center'
                }}>
                    {/* Bulb */}
                    <div style={{
                        width: 50, height: 25, 
                        background: isBeaming ? '#fff' : '#333',
                        borderRadius: '0 0 25px 25px',
                        position: 'absolute', bottom: -20,
                        boxShadow: isBeaming ? '0 10px 40px 15px rgba(255, 230, 50, 0.9), inset 0 0 15px rgba(255, 255, 200, 1)' : 'inset 0 10px 10px rgba(0,0,0,0.7)',
                        transition: 'all 0.3s'
                    }} />

                    {/* Light Beam */}
                    {isBeaming && (
                        <div style={{
                            position: 'absolute',
                            top: '100%',
                            width: 180,
                            height: 800,
                            background: 'linear-gradient(to bottom, rgba(255, 240, 100, 0.3) 0%, rgba(255, 240, 100, 0.05) 50%, transparent 100%)',
                            clipPath: 'polygon(35% 0, 65% 0, 100% 100%, 0% 100%)',
                            pointerEvents: 'none',
                            zIndex: -1,
                            transformOrigin: 'top center'
                        }} />
                    )}
                </div>
            </div>

            {/* Switch Pull Chain (click to toggle light) */}
            <div style={{
                position: 'absolute', top: 100, left: 'calc(50% + 45px)', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center'
            }}>
                <div style={{ width: 2, height: 70, background: '#333' }} />
                <div 
                    onClick={() => setIsBeaming(!isBeaming)}
                    style={{ 
                        width: 12, height: 28, borderRadius: '6px', 
                        background: '#e74c3c', cursor: 'pointer',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.5)',
                        transform: 'translateY(0)',
                        transition: 'transform 0.1s'
                    }} 
                    onMouseDown={e => e.currentTarget.style.transform = 'translateY(12px)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'translateY(0)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    title="Toggle Light"
                />
            </div>

            {/* Login Form Panel */}
            <div style={{
                background: isBeaming ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(24px)',
                padding: '3rem 2.5rem',
                borderRadius: 24,
                width: '90%', maxWidth: 420,
                position: 'relative', zIndex: 30,
                marginTop: '130px',
                boxShadow: isBeaming ? '0 25px 60px rgba(0,0,0,0.6), inset 0 2px 2px rgba(255,255,255,0.1)' : '0 10px 30px rgba(0,0,0,0.9)',
                transition: 'all 0.5s ease',
                opacity: isBeaming ? 1 : 0.4,
                transform: isBeaming ? 'scale(1)' : 'scale(0.98)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em' }}>Welcome Back</h2>
                    <p style={{ color: '#888', marginTop: 8, fontSize: '0.9rem' }}>Sign in to continue to your workspace</p>
                </div>
                
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', color: isFocused === 'email' ? '#f8b500' : '#666', transition: 'color 0.3s', zIndex: 2 }}>
                            <Mail size={18} />
                        </div>
                        <input 
                            type="email" 
                            placeholder="Email address" 
                            style={{ 
                                width: '100%', padding: '1rem 1rem 1rem 3rem',
                                borderRadius: 14, border: '2px solid transparent',
                                background: 'rgba(0, 0, 0, 0.4)', color: '#fff',
                                outline: 'none', fontSize: '0.95rem',
                                transition: 'all 0.3s',
                                borderColor: isFocused === 'email' ? 'rgba(248, 181, 0, 0.5)' : 'transparent',
                                boxSizing: 'border-box'
                            }}
                            value={form.email} onChange={e => setForm({...form, email: e.target.value})} required
                            onFocus={() => setIsFocused('email')}
                            onBlur={() => setIsFocused('')}
                        />
                    </div>

                    <div style={{ position: 'relative' }}>
                        <div style={{ position: 'absolute', top: '50%', left: 16, transform: 'translateY(-50%)', color: isFocused === 'password' ? '#f8b500' : '#666', transition: 'color 0.3s', zIndex: 2 }}>
                            <Lock size={18} />
                        </div>
                        <input 
                            type={showPwd ? 'text' : 'password'} 
                            placeholder="Password" 
                            style={{ 
                                width: '100%', padding: '1rem 3.5rem 1rem 3rem',
                                borderRadius: 14, border: '2px solid transparent',
                                background: 'rgba(0, 0, 0, 0.4)', color: '#fff',
                                outline: 'none', fontSize: '0.95rem',
                                transition: 'all 0.3s',
                                borderColor: isFocused === 'password' ? 'rgba(248, 181, 0, 0.5)' : 'transparent',
                                boxSizing: 'border-box'
                            }}
                            value={form.password} onChange={e => setForm({...form, password: e.target.value})} required
                            onFocus={() => setIsFocused('password')}
                            onBlur={() => setIsFocused('')}
                        />
                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={{
                            position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)',
                            background: 'none', border: 'none', color: '#888', cursor: 'pointer', outline: 'none',
                            fontSize: '0.8rem', fontWeight: 600, zIndex: 2
                        }}>
                            {showPwd ? 'HIDE' : 'SHOW'}
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: -5 }}>
                        <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: isBeaming ? '#f8b500' : '#666', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</Link>
                    </div>

                    <button type="submit" disabled={loading} style={{
                        width: '100%', padding: '1rem',
                        borderRadius: 14, border: 'none',
                        background: isBeaming ? 'linear-gradient(135deg, #f8b500, #ff9900)' : '#333',
                        color: '#000', fontWeight: 800, fontSize: '1rem', cursor: isBeaming ? 'pointer' : 'not-allowed',
                        transition: 'all 0.3s', marginTop: '0.5rem',
                        boxShadow: isBeaming ? '0 8px 20px rgba(248, 181, 0, 0.3)' : 'none',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8
                    }}>
                        {loading ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(0,0,0,0.2)', borderTop: '2px solid #000', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} /> Signing in...</> : <><LogIn size={18} /> Sign In</>}
                    </button>
                    
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <p style={{ color: '#888', fontSize: '0.9rem' }}>
                            New student?{' '}
                            <Link to="/register" style={{ color: isBeaming ? '#fff' : '#666', fontWeight: 700, textDecoration: 'underline' }}>Create your workspace</Link>
                        </p>
                    </div>
                </form>
            </div>
            
            <style>{`
                input::placeholder { color: #555; }
                input:-webkit-autofill,
                input:-webkit-autofill:hover, 
                input:-webkit-autofill:focus, 
                input:-webkit-autofill:active{
                    -webkit-box-shadow: 0 0 0 30px #1a1a1a inset !important;
                    -webkit-text-fill-color: white !important;
                    transition: background-color 5000s ease-in-out 0s;
                }
            `}</style>
        </div>
    )
};

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [isLampMode, setIsLampMode] = useState(false);
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
            console.error('LOGIN_ERROR:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    if (isLampMode) {
        return <CuteLampLogin form={form} setForm={setForm} loading={loading} showPwd={showPwd} setShowPwd={setShowPwd} handleSubmit={handleSubmit} onToggle={() => setIsLampMode(false)} />
    }

    return (
        <div className="auth-bg" style={{ position: 'relative' }}>
            {/* Toggle mapping back to Lamp login screen */}
            <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 100 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#6366f1', fontSize: '0.8rem', fontWeight: 600 }}>Standard View</span>
                    <button onClick={() => setIsLampMode(true)} style={{
                        width: 50, height: 26, borderRadius: 13, background: '#e2e8f0',
                        border: 'none', position: 'relative', cursor: 'pointer', transition: '0.3s'
                    }}>
                        <div style={{
                            width: 20, height: 20, borderRadius: '50%', background: '#fff',
                            position: 'absolute', top: 3, left: 3, transition: '0.3s',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }} />
                    </button>
                    <span style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: 600 }}>Lamp View</span>
                </div>
            </div>
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
