"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const env_1 = require("./config/env");
const authController_1 = require("./controllers/authController");
const errorHandler_1 = require("./middleware/errorHandler");
function createApp() {
    const app = (0, express_1.default)();
    app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGIN }));
    app.use(express_1.default.json());
    app.get('/health', (_req, res) => {
        res.json({ status: 'ok', service: 'auth-service' });
    });
    // Public auth endpoints (gateway forwards /api/auth/* here)
    app.post('/auth/signup', authController_1.signup);
    app.post('/auth/login', authController_1.login);
    app.delete('/auth/me', authController_1.deleteMe);
    app.use(errorHandler_1.errorHandler);
    return app;
}
