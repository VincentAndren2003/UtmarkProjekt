import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import friendsRouter from './routes/friendsRouter';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'friend-service' });
  });

 app.use('/api/friends', friendsRouter);

  app.use(errorHandler);
  return app;
}
