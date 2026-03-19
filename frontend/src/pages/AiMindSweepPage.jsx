import React, { useState } from 'react';
import { parseMindSweep } from '../services/api';
import API from '../services/api';
import toast from 'react-hot-toast';
import { BrainCircuit, Wand2, Check, RefreshCw, Trash2, Save, X, Lightbulb, CheckSquare, BookOpen } from 'lucide-react';

const AiMindSweepPage = () => {
    const [brainDump, setBrainDump] = useState('');
    const [loading, setLoading] = useState(false);
    const [parsedData, setParsedData] = useState(null);
    const [saving, setSaving] = useState(false);

    const handleSweep = async () => {
        if (!brainDump.trim()) {
            toast.error("Type something first!");
            return;
        }

        setLoading(true);
        setParsedData(null);
        try {
            const res = await parseMindSweep({ brainDump });
            setParsedData(res.data);
            toast.success("Mind Organized! Check the results below.");
        } catch (error) {
            toast.error("AI couldn't process this right now. Try again!");
        }
        setLoading(false);
    };

    const handleSaveAll = async () => {
        if (!parsedData) return;
        setSaving(true);
        let successCount = 0;
        let failCount = 0;

        try {
            // Save Todos
            if (parsedData.todos) {
                for (let todo of parsedData.todos) {
                    try {
                        await API.post('/todos', { ...todo });
                        successCount++;
                    } catch (e) { failCount++; }
                }
            }
            
            // Save Assignments
            if (parsedData.assignments) {
                for (let ass of parsedData.assignments) {
                    try {
                        await API.post('/assignments', { ...ass });
                        successCount++;
                    } catch (e) { failCount++; }
                }
            }

            // Save Notes
            if (parsedData.notes) {
                for (let note of parsedData.notes) {
                    try {
                        await API.post('/notes', { ...note });
                        successCount++;
                    } catch (e) { failCount++; }
                }
            }

            if (failCount === 0 && successCount > 0) {
                toast.success(`Successfully saved ${successCount} items!`);
                setParsedData(null);
                setBrainDump('');
            } else if (successCount > 0) {
                toast.success(`Saved ${successCount} items, but ${failCount} failed.`);
            } else if (successCount === 0 && failCount > 0) {
                toast.error("Failed to save items.");
            }

        } catch (error) {
            toast.error("A critical error occurred while saving.");
        }
        setSaving(false);
    };

    const removeItem = (type, index) => {
        setParsedData({
            ...parsedData,
            [type]: parsedData[type].filter((_, i) => i !== index)
        });
    };

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1.5rem' }}>
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, #a78bfa, #f472b6)', marginBottom: '1rem', boxShadow: '0 0 20px rgba(167, 139, 250, 0.4)' }} className="float">
                    <BrainCircuit size={32} color="white" />
                </div>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.05em', background: 'linear-gradient(to right, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>
                    AI Mind Sweep
                </h1>
                <p style={{ color: '#94a3b8', fontSize: '1.05rem', maxWidth: 600, margin: '0 auto', lineHeight: 1.6 }}>
                    Clear your head. Dump your chaotic thoughts, tasks, and deadlines below. The AI will instantly untangle them into an organized action plan.
                </p>
            </div>

            {/* Input Area */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem', border: '1px solid rgba(167, 139, 250, 0.2)' }}>
                <textarea
                    className="input custom-scroll"
                    placeholder="E.g. I need to finish my history essay by Friday, grab coffee with Sarah tomorrow, start reviewing for the midterms, and buy groceries tonight..."
                    style={{
                        width: '100%',
                        minHeight: '200px',
                        resize: 'vertical',
                        background: 'rgba(15, 15, 26, 0.6)',
                        padding: '1.25rem',
                        fontSize: '1.1rem',
                        lineHeight: 1.6,
                        color: '#f8fafc',
                        border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: '12px'
                    }}
                    value={brainDump}
                    onChange={(e) => setBrainDump(e.target.value)}
                />

                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1.5rem' }}>
                    <button 
                        onClick={handleSweep} 
                        disabled={loading || !brainDump.trim() || saving}
                        className="btn-primary" 
                        style={{ 
                            padding: '0.8rem 2.5rem', 
                            fontSize: '1.1rem', 
                            background: 'linear-gradient(135deg, #8b5cf6, #ec4899)', 
                            border: 'none', 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 10,
                            boxShadow: '0 10px 25px -5px rgba(236, 72, 153, 0.4)'
                        }}
                    >
                        {loading ? (
                            <><RefreshCw size={20} style={{ animation: 'spin 1s linear infinite' }} /> Untangling thoughts...</>
                        ) : (
                            <><Wand2 size={20} /> Organize My Mind</>
                        )}
                    </button>
                </div>
            </div>

            {/* Parsed Results Area */}
            {parsedData && !loading && (
                <div className="fade-up">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Extracted Action Plan</h2>
                        <button 
                            onClick={handleSaveAll} 
                            disabled={saving}
                            className="btn-primary" 
                            style={{ background: '#10b981', border: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '0.6rem 1.25rem' }}
                        >
                            {saving ? <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Save size={16} />} 
                            {saving ? "Saving..." : "Save All to Dashboard"}
                        </button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        
                        {/* Todos */}
                        {parsedData.todos && parsedData.todos.length > 0 && (
                            <div className="glass-card" style={{ padding: '1.25rem', borderTop: '4px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', color: '#60a5fa' }}>
                                    <CheckSquare size={20} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>To-Dos</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {parsedData.todos.map((item, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: 8, position: 'relative' }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4, paddingRight: 20 }}>{item.title}</p>
                                            {item.description && <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.description}</p>}
                                            {item.dayPlan && <span style={{ display: 'inline-block', marginTop: 6, fontSize: '0.65rem', background: '#3b82f633', color: '#93c5fd', padding: '2px 6px', borderRadius: 4 }}>Added to Today</span>}
                                            <button onClick={() => removeItem('todos', idx)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Assignments */}
                        {parsedData.assignments && parsedData.assignments.length > 0 && (
                            <div className="glass-card" style={{ padding: '1.25rem', borderTop: '4px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', color: '#f87171' }}>
                                    <BookOpen size={20} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Assignments</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {parsedData.assignments.map((item, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: 8, position: 'relative' }}>
                                            <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4, paddingRight: 20 }}>{item.title}</p>
                                            {item.course && <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Course: {item.course}</p>}
                                            {item.deadline && <span style={{ display: 'inline-block', marginTop: 6, fontSize: '0.65rem', background: '#ef444433', color: '#fca5a5', padding: '2px 6px', borderRadius: 4 }}>Due: {item.deadline}</span>}
                                            <button onClick={() => removeItem('assignments', idx)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Notes */}
                        {parsedData.notes && parsedData.notes.length > 0 && (
                            <div className="glass-card" style={{ padding: '1.25rem', borderTop: '4px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem', color: '#fbbf24' }}>
                                    <Lightbulb size={20} />
                                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Ideas & Notes</h3>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {parsedData.notes.map((item, idx) => (
                                        <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', padding: '0.85rem', borderRadius: 8, position: 'relative' }}>
                                            {item.title && <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: 4, paddingRight: 20 }}>{item.title}</p>}
                                            <p style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.5 }}>"{item.content}"</p>
                                            <button onClick={() => removeItem('notes', idx)} style={{ position: 'absolute', top: 10, right: 10, background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 4 }}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {(!parsedData.todos?.length && !parsedData.assignments?.length && !parsedData.notes?.length) && (
                            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                                <p>No items could be extracted. Try adding more detail to your brain dump.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style>{`
                .float { animation: float 3s ease-in-out infinite; }
                @keyframes float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }
                .custom-scroll::-webkit-scrollbar { width: 8px; }
                .custom-scroll::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); border-radius: 8px; }
                .custom-scroll::-webkit-scrollbar-thumb { background: rgba(167, 139, 250, 0.3); border-radius: 8px; }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background: rgba(167, 139, 250, 0.5); }
            `}</style>
        </div>
    );
};

export default AiMindSweepPage;
