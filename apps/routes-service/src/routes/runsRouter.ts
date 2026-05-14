// apps/routes-service/src/routes/runsRouter.ts
import { Router } from 'express';
import { gatewayAuthMiddleware } from '../middleware/gatewayAuthMiddleware';
import {
  getMyRuns,
  patchCompleteRun,
  postRun,
} from '../controllers/runsController';

const router = Router();
router.post('/', gatewayAuthMiddleware, postRun);
router.get('/me', gatewayAuthMiddleware, getMyRuns);
router.patch('/:id/complete', gatewayAuthMiddleware, patchCompleteRun);
export default router;