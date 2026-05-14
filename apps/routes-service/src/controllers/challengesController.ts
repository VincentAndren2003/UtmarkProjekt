import { Request, Response, NextFunction } from 'express';
import { RoutesService } from '../services/RoutesService';

const service = new RoutesService();

export async function postChallenge(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { friendId, routeId, sourceRunId } = req.body as {
      friendId?: string;
      routeId?: string;
      sourceRunId?: string;
    };
    if (!friendId || !routeId) {
      res.status(400).json({ error: 'friendId och routeId krävs' });
      return;
    }
    const doc = await service.createChallenge(req.userId, {
      toUserId: friendId,
      routeId,
      sourceRunId,
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
}

export async function getMyChallenges(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const list = await service.listMyChallenges(req.userId);
    res.status(200).json(list);
  } catch (e) {
    next(e);
  }
}
