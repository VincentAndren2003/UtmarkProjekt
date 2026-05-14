import { Request, Response, NextFunction } from 'express';
import { RoutesService } from '../services/RoutesService';
import { paramAsString } from '../utils/paramAsString';

const service = new RoutesService();

export async function postRun(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { routeId } = req.body as { routeId?: string };
    if (!routeId) {
      res.status(400).json({ error: 'routeId krävs' });
      return;
    }
    const run = await service.createRun(req.userId, routeId);
    res.status(201).json(run);
  } catch (e) {
    next(e);
  }
}

export async function patchCompleteRun(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const id = paramAsString(req.params.id);
    if (!id) {
      res.status(400).json({ error: 'Ogiltigt id' });
      return;
    }
    const run = await service.completeRun(req.userId, id, req.body);
    res.status(200).json(run);
  } catch (e) {
    next(e);
  }
}

export async function getMyRuns(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const status =
      typeof req.query.status === 'string' ? req.query.status : undefined;
    const runs = await service.listMyRuns(req.userId, status);
    res.status(200).json(runs);
  } catch (e) {
    next(e);
  }
}