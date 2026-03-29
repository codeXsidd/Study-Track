import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { generateStudyCard } from '../services/api';
import toast from 'react-hot-toast';
import { Sparkles, Download, Copy, RefreshCw, Share2, BookOpen, Clock, Zap } from 'lucide-react';

const MOODS = [
    { emoji: '🔥', label: 'Fire Mode' },
    { emoji: '😤', label: 'Determined' },
    { emoji: '💪', label: 'Beast Mode' },
    { emoji: '🧠', label: 'Deep Focus' },
    { emoji: '✨', label: 'Flow State' },
];

const COLOR_THEMES = {
    purple: {
        gradient: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 50%, #0ea5e9 100%)',
        glow: 'rgba(124,58,237,0.5)',
        badge: 'rgba(139,92,246,0.3)',
        border: 'rgba(139,92,246,0.5)',
    },
    blue: {
        gradient: 'linear-gradient(135deg, #1d4ed8 0%, #0ea5e9 50%, #06b6d4 100%)',
        glow: 'rgba(14,165,233,0.5)',
        badge: 'rgba(14,165,233,0.3)',
        border: 'rgba(14,165,233,0.5)',
    },
    green: {
        gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
        glow: 'rgba(16,185,129,0.5)',
        badge: 'rgba(16,185,129,0.3)',
        border: 'rgba(16,185,129,0.5)',
    },
    orange: {
        gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #fbbf24 100%)',
        glow: 'rgba(245,158,11,0.5)',
        badge: 'rgba(245,158,11,0.3)',
        border: 'rgba(245,158,11,0.5)',
    },
    red: {
        gradient: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f87171 100%)',
        glow: 'rgba(239,68,68,0.5)',
        badge: 'rgba(239,68,68,0.3)',
        border: 'rgba(239,68,68,0.5)',
    },
    pink: {
        gradient: 'linear-gradient(135deg, #9d174d 0%, #ec4899 50%, #f472b6 100%)',
        glow: 'rgba(236,72,153,0.5)',
        badge: 'rgba(236,72,153,0.3)',
        border: 'rgba(236,72,153,0.5)',
    },
};

