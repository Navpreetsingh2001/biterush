
"use server";

import { z } from 'zod';
import bcrypt from 'bcryptjs'; // For password hashing
// Import your database client/connection setup here
// e.g., import prisma from '@/lib/prisma';
// For demonstration, we'll simulate a database with an in-memory array.
// !! REPLACE THIS WITH YOUR ACTUAL DATABASE LOGIC !!
interface DbUser {
    id: string;
    username: string;
    email: string;
    passwordHash: string;
}
const users: DbUser[] = []; // In-memory store simulation

// Schemas for validation (reuse or create specific ones)
const registerSchema = z.object({
    username: z.string().min(3).max(20),
    email: z.string().email(),
    password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

// Define return types for actions
type AuthResult = {
    success: boolean;
    user?: { id: string; username: string; email: string }; // Return basic user info, not password hash
    error?: string;
};

// --- REGISTER ACTION ---
export async function registerUser(data: z.infer<typeof registerSchema>): Promise<AuthResult> {
    try {
        const validation = registerSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: "Invalid input data." };
        }

        const { username, email, password } = validation.data;

        // !! DATABASE LOGIC: Check if email or username already exists !!
        const existingUser = users.find(u => u.email === email || u.username === username);
        if (existingUser) {
            return { success: false, error: "Email or username already exists." };
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10); // Salt rounds = 10

        // !! DATABASE LOGIC: Create the new user !!
        const newUser: DbUser = {
            id: Date.now().toString(), // Simple unique ID generation for demo
            username,
            email,
            passwordHash,
        };
        users.push(newUser);
        console.log("User registered:", { id: newUser.id, username: newUser.username, email: newUser.email });
        console.log("Current users:", users.map(u=>({id: u.id, username: u.username, email: u.email})));


        return {
            success: true,
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        };

    } catch (error) {
        console.error("Registration Action Error:", error);
        return { success: false, error: "An unexpected server error occurred during registration." };
    }
}


// --- LOGIN ACTION ---
export async function loginUser(data: z.infer<typeof loginSchema>): Promise<AuthResult> {
    try {
        const validation = loginSchema.safeParse(data);
        if (!validation.success) {
            return { success: false, error: "Invalid input data." };
        }

        const { email, password } = validation.data;

        // !! DATABASE LOGIC: Find the user by email !!
        const user = users.find(u => u.email === email);
        if (!user) {
             console.log("Login attempt failed: User not found for email", email);
             console.log("Current users:", users.map(u=>({id: u.id, username: u.username, email: u.email})));
            return { success: false, error: "Invalid email or password." };
        }

        // Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
             console.log("Login attempt failed: Invalid password for email", email);
            return { success: false, error: "Invalid email or password." };
        }

        // Login successful
         console.log("User logged in:", { id: user.id, username: user.username, email: user.email });
        // In a real app, you'd typically generate a session token (JWT) here and return it.
        // For this simple context-based auth, just return user data.
        return {
            success: true,
            user: { id: user.id, username: user.username, email: user.email }
        };

    } catch (error) {
        console.error("Login Action Error:", error);
        return { success: false, error: "An unexpected server error occurred during login." };
    }
}

// --- LOGOUT ACTION ---
// This might involve clearing server-side session state or blacklisting tokens in a real app.
// For now, it's mainly handled on the client by clearing context/localStorage.
export async function logoutUser(): Promise<{ success: boolean }> {
     try {
        // Perform any server-side session cleanup if necessary
        console.log("Logout action called on server.");
        // e.g., invalidate session token in database
        return { success: true };
     } catch (error) {
         console.error("Logout Action Error:", error);
         return { success: false };
     }
}
