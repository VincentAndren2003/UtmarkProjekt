import mongoose from 'mongoose';
import { env } from './env';

export async function connectDB(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI);
  console.warn('MongoDB connected (auth-service)');
}
