"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const gatewayAuthMiddleware_1 = require("./middleware/gatewayAuthMiddleware");
const errorHandler_1 = require("./middleware/errorHandler");
const profileController_1 = require("./controllers/profileController");
const userStatsController_1 = require("./controllers/userStatsController");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGIN }));
    app.use(express_1.default.json());
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', service: 'profile-service' });
    });
    app.get('/profile/me', gatewayAuthMiddleware_1.gatewayAuthMiddleware, profileController_1.getMyProfile);
    app.put('/profile/me', gatewayAuthMiddleware_1.gatewayAuthMiddleware, profileController_1.upsertMyProfile);
    app.delete('/profile/me', gatewayAuthMiddleware_1.gatewayAuthMiddleware, profileController_1.deleteMyProfile);
    app.get('/stats/me', gatewayAuthMiddleware_1.gatewayAuthMiddleware, userStatsController_1.getMyStats);
    app.post('/stats/complete-run', gatewayAuthMiddleware_1.gatewayAuthMiddleware, userStatsController_1.completeRun);
    app.post('/stats/increment-shared', gatewayAuthMiddleware_1.gatewayAuthMiddleware, userStatsController_1.incrementRoutesShared);
    app.post('/stats/increment-recieved', gatewayAuthMiddleware_1.gatewayAuthMiddleware, userStatsController_1.incrementRoutesReceived);
    app.post('/stats/increment-generated', gatewayAuthMiddleware_1.gatewayAuthMiddleware, userStatsController_1.incrementRoutesGenerated);
    app.post('/profile/me/avatar', gatewayAuthMiddleware_1.gatewayAuthMiddleware, profileController_1.uploadAvatar);
    app.use(errorHandler_1.errorHandler);
    return app;
}
