import React, { useState, useEffect } from 'react';
import API, { aiMindSweep, getSubjects, addAssignment, addNote } from '../services/api';
import toast from 'react-hot-toast';
import { Wand2, Loader, Save, Trash2, CheckCircle2, AlertCircle, FileText, CheckSquare } from 'lucide-react';

const AiMindSweepPage = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    // Parsed results
    const [todos, setTodos] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [notes, setNotes] = useState([]);

    // We need subjects for assignments
    const [subjects, setSubjects] = useState([]);

    useEffect(() => {
        getSubjects().then(res => setSubjects(res.data)).catch(() => {});
    }, []);

    const handleOrganize = async () => {
        if (!text.trim()) return toast.error("Write down your thoughts first!");
        
        setLoading(true);
        try {
            const res = await aiMindSweep({ text });
            setTodos(res.data.todos || []);
            setAssignments(res.data.assignments || []);
            setNotes(res.data.notes || []);
            toast.success("Mind organized! Review and save below.", { icon: '✨' });
        } catch (error) {
            toast.error("Failed to organize your thoughts.");
        }
        setLoading(false);
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        let successCount = 0;

        try {
            // Save Todos
            for (const t of todos) {
                await API.post('/todos', {
                    title: t.title,
                    priority: ['High', 'Medium', 'Low'].includes(t.priority) ? t.priority : 'Medium',
                    category: t.category || 'Study',
                    dayPlan: t.dayPlan === true
                });
                successCount++;
            }

            // Save Assignments
            for (const a of assignments) {
                if (subjects.length > 0) {
                    await addAssignment({
                        title: a.title,
                        description: a.description || 'Generated from Mind Sweep',
                        deadline: a.deadline || new Date().toISOString(),
                        priority: ['high', 'medium', 'low'].includes(a.priority?.toLowerCase()) ? a.priority.toLowerCase() : 'medium',
                        subjectId: subjects[0]._id // Fallback to first subject
                    });
                    successCount++;
                } else {
                    toast.error(`Could not save assignment: "${a.title}" because you have no subjects created.`);
                }
            }

            // Save Notes
            for (const n of notes) {
                await addNote({
                    title: n.title,
                    content: n.content || '',
                    tags: n.tags || ['BrainDump']
                });
                successCount++;
            }

            if (successCount > 0) {
                toast.success(`Successfully saved ${successCount} items to your dashboard!`, { icon: '🚀', duration: 4000 });
                // Clear the state so user can start fresh
                setTodos([]);
                setAssignments([]);
                setNotes([]);
                setText('');
            }

        } catch (error) {
            toast.error("An error occurred while saving to the database.");
            console.error(error);
        }
        setIsSaving(false);
    };

    const hasResults = todos.length > 0 || assignments.length > 0 || notes.length > 0;

    return (
        <div style={{ maxWidth: 1000, margin: '0 auto', padding: '2rem 1.5rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                <div style={{ padding: 10, background: 'linear-gradient(135deg, #a855f7, #6366f1)', borderRadius: 12 }}>
                    <Wand2 size={24} color="white" />
                </div>
                <h1 style={{ fontSize: '2rem', fontWeight: 900, background: 'linear-gradient(to right, #c084fc, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    AI Mind Sweep
                </h1>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.95rem', marginBottom: '2rem', lineHeight: 1.5, maxWidth: 600 }}>
                Feeling overwhelmed? Brain dump everything on your mind—tasks, deadlines, big projects, or random ideas. The AI will instantly categorize and organize them for you.
            </p>

            {/* Input Area */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', background: 'rgba(15,15,30,0.6)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <textarea
                    className="input"
                    style={{ 
                        width: '100%', minHeight: '180px', padding: '1.25rem', fontSize: '1.05rem', 
                        background: 'rgba(0,0,0,0.3)', resize: 'vertical', lineHeight: 1.6, 
                        border: '1px solid rgba(255,255,255,0.05)', color: '#e2e8f0', borderRadius: '12px'
                    }}
                    placeholder={"Type loosely. E.g., 'I have a massive history essay due next Friday, plus I need to grab milk tonight. Remember to text mom. Oh, and here's a random idea: use a neural network for predictions!'" }
                    value={text}
                    onChange={e => setText(e.target.value)}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <button 
                        onClick={handleOrganize} 
                        disabled={loading || !text.trim()} 
                        className="btn-primary" 
                        style={{ background: 'linear-gradient(135deg, #a855f7, #6366f1)', display: 'flex', alignItems: 'center', gap: 8, padding: '0.75rem 2rem', fontSize: '1rem' }}
                    >
                        {loading ? <Loader size={18} className="spin" /> : <Wand2 size={18} />}
                        Organize My Mind
                    </button>
                </div>
            </div>

            {/* Results */}
            {hasResults && (
                <div className="fade-up">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#e2e8f0' }}>Your Organized Plan</h2>
                        <button 
                            onClick={handleSaveAll} 
                            disabled={isSaving}
                            className="btn-primary"
                            style={{ background: '#10b981', border: 'none', display: 'flex', alignItems: 'center', gap: 8 }}
                        >
                            {isSaving ? <Loader size={18} className="spin" /> : <Save size={18} />}
                            Save All to Dashboard
                        </button>
                    </div>

                    <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* Todos Column */}
                        <div className="glass-card" style={{ padding: '1.25rem', borderTop: '4px solid #3b82f6' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                                <CheckSquare size={20} color="#3b82f6" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>Action Items</h3>
                            </div>
                            {todos.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No direct tasks found.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {todos.map((t, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <input className="input" style={{ width: '85%', padding: '0.4rem', fontSize: '0.9rem', background: 'transparent', border: 'none', color: '#e2e8f0' }} value={t.title} onChange={e => {
                                                    const newArr = [...todos]; newArr[idx].title = e.target.value; setTodos(newArr);
                                                }} />
                                                <button onClick={() => setTodos(todos.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#ef4444' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <div style={{ display: 'flex', gap: 6, marginTop: 4, paddingLeft: '0.4rem' }}>
                                                {t.dayPlan && <span style={{ fontSize: '0.65rem', background: '#ec489920', color: '#f472b6', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>DO TODAY</span>}
                                                <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', padding: '2px 6px', borderRadius: 4 }}>{t.priority}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Assignments Column */}
                        <div className="glass-card" style={{ padding: '1.25rem', borderTop: '4px solid #f59e0b' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                                <AlertCircle size={20} color="#f59e0b" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>Big Projects</h3>
                            </div>
                            {assignments.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No major assignments found.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {assignments.map((a, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <input className="input" style={{ width: '85%', padding: '0.4rem', fontSize: '0.9rem', background: 'transparent', border: 'none', color: '#e2e8f0', fontWeight: 700 }} value={a.title} onChange={e => {
                                                    const newArr = [...assignments]; newArr[idx].title = e.target.value; setAssignments(newArr);
                                                }} />
                                                <button onClick={() => setAssignments(assignments.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#ef4444' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            {a.deadline && (
                                                <p style={{ fontSize: '0.7rem', color: '#fca5a5', marginTop: 4, paddingLeft: '0.4rem' }}>
                                                    Due: {new Date(a.deadline).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Notes Column */}
                        <div className="glass-card" style={{ padding: '1.25rem', borderTop: '4px solid #10b981' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                                <FileText size={20} color="#10b981" />
                                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e2e8f0' }}>Notes & Ideas</h3>
                            </div>
                            {notes.length === 0 ? <p style={{ color: '#64748b', fontSize: '0.85rem' }}>No scattered notes found.</p> : (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {notes.map((n, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.2)', padding: '0.75rem', borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                <input className="input" style={{ width: '85%', padding: '0.4rem', fontSize: '0.9rem', background: 'transparent', border: 'none', color: '#e2e8f0', fontWeight: 700 }} value={n.title} onChange={e => {
                                                    const newArr = [...notes]; newArr[idx].title = e.target.value; setNotes(newArr);
                                                }} />
                                                <button onClick={() => setNotes(notes.filter((_, i) => i !== idx))} style={{ background: 'none', border: 'none', padding: 4, cursor: 'pointer', color: '#ef4444' }}>
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                            <p style={{ fontSize: '0.75rem', color: '#cbd5e1', paddingLeft: '0.4rem', marginTop: 4, fontStyle: 'italic' }}>
                                                {n.content}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            )}
            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default AiMindSweepPage;
