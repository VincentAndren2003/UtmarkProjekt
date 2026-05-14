"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// apps/routes-service/src/routes/challengesRouter.ts
const express_1 = require("express");
const gatewayAuthMiddleware_1 = require("../middleware/gatewayAuthMiddleware");
const challengesController_1 = require("../controllers/challengesController");
const router = (0, express_1.Router)();
router.post('/', gatewayAuthMiddleware_1.gatewayAuthMiddleware, challengesController_1.postChallenge);
router.get('/me', gatewayAuthMiddleware_1.gatewayAuthMiddleware, challengesController_1.getMyChallenges);
exports.default = router;
