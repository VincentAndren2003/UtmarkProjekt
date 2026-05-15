"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatewayAuthMiddleware = gatewayAuthMiddleware;
function gatewayAuthMiddleware(req, res, next) {
    const raw = req.headers['x-user-id'];
    const userId = typeof raw === 'string' ? raw : undefined;
    if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
    }
    req.userId = userId;
    next();
}
