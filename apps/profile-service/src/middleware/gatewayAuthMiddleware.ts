import { Request, Response, NextFunction } from 'express';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * This service trusts the API gateway to verify JWTs.
 * Gateway must forward `x-user-id` for protected routes.
 */
export function gatewayAuthMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const userId = req.header('x-user-id');
  if (!userId) {
    res
      .status(401)
      .json({ error: 'Missing x-user-id (gateway auth required)' });
    return;
  }
  req.userId = userId;
  next();
}
