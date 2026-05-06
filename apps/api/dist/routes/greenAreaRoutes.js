"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const GreenAreaService_1 = require("../services/GreenAreaService");
const router = (0, express_1.Router)();
const greenAreaService = new GreenAreaService_1.GreenAreaService();
router.get('/', async (req, res) => {
    const { lat, lng, radius = '1000' } = req.query;
    if (typeof lat !== 'string' || typeof lng !== 'string') {
        res.status(400).json({ error: 'lat och lng krävs som query-parametrar' });
        return;
    }
    try {
        const data = await greenAreaService.fetchGreenAreas(Number(lat), Number(lng), typeof radius === 'string' ? Number(radius) : 1000);
        res.json(data);
    }
    catch (error) {
        console.error('Fel:', error);
        res.status(500).json({ error: 'Kunde inte hämta grönområden' });
    }
});
exports.default = router;
