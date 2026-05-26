import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { gatewayAuthMiddleware } from './middleware/gatewayAuthMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { getMyProfile, upsertMyProfile, deleteMyProfile, uploadAvatar } from './controllers/profileController';
import {
  getMyStats,
  completeRun,
  incrementRoutesGenerated,
  incrementRoutesReceived,
  incrementRoutesShared,
} from './controllers/userStatsController';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json({ limit: '10mb' }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'profile-service' });
  });

  app.get('/profile/me', gatewayAuthMiddleware, getMyProfile);
  app.put('/profile/me', gatewayAuthMiddleware, upsertMyProfile);
  app.delete('/profile/me', gatewayAuthMiddleware, deleteMyProfile);

  app.get('/stats/me', gatewayAuthMiddleware, getMyStats);
  app.post('/stats/complete-run', gatewayAuthMiddleware, completeRun);
  app.post(
    '/stats/increment-shared',
    gatewayAuthMiddleware,
    incrementRoutesShared
  );
  app.post(
    '/stats/increment-recieved',
    gatewayAuthMiddleware,
    incrementRoutesReceived
  );
  app.post(
    '/stats/increment-generated',
    gatewayAuthMiddleware,
    incrementRoutesGenerated
  );

  app.post ('/profile/me/avatar', gatewayAuthMiddleware, uploadAvatar);

  app.use(errorHandler);
  return app;
}
