"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRouteController = void 0;
const Route_1 = require("../models/Route");
const GreenAreaService_1 = require("../services/GreenAreaService");
const routeUtils_1 = require("../utils/routeUtils");
const greenAreaService = new GreenAreaService_1.GreenAreaService();
const generateRouteController = async (req, res) => {
    try {
        const { id, start, distance, filters, end } = req.body;
        const normalizedDistance = (0, routeUtils_1.normalizeDistance)(distance);
        const normalizedFilters = (0, routeUtils_1.normalizeFilters)(filters); // Vad är detta? Vad gör det?
        const greenAreas = await greenAreaService.fetchGreenAreas(start.latitude, start.longitude, normalizedDistance * 1000);
        const newRoute = new Route_1.Route(id, start, normalizedDistance, end);
        const checkpoints = newRoute.setCheckpoints(undefined, undefined, undefined, greenAreas);
        res.status(200).json({
            id: newRoute.id,
            start: newRoute.start,
            end: newRoute.end,
            distance: newRoute.distance,
            filters: normalizedFilters,
            checkpoints: checkpoints,
        });
    }
    catch (error) {
        console.error('Error generating route:', error);
        res.status(500).json({ message: 'Rutt kunde inte genereras' });
    }
};
exports.generateRouteController = generateRouteController;
