
"use client";

import React, { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react';

export interface User {
    id: string;
    username: string;
    email: string;
    // Add other relevant user fields if needed
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
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
                        // Basic validation (improve as needed)
                        if (typeof parsedUser === 'object' && parsedUser !== null && 'id' in parsedUser && 'username' in parsedUser && 'email' in parsedUser) {
                            setUser(parsedUser as User);
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

    const login = useCallback((userData: User) => {
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

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
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
