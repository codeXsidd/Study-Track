import React, { useState, useEffect } from 'react';
import { getSubjects, addSubject, deleteSubject } from '../services/api';
import toast from 'react-hot-toast';
import { BookOpen, Plus, Trash2, Loader } from 'lucide-react';
import MasteryRoadmap from '../components/MasteryRoadmap';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#06b6d4'];

const SubjectsPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [name, setName] = useState('');
    const [color, setColor] = useState(COLORS[0]);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const fetchSubjects = async () => {
        try {
            const res = await getSubjects();
            setSubjects(res.data);
        } catch { toast.error('Failed to load subjects'); }
        setFetching(false);
    };

    useEffect(() => { fetchSubjects(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;
        setLoading(true);
        try {
            const res = await addSubject({ name: name.trim(), color });
            setSubjects([res.data, ...subjects]);
            setName('');
            toast.success(`Subject "${res.data.name}" added!`);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to add subject');
        } finally { setLoading(false); }
    };

    const handleDelete = async (id, name) => {
        try {
            await deleteSubject(id);
            setSubjects(subjects.filter(s => s._id !== id));
            toast.success(`"${name}" deleted`);
        } catch {
            toast.error('Failed to delete subject');
        }
    };

    return (
        <div style={{ maxWidth: 800, margin: '0 auto', padding: '2rem 1.5rem' }}>
            <div className="section-title">
                <BookOpen size={24} color="#6366f1" />
                <span>My Subjects</span>
            </div>

            <MasteryRoadmap />

            {/* Add form */}
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                <h3 style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.95rem', color: '#cbd5e1' }}>Add New Subject</h3>
                <form onSubmit={handleAdd} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: 200 }}>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Subject Name</label>
                        <input
                            className="input"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Mathematics, Physics..."
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: 6, color: '#94a3b8' }}>Color</label>
                        <div style={{ display: 'flex', gap: 6 }}>
                            {COLORS.map(c => (
                                <button key={c} type="button" onClick={() => setColor(c)} style={{
                                    width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                                    cursor: 'pointer', outline: color === c ? `3px solid white` : 'none',
                                    outlineOffset: 2, transform: color === c ? 'scale(1.15)' : 'scale(1)', transition: '0.2s'
                                }} />
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}>
                        {loading ? <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={16} />}
                        Add Subject
                    </button>
                </form>
            </div>

            {/* Subjects grid */}
            {fetching ? (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <Loader size={32} style={{ animation: 'spin 1s linear infinite', color: '#6366f1' }} />
                </div>
            ) : subjects.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <BookOpen size={48} color="#6366f133" style={{ marginBottom: 16 }} />
                    <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>No subjects yet. Add your first subject above!</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
                    {subjects.map(s => (
                        <div key={s._id} className="glass-card fade-in" style={{
                            padding: '1.25rem', display: 'flex', flexDirection: 'column',
                            borderLeft: `3px solid ${s.color}`, gap: 8
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div>
                                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: s.color, marginBottom: 8 }} />
                                    <h3 style={{ fontWeight: 700, fontSize: '1rem', lineHeight: 1.3 }}>{s.name}</h3>
                                    <p style={{ fontSize: '0.73rem', color: 'var(--text-muted)', marginTop: 4 }}>
                                        Added {new Date(s.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button onClick={() => handleDelete(s._id, s.name)} className="btn-danger" style={{ padding: '0.3rem 0.5rem' }}>
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default SubjectsPage;
