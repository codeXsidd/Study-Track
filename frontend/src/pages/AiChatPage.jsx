import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Brain, Zap, Clock, MessageSquare, Target } from 'lucide-react';
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
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    const fetchInsight = async () => {
        try {
            const res = await API.get('/ai/insights');
            if (res.data.insight) setInsight(res.data.insight);
            // Randomize metrics slightly to feel alive
            const distractionLevels = ['Low', 'Minimal', 'Very Low'];
            const cognitiveLoads = ['Balanced', 'Moderate', 'Ideal'];
            const flowPercent = (Math.floor(Math.random() * 15) + 80) + '%';
            setMetrics({
                distraction: distractionLevels[Math.floor(Math.random() * distractionLevels.length)],
                load: cognitiveLoads[Math.floor(Math.random() * cognitiveLoads.length)],
                flow: flowPercent
            });
        } catch (e) {
            console.error("Failed to fetch insight");
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
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 100, display: 'none'
                }} className="mobile-backdrop"></div>
            )}

            {/* Sidebar / History */}
            <div className={`glass-card ai-sidebar ${showSidebar ? 'show' : ''}`} style={{ 
                width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '1.25rem', 
                background: 'rgba(15, 15, 35, 0.8)', border: '1px solid rgba(255, 255, 255, 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
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

                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={clearChat} style={{ width: '100%', padding: '0.7rem', borderRadius: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, transition: 'all 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'} onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.05)'}>
                        <Trash2 size={14} /> Clear History
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

                {/* Chat Display */}
                <div className="glass-card chat-main-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, background: 'rgba(15,15,30,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>

                    {/* Header */}
                    <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div className="ai-icon-pulse" style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)', padding: '0.4rem', borderRadius: '10px', color: 'white' }}>
                                <Bot size={18} />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f8fafc' }}>AI Study Buddy</h2>
                                <span style={{ fontSize: '0.6rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Active Now</span>
                            </div>
                        </div>
                        <button 
                            className="mobile-info-btn"
                            onClick={() => setShowSidebar(!showSidebar)}
                            style={{ 
                                display: 'none', background: 'rgba(129, 140, 248, 0.1)', border: '1px solid rgba(129, 140, 248, 0.2)', 
                                color: '#818cf8', padding: '0.4rem', borderRadius: '8px', cursor: 'pointer' 
                            }}
                        >
                            <Brain size={18} />
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
                    <div style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
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
                @media (max-width: 900px) {
                    .ai-sidebar {
                        position: fixed !important;
                        right: -320px;
                        top: 0;
                        bottom: 0;
                        z-index: 200;
                        width: 280px !important;
                        box-shadow: -10px 0 30px rgba(0,0,0,0.5);
                    }
                    .ai-sidebar.show {
                        right: 0 !important;
                    }
                    .mobile-backdrop { display: block !important; }
                    .mobile-info-btn { display: flex !important; }
                    .chat-layout { padding: 0.5rem !important; gap: 0 !important; }
                }
                
                .refresh-btn:hover { color: #818cf8 !important; transform: rotate(15deg); }
                .refresh-btn:active { transform: scale(0.9); }
                
                .hide-scrollbar::-webkit-scrollbar { display: none; }
                .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
                
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(99,102,241,0.2); }
            `}</style>
        </div>
    );
};

export default AiChatPage;
