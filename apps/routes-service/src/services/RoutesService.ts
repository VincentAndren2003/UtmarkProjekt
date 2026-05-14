import mongoose from 'mongoose';
import { env } from '../config/env';
import { RouteRecord } from '../models/RouteRecord';
import { Run } from '../models/Run';
import { RouteChallenge } from '../models/RouteChallenge';

function httpError(status: number, message: string): Error {
  const e = new Error(message) as Error & { status?: number };
  e.status = status;
  return e;
}

const RUN_STATUSES = ['in_progress', 'completed', 'abandoned'] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

function parseRunStatus(raw: string | undefined): RunStatus | undefined {
  if (raw === undefined || raw === '') return undefined;
  if ((RUN_STATUSES as readonly string[]).includes(raw)) {
    return raw as RunStatus;
  }
  throw httpError(400, 'Ogiltig status');
}

type SaveRouteBody = {
  start: { latitude: number; longitude: number };
  distance: number;
  checkpoints: Array<{
    id: string;
    coordinate: { latitude: number; longitude: number };
    radius?: number;
  }>;
  filters?: string[];
};

export class RoutesService {
  private async assertFriends(a: string, b: string): Promise<void> {
    if (!env.PROFILE_SERVICE_TOKEN) {
      throw httpError(500, 'PROFILE_SERVICE_TOKEN is not configured');
    }
    const url = new URL('/internal/social/are-friends', env.PROFILE_SERVICE_URL);
    url.searchParams.set('userA', a);
    url.searchParams.set('userB', b);
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'x-service-token': env.PROFILE_SERVICE_TOKEN },
    });
    const data = (await res.json().catch(() => ({}))) as {
      accepted?: boolean;
    };
    if (!res.ok) {
      throw httpError(502, 'Profile service unavailable for friendship check');
    }
    if (!data.accepted) {
      throw httpError(403, 'Inte vänner');
    }
  }

  async createRoute(userId: string, body: SaveRouteBody) {
    const createdBy = new mongoose.Types.ObjectId(userId);
    const doc = await RouteRecord.create({
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

  async getRouteById(_userId: string, id: string) {
    const _id = new mongoose.Types.ObjectId(id);
    const doc = await RouteRecord.findById(_id);
    if (!doc) throw httpError(404, 'Rutt hittades inte');
    return doc;
  }

  async createRun(userId: string, routeId: string) {
    const run = await Run.create({
      userId: new mongoose.Types.ObjectId(userId),
      route: new mongoose.Types.ObjectId(routeId),
      status: 'in_progress',
    });
    return run;
  }

  async completeRun(
    userId: string,
    runId: string,
    body: {
      durationSeconds?: number;
      checkpointsCompleted?: number;
      distanceMeters?: number;
    }
  ) {
    const uid = new mongoose.Types.ObjectId(userId);
    const rid = new mongoose.Types.ObjectId(runId);
    const run = await Run.findOne({ _id: rid, userId: uid });
    if (!run) throw httpError(404, 'Run hittades inte');
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

  async listMyRuns(userId: string, statusRaw?: string) {
    const status = parseRunStatus(statusRaw);
    const q: { userId: mongoose.Types.ObjectId; status?: RunStatus } = {
      userId: new mongoose.Types.ObjectId(userId),
    };
    if (status !== undefined) {
      q.status = status;
    }
    return Run.find(q).sort({ createdAt: -1 }).populate('route');
  }

  async createChallenge(
    fromUserId: string,
    input: { toUserId: string; routeId: string; sourceRunId?: string }
  ) {
    await this.assertFriends(fromUserId, input.toUserId);
    const routeObjectId = new mongoose.Types.ObjectId(input.routeId);
    if (input.sourceRunId) {
      const run = await Run.findOne({
        _id: new mongoose.Types.ObjectId(input.sourceRunId),
        userId: new mongoose.Types.ObjectId(fromUserId),
        route: routeObjectId,
      });
      if (!run) throw httpError(400, 'Ogiltig sourceRun för vald rutt');
    }
    return RouteChallenge.create({
      route: routeObjectId,
      fromUserId: new mongoose.Types.ObjectId(fromUserId),
      toUserId: new mongoose.Types.ObjectId(input.toUserId),
      sourceRun: input.sourceRunId
        ? new mongoose.Types.ObjectId(input.sourceRunId)
        : undefined,
      status: 'pending',
    });
  }

  async listMyChallenges(userId: string) {
    const uid = new mongoose.Types.ObjectId(userId);
    return RouteChallenge.find({
      $or: [{ fromUserId: uid }, { toUserId: uid }],
    })
      .sort({ createdAt: -1 })
      .populate('route')
      .populate('sourceRun');
  }
}