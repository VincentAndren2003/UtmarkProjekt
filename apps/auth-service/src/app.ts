import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { signup, login } from './controllers/authController';
import { errorHandler } from './middleware/errorHandler';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'auth-service' });
  });

  // Public auth endpoints (gateway forwards /api/auth/* here)
  app.post('/auth/signup', signup);
  app.post('/auth/login', login);

  app.use(errorHandler);
  return app;
}
