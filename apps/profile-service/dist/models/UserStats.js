"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStats = void 0;
const mongoose_1 = require("mongoose");
const userStatsSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    routesGeneratedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    routesSharedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    routesRecievedCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    completedRunsCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    maxRunDistanceCompleted: {
        type: Number,
        default: 0,
        min: 0,
    },
    totalDistanceMeters: {
        type: Number,
        default: 0,
        min: 0,
    },
    dayStreakOfCompletedRuns: {
        type: Number,
        default: 0,
        min: 0,
    },
    lastRunCompletedAt: {
        type: Date,
        default: null,
    },
    totalCheckpointsTaken: {
        type: Number,
        default: 0,
        min: 0,
    },
}, { timestamps: true });
exports.UserStats = (0, mongoose_1.model)('UserStats', userStatsSchema);
