"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutesService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("../config/env");
const RouteRecord_1 = require("../models/RouteRecord");
const Run_1 = require("../models/Run");
const RouteChallenge_1 = require("../models/RouteChallenge");
function httpError(status, message) {
    const e = new Error(message);
    e.status = status;
    return e;
}
const RUN_STATUSES = ['in_progress', 'completed', 'abandoned'];
function parseRunStatus(raw) {
    if (raw === undefined || raw === '')
        return undefined;
    if (RUN_STATUSES.includes(raw)) {
        return raw;
    }
    throw httpError(400, 'Ogiltig status');
}
class RoutesService {
    async assertFriends(a, b) {
        if (!env_1.env.PROFILE_SERVICE_TOKEN) {
            throw httpError(500, 'PROFILE_SERVICE_TOKEN is not configured');
        }
        const url = new URL('/internal/social/are-friends', env_1.env.PROFILE_SERVICE_URL);
        url.searchParams.set('userA', a);
        url.searchParams.set('userB', b);
        const res = await fetch(url, {
            method: 'GET',
            headers: { 'x-service-token': env_1.env.PROFILE_SERVICE_TOKEN },
        });
        const data = (await res.json().catch(() => ({})));
        if (!res.ok) {
            throw httpError(502, 'Profile service unavailable for friendship check');
        }
        if (!data.accepted) {
            throw httpError(403, 'Inte vänner');
        }
    }
    async createRoute(userId, body) {
        const createdBy = new mongoose_1.default.Types.ObjectId(userId);
        const doc = await RouteRecord_1.RouteRecord.create({
            createdBy,
            start: body.start,
            distance: body.distance,
            checkpoints: body.checkpoints.map((c) => ({
                id: c.id,
                coordinate: c.coordinate,
                radius: c.radius ?? 20,
            })),
            filters: body.filters ?? [],
        });
        return doc;
    }
    async getRouteById(_userId, id) {
        const _id = new mongoose_1.default.Types.ObjectId(id);
        const doc = await RouteRecord_1.RouteRecord.findById(_id);
        if (!doc)
            throw httpError(404, 'Rutt hittades inte');
        return doc;
    }
    async createRun(userId, routeId) {
        const run = await Run_1.Run.create({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            route: new mongoose_1.default.Types.ObjectId(routeId),
            status: 'in_progress',
        });
        return run;
    }
    async completeRun(userId, runId, body) {
        const uid = new mongoose_1.default.Types.ObjectId(userId);
        const rid = new mongoose_1.default.Types.ObjectId(runId);
        const run = await Run_1.Run.findOne({ _id: rid, userId: uid });
        if (!run)
            throw httpError(404, 'Run hittades inte');
        if (run.status !== 'in_progress') {
            throw httpError(409, 'Run kan inte avslutas');
        }
        run.status = 'completed';
        run.finishedAt = new Date();
        run.durationSeconds = body.durationSeconds;
        run.checkpointsCompleted = body.checkpointsCompleted;
        run.distanceMeters = body.distanceMeters;
        await run.save();
        return run;
    }
    async listMyRuns(userId, statusRaw) {
        const status = parseRunStatus(statusRaw);
        const q = {
            userId: new mongoose_1.default.Types.ObjectId(userId),
        };
        if (status !== undefined) {
            q.status = status;
        }
        return Run_1.Run.find(q).sort({ createdAt: -1 }).populate('route');
    }
    async createChallenge(fromUserId, input) {
        await this.assertFriends(fromUserId, input.toUserId);
        const routeObjectId = new mongoose_1.default.Types.ObjectId(input.routeId);
        if (input.sourceRunId) {
            const run = await Run_1.Run.findOne({
                _id: new mongoose_1.default.Types.ObjectId(input.sourceRunId),
                userId: new mongoose_1.default.Types.ObjectId(fromUserId),
                route: routeObjectId,
            });
            if (!run)
                throw httpError(400, 'Ogiltig sourceRun för vald rutt');
        }
        return RouteChallenge_1.RouteChallenge.create({
            route: routeObjectId,
            fromUserId: new mongoose_1.default.Types.ObjectId(fromUserId),
            toUserId: new mongoose_1.default.Types.ObjectId(input.toUserId),
            sourceRun: input.sourceRunId
                ? new mongoose_1.default.Types.ObjectId(input.sourceRunId)
                : undefined,
            status: 'pending',
        });
    }
    async listMyChallenges(userId) {
        const uid = new mongoose_1.default.Types.ObjectId(userId);
        return RouteChallenge_1.RouteChallenge.find({
            $or: [{ fromUserId: uid }, { toUserId: uid }],
        })
            .sort({ createdAt: -1 })
            .populate('route')
            .populate('sourceRun');
    }
}
exports.RoutesService = RoutesService;
