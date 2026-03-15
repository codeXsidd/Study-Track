import React, { useState } from 'react';
import { matchTask } from '../services/api';
import toast from 'react-hot-toast';
import { Target, Clock, Zap, Sparkles, Loader } from 'lucide-react';

const TaskMatchmaker = () => {
    const [timeAvailable, setTimeAvailable] = useState('15m');
    const [energyLevel, setEnergyLevel] = useState('Low');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const handleMatch = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await matchTask({ timeAvailable, energyLevel });
            setResult(res.data);
            toast.success("Task match found!");
        } catch (error) {
            toast.error("Failed to get a match. AI might be asleep.");
        }
        setLoading(false);
    };

    return (
        <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(145deg, rgba(167, 139, 250, 0.05), rgba(99, 102, 241, 0.05))', border: '1px solid rgba(167,139,250,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                <Sparkles size={22} color="#a78bfa" className="float" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, background: 'linear-gradient(to right, #a78bfa, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AI Task Matchmaker
                </h3>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                Not sure what to do? Tell me how you feel, and I'll find the perfect task for you from your backlog.
            </p>

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', marginBottom: 8, textTransform: 'uppercase' }}>
                        <Clock size={14} /> Available Time
                    </label>
                    <select className="input" style={{ width: '100%', background: 'rgba(15,15,26,0.6)', cursor: 'pointer' }} value={timeAvailable} onChange={(e) => setTimeAvailable(e.target.value)}>
                        <option value="15m">15 Minutes</option>
                        <option value="30m">30 Minutes</option>
                        <option value="1h">1 Hour</option>
                        <option value="2h+">2+ Hours</option>
                    </select>
                </div>
                <div style={{ flex: 1, minWidth: '150px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24', marginBottom: 8, textTransform: 'uppercase' }}>
                        <Zap size={14} /> Energy Level
                    </label>
                    <select className="input" style={{ width: '100%', background: 'rgba(15,15,26,0.6)', cursor: 'pointer' }} value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)}>
                        <option value="Low">Low (Tired / Unfocused)</option>
                        <option value="Medium">Medium (Normal)</option>
                        <option value="High">High (Deep Work Mode)</option>
                    </select>
                </div>
            </div>

            <button 
                onClick={handleMatch} 
                disabled={loading}
                className="btn-primary" 
                style={{ width: '100%', padding: '0.8rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: 'linear-gradient(135deg, #a78bfa, #8b5cf6)', border: 'none' }}
            >
                {loading ? (
                    <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Scanning brain dump...</>
                ) : (
                    <><Target size={18} /> Find My Next Task</>
                )}
            </button>

            {result && (
                <div className="fade-in" style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'rgba(0,0,0,0.2)', borderRadius: 12, borderLeft: '4px solid #a78bfa' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', background: '#a78bfa33', color: '#c4b5fd', padding: '4px 8px', borderRadius: 4 }}>
                            {result.type}
                        </span>
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'white', marginBottom: '0.5rem', wordBreak: 'break-word' }}>
                        {result.recommendedTask}
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>
                        <strong style={{ color: '#a78bfa' }}>Why?</strong> {result.rationale}
                    </p>
                </div>
            )}
        </div>
    );
};

export default TaskMatchmaker;
