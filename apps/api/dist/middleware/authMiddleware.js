"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../utils/jwt");
function authMiddleware(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Missing or invalid Authorization header' });
        return;
    }
    try {
        const { userId } = (0, jwt_1.verifyToken)(header.slice('Bearer '.length));
        req.userId = userId;
        next();
    }
    catch {
        res.status(401).json({ error: 'Invalid or expired token' });
    }
}
