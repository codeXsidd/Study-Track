import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Code2, Play, Cpu, Zap, Activity, Info, AlertTriangle, FastForward, CheckCircle2, BookOpen, Database, Lightbulb, Terminal, Code } from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { analyzeCode } from '../services/api';

const CodeInsightPage = () => {
    const [code, setCode] = useState('// Write or paste your code here...\n\nfunction example() {\n  return "Hello, CodeInsight!";\n}');
    const [language, setLanguage] = useState('javascript');
    const [mode, setMode] = useState('Beginner');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeTab, setActiveTab] = useState('Explanation'); // Explanation, Complexity, Execution

    const languages = [
        { id: 'javascript', name: 'JavaScript' },
        { id: 'python', name: 'Python' },
        { id: 'java', name: 'Java' },
        { id: 'cpp', name: 'C++' }
    ];

    const modes = ['Beginner', 'Interview', 'Debug'];

    const handleAnalyze = async () => {
        if (!code.trim() || code.includes('// Write or paste your code here') && code.length < 75) {
            toast.error("Please enter some real code to analyze.");
            return;
        }

        setLoading(true);
        try {
            const res = await analyzeCode({ code, language, mode });
            setResult(res.data);
            setActiveTab('Explanation');
            toast.success("Analysis complete!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to analyze code. Please check your connection.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container animate-fade-in" style={{ display: 'flex', gap: '1.5rem', height: '100%', maxWidth: '1400px', margin: '0 auto', overflow: 'hidden', padding: '1rem' }}>
            <Helmet>
                <title>CodeInsight AI — StudyTrack</title>
                <meta name="description" content="AI-powered code explanations, complexity analysis, and visualization." />
            </Helmet>

            {/* Editor Pane (Left) */}
            <div className="glass-card" style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1rem', background: 'rgba(10, 10, 25, 0.9)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
                        <Code2 color="#6366f1" /> Code Editor
                    </h2>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select 
                            value={language} 
                            onChange={(e) => setLanguage(e.target.value)}
                            style={{ 
                                background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', border: '1px solid rgba(255,255,255,0.1)', 
                                padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer' 
                            }}
                        >
                            {languages.map(lang => (
                                <option key={lang.id} value={lang.id} style={{ background: '#1e1e2f' }}>{lang.name}</option>
                            ))}
                        </select>
                        <select 
                            value={mode} 
                            onChange={(e) => setMode(e.target.value)}
                            style={{ 
                                background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)', 
                                padding: '0.4rem 0.8rem', borderRadius: '8px', fontSize: '0.85rem', outline: 'none', cursor: 'pointer', fontWeight: 600
                            }}
                        >
                            {modes.map(m => (
                                <option key={m} value={m} style={{ background: '#1e1e2f', color: '#e2e8f0' }}>{m} Mode</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <Editor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        value={code}
                        onChange={(value) => setCode(value || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            padding: { top: 16 },
                            scrollBeyondLastLine: false,
                            smoothScrolling: true,
                            cursorBlinking: 'smooth'
                        }}
                    />
                </div>

                <button 
                    onClick={handleAnalyze} 
                    disabled={loading}
                    className="btn-primary"
                    style={{ 
                        width: '100%', padding: '0.8rem', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', border: 'none',
                        color: 'white', fontWeight: 700, fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.2s'
                    }}
                >
                    {loading ? (
                        <><div className="spinner-small" style={{ width: 18, height: 18 }} /> Analyzing Code...</>
                    ) : (
                        <><Play size={18} /> Analyze Code Insights</>
                    )}
                </button>
            </div>

            {/* Analysis Pane (Right) */}
            <div className="glass-card" style={{ flex: '1 1 50%', display: 'flex', flexDirection: 'column', padding: '1.25rem', gap: '1rem', background: 'rgba(15, 15, 30, 0.4)', border: '1px solid rgba(255, 255, 255, 0.05)', overflow: 'hidden' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 8, color: '#f8fafc' }}>
                    <Zap color="#fbbf24" /> AI Insights
                </h2>

                {result ? (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                        {/* Tabs */}
                        <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                            {['Explanation', 'Deep Dive', 'Execution Flow'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                                        background: activeTab === tab ? 'rgba(99,102,241,0.15)' : 'transparent',
                                        color: activeTab === tab ? '#818cf8' : '#94a3b8',
                                        border: `1px solid ${activeTab === tab ? 'rgba(99,102,241,0.3)' : 'transparent'}`
                                    }}
                                >
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Tab Content */}
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }} className="custom-scrollbar">
                            
                            {activeTab === 'Explanation' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
                                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        <h3 style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}><Info size={16} /> Simple Summary</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>{result.simpleSummary || "No summary available."}</p>
                                    </div>

                                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}><BookOpen size={16} /> Step-by-Step Explanation</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.stepByStep || "No step-by-step logic available."}</p>
                                    </div>

                                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}><Database size={16} /> What Happens in the Background</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{result.background}</p>
                                    </div>

                                    <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <h3 style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}><FastForward size={16} /> Real-World Analogy</h3>
                                        <p style={{ fontSize: '0.9rem', color: '#fbbf24', lineHeight: 1.6, fontStyle: 'italic' }}>"{result.analogy}"</p>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Deep Dive' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }} className="animate-fade-in">
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(0,0,0,0))', border: '1px solid rgba(239,68,68,0.2)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                                                <Activity color="#f87171" size={20} />
                                                <h3 style={{ fontSize: '0.9rem', color: '#fca5a5', fontWeight: 700 }}>Time Complexity</h3>
                                            </div>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                                                {result.timeComplexity?.split('-')[0]?.trim() || 'Wait...'}
                                            </p>
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                                {result.timeComplexity?.split('-').slice(1).join('-').trim() || result.timeComplexity}
                                            </p>
                                        </div>

                                        <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(0,0,0,0))', border: '1px solid rgba(56,189,248,0.2)' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: '1rem' }}>
                                                <Cpu color="#38bdf8" size={20} />
                                                <h3 style={{ fontSize: '0.9rem', color: '#7dd3fc', fontWeight: 700 }}>Space Complexity</h3>
                                            </div>
                                            <p style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white', marginBottom: '0.5rem', fontFamily: 'monospace' }}>
                                                {result.spaceComplexity?.split('-')[0]?.trim() || 'Wait...'}
                                            </p>
                                            <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.5 }}>
                                                {result.spaceComplexity?.split('-').slice(1).join('-').trim() || result.spaceComplexity}
                                            </p>
                                        </div>
                                    </div>

                                    {result.beginnerTips && (
                                        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.15)' }}>
                                            <h3 style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}><Lightbulb size={16} /> Beginner Tips</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>{result.beginnerTips}</p>
                                        </div>
                                    )}

                                    {result.mistakes && (
                                        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.15)' }}>
                                            <h3 style={{ fontSize: '0.85rem', color: '#f87171', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}><AlertTriangle size={16} /> Mistake Detection & Edge Cases</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>{result.mistakes}</p>
                                        </div>
                                    )}

                                    {result.betterApproach && (
                                        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.15)' }}>
                                            <h3 style={{ fontSize: '0.85rem', color: '#10b981', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}><CheckCircle2 size={16} /> Optimal Solution / Better Approach</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{result.betterApproach}</p>
                                        </div>
                                    )}

                                    {result.optimizedCode && (
                                        <div style={{ padding: '1rem', borderRadius: '12px', background: '#0a0a10', border: '1px solid rgba(255,255,255,0.05)' }}>
                                            <h3 style={{ fontSize: '0.85rem', color: '#a78bfa', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 6 }}><Code size={16} /> Optimized Code Snippet</h3>
                                            <pre style={{ fontSize: '0.8rem', color: '#e2e8f0', overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}><code>{result.optimizedCode}</code></pre>
                                        </div>
                                    )}

                                    {result.interviewInsight && (
                                        <div style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.15)' }}>
                                            <h3 style={{ fontSize: '0.85rem', color: '#818cf8', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 6 }}><Terminal size={16} /> Interview Insight</h3>
                                            <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.6 }}>{result.interviewInsight}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'Execution Flow' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }} className="animate-fade-in">
                                    {result.visualization && (
                                        <div style={{ padding: '1rem', borderRadius: '12px', background: '#0a0a10', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '0.5rem' }}>
                                            <h3 style={{ fontSize: '0.8rem', color: '#10b981', textTransform: 'uppercase', fontWeight: 800, marginBottom: '0.5rem' }}>Text Simulation</h3>
                                            <pre style={{ fontSize: '0.85rem', color: '#e2e8f0', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{result.visualization}</pre>
                                        </div>
                                    )}

                                    <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.5rem' }}>Step-by-step Dry Run of execution.</p>
                                    
                                    {result.executionSteps && result.executionSteps.length > 0 ? (
                                        result.executionSteps.map((step, idx) => (
                                            <div key={idx} style={{ padding: '1rem', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderLeft: '3px solid #6366f1' }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                                                    <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#818cf8', background: 'rgba(99,102,241,0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                                                        Line {step.line || '?'}
                                                    </span>
                                                    <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 600 }}>Step {idx + 1}</span>
                                                </div>
                                                <p style={{ fontSize: '0.9rem', color: '#e2e8f0', lineHeight: 1.5, marginBottom: step.variables && Object.keys(step.variables).length > 0 ? '0.75rem' : 0 }}>
                                                    {step.explanation}
                                                </p>
                                                
                                                {step.variables && Object.keys(step.variables).length > 0 && (
                                                    <div style={{ padding: '0.5rem', background: '#0a0a10', borderRadius: '8px', border: '1px dashed rgba(255,255,255,0.1)' }}>
                                                        <span style={{ fontSize: '0.65rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: '0.25rem' }}>Variables in memory:</span>
                                                        <code style={{ fontSize: '0.8rem', color: '#10b981', display: 'block', wordBreak: 'break-all' }}>
                                                            {JSON.stringify(step.variables).replace(/[{}]/g, '')}
                                                        </code>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No step-by-step data available for this snippet.</p>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', opacity: 0.6 }}>
                        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(99,102,241,0.05)', border: '1px dashed rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                            <Code2 size={40} color="#818cf8" />
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#e2e8f0', marginBottom: '0.5rem' }}>Ready for Analysis</h3>
                        <p style={{ fontSize: '0.9rem', color: '#94a3b8', maxWidth: '300px' }}>Paste your code on the left and hit analyze to see the breakdown, complexities, and execution flow.</p>
                    </div>
                )}
            </div>

            <style>{`
                @media (max-width: 900px) {
                    .page-container { flex-direction: column !important; overflow-y: auto !important; }
                    .glass-card { flex: none !important; height: 600px; }
                }
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
            `}</style>
        </div>
    );
};

export default CodeInsightPage;
