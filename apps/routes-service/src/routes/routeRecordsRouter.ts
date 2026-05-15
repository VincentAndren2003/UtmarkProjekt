// apps/routes-service/src/routes/routeRecordsRouter.ts
import { Router } from 'express';
import { gatewayAuthMiddleware } from '../middleware/gatewayAuthMiddleware';
import { getRouteById, postRoute } from '../controllers/routeRecordsController';

const router = Router();
router.post('/', gatewayAuthMiddleware, postRoute);
router.get('/:id', gatewayAuthMiddleware, getRouteById);
export default router;