import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriend,
  getFriends,
  getPendingRequests,
} from '../controllers/friendsController';
import { getFriendCount } from '../controllers/friendsController';

const router = Router();

router.get('/count', authMiddleware, getFriendCount);
router.get('/pending', authMiddleware, getPendingRequests);
router.post('/request/:friendId', authMiddleware, sendFriendRequest);
router.post('/accept/:requesterId', authMiddleware, acceptFriendRequest);
router.delete('/:friendId', authMiddleware, removeFriend);
router.get('/', authMiddleware, getFriends);

export default router;
