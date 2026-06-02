// Här skapar vi en Expess App
// Samt Definerar alla routes som finns 

import express from 'express';
import cors from 'cors';

// Middleware
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';

// Config
import { env } from './config/env';

import { listGreenAreas } from './controllers/greenAreaController';
import routeRouter from './routes/routeRouter';

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

  // CORS  låter mobile app från olika origin kalla det här apiet.
  // env.CORS_ORIGIN berättar vilka origin som är tillåtna
  app.use(cors({ origin: env.CORS_ORIGIN }));

  app.use(express.json({ limit: '10mb' }));

  // Health check —
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // Auth är publik så ingen jwt behövs för att kalla dessa
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

  // Profile är Skyddad så authMiddleware körs först, Om ingen giltig JWT så returneras 401 och controller körs inte.
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

  app.delete('/api/profile/me', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.PROFILE_SERVICE_URL}/profile/me`, {
        method: 'DELETE',
        headers: { 'x-user-id': req.userId! },
      });
    } catch (err) {
      next(err);
    }
  });
  
  app.post('/api/profile/me/avatar', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.PROFILE_SERVICE_URL}/profile/me/avatar`, {
        method: 'POST',
        headers: { 'x-user-id': req.userId! },
        body: req.body,
      });
    } catch (err) {
      next(err);
    }
  });


  app.delete('/api/auth/me', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.AUTH_SERVICE_URL}/auth/me`, {
        method: 'DELETE',
        headers: { 'x-user-id': req.userId! },
      });
    } catch (err) {
      next(err);
    }
  });

  //USER STATS

  // Fetches stats
  app.get('/api/stats/me', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.PROFILE_SERVICE_URL}/stats/me`, {
        method: 'GET',
        headers: { 'x-user-id': req.userId! },
      });
    } catch (err) {
      next(err);
    }
  });

  // increment-shared
  app.post(
    '/api/stats/increment-shared',
    authMiddleware,
    async (req, res, next) => {
      try {
        await proxyJson(
          res,
          `${env.PROFILE_SERVICE_URL}/stats/increment-shared`,
          {
            method: 'POST',
            headers: { 'x-user-id': req.userId! },
            body: req.body,
          }
        );
      } catch (err) {
        next(err);
      }
    }
  );

  // increment-recieved
  app.post(
    '/api/stats/increment-recieved',
    authMiddleware,
    async (req, res, next) => {
      try {
        await proxyJson(
          res,
          `${env.PROFILE_SERVICE_URL}/stats/increment-recieved`,
          {
            method: 'POST',
            headers: { 'x-user-id': req.userId! },
            body: req.body,
          }
        );
      } catch (err) {
        next(err);
      }
    }
  );

  // increment-generated
  app.post(
    '/api/stats/increment-generated',
    authMiddleware,
    async (req, res, next) => {
      try {
        await proxyJson(
          res,
          `${env.PROFILE_SERVICE_URL}/stats/increment-generated`,
          {
            method: 'POST',
            headers: { 'x-user-id': req.userId! },
            body: req.body,
          }
        );
      } catch (err) {
        next(err);
      }
    }
  );

  // complete-run
  app.post(
    '/api/stats/complete-run',
    authMiddleware,
    async (req, res, next) => {
      try {
        await proxyJson(res, `${env.PROFILE_SERVICE_URL}/stats/complete-run`, {
          method: 'POST',
          headers: { 'x-user-id': req.userId! },
          body: req.body,
        });
      } catch (err) {
        next(err);
      }
    }
  );

  app.post('/api/route-records', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.ROUTES_SERVICE_URL}/routes`, {
        method: 'POST',
        headers: { 'x-user-id': req.userId! },
        body: req.body,
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/route-records/:id', authMiddleware, async (req, res, next) => {
    try {
      const id = encodeURIComponent(String(req.params.id));
      await proxyJson(res, `${env.ROUTES_SERVICE_URL}/routes/${id}`, {
        method: 'GET',
        headers: { 'x-user-id': req.userId! },
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/runs', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.ROUTES_SERVICE_URL}/runs`, {
        method: 'POST',
        headers: { 'x-user-id': req.userId! },
        body: req.body,
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/runs/me', authMiddleware, async (req, res, next) => {
    try {
      const qs =
        typeof req.query.status === 'string'
          ? `?status=${encodeURIComponent(req.query.status)}`
          : '';
      await proxyJson(res, `${env.ROUTES_SERVICE_URL}/runs/me${qs}`, {
        method: 'GET',
        headers: { 'x-user-id': req.userId! },
      });
    } catch (err) {
      next(err);
    }
  });

  app.patch(
    '/api/runs/:id/complete',
    authMiddleware,
    async (req, res, next) => {
      try {
        const id = encodeURIComponent(String(req.params.id));
        await proxyJson(res, `${env.ROUTES_SERVICE_URL}/runs/${id}/complete`, {
          method: 'PATCH',
          headers: { 'x-user-id': req.userId! },
          body: req.body,
        });
      } catch (err) {
        next(err);
      }
    }
  );

  // Green areas Publik så alla kan se
  app.get('/api/green-areas', listGreenAreas);

  // route
  app.use('/api/routes', routeRouter);

  //Map tiles
  app.use('/tiles', express.static('/var/www/html/tiles'));

  // Friend requests och response req.url inkluderar query string
  app.use('/api/friends', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.FRIENDS_SERVICE_URL}/api/friends${req.url}`, {
        method: req.method,
        headers: { 'x-user-id': req.userId! },
        body: req.method !== 'GET' ? req.body : undefined,
      });
    } catch (err) {
      next(err);
    }
  });

  app.post('/api/challenges', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.ROUTES_SERVICE_URL}/challenges`, {
        method: 'POST',
        headers: { 'x-user-id': req.userId! },
        body: req.body,
      });
    } catch (err) {
      next(err);
    }
  });

  app.get('/api/challenges/me', authMiddleware, async (req, res, next) => {
    try {
      await proxyJson(res, `${env.ROUTES_SERVICE_URL}/challenges/me`, {
        method: 'GET',
        headers: { 'x-user-id': req.userId! },
      });
    } catch (err) {
      next(err);
    }
  });

  app.patch(
    '/api/challenges/:id/decline',
    authMiddleware,
    async (req, res, next) => {
      try {
        await proxyJson(
          res,
          `${env.ROUTES_SERVICE_URL}/challenges/${req.params.id}/decline`,
          {
            method: 'PATCH',
            headers: { 'x-user-id': req.userId! },
          }
        );
      } catch (err) {
        next(err);
      }
    }
  );

  // Error handler, Express identifierar detta genom 4 args (err, req, res, next).
  // Dessa fel blir då thrown i en controller och skickad till next(err) som landar här och blir omvandlat till en JSON response.
  app.use(errorHandler);

  return app;
}
