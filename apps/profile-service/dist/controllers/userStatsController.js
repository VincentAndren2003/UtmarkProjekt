"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyStats = getMyStats;
exports.completeRun = completeRun;
exports.incrementRoutesShared = incrementRoutesShared;
exports.incrementRoutesReceived = incrementRoutesReceived;
exports.incrementRoutesGenerated = incrementRoutesGenerated;
const mongoose_1 = require("mongoose");
const UserStats_1 = require("../models/UserStats");
/**
 * GET /stats/me
 */
async function getMyStats(req, res, next) {
    try {
        let stats = await UserStats_1.UserStats.findOne({ userId: req.userId });
        if (!stats) {
            const userObjectId = new mongoose_1.Types.ObjectId(req.userId);
            stats = await UserStats_1.UserStats.create({ userId: userObjectId });
        }
        res.status(200).json(stats);
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /stats/complete-run
 */
async function completeRun(req, res, next) {
    try {
        const { generatedRouteDistanceMeters, actualRunDistanceMeters, checkpointsTakenCount, } = (req.body ?? {});
        if (!generatedRouteDistanceMeters || !actualRunDistanceMeters) {
            res.status(400).json({ error: 'Missing run distance metrics' });
            return;
        }
        const userObjectId = new mongoose_1.Types.ObjectId(req.userId);
        const now = new Date();
        let stats = await UserStats_1.UserStats.findOne({ userId: userObjectId });
        if (!stats) {
            stats = new UserStats_1.UserStats({ userId: userObjectId });
        }
        let currentStreak = stats.dayStreakOfCompletedRuns;
        if (stats.lastRunCompletedAt) {
            const lastRunDate = new Date(stats.lastRunCompletedAt);
            const diffTime = Math.abs(now.setHours(0, 0, 0, 0) - lastRunDate.setHours(0, 0, 0, 0));
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays === 1) {
                currentStreak += 1; // Completed a run the next day
            }
            else if (diffDays > 1) {
                currentStreak = 1; // Streak broken, reset to 1
            }
        }
        else {
            currentStreak = 1; // First run ever
        }
        stats.completedRunsCount += 1;
        stats.totalDistanceMeters += actualRunDistanceMeters;
        stats.totalCheckpointsTaken += checkpointsTakenCount ?? 0;
        stats.dayStreakOfCompletedRuns = currentStreak;
        stats.lastRunCompletedAt = new Date(); // set to current accurate time
        if (generatedRouteDistanceMeters > stats.maxRunDistanceCompleted) {
            stats.maxRunDistanceCompleted = generatedRouteDistanceMeters;
        }
        await stats.save();
        res.status(200).json(stats);
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /stats/increment-shared
 */
async function incrementRoutesShared(req, res, next) {
    try {
        const userObjectId = new mongoose_1.Types.ObjectId(req.userId);
        let stats = await UserStats_1.UserStats.findOne({ userId: userObjectId });
        if (!stats)
            stats = new UserStats_1.UserStats({ userId: userObjectId });
        stats.routesSharedCount += 1;
        await stats.save();
        res.status(200).json(stats);
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /stats/increment-recieved
 */
async function incrementRoutesReceived(req, res, next) {
    try {
        const userObjectId = new mongoose_1.Types.ObjectId(req.userId);
        let stats = await UserStats_1.UserStats.findOne({ userId: userObjectId });
        if (!stats)
            stats = new UserStats_1.UserStats({ userId: userObjectId });
        stats.routesRecievedCount += 1;
        await stats.save();
        res.status(200).json(stats);
    }
    catch (err) {
        next(err);
    }
}
/**
 * POST /stats/increment-generated
 */
async function incrementRoutesGenerated(req, res, next) {
    try {
        const userObjectId = new mongoose_1.Types.ObjectId(req.userId);
        let stats = await UserStats_1.UserStats.findOne({ userId: userObjectId });
        if (!stats)
            stats = new UserStats_1.UserStats({ userId: userObjectId });
        stats.routesGeneratedCount += 1;
        await stats.save();
        res.status(200).json(stats);
    }
    catch (err) {
        next(err);
    }
}
