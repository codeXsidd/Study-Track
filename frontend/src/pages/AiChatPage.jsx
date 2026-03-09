import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Brain, Zap, Clock, MessageSquare, ChevronRight, BookOpen, AlertCircle } from 'lucide-react';
import { aiChat } from '../services/api';
import toast from 'react-hot-toast';

const AiChatPage = () => {
    const [messages, setMessages] = useState(() => {
        const saved = localStorage.getItem('study_chat_history');
        return saved ? JSON.parse(saved) : [
            { id: '1', role: 'assistant', text: "Hello! I'm your AI Study Buddy. 🎓 Ready to tackle some tough concepts or just need a productivity boost?", timestamp: new Date() }
        ];
    });
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
        localStorage.setItem('study_chat_history', JSON.stringify(messages));
    }, [messages]);

    const handleSend = async (e) => {
        e?.preventDefault();
        if (!input.trim() || loading) return;

        const userMsg = { id: Date.now().toString(), role: 'user', text: input.trim(), timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const context = messages.slice(-5).map(m => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.text}`).join('\n');
            const res = await aiChat({ message: input.trim(), context });

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
                text: "I'm currently in a mental fog (connection issue). Could you try again in a second? Consistency is the key to mastery!",
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

    const suggestionChips = [
        "Explain Quantum Physics simply",
        "How to prepare for Semester 2?",
        "Give me a study plan for DSA",
        "Motivate me to study for 2 hours"
    ];

    return (
        <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxWidth: '1000px', margin: '0 auto' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexShrink: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div className="ai-icon-pulse" style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)', padding: '0.6rem', borderRadius: '12px', color: 'white' }}>
                        <Bot size={24} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: 2 }}>AI Study Buddy</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981' }} />
                            <span style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>Always Brainstorming</span>
                        </div>
                    </div>
                </div>
                <button
                    onClick={clearChat}
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', padding: '0.5rem 0.8rem', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.1)'}
                >
                    <Trash2 size={14} /> Clear History
                </button>
            </div>

            {/* Chat Area */}
            <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, border: '1px solid rgba(99,102,241,0.15)', background: 'rgba(15,15,30,0.4)', borderRadius: '20px' }}>
                <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="custom-scrollbar">
                    {messages.map((msg) => (
                        <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                            <div style={{
                                width: 34, height: 34, borderRadius: '10px', flexShrink: 0,
                                background: msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                                border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.3)'}`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {msg.role === 'user' ? <User size={18} color="#818cf8" /> : <Bot size={18} color="#10b981" />}
                            </div>
                            <div style={{
                                maxWidth: '80%', padding: '1rem', borderRadius: '16px',
                                background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(99,102,241,0.1), rgba(139,92,246,0.1))' : 'rgba(255,255,255,0.03)',
                                border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)'}`,
                                borderTopRightRadius: msg.role === 'user' ? '4px' : '16px',
                                borderTopLeftRadius: msg.role === 'user' ? '16px' : '4px',
                            }}>
                                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                <p style={{ fontSize: '0.62rem', color: '#64748b', marginTop: 8, textAlign: msg.role === 'user' ? 'right' : 'left', fontWeight: 600 }}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </div>
                    ))}
                    {loading && (
                        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                            <div style={{ width: 34, height: 34, borderRadius: '10px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Bot size={18} color="#10b981" />
                            </div>
                            <div style={{ padding: '0.75rem 1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <div className="spinner-small" style={{ borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10b981' }} />
                                <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>AI is thinking...</span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Suggestions Row */}
                {!loading && messages.length < 4 && (
                    <div style={{ padding: '0 1.5rem 1rem', display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                        {suggestionChips.map(s => (
                            <button
                                key={s}
                                onClick={() => { setInput(s); handleSend(); }}
                                style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', color: '#a78bfa', padding: '0.4rem 0.8rem', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
                                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.15)'; e.currentTarget.style.borderColor = '#a78bfa'; }}
                                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(99,102,241,0.08)'; e.currentTarget.style.borderColor = 'rgba(99,102,241,0.2)'; }}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                )}

                {/* Input Area */}
                <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
                        <input
                            className="input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask me anything about your studies..."
                            style={{ flex: 1, borderRadius: '14px', padding: '0.75rem 1.25rem' }}
                            disabled={loading}
                        />
                        <button
                            type="submit"
                            disabled={loading || !input.trim()}
                            className="btn-primary"
                            style={{ width: 44, height: 44, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', flexShrink: 0 }}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                    <p style={{ fontSize: '0.6rem', color: '#475569', textAlign: 'center', marginTop: 10, letterSpacing: '0.02em', fontWeight: 500 }}>
                        Powered by Google Gemini · Tips: Be specific for better answers!
                    </p>
                </div>
            </div>

            {/* Quick Actions Footer */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginTop: '1.5rem', flexShrink: 0 }}>
                {[
                    { label: 'Summarize Text', icon: <MessageSquare size={16} />, color: '#10b981' },
                    { label: 'Study Planner', icon: <Clock size={16} />, color: '#f59e0b' },
                    { label: 'Key Concepts', icon: <Brain size={16} />, color: '#8b5cf6' },
                    { label: 'Exam Focus', icon: <Zap size={16} />, color: '#ec4899' }
                ].map((item, idx) => (
                    <div key={idx} style={{
                        display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', transition: 'all 0.2s', cursor: 'default'
                    }} onMouseEnter={e => e.currentTarget.style.borderColor = `${item.color}33`}>
                        <div style={{ color: item.color }}>{item.icon}</div>
                        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8' }}>{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AiChatPage;
