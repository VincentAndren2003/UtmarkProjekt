import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { UserStats } from '../models/UserStats';

interface CompleteRunBody {
  generatedRouteDistanceMeters: number;
  actualRunDistanceMeters: number;
  checkpointsTakenCount: number;
}

/**
 * GET /stats/me
 */
export async function getMyStats(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    let stats = await UserStats.findOne({ userId: req.userId! });

    if (!stats) {
      const userObjectId = new Types.ObjectId(req.userId);
      stats = await UserStats.create({ userId: userObjectId });
    }

    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /stats/complete-run
 */
export async function completeRun(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const {
      generatedRouteDistanceMeters,
      actualRunDistanceMeters,
      checkpointsTakenCount,
    } = (req.body ?? {}) as CompleteRunBody;

    if (!generatedRouteDistanceMeters || !actualRunDistanceMeters) {
      res.status(400).json({ error: 'Missing run distance metrics' });
      return;
    }

    const userObjectId = new Types.ObjectId(req.userId);
    const now = new Date();

    let stats = await UserStats.findOne({ userId: userObjectId });
    if (!stats) {
      stats = new UserStats({ userId: userObjectId });
    }

    let currentStreak = stats.dayStreakOfCompletedRuns;
    if (stats.lastRunCompletedAt) {
      const lastRunDate = new Date(stats.lastRunCompletedAt);

      const diffTime = Math.abs(
        now.setHours(0, 0, 0, 0) - lastRunDate.setHours(0, 0, 0, 0)
      );
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak += 1; // Completed a run the next day
      } else if (diffDays > 1) {
        currentStreak = 1; // Streak broken, reset to 1
      }
    } else {
      currentStreak = 1; // First run ever
    }

    stats.completedRunsCount += 1;
    stats.totalDistanceMeters += actualRunDistanceMeters;
    stats.totalCheckpointsTaken += checkpointsTakenCount ?? 0;
    stats.dayStreakOfCompletedRuns = currentStreak;
    stats.lastRunCompletedAt = new Date(); // set to current accurate time

    if (
      generatedRouteDistanceMeters > stats.maxRunDistanceCompleted
    ) {
      stats.maxRunDistanceCompleted = generatedRouteDistanceMeters;
    }

    await stats.save();

    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /stats/increment-shared
 */
export async function incrementRoutesShared(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userObjectId = new Types.ObjectId(req.userId);

    let stats = await UserStats.findOne({ userId: userObjectId });
    if (!stats) stats = new UserStats({ userId: userObjectId });

    stats.routesSharedCount += 1;

    await stats.save();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /stats/increment-recieved
 */
export async function incrementRoutesReceived(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userObjectId = new Types.ObjectId(req.userId);

    let stats = await UserStats.findOne({ userId: userObjectId });
    if (!stats) stats = new UserStats({ userId: userObjectId });

    stats.routesRecievedCount += 1;

    await stats.save();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /stats/increment-generated
 */
export async function incrementRoutesGenerated(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    console.log(`[MICROSERVICE] Reached incrementRoutesGenerated for user: ${req.userId}`);

    const userObjectId = new Types.ObjectId(req.userId);

    let stats = await UserStats.findOne({ userId: userObjectId });
    if (!stats) stats = new UserStats({ userId: userObjectId });

    stats.routesGeneratedCount += 1;

    await stats.save();
    res.status(200).json(stats);
  } catch (err) {
    next(err);
  }
}