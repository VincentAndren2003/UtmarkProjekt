import mongoose from 'mongoose';
import { RouteRecord } from '../models/RouteRecord';
import { Run } from '../models/Run';
import { RouteChallenge } from '../models/RouteChallenge';
import { Friendship } from '../models/Friendship';

function httpError(status: number, message: string): Error {
  const e = new Error(message) as Error & { status?: number };
  e.status = status;
  return e;
}

const RUN_STATUSES = ['in_progress', 'completed', 'abandoned'] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

const FINISH_STATUSES = ['completed', 'abandoned'] as const;
type FinishRunStatus = (typeof FINISH_STATUSES)[number];

const MAX_TRACK_POINTS = 10_000;

type TrackPointInput = {
  lat: number;
  long: number;
  timeStamp: number;
};

function parseFinishStatus(raw: string | undefined): FinishRunStatus {
  if (raw === undefined || raw === 'completed') return 'completed';
  if (raw === 'abandoned') return 'abandoned';
  throw httpError(400, 'Ogiltig status för avslut');
}

function normalizeTrackPoints(
  raw: TrackPointInput[] | undefined
): TrackPointInput[] {
  if (!raw?.length) return [];
  if (raw.length > MAX_TRACK_POINTS) {
    throw httpError(400, `Max ${MAX_TRACK_POINTS} trackPoints tillåtna`);
  }
  return raw.map((p) => ({
    lat: p.lat,
    long: p.long,
    timeStamp: p.timeStamp,
  }));
}

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
    const userA = new mongoose.Types.ObjectId(a);
    const userB = new mongoose.Types.ObjectId(b);
    const friendship = await Friendship.findOne({
      status: 'accepted',
      $or: [
        { requester: userA, recipient: userB },
        { requester: userB, recipient: userA },
      ],
    });
    if (!friendship) {
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
      trackPoints?: TrackPointInput[];
      status?: string;
    }
  ) {
    const uid = new mongoose.Types.ObjectId(userId);
    const rid = new mongoose.Types.ObjectId(runId);
    const run = await Run.findOne({ _id: rid, userId: uid });
    if (!run) throw httpError(404, 'Run hittades inte');
    if (run.status !== 'in_progress') {
      throw httpError(409, 'Run kan inte avslutas');
    }
    run.status = parseFinishStatus(body.status);
    run.finishedAt = new Date();
    run.durationSeconds = body.durationSeconds;
    run.checkpointsCompleted = body.checkpointsCompleted;
    run.distanceMeters = body.distanceMeters;
    run.set('trackPoints', normalizeTrackPoints(body.trackPoints));
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

  async declineChallenge(userId: string, challengeId: string) {
    const doc = await RouteChallenge.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(challengeId),
        toUserId: new mongoose.Types.ObjectId(userId),
        status: 'pending',
      },
      { status: 'declined' },
      { new: true }
    );
    if (!doc) throw httpError(404, 'Utmaning hittades inte eller ej behörig');
    return doc;
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
