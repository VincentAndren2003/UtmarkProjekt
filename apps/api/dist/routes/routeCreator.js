"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// utdatera ta bort
const express_1 = require("express");
const Route_1 = require("../models/Route");
const router = (0, express_1.Router)();
router.post('/generate-route', (req, res) => {
    try {
        const { id, start, distance, filters = [] } = req.body;
        const normalizedDistance = Math.max(1, Math.min(30, Number(distance) || 1));
        const normalizedFilters = Array.isArray(filters)
            ? filters.filter((filter) => typeof filter === 'string')
            : [];
        const newRoute = new Route_1.Route(id, start, normalizedDistance);
        const checkpoints = newRoute.setCheckpoints();
        res.status(200).json({
            id: newRoute.id,
            start: newRoute.start,
            distance: newRoute.distance,
            filters: normalizedFilters,
            checkpoints: checkpoints,
        });
    }
    catch {
        res.status(500).json({ message: 'Rutt kunnde inte genegeras' });
    }
});
exports.default = router;
