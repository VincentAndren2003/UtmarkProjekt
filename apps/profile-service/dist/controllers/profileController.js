"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyProfile = getMyProfile;
exports.upsertMyProfile = upsertMyProfile;
const mongoose_1 = require("mongoose");
const Profile_1 = require("../models/Profile");
async function getMyProfile(req, res, next) {
    try {
        const profile = await Profile_1.Profile.findOne({ userId: req.userId });
        if (!profile) {
            res.status(404).json({ error: 'Profile not found' });
            return;
        }
        res.status(200).json(profile);
    }
    catch (err) {
        next(err);
    }
}
async function upsertMyProfile(req, res, next) {
    try {
        const { username, fullName, age, gender } = req.body ?? {};
        // In the gateway we attach userId as string. Profile schema expects ObjectId.
        const userObjectId = new mongoose_1.Types.ObjectId(req.userId);
        const profile = await Profile_1.Profile.findOneAndUpdate({ userId: userObjectId }, { userId: userObjectId, username, fullName, age, gender }, { new: true, upsert: true, setDefaultsOnInsert: true });
        res.status(200).json(profile);
    }
    catch (err) {
        next(err);
    }
}
