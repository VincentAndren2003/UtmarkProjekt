import { Request, Response } from 'express';
import { Route } from '../models/Route';
import { GreenAreaService } from '../services/GreenAreaService';
import { normalizeDistance } from '../utils/routeUtils';

const greenAreaService = new GreenAreaService();

export const generateRouteController = async (req: Request, res: Response) => {
  try {
    const { id, start, distance } = req.body;

    const normalizedDistance = normalizeDistance(distance);
    const greenAreas = await greenAreaService.fetchGreenAreas(
      start.latitude,
      start.longitude,
      normalizedDistance * 1000
    );

    const newRoute = new Route(id, start, normalizedDistance);
    const checkpoints = newRoute.setCheckpoints(
      undefined,
      undefined,
      undefined,
      greenAreas
    );

    res.status(200).json({
      id: newRoute.id,
      start: newRoute.start,
      distance: newRoute.distance,
      checkpoints: checkpoints,
    });
  } catch (error) {
    console.error('Error generating route:', error);
    res.status(500).json({ message: 'Rutt kunde inte genereras' });
  }
};
