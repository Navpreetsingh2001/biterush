// src/lib/db.ts
import mongoose, { type ConnectionStates } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    throw new Error(
        'Please define the MONGODB_URI environment variable inside .env'
    );
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
// Extend the NodeJS global type with a mongoose property
declare const global: typeof globalThis & {
    mongoose: {
        conn: typeof mongoose | null;
        promise: Promise<typeof mongoose> | null;
    };
};


let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

async function connectDB(): Promise<typeof mongoose> {
    if (cached.conn) {
        // console.log('Using cached database connection');
        return cached.conn;
    }

    if (!cached.promise) {
        const opts = {
            bufferCommands: false,
            // Add other Mongoose connection options if needed
            // useNewUrlParser: true, // Not needed in Mongoose 6+
            // useUnifiedTopology: true, // Not needed in Mongoose 6+
        };

        console.log('Creating new database connection...');
        cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongooseInstance) => {
            console.log('Database connected successfully!');
            return mongooseInstance;
        }).catch((error) => {
             console.error("Database connection error:", error);
             cached.promise = null; // Reset promise on error
             throw error; // Re-throw error after logging
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
}

// Helper function to check connection status
export function getConnectionState(): ConnectionStates {
  return mongoose.connection.readyState;
}


export default connectDB;
