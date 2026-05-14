import { Request, Response, NextFunction} from 'express';

type AppError = Error & { status?: number };

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  console.error(err.stack);
  
  res.status(status).json({ error: message });
}
