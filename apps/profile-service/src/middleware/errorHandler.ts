import { Request, Response, NextFunction } from 'express';

type AppError = Error & { status?: number };

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status ?? 500;
  if (status >= 500) {
    console.error(err);
  }
  res.status(status).json({ error: err.message ?? 'Internal server error' });
}