const StudyCardPage = () => {
    const { user } = useAuth();
    const cardRef = useRef(null);

    const [subject, setSubject] = useState('');
    const [hours, setHours] = useState(1);
    const [mood, setMood] = useState('🔥');
    const [loading, setLoading] = useState(false);
    const [cardData, setCardData] = useState(null);

    const theme = cardData ? (COLOR_THEMES[cardData.colorTheme] || COLOR_THEMES.purple) : COLOR_THEMES.purple;
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

    const handleGenerate = async () => {
        if (!subject.trim()) { toast.error('Please enter a subject!'); return; }
        setLoading(true);
        try {
            const res = await generateStudyCard({
                subject: subject.trim(),
                hoursStudied: hours,
                mood,
                userName: user?.name || 'Champion',
            });
            setCardData(res.data);
            toast.success('Your achievement card is ready!');
        } catch {
            toast.error('Failed to generate card. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!cardRef.current) return;
        try {
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(cardRef.current, {
                backgroundColor: null,
                scale: 2,
                useCORS: true,
                logging: false,
            });
            const link = document.createElement('a');
            link.download = `studytrack-card-${subject.replace(/\s+/g, '-').toLowerCase()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
            toast.success('Card downloaded! 🎉');
        } catch (e) {
            toast.error('Download failed. Try again.');
        }
    };

    const handleCopyText = () => {
        if (!cardData) return;
        const selectedMoodLabel = MOODS.find(m => m.emoji === mood)?.label || 'Focused';
        const text = `📚 Just crushed a ${hours}h study session on ${subject}!

${cardData.badgeEmoji} Badge Earned: ${cardData.badge}

"${cardData.quote}"

${cardData.tagline}

Track your studies → StudyTrack App 🚀`;
        navigator.clipboard.writeText(text);
        toast.success('Share text copied to clipboard!');
    };

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg)', padding: '2rem', fontFamily: 'Inter, sans-serif' }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: '2.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                        <div style={{ width: 40, height: 40, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Share2 size={20} color="white" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#e2e8f0', margin: 0 }}>
                                Study Streak <span style={{ background: 'linear-gradient(90deg, #a78bfa, #ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Share Card</span>
                            </h1>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0 }}>Generate a shareable achievement card after your study session</p>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>

                    {/* --- LEFT: Input Form --- */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Subject Input */}
                        <div className="glass-card" style={{ padding: '1.5rem' }}>
                            <h3 style={{ color: '#e2e8f0', fontWeight: 700, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <BookOpen size={16} color="#a78bfa" /> Session Details
                            </h3>

                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Subject / Topic</label>
                                <input
                                    className="input"
                                    placeholder="e.g. Data Structures, Quantum Physics..."
                                    value={subject}
                                    onChange={e => setSubject(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleGenerate()}
                                    style={{ width: '100%', boxSizing: 'border-box' }}
                                />
                            </div>

                            {/* Hours Slider */}
                            <div style={{ marginBottom: '1.25rem' }}>
                                <label style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={13} color="#a78bfa" /> Hours Studied</span>
                                    <span style={{ color: '#a78bfa', fontSize: '1rem' }}>{hours}h</span>
                                </label>
                                <input
                                    type="range" min={0.5} max={8} step={0.5}
                                    value={hours}
                                    onChange={e => setHours(parseFloat(e.target.value))}
                                    style={{ width: '100%', accentColor: '#8b5cf6', cursor: 'pointer' }}
                                />
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: '#475569', marginTop: 4 }}>
                                    <span>30m</span><span>2h</span><span>4h</span><span>6h</span><span>8h</span>
                                </div>
                            </div>

                            {/* Mood Picker */}
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>Your Mood</label>
                                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                    {MOODS.map(m => (
                                        <button
                                            key={m.emoji}
                                            onClick={() => setMood(m.emoji)}
                                            title={m.label}
                                            style={{
                                                width: 52, height: 52, borderRadius: 14, border: mood === m.emoji ? '2px solid #a78bfa' : '2px solid rgba(255,255,255,0.08)',
                                                background: mood === m.emoji ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)',
                                                fontSize: '1.4rem', cursor: 'pointer',
                                                transition: 'all 0.2s', transform: mood === m.emoji ? 'scale(1.15)' : 'scale(1)',
                                                boxShadow: mood === m.emoji ? '0 0 12px rgba(167,139,250,0.4)' : 'none',
                                            }}
                                        >{m.emoji}</button>
                                    ))}
                                </div>
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: 6 }}>{MOODS.find(m => m.emoji === mood)?.label}</p>
                            </div>
                        </div>

                        {/* Generate Button */}
                        <button
                            onClick={handleGenerate}
                            disabled={loading || !subject.trim()}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                                padding: '1rem 1.5rem', borderRadius: 14, border: 'none', cursor: loading || !subject.trim() ? 'not-allowed' : 'pointer',
                                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                                color: 'white', fontWeight: 800, fontSize: '1rem',
                                opacity: loading || !subject.trim() ? 0.6 : 1,
                                boxShadow: '0 4px 20px rgba(99,102,241,0.4)',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { if (!loading && subject.trim()) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}
                        >
                            {loading ? (
                                <><RefreshCw size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating your card...</>
                            ) : (
                                <><Sparkles size={18} /> Generate My Card</>
                            )}
                        </button>

                        {/* Actions Row (only when card is ready) */}
                        {cardData && (
                            <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                    onClick={handleDownload}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.85rem', borderRadius: 12, border: '1px solid rgba(16,185,129,0.4)', background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(16,185,129,0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(16,185,129,0.1)'}
                                >
                                    <Download size={16} /> Download PNG
                                </button>
                                <button
                                    onClick={handleCopyText}
                                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.85rem', borderRadius: 12, border: '1px solid rgba(99,102,241,0.4)', background: 'rgba(99,102,241,0.1)', color: '#a78bfa', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem', transition: 'all 0.2s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(99,102,241,0.2)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(99,102,241,0.1)'}
                                >
                                    <Copy size={16} /> Copy Text
                                </button>
                            </div>
                        )}
                    </div>

                    {/* --- RIGHT: Card Preview --- */}
                    <div>
                        <div
                            ref={cardRef}
                            style={{
                                borderRadius: 24,
                                overflow: 'hidden',
                                background: cardData ? theme.gradient : 'linear-gradient(135deg, #1e1e3f, #2d2d5e)',
                                border: cardData ? `1px solid ${theme.border}` : '1px solid rgba(255,255,255,0.1)',
                                boxShadow: cardData ? `0 0 60px ${theme.glow}, 0 20px 40px rgba(0,0,0,0.5)` : '0 8px 32px rgba(0,0,0,0.4)',
                                transition: 'all 0.5s ease',
                                position: 'relative',
                                minHeight: 380,
                                padding: '2rem',
                                display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            }}
                        >
                            {/* Background decorative blobs */}
                            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', filter: 'blur(40px)', pointerEvents: 'none' }} />
                            <div style={{ position: 'absolute', bottom: 0, left: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.04)', filter: 'blur(30px)', pointerEvents: 'none' }} />

                            {!cardData ? (
                                /* Empty State */
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 320, color: 'rgba(255,255,255,0.3)', textAlign: 'center' }}>
                                    <Share2 size={48} style={{ marginBottom: 16, opacity: 0.4 }} color="white" />
                                    <p style={{ fontSize: '1rem', fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Your card will appear here</p>
                                    <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.25)', marginTop: 6 }}>Fill in the form and generate your achievement card</p>
                                </div>
                            ) : (
                                <>
                                    {/* Top Row: Brand + Date */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{ width: 28, height: 28, background: 'rgba(255,255,255,0.2)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <BookOpen size={14} color="white" />
                                            </div>
                                            <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.8rem', fontWeight: 700, letterSpacing: '0.05em' }}>StudyTrack</span>
                                        </div>
                                        <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.7rem', fontWeight: 600 }}>{today}</span>
                                    </div>

                                    {/* Badge */}
                                    <div style={{ textAlign: 'center', padding: '1.5rem 0 1rem' }}>
                                        <div style={{ fontSize: '3.5rem', lineHeight: 1, marginBottom: 12 }}>{cardData.badgeEmoji}</div>
                                        <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)', borderRadius: 100, padding: '6px 18px', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 12 }}>
                                            <span style={{ color: 'white', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{cardData.badge}</span>
                                        </div>
                                    </div>

                                    {/* Quote */}
                                    <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: '1.25rem', marginBottom: '1.5rem', backdropFilter: 'blur(10px)' }}>
                                        <p style={{ color: 'rgba(255,255,255,0.95)', fontSize: '0.95rem', fontStyle: 'italic', fontWeight: 500, lineHeight: 1.6, margin: 0, textAlign: 'center' }}>
                                            "{cardData.quote}"
                                        </p>
                                    </div>

                                    {/* Stats Row */}
                                    <div style={{ display: 'flex', gap: 10, marginBottom: '1.5rem' }}>
                                        {[
                                            { icon: <BookOpen size={14} />, label: 'Subject', value: subject },
                                            { icon: <Clock size={14} />, label: 'Duration', value: `${hours}h` },
                                            { icon: <span style={{ fontSize: '0.9rem' }}>{mood}</span>, label: 'Mood', value: MOODS.find(m => m.emoji === mood)?.label },
                                        ].map((stat, i) => (
                                            <div key={i} style={{ flex: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '0.75rem 0.5rem', textAlign: 'center', backdropFilter: 'blur(8px)' }}>
                                                <div style={{ color: 'rgba(255,255,255,0.7)', marginBottom: 4 }}>{stat.icon}</div>
                                                <div style={{ color: 'white', fontSize: '0.75rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{stat.value}</div>
                                                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.6rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{stat.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Bottom Row: User + Tagline */}
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1rem', color: 'white', border: '2px solid rgba(255,255,255,0.3)' }}>
                                                {user?.name?.[0]?.toUpperCase() || 'S'}
                                            </div>
                                            <div>
                                                <p style={{ color: 'white', fontSize: '0.8rem', fontWeight: 700, margin: 0 }}>{user?.name || 'Student'}</p>
                                                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.65rem', margin: 0 }}>Level {user?.level || 1} Scholar</p>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Zap size={12} color="rgba(255,255,255,0.7)" />
                                            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.75rem', fontWeight: 700, fontStyle: 'italic' }}>{cardData.tagline}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Social sharing hint */}
                        {cardData && (
                            <div style={{ marginTop: 12, padding: '0.75rem 1rem', background: 'rgba(99,102,241,0.08)', borderRadius: 10, border: '1px solid rgba(99,102,241,0.15)', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Sparkles size={14} color="#a78bfa" />
                                <span style={{ color: '#94a3b8', fontSize: '0.78rem' }}>
                                    Download and share on Instagram, WhatsApp, or LinkedIn to flex your study grind! 🚀
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @media (max-width: 768px) {
                    div[style*="grid-template-columns: 1fr 1fr"] {
                        grid-template-columns: 1fr !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default StudyCardPage;
