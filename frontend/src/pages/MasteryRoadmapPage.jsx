import React, { useState } from 'react';
import { Compass, Sparkles, Search, ChevronRight, BookOpen, Zap, Target, Award, ArrowLeft, Loader2 } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';

const MasteryRoadmapPage = () => {
    const [topic, setTopic] = useState('');
    const [level, setLevel] = useState('Beginner');
    const [loading, setLoading] = useState(false);
    const [roadmapData, setRoadmapData] = useState(null);

    const generateRoadmap = async (e) => {
        if (e) e.preventDefault();
        if (!topic.trim()) return toast.error("Please enter a topic first!");

        setLoading(true);
        setRoadmapData(null);
        try {
            const res = await API.post('/ai/roadmap', { topic, level });
            setRoadmapData(res.data);
            toast.success("Roadmap Generated! Your journey begins now.");
        } catch (error) {
            toast.error("Failed to generate roadmap. Please try again.");
        }
        setLoading(false);
    };

    const suggestedTopics = ['Quantum Mechanics', 'React.js Mastery', 'Public Speaking', 'Financial Literacy', 'Advanced Calculus'];

    return (
        <div className="page-container animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
            
            {/* Header Section */}
            <div style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '1rem' }}>
                <div style={{ 
                    display: 'inline-flex', alignItems: 'center', justifyContent: 'center', 
                    width: 64, height: 64, borderRadius: '20px', 
                    background: 'linear-gradient(135deg, #6366f1, #ec4899)', 
                    color: 'white', marginBottom: '1.5rem', boxShadow: '0 10px 25px rgba(99,102,241,0.3)'
                }}>
                    <Compass size={32} />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem', letterSpacing: '-0.04em' }}>Mastery <span className="gradient-text">Roadmap</span></h1>
                <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto' }}>
                    Enter any complex topic and our AI will architect a high-intensity 7-day quest to help you master it.
                </p>
            </div>

            {/* Input Section */}
            {!roadmapData && (
                <div className="glass-card animate-slide-up" style={{ padding: '2.5rem', borderRadius: 24, background: 'rgba(15,15,30,0.6)', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <form onSubmit={generateRoadmap}>
                        <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
                            <input 
                                type="text" 
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="What do you want to master? (e.g. Deep Learning, Greek Mythology...)"
                                style={{ 
                                    width: '100%', padding: '1.25rem 1.5rem', paddingLeft: '3.5rem', 
                                    borderRadius: '16px', background: 'rgba(5, 5, 10, 0.4)', 
                                    border: '1px solid rgba(99,102,241,0.2)', color: 'white', fontSize: '1.1rem',
                                    outline: 'none', transition: 'all 0.3s'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#6366f1'}
                                onBlur={(e) => e.target.style.borderColor = 'rgba(99,102,241,0.2)'}
                            />
                            <Search size={22} color="#6366f1" style={{ position: 'absolute', left: 20, top: '50%', transform: 'translateY(-50%)' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                            {['Beginner', 'Intermediate', 'Advanced'].map((l) => (
                                <button 
                                    type="button"
                                    key={l}
                                    onClick={() => setLevel(l)}
                                    style={{ 
                                        padding: '0.6rem 1.25rem', borderRadius: '10px', 
                                        background: level === l ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.03)',
                                        border: `1px solid ${level === l ? '#6366f1' : 'rgba(255,255,255,0.08)'}`,
                                        color: level === l ? '#a78bfa' : '#94a3b8',
                                        fontSize: '0.85rem', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    {l}
                                </button>
                            ))}
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading || !topic.trim()}
                            className="btn-primary"
                            style={{ 
                                width: '100%', padding: '1.25rem', borderRadius: '16px', 
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', 
                                fontSize: '1rem', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10
                            }}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <><Sparkles size={20} /> Generate Mastery Quest</>}
                        </button>
                    </form>

                    <div style={{ marginTop: '2.5rem' }}>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 800, textTransform: 'uppercase', marginBottom: '1rem' }}>Trending Topics</p>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                            {suggestedTopics.map(t => (
                                <button 
                                    key={t}
                                    onClick={() => { setTopic(t); }}
                                    style={{ 
                                        padding: '0.5rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.05)', color: '#cbd5e1', fontSize: '0.8rem',
                                        cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
                                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Roadmap Display Section */}
            {roadmapData && (
                <div className="animate-fade-in">
                    <button 
                        onClick={() => setRoadmapData(null)}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: '2rem', fontSize: '0.9rem', fontWeight: 600 }}
                    >
                        <ArrowLeft size={16} /> Create another roadmap
                    </button>

                    <div className="glass-card" style={{ padding: '2.5rem', borderRadius: 24, background: 'rgba(10,10,25,0.8)', border: '1px solid rgba(99,102,241,0.2)', marginBottom: '2rem' }}>
                        <div style={{ marginBottom: '2.5rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '0.75rem' }}>
                                <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(99,102,241,0.15)', color: '#818cf8', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>7-Day Mastery Quest</span>
                                <span style={{ padding: '0.25rem 0.75rem', background: 'rgba(236,72,153,0.1)', color: '#ec4899', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase' }}>{level}</span>
                            </div>
                            <h2 style={{ fontSize: '2rem', fontWeight: 900, marginBottom: '1rem' }}>{roadmapData.topic}</h2>
                            <p style={{ color: '#cbd5e1', lineHeight: 1.6, fontSize: '1.05rem' }}>{roadmapData.overview}</p>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                            {/* The vertical timeline bar */}
                            <div style={{ position: 'absolute', left: '19px', top: '2rem', bottom: '2rem', width: '2px', background: 'linear-gradient(to bottom, #6366f1, #ec4899)', opacity: 0.3 }} />

                            {roadmapData.roadmap.map((day, idx) => (
                                <div key={idx} className="animate-slide-up" style={{ display: 'flex', gap: '1.5rem', animationDelay: `${idx * 0.1}s` }}>
                                    <div style={{ 
                                        width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(8,8,18,0.9)', 
                                        border: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: '#818cf8', fontWeight: 800, fontSize: '0.9rem', flexShrink: 0, zIndex: 1,
                                        boxShadow: '0 0 15px rgba(99,102,241,0.2)'
                                    }}>
                                        {day.day}
                                    </div>
                                    <div className="glass-card" style={{ flex: 1, padding: '1.5rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '16px' }}>
                                        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '1rem', marginBottom: '0.75rem' }}>
                                            <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <BookOpen size={18} color="#6366f1" /> Focus
                                            </h4>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#fbbf24', fontSize: '0.75rem', fontWeight: 800 }}>
                                                <Zap size={14} /> 1500 XP
                                            </div>
                                        </div>
                                        <p style={{ color: '#e2e8f0', marginBottom: '1.25rem', fontSize: '0.95rem', lineHeight: 1.5 }}>{day.focus}</p>
                                        
                                        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(236,72,153,0.05)', border: '1px dashed rgba(236,72,153,0.3)' }}>
                                            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: '#ec4899', textTransform: 'uppercase', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <Target size={14} /> Daily Challenge
                                            </p>
                                            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', fontStyle: 'italic' }}>{day.challenge}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '3rem', textAlign: 'center' }}>
                            <div style={{ 
                                display: 'inline-flex', alignItems: 'center', gap: 10, padding: '1rem 2rem', 
                                background: 'rgba(129,140,248,0.1)', border: '1px solid #818cf8', borderRadius: '16px',
                                color: '#818cf8', fontWeight: 800
                            }}>
                                <Award size={24} /> Completion Reward: Mastery Badge & 500 Bonus XP
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasteryRoadmapPage;
