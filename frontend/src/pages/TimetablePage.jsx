import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Trash2, X, Settings, Clock, Save, RotateCcw, Bot, Sparkles } from 'lucide-react';
import API, { optimizeSchedule } from '../services/api';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SUBJECT_COLORS = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#ec4899', '#14b8a6', '#f97316', '#a855f7'];

const DEFAULT_PERIODS = (n) => Array.from({ length: n }, (_, i) => ({
    number: i + 1, label: `P${i + 1}`, startTime: '', endTime: ''
}));

const todayName = () => {
    const d = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return d[new Date().getDay()];
};

const TimetablePage = () => {
    const [slots, setSlots] = useState([]);
    const [config, setConfig] = useState({ totalPeriods: 8, periods: DEFAULT_PERIODS(8) });
    const [loading, setLoading] = useState(true);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState({ subject: '', teacher: '', room: '', color: '#6366f1' });
    const [saving, setSaving] = useState(false);
    const [showConfig, setShowConfig] = useState(false);
    const [draftConfig, setDraftConfig] = useState(null);
    const [savingConfig, setSavingConfig] = useState(false);
    const [aiAdvice, setAiAdvice] = useState('');
    const [optimizing, setOptimizing] = useState(false);
    const today = todayName();

    useEffect(() => {
        const load = async () => {
            try {
                const [slotsRes, configRes] = await Promise.all([API.get('/timetable'), API.get('/timetable-config')]);
                setSlots(slotsRes.data);
                const cfg = configRes.data;
                // Ensure periods array matches totalPeriods
                const periods = Array.from({ length: cfg.totalPeriods }, (_, i) => {
                    const existing = cfg.periods?.find(p => p.number === i + 1);
                    return existing || { number: i + 1, label: `P${i + 1}`, startTime: '', endTime: '' };
                });
                setConfig({ totalPeriods: cfg.totalPeriods, periods });
            } catch { toast.error('Failed to load timetable'); }
            setLoading(false);
        };
        load();
    }, []);

    const openConfig = () => {
        setDraftConfig(JSON.parse(JSON.stringify(config)));
        setShowConfig(true);
    };

    const updateDraftPeriodCount = (n) => {
        const count = Math.max(1, Math.min(15, Number(n)));
        const periods = Array.from({ length: count }, (_, i) => {
            const existing = draftConfig.periods.find(p => p.number === i + 1);
            return existing || { number: i + 1, label: `P${i + 1}`, startTime: '', endTime: '' };
        });
        setDraftConfig({ ...draftConfig, totalPeriods: count, periods });
    };

    const updateDraftPeriod = (idx, field, value) => {
        const periods = draftConfig.periods.map((p, i) => i === idx ? { ...p, [field]: value } : p);
        setDraftConfig({ ...draftConfig, periods });
    };

    const saveConfig = async () => {
        setSavingConfig(true);
        try {
            await API.post('/timetable-config', draftConfig);
            setConfig(draftConfig);
            setShowConfig(false);
            toast.success('Timetable configured!');
        } catch { toast.error('Failed to save config'); }
        setSavingConfig(false);
    };

    const getSlot = (day, period) => slots.find(s => s.day === day && s.period === period);

    const openModal = (day, period) => {
        const ex = getSlot(day, period);
        setForm(ex ? { subject: ex.subject, teacher: ex.teacher, room: ex.room, color: ex.color } : { subject: '', teacher: '', room: '', color: '#6366f1' });
        setModal({ day, period });
    };

    const saveSlot = async () => {
        if (!form.subject.trim()) { toast.error('Subject required'); return; }
        setSaving(true);
        try {
            const res = await API.post('/timetable', { ...form, day: modal.day, period: modal.period });
            setSlots(prev => [...prev.filter(s => !(s.day === modal.day && s.period === modal.period)), res.data]);
            setModal(null);
            toast.success('Saved!');
        } catch { toast.error('Failed'); }
        setSaving(false);
    };

    const deleteSlot = async (slot, e) => {
        e.stopPropagation();
        try {
            await API.delete(`/timetable/${slot._id}`);
            setSlots(prev => prev.filter(s => s._id !== slot._id));
        } catch { toast.error('Delete failed'); }
    };

    const handleAIOptimize = async () => {
        setOptimizing(true);
        const loadingToast = toast.loading('AI is analyzing your timetable...');
        try {
            const todosRes = await API.get('/todos');
            const pendingTodos = todosRes.data.filter(t => !t.completed).length;
            const res = await optimizeSchedule({ slots, todoCount: pendingTodos });
            setAiAdvice(res.data.advice);
            toast.success('Strategy generated! 🎯', { id: loadingToast });
        } catch (error) {
            toast.error('Optimization failed', { id: loadingToast });
        }
        setOptimizing(false);
    };

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', fontWeight: 700 }}>
                    <Calendar size={26} color="#6366f1" /> Weekly Timetable
                </h2>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '0.35rem 0.8rem', background: 'rgba(16,185,129,0.1)', borderRadius: 20 }}>
                        <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ fontSize: '0.78rem', color: '#10b981', fontWeight: 600 }}>Today: {today}</span>
                    </div>
                    <button onClick={handleAIOptimize} disabled={optimizing} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.9rem',
                        background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', border: 'none',
                        borderRadius: 8, cursor: 'pointer', color: 'white', fontSize: '0.82rem', fontWeight: 600
                    }}>
                        <Bot size={14} /> AI Strategy
                    </button>
                    <button onClick={openConfig} style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '0.4rem 0.9rem',
                        background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                        borderRadius: 8, cursor: 'pointer', color: '#818cf8', fontSize: '0.82rem', fontWeight: 600
                    }}>
                        <Settings size={14} /> Customize Periods
                    </button>
                </div>
            </div>

            {aiAdvice && (
                <div className="glass-card fade-up" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', display: 'flex', alignItems: 'flex-start', gap: '0.85rem', background: 'rgba(167,139,250,0.08)', borderLeft: '4px solid #a78bfa', position: 'relative' }}>
                    <Sparkles size={18} color="#a78bfa" style={{ marginTop: 2 }} />
                    <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>
                            <strong>AI Study Strategy:</strong> {aiAdvice}
                        </p>
                    </div>
                    <button onClick={() => setAiAdvice('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={14} /></button>
                </div>
            )}

            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginBottom: '1rem' }}>
                💡 Click any cell to add a class · Current config: <strong style={{ color: '#818cf8' }}>{config.totalPeriods} periods</strong>
            </p>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading...</div>
            ) : (
                <div style={{ width: '100%', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: '0.5rem' }}>
                    <div style={{ minWidth: 700 }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '3px' }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '0.65rem 0.75rem', background: 'rgba(15,15,26,0.9)', borderRadius: 8, fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', textAlign: 'left', minWidth: 85, whiteSpace: 'nowrap' }}>
                                        Period / Time
                                    </th>
                                    {DAYS.map(day => (
                                        <th key={day} style={{
                                            padding: '0.65rem 0.5rem', fontSize: '0.78rem', textAlign: 'center', fontWeight: 700, borderRadius: 8,
                                            background: day === today ? 'rgba(99,102,241,0.18)' : 'rgba(15,15,26,0.6)',
                                            color: day === today ? '#818cf8' : '#94a3b8',
                                            borderBottom: day === today ? '2px solid #6366f1' : 'none', minWidth: 100
                                        }}>
                                            {day.slice(0, 3)}
                                            {day === today && <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#6366f1', margin: '3px auto 0' }} />}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {config.periods.map(period => (
                                    <tr key={period.number}>
                                        <td style={{
                                            padding: '0.4rem 0.75rem', background: 'rgba(15,15,26,0.5)', borderRadius: 7,
                                            verticalAlign: 'middle'
                                        }}>
                                            <div style={{ fontWeight: 700, color: '#818cf8', fontSize: '0.8rem' }}>
                                                {period.label || `P${period.number}`}
                                            </div>
                                            {(period.startTime || period.endTime) && (
                                                <div style={{ fontSize: '0.62rem', color: '#475569', display: 'flex', alignItems: 'center', gap: 3, marginTop: 2 }}>
                                                    <Clock size={9} /> {period.startTime}{period.endTime ? `–${period.endTime}` : ''}
                                                </div>
                                            )}
                                        </td>
                                        {DAYS.map(day => {
                                            const slot = getSlot(day, period.number);
                                            const isToday = day === today;
                                            return (
                                                <td key={day}
                                                    onClick={() => openModal(day, period.number)}
                                                    style={{
                                                        padding: '0.25rem', borderRadius: 7, cursor: 'pointer',
                                                        background: isToday ? 'rgba(99,102,241,0.04)' : 'rgba(15,15,26,0.3)',
                                                        height: 62, verticalAlign: 'top', transition: 'background 0.15s'
                                                    }}
                                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                                    onMouseLeave={e => e.currentTarget.style.background = isToday ? 'rgba(99,102,241,0.04)' : 'rgba(15,15,26,0.3)'}
                                                >
                                                    {slot ? (
                                                        <div style={{
                                                            background: slot.color + '22', border: `1px solid ${slot.color}55`,
                                                            borderLeft: `3px solid ${slot.color}`, borderRadius: 6,
                                                            padding: '0.3rem 0.4rem', height: '100%', position: 'relative'
                                                        }}>
                                                            <p style={{ fontSize: '0.73rem', fontWeight: 700, color: slot.color, lineHeight: 1.2 }}>{slot.subject}</p>
                                                            {slot.teacher && <p style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: 1 }}>{slot.teacher}</p>}
                                                            {slot.room && <p style={{ fontSize: '0.58rem', color: '#64748b' }}>📍 {slot.room}</p>}
                                                            <button onClick={(e) => deleteSlot(slot, e)} style={{
                                                                position: 'absolute', top: 2, right: 2, width: 15, height: 15,
                                                                border: 'none', background: 'rgba(239,68,68,0.2)', borderRadius: 3,
                                                                cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                                                            }}><X size={8} /></button>
                                                        </div>
                                                    ) : (
                                                        <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }} className="add-hint">
                                                            <Plus size={14} color="#6366f1" />
                                                        </div>
                                                    )}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Config Panel */}
            {showConfig && draftConfig && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 400, padding: '1rem' }}
                    onClick={e => e.target === e.currentTarget && setShowConfig(false)}>
                    <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 520, padding: '1.75rem', maxHeight: '85vh', overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 7 }}>
                                <Settings size={17} color="#6366f1" /> Customize Timetable
                            </h3>
                            <button onClick={() => setShowConfig(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>

                        {/* Period count */}
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Number of Periods (1–15)</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <input type="number" className="input" min={1} max={15} value={draftConfig.totalPeriods}
                                    onChange={e => updateDraftPeriodCount(e.target.value)}
                                    style={{ width: 80, padding: '0.5rem', textAlign: 'center', fontSize: '1rem', fontWeight: 700 }} />
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>periods per day</span>
                            </div>
                        </div>

                        {/* Per-period settings */}
                        <div style={{ marginBottom: '1rem' }}>
                            <div className="timetable-config-grid" style={{ marginBottom: '0.4rem' }}>
                                {['#', 'Label', 'Start', 'End'].map(h => (
                                    <span key={h} style={{ fontSize: '0.65rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>{h}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 300, overflowY: 'auto' }}>
                                {draftConfig.periods.map((p, i) => (
                                    <div key={i} className="timetable-config-grid" style={{ alignItems: 'center' }}>
                                        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, textAlign: 'center' }}>P{p.number}</span>
                                        <input className="input" placeholder={`P${p.number}`} value={p.label}
                                            onChange={e => updateDraftPeriod(i, 'label', e.target.value)}
                                            style={{ padding: '0.4rem 0.5rem', fontSize: '0.78rem' }} />
                                        <input className="input" type="time" value={p.startTime}
                                            onChange={e => updateDraftPeriod(i, 'startTime', e.target.value)}
                                            style={{ padding: '0.4rem 0.5rem', fontSize: '0.78rem' }} />
                                        <input className="input" type="time" value={p.endTime}
                                            onChange={e => updateDraftPeriod(i, 'endTime', e.target.value)}
                                            style={{ padding: '0.4rem 0.5rem', fontSize: '0.78rem' }} />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem' }}>
                            <button onClick={() => setShowConfig(false)} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                            <button onClick={saveConfig} disabled={savingConfig} className="btn-primary" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                                <Save size={15} /> {savingConfig ? 'Saving...' : 'Save Config'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add slot modal */}
            {modal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: '1rem' }}
                    onClick={e => e.target === e.currentTarget && setModal(null)}>
                    <div className="glass-card fade-in" style={{ width: '100%', maxWidth: 400, padding: '1.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                            <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>
                                {modal.day} · {config.periods.find(p => p.number === modal.period)?.label || `P${modal.period}`}
                            </h3>
                            <button onClick={() => setModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={18} /></button>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Subject *</label>
                                <input className="input" placeholder="e.g. Data Structures" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} autoFocus />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Professor</label>
                                <input className="input" placeholder="e.g. Dr. Sharma" value={form.teacher} onChange={e => setForm({ ...form, teacher: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Room / Lab</label>
                                <input className="input" placeholder="e.g. A-304" value={form.room} onChange={e => setForm({ ...form, room: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Color</label>
                                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                    {SUBJECT_COLORS.map(c => (
                                        <button key={c} onClick={() => setForm({ ...form, color: c })} style={{ width: 26, height: 26, borderRadius: '50%', background: c, border: form.color === c ? '3px solid white' : '3px solid transparent', cursor: 'pointer', outline: form.color === c ? `2px solid ${c}` : 'none' }} />
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                                <button onClick={() => setModal(null)} style={{ flex: 1, padding: '0.6rem', borderRadius: 8, background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
                                <button onClick={saveSlot} disabled={saving} className="btn-primary" style={{ flex: 1 }}>{saving ? 'Saving...' : 'Save Slot'}</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <style>{`tr:hover .add-hint { opacity: 1 !important; }`}</style>
        </div>
    );
};

export default TimetablePage;
