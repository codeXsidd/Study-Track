import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API, { getUpcoming, getHabits, toggleHabit, aiChat } from '../services/api';
import {
    BookOpen, Calendar, CheckCircle, AlertTriangle, TrendingUp, Clock,
    Award, Timer, GraduationCap, BookMarked, Code2, Users, ClipboardList,
    CheckSquare, Flame, Zap, Target, ArrowRight, Star, StickyNote, Check, Activity, Circle, CheckCircle2, Bot, RotateCcw, Compass
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
const QuickLink = ({ to, icon, label, color, count }) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
        <div className="glass-card" style={{
            padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
            cursor: 'pointer', transition: 'all 0.2s', border: '1px solid rgba(99,102,241,0.08)', borderRadius: 12
        }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = `${color}44`; e.currentTarget.style.background = `${color}08`; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.08)'; e.currentTarget.style.background = 'rgba(26, 26, 46, 0.8)'; }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                {React.cloneElement(icon, { size: 18, color })}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#e2e8f0' }}>{label}</p>
                {count !== undefined && <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{count}</p>}
            </div>
            <ArrowRight size={13} color="#64748b" />
        </div>
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
            <div style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.15) 0%, rgba(139,92,246,0.1) 50%, rgba(16,185,129,0.05) 100%)',
                border: '1px solid rgba(99,102,241,0.2)', borderRadius: 16, padding: '1.5rem 2rem',
                marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem'
            }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 900, marginBottom: 4 }}>
                        {greeting()}, <span className="gradient-text">{user?.name?.split(' ')[0]}!</span>
                    </h1>
                    <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>
                        {now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        {' · '}{now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                {/* NOW / NEXT class pill */}
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    {currentClass ? (
                        <div style={{ padding: '0.6rem 1rem', background: `${currentClass.color}22`, border: `1px solid ${currentClass.color}55`, borderRadius: 12 }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: currentClass.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>📍 Now in Class</p>
                            <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#e2e8f0' }}>{currentClass.subject}</p>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{currentClass.label} · {currentClass.room || '—'}</p>
                        </div>
                    ) : nextClass ? (
                        <div style={{ padding: '0.6rem 1rem', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)', borderRadius: 12 }}>
                            <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>⏭ Next Class</p>
                            <p style={{ fontWeight: 800, fontSize: '0.9rem', color: '#e2e8f0' }}>{nextClass.subject}</p>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{nextClass.label} · {nextClass.startTime || '—'}</p>
                        </div>
                    ) : (
                        <div style={{ padding: '0.6rem 1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12 }}>
                            <p style={{ fontSize: '0.7rem', color: '#10b981', fontWeight: 600 }}>✅ No more classes today</p>
                            <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>Enjoy your free time!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ── KEY STATS ROW ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
                {[
                    { label: 'Upcoming Deadlines', value: upcoming.length, color: '#f59e0b', icon: <Clock size={18} />, sub: `${urgentCount} urgent` },
                    { label: 'Study Streak', value: streak > 0 ? `🔥 ${streak}d` : '—', color: '#ef4444', icon: <Flame size={18} />, sub: streak > 0 ? 'Keep it up!' : 'Start journaling!' },
                    { label: 'Today\'s Classes', value: todaySlots.length, color: '#10b981', icon: <Calendar size={18} />, sub: currentClass ? '📍 Class now' : nextClass ? '⏭ Next coming' : 'All done!' }
                ].map((s, idx) => (
                    <div key={s.label} className="glass-card" style={{ padding: '1.25rem', borderLeft: `4px solid ${s.color}`, animationDelay: `${idx * 0.1}s` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                            <p style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                            <div style={{ color: s.color, opacity: 0.7 }}>{s.icon}</div>
                        </div>
                        <p style={{ fontSize: '1.6rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.sub}</p>
                    </div>
                ))}
            </div>

            {/* AI Smart Suggestion Banner */}
            {(urgentCount > 0 || aiInsight) && (
                <div className="glass-card animate-slide-scale" style={{
                    marginBottom: '1.5rem',
                    padding: '1.25rem 1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1.25rem',
                    background: urgentCount > 0
                        ? 'linear-gradient(90deg, rgba(239,68,68,0.12), rgba(13,11,26,0.5))'
                        : 'linear-gradient(90deg, rgba(16,185,129,0.12), rgba(13,11,26,0.5))',
                    borderLeft: `4px solid ${urgentCount > 0 ? '#ef4444' : '#10b981'}`,
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <div className="ai-icon-pulse" style={{
                        background: urgentCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.15)',
                        padding: '0.6rem', borderRadius: '50%', flexShrink: 0
                    }}>
                        <Bot size={24} color={urgentCount > 0 ? '#ef4444' : '#10b981'} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.2rem' }}>
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                AI Smart Suggestion
                            </h4>
                            {insightLoading && <div className="spinner-small" />}
                        </div>
                        <div style={{ fontSize: '0.92rem', color: '#cbd5e1', lineHeight: 1.5, fontWeight: 500 }}>
                            {insightLoading ? (
                                <span style={{ opacity: 0.7, fontStyle: 'italic' }}>Thinking...</span>
                            ) : (
                                <Link to="/ai-chat" style={{ textDecoration: 'none', color: 'inherit' }}>
                                    {aiInsight || (
                                        <>You have <b>{urgentCount} urgent deadline{urgentCount > 1 ? 's' : ''}</b>. Click to chat about a study strategy!</>
                                    )}
                                </Link>
                            ) || "Ready for a productivity boost? Click to chat with your AI buddy!"}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                        <Link to="/ai-chat" style={{
                            padding: '0.4rem 0.8rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700, color: '#e2e8f0', textDecoration: 'none',
                            display: 'flex', alignItems: 'center', gap: 6, transition: 'var(--transition)'
                        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}>
                            Talk to Buddy <ArrowRight size={12} />
                        </Link>
                        <button
                            onClick={fetchAiInsight}
                            disabled={insightLoading}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                cursor: 'pointer',
                                color: '#94a3b8',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32, height: 32,
                                borderRadius: '50%',
                                transition: 'all 0.3s'
                            }}
                            title="Refresh Brain"
                        >
                            <RotateCcw size={14} style={{ animation: insightLoading ? 'spin 1s linear infinite' : 'none' }} />
                        </button>
                    </div>
                </div>
            )}

            <div className="dashboard-grid-hero" style={{ marginBottom: '1.25rem' }}>

                {/* ── LEFT: Today's Timetable ── */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <Calendar size={16} color="#6366f1" /> Today's Schedule
                            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 400 }}>({today})</span>
                        </h2>
                        <Link to="/timetable" style={{ fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>View Full →</Link>
                    </div>

                    {loading ? <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '1rem' }}>Loading...</p>
                        : todaySlots.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>🎉</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No classes today!</p>
                                <Link to="/timetable" style={{ fontSize: '0.78rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>Set up your timetable →</Link>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                                {todaySlots.map(slot => {
                                    const isCurrent = currentClass?._id === slot._id;
                                    const isPast = slot.endMins >= 0 && nowMins > slot.endMins;
                                    return (
                                        <div key={slot._id} style={{
                                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.8rem',
                                            borderRadius: 10, transition: 'all 0.2s',
                                            background: isCurrent ? `${slot.color}18` : isPast ? 'rgba(15,15,26,0.3)' : 'rgba(15,15,26,0.5)',
                                            border: isCurrent ? `1.5px solid ${slot.color}55` : '1px solid rgba(99,102,241,0.07)',
                                            opacity: isPast ? 0.5 : 1
                                        }}>
                                            <div style={{ width: 3, height: 36, borderRadius: 2, background: isCurrent ? slot.color : slot.color + '66', flexShrink: 0 }} />
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                    <p style={{ fontWeight: 700, fontSize: '0.83rem', color: isCurrent ? slot.color : '#e2e8f0' }}>{slot.subject}</p>
                                                    {isCurrent && <span style={{ fontSize: '0.58rem', fontWeight: 700, color: slot.color, padding: '0.1rem 0.4rem', background: `${slot.color}22`, borderRadius: 8 }}>LIVE</span>}
                                                    {isPast && <span style={{ fontSize: '0.58rem', color: '#475569', padding: '0.1rem 0.4rem', background: 'rgba(71,85,105,0.2)', borderRadius: 8 }}>Done</span>}
                                                </div>
                                                <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                                                    {slot.label}{slot.startTime ? ` · ${slot.startTime}${slot.endTime ? `–${slot.endTime}` : ''}` : ''}{slot.room ? ` · 📍${slot.room}` : ''}
                                                </p>
                                            </div>
                                            {slot.teacher && <p style={{ fontSize: '0.65rem', color: '#64748b', textAlign: 'right' }}>{slot.teacher}</p>}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                </div>

                {/* ── RIGHT: Deadlines ── */}
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h2 style={{ fontWeight: 700, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                            <AlertTriangle size={16} color="#f59e0b" /> Upcoming Deadlines
                        </h2>
                        <Link to="/assignments" style={{ fontSize: '0.72rem', color: '#818cf8', textDecoration: 'none', fontWeight: 600 }}>All →</Link>
                    </div>
                    {loading ? <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</p>
                        : upcoming.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                <p style={{ fontSize: '1.8rem', marginBottom: 6 }}>✅</p>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No deadlines this week!</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {upcoming.slice(0, 6).map(a => {
                                    const days = getDaysLeft(a.deadline);
                                    const urgColor = days <= 1 ? '#ef4444' : days <= 3 ? '#f59e0b' : '#6366f1';
                                    return (
                                        <div key={a._id} style={{
                                            padding: '0.65rem 0.8rem', borderRadius: 10,
                                            background: days <= 1 ? 'rgba(239,68,68,0.06)' : 'rgba(15,15,26,0.5)',
                                            border: `1px solid ${urgColor}22`, display: 'flex', alignItems: 'center', gap: '0.75rem'
                                        }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: urgColor, flexShrink: 0 }} />
                                            <div style={{ flex: 1, minWidth: 0 }}>
                                                <p style={{ fontWeight: 600, fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</p>
                                                <p style={{ fontSize: '0.67rem', color: 'var(--text-muted)' }}>{a.subject?.name || 'General'}</p>
                                            </div>
                                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: urgColor, whiteSpace: 'nowrap', padding: '0.15rem 0.45rem', background: `${urgColor}18`, borderRadius: 8 }}>
                                                {days <= 0 ? '🔴 Today' : `${days}d`}
                                            </span>
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
                <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <h2 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                        <Zap size={16} color="#f59e0b" /> Quick Actions
                    </h2>
                    <div className="dashboard-grid-quick">
                        <QuickLink to="/planner" icon={<Target />} label="Plan My Day" color="#f59e0b" />
                        <QuickLink to="/roadmap" icon={<Compass />} label="Mastery Roadmap" color="#ec4899" />
                        <QuickLink to="/habits" icon={<TrendingUp />} label="Habit Builder" color="#10b981" />
                        <QuickLink to="/assignments" icon={<CheckSquare />} label="Add Assignment" color="#6366f1" />
                        <QuickLink to="/pomodoro" icon={<Timer />} label="Start Pomodoro" color="#8b5cf6" />
                        <QuickLink to="/journal" icon={<BookMarked />} label="Log Study" color="#ef4444" />
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
