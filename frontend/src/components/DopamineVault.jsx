import React, { useState, useEffect } from 'react';
import { lockVault, breakVault } from '../services/api';
import toast from 'react-hot-toast';
import { Lock, Unlock, ShieldAlert, Key, Flame, Zap, Loader } from 'lucide-react';

const DopamineVault = ({ tasksCompletedCount = 0 }) => {
    // Component State
    // "unlocked" | "locking" | "locked" | "breaking" | "roast" 
    const [vaultState, setVaultState] = useState(() => {
        return localStorage.getItem('vault_state') || 'unlocked';
    });
    const [reward, setReward] = useState(() => localStorage.getItem('vault_reward') || '');
    const [keysRequired, setKeysRequired] = useState(() => Number(localStorage.getItem('vault_keys_req')) || 0);
    const [startingTasks, setStartingTasks] = useState(() => Number(localStorage.getItem('vault_starting_tasks')) || 0);
    const [aiMessage, setAiMessage] = useState(() => localStorage.getItem('vault_msg') || '');
    const [roastMsg, setRoastMsg] = useState('');
    
    const [loading, setLoading] = useState(false);

    // Calculate generic progress based on prop (tasksCompletedCount since vault was locked)
    // We treat tasksCompletedCount as a raw number of things done.
    const currentKeysEarned = Math.max(0, tasksCompletedCount - startingTasks);
    const keysRemaining = Math.max(0, keysRequired - currentKeysEarned);
    const progressPercent = keysRequired > 0 ? Math.min(100, (currentKeysEarned / keysRequired) * 100) : 0;

    // Check if vault should open naturally
    useEffect(() => {
        if (vaultState === 'locked' && keysRequired > 0 && keysRemaining === 0) {
            handleUnlockSuccess();
        }
    }, [keysRemaining, vaultState, keysRequired]);

    // Save states
    const saveVaultState = (state, r, req, startT, msg) => {
        setVaultState(state);
        setReward(r);
        setKeysRequired(req);
        setStartingTasks(startT);
        setAiMessage(msg);
        
        localStorage.setItem('vault_state', state);
        localStorage.setItem('vault_reward', r);
        localStorage.setItem('vault_keys_req', req);
        localStorage.setItem('vault_starting_tasks', startT);
        localStorage.setItem('vault_msg', msg);
    };

    const clearVaultState = () => {
        saveVaultState('unlocked', '', 0, 0, '');
        setRoastMsg('');
    };

    const handleLock = async (e) => {
        e.preventDefault();
        if (!reward.trim()) return;
        
        setLoading(true);
        saveVaultState('locking', reward, 0, tasksCompletedCount, '');
        
        try {
            const res = await lockVault({ reward });
            saveVaultState('locked', reward, res.data.keysRequired, tasksCompletedCount, res.data.aiMessage);
            toast.success("Reward is now LOCKED. Let's get to work.");
        } catch (error) {
            toast.error("Failed to sequence vault lock. Try again.");
            clearVaultState();
        }
        setLoading(false);
    };

    const handleOverrideAttempt = () => {
        setVaultState('breaking');
        localStorage.setItem('vault_state', 'breaking');
    };

    const handleConfirmBreak = async () => {
        setLoading(true);
        try {
            const res = await breakVault({ reward, keysRemaining });
            setRoastMsg(res.data.roast);
            setVaultState('roast');
            localStorage.setItem('vault_state', 'roast');
        } catch (error) {
            // Fallback quit
            toast.error("Vault forcefully opened.");
            clearVaultState();
        }
        setLoading(false);
    };

    const handleCancelBreak = () => {
        setVaultState('locked');
        localStorage.setItem('vault_state', 'locked');
    };

    const handleUnlockSuccess = () => {
        toast.success(`You earned it! Enjoy your reward: ${reward}`, { duration: 5000, icon: '🎉' });
        clearVaultState();
    };

    // Render Unlocked State
    if (vaultState === 'unlocked') {
        return (
            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.03) 0%, rgba(5,150,105,0.08) 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1rem' }}>
                    <ShieldAlert size={22} color="#10b981" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>Dopamine Detox Vault</h3>
                </div>
                <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                    Lock away a distraction. The AI will calculate the academic "cost" to unlock it based on Focus Keys. You cannot open it by time—only by momentum.
                </p>
                <form onSubmit={handleLock} style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                    <input
                        className="input"
                        placeholder="e.g. Scroll TikTok / Play 1 game / Watch Netflix"
                        style={{ flex: 1, padding: '0.8rem 1rem', background: 'rgba(15,15,26,0.8)' }}
                        value={reward}
                        onChange={(e) => setReward(e.target.value)}
                    />
                    <button type="submit" disabled={!reward.trim() || loading} className="btn-primary" style={{ background: '#10b981', color: 'white', padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Lock size={16} />}
                        Lock
                    </button>
                </form>
            </div>
        );
    }

    // Render Locking Loading State
    if (vaultState === 'locking') {
        return (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <Lock size={40} color="#f59e0b" style={{ animation: 'pulse 1.5s infinite', margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#f59e0b', fontSize: '1.1rem', fontWeight: 700 }}>Synthesizing Vault Mechanics...</h3>
                <p style={{ color: '#cbd5e1', fontSize: '0.85rem', marginTop: '0.5rem' }}>The AI is assessing the focus cost of "{reward}"...</p>
            </div>
        );
    }

    // Render Active Locked State
    if (vaultState === 'locked') {
        return (
            <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(239,68,68,0.05) 0%, rgba(185,28,28,0.15) 100%)', border: '1px solid rgba(239,68,68,0.3)', boxShadow: '0 0 20px rgba(239,68,68,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Lock size={22} color="#ef4444" className="float" />
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444' }}>Vault is Sealed</h3>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: '#fca5a5', background: 'rgba(239,68,68,0.2)', padding: '4px 8px', borderRadius: 4 }}>
                        Reward: {reward}
                    </span>
                </div>

                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: 8, marginBottom: '1.5rem', borderLeft: '3px solid #ef4444' }}>
                    <p style={{ fontSize: '0.85rem', color: '#cbd5e1', fontStyle: 'italic', lineHeight: 1.5 }}>
                        "{aiMessage}"
                    </p>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 8 }}>
                        <label style={{ fontSize: '0.8rem', fontWeight: 700, color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Key size={14} color="#f59e0b" /> Focus Keys Required
                        </label>
                        <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#f59e0b' }}>{currentKeysEarned} / {keysRequired}</span>
                    </div>
                    <div style={{ width: '100%', height: 12, background: 'rgba(0,0,0,0.4)', borderRadius: 6, overflow: 'hidden' }}>
                        <div style={{ 
                            width: `${progressPercent}%`, height: '100%', 
                            background: 'linear-gradient(90deg, #f59e0b, #eab308)', 
                            boxShadow: '0 0 10px #f59e0b', transition: 'width 0.5s ease-out' 
                        }} />
                    </div>
                    <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 8, textAlign: 'right' }}>
                        * Earn keys by completing tasks.
                    </p>
                </div>

                <button onClick={handleOverrideAttempt} className="btn-danger" style={{ width: '100%', padding: '0.75rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, background: 'rgba(239,68,68,0.1)', color: '#ef4444', border: '1px solid rgba(239,68,68,0.5)', fontWeight: 700 }}>
                    <ShieldAlert size={16} /> EMERGENCY OVERRIDE
                </button>
            </div>
        );
    }

    // Render Breaking Warning
    if (vaultState === 'breaking') {
        return (
            <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(239,68,68,0.1)', border: '2px solid #ef4444', textAlign: 'center' }}>
                <ShieldAlert size={40} color="#ef4444" style={{ margin: '0 auto 1rem', animation: 'pulse 1s infinite' }} />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ef4444', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Warning: Breaking Vault</h3>
                <p style={{ fontSize: '0.9rem', color: '#fca5a5', marginBottom: '1.5rem', lineHeight: 1.5 }}>
                    You still need {keysRemaining} keys to earn "{reward}".<br/>
                    Breaking this vault now will negatively impact your productivity momentum. The AI will generate an academic reality check.
                </p>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={handleCancelBreak} disabled={loading} className="btn-primary" style={{ flex: 1, background: '#10b981', color: 'white', border: 'none' }}>
                        Back to Work
                    </button>
                    <button onClick={handleConfirmBreak} disabled={loading} className="btn-danger" style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                        {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : 'Break It Anyway'}
                    </button>
                </div>
            </div>
        );
    }

    // Render AI Roast
    if (vaultState === 'roast') {
        return (
            <div className="glass-card fade-up" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(15,15,26,0.9) 0%, rgba(220,38,38,0.2) 100%)', border: '1px solid #ef4444' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                    <Flame size={24} color="#ef4444" />
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'white' }}>AI Reality Check</h3>
                </div>
                
                <div style={{ padding: '1.25rem', background: 'rgba(0,0,0,0.5)', borderRadius: 8, borderLeft: '4px solid #ef4444', marginBottom: '1.5rem' }}>
                    <p style={{ fontSize: '1rem', color: '#fca5a5', fontStyle: 'italic', fontWeight: 600, lineHeight: 1.6 }}>
                        "{roastMsg}"
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={() => { setVaultState('locked'); localStorage.setItem('vault_state', 'locked'); }} className="btn-primary" style={{ flex: 1, background: '#10b981', color: 'white', border: 'none', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 6 }}>
                        <Zap size={16} /> I'll Keep Working
                    </button>
                    <button onClick={clearVaultState} className="btn-secondary" style={{ flex: 1 }}>
                        Accept Defeat
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default DopamineVault;
