// apps/routes-service/src/routes/challengesRouter.ts
import { Router } from 'express';
import { gatewayAuthMiddleware } from '../middleware/gatewayAuthMiddleware';
import {
  getMyChallenges,
  patchDeclineChallenge,
  postChallenge,
} from '../controllers/challengesController';

const router = Router();
router.post('/', gatewayAuthMiddleware, postChallenge);
router.get('/me', gatewayAuthMiddleware, getMyChallenges);
router.patch('/:id/decline', gatewayAuthMiddleware, patchDeclineChallenge);
export default router;
