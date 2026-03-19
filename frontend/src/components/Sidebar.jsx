import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';
import {
    BookOpen, LayoutDashboard, Users, ClipboardList, CheckSquare,
    Award, Timer, GraduationCap, Calendar, BookMarked, Code2,
    StickyNote, Target, Bell, LogOut, ChevronLeft, ChevronRight, Sparkles, Activity, Zap, TrendingUp, Wand2
} from 'lucide-react';

const mainLinks = [
    { to: '/', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
    { to: '/ai-chat', icon: <Sparkles size={18} />, label: 'AI Assistant' },
    { to: '/planner', icon: <Target size={18} />, label: 'Daily Planner' },
];

const workspaceLinks = [
    { to: '/subjects', icon: <Users size={18} />, label: 'Subjects' },
    { to: '/assignments', icon: <CheckSquare size={18} />, label: 'Assignments' },
    { to: '/timetable', icon: <Calendar size={18} />, label: 'Timetable' },
];

const performanceLinks = [
    { to: '/analytics', icon: <TrendingUp size={18} />, label: 'Analytics' },
    { to: '/gpa', icon: <GraduationCap size={18} />, label: 'GPA Calculator' },
    { to: '/certificates', icon: <Award size={18} />, label: 'Certificates' },
    { to: '/portfolio', icon: <Code2 size={18} />, label: 'Portfolio' },
];

const productivityLinks = [
    { to: '/mind-sweep', icon: <Wand2 size={18} />, label: 'AI Mind Sweep' },
    { to: '/pomodoro', icon: <Timer size={18} />, label: 'Pomodoro' },
    { to: '/focus-room', icon: <Zap size={18} />, label: 'Deep Focus Room' },
    { to: '/journal', icon: <BookMarked size={18} />, label: 'Study Journal' },
    { to: '/notes', icon: <StickyNote size={18} />, label: 'Notes Wall' },
    { to: '/habits', icon: <Activity size={18} />, label: 'Habit Builder' },
];

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const load = async () => {
            try { const res = await API.get('/assignments/upcoming'); setNotifications(res.data || []); } catch { }
        };
        if (user) load();
    }, [user]);

    const isActive = (path) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    const NavGroup = ({ title, links }) => (
        <div style={{ marginBottom: '1.5rem' }}>
            {!collapsed && <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.75rem' }}>{title}</p>}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                {links.map(link => (
                    <Link key={link.to} to={link.to} title={collapsed ? link.label : ''} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.65rem 0.75rem',
                        borderRadius: '12px', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600,
                        background: isActive(link.to) ? 'rgba(99,102,241,0.12)' : 'transparent',
                        color: isActive(link.to) ? '#a78bfa' : '#94a3b8',
                        border: isActive(link.to) ? '1px solid rgba(99,102,241,0.2)' : '1px solid transparent',
                        transition: 'var(--transition)',
                        position: 'relative'
                    }} onMouseEnter={e => !isActive(link.to) && (e.currentTarget.style.background = 'rgba(255,255,255,0.03)')} onMouseLeave={e => !isActive(link.to) && (e.currentTarget.style.background = 'transparent')}>
                        {link.icon}
                        {!collapsed && <span>{link.label}</span>}
                        {isActive(link.to) && (
                            <div style={{ position: 'absolute', right: '0.75rem', width: 4, height: 4, borderRadius: '50%', background: '#a78bfa', boxShadow: '0 0 8px #a78bfa' }} />
                        )}
                    </Link>
                ))}
            </div>
        </div>
    );

    return (
        <aside style={{
            width: collapsed ? '80px' : '260px',
            background: 'rgba(8,8,18,0.95)',
            borderRight: '1px solid rgba(99,102,241,0.12)',
            height: '100%', position: 'sticky', top: 0,
            display: 'flex', flexDirection: 'column',
            transition: 'width 0.3s ease',
            zIndex: 100
        }}>
            {/* Logo / Header */}
            <div className="sidebar-header" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                {!collapsed && (
                    <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
                        <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 9, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookOpen size={18} color="white" />
                        </div>
                        <span className="gradient-text" style={{ fontWeight: 800, fontSize: '1.05rem', letterSpacing: '-0.02em' }}>StudyTrack</span>
                    </Link>
                )}
                <button onClick={() => setCollapsed(!collapsed)} style={{
                    background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: collapsed ? 0 : 4,
                    transition: 'var(--transition)'
                }} onMouseEnter={e => e.currentTarget.style.color = '#818cf8'} onMouseLeave={e => e.currentTarget.style.color = '#94a3b8'}>
                    {collapsed ? (
                        <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(99,102,241,0.3)', transition: 'var(--transition)' }} onMouseEnter={e => e.currentTarget.style.transform = 'rotate(12deg) scale(1.1)'} onMouseLeave={e => e.currentTarget.style.transform = 'rotate(0) scale(1)'}>
                            <BookOpen size={20} color="white" />
                        </div>
                    ) : <ChevronLeft size={20} />}
                </button>
            </div>

            {/* User Info (if expanded) */}
            {!collapsed && (
                <div className="sidebar-user" style={{ padding: '1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <div className="glass-card" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', gap: 12, border: '1px solid rgba(99,102,241,0.2)', background: 'rgba(99,102,241,0.05)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.9rem', color: 'white' }}>
                            {user?.name?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2, marginBottom: 4 }}>
                                <span style={{ fontSize: '0.65rem', color: '#818cf8', fontWeight: 700 }}>Lvl {user?.level || 1}</span>
                                <span style={{ fontSize: '0.6rem', color: '#64748b' }}>{user?.xp || 0} / {(user?.level || 1) * 100} XP</span>
                            </div>
                            {/* XP Progress Bar */}
                            <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{
                                    height: '100%',
                                    background: 'linear-gradient(90deg, #6366f1, #ec4899)',
                                    width: `${Math.min(((user?.xp || 0) / ((user?.level || 1) * 100)) * 100, 100)}%`,
                                    transition: 'width 0.3s'
                                }} />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Navigation links */}
            <div style={{ padding: '1.25rem', flex: 1, overflowY: 'auto' }} className="hide-scrollbar">
                <NavGroup title="Main" links={mainLinks} />
                <NavGroup title="Workspace" links={workspaceLinks} />
                <NavGroup title="Productivity" links={productivityLinks} />
                <NavGroup title="Performance" links={performanceLinks} />
            </div>

            {/* Bottom Actions */}
            <div style={{ padding: '1.25rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }} className="sidebar-bottom">
                <Link to="/planner" title={collapsed ? "Daily Plan" : ""} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.75rem', background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <Sparkles size={16} /> {!collapsed && <span className="hide-mobile">Plan Today</span>}
                </Link>
                <button onClick={() => { logout(); navigate('/login'); }} title={collapsed ? "Logout" : ""} style={{ display: 'flex', alignItems: 'center', justifyContent: collapsed ? 'center' : 'flex-start', gap: '0.75rem', padding: '0.6rem 0.75rem', borderRadius: '10px', background: 'transparent', color: '#ef4444', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', width: '100%' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <LogOut size={18} /> {!collapsed && <span className="hide-mobile">Log Out</span>}
                </button>
            </div>

            <style>{`
                /* .hide-scrollbar::-webkit-scrollbar { display: none; } */
                
                @media (max-width: 768px) {
                    aside {
                        position: fixed !important;
                        bottom: 0 !important;
                        top: auto !important;
                        left: 0;
                        right: 0;
                        width: 100% !important;
                        height: 70px !important;
                        flex-direction: row !important;
                        border-right: none !important;
                        border-top: 1px solid rgba(99,102,241,0.15);
                        background: rgba(8, 8, 18, 0.9) !important;
                        backdrop-filter: blur(20px) !important;
                        z-index: 999;
                        overflow-x: auto;
                        padding: 0 0.5rem !important;
                        white-space: nowrap;
                        box-shadow: 0 -10px 25px rgba(0,0,0,0.5);
                    }
                    .hide-mobile { display: none !important; }
                    .sidebar-header, .sidebar-user { display: none !important; }
                    
                    aside > div.hide-scrollbar {
                        display: flex !important;
                        flex-direction: row !important;
                        padding: 0 !important;
                        gap: 0.25rem;
                        align-items: center;
                        height: 100%;
                        justify-content: flex-start;
                        min-width: min-content;
                        flex: 1 !important;
                    }
                    aside div.hide-scrollbar > div {
                        margin: 0 !important;
                        display: flex;
                        gap: 0.25rem;
                    }
                    aside div.hide-scrollbar > div > p {
                        display: none !important;
                    }
                    aside div.hide-scrollbar > div > div {
                        flex-direction: row !important;
                        gap: 0.25rem !important;
                    }
                    aside a, aside button {
                        padding: 0.75rem 1rem !important;
                        border-radius: 14px !important;
                        height: 50px !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                    }
                    aside a div { display: none !important; } /* Hide indicators on mobile */
                    
                    .sidebar-bottom {
                        display: flex !important;
                        flex-direction: row !important;
                        padding: 0 0.25rem !important;
                        border-top: none !important;
                        align-items: center;
                        gap: 0.25rem;
                        height: 100%;
                    }
                }
            `}</style>
        </aside>
    );
};

export default Sidebar;
