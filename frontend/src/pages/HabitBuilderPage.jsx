import React, { useState, useEffect } from 'react';
import { getHabits, createHabit, updateHabit, deleteHabit, toggleHabit } from '../services/api';
import toast from 'react-hot-toast';
import { Activity, Plus, Edit2, Trash2, CheckCircle2, Circle, Flame, Target, Trophy, X } from 'lucide-react';

const HabitBuilderPage = () => {
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedId, setSelectedId] = useState(null);
    const [formData, setFormData] = useState({ name: '', goal: '', frequency: 'daily' });

    useEffect(() => {
        fetchHabits();
    }, []);

    const fetchHabits = async () => {
        try {
            const res = await getHabits();
            setHabits(res.data);
            setLoading(false);
        } catch (err) {
            toast.error('Failed to load habits');
            setLoading(false);
        }
    };

    const getDateStr = (d = new Date()) => {
        const date = new Date(d);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    };

    const isCompletedOnDate = (completedDates, dateStr) => {
        if (!completedDates || completedDates.length === 0) return false;
        return completedDates.some(d => getDateStr(d) === dateStr);
    };

    const isCompletedToday = (completedDates) => isCompletedOnDate(completedDates, getDateStr());

    const handleToggle = async (id) => {
        try {
            const today = new Date();
            const dateStr = getDateStr(today);

            // Optimistic update
            setHabits(habits.map(h => {
                if (h._id === id) {
                    const completed = isCompletedToday(h.completedDates);
                    let newDates = [...h.completedDates];
                    let newStreak = h.streak;
                    let newTotal = h.totalCompleted;

                    if (completed) {
                        newDates = newDates.filter(d => getDateStr(d) !== dateStr);
                        newTotal = Math.max(0, newTotal - 1);
                        newStreak = Math.max(0, newStreak - 1);
                    } else {
                        newDates.push(today.toISOString());
                        newTotal += 1;
                        newStreak += 1;
                    }
                    return { ...h, completedDates: newDates, streak: newStreak, totalCompleted: newTotal };
                }
                return h;
            }));

            // Send local ISO string to ensure the backend gets the right intent
            const res = await toggleHabit(id, today.toISOString());
            setHabits(prev => prev.map(h => h._id === id ? res.data : h));
        } catch (err) {
            toast.error('Failed to update habit');
            fetchHabits();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (modalMode === 'add') {
                const res = await createHabit(formData);
                setHabits([res.data, ...habits]);
                toast.success('Habit created!');
            } else {
                const res = await updateHabit(selectedId, formData);
                setHabits(habits.map(h => h._id === selectedId ? res.data : h));
                toast.success('Habit updated!');
            }
            closeModal();
        } catch (err) {
            toast.error(err.response?.data?.msg || 'An error occurred');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this habit?')) return;
        try {
            await deleteHabit(id);
            setHabits(habits.filter(h => h._id !== id));
            toast.success('Habit deleted');
        } catch (err) {
            toast.error('Failed to delete habit');
        }
    };

    const openModal = (mode, habit = null) => {
        setModalMode(mode);
        if (habit) {
            setSelectedId(habit._id);
            setFormData({ name: habit.name, goal: habit.goal || '', frequency: habit.frequency });
        } else {
            setSelectedId(null);
            setFormData({ name: '', goal: '', frequency: 'daily' });
        }
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setFormData({ name: '', goal: '', frequency: 'daily' });
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Habits...</div>;

    const completedTodayCount = habits.filter(h => isCompletedToday(h.completedDates)).length;
    const bestGlobalStreak = Math.max(...habits.map(h => h.bestStreak || 0), 0);

    return (
        <div className="page-container fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div className="section-title" style={{ marginBottom: 0 }}>
                    <Activity size={26} color="#ec4899" /> Habit Builder
                </div>
                <button className="btn-primary" onClick={() => openModal('add')} style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}>
                    <Plus size={16} /> New Habit
                </button>
            </div>

            {/* Dashboard Stats */}
            <div className="stats-grid" style={{ marginBottom: '2rem', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))' }}>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(99,102,241,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Target size={24} color="#6366f1" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', fontWeight: 600 }}>Total Habits</p>
                        <p className="stat-number">{habits.length}</p>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(16,185,129,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={24} color="#10b981" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', fontWeight: 600 }}>Completed Today</p>
                        <p className="stat-number">{completedTodayCount} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {habits.length}</span></p>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 48, height: 48, borderRadius: '12px', background: 'rgba(245,158,11,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Trophy size={24} color="#f59e0b" />
                    </div>
                    <div>
                        <p style={{ color: 'var(--text-soft)', fontSize: '0.85rem', fontWeight: 600 }}>Best Streak</p>
                        <p className="stat-number">{bestGlobalStreak} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>days</span></p>
                    </div>
                </div>
            </div>

            {habits.length === 0 ? (
                <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', borderRadius: '16px' }}>
                    <Activity size={48} color="#ec4899" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>No Habits Yet</h3>
                    <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: 400, margin: '0 auto 1.5rem' }}>
                        Build consistency by tracking daily habits. "Consistent small habits lead to massive results."
                    </p>
                    <button className="btn-primary" onClick={() => openModal('add')} style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}>Create Your First Habit</button>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))', gap: '1.5rem' }}>
                    {habits.map(habit => {
                        const completed = isCompletedToday(habit.completedDates);

                        // Last 7 days progress
                        const last7Days = [];
                        for (let i = 6; i >= 0; i--) {
                            const d = new Date();
                            d.setDate(d.getDate() - i);
                            last7Days.push({
                                dateStr: getDateStr(d),
                                dayName: d.toLocaleDateString('en-US', { weekday: 'narrow' }),
                                completed: isCompletedOnDate(habit.completedDates, getDateStr(d))
                            });
                        }

                        return (
                            <div key={habit._id} className="glass-card fade-up" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', position: 'relative', borderLeft: completed ? '4px solid #10b981' : '4px solid transparent', transition: 'all 0.3s' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                                    <div style={{ flex: 1 }}>
                                        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                                            {habit.name}
                                            {habit.streak >= 3 && <Flame size={16} color="#f59e0b" className="pulse-danger" />}
                                        </h3>
                                        <p style={{ fontSize: '0.8rem', color: 'var(--text-soft)', marginBottom: '0.5rem' }}>
                                            {habit.streak > 0 ? `Current streak: ${habit.streak} days 🚀` : 'Start your streak today!'}
                                        </p>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.25rem' }}>
                                        <button onClick={() => openModal('edit', habit)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 6 }}><Edit2 size={15} /></button>
                                        <button onClick={() => handleDelete(habit._id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 6 }}><Trash2 size={15} /></button>
                                    </div>
                                </div>

                                {/* Goals & Progress */}
                                <div style={{ marginBottom: '1.25rem' }}>
                                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                        {last7Days.map((day, idx) => (
                                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: day.dateStr === getDateStr() ? '#818cf8' : 'var(--text-muted)' }}>{day.dayName}</span>
                                                <div style={{
                                                    width: 22, height: 22, borderRadius: '6px',
                                                    background: day.completed ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)',
                                                    border: day.completed ? '1px solid #10b981' : '1px solid rgba(99,102,241,0.1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                }}>
                                                    {day.completed && <CheckCircle2 size={12} color="#10b981" />}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                                    <div style={{ textAlign: 'left' }}>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Frequency: <span style={{ color: '#818cf8' }}>{habit.frequency}</span></p>
                                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total: <span style={{ color: '#10b981' }}>{habit.totalCompleted}</span></p>
                                    </div>
                                    <button
                                        onClick={() => handleToggle(habit._id)}
                                        style={{
                                            background: completed ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.08)',
                                            border: completed ? '1px solid #10b981' : '1px solid #6366f1',
                                            color: completed ? '#10b981' : '#6366f1',
                                            padding: '0.5rem 1rem', borderRadius: '10px',
                                            display: 'flex', alignItems: 'center', gap: 6,
                                            fontWeight: 800, cursor: 'pointer', fontSize: '0.82rem',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            boxShadow: completed ? '0 0 10px rgba(16, 185, 129, 0.1)' : 'none'
                                        }}
                                    >
                                        {completed ? <CheckCircle2 size={16} /> : <Circle size={16} />}
                                        {completed ? 'Completed' : 'Mark Done'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(5,5,16,0.8)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
                    <div className="glass-card fade-up" style={{ width: '100%', maxWidth: 450, padding: '2rem', position: 'relative' }}>
                        <button type="button" onClick={closeModal} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>

                        <h2 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', fontWeight: 800, color: '#e2e8f0' }}>
                            {modalMode === 'add' ? 'Create New Habit' : 'Edit Habit'}
                        </h2>

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>Habit Name *</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="e.g., Read for 30 minutes"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>Goal Description (Optional)</label>
                                <textarea
                                    className="input"
                                    placeholder="Why are you building this habit?"
                                    value={formData.goal}
                                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                                    rows="2"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8' }}>Frequency</label>
                                <select
                                    className="input"
                                    value={formData.frequency}
                                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                                >
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                </select>
                            </div>

                            <button type="submit" className="btn-primary" style={{ marginTop: '0.5rem', background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}>
                                {modalMode === 'add' ? 'Create Habit' : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default HabitBuilderPage;
