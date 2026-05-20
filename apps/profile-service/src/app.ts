import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { gatewayAuthMiddleware } from './middleware/gatewayAuthMiddleware';
import { errorHandler } from './middleware/errorHandler';
import { getMyProfile, upsertMyProfile } from './controllers/profileController';
import {
  getMyStats,
  completeRun,
  incrementRoutesGenerated,
  incrementRoutesReceived,
  incrementRoutesShared
} from './controllers/userStatsController';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'profile-service' });
  });

  app.get('/profile/me', gatewayAuthMiddleware, getMyProfile);
  app.put('/profile/me', gatewayAuthMiddleware, upsertMyProfile);

  app.get('/stats/me', gatewayAuthMiddleware, getMyStats);
  app.put('/stats/complete-run', gatewayAuthMiddleware, completeRun);
  app.put('/stats/increment-shared', gatewayAuthMiddleware, incrementRoutesShared);
  app.put('/stats/increment-recieved', gatewayAuthMiddleware, incrementRoutesReceived);
  app.put('/stats/increment-generated', gatewayAuthMiddleware, incrementRoutesGenerated);

  app.use(errorHandler);
  return app;
}
