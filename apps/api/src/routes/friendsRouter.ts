import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
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

router.get('/count', authMiddleware, getFriendCount); // Använd GET request för att få hur många vänner en profil har
router.get('/search', authMiddleware, searchUsers); // Använd GET request för att söka efter andra profiler
router.get('/pending', authMiddleware, getPendingRequests); // Använd GET request för att få väntande vänföfrågningar
router.post('/request/:friendId', authMiddleware, sendFriendRequest); // Använd POST för att skicka vänförfrågan
router.post('/accept/:requesterId', authMiddleware, acceptFriendRequest); // Använd POST för att acceptera vänförfrågan
router.delete('/:friendId', authMiddleware, removeFriend); // Använd POST för att neka vänförfrågan
router.get('/', authMiddleware, getFriends); // Använd GET för att få fram vilka andra profiler som är vän med den inloggade profilen

export default router;
