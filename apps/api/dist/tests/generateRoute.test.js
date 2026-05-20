"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const express_1 = __importDefault(require("express"));
const routeRouter_1 = __importDefault(require("../routes/routeRouter"));
const Route_1 = require("../models/Route");
const GreenAreaService_1 = require("../services/GreenAreaService");
const vitest_1 = require("vitest");
vitest_1.vi.mock('../models/Route');
vitest_1.vi.mock('../services/GreenAreaService');
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(routeRouter_1.default);
(0, vitest_1.describe)('POST /generate-route', () => {
    (0, vitest_1.beforeEach)(() => {
        vitest_1.vi.clearAllMocks();
        GreenAreaService_1.GreenAreaService.mockImplementation(() => ({
            fetchGreenAreas: vitest_1.vi.fn().mockResolvedValue([]),
        }));
    });
    (0, vitest_1.afterEach)((context) => {
        // ← Lägg till detta
        if (context.task.result?.state === 'pass') {
            console.log(`PASSED: ${context.task.name}`);
        }
        else {
            console.log(`FAILED: ${context.task.name}`);
        }
    });
    (0, vitest_1.test)('ska returnera 200 med korrekt data', async () => {
        Route_1.Route.mockImplementation(() => ({
            id: 1,
            start: 'Stockholm',
            distance: 10,
            setCheckpoints: () => ['point1', 'point2'],
        }));
        const res = await (0, supertest_1.default)(app)
            .post('/generate-route')
            .send({ id: 1, start: 'Stockholm', distance: 10, filters: ['park'] });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.id).toBe(1);
        (0, vitest_1.expect)(res.body.checkpoints).toEqual(['point1', 'point2']);
        (0, vitest_1.expect)(res.body.filters).toEqual(['park']);
    });
    (0, vitest_1.test)('ska returnera 500 om route kastar ett fel', async () => {
        Route_1.Route.mockImplementation(() => {
            throw new Error('Något gick fel');
        });
        const res = await (0, supertest_1.default)(app)
            .post('/generate-route')
            .send({ id: 1, start: 'Stockholm', distance: 10 });
        (0, vitest_1.expect)(res.status).toBe(500);
        (0, vitest_1.expect)(res.body.message).toBe('Rutt kunde inte genereras');
    });
    (0, vitest_1.test)('ska clampas distance till 30 om för högt värde skickas', async () => {
        Route_1.Route.mockImplementation((id, start, distance) => ({
            id,
            start,
            distance,
            setCheckpoints: () => [],
        }));
        const res = await (0, supertest_1.default)(app)
            .post('/generate-route')
            .send({ id: 1, start: 'Stockholm', distance: 999 })
            .timeout(30000);
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.distance).toBe(30);
    }, 10000);
});
