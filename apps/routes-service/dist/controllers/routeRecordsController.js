"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postRoute = postRoute;
exports.getRouteById = getRouteById;
const RoutesService_1 = require("../services/RoutesService");
const paramAsString_1 = require("../utils/paramAsString");
const service = new RoutesService_1.RoutesService();
async function postRoute(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const doc = await service.createRoute(req.userId, req.body);
        res.status(201).json(doc);
    }
    catch (e) {
        next(e);
    }
}
async function getRouteById(req, res, next) {
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
        const doc = await service.getRouteById(req.userId, id);
        res.status(200).json(doc);
    }
    catch (e) {
        next(e);
    }
}
