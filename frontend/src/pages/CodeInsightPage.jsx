import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Code2, Play, Cpu, Zap, Activity, Info, AlertTriangle, FastForward, CheckCircle2 } from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import { analyzeCode } from '../services/api';
const FormattedText = ({ text }) => {
    if (!text) return null;
    return (
        <span style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
            {text.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i} style={{ color: '#f8fafc', fontWeight: 800 }}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('*') && part.endsWith('*')) {
                    return <em key={i} style={{ color: '#cbd5e1' }}>{part.slice(1, -1)}</em>;
                }
                if (part.startsWith('`') && part.endsWith('`')) {
                    return <code key={i} style={{ background: 'rgba(255,255,255,0.08)', color: '#38bdf8', padding: '0.2rem 0.4rem', borderRadius: '6px', fontSize: '0.85em', fontFamily: 'monospace', border: '1px solid rgba(255,255,255,0.1)' }}>{part.slice(1, -1)}</code>;
                }
                return part;
            })}
        </span>
    );
};

const CodeInsightPage = () => {
    const boilerplates = {
        javascript: '// Write or paste your JavaScript code here...\n\nfunction example() {\n  return "Hello, CodeInsight!";\n}\n\nconsole.log(example());',
        python: '# Write or paste your Python code here...\n\ndef example():\n    return "Hello, CodeInsight!"\n\nif __name__ == "__main__":\n    print(example())',
        java: '// Write or paste your Java code here...\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, CodeInsight!");\n    }\n}',
        cpp: '// Write or paste your C++ code here...\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, CodeInsight!" << endl;\n    return 0;\n}'
    };

    const [language, setLanguage] = useState('javascript');
    const [code, setCode] = useState(boilerplates['javascript']);
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
                            onChange={(e) => {
                                const newLang = e.target.value;
                                if (Object.values(boilerplates).includes(code) || code.trim() === '') {
                                    setCode(boilerplates[newLang]);
                                }
                                setLanguage(newLang);
                            }}
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
                        <div style={{ display: 'flex', gap: '0.5rem', paddingBottom: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', overflowX: 'auto' }} className="hide-scrollbar">
                            {['Explanation', 'Simulation', 'Optimization'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    style={{
                                        padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s', whiteSpace: 'nowrap',
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
                                    <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(16,185,129,0.02))', border: '1px solid rgba(16,185,129,0.25)' }}>
                                        <h3 style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}><Info size={18} /> 🧠 Simple Summary</h3>
                                        <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.8, letterSpacing: '0.01em' }}><FormattedText text={result.simpleSummary} /></p>
                                    </div>
                                    
                                    <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <h3 style={{ fontSize: '0.9rem', color: '#fbbf24', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}><FastForward size={18} /> 📦 Real-Life Analogy</h3>
                                        <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.8, fontStyle: 'italic', letterSpacing: '0.01em' }}>"<FormattedText text={result.analogy} />"</p>
                                    </div>

                                    <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', boxShadow: 'inset 0 0 20px rgba(99,102,241,0.05)' }}>
                                        <h3 style={{ fontSize: '0.95rem', color: '#818cf8', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}><Cpu size={18} /> ⚙️ What Happens in the Background</h3>
                                        <p style={{ fontSize: '0.95rem', color: '#f1f5f9', lineHeight: 1.9, letterSpacing: '0.01em' }}><FormattedText text={result.backgroundExecution} /></p>
                                    </div>

                                    <div>
                                        <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 800, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📖 Step-by-Step Explanation</h3>
                                        {result.stepByStep && result.stepByStep.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                                                {result.stepByStep.map((step, idx) => (
                                                    <div key={idx} style={{ padding: '1rem 1.25rem', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', borderLeft: '4px solid #6366f1', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#818cf8', display: 'inline-block' }}>LINE {step.line || '?'}</span>
                                                        <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.8 }}><FormattedText text={step.explanation} /></p>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <p style={{ color: '#94a3b8', fontSize: '0.9rem' }}>No step-by-step data available.</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Simulation' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '1.25rem' }}>
                                        <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(239,68,68,0.1), rgba(0,0,0,0))', border: '1px solid rgba(239,68,68,0.2)' }}>
                                            <h3 style={{ fontSize: '0.9rem', color: '#fca5a5', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}><Activity size={18} /> ⏱ Time Complexity</h3>
                                            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.8 }}><FormattedText text={result.timeComplexity} /></p>
                                        </div>
                                        <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(56,189,248,0.1), rgba(0,0,0,0))', border: '1px solid rgba(56,189,248,0.2)' }}>
                                            <h3 style={{ fontSize: '0.9rem', color: '#7dd3fc', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}><Code2 size={18} /> 💾 Space Complexity</h3>
                                            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.8 }}><FormattedText text={result.spaceComplexity} /></p>
                                        </div>
                                    </div>

                                    <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                        <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 800, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔄 Dry Run (Execution Flow)</h3>
                                        <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.8 }}><FormattedText text={result.dryRun} /></p>
                                    </div>

                                    <div style={{ padding: '1.5rem', borderRadius: '16px', background: 'rgba(5, 5, 10, 0.8)', border: '1px solid rgba(16,185,129,0.3)', boxShadow: 'inset 0 0 30px rgba(16,185,129,0.05)' }}>
                                        <h3 style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 800, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 8 }}><Play size={18} /> 🎥 Visualization</h3>
                                        <pre style={{ margin: 0, fontSize: '0.95rem', color: '#34d399', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 2 }}>{result.visualization}</pre>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'Optimization' && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }} className="animate-fade-in">
                                    <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
                                        <h3 style={{ fontSize: '0.95rem', color: '#f87171', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={18} /> 🔍 Mistake Detection</h3>
                                        <p style={{ fontSize: '0.95rem', color: '#f1f5f9', lineHeight: 1.8 }}><FormattedText text={result.mistakes} /></p>
                                    </div>

                                    <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                                        <h3 style={{ fontSize: '0.95rem', color: '#10b981', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}><Zap size={18} /> ⚡ Optimal Solution</h3>
                                        <p style={{ fontSize: '0.95rem', color: '#f1f5f9', lineHeight: 1.8 }}><FormattedText text={result.optimalSolution} /></p>
                                    </div>

                                    <div style={{ padding: '1.5rem', borderRadius: '16px', background: '#0a0a0f', border: '1px solid rgba(167,139,250,0.3)', boxShadow: 'inset 0 0 20px rgba(167,139,250,0.05)' }}>
                                        <h3 style={{ fontSize: '0.95rem', color: '#a78bfa', fontWeight: 800, marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>💻 Optimized Code</h3>
                                        <pre style={{ margin: 0, fontSize: '0.95rem', color: '#c4b5fd', fontFamily: 'monospace', whiteSpace: 'pre-wrap', lineHeight: 1.8, overflowX: 'auto' }}>{result.optimizedCode}</pre>
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1.25rem' }}>
                                        <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                                            <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', fontWeight: 800, marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🚀 Beginner Tips</h3>
                                            <p style={{ fontSize: '0.95rem', color: '#cbd5e1', lineHeight: 1.8 }}><FormattedText text={result.beginnerTips} /></p>
                                        </div>
                                        <div style={{ padding: '1.25rem', borderRadius: '16px', background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
                                            <h3 style={{ fontSize: '0.95rem', color: '#818cf8', fontWeight: 800, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle2 size={18} /> 🧪 Interview Insight</h3>
                                            <p style={{ fontSize: '0.95rem', color: '#e2e8f0', lineHeight: 1.8 }}><FormattedText text={result.interviewInsight} /></p>
                                        </div>
                                    </div>
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
