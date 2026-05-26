import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import { Profile } from '../models/Profile';
import { UserStats } from '../models/UserStats';

export async function getMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const profile = await Profile.findOne({ userId: req.userId! });
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

export async function upsertMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { username, fullName, age, gender } = req.body ?? {};

    // In the gateway we attach userId as string. Profile schema expects ObjectId.
    const userObjectId = new Types.ObjectId(req.userId);

    const profile = await Profile.findOneAndUpdate(
      { userId: userObjectId },
      { userId: userObjectId, username, fullName, age, gender },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}

export async function deleteMyProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userObjectId = new Types.ObjectId(req.userId);
    await Promise.all([
      Profile.deleteOne({ userId: userObjectId }),
      UserStats.deleteOne({ userId: userObjectId }),
    ]);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function uploadAvatar(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { base64 } = req.body ?? {};
    const userObjectId = new Types.ObjectId(req.userId);
    const profile = await Profile.findOneAndUpdate(
      { userId: userObjectId },
      { avatarUrl: `data:image/jpeg;base64,${base64}` },
      { new: true }
    );
    res.status(200).json(profile);
  } catch (err) {
    next(err);
  }
}
