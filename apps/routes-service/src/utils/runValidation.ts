export const MAX_TRACK_POINTS = 10_000;

export const RUN_STATUSES = ['in_progress', 'completed', 'abandoned'] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

const FINISH_STATUSES = ['completed', 'abandoned'] as const;
export type FinishRunStatus = (typeof FINISH_STATUSES)[number];

export type TrackPointInput = {
  lat: number;
  long: number;
  timeStamp: number;
};

export function httpError(status: number, message: string): Error {
  const e = new Error(message) as Error & { status?: number };
  e.status = status;
  return e;
}

export function parseFinishStatus(raw: string | undefined): FinishRunStatus {
  if (raw === undefined || raw === 'completed') return 'completed';
  if (raw === 'abandoned') return 'abandoned';
  throw httpError(400, 'Ogiltig status för avslut');
}

export function normalizeTrackPoints(
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

export function parseRunStatus(raw: string | undefined): RunStatus | undefined {
  if (raw === undefined || raw === '') return undefined;
  if ((RUN_STATUSES as readonly string[]).includes(raw)) {
    return raw as RunStatus;
  }
  throw httpError(400, 'Ogiltig status');
}
