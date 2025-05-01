
"use client";

import React, { createContext, useState, useContext, useEffect, type ReactNode, useCallback } from 'react';

// Define the User type used within the context and potentially returned by actions
// Make sure this aligns with the user object structure returned by your auth actions
export interface User {
    id: string;
    username: string;
    email: string;
    // Updated role to include superAdmin and vendor
    role: 'user' | 'admin' | 'superAdmin' | 'vendor';
    // passwordHash should generally NOT be part of the client-side user object
    // Add other relevant user fields if needed (e.g., profile picture URL)
}


interface AuthContextType {
    // User object will not contain passwordHash
    user: User | null;
    loading: boolean;
    isAdmin: boolean; // Flag for admin role
    isSuperAdmin: boolean; // Flag for superAdmin role
    isVendor: boolean; // Flag for vendor role
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    // State holds the User object (without passwordHash)
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
                        // Basic validation including role (improve as needed)
                        // Ensure all expected fields are present and have the correct type
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
                            // Ensure no passwordHash is accidentally stored/retrieved
                            const { passwordHash, ...safeUser } = parsedUser as any;
                            setUser(safeUser as User); // Cast to User after validation
                        } else {
                             console.warn("Invalid user data structure in localStorage. Clearing.");
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

    // Login function now expects a User object (without passwordHash)
    const login = useCallback((userData: User) => {
        // Ensure passwordHash is not stored in state or localStorage
        const { passwordHash, ...safeUserData } = userData as any;
        setUser(safeUserData);
         // Check window existence for SSR safety
        if (typeof window !== 'undefined') {
            localStorage.setItem('biterushUser', JSON.stringify(safeUserData));
            console.log("User stored in localStorage:", safeUserData);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
         // Check window existence for SSR safety
        if (typeof window !== 'undefined') {
            localStorage.removeItem('biterushUser');
            console.log("User removed from localStorage.");
        }
        // Optionally clear other sensitive data like cart here
    }, []);

    // Calculate role flags based on the user state
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
