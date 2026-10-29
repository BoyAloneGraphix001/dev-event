import mongoose, { type Mongoose } from 'mongoose';

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Reuse the cache across hot reloads in the development server.
declare global {
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = globalThis.mongooseCache ?? {
  conn: null,
  promise: null,
};

globalThis.mongooseCache = cached;

/** Connect to MongoDB and return the shared Mongoose instance. */
export async function connectToDatabase(): Promise<Mongoose> {
  const mongoUri = process.env.MONGODB_URI;

  if (!mongoUri) {
    throw new Error('Missing MONGODB_URI environment variable.');
  }

  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongoUri).then((connection) => connection);
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    // Allow a failed connection attempt to be retried.
    cached.promise = null;
    throw error;
  }
}
