"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendFriendRequest = sendFriendRequest;
exports.acceptFriendRequest = acceptFriendRequest;
exports.removeFriend = removeFriend;
exports.getFriends = getFriends;
exports.getPendingRequests = getPendingRequests;
const Friendship_1 = require("../models/Friendship");
const mongoose_1 = __importDefault(require("mongoose"));
async function sendFriendRequest(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const currentUserId = new mongoose_1.default.Types.ObjectId(req.userId);
        const { friendId } = req.params;
        const friendObjectId = new mongoose_1.default.Types.ObjectId(friendId);
        const existing = await Friendship_1.Friendship.findOne({
            $or: [
                { requester: currentUserId, recipient: friendObjectId },
                { requester: friendObjectId, recipient: currentUserId }
            ]
        });
        if (existing) {
            res.status(409).json({ error: 'Förfrågan finns redan eller ni är redan vänner' });
            return;
        }
        await Friendship_1.Friendship.create({
            requester: currentUserId,
            recipient: friendObjectId
        });
        res.status(201).json({ message: 'Vänskapsförfrågan skickad!' });
    }
    catch (err) {
        next(err);
    }
}
async function acceptFriendRequest(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const currentUserId = new mongoose_1.default.Types.ObjectId(req.userId);
        const { requesterId } = req.params;
        const requesterObjectId = new mongoose_1.default.Types.ObjectId(requesterId);
        const friendship = await Friendship_1.Friendship.findOneAndUpdate({ requester: requesterObjectId, recipient: currentUserId, status: 'pending' }, { status: 'accepted' }, { new: true });
        if (!friendship) {
            res.status(404).json({ error: 'Ingen förfrågan hittades' });
            return;
        }
        res.status(200).json({ message: 'Vän accepterad!' });
    }
    catch (err) {
        next(err);
    }
}
async function removeFriend(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const currentUserId = new mongoose_1.default.Types.ObjectId(req.userId);
        const { friendId } = req.params;
        const friendObjectId = new mongoose_1.default.Types.ObjectId(friendId);
        await Friendship_1.Friendship.findOneAndDelete({
            $or: [
                { requester: currentUserId, recipient: friendObjectId },
                { requester: friendObjectId, recipient: currentUserId }
            ]
        });
        res.status(200).json({ message: 'Vän borttagen' });
    }
    catch (err) {
        next(err);
    }
}
async function getFriends(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const currentUserId = new mongoose_1.default.Types.ObjectId(req.userId);
        const friends = await Friendship_1.Friendship.aggregate([
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
    }
    catch (err) {
        next(err);
    }
}
async function getPendingRequests(req, res, next) {
    try {
        if (!req.userId) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }
        const currentUserId = new mongoose_1.default.Types.ObjectId(req.userId);
        const requests = await Friendship_1.Friendship.aggregate([
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
    }
    catch (err) {
        next(err);
    }
}
