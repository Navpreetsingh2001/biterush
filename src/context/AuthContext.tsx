"use client";

import React, { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react';

export interface User {
    id: string;
    username: string;
    email: string;
    // Updated role to include superAdmin and vendor
    role: 'user' | 'admin' | 'superAdmin' | 'vendor';
    passwordHash?: string; // Optional: only needed internally in actions, not stored in context state usually
    // Add other relevant user fields if needed
}

interface AuthContextType {
    user: Omit<User, 'passwordHash'> | null; // Exclude passwordHash from context state
    loading: boolean;
    isAdmin: boolean; // Convenience flag for checking admin role
    isSuperAdmin: boolean; // Convenience flag for checking superAdmin role
    isVendor: boolean; // Convenience flag for checking vendor role
    login: (userData: Omit<User, 'passwordHash'>) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<Omit<User, 'passwordHash'> | null>(null);
    const [loading, setLoading] = useState<boolean>(true); // Start loading until check is done

    // Check for persisted user session on initial load (client-side)
    useEffect(() => {
        const checkUserSession = async () => {
             // Check window existence for SSR safety
            if (typeof window !== 'undefined') {
                const storedUser = localStorage.getItem('biterushUser');
                if (storedUser) {
                    try {
                        const parsedUser: unknown = JSON.parse(storedUser);
                        // Basic validation including role (improve as needed)
                        if (
                            typeof parsedUser === 'object' &&
                            parsedUser !== null &&
                            'id' in parsedUser && typeof parsedUser.id === 'string' &&
                            'username' in parsedUser && typeof parsedUser.username === 'string' &&
                            'email' in parsedUser && typeof parsedUser.email === 'string' &&
                            'role' in parsedUser &&
                            // Updated role check
                            (parsedUser.role === 'user' || parsedUser.role === 'admin' || parsedUser.role === 'superAdmin' || parsedUser.role === 'vendor')
                        ) {
                            setUser(parsedUser as Omit<User, 'passwordHash'>);
                        } else {
                             localStorage.removeItem('biterushUser'); // Clear invalid data
                        }
                    } catch (error) {
                        console.error("Failed to parse user from localStorage", error);
                        localStorage.removeItem('biterushUser'); // Clear invalid data
                    }
                }
            }
            setLoading(false); // Finished checking
        };
        checkUserSession();
    }, []);

    const login = useCallback((userData: Omit<User, 'passwordHash'>) => {
        setUser(userData);
         // Check window existence for SSR safety
        if (typeof window !== 'undefined') {
            localStorage.setItem('biterushUser', JSON.stringify(userData));
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
         // Check window existence for SSR safety
        if (typeof window !== 'undefined') {
            localStorage.removeItem('biterushUser');
        }
        // Optionally clear other sensitive data like cart here
    }, []);

    const isAdmin = user?.role === 'admin';
    const isSuperAdmin = user?.role === 'superAdmin';
    const isVendor = user?.role === 'vendor';

    return (
        // Pass new flags to context value
        <AuthContext.Provider value={{ user, loading, isAdmin, isSuperAdmin, isVendor, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the Auth Context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
