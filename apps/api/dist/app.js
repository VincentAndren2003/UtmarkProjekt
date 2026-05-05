"use strict";
// This is THE file that wires up our entire API.
// This file all the URLs the server handles
//
// What it does, in order:
//   1. Make an Express app
//   2. Plug in middleware (CORS, JSON body parsing)
//   3. Define every route (URL  ->  controller function)
//   4. Plug in the error handler (must be LAST, after all routes)
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
// Middleware
const errorHandler_1 = require("./middleware/errorHandler");
const authMiddleware_1 = require("./middleware/authMiddleware");
// Config
const env_1 = require("./config/env");
// Controllers — these are the actual functions that run for each URL.
// They live in src/controllers/ and do the real work (DB calls, hashing, etc.).
const authController_1 = require("./controllers/authController");
const profileController_1 = require("./controllers/profileController");
const greenAreaController_1 = require("./controllers/greenAreaController");
const routeRouter_1 = __importDefault(require("./routes/routeRouter"));
function createApp() {
    const app = (0, express_1.default)();
    // CORS lets the mobile app (different origin) call this API.
    // env.CORS_ORIGIN says which origins are allowed (set in .env).
    app.use((0, cors_1.default)({ origin: env_1.env.CORS_ORIGIN }));
    app.use(express_1.default.json());
    // Health check —
    app.get('/api/health', (_req, res) => {
        res.json({ status: 'ok' });
    });
    // Auth (public — no JWT required to call these).
    app.post('/api/auth/signup', authController_1.signup);
    app.post('/api/auth/login', authController_1.login);
    // Profile (protected — authMiddleware runs first; if no valid JWT it
    // returns 401 and the controller never runs).
    app.get('/api/profile/me', authMiddleware_1.authMiddleware, profileController_1.getMyProfile);
    app.put('/api/profile/me', authMiddleware_1.authMiddleware, profileController_1.upsertMyProfile);
    // Green areas (public — anyone can view).
    app.get('/api/green-areas', greenAreaController_1.listGreenAreas);
    // route
    app.post('/api/routes/generate-route', (req, res) => {
        res.json({ debug: 'direkt route fungerar' });
    });
    app.use('/api/routes', routeRouter_1.default);
    // Error handler, Express identifies it by the 4 args
    // (err, req, res, next). Any error thrown in a controller and passed to
    // next(err) lands here and gets turned into a JSON response.
    app.use(errorHandler_1.errorHandler);
    return app;
}
