'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import type { User } from '@/types';

interface AuthContextType {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string, password_confirmation: string) => Promise<void>;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
            setToken(storedToken);
            // Optionally fetch user data
            authApi
                .me()
                .then((userData) => {
                    setUser({
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        created_at: '',
                        updated_at: '',
                    });
                })
                .catch(() => {
                    // Token invalid, clear it
                    localStorage.removeItem('token');
                    setToken(null);
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (email: string, password: string) => {
        const response = await authApi.login(email, password);
        localStorage.setItem('token', response.token);
        setToken(response.token);

        // Fetch user data
        const userData = await authApi.me();
        setUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            created_at: '',
            updated_at: '',
        });

        router.push('/dashboard');
    };

    const register = async (
        name: string,
        email: string,
        password: string,
        password_confirmation: string
    ) => {
        const response = await authApi.register(name, email, password, password_confirmation);
        localStorage.setItem('token', response.token);
        setToken(response.token);
        setUser(response.user);
        router.push('/dashboard');
    };

    const logout = async () => {
        try {
            await authApi.logout();
        } catch (error) {
            // Even if logout fails, clear local state
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            router.push('/login');
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                loading,
                login,
                register,
                logout,
                isAuthenticated: !!token,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

