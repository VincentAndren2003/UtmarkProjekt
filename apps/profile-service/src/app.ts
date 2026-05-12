import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { gatewayAuthMiddleware } from './middleware/gatewayAuthMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { getMyProfile, upsertMyProfile } from './controllers/profileController';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'profile-service' });
  });

  // Protected profile endpoints (gateway forwards /api/profile/* here)
  app.get('/profile/me', gatewayAuthMiddleware, getMyProfile);
  app.put('/profile/me', gatewayAuthMiddleware, upsertMyProfile);

  app.use(errorHandler);
  return app;
}
