import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    // Set axios default header when token changes
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Restore user on refresh and wake up backend
    useEffect(() => {
        const restoreUser = async () => {
            if (token) {
                try {
                    const res = await axios.get(`${baseURL}/auth/me`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setUser(res.data);
                } catch (error) {
                    if (error.response && error.response.status === 401) {
                        localStorage.removeItem('token');
                        setToken(null);
                    }
                    // For other errors (like 5xx or Network Errors on backend cold start), we keep the token so the user stays authenticated
                }
            } else {
                // Wake up the backend on Render automatically if the user is unauthenticated
                try {
                    await axios.get(`${baseURL}/health`);
                } catch (error) {
                    console.log('Backend wake-up ping failed:', error.message);
                }
            }
            setLoading(false);
        };
        restoreUser();

        // Keep-alive ping for Render backend (14 minutes = 14 * 60 * 1000 ms)
        const pingInterval = setInterval(async () => {
            try {
                await axios.get(`${baseURL}/health`);
            } catch (err) {
                console.log('Keep-alive ping failed');
            }
        }, 14 * 60 * 1000);

        return () => clearInterval(pingInterval);
    }, []);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('token', authToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
    };

    const updateUserXP = (xp, level) => {
        setUser(prev => ({ ...prev, xp, level }));
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, updateUserXP }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
};
