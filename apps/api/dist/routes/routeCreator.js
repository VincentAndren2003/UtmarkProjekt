"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const route_1 = require("../routes/route");
const router = (0, express_1.Router)();
router.post('/generate-route', (req, res) => {
    try {
        const { id, start, distance, type } = req.body;
        const newRoute = new route_1.route(id, start, distance);
        const checkpoints = newRoute.setCheckpoints();
        res.status(200).json({
            id: newRoute.id,
            start: newRoute.start,
            distance: newRoute.distance,
            checkpoints: checkpoints
        });
    }
    catch (error) {
        res.status(500).json({ message: "Rutt kunnde inte genegeras" });
    }
});
exports.default = router;
