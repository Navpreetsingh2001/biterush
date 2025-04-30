
"use server";

import { z } from 'zod';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db'; // Import DB connection utility
import User, { type IUser } from '@/models/User'; // Import Mongoose User model and IUser type
import type { User as AuthUser } from '@/context/AuthContext'; // Import User type for return value

// --- CONSTANTS ---
// Define roles within the application
const ROLES = {
    USER: 'user',
    ADMIN: 'admin',
    SUPER_ADMIN: 'superAdmin',
    VENDOR: 'vendor',
} as const;

// Define default emails for simulation (consider removing or securing these better in production)
const ADMIN_EMAIL = "admin@biterush.com";
const SUPER_ADMIN_EMAIL = "superadmin@biterush.com";
const VENDOR_EMAIL = "vendor@biterush.com";

// Schemas for validation
const registerSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters.").max(20, "Username must be at most 20 characters."),
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password is required."),
});

// Define return types for actions
type AuthResult = {
    success: boolean;
    user?: AuthUser; // Use the context's User type for consistency
    error?: string;
};

// Helper to convert Mongoose document to plain object suitable for context/client
const sanitizeUser = (userDoc: IUser): AuthUser => {
    const userObject = userDoc.toObject();
    // Ensure role is one of the expected types
    const role: AuthUser['role'] = Object.values(ROLES).includes(userObject.role as any)
        ? userObject.role as AuthUser['role']
        : ROLES.USER; // Default to 'user' if role is unexpected

    return {
        id: userObject._id.toString(), // Convert ObjectId to string
        username: userObject.username,
        email: userObject.email,
        role: role,
    };
};

// --- REGISTER ACTION ---
export async function registerUser(data: z.infer<typeof registerSchema>): Promise<AuthResult> {
    try {
        const validation = registerSchema.safeParse(data);
        if (!validation.success) {
             console.error("Registration validation failed:", validation.error.flatten().fieldErrors);
            return { success: false, error: "Invalid input data. Please check the fields." };
        }

        await connectDB(); // Ensure database connection

        const { username, email, password } = validation.data;

        // Check if email or username already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] }).lean(); // Use lean for performance

        if (existingUser) {
            const message = existingUser.email === email
                ? `Email (${email}) already exists.`
                : `Username (${username}) already exists.`;
            console.log(`Registration attempt failed: ${message}`);
            return { success: false, error: message };
        }

         // Prevent registration with reserved emails through public form
         if ([ADMIN_EMAIL, SUPER_ADMIN_EMAIL, VENDOR_EMAIL].includes(email)) {
             console.log(`Registration attempt failed: Cannot register with reserved email (${email}).`);
             return { success: false, error: "This email address is reserved." };
         }

        // Hash the password
        const passwordHash = await bcrypt.hash(password, 10);

        // Create the new user
        const newUserDoc = new User({
            username,
            email,
            passwordHash,
            role: ROLES.USER, // Default role for public registration
        });
        await newUserDoc.save();

        console.log("User registered:", { id: newUserDoc._id, username: newUserDoc.username, email: newUserDoc.email, role: newUserDoc.role });

        const userToReturn = sanitizeUser(newUserDoc);

        return {
            success: true,
            user: userToReturn
        };

    } catch (error) {
        console.error("Registration Action Error:", error);
        if (error instanceof Error && error.message.includes('duplicate key error')) {
             // More specific error for unique constraints
            return { success: false, error: "Email or username already taken." };
        }
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

        await connectDB(); // Ensure database connection

        const { email, password } = validation.data;

        // Find the user by email - select passwordHash explicitly
        const userDoc = await User.findOne({ email }).select('+passwordHash'); // Include passwordHash

        if (!userDoc) {
             console.log("Login attempt failed: User not found for email", email);
            return { success: false, error: "Invalid email or password." }; // Keep error generic
        }

        // Verify the password
        const isPasswordCorrect = await bcrypt.compare(password, userDoc.passwordHash);
        if (!isPasswordCorrect) {
           console.log("Login attempt failed: Incorrect password for email", email);
            return { success: false, error: "Invalid email or password." }; // Keep error generic
        }

        // Login successful
         console.log("User logged in:", { id: userDoc._id, username: userDoc.username, email: userDoc.email, role: userDoc.role });

        const userToReturn = sanitizeUser(userDoc);

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
// Remains the same as it primarily deals with client-side state management.
// Server-side token invalidation would be added here if using JWTs.
export async function logoutUser(): Promise<{ success: boolean }> {
     try {
        console.log("Logout action called on server.");
        return { success: true };
     } catch (error) {
         console.error("Logout Action Error:", error);
         return { success: false };
     }
}


// --- SEED FUNCTION (Optional: For Development/Testing) ---
// This function can be called manually or via a script to create initial admin/vendor users.
// **DO NOT expose this directly as an API endpoint without strict authentication.**
export async function seedInitialUsers() {
    try {
        await connectDB();

        const usersToSeed = [
            { email: SUPER_ADMIN_EMAIL, username: 'SuperAdmin', password: 'superpass', role: ROLES.SUPER_ADMIN },
            { email: ADMIN_EMAIL, username: 'AdminUser', password: 'adminpass', role: ROLES.ADMIN },
            { email: VENDOR_EMAIL, username: 'VendorUser', password: 'vendorpass', role: ROLES.VENDOR },
        ];

        for (const userData of usersToSeed) {
            const existingUser = await User.findOne({ email: userData.email });
            if (!existingUser) {
                const passwordHash = await bcrypt.hash(userData.password, 10);
                const newUser = new User({
                    email: userData.email,
                    username: userData.username,
                    passwordHash: passwordHash,
                    role: userData.role,
                });
                await newUser.save();
                console.log(`Seeded user: ${userData.email} with role ${userData.role}`);
            } else {
                console.log(`User ${userData.email} already exists, skipping seed.`);
                // Optional: Update password or role if needed
                // existingUser.passwordHash = await bcrypt.hash(userData.password, 10);
                // existingUser.role = userData.role;
                // await existingUser.save();
                // console.log(`Updated user: ${userData.email}`);
            }
        }
        console.log("Initial user seeding process completed.");
    } catch (error) {
        console.error("Error seeding initial users:", error);
    }
}

// Example of how to potentially run the seed function (e.g., from a separate script)
// if (process.env.NODE_ENV === 'development' && process.env.RUN_SEED === 'true') {
//     seedInitialUsers().catch(console.error);
// }
