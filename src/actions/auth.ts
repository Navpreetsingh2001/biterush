"use server";

import { z } from 'zod';
import bcrypt from 'bcryptjs'; // For password hashing
// --- DATABASE INTEGRATION POINT ---
// Import your database client/connection setup here. Examples:
// import prisma from '@/lib/prisma'; // Example for Prisma
// import { db } from '@/lib/firebase'; // Example for Firebase Firestore
// import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import type { User } from '@/context/AuthContext'; // Import User type


// --- CONSTANTS ---
const ADMIN_EMAIL = "admin@biterush.com"; // Define the admin email address

// Schemas for validation
const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters.").max(20, "Username must be at most 20 characters."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password is required."), // Keep min 6 for login check
});

// Define return types for actions
type AuthResult = {
    success: boolean;
    user?: User; // Use the imported User type which includes role
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
         // Prevent admin email registration through the public form (simulation)
         if (email === ADMIN_EMAIL) {
             console.log(`Registration attempt failed: Cannot register with admin email (${email}).`);
             return { success: false, error: "This email address is reserved." };
         }
        // --- END PLACEHOLDER ---

        if (existingUser) {
            console.log(`Registration attempt failed: Email (${email}) or Username (${username}) already exists.`);
            return { success: false, error: "Email or username already exists." };
        }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10); // Salt rounds = 10

        // --- DATABASE LOGIC: Create the new user ---
        // Replace this section with your actual database insertion
        // Ensure you store the 'role' field (default to 'user')
        // Example using Prisma:
        // const newUser = await prisma.user.create({
        //     data: { username, email, passwordHash, role: 'user' },
        // });
        // Example using Firestore:
        // const docRef = await addDoc(collection(db, "users"), {
        //     username,
        //     email,
        //     passwordHash,
        //     role: 'user', // Add role
        //     createdAt: new Date(), // Add timestamps if desired
        // });
        // const newUser = { id: docRef.id, username, email, role: 'user' }; // Simulate created user data
        // --- END DATABASE LOGIC ---

        // Placeholder new user - REMOVE IN PRODUCTION
        const newUser: User = {
             id: Date.now().toString(), // Use actual ID from DB
             username,
             email,
             passwordHash, // Only needed temporarily if not fetching full user below
             role: 'user' // Default role is user
        };
        // --- END PLACEHOLDER ---

        console.log("User registered (simulated):", { id: newUser.id, username: newUser.username, email: newUser.email, role: newUser.role });

        // Exclude passwordHash from the returned user object
        const { passwordHash: _, ...userToReturn } = newUser;

        return {
            success: true,
            user: userToReturn
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
        // Ensure you select the passwordHash and role fields
        // Example using Prisma:
        // const userFromDb = await prisma.user.findUnique({
        //     where: { email },
        // });
        // Example using Firestore:
        // const q = query(collection(db, "users"), where("email", "==", email));
        // const querySnapshot = await getDocs(q);
        // const userDoc = querySnapshot.docs[0]; // Get the first matching doc
        // const userFromDb = userDoc ? { id: userDoc.id, ...userDoc.data() } : null; // Include document ID
        // --- END DATABASE LOGIC ---

        // Placeholder user find - REMOVE IN PRODUCTION
        // This simulates finding a user - you NEED a real DB query here
        let user: User | null = null; // Explicitly type as User | null

         // Example: Simulate finding a user or the admin user
         if (email === ADMIN_EMAIL) {
            // Simulate admin login - IN PRODUCTION, VERIFY PASSWORD FROM DB
            // For simulation, we might just check the password directly or assume it's correct
            // Here, we'll assume password 'adminpass' for the admin
            // VERY INSECURE - ONLY FOR SIMULATION
            const simulatedHashedPassword = await bcrypt.hash('adminpass', 10);
            const isPasswordCorrect = await bcrypt.compare(password, 'adminpass'); //Directly compare password in dev mode

            if (isPasswordCorrect) {
                 user = {
                    id: 'admin-001',
                    username: 'Admin',
                    email: ADMIN_EMAIL,
                    role: 'admin',
                    passwordHash: simulatedHashedPassword // Store simualted hased password here
                    // In a real scenario, you'd fetch the admin's password hash and compare
                    // passwordHash: await bcrypt.hash('adminpass', 10) // Example hash
                 };
                 console.log("Admin login attempt successful (simulated).");
            } else {
                 console.log("Admin login attempt failed: Incorrect password (simulated).");
            }
         } else if (email === 'test@example.com') {
            // Simulate a regular user - NEED DB lookup and hash comparison in production
            const simulatedHashedPassword = await bcrypt.hash('password123', 10);
            const isPasswordCorrect = await bcrypt.compare(password, 'password123'); //Directly compare password in dev mode

            if(isPasswordCorrect) {
                 user = {
                     id: '123',
                     username: 'testuser',
                     email: 'test@example.com',
                     role: 'user',
                     passwordHash: simulatedHashedPassword
                 };
                 console.log("Test user login attempt successful (simulated).");
            } else {
                 console.log("Test user login attempt failed: Incorrect password (simulated).");
            }
         } else{
           //Simulate password for the registered users to use same password
           const simulatedHashedPassword = await bcrypt.hash(password, 10);
           user = {
             id: Date.now().toString(), // Use actual ID from DB
             username: "New user", // username,
             email,
             role: 'user', // Default role is user
             passwordHash: simulatedHashedPassword
            };
         }
        // --- END PLACEHOLDER ---

        if (!user) {
             console.log("Login attempt failed: User not found or invalid password for email", email);
            return { success: false, error: "Invalid email or password." }; // Keep error generic
        }
        // Verify the password
         const isPasswordCorrect = await bcrypt.compare(password, user.passwordHash); // Compare the password
        if(!isPasswordCorrect){
           console.log("Login attempt failed: Incorrect password for email", email);
            return { success: false, error: "Invalid email or password." };
        }


        // Login successful
         console.log("User logged in:", { id: user.id, username: user.username, email: user.email, role: user.role });

        // Exclude passwordHash from the returned user object
        const { passwordHash: _, ...userToReturn } = user;

        return {
            success: true,
            user: userToReturn
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
