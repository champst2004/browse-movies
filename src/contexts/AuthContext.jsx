import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import authService from '../services/auth.service';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        if (token) {
            localStorage.setItem('token', token);
        } else {
            localStorage.removeItem('token');
        }
    }, [token]);


    const login = async (email, password) => {
        try {
            const data = await authService.login(email, password);
            setToken(data.accessToken);
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const signup = async (userData) => {
        try {
            await authService.signup(userData);
        } catch (error) {
            console.error("Signup error:", error);
            throw error;
        }
    };

    const logout = () => {
        setToken(null);
    };

    const value = useMemo(
        () => ({
            token,
            login,
            signup,
            logout,
        }),
        [token]
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    return useContext(AuthContext);
};