import { Router } from 'express';
import { route } from '../routes/route';

const router = Router();

router.post('/generate-route', (req, res) => {
  try {
    const { id, start, distance, filters = [] } = req.body;
    const normalizedDistance = Math.max(1, Math.min(30, Number(distance) || 1));
    const normalizedFilters = Array.isArray(filters)
      ? filters.filter((filter): filter is string => typeof filter === 'string')
      : [];
    const newRoute = new route(id, start, normalizedDistance);
    const checkpoints = newRoute.setCheckpoints();

    res.status(200).json({
      id: newRoute.id,
      start: newRoute.start,
      distance: newRoute.distance,
      filters: normalizedFilters,
      checkpoints: checkpoints,
    });
  } catch (error) {
    res.status(500).json({ message: 'Rutt kunnde inte genegeras' });
  }
});

export default router;
