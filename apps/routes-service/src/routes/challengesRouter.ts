// apps/routes-service/src/routes/challengesRouter.ts
import { Router } from 'express';
import { gatewayAuthMiddleware } from '../middleware/gatewayAuthMiddleware';
import { getMyChallenges, postChallenge } from '../controllers/challengesController';

const router = Router();
router.post('/', gatewayAuthMiddleware, postChallenge);
router.get('/me', gatewayAuthMiddleware, getMyChallenges);
export default router;