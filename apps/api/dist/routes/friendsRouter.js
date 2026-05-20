"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const friendsController_1 = require("../controllers/friendsController");
const router = (0, express_1.Router)();
router.get('/count', authMiddleware_1.authMiddleware, friendsController_1.getFriendCount); // Använd GET request för att få hur många vänner en profil har
router.get('/search', authMiddleware_1.authMiddleware, friendsController_1.searchUsers); // Använd GET request för att söka efter andra profiler
router.get('/pending', authMiddleware_1.authMiddleware, friendsController_1.getPendingRequests); // Använd GET request för att få väntande vänföfrågningar
router.post('/request/:friendId', authMiddleware_1.authMiddleware, friendsController_1.sendFriendRequest); // Använd POST för att skicka vänförfrågan
router.post('/accept/:requesterId', authMiddleware_1.authMiddleware, friendsController_1.acceptFriendRequest); // Använd POST för att acceptera vänförfrågan
router.delete('/:friendId', authMiddleware_1.authMiddleware, friendsController_1.removeFriend); // Använd POST för att neka vänförfrågan
router.get('/', authMiddleware_1.authMiddleware, friendsController_1.getFriends); // Använd GET för att få fram vilka andra profiler som är vän med den inloggade profilen
exports.default = router;
