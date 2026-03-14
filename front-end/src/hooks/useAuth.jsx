import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import { login as loginApi, register as registerApi } from '../services/auth';

const AuthContext = createContext();

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // On mount: verify token and fetch user data
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch {
                // Token invalid or expired — clear it
                localStorage.removeItem('token');
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    const login = useCallback(async (credentials) => {
        const data = await loginApi(credentials);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    }, []);

    const register = useCallback(async (userData) => {
        const data = await registerApi(userData);
        localStorage.setItem('token', data.token);
        setUser(data.user);
        return data;
    }, []);

    const logout = useCallback(() => {
        localStorage.removeItem('token');
        setUser(null);
    }, []);

    const checkAuth = useCallback(async () => {
        const token = localStorage.getItem('token');
        if (!token) return null;
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            return response.data;
        } catch {
            localStorage.removeItem('token');
            setUser(null);
            return null;
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, checkAuth, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
