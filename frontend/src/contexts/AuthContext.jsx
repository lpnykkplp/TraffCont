import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkToken = () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const decoded = jwtDecode(token);
                    // Check if token expired
                    if (decoded.exp * 1000 < Date.now()) {
                        logout();
                    } else {
                        setUser(decoded);
                    }
                } catch (error) {
                    logout();
                }
            }
            setLoading(false);
        };
        checkToken();
    }, []);

    const login = (token, userData) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
