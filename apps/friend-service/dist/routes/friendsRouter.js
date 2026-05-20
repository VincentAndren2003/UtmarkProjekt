"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const gatewayAuthMiddleware_1 = require("../middleware/gatewayAuthMiddleware");
const friendsController_1 = require("../controllers/friendsController");
const router = (0, express_1.Router)();
router.get('/count', gatewayAuthMiddleware_1.gatewayAuthMiddleware, friendsController_1.getFriendCount); // Använd GET request för att få hur många vänner en profil har
router.get('/search', gatewayAuthMiddleware_1.gatewayAuthMiddleware, friendsController_1.searchUsers); // Använd GET request för att söka efter andra profiler
router.get('/pending', gatewayAuthMiddleware_1.gatewayAuthMiddleware, friendsController_1.getPendingRequests); // Använd GET request för att få väntande vänföfrågningar
router.post('/request/:friendId', gatewayAuthMiddleware_1.gatewayAuthMiddleware, friendsController_1.sendFriendRequest); // Använd POST för att skicka vänförfrågan
router.post('/accept/:requesterId', gatewayAuthMiddleware_1.gatewayAuthMiddleware, friendsController_1.acceptFriendRequest); // Använd POST för att acceptera vänförfrågan
router.delete('/:friendId', gatewayAuthMiddleware_1.gatewayAuthMiddleware, friendsController_1.removeFriend); // Använd POST för att neka vänförfrågan
router.get('/', gatewayAuthMiddleware_1.gatewayAuthMiddleware, friendsController_1.getFriends); // Använd GET för att få fram vilka andra profiler som är vän med den inloggade profilen
exports.default = router;
