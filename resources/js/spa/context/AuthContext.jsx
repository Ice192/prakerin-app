import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, extractErrorMessage, setAccessToken } from '../services/api';
import {
    clearAuthStorage,
    readAuthStorage,
    writeAuthStorage,
} from '../services/authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const stored = readAuthStorage();
        if (!stored) {
            setLoading(false);
            return;
        }

        setUser(stored.user);
        setToken(stored.token);
        setAccessToken(stored.token);

        const hydrateUser = async () => {
            try {
                const response = await api.get('/auth/user');
                const freshUser = response.data?.data;

                if (freshUser) {
                    setUser(freshUser);
                    writeAuthStorage({
                        token: stored.token,
                        user: freshUser,
                    });
                }
            } catch {
                setUser(null);
                setToken(null);
                setAccessToken(null);
                clearAuthStorage();
            } finally {
                setLoading(false);
            }
        };

        hydrateUser();
    }, []);

    const login = async ({ email, password }) => {
        const response = await api.post('/auth/login', { email, password });
        const payload = response.data?.data;

        if (!payload?.access_token || !payload?.user) {
            throw new Error('Unexpected login response.');
        }

        setUser(payload.user);
        setToken(payload.access_token);
        setAccessToken(payload.access_token);
        writeAuthStorage({
            token: payload.access_token,
            user: payload.user,
        });

        return payload.user;
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            if (import.meta.env.DEV) {
                console.warn(extractErrorMessage(error, 'Failed to logout cleanly.'));
            }
        } finally {
            setUser(null);
            setToken(null);
            setAccessToken(null);
            clearAuthStorage();
        }
    };

    const value = useMemo(
        () => ({
            user,
            token,
            loading,
            isAuthenticated: Boolean(token && user),
            login,
            logout,
        }),
        [user, token, loading],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider.');
    }

    return context;
};
