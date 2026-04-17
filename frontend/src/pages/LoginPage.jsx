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
    
    // Lamp States
    const [isLampOn, setIsLampOn] = useState(false);
    const [lampSwinging, setLampSwinging] = useState(false);

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

    const toggleLamp = () => {
        setIsLampOn(!isLampOn);
        setLampSwinging(true);
        setTimeout(() => setLampSwinging(false), 1000);
    };

    return (
        <>
            {/* Global & Lamp Styles */}
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes swing {
                    0% { transform: rotate(0deg); }
                    20% { transform: rotate(5deg); }
                    40% { transform: rotate(-4deg); }
                    60% { transform: rotate(3deg); }
                    80% { transform: rotate(-2deg); }
                    100% { transform: rotate(0deg); }
                }
                @media (max-width: 768px) { .hide-mobile { display: none !important; } }
                @media (min-width: 769px) { .hide-desktop { display: none !important; } }
                .lamp-wrapper {
                    position: fixed;
                    top: 0;
                    right: 15%;
                    z-index: 9999;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    transform-origin: top center;
                }
                .lamp-wrapper.swinging {
                    animation: swing 1s ease-in-out;
                }
            `}</style>
            
            {/* Cute Lamp Toggle */}
            <div className={\`lamp-wrapper \${lampSwinging ? 'swinging' : ''}\`}>
               <div style={{ width: 4, height: 60, background: isLampOn ? '#334155' : '#1e293b' }}></div>
               <div style={{ width: 70, height: 40, background: isLampOn ? '#475569' : '#334155', borderRadius: '40px 40px 0 0', position: 'relative' }}>
                   {/* Bulb */}
                   <div style={{ 
                       width: 36, height: 36, borderRadius: '50%', 
                       background: isLampOn ? '#fef08a' : '#64748b',
                       boxShadow: isLampOn ? '0 0 30px 10px rgba(253, 224, 71, 0.5), 0 0 80px 30px rgba(253, 224, 71, 0.2)' : 'none',
                       position: 'absolute', bottom: -15, left: 17, transition: 'all 0.3s ease'
                   }}></div>
                   {/* Inner glow mask */}
                   {isLampOn && <div style={{ position: 'absolute', bottom: -15, left: 17, width: 36, height: 36, borderRadius: '50%', background: 'white', opacity: 0.8, filter: 'blur(3px)' }}></div>}
                   
                   {/* Cord */}
                   <div 
                       onClick={toggleLamp}
                       style={{ 
                           position: 'absolute', top: 40, right: 10, width: 3, 
                           height: lampSwinging ? 65 : 50, background: isLampOn ? '#cbd5e1' : '#94a3b8', 
                           cursor: 'pointer', transition: 'height 0.2s', 
                           display: 'flex', flexDirection: 'column', alignItems: 'center'
                       }}
                   >
                       <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#ef4444', position: 'absolute', bottom: -5, boxShadow: '0 2px 5px rgba(0,0,0,0.4)', transition: 'transform 0.1s' }} onMouseDown={e => e.target.style.transform='scale(0.9)'} onMouseUp={e => e.target.style.transform='scale(1)'}></div>
                   </div>
               </div>
            </div>

            {!isLampOn ? (
                /* ==================== OLD STUDY TRACK LOGIN PAGE ==================== */
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
                                <div key={i} className="fade-up" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', animationDelay: \`\${i * 0.06}s\` }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: 8, background: \`\${f.color}18\`,
                                        border: \`1px solid \${f.color}33\`, display: 'flex', alignItems: 'center',
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
                </div>
            ) : (
                /* ==================== NEW ILLUMINATED LOGIN PAGE ==================== */
               <div style={{ 
                   height: '100vh', width: '100vw', display: 'flex', alignItems: 'center', justifyContent: 'center',
                   background: '#0f172a', position: 'relative', overflow: 'hidden'
               }}>
                   {/* Background ambient light */}
                   <div style={{
                       position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                       background: 'radial-gradient(circle at 85% 0%, rgba(253,224,71,0.1) 0%, rgba(15,23,42,1) 60%)',
                       pointerEvents: 'none'
                   }}></div>

                   {/* Light beam effect from the lamp */}
                   <div style={{
                       position: 'absolute', top: 40, right: '15%', width: 800, height: '150vh',
                       background: 'linear-gradient(195deg, rgba(253,224,71,0.15) 0%, rgba(253,224,71,0) 70%)',
                       transform: 'translateX(380px)', transformOrigin: 'top center',
                       pointerEvents: 'none', filter: 'blur(30px)', opacity: 0.8
                   }}></div>
                   
                   <div className="fade-in" style={{
                       background: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(20px)',
                       border: '1px solid rgba(253,224,71,0.2)', borderRadius: 24,
                       padding: '3rem 2.5rem', width: '90%', maxWidth: 420,
                       boxShadow: '0 25px 60px rgba(0,0,0,0.6), 0 0 50px rgba(253,224,71,0.08)',
                       position: 'relative', zIndex: 10
                   }}>
                        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: '1rem' }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, rgba(253,224,71,0.2), rgba(253,224,71,0.05))', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(253,224,71,0.3)', boxShadow: '0 0 15px rgba(253,224,71,0.2)' }}>
                                    <BookOpen size={24} color="#fde047" />
                                </div>
                                <h1 style={{ color: '#fef08a', fontSize: '1.9rem', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', textShadow: '0 0 20px rgba(253,224,71,0.3)' }}>StudyTrack</h1>
                            </div>
                            <p style={{ color: '#94a3b8', fontSize: '0.95rem' }}>Illuminating your path to success 💡</p>
                        </div>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: 8, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</label>
                                <div style={{ position: 'relative' }}>
                                    <Mail size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input type="email" placeholder="student@university.edu" 
                                        style={{ 
                                            width: '100%', padding: '0.85rem 1rem 0.85rem 2.85rem', 
                                            background: 'rgba(15, 23, 42, 0.7)', border: '1px solid #334155',
                                            borderRadius: 12, color: 'white', fontSize: '0.95rem', outline: 'none',
                                            transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                        onFocus={e => { e.target.style.borderColor = '#fef08a'; e.target.style.boxShadow = '0 0 0 3px rgba(253,224,71,0.1)'; }}
                                        onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                                        value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required autoFocus={isLampOn} />
                                </div>
                            </div>

                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Password</label>
                                    <Link to="/forgot-password" style={{ fontSize: '0.75rem', color: '#fef08a', textDecoration: 'none', fontWeight: 600, opacity: 0.8 }} onMouseEnter={e => e.target.style.opacity = 1} onMouseLeave={e => e.target.style.opacity = 0.8}>Forgot?</Link>
                                </div>
                                <div style={{ position: 'relative' }}>
                                    <Lock size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
                                    <input type={showPwd ? 'text' : 'password'} placeholder="••••••••" 
                                        style={{ 
                                            width: '100%', padding: '0.85rem 3.5rem 0.85rem 2.85rem', 
                                            background: 'rgba(15, 23, 42, 0.7)', border: '1px solid #334155',
                                            borderRadius: 12, color: 'white', fontSize: '0.95rem', outline: 'none',
                                            transition: 'all 0.2s', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
                                        }}
                                        onFocus={e => { e.target.style.borderColor = '#fef08a'; e.target.style.boxShadow = '0 0 0 3px rgba(253,224,71,0.1)'; }}
                                        onBlur={e => { e.target.style.borderColor = '#334155'; e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'; }}
                                        value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required />
                                    <button type="button" onClick={() => setShowPwd(!showPwd)} 
                                        style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 700, padding: 0, transition: 'color 0.2s' }}
                                        onMouseEnter={e => e.target.style.color = '#cbd5e1'} onMouseLeave={e => e.target.style.color = '#94a3b8'}
                                    >
                                        {showPwd ? 'HIDE' : 'SHOW'}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading} 
                                style={{ 
                                    marginTop: 12, width: '100%', padding: '0.95rem', fontSize: '1rem', fontWeight: 800,
                                    background: 'linear-gradient(135deg, #fef08a, #fde047)', color: '#0f172a', border: 'none', borderRadius: 12,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                    boxShadow: '0 8px 20px rgba(253,224,71,0.3)', transition: 'all 0.15s'
                                }}
                                onMouseDown={e => e.target.style.transform = 'scale(0.98)'}
                                onMouseUp={e => e.target.style.transform = 'scale(1)'}
                                onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                                onMouseEnter={e => e.target.style.boxShadow = '0 10px 25px rgba(253,224,71,0.4)'}
                            >
                                {loading ? <><span style={{ width: 16, height: 16, border: '2px solid rgba(15,23,42,0.3)', borderTop: '2px solid #0f172a', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Entering Workspace...</> : <><LogIn size={18} /> Sign In</>}
                            </button>
                        </form>

                        <div style={{ textAlign: 'center', marginTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1.5rem' }}>
                            <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                                Need an account?{' '}
                                <Link to="/register" style={{ color: '#fef08a', fontWeight: 700, textDecoration: 'none', borderBottom: '1px dashed rgba(253,224,71,0.5)', paddingBottom: 2 }}>Register here</Link>
                            </p>
                        </div>
                   </div>
               </div>
            )}
        </>
    );
};

export default LoginPage;
