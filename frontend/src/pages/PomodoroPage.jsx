import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, BookOpen, Moon, Music, Target, CheckCircle2, Circle } from 'lucide-react';
import API from '../services/api';

const MODES = [
    { label: 'Focus', time: 25 * 60, color: '#6366f1', icon: <BookOpen size={16} /> },
    { label: 'Short Break', time: 5 * 60, color: '#10b981', icon: <Coffee size={16} /> },
    { label: 'Long Break', time: 15 * 60, color: '#8b5cf6', icon: <Moon size={16} /> },
];

const PomodoroPage = () => {
    const [modeIdx, setModeIdx] = useState(0);
    const [seconds, setSeconds] = useState(MODES[0].time);
    const [running, setRunning] = useState(false);
    const [sessions, setSessions] = useState(0);
    const [totalFocus, setTotalFocus] = useState(0);
    const [todos, setTodos] = useState([]);
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);
    const mode = MODES[modeIdx];

    useEffect(() => {
        const fetchTodos = async () => {
            try {
                const { data } = await API.get('/todos');
                const todayTodos = data.filter(t => t.dayPlan && !t.completed);
                setTodos(todayTodos);
            } catch (err) {
                console.error(err);
            }
            setLoading(false);
        };
        fetchTodos();
    }, []);

    useEffect(() => {
        if (running) {
            intervalRef.current = setInterval(() => {
                setSeconds(s => {
                    if (s <= 1) {
                        clearInterval(intervalRef.current);
                        setRunning(false);
                        handleComplete();
                        return 0;
                    }
                    return s - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [running, modeIdx]);

    const handleComplete = () => {
        // Browser notification
        if (Notification.permission === 'granted') {
            new Notification(`⏰ ${mode.label} Complete!`, {
                body: modeIdx === 0 ? 'Great work! Time for a break.' : 'Break over! Back to focus.',
                icon: '/vite.svg'
            });
        }
        // Play beep via Web Audio
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain); gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.8);
        } catch { }

        if (modeIdx === 0) {
            const newSessions = sessions + 1;
            setSessions(newSessions);
            setTotalFocus(t => t + MODES[0].time);
            // After 4 focus sessions → long break
            if (newSessions % 4 === 0) switchMode(2);
            else switchMode(1);
        } else {
            switchMode(0);
        }
    };

    const switchMode = (idx) => {
        setModeIdx(idx);
        setSeconds(MODES[idx].time);
        setRunning(false);
    };

    const reset = () => { setRunning(false); setSeconds(mode.time); };

    const requestNotification = () => {
        if (Notification.permission === 'default') Notification.requestPermission();
    };

    const toggleComplete = async (todo) => {
        try {
            const res = await API.put(`/todos/${todo._id}`, { completed: !todo.completed, dayPlan: false });
            setTodos(todos.filter(t => t._id !== todo._id));
        } catch { }
    };

    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    const progress = ((mode.time - seconds) / mode.time) * 100;
    const circumference = 2 * Math.PI * 110;

    return (
        <div className="page-container fade-in" style={{ maxWidth: 1200 }}>
            <div className="section-title">
                <Timer size={26} color="#6366f1" /> Deep Work & Focus Room
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '1.5rem', alignItems: 'start' }}>

                {/* Timer Section */}
                <div className="glass-card" style={{ padding: '2rem 1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    {/* Mode Tabs */}
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                        {MODES.map((m, i) => (
                            <button key={i} onClick={() => switchMode(i)} style={{
                                display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 1.1rem',
                                borderRadius: 25, cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600,
                                background: modeIdx === i ? m.color : 'rgba(99,102,241,0.1)',
                                border: modeIdx === i ? 'none' : '1px solid rgba(99,102,241,0.2)',
                                color: modeIdx === i ? 'white' : '#94a3b8', transition: 'all 0.2s'
                            }}>
                                {m.icon} {m.label}
                            </button>
                        ))}
                    </div>

                    {/* Circular Timer */}
                    <div style={{ position: 'relative', width: 280, height: 280, margin: '0 auto 2.5rem' }}>
                        <svg width="280" height="280" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
                            <circle cx="140" cy="140" r="120" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="12" />
                            <circle cx="140" cy="140" r="120" fill="none"
                                stroke={mode.color} strokeWidth="12"
                                strokeDasharray={circumference}
                                strokeDashoffset={circumference - (progress / 100) * circumference}
                                strokeLinecap="round"
                                style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 10px ${mode.color}66)` }}
                            />
                        </svg>
                        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', width: '100%' }}>
                            <div style={{ fontSize: '4rem', fontWeight: 900, letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums', color: mode.color, lineHeight: 1 }}>
                                {mins}:{secs}
                            </div>
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: 8, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{mode.label}</p>
                        </div>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
                        <button onClick={reset} style={{
                            width: 52, height: 52, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.3)',
                            background: 'rgba(99,102,241,0.1)', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                        }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}>
                            <RotateCcw size={20} />
                        </button>
                        <button onClick={() => { requestNotification(); setRunning(!running); }} style={{
                            width: 80, height: 80, borderRadius: '50%', border: 'none',
                            background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`,
                            cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 4px 20px ${mode.color}55`, transition: 'transform 0.1s', transform: running ? 'scale(0.95)' : 'scale(1)'
                        }}>
                            {running ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 4 }} />}
                        </button>
                    </div>
                </div>

                {/* Productivity Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Stats mini-cards */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem' }}>
                        {[
                            { label: 'Sessions', value: sessions, color: '#6366f1' },
                            { label: 'Focus Time', value: `${Math.floor(totalFocus / 60)}m`, color: '#10b981' },
                            { label: 'Until Break', value: `${4 - (sessions % 4) || 4} left`, color: '#f59e0b' }
                        ].map(s => (
                            <div key={s.label} className="glass-card" style={{ padding: '1rem', textAlign: 'center' }}>
                                <p style={{ fontSize: '1.4rem', fontWeight: 800, color: s.color, lineHeight: 1 }}>{s.value}</p>
                                <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4, fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Lofi Player */}
                    <div className="glass-card" style={{ padding: '1.25rem' }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0' }}>
                            <Music size={16} color="#8b5cf6" /> Ambient Audio
                        </h3>
                        <div style={{ borderRadius: '12px', overflow: 'hidden', background: '#000', height: 120 }}>
                            <iframe
                                width="100%" height="120"
                                src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=0&controls=0"
                                title="Lofi Girl" frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                style={{ border: 'none' }}>
                            </iframe>
                        </div>
                    </div>

                    {/* Today's Focus Actionable Tasks */}
                    <div className="glass-card" style={{ padding: '1.25rem', flex: 1 }}>
                        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 6, color: '#e2e8f0' }}>
                            <Target size={16} color="#f59e0b" /> Focus Targets
                        </h3>

                        {loading ? (
                            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem', padding: '1rem 0' }}>Loading targets...</p>
                        ) : todos.length === 0 ? (
                            <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                <Target size={32} color="#f59e0b" style={{ opacity: 0.3, margin: '0 auto 0.5rem' }} />
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No targets set for today.</p>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '200px', overflowY: 'auto' }} className="hide-scrollbar">
                                {todos.map(todo => (
                                    <div key={todo._id} style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem',
                                        borderRadius: 10, background: 'rgba(15,15,26,0.6)', border: '1px solid rgba(99,102,241,0.1)'
                                    }}>
                                        <p style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e2e8f0' }}>{todo.title}</p>
                                        <button onClick={() => toggleComplete(todo)} style={{
                                            background: 'transparent', border: 'none', color: '#10b981', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4
                                        }}>
                                            <Circle size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PomodoroPage;
