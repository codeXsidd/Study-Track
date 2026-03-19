import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import API from '../services/api';
import toast from 'react-hot-toast';
import TaskMatchmaker from '../components/TaskMatchmaker';
import DopamineVault from '../components/DopamineVault';
import ProcrastinationSimulator from '../components/ProcrastinationSimulator';

const AiArsenalPage = () => {
    const [allTodos, setAllTodos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await API.get('/todos');
                setAllTodos(res.data || []);
            } catch {
                toast.error('Failed to load tasks for context');
            }
            setLoading(false);
        };
        fetch();
    }, []);

    const isCompletedToday = (t) => {
        if (!t.completed || !t.completedAt) return false;
        const compDate = new Date(t.completedAt);
        const today = new Date();
        return compDate.getDate() === today.getDate() &&
            compDate.getMonth() === today.getMonth() &&
            compDate.getFullYear() === today.getFullYear();
    };

    const completedToday = allTodos.filter(t => isCompletedToday(t));
    const potentialTasks = allTodos.filter(t => !t.dayPlan && !t.completed);

    if (loading) {
        return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10vh' }}><Sparkles size={30} className="float" color="#a855f7" /></div>;
    }

    return (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 1.5rem', position: 'relative' }}>
            {/* Background Glows */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: 0, height: 300, background: 'radial-gradient(circle at top center, rgba(167,139,250,0.15), transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
            
            {/* Hero Section */}
            <div style={{ position: 'relative', zIndex: 1, marginBottom: '3.5rem', padding: '2.5rem', background: 'rgba(15, 15, 26, 0.6)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 24, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', backdropFilter: 'blur(16px)', overflow: 'hidden' }}>
                {/* Decorative blob inside hero */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: 250, height: 250, background: 'linear-gradient(135deg, rgba(167,139,250,0.3), rgba(236,72,153,0.1))', filter: 'blur(60px)', borderRadius: '50%', pointerEvents: 'none' }} />
                
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1.5rem', flexDirection: 'column' }}>
                    <div className="float" style={{ padding: '14px', background: 'linear-gradient(135deg, #a78bfa, #ec4899)', borderRadius: '18px', boxShadow: '0 10px 25px rgba(236,72,153,0.4)' }}>
                        <Sparkles size={32} color="white" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '3rem', fontWeight: 900, background: 'linear-gradient(135deg, #ffffff 10%, #c084fc 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: '0 0 0.5rem 0', letterSpacing: '-0.03em' }}>
                            Your Digital Arsenal
                        </h1>
                        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '700px', lineHeight: 1.6, margin: 0 }}>
                            Stop relying purely on willpower. Leverage your AI assistants to instantly conquer procrastination, lock away distractions to unlock cheap dopamine, and calculate the perfect task for your current energy.
                        </p>
                    </div>
                </div>
            </div>
            
            {/* 3-Column AI Tools Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem', alignItems: 'start' }}>
                <TaskMatchmaker />
                <DopamineVault tasksCompletedCount={completedToday.length} />
                <ProcrastinationSimulator defaultTask={potentialTasks.length > 0 ? potentialTasks[0].title : ''} />
            </div>

            <style>{`
                .float { animation: float 3s ease-in-out infinite; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
            `}</style>
        </div>
    );
};

export default AiArsenalPage;
