import dns from 'dns/promises';

dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';


declare global {
  var mongooseCache: {
    conn: typeof mongoose | null;
    promise: Promise<typeof mongoose> | null;
  };
}

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) {
  throw new Error('Please define MONGODB_URI in .env.local');
}

let cached = global.mongooseCache;

if (!cached) {
  cached = global.mongooseCache = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
      minPoolSize: 2,
      socketTimeoutMS: 60000,
      connectTimeoutMS: 30000,
      serverSelectionTimeoutMS: 30000,
      family: 4, // ✅ force IPv4 to avoid DNS issues
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts)
      .then((mongoose) => {
        console.log('✅ MongoDB connected');
        return mongoose;
      })
      .catch((err) => {
        console.error('❌ MongoDB connection error:', err);
        cached.promise = null;
        throw err;
      });
  }
  cached.conn = await cached.promise;
  return cached.conn;
}

export async function getMongoClient() {
  if (!cached.conn) await connectToDatabase();
  return (mongoose.connection as any).client as MongoClient;
}

// ✅ For NextAuth adapter – returns a promise that resolves to MongoClient
export const clientPromise = getMongoClient();