import { Request, Response, NextFunction } from 'express';
import { Friendship } from '../models/Friendship';
import mongoose from 'mongoose';

export async function sendFriendRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const currentUserId = new mongoose.Types.ObjectId(req.userId);
    const { friendId } = req.params as { friendId: string };
    const friendObjectId = new mongoose.Types.ObjectId(friendId);

    const existing = await Friendship.findOne({
      $or: [
        { requester: currentUserId, recipient: friendObjectId },
        { requester: friendObjectId, recipient: currentUserId }
      ]
    });

    if (existing) {
      res.status(409).json({ error: 'Förfrågan finns redan eller ni är redan vänner' });
      return;
    }

    await Friendship.create({
      requester: currentUserId,
      recipient: friendObjectId
    });

    res.status(201).json({ message: 'Vänskapsförfrågan skickad!' });
  } catch (err) {
    next(err);
  }
}

export async function acceptFriendRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const currentUserId = new mongoose.Types.ObjectId(req.userId);
    const { requesterId } = req.params as { requesterId: string };
    const requesterObjectId = new mongoose.Types.ObjectId(requesterId);

    const friendship = await Friendship.findOneAndUpdate(
      { requester: requesterObjectId, recipient: currentUserId, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    if (!friendship) {
      res.status(404).json({ error: 'Ingen förfrågan hittades' });
      return;
    }

    res.status(200).json({ message: 'Vän accepterad!' });
  } catch (err) {
    next(err);
  }
}

export async function removeFriend(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const currentUserId = new mongoose.Types.ObjectId(req.userId);
    const { friendId } = req.params as { friendId: string };
    const friendObjectId = new mongoose.Types.ObjectId(friendId);

    await Friendship.findOneAndDelete({
      $or: [
        { requester: currentUserId, recipient: friendObjectId },
        { requester: friendObjectId, recipient: currentUserId }
      ]
    });

    res.status(200).json({ message: 'Vän borttagen' });
  } catch (err) {
    next(err);
  }
}

export async function getFriends(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const currentUserId = new mongoose.Types.ObjectId(req.userId);

    const friends = await Friendship.aggregate([
      {
        $match: {
          $or: [
            { requester: currentUserId, status: 'accepted' },
            { recipient: currentUserId, status: 'accepted' }
          ]
        }
      },
      {
        $project: {
          friendUserId: {
            $cond: [{ $eq: ['$requester', currentUserId] }, '$recipient', '$requester']
          }
        }
      },
      {
        $lookup: {
          from: 'profiles',
          localField: 'friendUserId',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      { $unwind: '$profile' },
      { $replaceRoot: { newRoot: '$profile' } }
    ]);

    res.status(200).json(friends);
  } catch (err) {
    next(err);
  }
}

export async function getPendingRequests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const currentUserId = new mongoose.Types.ObjectId(req.userId);

    const requests = await Friendship.aggregate([
      { $match: { recipient: currentUserId, status: 'pending' } },
      {
        $lookup: {
          from: 'profiles',
          localField: 'requester',
          foreignField: 'userId',
          as: 'profile'
        }
      },
      { $unwind: '$profile' },
      { $replaceRoot: { newRoot: '$profile' } }
    ]);

    res.status(200).json(requests);
  } catch (err) {
    next(err);
  }
}