import { Request, Response, NextFunction } from 'express';

export function gatewayAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const raw = req.headers['x-user-id'];
  const userId = typeof raw === 'string' ? raw : undefined;
  if (!userId) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  req.userId = userId;
  next();
}