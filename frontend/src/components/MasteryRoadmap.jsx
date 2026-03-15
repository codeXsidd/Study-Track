import React, { useState } from 'react';
import { generateMasteryRoadmap } from '../services/api';
import toast from 'react-hot-toast';
import { Map, MapPin, Route, Loader, BookOpen, Star } from 'lucide-react';

const MasteryRoadmap = () => {
    const [topic, setTopic] = useState('');
    const [timeframe, setTimeframe] = useState('7 days');
    const [loading, setLoading] = useState(false);
    const [roadmap, setRoadmap] = useState(null);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) return;
        
        setLoading(true);
        setRoadmap(null);
        try {
            const res = await generateMasteryRoadmap({ topic, timeframe });
            setRoadmap(res.data);
            toast.success("Mastery roadmap generated!");
        } catch (error) {
            toast.error("Failed to map the journey. Try again.");
        }
        setLoading(false);
    };

    return (
        <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(6,182,212,0.05), rgba(59,130,246,0.05))', border: '1px solid rgba(6,182,212,0.15)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <Map size={24} color="#06b6d4" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(to right, #06b6d4, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AI Mastery Roadmap
                </h3>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Struggling with a complex topic? Generate a day-by-day learning plan to master any subject efficiently.
            </p>

            <form onSubmit={handleGenerate} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div style={{ flex: 2, minWidth: '200px' }}>
                    <input
                        className="input"
                        placeholder="E.g., Quantum Mechanics, React Hooks..."
                        style={{ padding: '0.8rem 1rem', width: '100%', background: 'rgba(15,15,26,0.8)' }}
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                    />
                </div>
                <div style={{ flex: 1, minWidth: '120px' }}>
                    <select className="input" style={{ width: '100%', padding: '0.8rem', background: 'rgba(15,15,26,0.8)', cursor: 'pointer' }} value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
                        <option value="3 days">3 Days</option>
                        <option value="7 days">7 Days</option>
                        <option value="14 days">14 Days</option>
                        <option value="30 days">30 Days</option>
                    </select>
                </div>
                <button 
                    type="submit" 
                    disabled={loading || !topic.trim()}
                    className="btn-primary" 
                    style={{ padding: '0 1.5rem', background: 'linear-gradient(135deg, #06b6d4, #3b82f6)', border: 'none', display: 'flex', alignItems: 'center', gap: 8, height: '44px' }}
                >
                    {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Route size={18} />}
                    <span style={{ fontWeight: 600 }}>Map It</span>
                </button>
            </form>

            {roadmap && (
                <div className="fade-up" style={{ marginTop: '2rem' }}>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>
                        Roadmap to Mastery: {roadmap.topic}
                    </h4>

                    <div style={{ position: 'relative', paddingLeft: '2rem', borderLeft: '2px dashed rgba(6,182,212,0.3)' }}>
                        {roadmap.milestones.map((milestone, idx) => (
                            <div key={idx} style={{ position: 'relative', marginBottom: '1.5rem' }}>
                                <div style={{ 
                                    position: 'absolute', left: '-2.65rem', top: 0, 
                                    width: 20, height: 20, borderRadius: '50%', 
                                    background: '#06b6d4', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 10px rgba(6,182,212,0.5)'
                                }}>
                                    <MapPin size={12} color="#1a1a2e" />
                                </div>
                                <div className="glass-card" style={{ padding: '1rem', background: 'rgba(6,182,212,0.05)', border: '1px solid rgba(6,182,212,0.2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                                        <h5 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'white', margin: 0 }}>
                                            Day {milestone.day}: {milestone.title}
                                        </h5>
                                        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#06b6d4', background: 'rgba(6,182,212,0.1)', padding: '4px 8px', borderRadius: 4 }}>
                                            {milestone.timeRecommendation}
                                        </span>
                                    </div>
                                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginTop: '0.5rem', lineHeight: 1.5 }}>
                                        {milestone.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                        
                        <div style={{ position: 'relative', marginTop: '2rem' }}>
                            <div style={{ 
                                position: 'absolute', left: '-2.7rem', top: 0, 
                                width: 24, height: 24, borderRadius: '50%', 
                                background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 0 15px rgba(245,158,11,0.5)'
                            }}>
                                <Star size={14} color="#1a1a2e" fill="#1a1a2e" />
                            </div>
                            <div className="glass-card glow-anim" style={{ padding: '1.25rem', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.3)' }}>
                                <h5 style={{ fontSize: '1rem', fontWeight: 800, color: '#fbbf24', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <BookOpen size={16} /> Final Mastery Project
                                </h5>
                                <p style={{ fontSize: '0.9rem', color: '#fef3c7', lineHeight: 1.5 }}>
                                    {roadmap.masteryProject}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MasteryRoadmap;
