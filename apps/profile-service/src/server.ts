import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.warn(`profile-service listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start profile-service:', err);
  process.exit(1);
});
