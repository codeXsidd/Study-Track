import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginApi(form);
            login(res.data.user, res.data.token);
            toast.success(`Welcome back! 👋`);
            navigate('/');
        } catch (err) {
            console.error('LOGIN_ERROR:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#13131A', /* Dark premium background */
            color: '#fff',
            fontFamily: "'Inter', sans-serif"
        }}>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: '5rem',
                flexWrap: 'wrap',
                justifyContent: 'center',
                padding: '2rem',
                width: '100%',
                maxWidth: '1000px'
            }}>
                {/* Lamp SVG section */}
                <div style={{ position: 'relative', width: 280, height: 380, display: 'flex', justifyContent: 'center' }}>
                    {/* The light cone */}
                    <svg width="600" height="400" style={{ 
                        position: 'absolute', 
                        top: 150, 
                        left: -160, 
                        zIndex: 0, 
                        opacity: isPasswordFocused ? 0.05 : 1, 
                        transition: 'opacity 0.5s ease-in-out',
                        pointerEvents: 'none'
                    }}>
                        <defs>
                            <linearGradient id="lightGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                                <stop offset="100%" stopColor="rgba(255, 255, 255, 0)" />
                            </linearGradient>
                        </defs>
                        <polygon points="200,0 400,0 550,400 50,400" fill="url(#lightGradient)" />
                    </svg>

                    {/* The lamp itself */}
                    <svg width="300" height="380" style={{ position: 'relative', zIndex: 1, overflow: 'visible' }}>
                        {/* Base and stand */}
                        <ellipse cx="150" cy="350" rx="45" ry="12" fill="#D1D5DB" />
                        <ellipse cx="150" cy="345" rx="45" ry="12" fill="#E5E7EB" />
                        
                        {/* Stand pole */}
                        <rect x="142" y="180" width="16" height="165" fill="#9CA3AF" />
                        <rect x="142" y="180" width="8" height="165" fill="#D1D5DB" />
                        
                        {/* String pull */}
                        <line 
                            x1="120" y1="180" 
                            x2="120" y2={isPasswordFocused ? "260" : "230"} 
                            stroke="#E5E7EB" strokeWidth="2" 
                            style={{ transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} 
                        />
                        <circle 
                            cx="120" cy={isPasswordFocused ? "260" : "230"} 
                            r="5" fill="#fff" 
                            style={{ transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }} 
                        />

                        {/* Lamp shade */}
                        <g style={{ 
                            transformOrigin: '150px 80px', 
                            transform: isPasswordFocused ? 'rotate(-6deg) translateY(12px)' : 'rotate(0deg)',
                            transition: 'all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)' 
                        }}>
                            {/* Inner darkness / bulb area */}
                            <ellipse cx="150" cy="180" rx="90" ry="20" fill="#3A2A32" />
                            
                            {/* Main shade body */}
                            <path d="M 100 60 L 200 60 L 240 180 L 60 180 Z" fill="#8E7885" />
                            
                            {/* Top collar */}
                            <ellipse cx="150" cy="60" rx="50" ry="8" fill="#75616D" />
                            
                            {/* Bottom rim */}
                            <path d="M 60 180 Q 150 205 240 180 L 235 175 Q 150 198 65 175 Z" fill="#75616D" />
                            
                            {/* Cute Face */}
                            <g style={{ 
                                transform: isPasswordFocused ? 'translateY(15px)' : 'translateY(0px)',
                                transition: 'transform 0.4s ease'
                            }}>
                                {/* Eyes */}
                                {isPasswordFocused ? (
                                    <>
                                        {/* Closed / sleeping eyes */}
                                        <path d="M 115 140 Q 125 145 135 140" stroke="#1F151A" strokeWidth="4" fill="none" strokeLinecap="round" />
                                        <path d="M 165 140 Q 175 145 185 140" stroke="#1F151A" strokeWidth="4" fill="none" strokeLinecap="round" />
                                    </>
                                ) : (
                                    <>
                                        {/* Happy arches */}
                                        <path d="M 115 140 Q 125 125 135 140" stroke="#1F151A" strokeWidth="4" fill="none" strokeLinecap="round" />
                                        <path d="M 165 140 Q 175 125 185 140" stroke="#1F151A" strokeWidth="4" fill="none" strokeLinecap="round" />
                                    </>
                                )}
                                
                                {/* Mouth */}
                                {isPasswordFocused ? (
                                    <ellipse cx="150" cy="155" rx="4" ry="4" fill="#1F151A" />
                                ) : (
                                    <path d="M 135 150 Q 150 175 165 150 Z" fill="#E11D48" stroke="#1F151A" strokeWidth="2" strokeLinejoin="round" />
                                )}
                                
                                {/* Blushes */}
                                <ellipse cx="106" cy="150" rx="8" ry="4" fill="#E11D48" opacity="0.4" />
                                <ellipse cx="194" cy="150" rx="8" ry="4" fill="#E11D48" opacity="0.4" />
                            </g>
                        </g>
                    </svg>
                </div>

                {/* Login Form Frame */}
                <div style={{
                    width: '100%',
                    maxWidth: '380px',
                    background: '#1A1A24',
                    padding: '2.5rem',
                    borderRadius: '24px',
                    boxShadow: isPasswordFocused 
                        ? '0px 0px 30px rgba(225, 29, 72, 0.1)' 
                        : '0px 0px 60px rgba(225, 29, 72, 0.4)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    transition: 'box-shadow 0.5s ease',
                    position: 'relative',
                    zIndex: 2
                }}>
                    <h2 style={{ textAlign: 'center', fontSize: '1.8rem', marginBottom: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                        Welcome Back
                    </h2>

                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', color: '#9CA3AF', fontWeight: 500 }}>Email Address</label>
                            <input 
                                type="email" 
                                placeholder="student@example.com"
                                value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1rem',
                                    borderRadius: '12px',
                                    background: '#13131A',
                                    border: '1px solid #2D2D3B',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    setIsPasswordFocused(false);
                                    e.target.style.borderColor = '#E11D48';
                                }}
                                onBlur={(e) => e.target.style.borderColor = '#2D2D3B'}
                                required 
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem', color: '#9CA3AF', fontWeight: 500 }}>Password</label>
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                value={form.password}
                                onChange={e => setForm({...form, password: e.target.value})}
                                style={{
                                    width: '100%',
                                    padding: '0.85rem 1rem',
                                    borderRadius: '12px',
                                    background: '#13131A',
                                    border: '1px solid #2D2D3B',
                                    color: '#fff',
                                    outline: 'none',
                                    fontSize: '0.95rem',
                                    transition: 'border-color 0.3s ease'
                                }}
                                onFocus={(e) => {
                                    setIsPasswordFocused(true);
                                    e.target.style.borderColor = '#E11D48';
                                }}
                                onBlur={(e) => {
                                    setIsPasswordFocused(false);
                                    e.target.style.borderColor = '#2D2D3B';
                                }}
                                required 
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={loading}
                            style={{
                                marginTop: '1rem',
                                width: '100%',
                                padding: '1rem',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'linear-gradient(135deg, #F43F5E, #9F1239)',
                                color: '#fff',
                                fontSize: '1rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease',
                                boxShadow: isPasswordFocused ? 'none' : '0 8px 25px rgba(225, 29, 72, 0.4)'
                            }}
                            onMouseEnter={e => { if(!isPasswordFocused) e.currentTarget.style.transform = 'translateY(-2px)' }}
                            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0px)'}
                        >
                            {loading ? <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                                <div style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTop: '2px solid white', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }}></div>
                                Logging in...
                            </span> : 'Login'}
                        </button>
                    </form>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
                        <Link to="/forgot-password" style={{ color: '#9CA3AF', fontSize: '0.85rem', textDecoration: 'none', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fff'} onMouseLeave={e => e.target.style.color = '#9CA3AF'}>
                            Forgot Password?
                        </Link>
                    </div>

                    <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                        <p style={{ color: '#6B7280', fontSize: '0.85rem' }}>
                            New student?{' '}
                            <Link to="/register" style={{ color: '#F43F5E', fontWeight: 600, textDecoration: 'none' }}>
                                Create your account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
            {/* Global animation styles injected for spinner */}
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default LoginPage;
