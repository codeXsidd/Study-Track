import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, RotateCcw, Coffee, BookOpen, Moon } from 'lucide-react';

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
    const intervalRef = useRef(null);
    const mode = MODES[modeIdx];

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

    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    const progress = ((mode.time - seconds) / mode.time) * 100;
    const circumference = 2 * Math.PI * 110;

    return (
        <div style={{ maxWidth: 700, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div className="section-title" style={{ justifyContent: 'center', textAlign: 'center' }}>
                <Timer size={24} color="#6366f1" /> Pomodoro Study Timer
            </div>

            {/* Mode Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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
            <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center', marginBottom: '1.5rem' }}>
                <div style={{ position: 'relative', width: 260, height: 260, margin: '0 auto 2rem' }}>
                    <svg width="260" height="260" style={{ transform: 'rotate(-90deg)', position: 'absolute', top: 0, left: 0 }}>
                        {/* Background circle */}
                        <circle cx="130" cy="130" r="110" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="10" />
                        {/* Progress circle */}
                        <circle cx="130" cy="130" r="110" fill="none"
                            stroke={mode.color} strokeWidth="10"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference - (progress / 100) * circumference}
                            strokeLinecap="round"
                            style={{ transition: 'stroke-dashoffset 1s linear', filter: `drop-shadow(0 0 8px ${mode.color}66)` }}
                        />
                    </svg>
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
                        <div style={{ fontSize: '3.5rem', fontWeight: 800, letterSpacing: '-2px', fontVariantNumeric: 'tabular-nums', color: mode.color }}>
                            {mins}:{secs}
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 4 }}>{mode.label}</p>
                    </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1.5rem' }}>
                    <button onClick={reset} style={{
                        width: 48, height: 48, borderRadius: '50%', border: '1px solid rgba(99,102,241,0.3)',
                        background: 'rgba(99,102,241,0.1)', cursor: 'pointer', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <RotateCcw size={18} />
                    </button>
                    <button onClick={() => { requestNotification(); setRunning(!running); }} style={{
                        width: 72, height: 72, borderRadius: '50%', border: 'none',
                        background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`,
                        cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 4px 20px ${mode.color}55`, fontSize: '1.1rem'
                    }}>
                        {running ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 3 }} />}
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                {[
                    { label: 'Sessions', value: sessions, color: '#6366f1' },
                    { label: 'Focus Time', value: `${Math.floor(totalFocus / 60)}m`, color: '#10b981' },
                    { label: 'Until Long Break', value: `${4 - (sessions % 4) || 4} left`, color: '#f59e0b' }
                ].map(s => (
                    <div key={s.label} className="glass-card" style={{ padding: '1.1rem', textAlign: 'center' }}>
                        <p style={{ fontSize: '1.6rem', fontWeight: 800, color: s.color }}>{s.value}</p>
                        <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 3 }}>{s.label}</p>
                    </div>
                ))}
            </div>

            <p style={{ color: '#475569', fontSize: '0.75rem', textAlign: 'center', marginTop: '1rem' }}>
                💡 Tip: After every 4 focus sessions you'll get a 15-min long break automatically.
            </p>
        </div>
    );
};

export default PomodoroPage;
