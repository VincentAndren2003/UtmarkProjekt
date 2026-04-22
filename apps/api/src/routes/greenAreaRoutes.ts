import { Router, Request, Response } from 'express';
import { GreenAreaService } from '../services/GreenAreaService';

const router = Router();
const greenAreaService = new GreenAreaService();

router.get('/', async (req: Request, res: Response) => {
    const { lat, lng, radius = '1000' } = req.query;

    if (typeof lat !== 'string' || typeof lng !== 'string') {
        res.status(400).json({ error: 'lat och lng krävs som query-parametrar' });
        return;
    }

    try {
    const data = await greenAreaService.fetchGreenAreas(
      Number(lat),
      Number(lng),
      typeof radius === 'string' ? Number(radius) : 1000
    );
    res.json(data);
  } catch (error) {
    console.error('Fel:', error);
    res.status(500).json({ error: 'Kunde inte hämta grönområden' });
  }
});

export default router;