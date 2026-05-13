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

router.post('/request/:friendId', authMiddleware, sendFriendRequest);
router.post('/accept/:requesterId', authMiddleware, acceptFriendRequest);
router.delete('/:friendId', authMiddleware, removeFriend);
router.get('/', authMiddleware, getFriends);
router.get('/pending', authMiddleware, getPendingRequests);
router.get('count', getFriendCount)

export default router;
