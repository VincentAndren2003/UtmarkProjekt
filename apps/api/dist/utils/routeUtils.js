"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeDistance = normalizeDistance;
exports.normalizeFilters = normalizeFilters;
function normalizeDistance(distance) {
    return Math.max(1, Math.min(30, Number(distance) || 1));
}
function normalizeFilters(filters) {
    return Array.isArray(filters)
        ? filters.filter((f) => typeof f === 'string')
        : [];
}
