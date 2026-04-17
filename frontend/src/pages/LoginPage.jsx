import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login as loginApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './LoginPage.css';

const LoginPage = () => {
    const [form, setForm] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await loginApi(form);
            login(res.data.user, res.data.token);
            toast.success(`Welcome back, ${res.data.user.name}! 👋`);
            navigate('/');
        } catch (err) {
            console.error('LOGIN_ERROR:', err.response?.data || err.message);
            toast.error(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lamp-login-container">
            <div className="screen">
                <div className="screen__content">
                    <form className="login" onSubmit={handleSubmit}>
                        <div className="login__field">
                            <i className="login__icon fas fa-user"></i>
                            <input 
                                type="email" 
                                className="login__input" 
                                placeholder="Email"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="login__field">
                            <i className="login__icon fas fa-lock"></i>
                            <input 
                                type="password" 
                                className="login__input" 
                                placeholder="Password"
                                value={form.password}
                                onChange={e => setForm({ ...form, password: e.target.value })}
                                required
                            />
                        </div>
                        
                        <div style={{ marginTop: '10px', textAlign: 'right', paddingRight: '20px' }}>
                            <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: '#4C489D', textDecoration: 'none', fontWeight: 600 }}>Forgot Password?</Link>
                        </div>
                        
                        <button type="submit" className="button login__submit" disabled={loading}>
                            <span className="button__text">{loading ? "Logging in..." : "Log In Now"}</span>
                            <i className="button__icon fas fa-chevron-right"></i>
                        </button>				
                        
                        <div style={{ textAlign: 'center', marginTop: '30px' }}>
                            <p style={{ color: '#4C489D', fontSize: '0.85rem', fontWeight: 600 }}>
                                New student? <Link to="/register" style={{ color: '#4C489D', fontWeight: 700, textDecoration: 'underline' }}>Create your workspace</Link>
                            </p>
                        </div>
                    </form>
                    <div className="social-login">
                        <h3>log in via</h3>
                        <div className="social-icons">
                            <a href="#" className="social-login__icon fab fa-instagram"></a>
                            <a href="#" className="social-login__icon fab fa-facebook"></a>
                            <a href="#" className="social-login__icon fab fa-twitter"></a>
                        </div>
                    </div>
                </div>
                <div className="screen__background">
                    <span className="screen__background__shape screen__background__shape4"></span>
                    <span className="screen__background__shape screen__background__shape3"></span>		
                    <span className="screen__background__shape screen__background__shape2"></span>
                    <span className="screen__background__shape screen__background__shape1"></span>
                </div>		
            </div>
        </div>
    );
};

export default LoginPage;
