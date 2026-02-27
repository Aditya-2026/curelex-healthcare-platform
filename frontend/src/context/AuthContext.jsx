import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('token');
        if (storedUser && token) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    const role = user?.role || null;
    const isAuthenticated = !!user && !!localStorage.getItem('token');

    const getDashboardPath = () => {
        switch (role) {
            case 'admin': return '/admin/dashboard';
            case 'doctor': return '/doctor/dashboard';
            case 'patient': return '/patient/dashboard';
            default: return '/';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading, role, isAuthenticated, getDashboardPath }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
