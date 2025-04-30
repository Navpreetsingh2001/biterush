
"use server";

import { z } from 'zod';
import bcrypt from 'bcryptjs'; // For password hashing
// --- DATABASE INTEGRATION POINT ---
// Import your database client/connection setup here. Examples:
// import prisma from '@/lib/prisma'; // Example for Prisma
// import { db } from '@/lib/firebase'; // Example for Firebase Firestore
// import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

// Schemas for validation
const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters.").max(20, "Username must be at most 20 characters."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(1, "Password is required."), // Keep min 1 for login check
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
             // Log detailed validation errors for debugging
             console.error("Registration validation failed:", validation.error.flatten().fieldErrors);
            return { success: false, error: "Invalid input data. Please check the fields." };
        }

        const { username, email, password } = validation.data;

        // --- DATABASE LOGIC: Check if email or username already exists ---
        // Replace this section with your actual database query
        // Example using Prisma:
        // const existingUser = await prisma.user.findFirst({
        //     where: { OR: [{ email }, { username }] },
        // });
        // Example using Firestore:
        // const emailQuery = query(collection(db, "users"), where("email", "==", email));
        // const usernameQuery = query(collection(db, "users"), where("username", "==", username));
        // const [emailSnapshot, usernameSnapshot] = await Promise.all([getDocs(emailQuery), getDocs(usernameQuery)]);
        // const existingUser = !emailSnapshot.empty || !usernameSnapshot.empty;
        // --- END DATABASE LOGIC ---

        // Placeholder check - REMOVE IN PRODUCTION
        const existingUser = false; // Assume user doesn't exist for now
        // --- END PLACEHOLDER ---

        if (existingUser) {
            console.log(`Registration attempt failed: Email (${email}) or Username (${username}) already exists.`);
            return { success: false, error: "Email or username already exists." };
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10); // Salt rounds = 10

        // --- DATABASE LOGIC: Create the new user ---
        // Replace this section with your actual database insertion
        // Example using Prisma:
        // const newUser = await prisma.user.create({
        //     data: { username, email, passwordHash },
        // });
        // Example using Firestore:
        // const docRef = await addDoc(collection(db, "users"), {
        //     username,
        //     email,
        //     passwordHash,
        //     createdAt: new Date(), // Add timestamps if desired
        // });
        // const newUser = { id: docRef.id, username, email }; // Simulate created user data
        // --- END DATABASE LOGIC ---

        // Placeholder new user - REMOVE IN PRODUCTION
        const newUser = {
             id: Date.now().toString(), // Use actual ID from DB
             username,
             email,
             passwordHash // Only needed temporarily if not fetching full user below
        };
        // --- END PLACEHOLDER ---

        console.log("User registered (simulated):", { id: newUser.id, username: newUser.username, email: newUser.email });

        return {
            success: true,
            // Ensure you return only necessary, non-sensitive user data
            user: { id: newUser.id, username: newUser.username, email: newUser.email }
        };

    } catch (error) {
        console.error("Registration Action Error:", error);
        // Consider more specific error handling based on potential DB errors
        return { success: false, error: "An unexpected server error occurred during registration." };
    }
}


// --- LOGIN ACTION ---
export async function loginUser(data: z.infer<typeof loginSchema>): Promise<AuthResult> {
    try {
        const validation = loginSchema.safeParse(data);
        if (!validation.success) {
             console.error("Login validation failed:", validation.error.flatten().fieldErrors);
            return { success: false, error: "Invalid input data." };
        }

        const { email, password } = validation.data;

        // --- DATABASE LOGIC: Find the user by email ---
        // Replace this section with your actual database query
        // Ensure you select the passwordHash field
        // Example using Prisma:
        // const user = await prisma.user.findUnique({
        //     where: { email },
        // });
        // Example using Firestore:
        // const q = query(collection(db, "users"), where("email", "==", email));
        // const querySnapshot = await getDocs(q);
        // const userDoc = querySnapshot.docs[0]; // Get the first matching doc
        // const user = userDoc ? { id: userDoc.id, ...userDoc.data() } : null; // Include document ID
        // --- END DATABASE LOGIC ---

        // Placeholder user find - REMOVE IN PRODUCTION
        // This simulates finding a user - you NEED a real DB query here
        const user: { id: string; username: string; email: string; passwordHash: string } | null = null; // Assume user not found initially
         // Example: if (email === 'test@example.com') {
         //    user = { id: '123', username: 'testuser', email: 'test@example.com', passwordHash: await bcrypt.hash('password123', 10) };
         // }
        // --- END PLACEHOLDER ---

        if (!user) {
             console.log("Login attempt failed: User not found for email", email);
            return { success: false, error: "Invalid email or password." }; // Keep error generic
        }

        // Compare the provided password with the stored hash
        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
             console.log("Login attempt failed: Invalid password for email", email);
            return { success: false, error: "Invalid email or password." }; // Keep error generic
        }

        // Login successful
         console.log("User logged in:", { id: user.id, username: user.username, email: user.email });
        // In a real app, you'd typically generate a session token (JWT) here and handle it.
        // For this context-based auth, we just return user data.
        return {
            success: true,
            // Return only necessary, non-sensitive user data
            user: { id: user.id, username: user.username, email: user.email }
        };

    } catch (error) {
        console.error("Login Action Error:", error);
        return { success: false, error: "An unexpected server error occurred during login." };
    }
}

// --- LOGOUT ACTION ---
// This might involve clearing server-side session state or blacklisting tokens in a real app.
export async function logoutUser(): Promise<{ success: boolean }> {
     try {
        // --- SESSION INVALIDATION LOGIC (if applicable) ---
        // If using server-side sessions or JWT blacklist, perform cleanup here.
        // Example: await invalidateSessionToken(userId);
        // Example: await blacklistToken(token);
        // --- END SESSION INVALIDATION LOGIC ---

        console.log("Logout action called on server.");
        return { success: true };
     } catch (error) {
         console.error("Logout Action Error:", error);
         return { success: false }; // Indicate failure, client-side context handles UI update
     }
}

    