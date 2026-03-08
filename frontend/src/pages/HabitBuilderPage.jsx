import React, { useState, useEffect } from 'react';
import { getHabits, addHabit, updateHabit, deleteHabit, toggleHabit } from '../services/api';
import { Target, Plus, Flame, Check, X, Calendar, Activity, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const getDateStr = (d = new Date()) => {
    const p = new Date(d);
    p.setMinutes(p.getMinutes() - p.getTimezoneOffset());
    return p.toISOString().split('T')[0];
};

const HabitBuilderPage = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', goal: '', frequency: 'daily' });
    const [todayStr, setTodayStr] = useState(getDateStr());

    useEffect(() => {
        loadHabits();
        const interval = setInterval(() => setTodayStr(getDateStr()), 60000);
        return () => clearInterval(interval);
    }, []);

    const loadHabits = async () => {
        try {
            const res = await getHabits();
            setHabits(res.data);
        } catch {
            toast.error('Failed to load habits');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            const res = await addHabit(formData);
            setHabits([res.data, ...habits]);
            toast.success('Habit created!');
            setShowModal(false);
            setFormData({ name: '', goal: '', frequency: 'daily' });
        } catch {
            toast.error('Failed to create habit');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this habit?')) return;
        try {
            await deleteHabit(id);
            setHabits(habits.filter(h => h._id !== id));
            toast.success('Habit deleted');
        } catch {
            toast.error('Failed to delete habit');
        }
    };

    const toggleCompletion = async (id) => {
        try {
            const res = await toggleHabit(id, todayStr);
            setHabits(habits.map(h => (h._id === id ? res.data : h)));
        } catch {
            toast.error('Failed to toggle completion');
        }
    };

    // Stats
    const totalHabits = habits.length;
    const completedToday = habits.filter(h => h.completedDates?.includes(todayStr)).length;
    const activeStreaks = habits.reduce((acc, h) => acc + (h.streak > 0 ? 1 : 0), 0);
    const topStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
    const completionRate = totalHabits ? Math.round((completedToday / totalHabits) * 100) : 0;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '1.5rem', paddingBottom: '80px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div className="section-title" style={{ marginBottom: 0 }}>
                    <Activity size={24} color="#f59e0b" /> Habit Builder
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary fade-in"
                    style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                    <Plus size={18} /> New Habit
                </button>
            </div>

            {/* Stats Overview */}
            <div className="stats-grid fade-up" style={{ marginBottom: '2rem' }}>
                {[
                    { label: 'Completed Today', value: `${completedToday}/${totalHabits}`, color: '#10b981', icon: <Check size={20} /> },
                    { label: "Today's Progress", value: `${completionRate}%`, color: '#6366f1', icon: <Target size={20} /> },
                    { label: 'Active Streaks', value: activeStreaks, color: '#f59e0b', icon: <Flame size={20} /> },
                    { label: 'Top Streak', value: `${topStreak} days`, color: '#ec4899', icon: <Activity size={20} /> },
                ].map((s, i) => (
                    <div key={i} className="glass-card" style={{ padding: '1.25rem', borderLeft: `3px solid ${s.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{s.label}</p>
                            <div style={{ color: s.color, background: `${s.color}15`, padding: 6, borderRadius: 8 }}>{s.icon}</div>
                        </div>
                        <p style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Habit List */}
            {loading ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>Loading habits...</p>
            ) : habits.length === 0 ? (
                <div className="glass-card fade-up" style={{ textAlign: 'center', padding: '4rem 2rem', borderRadius: 16 }}>
                    <div style={{ width: 80, height: 80, background: 'rgba(245, 158, 11, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#f59e0b' }}>
                        <Target size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>No Habits Yet</h3>
                    <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 auto 1.5rem', lineHeight: 1.6 }}>Start building a routine by adding your first daily or weekly habit to track.</p>
                    <button
                        onClick={() => setShowModal(true)}
                        className="btn-primary"
                        style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                        <Plus size={18} /> Create Habit
                    </button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
                    {habits.map((h, i) => {
                        const isDoneToday = h.completedDates?.includes(todayStr);
                        return (
                            <div key={h._id} className="glass-card fade-up" style={{ padding: '1.25rem', position: 'relative', overflow: 'hidden', animationDelay: `${i * 0.05}s`, border: isDoneToday ? '1px solid rgba(16,185,129,0.3)' : '' }}>
                                {isDoneToday && <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: 4, background: '#10b981' }} />}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, paddingRight: '2rem', wordBreak: 'break-word', color: isDoneToday ? '#10b981' : '#e2e8f0' }}>{h.name}</h3>
                                    <button
                                        onClick={() => handleDelete(h._id)}
                                        style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'transparent', border: 'none', color: '#ef4444', opacity: 0.5, cursor: 'pointer', padding: 4, transition: 'opacity 0.2s' }}
                                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                                        onMouseLeave={e => e.currentTarget.style.opacity = 0.5}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {h.goal && <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>{h.goal}</p>}

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: h.streak > 0 ? 'rgba(245,158,11,0.1)' : 'rgba(100,116,139,0.1)', padding: '0.4rem 0.8rem', borderRadius: 20 }}>
                                        <Flame size={16} color={h.streak > 0 ? '#f59e0b' : '#64748b'} />
                                        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: h.streak > 0 ? '#f59e0b' : '#94a3b8' }}>
                                            {h.streak} Day String
                                        </span>
                                    </div>
                                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#6366f1', background: 'rgba(99,102,241,0.1)', padding: '0.3rem 0.6rem', borderRadius: 6, textTransform: 'capitalize' }}>
                                        {h.frequency}
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleCompletion(h._id)}
                                    style={{
                                        display: 'block', width: '100%', padding: '0.75rem', border: 'none', borderRadius: 10, cursor: 'pointer',
                                        fontSize: '0.9rem', fontWeight: 700, transition: 'all 0.2s',
                                        background: isDoneToday ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.1)',
                                        color: isDoneToday ? '#10b981' : '#818cf8',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                    }}
                                    onMouseEnter={e => {
                                        if (!isDoneToday) {
                                            e.currentTarget.style.background = 'rgba(99,102,241,0.2)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isDoneToday) {
                                            e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    {isDoneToday ? (
                                        <><Check size={18} /> Completed Today</>
                                    ) : (
                                        <><RefreshCw size={18} /> Mark as Done</>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 450, padding: '1.5rem 2rem', position: 'relative' }}>
                        <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                        <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Target size={20} color="#f59e0b" /> Create Habit
                        </h2>

                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Habit Name *</label>
                                <input
                                    required autoFocus
                                    placeholder="e.g., Read 10 Pages, Gym"
                                    className="input"
                                    value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Goal / Motivation</label>
                                <input
                                    placeholder="Why do you want to build this habit?"
                                    className="input"
                                    value={formData.goal} onChange={e => setFormData({ ...formData, goal: e.target.value })}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Frequency</label>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    {['daily', 'weekly'].map(freq => (
                                        <button
                                            key={freq} type="button"
                                            onClick={() => setFormData({ ...formData, frequency: freq })}
                                            style={{
                                                padding: '0.75rem', borderRadius: 10, cursor: 'pointer', textTransform: 'capitalize', fontWeight: 600, transition: 'all 0.2s',
                                                background: formData.frequency === freq ? 'rgba(245, 158, 11, 0.15)' : 'rgba(15,15,26,0.6)',
                                                border: formData.frequency === freq ? '1px solid #f59e0b' : '1px solid rgba(255,255,255,0.05)',
                                                color: formData.frequency === freq ? '#f59e0b' : 'var(--text-muted)'
                                            }}
                                        >
                                            {freq}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: '0.75rem', borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: 'none', color: 'var(--text)', cursor: 'pointer', fontWeight: 600 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary" style={{ flex: 1, background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' }}>
                                    Save Habit
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitBuilderPage;
