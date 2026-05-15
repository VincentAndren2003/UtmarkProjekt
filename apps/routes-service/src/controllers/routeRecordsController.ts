import { Request, Response, NextFunction } from 'express';
import { RoutesService } from '../services/RoutesService';
import { paramAsString } from '../utils/paramAsString';

const service = new RoutesService();

export async function postRoute(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const doc = await service.createRoute(req.userId, req.body);
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

export async function getRouteById(
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
    const doc = await service.getRouteById(req.userId, id);
    res.status(200).json(doc);
  } catch (e) {
    next(e);
  }
}