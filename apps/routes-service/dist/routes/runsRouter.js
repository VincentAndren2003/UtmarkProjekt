"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// apps/routes-service/src/routes/runsRouter.ts
const express_1 = require("express");
const gatewayAuthMiddleware_1 = require("../middleware/gatewayAuthMiddleware");
const runsController_1 = require("../controllers/runsController");
const router = (0, express_1.Router)();
router.post('/', gatewayAuthMiddleware_1.gatewayAuthMiddleware, runsController_1.postRun);
router.get('/me', gatewayAuthMiddleware_1.gatewayAuthMiddleware, runsController_1.getMyRuns);
router.patch('/:id/complete', gatewayAuthMiddleware_1.gatewayAuthMiddleware, runsController_1.patchCompleteRun);
exports.default = router;
