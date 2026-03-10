import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, Coffee, BookOpen, Clock, Zap, Target, Bot, Send } from 'lucide-react';
import API, { addXP, aiChat } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const MODES = [
    { label: 'Deep Focus', time: 25 * 60, color: '#ec4899', icon: <BookOpen size={18} /> },
    { label: 'Short Break', time: 5 * 60, color: '#10b981', icon: <Coffee size={18} /> },
];

const FocusRoomPage = () => {
    const { updateUserXP } = useAuth();
    const [modeIdx, setModeIdx] = useState(0);
    const [seconds, setSeconds] = useState(MODES[0].time);
    const [running, setRunning] = useState(false);
    const intervalRef = useRef(null);
    const mode = MODES[modeIdx];

    // Priority Task Loader
    const [priorityTask, setPriorityTask] = useState(null);
    const [loadingTask, setLoadingTask] = useState(true);

    // AI Tutor Chat
    const [chatMsg, setChatMsg] = useState('');
    const [chatLog, setChatLog] = useState([{ role: 'ai', text: 'Stuck? I am your AI study tutor. Ask me anything to clear your doubts without leaving the focus room!' }]);
    const [chatting, setChatting] = useState(false);

    useEffect(() => {
        const fetchTopTask = async () => {
            try {
                const res = await API.get('/todos');
                const todayTodos = res.data.filter(t => t.dayPlan && !t.completed);
                // Sort to find the highest priority task (High > Medium > Low)
                const sorted = todayTodos.sort((a, b) => {
                    const weight = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    return weight[b.priority] - weight[a.priority];
                });
                if (sorted.length > 0) {
                    setPriorityTask(sorted[0]);
                }
            } catch (error) {
                console.error("Failed to load top task", error);
            } finally {
                setLoadingTask(false);
            }
        };
        fetchTopTask();
    }, []);

    const markTaskDone = async () => {
        if (!priorityTask) return;
        try {
            await API.put(`/todos/${priorityTask._id}`, { completed: true, dayPlan: false });
            toast.success('Task Completed! +15 XP', { icon: '🎯' });
            setPriorityTask(null);

            // Add XP
            addXP({ xpToAdd: 15 }).then(res => {
                const { xp, level, leveledUp } = res.data;
                updateUserXP(xp, level);
                if (leveledUp) toast.success(`🎉 Level Up! You are now Level ${level}!`, { icon: '🏆' });
            }).catch(() => { });
        } catch { }
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatMsg.trim()) return;
        setChatting(true);
        const userText = chatMsg.trim();
        setChatLog([...chatLog, { role: 'user', text: userText }]);
        setChatMsg('');

        try {
            const context = priorityTask ? `The student is currently working on: ${priorityTask.title}` : '';
            const res = await aiChat({ message: userText, context });
            setChatLog(prev => [...prev, { role: 'ai', text: res.data.reply }]);
        } catch (error) {
            toast.error("AI couldn't respond.");
        }
        setChatting(false);
    };

    // Timer Logic
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
            // Gamification: 10 XP per focus session
            addXP({ xpToAdd: 10 }).then(res => {
                const { xp, level, leveledUp } = res.data;
                updateUserXP(xp, level);
                if (leveledUp) {
                    toast.success(`🎉 Level Up! You are now Level ${level}!`, { icon: '🏆' });
                } else {
                    toast.success('+10 XP for deep focus!', { icon: '⚡' });
                }
            }).catch(() => { });

            setModeIdx(1);
            setSeconds(MODES[1].time);
        } else {
            setModeIdx(0);
            setSeconds(MODES[0].time);
        }
    };

    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');

    return (
        <div style={{ height: 'calc(100vh - 40px)', margin: '-1.5rem', background: '#050510', position: 'relative', overflow: 'hidden' }}>
            {/* Ambient Background - Lofi video iframe (No controls, looping) */}
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.2, pointerEvents: 'none', zIndex: 0 }}>
                {/* Embedded Lofi Girl Radio or Similar */}
                <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=0&controls=0&showinfo=0&rel=0&loop=1&playlist=jfKfPfyJRdk"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    style={{ transform: 'scale(1.5)' }}
                ></iframe>
            </div>

            {/* Gradient Overlay */}
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, #050510 0%, transparent 100%)', zIndex: 1 }} />
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at center, transparent 0%, #050510 80%)', zIndex: 1 }} />

            {/* Main Content */}
            <div style={{ position: 'relative', zIndex: 10, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '3rem', opacity: 0.8 }}>
                    <Zap size={24} color="#ec4899" />
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e2e8f0' }}>Deep Focus Room</h1>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '2rem', width: '100%', maxWidth: 900 }}>

                    {/* Timer Panel */}
                    <div className="glass-card fade-up" style={{ padding: '3rem', borderRadius: 24, textAlign: 'center', flex: 1, minWidth: 320, background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                            {MODES.map((m, i) => (
                                <button key={i} onClick={() => { setModeIdx(i); setSeconds(MODES[i].time); setRunning(false); }} style={{
                                    background: modeIdx === i ? m.color : 'transparent',
                                    border: modeIdx === i ? 'none' : '1px solid rgba(255,255,255,0.1)',
                                    color: modeIdx === i ? 'white' : '#94a3b8',
                                    padding: '0.5rem 1rem', borderRadius: 99, fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.3s'
                                }}>
                                    {m.label}
                                </button>
                            ))}
                        </div>

                        <div style={{ fontSize: '6rem', fontWeight: 900, letterSpacing: '-4px', margin: '0 0 2rem 0', color: mode.color, textShadow: `0 0 40px ${mode.color}44`, fontVariantNumeric: 'tabular-nums' }}>
                            {mins}:{secs}
                        </div>

                        <button onClick={() => setRunning(!running)} style={{
                            width: 80, height: 80, borderRadius: '50%', border: 'none',
                            background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`,
                            cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: `0 10px 30px ${mode.color}66`, margin: '0 auto', transition: 'transform 0.2s', transform: running ? 'scale(0.95)' : 'scale(1)'
                        }}>
                            {running ? <Pause size={32} /> : <Play size={32} style={{ marginLeft: 4 }} />}
                        </button>
                    </div>

                    {/* Active Task Panel */}
                    <div className="glass-card fade-up" style={{ padding: '2.5rem', borderRadius: 24, flex: 1, minWidth: 320, background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '2rem' }}>
                            <Target size={20} color="#f59e0b" /> Current Objective
                        </h2>

                        {loadingTask ? (
                            <p style={{ color: '#64748b' }}>Loading priority task...</p>
                        ) : priorityTask ? (
                            <div style={{ marginTop: 'auto', marginBottom: 'auto' }}>
                                <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.6rem', background: 'rgba(239,68,68,0.2)', color: '#ef4444', borderRadius: 6, fontWeight: 700, textTransform: 'uppercase' }}>Highest Priority</span>
                                <h3 style={{ fontSize: '1.8rem', fontWeight: 700, margin: '1rem 0 0.5rem 0', lineHeight: 1.2 }}>{priorityTask.title}</h3>
                                {priorityTask.description && <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '2rem', lineHeight: 1.5 }}>{priorityTask.description}</p>}

                                <button onClick={markTaskDone} style={{
                                    width: '100%', padding: '1rem', borderRadius: 12, border: '1px solid rgba(16,185,129,0.3)',
                                    background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '1rem',
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'all 0.2s'
                                }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}>
                                    Mark as Complete <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>(+15 XP)</span>
                                </button>
                            </div>
                        ) : (
                            <div style={{ marginTop: 'auto', marginBottom: 'auto', textAlign: 'center' }}>
                                <Target size={48} color="#475569" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                                <h3 style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '0.5rem' }}>No pending plan for today.</h3>
                                <p style={{ color: '#64748b', fontSize: '0.85rem' }}>Set your tasks in the Daily Planner, or just focus freely!</p>
                            </div>
                        )}
                    </div>

                    {/* AI Tutor Chat Panel */}
                    <div className="glass-card fade-up" style={{ padding: '2.5rem', borderRadius: 24, flex: 1, minWidth: 320, background: 'rgba(10,10,20,0.6)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
                            <Bot size={20} color="#a78bfa" /> AI Study Tutor
                        </h2>

                        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1rem', paddingRight: '0.5rem', maxHeight: 220 }} className="custom-scroll">
                            {chatLog.map((log, idx) => (
                                <div key={idx} style={{ alignSelf: log.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '90%', background: log.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)', padding: '0.75rem 1rem', borderRadius: log.role === 'user' ? '16px 16px 0 16px' : '16px 16px 16px 0', border: '1px solid rgba(255,255,255,0.05)' }}>
                                    <p style={{ fontSize: '0.85rem', color: log.role === 'user' ? '#e2e8f0' : '#a78bfa', lineHeight: 1.5 }}>
                                        {log.text}
                                    </p>
                                </div>
                            ))}
                            {chatting && (
                                <div style={{ alignSelf: 'flex-start', background: 'rgba(255,255,255,0.05)', padding: '0.5rem 1rem', borderRadius: '16px 16px 16px 0' }}>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Thinking...</p>
                                </div>
                            )}
                        </div>

                        <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                            <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Ask anything..." style={{ flex: 1, padding: '0.8rem 1rem', borderRadius: 12, border: '1px solid rgba(167,139,250,0.2)', background: 'rgba(15,15,26,0.5)', color: 'white', fontSize: '0.9rem' }} />
                            <button type="submit" disabled={chatting || !chatMsg.trim()} style={{ background: '#a78bfa', border: 'none', color: '#1a1a2e', width: 42, borderRadius: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Send size={18} />
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default FocusRoomPage;
