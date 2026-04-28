import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function bootstrap(): Promise<void> {
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.warn(`API listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start API:', err);
  process.exit(1);
});
