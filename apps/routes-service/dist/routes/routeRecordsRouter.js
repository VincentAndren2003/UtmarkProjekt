"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// apps/routes-service/src/routes/routeRecordsRouter.ts
const express_1 = require("express");
const gatewayAuthMiddleware_1 = require("../middleware/gatewayAuthMiddleware");
const routeRecordsController_1 = require("../controllers/routeRecordsController");
const router = (0, express_1.Router)();
router.post('/', gatewayAuthMiddleware_1.gatewayAuthMiddleware, routeRecordsController_1.postRoute);
router.get('/:id', gatewayAuthMiddleware_1.gatewayAuthMiddleware, routeRecordsController_1.getRouteById);
exports.default = router;
