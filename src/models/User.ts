
import mongoose, { Schema, Document, models, Model } from 'mongoose';

// Define the interface for the User document
export interface IUser extends Document {
    username: string;
    email: string;
    passwordHash: string;
    // Updated roles
    role: 'user' | 'admin' | 'superAdmin' | 'vendor';
    createdAt: Date;
    updatedAt: Date;
}

// Define the Mongoose schema
const UserSchema: Schema<IUser> = new Schema({
    username: {
        type: String,
        required: [true, 'Username is required.'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long.'],
        maxlength: [20, 'Username cannot exceed 20 characters.']
    },
    email: {
        type: String,
        required: [true, 'Email is required.'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    passwordHash: {
        type: String,
        required: [true, 'Password hash is required.'],
        select: false // Default behavior: don't select password hash unless explicitly requested
    },
    role: {
        type: String,
        // Updated enum to include new roles
        enum: ['user', 'admin', 'superAdmin', 'vendor'],
        default: 'user'
    }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Create and export the Mongoose model
// Check if the model already exists before defining it to prevent Next.js hot-reloading issues
const User: Model<IUser> = models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
