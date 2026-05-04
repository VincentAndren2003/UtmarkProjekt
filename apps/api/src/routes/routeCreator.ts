import { Router } from 'express';
import { route } from '../routes/route';

const router = Router();

router.post('/generate-route', (req, res) => {
  try {
    const { id, start, distance, type } = req.body;
    const newRoute = new route(id, start, distance);
    const checkpoints = newRoute.setCheckpoints();

    res.status(200).json({
      id: newRoute.id,
      start: newRoute.start,
      distance: newRoute.distance,
      checkpoints: checkpoints,
    });
  } catch (error) {
    res.status(500).json({ message: 'Rutt kunnde inte genegeras' });
  }
});

export default router;
