// This is THE file that wires up our entire API.
// This file all the URLs the server handles
//
// What it does, in order:
//   1. Make an Express app
//   2. Plug in middleware (CORS, JSON body parsing)
//   3. Define every route (URL  ->  controller function)
//   4. Plug in the error handler (must be LAST, after all routes)

import express from 'express';
import cors from 'cors';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';

// Config
import { env } from './config/env';

import { listGreenAreas } from './controllers/greenAreaController';
import routeRouter from './routes/routeRouter';
import friendsRouter from './routes/friendsRouter';

async function proxyJson(
  res: express.Response,
  url: string,
  opts: { method: string; body?: unknown; headers?: Record<string, string> }
): Promise<void> {
  const upstream = await fetch(url, {
    method: opts.method,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers ?? {}),
    },
    body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
  });

  const data = await upstream.json().catch(() => ({}));
  res.status(upstream.status).json(data);
}

export function createApp() {
  const app = express();

  // CORS lets the mobile app (different origin) call this API.
  // env.CORS_ORIGIN says which origins are allowed (set in .env).
  app.use(cors({ origin: env.CORS_ORIGIN }));

  app.use(express.json());

  // Health check —
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Auth (public — no JWT required to call these).
  app.post('/api/auth/signup', async (req, res, next) => {
    try {
      await proxyJson(res, `${env.AUTH_SERVICE_URL}/auth/signup`, {
        method: 'POST',
        body: req.body,
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/auth/login', async (req, res, next) => {
    try {
      await proxyJson(res, `${env.AUTH_SERVICE_URL}/auth/login`, {
        method: 'POST',
        body: req.body,
      });
    } catch (err) {
      next(err);
    }
  });

  // Profile (protected — authMiddleware runs first; if no valid JWT it
  // returns 401 and the controller never runs).
  app.get('/api/profile/me', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.PROFILE_SERVICE_URL}/profile/me`, {
        method: 'GET',
        headers: { 'x-user-id': req.userId! },
      });
    } catch (err) {
      next(err);
    }
  });

  app.put('/api/profile/me', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.PROFILE_SERVICE_URL}/profile/me`, {
        method: 'PUT',
        headers: { 'x-user-id': req.userId! },
        body: req.body,
      });
    } catch (err) {
      next(err);
    }
  });

  // Green areas (public — anyone can view).
  app.get('/api/green-areas', listGreenAreas);

  // route
  app.use('/api/routes', routeRouter);

  //Map tiles
  app.use('/tiles', express.static('/var/www/html/tiles'));

  // Friend requests and response
  app.use('/api/friends', friendsRouter);

  // Error handler, Express identifies it by the 4 args
  // (err, req, res, next). Any error thrown in a controller and passed to
  // next(err) lands here and gets turned into a JSON response.
  app.use(errorHandler);

  return app;
}
