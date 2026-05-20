"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gatewayAuthMiddleware = gatewayAuthMiddleware;
/**
 * This service trusts the API gateway to verify JWTs.
 * Gateway must forward `x-user-id` for protected routes.
 */
function gatewayAuthMiddleware(req, res, next) {
    const userId = req.header('x-user-id');
    if (!userId) {
        res
            .status(401)
            .json({ error: 'Missing x-user-id (gateway auth required)' });
        return;
    }
    req.userId = userId;
    next();
}
