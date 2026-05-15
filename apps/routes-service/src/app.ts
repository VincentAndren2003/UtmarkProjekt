import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import routeRecordsRouter from './routes/routeRecordsRouter';
import runsRouter from './routes/runsRouter';
import challengesRouter from './routes/challengesRouter';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'routes-service' });
  });

  app.use('/routes', routeRecordsRouter);
  app.use('/runs', runsRouter);
  app.use('/challenges', challengesRouter);

  app.use(errorHandler);
  return app;
}