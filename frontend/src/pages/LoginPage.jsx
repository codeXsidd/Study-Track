import React, { useState, useEffect } from 'react';
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
    const [isLampOn, setIsLampOn] = useState(false);

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

    useEffect(() => {
        let CORD_TL;
        let dragInstance;

        const loadScript = (src) => new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = resolve;
            document.head.appendChild(script);
        });

        const initAnimation = async () => {
            if (!window.gsap) await loadScript("https://unpkg.com/gsap@3/dist/gsap.min.js");
            if (!window.Draggable) await loadScript("https://unpkg.com/gsap@3/dist/Draggable.min.js");
            if (!window.MorphSVGPlugin) await loadScript("https://assets.codepen.io/16327/MorphSVGPlugin3.min.js");

            const { gsap, MorphSVGPlugin, Draggable } = window;
            gsap.registerPlugin(MorphSVGPlugin);

            const AUDIO = {
                CLICK: new Audio("https://assets.codepen.io/605876/click.mp3"),
            };

            const PROXY = document.createElement("div");
            const CORDS = gsap.utils.toArray(".cords path");
            const CORD_DURATION = 0.1;
            const HIT = document.querySelector(".lamp__hit");
            const DUMMY_CORD = document.querySelector(".cord--dummy");
            
            if (!DUMMY_CORD || !CORDS.length) return;
            
            const ENDX = DUMMY_CORD.getAttribute("x2");
            const ENDY = DUMMY_CORD.getAttribute("y2");
            const RESET = () => {
                gsap.set(PROXY, { x: ENDX, y: ENDY });
            };
            RESET();

            let stateOn = false;

            gsap.set([".cords", HIT], { x: -10 });
            gsap.set(".lamp__eye", { rotate: 180, transformOrigin: "50% 50%", yPercent: 50 });

            CORD_TL = gsap.timeline({
                paused: true,
                onStart: () => {
                    const nextState = !stateOn;
                    stateOn = nextState;
                    setIsLampOn(nextState);
                    
                    const system = document.querySelector("#lamp-login-system");
                    if (system) {
                        gsap.set(system, { "--on": nextState ? 1 : 0 });
                        const hue = gsap.utils.random(0, 359);
                        gsap.set(system, { "--shade-hue": hue });

                        const glowColor = `hsl(${hue}, 40%, 45%)`;
                        const glowColorDark = `hsl(${hue}, 40%, 35%)`;
                        gsap.set(system, {
                            "--glow-color": glowColor,
                            "--glow-color-dark": glowColorDark
                        });
                    }

                    gsap.set(".lamp__eye", { rotate: nextState ? 0 : 180 });

                    gsap.set([DUMMY_CORD, HIT], { display: "none" });
                    gsap.set(CORDS[0], { display: "block" });
                    AUDIO.CLICK.play().catch(e => console.log('Audio play blocked:', e));
                },
                onComplete: () => {
                    gsap.set([DUMMY_CORD, HIT], { display: "block" });
                    gsap.set(CORDS[0], { display: "none" });
                    RESET();
                },
            });

            for (let i = 1; i < CORDS.length; i++) {
                CORD_TL.add(
                    gsap.to(CORDS[0], {
                        morphSVG: CORDS[i],
                        duration: CORD_DURATION,
                        repeat: 1,
                        yoyo: true,
                    })
                );
            }
            
            let startX, startY;

            dragInstance = Draggable.create(PROXY, {
                trigger: HIT,
                type: "x,y",
                onPress: function() {
                    startX = this.pointerX;
                    startY = this.pointerY;
                },
                onDrag: function () {
                    gsap.set(DUMMY_CORD, {
                        attr: {
                            x2: this.x,
                            y2: Math.max(400, this.y),
                        },
                    });
                },
                onRelease: function () {
                    const DISTX = Math.abs(this.pointerX - startX);
                    const DISTY = Math.abs(this.pointerY - startY);
                    const TRAVELLED = Math.sqrt(DISTX * DISTX + DISTY * DISTY);
                    
                    gsap.to(DUMMY_CORD, {
                        attr: { x2: ENDX, y2: ENDY },
                        duration: CORD_DURATION,
                        onComplete: () => {
                            if (TRAVELLED > 50) {
                                CORD_TL.restart();
                            } else {
                                RESET();
                            }
                        },
                    });
                },
            });

            gsap.set(".lamp", { display: "block" });
        };

        const timeoutId = setTimeout(initAnimation, 150);

        return () => {
            clearTimeout(timeoutId);
            if (dragInstance && dragInstance[0]) dragInstance[0].kill();
            if (CORD_TL) CORD_TL.kill();
        };
    }, []);

    return (
        <>
            {/* OLD LOGIN PAGE */}
            <div className="auth-bg" style={{ 
                minHeight: '100vh',
                opacity: isLampOn ? 0 : 1, 
                pointerEvents: isLampOn ? 'none' : 'auto', 
                transition: 'opacity 0.6s ease'
            }}>
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

                </div>
            </div>

            {/* LAMP AND CUTE FORM OVERLAY */}
            <div id="lamp-login-system" style={{
                position: 'fixed', inset: 0,
                pointerEvents: 'none',
                zIndex: 100,
                background: isLampOn ? '#121921' : 'transparent',
                transition: 'background 0.6s ease',
                display: 'grid',
                placeItems: 'center',
                overflowY: 'auto'
            }}>
                <div className="cute-container">
                    <svg
                        className="lamp"
                        viewBox="0 0 333 484"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        style={{ pointerEvents: 'auto' }}
                    >
                        <g className="lamp__shade shade">
                            <ellipse className="shade__opening" cx="165" cy="220" rx="130" ry="20" />
                            <ellipse className="shade__opening-shade" cx="165" cy="220" rx="130" ry="20" fill="url(#opening-shade)" />
                        </g>
                        <g className="lamp__base base">
                            <path className="base__side" d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z" />
                            <path d="M165 464c44.183 0 80-8.954 80-20v-14h-22.869c-14.519-3.703-34.752-6-57.131-6-22.379 0-42.612 2.297-57.131 6H85v14c0 11.046 35.817 20 80 20z" fill="url(#side-shading)" />
                            <ellipse className="base__top" cx="165" cy="430" rx="80" ry="20" />
                            <ellipse cx="165" cy="430" rx="80" ry="20" fill="url(#base-shading)" />
                        </g>
                        <g className="lamp__post post">
                            <path className="post__body" d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z" />
                            <path d="M180 142h-30v286c0 3.866 6.716 7 15 7 8.284 0 15-3.134 15-7V142z" fill="url(#post-shading)" />
                        </g>
                        <g className="lamp__cords cords">
                            <path className="cord cord--rig" d="M124 187.033V347" strokeWidth="6" strokeLinecap="round" />
                            <path className="cord cord--rig" d="M124 187.023s17.007 21.921 17.007 34.846c0 12.925-11.338 23.231-17.007 34.846-5.669 11.615-17.007 21.921-17.007 34.846 0 12.925 17.007 34.846 17.007 34.846" strokeWidth="6" strokeLinecap="round" />
                            <path className="cord cord--rig" d="M124 187.017s-21.259 17.932-21.259 30.26c0 12.327 14.173 20.173 21.259 30.26 7.086 10.086 21.259 17.933 21.259 30.26 0 12.327-21.259 30.26-21.259 30.26" strokeWidth="6" strokeLinecap="round" />
                            <path className="cord cord--rig" d="M124 187s29.763 8.644 29.763 20.735-19.842 13.823-29.763 20.734c-9.921 6.912-29.763 8.644-29.763 20.735S124 269.939 124 269.939" strokeWidth="6" strokeLinecap="round" />
                            <path className="cord cord--rig" d="M124 187.029s-10.63 26.199-10.63 39.992c0 13.794 7.087 26.661 10.63 39.992 3.543 13.331 10.63 26.198 10.63 39.992 0 13.793-10.63 39.992-10.63 39.992" strokeWidth="6" strokeLinecap="round" />
                            <path className="cord cord--rig" d="M124 187.033V347" strokeWidth="6" strokeLinecap="round" />
                            <line className="cord cord--dummy" x1="124" y2="348" x2="124" y1="190" strokeWidth="6" strokeLinecap="round" />
                        </g>
                        <path className="lamp__light" d="M290.5 193H39L0 463.5c0 11.046 75.478 20 165.5 20s167-11.954 167-23l-42-267.5z" fill="url(#light)" />
                        <g className="lamp__top top">
                            <path className="top__body" fillRule="evenodd" clipRule="evenodd" d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z" />
                            <path className="top__shading" fillRule="evenodd" clipRule="evenodd" d="M164.859 0c55.229 0 100 8.954 100 20l29.859 199.06C291.529 208.451 234.609 200 164.859 200S38.189 208.451 35 219.06L64.859 20c0-11.046 44.772-20 100-20z" fill="url(#top-shading)" />
                        </g>
                        <g className="lamp__face face">
                            <g className="lamp__mouth">
                                <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" fill="#141414" />
                                <clipPath className="lamp__feature" id="mouth">
                                    <path d="M165 178c19.882 0 36-16.118 36-36h-72c0 19.882 16.118 36 36 36z" />
                                </clipPath>
                                <g clipPath="url(#mouth)">
                                    <circle className="lamp__tongue" cx="179.4" cy="172.6" r="18" />
                                </g>
                            </g>
                            <g className="lamp__eyes">
                                <path className="lamp__eye lamp__stroke" d="M115 135c0-5.523-5.82-10-13-10s-13 4.477-13 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                <path className="lamp__eye lamp__stroke" d="M241 135c0-5.523-5.82-10-13-10s-13 4.477-13 10" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                        </g>
                        <defs>
                            <linearGradient id="opening-shade" x1="35" y1="220" x2="295" y2="220" gradientUnits="userSpaceOnUse">
                                <stop />
                                <stop offset="1" stopColor="var(--shade)" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="base-shading" x1="85" y1="444" x2="245" y2="444" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--b-1)" />
                                <stop offset="0.8" stopColor="var(--b-2)" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="side-shading" x1="119" y1="430" x2="245" y2="430" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--b-3)" />
                                <stop offset="1" stopColor="var(--b-4)" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="post-shading" x1="150" y1="288" x2="180" y2="288" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--b-1)" />
                                <stop offset="1" stopColor="var(--b-2)" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="light" x1="165.5" y1="218.5" x2="165.5" y2="483.5" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--l-1)" stopOpacity=".2" />
                                <stop offset="1" stopColor="var(--l-2)" stopOpacity="0" />
                            </linearGradient>
                            <linearGradient id="top-shading" x1="56" y1="110" x2="295" y2="110" gradientUnits="userSpaceOnUse">
                                <stop stopColor="var(--t-1)" stopOpacity=".8" />
                                <stop offset="1" stopColor="var(--t-2)" stopOpacity="0" />
                            </linearGradient>
                        </defs>
                        <circle className="lamp__hit" cx="124" cy="347" r="66" fill="#C4C4C4" fillOpacity=".1" />
                    </svg>

                    <div className={`cute-login-form ${isLampOn ? 'active' : ''}`} style={{ pointerEvents: isLampOn ? 'auto' : 'none' }}>
                        <h2>Welcome Back</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="cute-form-group">
                                <label htmlFor="cute-username">Email</label>
                                <input
                                    type="email"
                                    id="cute-username"
                                    placeholder="Enter your email"
                                    className="cute-input"
                                    required
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>
                            <div className="cute-form-group">
                                <label htmlFor="cute-password">Password</label>
                                <input
                                    type="password"
                                    id="cute-password"
                                    placeholder="Enter your password"
                                    className="cute-input"
                                    required
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>
                            <button type="submit" className="cute-btn" disabled={loading}>
                                {loading ? 'Logging in...' : 'Login'}
                            </button>
                            <div className="cute-form-footer">
                                <Link to="/forgot-password" className="cute-forgot-link">Forgot Password?</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 768px) { .hide-mobile { display: none !important; } }
                @media (min-width: 769px) { .hide-desktop { display: none !important; } }

                /* Cute Lamp Integration Styles */
                #lamp-login-system {
                    --cord: hsl(210, 0%, calc((40 + (var(--on, 0) * 50)) * 1%));
                    --opening: hsl(50, calc((10 + (var(--on, 0) * 80)) * 1%), calc((20 + (var(--on, 0) * 70)) * 1%));
                    --feature: #0a0a0a;
                    --accent: 210;
                    --tongue: #e06952;
                    --base-top: hsl(var(--accent), 0%, calc((40 + (var(--on, 0) * 40)) * 1%));
                    --base-side: hsl(var(--accent), 0%, calc((20 + (var(--on, 0) * 40)) * 1%));
                    --post: hsl(var(--accent), 0%, calc((20 + (var(--on, 0) * 40)) * 1%));
                    --b-1: hsla(45, calc((0 + (var(--on, 0) * 0)) * 1%), calc((50 + (var(--on, 0) * 50)) * 1%), 0.85);
                    --b-2: hsla(45, calc((0 + (var(--on, 0) * 0)) * 1%), calc((20 + (var(--on, 0) * 30)) * 1%), 0.25);
                    --b-3: hsla(45, calc((0 + (var(--on, 0) * 0)) * 1%), calc((20 + (var(--on, 0) * 30)) * 1%), 0.5);
                    --b-4: hsla(45, calc((0 + (var(--on, 0) * 0)) * 1%), calc((20 + (var(--on, 0) * 30)) * 1%), 0.25);
                    --l-1: hsla(45, calc((0 + (var(--on, 0) * 20)) * 1%), calc((50 + (var(--on, 0) * 50)) * 1%), 0.85);
                    --l-2: hsla(45, calc((0 + (var(--on, 0) * 20)) * 1%), calc((50 + (var(--on, 0) * 50)) * 1%), 0.85);
                    --shade-hue: 320;
                    --t-1: hsl(var(--shade-hue), calc((0 + (var(--on, 0) * 20)) * 1%), calc((30 + (var(--on, 0) * 60)) * 1%));
                    --t-2: hsl(var(--shade-hue), calc((0 + (var(--on, 0) * 20)) * 1%), calc((20 + (var(--on, 0) * 35)) * 1%));
                    --t-3: hsl(var(--shade-hue), calc((0 + (var(--on, 0) * 20)) * 1%), calc((10 + (var(--on, 0) * 20)) * 1%));
                    --glow-color: hsl(320, 40%, 45%);
                    --glow-color-dark: hsl(320, 40%, 35%);
                }

                #lamp-login-system .cute-container {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8vmin;
                    flex-wrap: wrap;
                    padding: 2rem;
                }

                #lamp-login-system .cute-login-form {
                    background: rgba(18, 25, 33, 0.9);
                    padding: 3rem 2.5rem;
                    border-radius: 20px;
                    min-width: 320px;
                    opacity: 0;
                    transform: scale(0.8) translateY(20px);
                    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
                    border: 2px solid transparent;
                    box-shadow: 0 0 0px rgba(255, 255, 255, 0);
                }

                #lamp-login-system .cute-login-form.active {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                    border-color: var(--glow-color);
                    box-shadow: 0 0 15px rgba(255, 255, 255, 0.1),
                        0 0 30px var(--glow-color),
                        inset 0 0 15px rgba(255, 255, 255, 0.05);
                }

                #lamp-login-system .cute-login-form h2 {
                    color: #fff;
                    font-size: 2rem;
                    margin: 0 0 2rem 0;
                    text-align: center;
                    text-shadow: 0 0 8px var(--glow-color);
                }

                #lamp-login-system .cute-form-group {
                    margin-bottom: 1.5rem;
                }

                #lamp-login-system .cute-form-group label {
                    display: block;
                    color: #aaa;
                    font-size: 0.9rem;
                    margin-bottom: 0.5rem;
                    text-shadow: 0 0 5px var(--glow-color);
                    text-transform: none;
                    letter-spacing: normal;
                }

                #lamp-login-system .cute-input {
                    width: 100%;
                    padding: 0.75rem 1rem;
                    background: rgba(255, 255, 255, 0.05) !important;
                    border: 2px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 10px !important;
                    color: #fff !important;
                    font-size: 1rem !important;
                    transition: all 0.3s ease !important;
                }

                #lamp-login-system .cute-input:focus {
                    outline: none !important;
                    border-color: var(--glow-color) !important;
                    box-shadow: 0 0 10px var(--glow-color) !important;
                    background: rgba(255, 255, 255, 0.08) !important;
                }

                #lamp-login-system .cute-input::placeholder {
                    color: #666;
                }

                #lamp-login-system .cute-btn {
                    width: 100%;
                    padding: 0.875rem;
                    background: linear-gradient(135deg, var(--glow-color), var(--glow-color-dark));
                    border: none;
                    border-radius: 10px;
                    color: #fff;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
                    margin-top: 0.5rem;
                }

                #lamp-login-system .cute-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3), 0 0 20px var(--glow-color);
                }

                #lamp-login-system .cute-btn:active {
                    transform: translateY(0);
                }

                #lamp-login-system .cute-form-footer {
                    margin-top: 1.5rem;
                    text-align: center;
                }

                #lamp-login-system .cute-forgot-link {
                    color: #888;
                    font-size: 0.9rem;
                    text-decoration: none;
                    transition: all 0.3s ease;
                }

                #lamp-login-system .cute-forgot-link:hover {
                    color: var(--glow-color);
                    text-shadow: 0 0 10px var(--glow-color);
                }

                #lamp-login-system .lamp {
                    display: none;
                    height: 40vmin;
                    min-height: 250px;
                    overflow: visible !important;
                }

                #lamp-login-system .cord { stroke: var(--cord); }
                #lamp-login-system .cord--rig { display: none; }
                #lamp-login-system .lamp__tongue { fill: var(--tongue); }
                #lamp-login-system .lamp__hit { cursor: pointer; opacity: 0; }
                #lamp-login-system .lamp__feature { fill: var(--feature); }
                #lamp-login-system .lamp__stroke { stroke: var(--feature); }
                #lamp-login-system .lamp__mouth, #lamp-login-system .lamp__light { opacity: var(--on, 0); }
                #lamp-login-system .shade__opening { fill: var(--opening); }
                #lamp-login-system .shade__opening-shade { opacity: calc(1 - var(--on, 0)); }
                #lamp-login-system .post__body { fill: var(--post); }
                #lamp-login-system .base__top { fill: var(--base-top); }
                #lamp-login-system .base__side { fill: var(--base-side); }
                #lamp-login-system .top__body { fill: var(--t-3); }
            `}</style>
        </>
    );
};

export default LoginPage;
