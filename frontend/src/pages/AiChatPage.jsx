import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Sparkles, Trash2, Brain, Zap, Clock, MessageSquare, Target } from 'lucide-react';
import { aiChat } from '../services/api';
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
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

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
        { title: "Explain a concept", text: "Explain the concept of 'Big O Notation' with a real-world analogy.", icon: <Brain size={16} /> },
        { title: "Study Schedule", text: "I have 3 hours. Help me plan a study session for Math and Physics.", icon: <Clock size={16} /> },
        { title: "Motivation", text: "Give me some motivation. I've been studying for 4 hours and feeling tired.", icon: <Zap size={16} /> },
        { title: "Exam Prep", text: "How should I prepare for a multiple-choice exam coming up next week?", icon: <Target size={16} /> }
    ];

    return (
        <div className="page-container animate-fade-in" style={{ display: 'flex', gap: '1.5rem', height: '100%', maxWidth: '1400px', margin: '0 auto', overflow: 'hidden', padding: '1rem' }}>

            {/* Sidebar / History (Desktop only) */}
            <div className="glass-card hide-mobile" style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <MessageSquare size={16} /> AI Activity
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }} className="hide-scrollbar">
                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.1)' }}>
                        <p style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 700, marginBottom: 4 }}>CURRENT STATUS</p>
                        <p style={{ fontSize: '0.82rem', color: '#e2e8f0', lineHeight: 1.4 }}>Analyzing your study patterns to provide better suggestions.</p>
                    </div>
                    <div>
                        <p style={{ fontSize: '0.7rem', color: '#475569', textAlign: 'center', marginTop: '1rem', fontStyle: 'italic' }}>More tools coming soon!</p>
                    </div>
                </div>
                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <button onClick={clearChat} style={{ width: '100%', padding: '0.6rem', borderRadius: '10px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.1)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Trash2 size={14} /> Clear History
                    </button>
                </div>
            </div>

            {/* Main Chat Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>

                {/* Chat Display */}
                <div className="glass-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, background: 'rgba(15,15,30,0.4)', border: '1px solid rgba(255,255,255,0.05)' }}>

                    {/* Header */}
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', gap: 12, background: 'rgba(0,0,0,0.2)' }}>
                        <div className="ai-icon-pulse" style={{ background: 'linear-gradient(135deg, #10b981, #6366f1)', padding: '0.5rem', borderRadius: '10px', color: 'white' }}>
                            <Bot size={20} />
                        </div>
                        <div>
                            <h2 style={{ fontSize: '1rem', fontWeight: 800, color: '#f8fafc' }}>AI Study Buddy</h2>
                            <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase' }}>Active Now</span>
                        </div>
                    </div>

                    {/* Messages */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="custom-scrollbar">
                        {messages.length < 2 && (
                            <div className="fade-in" style={{ textAlign: 'center', padding: '2rem 0' }}>
                                <div style={{ background: 'rgba(99,102,241,0.05)', padding: '2rem', borderRadius: '24px', border: '1px dashed rgba(99,102,241,0.2)', maxWidth: '500px', margin: '0 auto' }}>
                                    <Sparkles size={40} color="#a78bfa" style={{ marginBottom: '1rem' }} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem' }}>How can I help you today?</h3>
                                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                                        I can explain complex topics, help you plan your studies, or just give you a productivity boost when you're feeling stuck.
                                    </p>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                                        {samplePrompts.slice(0, 2).map((p, i) => (
                                            <button key={i} onClick={() => suggest(p.text)} style={{
                                                padding: '0.75rem', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                                                color: '#e2e8f0', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 8, transition: 'all 0.2s'
                                            }}>
                                                {p.icon} {p.title}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {messages.map((msg) => (
                            <div key={msg.id} style={{ display: 'flex', gap: '0.75rem', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', alignItems: 'flex-start' }}>
                                <div style={{
                                    width: 32, height: 32, borderRadius: '8px', flexShrink: 0,
                                    background: msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(16,185,129,0.2)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.3)' : 'rgba(16,185,129,0.3)'}`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                }}>
                                    {msg.role === 'user' ? <User size={16} color="#818cf8" /> : <Bot size={16} color="#10b981" />}
                                </div>
                                <div style={{
                                    maxWidth: '85%', padding: '0.85rem 1.1rem', borderRadius: '18px',
                                    background: msg.role === 'user' ? 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))' : 'rgba(255,255,255,0.04)',
                                    border: `1px solid ${msg.role === 'user' ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.08)'}`,
                                    borderTopRightRadius: msg.role === 'user' ? '4px' : '18px',
                                    borderTopLeftRadius: msg.role === 'user' ? '18px' : '4px',
                                }}>
                                    <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                                    <p style={{ fontSize: '0.6rem', color: '#64748b', marginTop: 6, textAlign: msg.role === 'user' ? 'right' : 'left', fontWeight: 600 }}>
                                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '8px', background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Bot size={16} color="#10b981" />
                                </div>
                                <div style={{ padding: '0.75rem 1.25rem', borderRadius: '18px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <div className="spinner-small" style={{ borderColor: 'rgba(16,185,129,0.2)', borderTopColor: '#10b981' }} />
                                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', fontStyle: 'italic' }}>Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.25)', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        {messages.length >= 2 && messages.length < 6 && (
                            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {samplePrompts.slice(2).map((p, i) => (
                                    <button key={i} onClick={() => suggest(p.text)} style={{
                                        padding: '0.4rem 0.8rem', borderRadius: '20px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
                                        color: '#a78bfa', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s'
                                    }}>
                                        {p.icon} {p.title}
                                    </button>
                                ))}
                            </div>
                        )}
                        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} style={{ display: 'flex', gap: '0.75rem' }}>
                            <input
                                className="input"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Message your study buddy..."
                                style={{ flex: 1, borderRadius: '14px', padding: '0.8rem 1.25rem', fontSize: '0.92rem' }}
                                disabled={loading}
                            />
                            <button
                                type="submit"
                                disabled={loading || !input.trim()}
                                className="btn-primary"
                                style={{ width: 46, height: 46, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '14px', flexShrink: 0, background: 'linear-gradient(135deg, #10b981, #6366f1)', border: 'none' }}
                            >
                                <Send size={20} />
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .hide-mobile { display: none !important; }
                }
            `}</style>
        </div>
    );
};

export default AiChatPage;
