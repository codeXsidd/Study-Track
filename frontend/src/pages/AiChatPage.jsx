import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Brain, Zap, Clock, MessageSquare, Target, Coffee, Layout, Calendar, Flame } from 'lucide-react';
import API, { aiChat } from '../services/api';
import toast from 'react-hot-toast';

const AiChatPage = () => {
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('study_chat_history');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch (e) {
                console.error("Failed to parse chat history", e);
            }
        }
        return [
            { id: '1', role: 'assistant', text: "Hello! I'm your AI Study Buddy. 🎓 Ready to tackle some tough concepts or just need a productivity boost?", timestamp: new Date() }
        ];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [insight, setInsight] = useState('Analyzing your study patterns to provide better suggestions...');
    const [showSidebar, setShowSidebar] = useState(false);
    const [metrics, setMetrics] = useState({ distraction: 'Low', load: 'Balanced', flow: '88%' });
    const [focusMode, setFocusMode] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchBriefing = async () => {
        setLoading(true);
        try {
            const res = await API.get('/ai/briefing');
            if (res.data.briefing) {
                const briefingMsg = {
                    id: Date.now().toString(),
                    role: 'assistant',
                    text: res.data.briefing,
                    timestamp: new Date()
                };
                setMessages(prev => [...prev, briefingMsg]);
            }
        } catch (e) {
            toast.error("Cloud not generate today's briefing.");
        }
        setLoading(false);
    };

    const fetchInsight = async () => {
        try {
            // Fetch insight and real metrics in parallel
            const [insightRes, metricsRes] = await Promise.all([
                API.get('/ai/insights'),
                API.get('/ai/metrics')
            ]);
            
            if (insightRes.data.insight) setInsight(insightRes.data.insight);
            if (metricsRes.data) {
                setMetrics({
                    distraction: metricsRes.data.distraction,
                    load: metricsRes.data.load,
                    flow: metricsRes.data.flow
                });
            }
        } catch (e) {
            console.error("Failed to fetch fresh AI activity data");
        }
    };

    useEffect(() => {
        fetchInsight();
    }, []);

    useEffect(() => {
        scrollToBottom();
        localStorage.setItem('study_chat_history', JSON.stringify(messages));
    }, [messages]);

    const handleSend = async (val = input) => {
        const text = val.trim();
        if (!text || loading) return;

        const userMsg = { id: Date.now().toString(), role: 'user', text: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);
        if (showSidebar) setShowSidebar(false); // Close sidebar on mobile when sending msg

        try {
            const context = messages.slice(-5).map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n');
            const res = await aiChat({ message: text, context });

            const aiMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: res.data.reply,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, aiMsg]);
        } catch (error) {
            toast.error("I'm having trouble connecting to my brain right now.");
            const errorMsg = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                text: "I'm currently having trouble connecting to my central brain. Let me try to help based on my local knowledge: Consistency is the key to mastering any subject. Try breaking your current focus into 15-minute sprints!",
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMsg]);
        }
        setLoading(false);
    };

    const clearChat = () => {
        if (window.confirm('Clear all conversation history?')) {
            setMessages([{ id: '1', role: 'assistant', text: "Chat cleared! What's on your mind now?", timestamp: new Date() }]);
            localStorage.removeItem('study_chat_history');
            toast.success('Conversation history cleared');
        }
    };

    const suggest = (text) => {
        setInput(text);
        handleSend(text);
    };

    const samplePrompts = [
        { title: "Explain a concept", text: "Explain the concept of 'Big O Notation' with a simple analogy.", icon: <Brain size={16} /> },
        { title: "Study Schedule", text: "Help me create a 4-hour deep work schedule for my upcoming exam.", icon: <Clock size={16} /> },
        { title: "Productivity", text: "What are the best techniques for maintaining a deep work state for 90 minutes?", icon: <Zap size={16} /> },
        { title: "Workspace", text: "How can I optimize my workspace to minimize distractions and maximize focus?", icon: <Target size={16} /> },
        { title: "Distraction Hack", text: "I'm getting distracted every 20 minutes! Help me enter a flow state.", icon: <Sparkles size={16} /> },
        { title: "Performance", text: "How can I measure and improve my cognitive performance during study sessions?", icon: <Bot size={16} /> },
        { title: "Exam Prep", text: "Create a strategic review plan for a comprehensive exam I have in 3 days.", icon: <MessageSquare size={16} /> }
    ];

    const topicsToExplore = ['Productivity', 'Workspace', 'Memory Hack', 'Deep Work', 'Exam Strategy'];

    return (
        <div className="page-container animate-fade-in chat-layout" style={{ display: 'flex', gap: '1.5rem', height: '100%', maxWidth: '1400px', margin: '0 auto', overflow: 'hidden', padding: '1rem', position: 'relative' }}>

            {/* Backdrop for mobile sidebar */}
            {showSidebar && (
                <div onClick={() => setShowSidebar(false)} style={{
                    position: 'fixed', inset: 0, background: 'rgba(5, 5, 20, 0.7)', backdropFilter: 'blur(8px)', zIndex: 150, transition: 'all 0.3s ease'
                }} className="mobile-backdrop"></div>
            )}

            {/* Sidebar / History */}
            <div className={`glass-card ai-sidebar \${showSidebar ? 'show' : ''}`} style={{ 
                width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '1.5rem', 
                background: 'rgba(10, 10, 25, 0.9)', border: '1px solid rgba(255, 255, 255, 0.08)',
                transition: 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
                boxShadow: '20px 0 50px rgba(0,0,0,0.3)',
                zIndex: 200
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                    <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Brain size={18} color="#818cf8" /> CURRENT INSIGHTS
                    </h3>
                    <button onClick={fetchInsight} className="refresh-btn" style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 4, display: 'flex' }}>
                        <Zap size={14} />
                    </button>
                </div>
                
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="hide-scrollbar">
                    {/* Deep Work State Indicator */}
                    <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))', border: '1px solid rgba(99,102,241,0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <p style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700 }}>DEEP WORK STATE</p>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', boxShadow: '0 0 10px #10b981' }}></div>
                        </div>
                        <p style={{ fontSize: '1.2rem', color: '#f8fafc', fontWeight: 800, marginBottom: 4 }}>Optimized</p>
                        <p style={{ fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.4 }}>{insight}</p>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <p style={{ fontSize: '0.7rem', color: '#475569', fontWeight: 800, textTransform: 'uppercase' }}>Focus Metrics</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Distraction Level</span>
                            <span style={{ fontSize: '0.8rem', color: '#f43f5e', fontWeight: 700 }}>{metrics.distraction}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                            <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Cognitive Load</span>
                            <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 700 }}>{metrics.load}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                            <span style={{ fontSize: '0.8rem', color: '#e2e8f0' }}>Flow Potential</span>
                            <span style={{ fontSize: '0.8rem', color: '#10b981', fontWeight: 700 }}>{metrics.flow}</span>
                        </div>
                    </div>

                    <div style={{ marginTop: '0.5rem' }}>
                        <h4 style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginBottom: '0.75rem' }}>TOPICS TO EXPLORE</h4>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                            {topicsToExplore.map(tag => (
                                <span 
                                    key={tag} 
                                    onClick={() => suggest(`How can I master ${tag} for my studies?`)}
                                    style={{ 
                                        padding: '0.3rem 0.6rem', borderRadius: '6px', background: 'rgba(255,255,255,0.03)', 
                                        border: '1px solid rgba(255,255,255,0.05)', fontSize: '0.65rem', color: '#cbd5e1', 
                                        fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' 
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                                >
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderRadius: '12px', background: focusMode ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.3s' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Flame size={16} color={focusMode ? '#818cf8' : '#64748b'} />
                            <span style={{ fontSize: '0.8rem', color: '#e2e8f0', fontWeight: 600 }}>Focus Mode</span>
                        </div>
                        <div 
                            onClick={() => setFocusMode(!focusMode)}
                            style={{ 
                                width: 36, height: 20, borderRadius: 20, background: focusMode ? '#6366f1' : 'rgba(255,255,255,0.1)', 
                                position: 'relative', cursor: 'pointer', transition: 'all 0.3s' 
                            }}
                        >
                            <div style={{ 
                                width: 14, height: 14, borderRadius: '50%', background: 'white', 
                                position: 'absolute', top: 3, left: focusMode ? 19 : 3, transition: 'all 0.3s' 
                            }}></div>
                        </div>
                    </div>

                    <button 
                        onClick={fetchBriefing}
                        disabled={loading}
                        style={{ 
                            width: '100%', padding: '0.75rem', borderRadius: '12px', background: 'rgba(129, 140, 248, 0.1)', 
                            border: '1px solid rgba(129, 140, 248, 0.2)', color: '#818cf8', fontSize: '0.75rem', 
                            fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 
                        }}
                    >
                        <Calendar size={14} /> Get Daily Briefing
                    </button>

                    <button onClick={clearChat} style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}>
                        <Trash2 size={14} /> Clear History
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden', transition: 'all 0.5s', opacity: focusMode ? 1 : 1 }}>

                {/* Chat Display */}
                <div className="glass-card chat-main-container" style={{ 
                    flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, 
                    background: focusMode ? 'rgba(5, 5, 10, 0.95)' : 'rgba(15,15,30,0.4)', 
                    border: focusMode ? '1px solid rgba(99,102,241,0.2)' : '1px solid rgba(255,255,255,0.05)',
                    boxShadow: focusMode ? '0 0 40px rgba(99,102,241,0.1)' : 'none',
                    transition: 'all 0.4s'
                }}>

                    {/* Header */}
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className={focusMode ? "pulse-glow" : "ai-icon-pulse"} style={{ background: focusMode ? 'linear-gradient(135deg, #10b981, #ef4444)' : 'linear-gradient(135deg, #10b981, #6366f1)', padding: '0.4rem', borderRadius: '10px', color: 'white' }}>
                                <Bot size={18} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: focusMode ? '#ef4444' : '#f8fafc' }}>
                                    {focusMode ? 'Focus Assistant' : 'AI Study Buddy'}
                                </h2>
                                <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>
                                    {focusMode ? 'Locked In' : 'Active Now'}
                                </span>
                            </div>
                        </div>
                        <button 
                            className="mobile-toggle-btn"
                            onClick={() => setShowSidebar(!showSidebar)}
                            style={{ 
                                display: 'none', background: 'rgba(129, 140, 248, 0.15)', border: '1px solid rgba(129, 140, 248, 0.3)', 
                                color: '#818cf8', padding: '0.6rem', borderRadius: '10px', cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <Layout size={20} />
                        </button>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="custom-scrollbar">
                        {messages.length < 2 && (
                            <div className="fade-in" style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                                <div style={{ background: 'rgba(99,102,241,0.02)', padding: '1.5rem', borderRadius: '24px', border: '1px dashed rgba(99,102,241,0.1)', maxWidth: '500px', margin: '0 auto' }}>
                                    <Sparkles size={32} color="#a78bfa" style={{ marginBottom: '0.75rem' }} />
                                    <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.4rem' }}>How can I help you today?</h3>
                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '1.25rem' }}>
                                        I can explain concepts, help you plan your studies, or give you a productivity boost.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.6rem' }}>
                                        {samplePrompts.slice(0, 4).map((p, i) => (
                                            <button key={i} onClick={() => suggest(p.text)} style={{
                                                padding: '0.6rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
                                                color: '#e2e8f0', fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                                            }}>
                                                <span style={{ color: '#818cf8' }}>{p.icon}</span> {p.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 30, height: 30, borderRadius: '8px', flexShrink: 0,
                                    background: msg.role === 'user' ? 'rgba(99,102,241,0.15)' : 'rgba(16,185,129,0.15)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {msg.role === 'user' ? <User size={14} color="#818cf8" /> : <Bot size={14} color="#10b981" />}
                                </div>
                                <div style={{
                                    maxWidth: '85%', padding: '0.75rem 1rem', borderRadius: '16px',
                                    background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(139,92,246,0.08))' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)'}`,
                                    borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                                    borderTopLeftRadius: msg.role === 'user' ? '16px' : '4px',
                                }}>
                                    <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    <p style={{ fontSize: '0.55rem', color: '#64748b', marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left', fontWeight: 600 }}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div style={{ width: 30, height: 30, borderRadius: '8px', background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={14} color="#10b981" />
                                </div>
                                <div style={{ padding: '0.6rem 1rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <div className="spinner-small" style={{ width: 12, height: 12, borderColor: 'rgba(16,185,129,0.1)', borderTopColor: '#10b981' }} />
                                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontStyle: 'italic' }}>Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '1rem', background: focusMode ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        
                        {/* Quick Actions Row */}
                        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1rem', overflowX: 'auto', paddingBottom: '0.4rem' }} className="hide-scrollbar">
                            <button onClick={fetchBriefing} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.9rem', borderRadius: '12px', background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)', color: '#818cf8', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                                <Calendar size={14} /> Daily Briefing
                            </button>
                            <button onClick={() => suggest("Help me plan a high-efficiency schedule for today based on my goals.")} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.9rem', borderRadius: '12px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                                <Layout size={14} /> Plan My Day
                            </button>
                            <button onClick={() => suggest("Summarize my most important recent study notes.")} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.9rem', borderRadius: '12px', background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                                <Coffee size={14} /> Summarize Notes
                            </button>
                            <button onClick={() => suggest("Analyze my current progress and identify areas for improvement.")} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '0.5rem 0.9rem', borderRadius: '12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>
                                <Target size={14} /> Status Check
                            </button>
                        </div>

                        {messages.length >= 2 && messages.length < 8 && (
                            <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', marginBottom: '0.75rem', paddingBottom: '0.25rem' }} className="hide-scrollbar">
                                {samplePrompts.slice(4).map((p, i) => (
                                    <button key={i} onClick={() => suggest(p.text)} style={{
                                        padding: '0.35rem 0.75rem', borderRadius: '20px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)',
                                        color: '#a78bfa', fontSize: '0.65rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap'
                                    }}>
                                        {p.icon} {p.title}
                                    </button>
                                ))}
                            </div>
                        )}
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.6rem' }}>
                            <input
                                className="input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about concepts, schedules, or focus..."
                                style={{ flex: 1, borderRadius: '12px', padding: '0.7rem 1.1rem', fontSize: '0.85rem' }}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="btn-primary"
                                style={{ width: 42, height: 42, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px', flexShrink: 0, background: 'linear-gradient(135deg, #10b981, #6366f1)', border: 'none' }}
                            >
                                <Send size={18} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 1000px) {
                    .ai-sidebar {
                        position: fixed !important;
                        left: -340px;
                        top: 0;
                        bottom: 0;
                        height: 100vh !important;
                        margin: 0 !important;
                        border-radius: 0 24px 24px 0 !important;
                    }
                    .ai-sidebar.show {
                        transform: translateX(340px) !important;
                    }
                    .mobile-backdrop { display: block !important; }
                    .mobile-toggle-btn { display: flex !important; }
                    .chat-layout { padding: 0.75rem !important; gap: 0 !important; }
                    .chat-main-container { border-radius: 20px !important; }
                }
                
                @media (max-width: 600px) {
                    .chat-layout { padding: 0.5rem !important; }
                    .chat-main-container { border-radius: 16px !important; }
                    .message-bubble { max-width: 92% !important; }
                }

                .refresh-btn:hover { color: #818cf8 !important; transform: rotate(30deg); }
                .refresh-btn:active { transform: scale(0.8); }

                @keyframes pulse-glow {
                    0% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); }
                    50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); }
                    100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); }
                }
                .pulse-glow { animation: pulse-glow 2s infinite; }
                
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.15); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.3); }

                .input:focus { border-color: #818cf8 !important; box-shadow: 0 0 15px rgba(129, 140, 248, 0.2) !important; }
            `}</style>
        </div>
    );
};

export default AiChatPage;
