import { createApp } from './app';
import { connectDB } from './config/db';
import { env } from './config/env';

async function bootstrap(): Promise<void> { // Kopplar upp mot MongoDB innan vi startar servern
  await connectDB();
  const app = createApp();
  app.listen(env.PORT, () => {
    console.warn(`auth-service listening on http://localhost:${env.PORT}`);
  });
}

bootstrap().catch((err) => { // Om något går fel så loggar vi och stänger
  console.error('Failed to start auth-service:', err);
  process.exit(1);
});
