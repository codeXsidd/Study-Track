import React, { useState } from 'react';
import { simulateProcrastination } from '../services/api';
import toast from 'react-hot-toast';
import { EyeOff, AlertTriangle, FastForward, Loader, ArrowRight, Skull, Zap, Play } from 'lucide-react';

const ProcrastinationSimulator = ({ defaultTask = "" }) => {
    const [task, setTask] = useState(defaultTask);
    const [loading, setLoading] = useState(false);
    const [timeline, setTimeline] = useState(null);

    const handleSimulate = async (e) => {
        e.preventDefault();
        if (!task.trim()) return;
        
        setLoading(true);
        setTimeline(null);
        try {
            const res = await simulateProcrastination({ taskTitle: task });
            setTimeline(res.data);
            toast.success("Simulation complete. The future looks grim.", { icon: '🔮' });
        } catch (error) {
            toast.error("The AI simulator malfunctioned. Try again.");
        }
        setLoading(false);
    };

    return (
        <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(239,68,68,0.05), rgba(185,28,28,0.1))', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <EyeOff size={24} color="#ef4444" />
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, background: 'linear-gradient(to right, #ef4444, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AI Procrastination Simulator
                </h3>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                Thinking about skipping a study session? Enter the task below to see the terrifying "Butterfly Effect" of your procrastination.
            </p>

            <form onSubmit={handleSimulate} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, minWidth: '200px' }}>
                    <input
                        className="input"
                        placeholder="E.g., Finish Chapter 4, Start the CS Project..."
                        style={{ padding: '0.8rem 1rem', width: '100%', background: 'rgba(15,15,26,0.8)' }}
                        value={task}
                        onChange={(e) => setTask(e.target.value)}
                    />
                </div>
                <button 
                    type="submit" 
                    disabled={loading || !task.trim()}
                    className="btn-danger" 
                    style={{ padding: '0 1.5rem', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: 'white', border: '1px solid #ef4444', display: 'flex', alignItems: 'center', gap: 8, height: '44px' }}
                >
                    {loading ? <Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <FastForward size={18} />}
                    <span style={{ fontWeight: 700 }}>Simulate Skipping</span>
                </button>
            </form>

            {loading && (
                <div style={{ padding: '2rem', textAlign: 'center', animation: 'pulse 1.5s infinite' }}>
                    <AlertTriangle size={32} color="#ef4444" style={{ margin: '0 auto 10px' }} />
                    <p style={{ color: '#fca5a5', fontSize: '0.9rem', fontWeight: 600 }}>Calculating Timeline Collapse...</p>
                </div>
            )}

            {timeline && !loading && (
                <div className="fade-up" style={{ marginTop: '2rem' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#fca5a5', marginBottom: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        The Butterfly Effect
                    </h4>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {/* 1 Week */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
                            <div style={{ width: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', border: '2px solid #ef4444', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ef4444', fontWeight: 800, fontSize: '0.7rem' }}>1W</div>
                                <div style={{ width: '2px', flex: 1, background: 'linear-gradient(180deg, #ef4444, #f59e0b)', margin: '4px 0' }} />
                            </div>
                            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid #ef4444', marginBottom: '0.5rem' }}>
                                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>{timeline.oneWeek}</p>
                            </div>
                        </div>

                        {/* 1 Month */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
                            <div style={{ width: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(245,158,11,0.2)', border: '2px solid #f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b', fontWeight: 800, fontSize: '0.7rem' }}>1M</div>
                                <div style={{ width: '2px', flex: 1, background: 'linear-gradient(180deg, #f59e0b, #6366f1)', margin: '4px 0' }} />
                            </div>
                            <div style={{ flex: 1, background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '12px', borderLeft: '3px solid #f59e0b', marginBottom: '0.5rem' }}>
                                <p style={{ fontSize: '0.85rem', color: '#e2e8f0', lineHeight: 1.5 }}>{timeline.oneMonth}</p>
                            </div>
                        </div>

                        {/* 1 Year */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'stretch' }}>
                            <div style={{ width: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(99,102,241,0.2)', border: '2px solid #6366f1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8', fontWeight: 800, fontSize: '0.7rem' }}>1Y</div>
                            </div>
                            <div className="glow-anim" style={{ flex: 1, background: 'rgba(99,102,241,0.1)', padding: '1.25rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.3)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: '0.5rem' }}>
                                    <Skull size={16} color="#818cf8" />
                                    <h5 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#818cf8', margin: 0 }}>The Final Outcome</h5>
                                </div>
                                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5 }}>{timeline.oneYear}</p>
                            </div>
                        </div>
                    </div>

                    {/* REDEMPTION PATH / ANTIDOTE */}
                    {timeline.antidote && (
                        <div className="fade-up" style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(5,150,105,0.2))', border: '1px solid rgba(16,185,129,0.4)', borderRadius: '16px', boxShadow: '0 10px 30px rgba(16,185,129,0.15)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                                <div style={{ background: '#10b981', padding: '8px', borderRadius: '50%' }} className="float">
                                    <Zap size={18} color="white" />
                                </div>
                                <h4 style={{ fontSize: '1.1rem', fontWeight: 900, color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                                    Break The Cycle Now
                                </h4>
                            </div>
                            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.6, marginBottom: '1.25rem', fontWeight: 500 }}>
                                <strong style={{ color: '#34d399' }}>The Antidote:</strong> {timeline.antidote}
                            </p>
                            <div style={{ textAlign: 'right' }}>
                                <button onClick={() => { 
                                    toast.success("Momentum initiated! Go crush it.", { icon: '🔥' }); 
                                    setTimeline(null); 
                                    setTask(''); 
                                }} className="btn-primary" style={{ background: 'linear-gradient(135deg, #10b981, #059669)', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '0.75rem 2rem', fontWeight: 800, color: 'white' }}>
                                    <Play size={16} fill="white" /> Start My 2 Minutes
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProcrastinationSimulator;
