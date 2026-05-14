"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postChallenge = postChallenge;
exports.getMyChallenges = getMyChallenges;
const RoutesService_1 = require("../services/RoutesService");
const service = new RoutesService_1.RoutesService();
async function postChallenge(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { friendId, routeId, sourceRunId } = req.body;
        if (!friendId || !routeId) {
            res.status(400).json({ error: 'friendId och routeId krävs' });
            return;
        }
        const doc = await service.createChallenge(req.userId, {
            toUserId: friendId,
            routeId,
            sourceRunId,
        });
        res.status(201).json(doc);
    }
    catch (e) {
        next(e);
    }
}
async function getMyChallenges(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const list = await service.listMyChallenges(req.userId);
        res.status(200).json(list);
    }
    catch (e) {
        next(e);
    }
}
