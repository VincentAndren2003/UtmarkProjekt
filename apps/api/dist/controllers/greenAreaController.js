"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listGreenAreas = listGreenAreas;
const GreenAreaService_1 = require("../services/GreenAreaService");
const greenAreaService = new GreenAreaService_1.GreenAreaService();
async function listGreenAreas(req, res, next) {
    try {
        const { lat, lng, radius = '1000' } = req.query;
        if (typeof lat !== 'string' || typeof lng !== 'string') {
            res
                .status(400)
                .json({ error: 'lat and lng are required as query parameters' });
            return;
        }
        const data = await greenAreaService.fetchGreenAreas(Number(lat), Number(lng), typeof radius === 'string' ? Number(radius) : 1000);
        res.status(200).json(data);
    }
    catch (err) {
        next(err);
    }
}
