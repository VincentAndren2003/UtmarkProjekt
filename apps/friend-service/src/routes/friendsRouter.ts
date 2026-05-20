import { Router } from 'express';
import { gatewayAuthMiddleware } from '../middleware/gatewayAuthMiddleware';
import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
  getFriendCount,
  searchUsers,
} from '../controllers/friendsController';

const router = Router();

router.get('/count', gatewayAuthMiddleware, getFriendCount); // Använd GET request för att få hur många vänner en profil har
router.get('/search', gatewayAuthMiddleware, searchUsers); // Använd GET request för att söka efter andra profiler
router.get('/pending', gatewayAuthMiddleware, getPendingRequests); // Använd GET request för att få väntande vänföfrågningar
router.post('/request/:friendId', gatewayAuthMiddleware, sendFriendRequest); // Använd POST för att skicka vänförfrågan
router.post('/accept/:requesterId', gatewayAuthMiddleware, acceptFriendRequest); // Använd POST för att acceptera vänförfrågan
router.delete('/:friendId', gatewayAuthMiddleware, removeFriend); // Använd POST för att neka vänförfrågan
router.get('/', gatewayAuthMiddleware, getFriends); // Använd GET för att få fram vilka andra profiler som är vän med den inloggade profilen

export default router;
