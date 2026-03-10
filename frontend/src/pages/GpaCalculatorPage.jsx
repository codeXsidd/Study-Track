import React, { useState, useEffect, useCallback } from 'react';
import { GraduationCap, Plus, Trash2, Save, TrendingUp, ChevronRight, Award, RefreshCw } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS, CategoryScale, LinearScale, PointElement,
    LineElement, Tooltip, Legend, Filler
} from 'chart.js';
import API from '../services/api';
import toast from 'react-hot-toast';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler);

const GRADE_POINTS = { 'O': 10, 'A+': 9, 'A': 8, 'B+': 7, 'B': 6, 'C': 5, 'D': 4, 'F': 0 };
const GRADE_COLORS = { 'O': '#10b981', 'A+': '#22d3ee', 'A': '#6366f1', 'B+': '#8b5cf6', 'B': '#f59e0b', 'C': '#f97316', 'D': '#ef4444', 'F': '#71717a' };
const GRADES = ['O', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F'];

const calcSGPA = (subjects) => {
    const total = subjects.reduce((a, s) => a + Number(s.credits), 0);
    if (!total) return 0;
    const weighted = subjects.reduce((a, s) => a + (GRADE_POINTS[s.grade] || 0) * Number(s.credits), 0);
    return parseFloat((weighted / total).toFixed(2));
};

const calcCGPA = (sems) => {
    const valid = sems.filter(s => s.subjects.filter(sub => sub.name).length > 0);
    if (!valid.length) return 0;
    let totalCredits = 0, totalWeighted = 0;
    valid.forEach(s => {
        s.subjects.filter(sub => sub.name).forEach(sub => {
            totalCredits += Number(sub.credits);
            totalWeighted += (GRADE_POINTS[sub.grade] || 0) * Number(sub.credits);
        });
    });
    return totalCredits ? parseFloat((totalWeighted / totalCredits).toFixed(2)) : 0;
};

const getGpaColor = (g) => {
    if (!g) return '#475569';
    if (g >= 9) return '#10b981';
    if (g >= 7.5) return '#6366f1';
    if (g >= 6) return '#f59e0b';
    return '#ef4444';
};

const getClassification = (g) => {
    if (!g) return '—';
    if (g >= 9) return '🏆 Outstanding';
    if (g >= 8) return '⭐ Distinction';
    if (g >= 7) return '✅ First Class';
    if (g >= 6) return '👍 Second Class';
    if (g >= 5) return '📘 Pass';
    return '⚠️ Fail';
};

const YEARS = [1, 2, 3, 4];
const SEMS_PER_YEAR = 2;

const defaultSubject = () => ({ name: '', grade: 'A', credits: 3 });

const GpaCalculatorPage = () => {
    const [activeSem, setActiveSem] = useState(1);
    const [semData, setSemData] = useState(
        Array.from({ length: 8 }, (_, i) => ({
            semNumber: i + 1,
            subjects: [defaultSubject()],
            sgpa: 0,
            saved: false
        }))
    );
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [targetCgpa, setTargetCgpa] = useState(9.0);
    const [aiAnalysis, setAiAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        const fetchSems = async () => {
            try {
                const res = await API.get('/semesters');
                if (res.data.length) {
                    setSemData(prev => prev.map(s => {
                        const found = res.data.find(d => d.semNumber === s.semNumber);
                        if (found) return { ...s, subjects: found.subjects.length ? found.subjects : [defaultSubject()], sgpa: found.sgpa, saved: true };
                        return s;
                    }));
                }
            } catch { }
            setLoading(false);
        };
        fetchSems();
    }, []);

    const currentSem = semData[activeSem - 1];

    const updateSubject = (idx, field, value) => {
        setSemData(prev => prev.map((s, si) =>
            si === activeSem - 1
                ? { ...s, saved: false, subjects: s.subjects.map((sub, i) => i === idx ? { ...sub, [field]: value } : sub) }
                : s
        ));
    };

    const addSubject = () => {
        setSemData(prev => prev.map((s, si) =>
            si === activeSem - 1 ? { ...s, saved: false, subjects: [...s.subjects, defaultSubject()] } : s
        ));
    };

    const removeSubject = (idx) => {
        setSemData(prev => prev.map((s, si) =>
            si === activeSem - 1 ? { ...s, saved: false, subjects: s.subjects.filter((_, i) => i !== idx) } : s
        ));
    };

    const saveSem = async () => {
        const validSubjects = currentSem.subjects.filter(s => s.name.trim());
        if (!validSubjects.length) { toast.error('Add at least one subject with a name'); return; }
        setSaving(true);
        try {
            const res = await API.post('/semesters', { semNumber: activeSem, subjects: validSubjects });
            setSemData(prev => prev.map((s, si) =>
                si === activeSem - 1 ? { ...s, sgpa: res.data.sgpa, saved: true, subjects: validSubjects } : s
            ));
            toast.success(`Semester ${activeSem} saved! SGPA: ${res.data.sgpa}`);
        } catch { toast.error('Failed to save'); }
        setSaving(false);
    };

    const handleAiAnalysis = async () => {
        setAnalyzing(true);
        try {
            const savedSemsCount = semData.filter(s => s.saved).length;
            const remainingSems = 8 - savedSemsCount;
            const currentCgpa = calcCGPA(semData);

            if (remainingSems <= 0) {
                toast.error("You've already completed all 8 semesters!");
                setAnalyzing(false);
                return;
            }

            const res = await API.post('/ai/gpa-strategy', {
                currentCgpa,
                targetCgpa,
                remainingSems
            });

            setAiAnalysis(res.data);
            toast.success('Strategy generated!');
        } catch (err) {
            console.error('GPA Analysis Error:', err);
            toast.error('Could not generate strategy. Please try again.');
        }
        setAnalyzing(false);
    };

    const clearSem = async () => {
        try {
            await API.delete(`/semesters/${activeSem}`);
            setSemData(prev => prev.map((s, si) =>
                si === activeSem - 1 ? { ...s, subjects: [defaultSubject()], sgpa: 0, saved: false } : s
            ));
            toast.success(`Semester ${activeSem} cleared`);
        } catch { toast.error('Failed to clear'); }
    };

    // Per-year CGPA
    const yearCGPA = YEARS.map(y => {
        const s1 = semData[(y - 1) * 2];
        const s2 = semData[(y - 1) * 2 + 1];
        return calcCGPA([s1, s2]);
    });

    // Final CGPA
    const finalCGPA = calcCGPA(semData);

    // Line chart data
    const savedSems = semData.filter(s => s.saved && s.sgpa > 0);
    const lineData = {
        labels: savedSems.map(s => `Sem ${s.semNumber}`),
        datasets: [{
            label: 'SGPA',
            data: savedSems.map(s => s.sgpa),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99,102,241,0.1)',
            fill: true,
            tension: 0.4,
            pointBackgroundColor: savedSems.map(s => getGpaColor(s.sgpa)),
            pointRadius: 6,
            pointHoverRadius: 8,
            borderWidth: 2
        }]
    };
    const lineOptions = {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => ` SGPA: ${ctx.raw}` } } },
        scales: {
            y: { min: 0, max: 10, grid: { color: 'rgba(99,102,241,0.08)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
    };

    if (loading) return <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading...</div>;

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.5rem', fontWeight: 700 }}>
                    <GraduationCap size={26} color="#6366f1" /> GPA / CGPA Calculator
                </h2>
            </div>

            <div className="gpa-grid" style={{ gap: '1.5rem' }}>

                {/* LEFT: Semester inputs */}
                <div>
                    {/* Year tabs */}
                    {YEARS.map(y => (
                        <div key={y} style={{ marginBottom: '1.5rem' }}>
                            {/* Year header */}
                            <div style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                marginBottom: '0.6rem'
                            }}>
                                <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ padding: '0.2rem 0.7rem', background: 'rgba(99,102,241,0.15)', borderRadius: 20, fontSize: '0.78rem', color: '#818cf8' }}>
                                        Year {y}
                                    </span>
                                    {yearCGPA[y - 1] > 0 && (
                                        <span style={{ fontSize: '0.78rem', color: getGpaColor(yearCGPA[y - 1]) }}>
                                            CGPA: <strong>{yearCGPA[y - 1]}</strong>
                                        </span>
                                    )}
                                </h3>
                            </div>

                            {/* Semester tabs for this year */}
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
                                {[(y - 1) * 2 + 1, (y - 1) * 2 + 2].map(semNum => {
                                    const sem = semData[semNum - 1];
                                    const isActive = activeSem === semNum;
                                    return (
                                        <div key={semNum} className="glass-card" style={{
                                            border: isActive ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(99,102,241,0.1)',
                                            transition: 'all 0.2s', overflow: 'hidden'
                                        }}>
                                            {/* Sem header */}
                                            <div
                                                onClick={() => setActiveSem(prev => prev === semNum ? null : semNum)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '0.75rem 1rem', cursor: 'pointer',
                                                    background: isActive ? 'rgba(99,102,241,0.1)' : 'transparent'
                                                }}>
                                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: isActive ? '#818cf8' : '#94a3b8' }}>
                                                    Semester {semNum}
                                                </span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                    {sem.sgpa > 0 && (
                                                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: getGpaColor(sem.sgpa) }}>
                                                            {sem.sgpa}
                                                        </span>
                                                    )}
                                                    {sem.saved && <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />}
                                                    <ChevronRight size={14} color="#64748b" style={{ transform: isActive ? 'rotate(90deg)' : 'none', transition: '0.2s' }} />
                                                </div>
                                            </div>

                                            {/* Expandable subject entry */}
                                            {isActive && (
                                                <div className="fade-in" style={{ padding: '0 1rem 1rem' }}>
                                                    {/* Column headers - Visible only on larger screens */}
                                                    <div className="gpa-subject-header" style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 32px', gap: '0.5rem', marginBottom: '0.5rem', marginTop: '1rem' }}>
                                                        {['Subject', 'Grade', 'Credits', ''].map(h => (
                                                            <span key={h} style={{ fontSize: '0.65rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
                                                        ))}
                                                    </div>
                                                    {currentSem.subjects.map((sub, idx) => (
                                                        <div key={idx} className="gpa-subject-row" style={{ display: 'grid', gridTemplateColumns: '1fr 80px 60px 32px', gap: '0.5rem', marginBottom: '0.5rem', alignItems: 'center' }}>
                                                            <input className="input" placeholder="Name" value={sub.name}
                                                                onChange={e => updateSubject(idx, 'name', e.target.value)}
                                                                style={{ padding: '0.5rem 0.75rem', fontSize: '0.82rem' }} />
                                                            <select className="input" value={sub.grade}
                                                                onChange={e => updateSubject(idx, 'grade', e.target.value)}
                                                                style={{ padding: '0.5rem', fontSize: '0.82rem', textAlign: 'center', color: GRADE_COLORS[sub.grade], appearance: 'none' }}>
                                                                {GRADES.map(g => <option key={g} value={g}>{g}</option>)}
                                                            </select>
                                                            <input type="number" className="input" min={1} max={10} value={sub.credits}
                                                                onChange={e => updateSubject(idx, 'credits', e.target.value)}
                                                                style={{ padding: '0.5rem', fontSize: '0.82rem', textAlign: 'center' }} />
                                                            <button onClick={() => currentSem.subjects.length > 1 && removeSubject(idx)}
                                                                className="btn-danger" style={{ padding: '0.45rem', opacity: currentSem.subjects.length === 1 ? 0.3 : 1, borderRadius: '8px' }}>
                                                                <Trash2 size={13} />
                                                            </button>
                                                        </div>
                                                    ))}
                                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                                                        <button onClick={addSubject} style={{
                                                            flex: 1, padding: '0.4rem', borderRadius: 7, fontSize: '0.78rem',
                                                            background: 'rgba(99,102,241,0.08)', border: '1px dashed rgba(99,102,241,0.25)',
                                                            color: '#818cf8', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4
                                                        }}>
                                                            <Plus size={12} /> Add Subject
                                                        </button>
                                                        <button onClick={clearSem} style={{
                                                            padding: '0.4rem 0.6rem', borderRadius: 7, fontSize: '0.78rem',
                                                            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                                                            color: '#ef4444', cursor: 'pointer'
                                                        }}>
                                                            <RefreshCw size={12} />
                                                        </button>
                                                        <button onClick={saveSem} disabled={saving} className="btn-primary" style={{
                                                            padding: '0.4rem 0.75rem', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: 4
                                                        }}>
                                                            <Save size={12} /> {saving ? '...' : 'Save'}
                                                        </button>
                                                    </div>
                                                    {/* Live SGPA preview */}
                                                    {currentSem.subjects.some(s => s.name) && (
                                                        <div style={{ marginTop: '0.6rem', textAlign: 'center', padding: '0.5rem', background: 'rgba(99,102,241,0.06)', borderRadius: 7 }}>
                                                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Preview SGPA: </span>
                                                            <span style={{ fontWeight: 800, fontSize: '1rem', color: getGpaColor(calcSGPA(currentSem.subjects.filter(s => s.name))) }}>
                                                                {calcSGPA(currentSem.subjects.filter(s => s.name))}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* RIGHT: Summary sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                    {/* Final CGPA big card */}
                    <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center', borderTop: `4px solid ${getGpaColor(finalCGPA)}`, background: 'rgba(99,102,241,0.05)' }}>
                        <p style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                            <Award size={14} color="#6366f1" /> Current CGPA
                        </p>
                        <div style={{ fontSize: '4.5rem', fontWeight: 900, color: getGpaColor(finalCGPA), lineHeight: 1, textShadow: `0 0 20px ${getGpaColor(finalCGPA)}33` }}>
                            {finalCGPA || '—'}
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: 10, fontWeight: 600 }}>{finalCGPA ? 'STREAKING HIGH!' : 'READY TO START'}</p>
                        <div style={{ marginTop: '1rem', fontSize: '0.82rem', fontWeight: 800, padding: '0.4rem', borderRadius: 8, background: 'rgba(255,255,255,0.03)', color: getGpaColor(finalCGPA) }}>
                            {getClassification(finalCGPA)}
                        </div>
                    </div>

                    {/* AI Predictor Tool */}
                    <div className="glass-card" style={{ padding: '1.25rem', border: '1px solid rgba(236,72,153,0.2)', background: 'linear-gradient(135deg, rgba(236,72,153,0.05), rgba(139,92,246,0.05))', position: 'relative' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                            <RefreshCw size={16} color="#ec4899" />
                            <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>Target Predictor</h4>
                        </div>
                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontSize: '0.65rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: 6 }}>SET YOUR TARGET CGPA</label>
                            <div style={{ display: 'flex', gap: 10 }}>
                                <input
                                    type="number" className="input" step={0.1} min={0} max={10}
                                    value={targetCgpa} onChange={e => setTargetCgpa(e.target.value)}
                                    style={{ flex: 1, padding: '0.5rem', fontSize: '1.1rem', fontWeight: 800, textAlign: 'center', borderRadius: 10 }}
                                />
                                <button
                                    onClick={handleAiAnalysis} disabled={analyzing}
                                    className="btn-primary"
                                    style={{ flex: 1.5, background: 'linear-gradient(135deg, #ec4899, #8b5cf6)', border: 'none', fontSize: '0.75rem' }}
                                >
                                    {analyzing ? <div className="spinner-small" /> : 'Predict Path 🚀'}
                                </button>
                            </div>
                        </div>

                        {aiAnalysis && (
                            <div className="fade-in" style={{ padding: '0.85rem', background: 'rgba(0,0,0,0.2)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                                    <span style={{ fontSize: '0.65rem', color: '#94a3b8' }}>REQUIRED SGPA:</span>
                                    <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#ec4899' }}>{aiAnalysis.requiredSgpa}</span>
                                </div>
                                <div style={{ marginBottom: 8 }}>
                                    <div style={{ height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2 }}>
                                        <div style={{
                                            height: '100%', borderRadius: 2, background: '#ec4899',
                                            width: `${Math.min((aiAnalysis.requiredSgpa / 10) * 100, 100)}%`
                                        }} />
                                    </div>
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: 1.4, fontWeight: 500 }}>
                                    {aiAnalysis.advice}
                                </p>
                                <div style={{ marginTop: 8, display: 'flex', justifyContent: 'center' }}>
                                    <span style={{
                                        fontSize: '0.6rem', padding: '2px 8px', borderRadius: 10, fontWeight: 800,
                                        background: aiAnalysis.difficulty === 'Hard' ? '#ef4444' : aiAnalysis.difficulty === 'Moderate' ? '#f59e0b' : '#10b981',
                                        color: '#fff', textTransform: 'uppercase'
                                    }}>
                                        {aiAnalysis.difficulty} Difficulty
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Per-year CGPA */}
                    <div className="glass-card" style={{ padding: '1.25rem' }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                            Year-wise CGPA
                        </p>
                        {YEARS.map(y => (
                            <div key={y} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
                                <div>
                                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e2e8f0' }}>Year {y}</p>
                                    <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Sem {(y - 1) * 2 + 1} & {(y - 1) * 2 + 2}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <span style={{ fontSize: '1.3rem', fontWeight: 800, color: yearCGPA[y - 1] ? getGpaColor(yearCGPA[y - 1]) : '#334155' }}>
                                        {yearCGPA[y - 1] || '—'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Per-semester SGPA list */}
                    <div className="glass-card" style={{ padding: '1.25rem' }}>
                        <p style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                            Semester SGPA
                        </p>
                        {semData.map(s => (
                            <div key={s.semNumber} style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '0.3rem 0', borderBottom: '1px solid rgba(99,102,241,0.07)',
                                cursor: 'pointer', opacity: s.saved ? 1 : 0.4
                            }} onClick={() => setActiveSem(s.semNumber)}>
                                <span style={{ fontSize: '0.8rem', color: activeSem === s.semNumber ? '#818cf8' : '#94a3b8', fontWeight: activeSem === s.semNumber ? 700 : 400 }}>
                                    Sem {s.semNumber}
                                </span>
                                <span style={{ fontWeight: 700, fontSize: '0.88rem', color: s.sgpa ? getGpaColor(s.sgpa) : '#334155' }}>
                                    {s.sgpa || '—'}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* SGPA Trend Chart */}
            {savedSems.length >= 2 && (
                <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
                    <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingUp size={16} color="#6366f1" /> SGPA Progression
                    </h3>
                    <Line data={lineData} options={lineOptions} height={100} />
                </div>
            )}

            {/* Grade scale */}
            <div className="glass-card" style={{ padding: '1rem', marginTop: '1.5rem' }}>
                <p style={{ fontSize: '0.7rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '0.6rem' }}>Grade Scale</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {Object.entries(GRADE_POINTS).map(([g, pts]) => (
                        <div key={g} style={{ padding: '0.25rem 0.6rem', background: GRADE_COLORS[g] + '22', borderRadius: 20, border: `1px solid ${GRADE_COLORS[g]}44`, display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: GRADE_COLORS[g] }}>{g}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{pts}pts</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GpaCalculatorPage;
