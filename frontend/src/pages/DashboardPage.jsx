import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API, { getUpcoming, getHabits, toggleHabit, aiChat } from '../services/api';
import {
    BookOpen, Calendar, CheckCircle, AlertTriangle, TrendingUp, Clock,
    Award, Timer, GraduationCap, BookMarked, Code2, Users, ClipboardList,
    CheckSquare, Flame, Zap, Target, ArrowRight, Star, StickyNote, Check, Activity, Circle, CheckCircle2, Bot, RotateCcw
} from 'lucide-react';

// ---------- helpers ----------
const getHour = () => new Date().getHours();
const greeting = () => getHour() < 12 ? '🌅 Good Morning' : getHour() < 17 ? '☀️ Good Afternoon' : '🌙 Good Evening';
const getDaysLeft = (d) => Math.ceil((new Date(d) - new Date()) / 86400000);

const todayName = () => ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][new Date().getDay()];
const currentTimeMinutes = () => { const n = new Date(); return n.getHours() * 60 + n.getMinutes(); };
const timeToMinutes = (t) => {
    if (!t) return -1;
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
};

// ---------- sub-components ----------
const QuickLink = ({ to, icon, label, color }) => (
    <Link to={to} className="quick-action-button">
        <div className="quick-action-icon" style={{ background: `${color}20` }}>
            {React.cloneElement(icon, { size: 22, color })}
        </div>
        <p className="quick-action-label">{label}</p>
    </Link>
);

const MiniStat = ({ label, value, color, icon }) => (
    <div style={{ textAlign: 'center', padding: '0.75rem', background: 'rgba(15,15,26,0.5)', borderRadius: 10 }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 900, color }}>{value}</div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
);

