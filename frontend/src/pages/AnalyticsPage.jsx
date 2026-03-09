import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { TrendingUp, Flame, CheckCircle2, Clock, Calendar as CalendarIcon, Activity, BookOpen, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    PointElement,
    LineElement,
    ArcElement,
    Tooltip,
    Legend,
    Filler
);

const AnalyticsPage = () => {
    const [journal, setJournal] = useState([]);
    const [todos, setTodos] = useState([]);
    const [habits, setHabits] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [jRes, tRes, hRes] = await Promise.all([
                    API.get('/journal'),
                    API.get('/todos'),
                    API.get('/habits')
                ]);
                setJournal(jRes.data);
                setTodos(tRes.data);
                setHabits(hRes.data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    // ── Process Core Stats ──
    const totalHours = journal.reduce((sum, entry) => sum + (entry.hoursStudied || 0), 0);
    const completedTasks = todos.filter(t => t.completed).length;
    const totalTasks = todos.length;
    const taskCompletionRate = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

    // ── Streak logic ──
    const sortedDates = journal.map(e => e.date).sort((a, b) => b.localeCompare(a));
    let currentStreak = 0;
    let curDate = new Date().toISOString().split('T')[0];
    const uniqueSortedDates = [...new Set(sortedDates)];

    for (const d of uniqueSortedDates) {
        if (d === curDate) {
            currentStreak++;
            const dt = new Date(d);
            dt.setDate(dt.getDate() - 1);
            curDate = dt.toISOString().split('T')[0];
        } else {
            break;
        }
    }

    // ── 1. Study Hours Trend (Last 14 Days) ──
    const last14Days = Array.from({ length: 14 }).map((_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (13 - i));
        return d.toISOString().split('T')[0];
    });

    const hoursTrendData = {
        labels: last14Days.map(d => new Date(d).toLocaleDateString('default', { day: 'numeric', month: 'short' })),
        datasets: [{
            label: 'Study Hours',
            data: last14Days.map(d => journal.filter(j => j.date === d).reduce((s, e) => s + (e.hoursStudied || 0), 0)),
            backgroundColor: 'rgba(99, 102, 241, 0.4)',
            borderColor: '#6366f1',
            borderWidth: 2,
            pointBackgroundColor: '#6366f1',
            fill: true,
            tension: 0.4
        }]
    };

    // ── 2. Subject Focus (Total Hours per Subject) ──
    const subjectMap = {};
    journal.forEach(entry => {
        const subs = entry.subjects || [];
        const hoursPerSub = entry.hoursStudied / (subs.length || 1);
        subs.forEach(s => {
            subjectMap[s] = (subjectMap[s] || 0) + hoursPerSub;
        });
    });

    const subjectLabels = Object.keys(subjectMap);
    const subjectHours = Object.values(subjectMap);

    const subjectData = {
        labels: subjectLabels,
        datasets: [{
            label: 'Hours Spent',
            data: subjectHours,
            backgroundColor: [
                '#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#14b8a6', '#f59e0b'
            ],
            borderWidth: 0,
            hoverOffset: 4
        }]
    };

    // ── 3. Habit Completion Stats ──
    const habitCompletionData = {
        labels: habits.map(h => h.name),
        datasets: [{
            label: 'Total Completions',
            data: habits.map(h => h.totalCompleted || 0),
            backgroundColor: 'rgba(236, 72, 153, 0.6)',
            borderColor: '#ec4899',
            borderWidth: 1,
            borderRadius: 6
        }]
    };

    if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Analytics...</div>;

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { weight: 'bold' },
                padding: 10,
                cornerRadius: 8
            }
        },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8', font: { size: 10 } } }
        }
    };

    return (
        <div className="page-container animate-slide-scale">
            <div className="section-title">
                <TrendingUp size={26} color="#10b981" /> Productivity Analytics
            </div>

            {/* Core Stats Overview */}
            <div className="stats-grid" style={{ marginBottom: '2rem', gap: '1.25rem' }}>
                <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #f59e0b' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'rgba(245,158,11,0.1)', padding: '0.6rem', borderRadius: 10 }}><Flame size={20} color="#f59e0b" /></div>
                        <div>
                            <p style={{ color: 'var(--text-soft)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Current Streak</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#f59e0b' }}>{currentStreak} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>days</span></p>
                        </div>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #6366f1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'rgba(99,102,241,0.1)', padding: '0.6rem', borderRadius: 10 }}><Clock size={20} color="#6366f1" /></div>
                        <div>
                            <p style={{ color: 'var(--text-soft)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Focus Time</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366f1' }}>{totalHours.toFixed(1)} <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>hours</span></p>
                        </div>
                    </div>
                </div>
                <div className="glass-card" style={{ padding: '1.25rem', borderLeft: '4px solid #10b981' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ background: 'rgba(16,185,129,0.1)', padding: '0.6rem', borderRadius: 10 }}><CheckCircle2 size={20} color="#10b981" /></div>
                        <div>
                            <p style={{ color: 'var(--text-soft)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Task Mastery</p>
                            <p style={{ fontSize: '1.5rem', fontWeight: 900, color: '#10b981' }}>{taskCompletionRate}% <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>done</span></p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 450px), 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
                {/* 1. Study Hours Trend */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Activity size={18} color="#6366f1" /> Study Hours (Last 14 Days)
                    </h3>
                    <Line data={hoursTrendData} options={chartOptions} height={120} />
                </div>

                {/* 2. Subject Distribution */}
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <BookOpen size={18} color="#8b5cf6" /> Focus Distribution
                    </h3>
                    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '220px' }}>
                        {subjectLabels.length > 0 ? (
                            <div style={{ width: '220px' }}>
                                <Doughnut data={subjectData} options={{ maintainAspectRatio: true, plugins: { legend: { display: true, position: 'bottom', labels: { color: '#94a3b8', boxWidth: 10, font: { size: 10 } } } } }} />
                            </div>
                        ) : (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Log study sessions to see subject analytics.</p>
                        )}
                    </div>
                </div>

                {/* 3. Habit Consistency */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Target size={18} color="#ec4899" /> Habit Consistency
                    </h3>
                    {habits.length > 0 ? (
                        <Bar data={habitCompletionData} options={chartOptions} height={120} />
                    ) : (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No habits added yet.</p>
                    )}
                </div>

                {/* Daily Productivity Score Trend */}
                <div className="glass-card" style={{ padding: '1.5rem', gridColumn: '1 / -1' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={18} color="#10b981" /> Productivity Score Trend
                    </h3>
                    <div style={{ height: '200px' }}>
                        <Line
                            data={{
                                labels: last14Days.map(d => new Date(d).toLocaleDateString('default', { day: 'numeric', month: 'short' })),
                                datasets: [{
                                    label: 'Productivity Score',
                                    data: last14Days.map(d => {
                                        const hours = journal.filter(j => j.date === d).reduce((s, e) => s + (e.hoursStudied || 0), 0);
                                        const tasks = todos.filter(t => t.completedAt && t.completedAt.split('T')[0] === d).length;
                                        return (hours * 10) + (tasks * 20); // Balanced score
                                    }),
                                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                                    borderColor: '#10b981',
                                    borderWidth: 3,
                                    pointBackgroundColor: '#10b981',
                                    fill: true,
                                    tension: 0.3
                                }]
                            }}
                            options={{
                                ...chartOptions,
                                plugins: { ...chartOptions.plugins, legend: { display: true, labels: { color: '#94a3b8' } } }
                            }}
                        />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1rem', textAlign: 'center' }}>
                        Score = (Study Hours × 10) + (Completed Tasks × 20). Mix both to skyrocket your productivity! 🚀
                    </p>
                </div>

                {/* 30-Day Activity Overview */}
                <div className="glass-card" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(16,185,129,0.05) 0%, rgba(99,102,241,0.05) 100%)' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <CalendarIcon size={18} color="#10b981" /> 30-Day Pulse
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>High-density overview of your daily consistency.</p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(15, 1fr)', gap: '0.4rem' }}>
                        {Array.from({ length: 30 }).map((_, i) => {
                            const d = new Date(); d.setDate(d.getDate() - (29 - i));
                            const ds = d.toISOString().split('T')[0];
                            const entry = journal.find(j => j.date === ds);
                            const h = entry ? entry.hoursStudied : 0;
                            const colors = ['rgba(255,255,255,0.03)', 'rgba(99,102,241,0.2)', 'rgba(99,102,241,0.5)', '#6366f1'];
                            const idx = h >= 6 ? 3 : h >= 3 ? 2 : h > 0 ? 1 : 0;
                            return (
                                <div key={i} title={`${ds}: ${h}h`} style={{ aspectRatio: '1', borderRadius: '4px', background: colors[idx], border: '1px solid rgba(255,255,255,0.03)' }} />
                            );
                        })}
                    </div>
                </div>

                {/* Weekly Goal Status */}
                <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center' }}>
                    <Trophy size={40} color="#f59e0b" style={{ marginBottom: '1rem' }} />
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc' }}>Weekly Champion</h3>
                    <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: 1.5, marginTop: '0.5rem' }}>
                        You've studied <b>{journal.filter(j => {
                            const d = new Date(j.date);
                            const now = new Date();
                            const weekAgo = new Date(); weekAgo.setDate(now.getDate() - 7);
                            return d >= weekAgo;
                        }).reduce((s, e) => s + (e.hoursStudied || 0), 0).toFixed(1)} hours</b> in the last 7 days.
                    </p>
                    <div style={{ marginTop: '1.5rem', width: '100%' }}>
                        <div style={{ height: 10, background: 'rgba(255,255,255,0.05)', borderRadius: 5, overflow: 'hidden' }}>
                            <div style={{
                                width: `${Math.min((totalHours / 40) * 100, 100)}%`,
                                height: '100%',
                                background: 'linear-gradient(90deg, #f59e0b, #fbbf24)',
                                borderRadius: 5
                            }} />
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#71717a', marginTop: 8, fontWeight: 700 }}>PROGRESS TOWARDS 40H WEEKLY GOAL</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalyticsPage;
