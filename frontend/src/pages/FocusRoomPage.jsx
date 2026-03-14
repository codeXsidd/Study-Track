import React, { useState, useEffect, useRef } from 'react';
import { Timer, Play, Pause, Coffee, BookOpen, Clock, Zap, Target, Bot, Send, Layout } from 'lucide-react';
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

    const [priorityTask, setPriorityTask] = useState(null);
    const [loadingTask, setLoadingTask] = useState(true);

    const [chatMsg, setChatMsg] = useState('');
    const [chatLog, setChatLog] = useState(() => {
        const saved = localStorage.getItem('focus_room_chat');
        return saved ? JSON.parse(saved) : [
            { role: 'ai', text: 'Stuck? I am your AI study tutor. Ask me anything to clear your doubts!' }
        ];
    });
    const [chatting, setChatting] = useState(false);
    const chatEndRef = useRef(null);

    const scrollToChatBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        localStorage.setItem('focus_room_chat', JSON.stringify(chatLog));
        scrollToChatBottom();
    }, [chatLog]);

    useEffect(() => {
        const fetchTopTask = async () => {
            try {
                const res = await API.get('/todos');
                const todayTodos = res.data.filter(t => t.dayPlan && !t.completed);
                const sorted = todayTodos.sort((a, b) => {
                    const weight = { 'High': 3, 'Medium': 2, 'Low': 1 };
                    return weight[b.priority] - weight[a.priority];
                });
                if (sorted.length > 0) setPriorityTask(sorted[0]);
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
        setChatLog(prev => [...prev, { role: 'user', text: userText }]);
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
            addXP({ xpToAdd: 10 }).then(res => {
                const { xp, level, leveledUp } = res.data;
                updateUserXP(xp, level);
                if (leveledUp) toast.success(`🎉 Level Up! Level ${level}!`, { icon: '🏆' });
                else toast.success('+10 XP for focus!', { icon: '⚡' });
            }).catch(() => { });
            setModeIdx(1); setSeconds(MODES[1].time);
        } else {
            setModeIdx(0); setSeconds(MODES[0].time);
        }
    };

    const mins = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');

    return (
        <div style={{ minHeight: '100vh', margin: '-1.5rem', background: '#050510', position: 'relative', overflowX: 'hidden', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', opacity: 0.15, pointerEvents: 'none', zIndex: 0 }}>
                <iframe width="100%" height="100%" src="https://www.youtube.com/embed/jfKfPfyJRdk?autoplay=1&mute=1&controls=0&rel=0&loop=1&playlist=jfKfPfyJRdk" frameBorder="0" allow="autoplay; encrypted-media" style={{ transform: 'scale(1.5)' }}></iframe>
            </div>
            <div style={{ position: 'fixed', inset: 0, background: 'linear-gradient(to top, #050510 0%, transparent 100%), radial-gradient(circle at center, transparent 0%, #050510 80%)', zIndex: 1 }} />

            <div className="focus-room-header" style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', gap: 10, marginTop: '3rem', marginBottom: '2rem', opacity: 0.9 }}>
                <Zap size={24} color="#ec4899" />
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#e2e8f0' }}>Focus Room</h1>
            </div>

            <div className="focus-layout">
                {/* Timer Card */}
                <div className="focus-card">
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                        {MODES.map((m, i) => (
                            <button key={i} onClick={() => { setModeIdx(i); setSeconds(MODES[i].time); setRunning(false); }} style={{
                                background: modeIdx === i ? m.color : 'rgba(255,255,255,0.05)',
                                border: 'none', color: modeIdx === i ? 'white' : '#94a3b8',
                                padding: '0.4rem 0.8rem', borderRadius: 99, fontWeight: 700, fontSize: '0.7rem', cursor: 'pointer', transition: 'all 0.3s'
                            }}>
                                {m.label}
                            </button>
                        ))}
                    </div>
                    <div className="timer-display" style={{ textAlign: 'center', color: mode.color }}>{mins}:{secs}</div>
                    <button onClick={() => setRunning(!running)} style={{
                        width: 70, height: 70, borderRadius: '50%', border: 'none',
                        background: `linear-gradient(135deg, ${mode.color}, ${mode.color}cc)`,
                        cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        boxShadow: `0 10px 30px ${mode.color}44`, margin: '0 auto', transition: 'all 0.2s', transform: running ? 'scale(0.95)' : 'scale(1)'
                    }}>
                        {running ? <Pause size={28} /> : <Play size={28} style={{ marginLeft: 4 }} />}
                    </button>
                </div>

                {/* Task Card */}
                <div className="focus-card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1.5rem' }}>
                        <Target size={18} color="#f59e0b" /> Objective
                    </h2>
                    {loadingTask ? <p style={{ color: '#64748b' }}>Loading...</p> : priorityTask ? (
                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <span style={{ fontSize: '0.65rem', width: 'fit-content', padding: '0.2rem 0.5rem', background: 'rgba(239,68,68,0.15)', color: '#ef4444', borderRadius: 4, fontWeight: 700, textTransform: 'uppercase' }}>Focus on this</span>
                            <h3 style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.75rem 0', color: '#f8fafc' }}>{priorityTask.title}</h3>
                            <button onClick={markTaskDone} style={{
                                width: '100%', padding: '0.8rem', borderRadius: 12, border: '1px solid rgba(16,185,129,0.2)',
                                background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '0.9rem',
                                cursor: 'pointer', marginTop: '1rem'
                            }}>Done? (+15 XP)</button>
                        </div>
                    ) : <p style={{ color: '#64748b', textAlign: 'center', marginTop: 'auto', marginBottom: 'auto' }}>No pending tasks.</p>}
                </div>

                {/* AI Tutor Card */}
                <div className="focus-card">
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                        <Bot size={18} color="#a78bfa" /> AI Study Tutor
                    </h2>
                    <div className="chat-container custom-scroll">
                        {chatLog.map((log, idx) => (
                            <div key={idx} style={{ alignSelf: log.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%', background: log.role === 'user' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.03)', padding: '0.6rem 0.9rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                                <p style={{ fontSize: '0.8rem', color: '#e2e8f0', lineHeight: 1.4 }}>{log.text}</p>
                            </div>
                        ))}
                        {chatting && <p style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic' }}>Thinking...</p>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSendChat} style={{ display: 'flex', gap: '0.5rem' }}>
                        <input type="text" value={chatMsg} onChange={e => setChatMsg(e.target.value)} placeholder="Doubt?" style={{ flex: 1, padding: '0.7rem', borderRadius: 10, border: '1px solid rgba(167,139,250,0.15)', background: 'rgba(0,0,0,0.3)', color: 'white', fontSize: '0.85rem' }} />
                        <button type="submit" disabled={chatting || !chatMsg.trim()} style={{ background: '#a78bfa', border: 'none', width: 38, borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Send size={16} /></button>
                    </form>
                </div>
            </div>

            <style>{`
                .focus-layout {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 1.5rem;
                    width: 100%;
                    max-width: 1200px;
                    padding: 1.5rem;
                    z-index: 10;
                    margin-bottom: 5rem;
                }
                .focus-card {
                    padding: 2rem;
                    border-radius: 24px;
                    flex: 1;
                    min-width: 300px;
                    background: rgba(10,10,25,0.7);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.08);
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                }
                .timer-display {
                    font-size: clamp(3rem, 10vw, 5rem);
                    font-weight: 900;
                    letter-spacing: -3px;
                    margin-bottom: 1.5rem;
                    font-variant-numeric: tabular-nums;
                }
                .chat-container {
                    flex: 1;
                    overflow-y: auto;
                    display: flex;
                    flex-direction: column;
                    gap: 0.75rem;
                    margin-bottom: 1rem;
                    max-height: 250px;
                }
                @media (max-width: 1024px) {
                    .focus-card { min-width: 100%; }
                }
                .custom-scroll::-webkit-scrollbar { width: 4px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(167,139,250,0.2); border-radius: 10px; }
            `}</style>
        </div>
    );
};

export default FocusRoomPage;