// ---------- main ----------
const DashboardPage = () => {
    const { user } = useAuth();
    const [upcoming, setUpcoming] = useState([]);
    const [timetableSlots, setTimetableSlots] = useState([]);
    const [timetableConfig, setTimetableConfig] = useState(null);
    const [journalEntries, setJournalEntries] = useState([]);
    const [todos, setTodos] = useState([]);
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [now, setNow] = useState(new Date());
    const [aiInsight, setAiInsight] = useState('');
    const [insightLoading, setInsightLoading] = useState(false);

    const priorityColor = (priority) => priority === 'High' ? '#ef4444' : priority === 'Medium' ? '#f59e0b' : '#10b981';

    const getDateStr = (d = new Date()) => {
        const date = new Date(d);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const isHabitCompletedToday = (completedDates) => {
        if (!completedDates || completedDates.length === 0) return false;
        const todayStr = getDateStr();
        return completedDates.some(d => getDateStr(d) === todayStr);
    };

    const toggleDashHabit = async (habit) => {
        try {
            const today = new Date();
            const todayStr = getDateStr(today);

            setHabits(habits.map(h => {
                if (h._id === habit._id) {
                    const completed = isHabitCompletedToday(h.completedDates);
                    let newDates = [...(h.completedDates || [])];
                    let newStreak = h.streak;
                    if (completed) {
                        newDates = newDates.filter(d => getDateStr(d) !== todayStr);
                        newStreak = Math.max(0, newStreak - 1);
                    } else {
                        newDates.push(today.toISOString());
                        newStreak += 1;
                    }
                    return { ...h, completedDates: newDates, streak: newStreak };
                }
                return h;
            }));
            await toggleHabit(habit._id, today.toISOString());
        } catch { }
    };

    // Live clock
    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const [upRes, ttRes, cfgRes, jRes, todosRes, habRes] = await Promise.all([
                    getUpcoming(),
                    API.get('/timetable'),
                    API.get('/timetable-config'),
                    API.get('/journal'),
                    API.get('/todos'),
                    getHabits()
                ]);
                setUpcoming(upRes.data);
                setTimetableSlots(ttRes.data);
                setTimetableConfig(cfgRes.data);
                setJournalEntries(jRes.data);
                setHabits(habRes.data);

                const todayRes = new Date();
                let staleTaskIds = [];
                const updatedTodos = todosRes.data.map(t => {
                    if (t.dayPlan && !t.completed) {
                        const planDate = t.dayPlanDate ? new Date(t.dayPlanDate) : new Date(t.createdAt);
                        const isToday = planDate.getDate() === todayRes.getDate() &&
                            planDate.getMonth() === todayRes.getMonth() &&
                            planDate.getFullYear() === todayRes.getFullYear();
                        if (!isToday) {
                            staleTaskIds.push(t._id);
                            return { ...t, dayPlan: false, dayPlanDate: null };
                        }
                    }
                    return t;
                });

                setTodos(updatedTodos);
                staleTaskIds.forEach(id => {
                    API.put(`/todos/${id}`, { dayPlan: false, dayPlanDate: null }).catch(() => { });
                });
            } catch { }
            setLoading(false);
        };
        fetchAll();
    }, []);

    const fetchAiInsight = async () => {
        setInsightLoading(true);
        try {
            const context = `Student has ${urgentCount} urgent deadlines, ${dashboardTodos.length} focus tasks, and ${currentClass ? `is in class ${currentClass.subject}` : 'is free right now'}. Current time: ${now.toLocaleTimeString()}.`;
            const prompt = `Give me one short (max 15 words), high-energy, personalized productivity sentence for my dashboard. Mention a specific tool from: [Focus Room, Pomodoro, Planner, Habits, Journal] if relevant.`;
            const res = await aiChat({ message: prompt, context });
            setAiInsight(res.data.reply);
        } catch {
            setAiInsight("Consistency is the key to mastery. Open the **AI Assistant** to deep dive into your study plan!");
        }
        setInsightLoading(false);
    };

    useEffect(() => {
        if (!loading && !aiInsight) fetchAiInsight();
    }, [loading]);

    const toggleComplete = async (todo) => {
        try {
            const res = await API.put(`/todos/${todo._id}`, { completed: !todo.completed, dayPlan: false });
            setTodos(todos.map(t => t._id === todo._id ? res.data : t));
        } catch { }
    };

    // Today's classes from timetable
    const today = todayName();
    const nowMins = currentTimeMinutes();
    const todaySlots = timetableSlots
        .filter(s => s.day === today)
        .map(s => {
            const cfg = timetableConfig?.periods?.find(p => p.number === s.period);
            return { ...s, startMins: timeToMinutes(cfg?.startTime), endMins: timeToMinutes(cfg?.endTime), label: cfg?.label || `P${s.period}`, startTime: cfg?.startTime || '', endTime: cfg?.endTime || '' };
        })
        .sort((a, b) => a.period - b.period);

    const currentClass = todaySlots.find(s => s.startMins >= 0 && nowMins >= s.startMins && nowMins <= s.endMins);
    const nextClass = todaySlots.find(s => s.startMins > nowMins);

    // Journal streak
    const sortedDates = journalEntries.map(e => e.date).sort((a, b) => b.localeCompare(a));
    let streak = 0;
    let cur = new Date().toISOString().split('T')[0];
    for (const d of sortedDates) {
        if (d === cur) { streak++; const dt = new Date(d); dt.setDate(dt.getDate() - 1); cur = dt.toISOString().split('T')[0]; } else break;
    }

    const urgentCount = upcoming.filter(a => getDaysLeft(a.deadline) <= 2).length;
    const dashboardTodos = todos.filter(t => t.dayPlan && !t.completed);

    return (
        <div className="page-container animate-slide-scale">

            {/* ── HERO HEADER ── */}
            <header className="dashboard-hero" style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
                    <div>
                        <h1 className="hero-title">
                            {greeting()}, <br />
                            <span className="gradient-text">{user?.name?.split(' ')[0]}!</span>
                        </h1>
                        <p className="hero-subtitle">
                            {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                            {' · '}{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem' }}>
                        {currentClass ? (
                            <div className="pill-status" style={{ background: `${currentClass.color}15`, border: `1px solid ${currentClass.color}30`, color: currentClass.color }}>
                                <div className="pulse-danger" style={{ width: 8, height: 8, borderRadius: '50%', background: currentClass.color }} />
                                <div>
                                    <p style={{ fontSize: '0.6rem', opacity: 0.8 }}>Now In Class</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>{currentClass.subject}</p>
                                </div>
                            </div>
                        ) : nextClass ? (
                            <div className="pill-status" style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8' }}>
                                <Clock size={14} />
                                <div>
                                    <p style={{ fontSize: '0.6rem', opacity: 0.8 }}>Next Up at {nextClass.startTime}</p>
                                    <p style={{ fontSize: '0.9rem', fontWeight: 800 }}>{nextClass.subject}</p>
                                </div>
                            </div>
                        ) : (
                            <div className="pill-status" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                                <CheckCircle size={14} />
                                <span>Free Schedule</span>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* ── KEY STATS ROW ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Upcoming Tasks', value: upcoming.length, color: '#f59e0b', icon: <Clock size={22} />, sub: `${urgentCount} urgent` },
                    { label: 'Current Streak', value: streak > 0 ? `${streak} Days` : '0 Days', color: '#ef4444', icon: <Flame size={22} />, sub: 'Journal streak' },
                    { label: 'Today\'s Classes', value: todaySlots.length, color: '#10b981', icon: <Calendar size={22} />, sub: 'Classes scheduled' }
                ].map((s, idx) => (
                    <div key={s.label} className="glass-card dashboard-stat-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ padding: '0.75rem', background: `${s.color}15`, borderRadius: 12, color: s.color }}>
                                {s.icon}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <p style={{ fontSize: '1.75rem', fontWeight: 900, color: s.color }}>{s.value}</p>
                                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{s.label}</p>
                            </div>
                        </div>
                        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: s.color }} />
                            <p style={{ fontSize: '0.75rem', color: 'var(--text-soft)', fontWeight: 500 }}>{s.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Smart Suggestion Banner */}
            {(urgentCount > 0 || aiInsight) && (
                <div className="glass-card animate-slide-scale ai-banner" style={{
                    marginBottom: '2rem',
                    borderLeft: `4px solid ${urgentCount > 0 ? '#ef4444' : '#10b981'}`,
                }}>
                    <div className="ai-icon-pulse" style={{
                        background: urgentCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        padding: '0.8rem', borderRadius: '50%', flexShrink: 0
                    }}>
                        <Bot size={28} color={urgentCount > 0 ? '#ef4444' : '#10b981'} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.25rem' }}>
                            <h4 style={{ fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                AI Brainwave
                            </h4>
                            {insightLoading && <div className="spinner-small" />}
                        </div>
                        <div style={{ fontSize: '1rem', color: '#cbd5e1', lineHeight: 1.6, fontWeight: 500 }}>
                            {insightLoading ? (
                                <span style={{ opacity: 0.6, fontStyle: 'italic' }}>Synthesizing strategy...</span>
                            ) : (
                                <Link to="/ai-chat" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {aiInsight || (
                                        <>Action needed: You have <b>{urgentCount} urgent deadlines</b>. Let's tackle them!</>
                                    )}
                                    <ArrowRight size={16} style={{ opacity: 0.5 }} />
                                </Link>
                            ) || "Ready for a productivity boost? Click to chat with your AI buddy!"}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        <button
                            onClick={fetchAiInsight}
                            disabled={insightLoading}
                            className="glass-card"
                            style={{
                                cursor: 'pointer',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 38, height: 38,
                                borderRadius: '50%',
                                transition: 'all 0.3s',
                                border: '1px solid rgba(255,255,255,0.1)'
                            }}
                            title="Refresh Brain"
                        >
                            <RotateCcw size={16} style={{ animation: insightLoading ? 'spin 1s linear infinite' : 'none' }} />
                        </button>
                    </div>
                </div>
            )}

            <div className="dashboard-grid-hero" style={{ marginBottom: '2rem' }}>

                {/* ── LEFT: Today's Timetable ── */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h2 className="card-title">
                            <Calendar size={20} color="#6366f1" /> Today's Schedule
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>({today})</span>
                        </h2>
                        <Link to="/timetable" style={{ fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.05em' }}>FULL CALENDAR →</Link>
                    </div>

                    {loading ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Loading...</p>
                        : todaySlots.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🎉</div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>No classes today!</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Use this time to catch up on assignments or relax.</p>
                                <Link to="/timetable" className="btn-primary" style={{ textDecoration: 'none', fontSize: '0.75rem' }}>Update Schedule</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {todaySlots.map(slot => {
                                    const isCurrent = currentClass?._id === slot._id;
                                    const isPast = slot.endMins >= 0 && nowMins > slot.endMins;
                                    return (
                                        <div key={slot._id} className="list-item" style={{
                                            background: isCurrent ? `${slot.color}10` : isPast ? 'rgba(15,15,26,0.2)' : 'rgba(15,15,26,0.4)',
                                            border: isCurrent ? `1.5px solid ${slot.color}30` : '1px solid rgba(255,255,255,0.03)',
                                            opacity: isPast ? 0.6 : 1
                                        }}>
                                            <div style={{ width: 4, height: 32, borderRadius: 2, background: slot.color, flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    <p style={{ fontWeight: 800, fontSize: '0.875rem', color: isCurrent ? slot.color : '#f1f5f9' }}>{slot.subject}</p>
                                                    {isCurrent && <span className="badge-success" style={{ padding: '0 6px', fontSize: '0.55rem' }}>LIVE</span>}
                                                </div>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>
                                                    {slot.label}{slot.startTime ? ` · ${slot.startTime} – ${slot.endTime}` : ''}{slot.room ? ` · 📍 ${slot.room}` : ''}
                                                </p>
                                            </div>
                                            {slot.teacher && <span style={{ fontSize: '0.65rem', color: 'var(--text-soft)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: 6 }}>{slot.teacher}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                </div>

                {/* ── RIGHT: Deadlines ── */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                        <h2 className="card-title">
                            <AlertTriangle size={20} color="#f59e0b" /> Critical Deadlines
                        </h2>
                        <Link to="/assignments" style={{ fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none', fontWeight: 700, letterSpacing: '0.05em' }}>VIEW ALL →</Link>
                    </div>
                    {loading ? <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</p>
                        : upcoming.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                                <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>All Caught Up!</h3>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No upcoming deadlines found. Great job!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {upcoming.slice(0, 5).map(a => {
                                    const days = getDaysLeft(a.deadline);
                                    const urgColor = days <= 1 ? '#ef4444' : days <= 3 ? '#f59e0b' : '#6366f1';
                                    return (
                                        <div key={a._id} className="list-item" style={{
                                            background: days <= 1 ? 'rgba(239,68,68,0.05)' : 'rgba(15,15,26,0.4)',
                                            borderLeft: `3px solid ${urgColor}`
                                        }}>
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 700, fontSize: '0.875rem', color: '#f1f5f9', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                                                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{a.subject?.name || 'Academic'}</p>
                                            </div>
                                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                                                <p style={{ fontSize: '0.75rem', fontWeight: 800, color: urgColor }}>
                                                    {days <= 0 ? 'Today' : `${days} days left`}
                                                </p>
                                                <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Due {new Date(a.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                </div>
            </div>

            <div className="dashboard-grid" style={{ marginBottom: '1.25rem' }}>

                {/* ── Daily Planner Widget ── */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Target size={16} color="#f59e0b" /> Today's Focus
                        </h2>
                        <Link to="/planner" style={{ fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Plan Day →</Link>
                    </div>
                    {loading ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Loading...</p>
                    ) : dashboardTodos.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                            <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>🎯</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No tasks planned for today.</p>
                            <Link to="/planner" style={{ fontSize: '0.78rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Add tasks →</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {dashboardTodos.slice(0, 5).map(todo => (
                                <div key={todo._id} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem',
                                    borderRadius: 10, background: 'rgba(15,15,26,0.5)', border: `1px solid ${priorityColor(todo.priority)}33`,
                                    borderLeft: `3px solid ${priorityColor(todo.priority)}`, transition: 'all 0.2s'
                                }}>
                                    <button onClick={() => toggleComplete(todo)} title="Mark as Done" style={{
                                        width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer',
                                        border: `2px solid ${priorityColor(todo.priority)}`, background: 'transparent',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0, transition: 'all 0.2s'
                                    }}>
                                        <Check size={14} color={priorityColor(todo.priority)} style={{ opacity: 0, transition: 'opacity 0.2s' }}
                                            onMouseEnter={e => { e.currentTarget.style.opacity = 1; e.currentTarget.parentNode.style.background = `${priorityColor(todo.priority)}22`; }}
                                            onMouseLeave={e => { e.currentTarget.style.opacity = 0; e.currentTarget.parentNode.style.background = 'transparent'; }}
                                        />
                                    </button>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 600, fontSize: '0.82rem', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{todo.title}</p>
                                    </div>
                                    <span style={{ fontSize: '0.65rem', color: priorityColor(todo.priority), background: `${priorityColor(todo.priority)}15`, padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                                        {todo.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Habit Tracker Widget ── */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Activity size={16} color="#ec4899" /> Daily Habits
                        </h2>
                        <Link to="/habits" style={{ fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Manage →</Link>
                    </div>
                    {loading ? (
                        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Loading...</p>
                    ) : habits.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                            <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>🌱</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No habits added yet.</p>
                            <Link to="/habits" style={{ fontSize: '0.78rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Build a habit →</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {habits.slice(0, 5).map(habit => {
                                const completed = isHabitCompletedToday(habit.completedDates);
                                return (
                                    <div key={habit._id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem',
                                        borderRadius: 10, background: 'rgba(15,15,26,0.5)', border: `1px solid ${completed ? '#10b98133' : 'rgba(99,102,241,0.07)'}`,
                                        borderLeft: `3px solid ${completed ? '#10b981' : '#ec4899'}`, transition: 'all 0.2s'
                                    }}>
                                        <div style={{ flex: 1, minWidth: 0, paddingRight: '1rem' }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.82rem', color: completed ? '#10b981' : '#e2e8f0', textDecoration: completed ? 'line-through' : 'none', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {habit.name}
                                            </p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {habit.streak > 0 && (
                                                <span style={{ fontSize: '0.65rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: 2 }}>
                                                    <Flame size={10} /> {habit.streak}
                                                </span>
                                            )}
                                            <button onClick={() => toggleDashHabit(habit)} title={completed ? "Undo" : "Mark as Done"} style={{
                                                background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: completed ? '#10b981' : '#64748b', transition: 'all 0.2s'
                                            }} onMouseEnter={e => !completed && (e.currentTarget.style.color = '#ec4899')} onMouseLeave={e => !completed && (e.currentTarget.style.color = '#64748b')}>
                                                {completed ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* ── Quick Actions ── */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h2 className="card-title">
                        <Zap size={20} color="#f59e0b" /> Quick Navigator
                    </h2>
                    <div className="dashboard-grid-quick">
                        <QuickLink to="/planner" icon={<Target />} label="Planner" color="#f59e0b" />
                        <QuickLink to="/habits" icon={<TrendingUp />} label="Habits" color="#10b981" />
                        <QuickLink to="/assignments" icon={<CheckSquare />} label="Tasks" color="#6366f1" />
                        <QuickLink to="/pomodoro" icon={<Timer />} label="Focus" color="#8b5cf6" />
                        <QuickLink to="/journal" icon={<BookMarked />} label="Journal" color="#ef4444" />
                        <QuickLink to="/portfolio" icon={<Code2 />} label="Projects" color="#22d3ee" />
                    </div>
                </div>

                {/* Recent Journal */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <BookMarked size={16} color="#818cf8" /> Recent Study Logs
                        </h2>
                        <Link to="/journal" style={{ fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>View All →</Link>
                    </div>
                    {journalEntries.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                            <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>📖</p>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>No study logs yet.</p>
                            <Link to="/journal" style={{ fontSize: '0.78rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Start journaling →</Link>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {journalEntries.slice(0, 4).map(e => (
                                <div key={e._id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0.7rem', background: 'rgba(15,15,26,0.5)', borderRadius: 9 }}>
                                    <span style={{ fontSize: '1.2rem', flexShrink: 0 }}>{e.mood}</span>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.78rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {e.subjects?.join(', ') || 'Study session'}
                                        </p>
                                        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                                            {new Date(e.date + 'T00:00:00').toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} · {e.hoursStudied}h
                                        </p>
                                    </div>
                                    <span style={{ fontSize: '0.7rem', color: '#6366f1', fontWeight: 700 }}>{e.hoursStudied}h</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div >
    );
};

export default DashboardPage;
