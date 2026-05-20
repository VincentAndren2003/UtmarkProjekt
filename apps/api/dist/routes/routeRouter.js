"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const routeController_1 = require("../controllers/routeController");
const router = (0, express_1.Router)();
// Här definierar vi POST-rutten
router.post('/generate-route', routeController_1.generateRouteController);
exports.default = router;
