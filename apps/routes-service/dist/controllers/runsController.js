"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRun = postRun;
exports.patchCompleteRun = patchCompleteRun;
exports.getMyRuns = getMyRuns;
const RoutesService_1 = require("../services/RoutesService");
const paramAsString_1 = require("../utils/paramAsString");
const service = new RoutesService_1.RoutesService();
async function postRun(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const { routeId } = req.body;
        if (!routeId) {
            res.status(400).json({ error: 'routeId krävs' });
            return;
        }
        const run = await service.createRun(req.userId, routeId);
        res.status(201).json(run);
    }
    catch (e) {
        next(e);
    }
}
async function patchCompleteRun(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const id = (0, paramAsString_1.paramAsString)(req.params.id);
        if (!id) {
            res.status(400).json({ error: 'Ogiltigt id' });
            return;
        }
        const run = await service.completeRun(req.userId, id, req.body);
        res.status(200).json(run);
    }
    catch (e) {
        next(e);
    }
}
async function getMyRuns(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const status = typeof req.query.status === 'string' ? req.query.status : undefined;
        const runs = await service.listMyRuns(req.userId, status);
        res.status(200).json(runs);
    }
    catch (e) {
        next(e);
    }
}
