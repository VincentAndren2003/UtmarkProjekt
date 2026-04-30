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

// Controllers — these are the actual functions that run for each URL.
// They live in src/controllers/ and do the real work (DB calls, hashing, etc.).
import { signup, login } from './controllers/authController';
import { getMyProfile, upsertMyProfile } from './controllers/profileController';
import { listGreenAreas } from './controllers/greenAreaController';

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
  app.post('/api/auth/signup', signup);
  app.post('/api/auth/login', login);

  // Profile (protected — authMiddleware runs first; if no valid JWT it
  // returns 401 and the controller never runs).
  app.get('/api/profile/me', authMiddleware, getMyProfile);
  app.put('/api/profile/me', authMiddleware, upsertMyProfile);

  // Green areas (public — anyone can view).
  app.get('/api/green-areas', listGreenAreas);

  // Error handler, Express identifies it by the 4 args
  // (err, req, res, next). Any error thrown in a controller and passed to
  // next(err) lands here and gets turned into a JSON response.
  app.use(errorHandler);

  return app;
}
