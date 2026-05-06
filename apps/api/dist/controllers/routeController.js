"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRouteController = void 0;
const Route_1 = require("../models/Route");
const generateRouteController = async (req, res) => {
    try {
        const { id, start, distance } = req.body;
        const newRoute = new Route_1.Route(id, start, distance);
        const checkpoints = newRoute.setCheckpoints();
        res.status(200).json({
            id: newRoute.id,
            start: newRoute.start,
            distance: newRoute.distance,
            checkpoints: checkpoints,
        });
    }
    catch (error) {
        console.error('Error generating route:', error);
        res.status(500).json({ message: 'Rutt kunde inte genereras' });
    }
};
exports.generateRouteController = generateRouteController;
