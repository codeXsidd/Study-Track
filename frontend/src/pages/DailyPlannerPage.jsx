import React, { useState, useEffect } from 'react';
import { Target, Plus, Check, Trash2, Calendar, Star, Layout, ListTodo, Sun, Coffee, Brain, Sparkles, ChevronRight, X, AlertCircle, Bot } from 'lucide-react';
import API from '../services/api';
import { breakDownTask } from '../services/api';
import toast from 'react-hot-toast';

const DailyPlannerPage = () => {
    const [allTodos, setAllTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    // Quick Add State
    const [newQuickTask, setNewQuickTask] = useState('');
    const [quickPriority, setQuickPriority] = useState('Medium');
    const [quickCategory, setQuickCategory] = useState('Study');

    // Backlog Add State
    const [newBacklogTask, setNewBacklogTask] = useState('');
    const [backlogPriority, setBacklogPriority] = useState('Medium');
    const [backlogCategory, setBacklogCategory] = useState('Study');

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await API.get('/todos');
                let fetchedTodos = res.data;

                // Auto-erase planner logic: if a task was planned for a previous day and is uncompleted, move it to backlog
                const today = new Date();
                let staleTaskIds = [];

                const updatedTodos = fetchedTodos.map(t => {
                    if (t.dayPlan && !t.completed) {
                        const planDate = t.dayPlanDate ? new Date(t.dayPlanDate) : new Date(t.createdAt);
                        const isToday = planDate.getDate() === today.getDate() &&
                            planDate.getMonth() === today.getMonth() &&
                            planDate.getFullYear() === today.getFullYear();
                        if (!isToday) {
                            staleTaskIds.push(t._id);
                            return { ...t, dayPlan: false, dayPlanDate: null };
                        }
                    }
                    return t;
                });

                setAllTodos(updatedTodos);

                // Update the stale tasks in the background cleanly
                staleTaskIds.forEach(id => {
                    API.put(`/todos/${id}`, { dayPlan: false, dayPlanDate: null }).catch(() => { });
                });
            }
            catch { toast.error('Failed to load tasks'); }
            setLoading(false);
        };
        fetch();
    }, []);

    const isCompletedToday = (t) => {
        if (!t.completed || !t.completedAt) return false;
        const compDate = new Date(t.completedAt);
        const today = new Date();
        return compDate.getDate() === today.getDate() &&
            compDate.getMonth() === today.getMonth() &&
            compDate.getFullYear() === today.getFullYear();
    };

    const dayPlanTasks = allTodos.filter(t => t.dayPlan && !t.completed);
    const completedToday = allTodos.filter(t => isCompletedToday(t));
    const potentialTasks = allTodos.filter(t => !t.dayPlan && !t.completed);

    const toggleDayPlan = async (todo) => {
        try {
            const res = await API.put(`/todos/${todo._id}`, { dayPlan: !todo.dayPlan });
            setAllTodos(allTodos.map(t => t._id === todo._id ? res.data : t));
            if (!todo.dayPlan) toast.success('Added to today\'s plan! 🚀');
        } catch { toast.error('Update failed'); }
    };

    const toggleComplete = async (todo) => {
        try {
            const res = await API.put(`/todos/${todo._id}`, { completed: !todo.completed, dayPlan: false });
            setAllTodos(allTodos.map(t => t._id === todo._id ? res.data : t));
            if (!todo.completed) toast.success('Awesome! Task done! ✅');
        } catch { toast.error('Update failed'); }
    };

    const cyclePriority = async (todo) => {
        const priorities = ['Low', 'Medium', 'High'];
        const nextPriority = priorities[(priorities.indexOf(todo.priority) + 1) % priorities.length];
        try {
            const res = await API.put(`/todos/${todo._id}`, { priority: nextPriority });
            setAllTodos(allTodos.map(t => t._id === todo._id ? res.data : t));
            toast.success(`Priority set to ${nextPriority}`);
        } catch { toast.error('Failed to change priority'); }
    };

    const addQuickTask = async () => {
        if (!newQuickTask.trim()) return;
        setSaving(true);
        try {
            const res = await API.post('/todos', { title: newQuickTask, dayPlan: true, priority: quickPriority, category: quickCategory });
            setAllTodos([res.data, ...allTodos]);
            setNewQuickTask('');
            toast.success('Quick task added for today!');
        } catch { toast.error('Failed to add task'); }
        setSaving(false);
    };

    const handleAIBreakdown = async () => {
        if (!newQuickTask.trim()) { toast.error("Enter a large task to break down first!"); return; }
        setSaving(true);
        const loadingToast = toast.loading('AI is breaking down your task...');
        try {
            const res = await breakDownTask({ taskTitle: newQuickTask });
            const subtasks = res.data;
            let addedTodos = [];
            for (const sub of subtasks) {
                const addRes = await API.post('/todos', { title: sub.title + ` (${sub.duration})`, dayPlan: true, priority: quickPriority, category: quickCategory });
                addedTodos.push(addRes.data);
            }
            setAllTodos([...addedTodos, ...allTodos]);
            setNewQuickTask('');
            toast.success('Task successfully broken down by AI! 🤖', { id: loadingToast });
        } catch (error) {
            console.error(error);
            toast.error('AI breakdown failed', { id: loadingToast });
        }
        setSaving(false);
    };

    const addBacklogTask = async () => {
        if (!newBacklogTask.trim()) return;
        setSaving(true);
        try {
            const res = await API.post('/todos', { title: newBacklogTask, dayPlan: false, priority: backlogPriority, category: backlogCategory });
            setAllTodos([res.data, ...allTodos]);
            setNewBacklogTask('');
            toast.success('Task added to backlog!');
        } catch { toast.error('Failed to add task'); }
        setSaving(false);
    };

    const removeTask = async (id) => {
        try {
            await API.delete(`/todos/${id}`);
            setAllTodos(allTodos.filter(t => t._id !== id));
            toast.success('Deleted');
        } catch { toast.error('Failed to delete task'); }
    };

    const priorityColor = (priority) => {
        return priority === 'High' ? '#ef4444' : priority === 'Medium' ? '#f59e0b' : '#10b981';
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '1.5rem 1.5rem' }}>

            {/* ── HEADER ── */}
            <div style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <Sun size={28} color="#f59e0b" className="float" />
                    <h1 style={{ fontSize: '2rem', fontWeight: 900, letterSpacing: '-0.04em' }}>Daily Planner</h1>
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                    {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · Plan your wins for today.
                </p>
            </div>

            <div className="dashboard-grid-hero" style={{ gap: '2rem' }}>

                {/* ── LEFT COLUMN: THE ACTIVE DAY PLAN ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card glow-anim" style={{ padding: '1.5rem', background: 'rgba(99,102,241,0.08)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                            <Target size={22} color="#6366f1" />
                            <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Today's Focus</h2>
                        </div>

                        {/* Quick Task Input */}
                        <div className="quick-add-container">
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch', width: '100%' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        className="input"
                                        placeholder="Enter a large goal or task..."
                                        style={{ padding: '0.8rem 1rem', paddingLeft: '2.8rem', fontSize: '1rem', background: 'rgba(15,15,26,0.95)', border: '1px solid rgba(99,102,241,0.3)' }}
                                        value={newQuickTask}
                                        onChange={e => setNewQuickTask(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addQuickTask()}
                                    />
                                    <Target size={20} color="#6366f1" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                                <button 
                                    onClick={handleAIBreakdown} 
                                    disabled={saving || !newQuickTask.trim()} 
                                    className="btn-primary" 
                                    style={{ 
                                        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', 
                                        border: 'none', 
                                        padding: '0 1rem', 
                                        borderRadius: 9, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        gap: 6,
                                        boxShadow: '0 4px 12px rgba(236, 72, 153, 0.2)'
                                    }}
                                >
                                    <Bot size={18} /> <span className="hide-on-mobile">AI Breakdown</span>
                                </button>
                                <button onClick={addQuickTask} disabled={saving} className="btn-primary quick-add-btn">
                                    <Plus size={18} /> <span className="hide-on-mobile">Add</span>
                                </button>
                            </div>

                            {/* Customization toggles */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <select className="input custom-select" value={quickPriority} onChange={e => setQuickPriority(e.target.value)}>
                                    <option value="High">🔴 High Priority</option>
                                    <option value="Medium">🟡 Medium Priority</option>
                                    <option value="Low">🟢 Low Priority</option>
                                </select>
                                <select className="input custom-select" value={quickCategory} onChange={e => setQuickCategory(e.target.value)}>
                                    <option value="Study">📚 Study</option>
                                    <option value="Assignment">📝 Assignment</option>
                                    <option value="Personal">🏠 Personal</option>
                                    <option value="College">🎓 College</option>
                                    <option value="Project">💻 Project</option>
                                    <option value="Other">📌 Other</option>
                                </select>
                            </div>
                        </div>

                        {/* The Plan List */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem' }}>
                            {loading ? (
                                <p style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>Loading tasks...</p>
                            ) : dayPlanTasks.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0', opacity: 0.6 }}>
                                    <Coffee size={40} color="#64748b" style={{ marginBottom: 10 }} />
                                    <p style={{ fontSize: '0.9rem' }}>No tasks in your daily plan yet.</p>
                                    <p style={{ fontSize: '0.78rem', marginTop: 4 }}>Add a task above or pick from backlog →</p>
                                </div>
                            ) : dayPlanTasks.map((todo, idx) => (
                                <div key={todo._id} className="glass-card fade-in task-card" style={{
                                    padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem',
                                    borderLeft: `5px solid ${priorityColor(todo.priority)}`,
                                    animationDelay: `${idx * 0.05}s`,
                                    background: 'rgba(255, 255, 255, 0.02)'
                                }}>
                                    <button onClick={() => toggleComplete(todo)} className="checkbox-btn" aria-label="Mark completed" style={{ width: 32, height: 32 }}>
                                        <Check size={20} color="white" className="check-icon" />
                                    </button>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontWeight: 700, fontSize: '1rem', wordBreak: 'break-word', color: '#f8fafc' }}>{todo.title}</p>
                                        <div style={{ display: 'flex', gap: 8, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', background: 'rgba(255,255,255,0.06)', padding: '3px 8px', borderRadius: 6, textTransform: 'uppercase' }}>
                                                {todo.category}
                                            </span>
                                            <span
                                                onClick={() => cyclePriority(todo)}
                                                title="Click to change priority"
                                                style={{
                                                    fontSize: '0.68rem', fontWeight: 700, color: priorityColor(todo.priority),
                                                    cursor: 'pointer', background: `${priorityColor(todo.priority)}15`,
                                                    padding: '3px 8px', borderRadius: 6, display: 'flex', alignItems: 'center', gap: 4
                                                }}
                                            >
                                                {todo.priority} <Star size={11} fill={priorityColor(todo.priority)} />
                                            </span>
                                        </div>
                                    </div>
                                    <button onClick={() => toggleDayPlan(todo)} title="Move back to backlog" className="remove-plan-btn" style={{ padding: '0.5rem' }}>
                                        <X size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Completed Today */}
                    {completedToday.length > 0 && (
                        <div className="fade-up">
                            <p style={{ fontSize: '0.8rem', fontWeight: 700, color: '#10b981', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Done Today 🎉</p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {completedToday.map(todo => (
                                    <div key={todo._id} className="glass-card completed-task-card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: 22, height: 22, borderRadius: 6, background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Check size={13} color="white" />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={{ fontSize: '0.88rem', textDecoration: 'line-through', color: '#94a3b8', wordBreak: 'break-word' }}>{todo.title}</p>
                                        </div>
                                        <button onClick={() => removeTask(todo._id)} className="delete-task-btn" title="Delete forever">
                                            <Trash2 size={15} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── RIGHT COLUMN: BACKLOG / PLANNING BRIDGE ── */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div className="glass-card" style={{ padding: '1.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
                            <Brain size={22} color="#a78bfa" />
                            <h2 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Backlog</h2>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                            Add pending tasks here, then move <b>3-5 tasks</b> into your daily focus for maximum productivity!
                        </p>

                        {/* Backlog Task Input */}
                        <div className="quick-add-container" style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch', width: '100%' }}>
                                <div style={{ position: 'relative', flex: 1 }}>
                                    <input
                                        className="input"
                                        placeholder="Add task to backlog..."
                                        style={{ padding: '0.8rem 1rem', paddingLeft: '2.8rem', fontSize: '0.9rem', background: 'rgba(15,15,26,0.5)' }}
                                        value={newBacklogTask}
                                        onChange={e => setNewBacklogTask(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addBacklogTask()}
                                    />
                                    <Plus size={20} color="#a78bfa" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                                </div>
                                <button onClick={addBacklogTask} disabled={saving} className="btn-primary quick-add-btn" style={{ background: '#a78bfa', color: '#1a1a2e' }}>
                                    Add
                                </button>
                            </div>

                            {/* Customization toggles */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                <select className="input custom-select" value={backlogPriority} onChange={e => setBacklogPriority(e.target.value)}>
                                    <option value="High">🔴 High Priority</option>
                                    <option value="Medium">🟡 Medium Priority</option>
                                    <option value="Low">🟢 Low Priority</option>
                                </select>
                                <select className="input custom-select" value={backlogCategory} onChange={e => setBacklogCategory(e.target.value)}>
                                    <option value="Study">📚 Study</option>
                                    <option value="Assignment">📝 Assignment</option>
                                    <option value="Personal">🏠 Personal</option>
                                    <option value="College">🎓 College</option>
                                    <option value="Project">💻 Project</option>
                                    <option value="Other">📌 Other</option>
                                </select>
                            </div>
                        </div>

                        <div style={{ maxHeight: '50vh', overflowY: 'auto', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }} className="custom-scroll">
                            {potentialTasks.length === 0 ? (
                                <p style={{ textAlign: 'center', padding: '1rem', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>
                                    Backlog is clean! Add new pending tasks above.
                                </p>
                            ) : potentialTasks.map(todo => (
                                <div key={todo._id} className="glass-card backlog-card">
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <p style={{ fontSize: '0.88rem', fontWeight: 600, wordBreak: 'break-word', paddingRight: '8px' }}>{todo.title}</p>
                                        <div style={{ display: 'flex', gap: 6, marginTop: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                                            <span style={{ fontSize: '0.65rem', color: '#64748b', background: 'rgba(255,255,255,0.03)', padding: '2px 6px', borderRadius: 4 }}>
                                                {todo.category}
                                            </span>
                                            <span
                                                onClick={() => cyclePriority(todo)}
                                                title="Click to change priority"
                                                style={{
                                                    fontSize: '0.65rem', color: priorityColor(todo.priority),
                                                    cursor: 'pointer', background: `${priorityColor(todo.priority)}10`,
                                                    padding: '2px 6px', borderRadius: 4, display: 'flex', alignItems: 'center', gap: 3
                                                }}
                                            >
                                                {todo.priority} <AlertCircle size={10} />
                                            </span>
                                            {todo.dueDate && (
                                                <span style={{ fontSize: '0.65rem', color: (new Date(todo.dueDate) - new Date()) / 86400000 <= 1 ? '#ef4444' : '#64748b' }}>
                                                    • Due {new Date(todo.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <button onClick={() => toggleDayPlan(todo)} className="move-plan-btn" title="Add to Today's Focus">
                                            Add <ChevronRight size={12} />
                                        </button>
                                        <button onClick={() => removeTask(todo._id)} className="delete-task-btn" title="Delete Task" style={{ padding: '0.4rem', color: '#ef4444' }}>
                                            <Trash2 size={13} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="glass-card fade-in" style={{ padding: '1.25rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(6,182,212,0.05) 100%)', border: '1px solid rgba(16,185,129,0.15)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                            <Sparkles size={16} color="#10b981" />
                            <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>Pro Tip</h3>
                        </div>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5 }}>
                            Focus on "Deep Work" sessions. Click on any priority tag to cycle between High, Medium, and Low.
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                .float { animation: float 3s ease-in-out infinite; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                .quick-add-container {
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                }
                
                .custom-select {
                    width: 140px;
                    padding: 0.45rem 0.6rem;
                    fontSize: 0.8rem;
                    background: rgba(15,15,26,0.6);
                    cursor: pointer;
                    color: #e2e8f0;
                }
                .custom-select option {
                    background: #1a1a2e;
                    color: #fff;
                }

                .quick-add-btn {
                    padding: 0 1.25rem;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    border-radius: 9px;
                    font-size: 0.95rem;
                }

                .checkbox-btn {
                    width: 28px;
                    height: 28px;
                    border-radius: 8px;
                    flex-shrink: 0;
                    cursor: pointer;
                    border: 2px solid rgba(99, 102, 241, 0.4);
                    background: transparent;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s;
                }
                .checkbox-btn:hover {
                    border-color: #6366f1;
                    background: rgba(99, 102, 241, 0.1);
                }
                .checkbox-btn .check-icon {
                    opacity: 0;
                    transition: opacity 0.2s;
                }
                .checkbox-btn:hover .check-icon {
                    opacity: 0.8;
                }

                .remove-plan-btn {
                    background: none;
                    border: none;
                    cursor: pointer;
                    color: #475569;
                    padding: 6px;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .remove-plan-btn:hover {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                }

                .completed-task-card {
                    opacity: 0.7;
                    transition: opacity 0.2s;
                }
                .completed-task-card:hover {
                    opacity: 1;
                }

                .delete-task-btn {
                    color: rgba(239, 68, 68, 0.5);
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 6px;
                    border-radius: 6px;
                    transition: all 0.2s;
                }
                .delete-task-btn:hover {
                    color: #ef4444;
                    background: rgba(239, 68, 68, 0.1);
                }

                .backlog-card {
                    padding: 0.85rem;
                    background: rgba(15,15,26,0.3);
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    border: 1px solid rgba(99,102,241,0.05);
                    transition: all 0.2s;
                    border-left: 3px solid rgba(99, 102, 241, 0.2);
                }
                .backlog-card:hover {
                    background: rgba(99,102,241,0.05);
                    border-color: rgba(99, 102, 241, 0.1);
                    border-left-color: rgba(99, 102, 241, 0.6);
                }

                .move-plan-btn {
                    padding: 0.4rem 0.6rem;
                    border-radius: 8px;
                    background: rgba(99,102,241,0.1);
                    border: 1px solid rgba(99,102,241,0.2);
                    color: #818cf8;
                    font-size: 0.75rem;
                    font-weight: 700;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    transition: all 0.2s;
                    flex-shrink: 0;
                }
                .move-plan-btn:hover {
                    background: #6366f1;
                    color: white;
                }

                .custom-scroll::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scroll::-webkit-scrollbar-track {
                    background: rgba(0,0,0,0.1);
                    border-radius: 8px;
                }
                .custom-scroll::-webkit-scrollbar-thumb {
                    background: rgba(167, 139, 250, 0.3);
                    border-radius: 8px;
                }
                .custom-scroll::-webkit-scrollbar-thumb:hover {
                    background: rgba(167, 139, 250, 0.5);
                }

                @media (max-width: 600px) {
                    .hide-on-mobile {
                        display: none;
                    }
                    .quick-add-btn {
                        padding: 0 0.75rem;
                    }
                    .custom-select {
                        width: 48%;
                        flex: 1;
                    }
                    .backlog-card {
                        flex-wrap: wrap;
                    }
                    .backlog-card > div:last-child {
                        width: 100%;
                        justify-content: flex-end;
                        margin-top: 0.25rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default DailyPlannerPage;

