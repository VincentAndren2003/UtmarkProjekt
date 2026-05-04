import { Router } from 'express';
import { generateRouteController } from '../controllers/routeController';

const router = Router();

// Här definierar vi POST-rutten
router.post('/generate-route', generateRouteController);

export default router;