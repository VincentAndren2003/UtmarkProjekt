import { createApp } from './app';
import { env } from './config/env';
import mongoose from 'mongoose';

async function bootstrap(): Promise<void> {
  await mongoose.connect(env.MONGODB_URI, {
    dbName: env.DB_NAME,
  });
  console.warn('Ansluten till MongoDB');

  const app = createApp();
  app.listen(env.PORT, () => {
    console.warn(`API listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
