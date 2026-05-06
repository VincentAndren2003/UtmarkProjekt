"use strict";
// -----------------------------------------------------------------------------
// This file handles the user's profile (username, full name, age, gender).
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyProfile = getMyProfile;
exports.upsertMyProfile = upsertMyProfile;
const Profile_1 = require("../models/Profile");
// -----------------------------------------------------------------------------
// GET /api/profile/me
// Returns the logged-in user's profile, or 404 if they haven't made one yet.
// -----------------------------------------------------------------------------
async function getMyProfile(req, res, next) {
    try {
        // req.userId was set by authMiddleware after it verified the JWT.
        // The "!" tells TypeScript "I promise this isn't undefined" — we know
        // that because the route always runs authMiddleware before us.
        const profile = await Profile_1.Profile.findOne({ userId: req.userId });
        if (!profile) {
            // They're logged in, but they never filled out the profile screen yet.
            // 404 = "Not Found".
            res.status(404).json({ error: 'Profile not found' });
            return;
        }
        res.status(200).json(profile);
    }
    catch (err) {
        // Hand any unexpected error to errorHandler (in middleware/errorHandler.ts).
        next(err);
    }
}
// -----------------------------------------------------------------------------
// PUT /api/profile/me
// Creates the profile if it doesn't exist, OR updates it if it does.
// This pattern is called "upsert" (UPdate + inSERT).
//
// Why PUT and not POST? PUT is idempotent — calling it twice with the same
// body gives the same result, no duplicate profiles. POST would imply
// "create a new one every time", which we don't want.
// -----------------------------------------------------------------------------
async function upsertMyProfile(req, res, next) {
    try {
        // Only pull the fields we EXPECT. If the phone sneaks in extra stuff
        // (like role: "admin"), we ignore it. This is called "whitelisting"
        // and it's an easy security win.
        const { username, fullName, age, gender } = req.body ?? {};
        // findOneAndUpdate with upsert: true does this in ONE DB trip:
        //   1. Find a profile where userId matches.
        //   2. If found  -> update it with the new fields.
        //   3. If not    -> create a new one with these fields.
        //
        // Options:
        //   new: true                -> return the doc AFTER the update (default
        //                               returns the OLD version, which is weird).
        //   upsert: true             -> turns on the "create if missing" behavior.
        //   setDefaultsOnInsert: true -> when creating, fill in any default
        //                                values defined in the schema.
        const profile = await Profile_1.Profile.findOneAndUpdate({ userId: req.userId }, { userId: req.userId, username, fullName, age, gender }, { new: true, upsert: true, setDefaultsOnInsert: true });
        res.status(200).json(profile);
    }
    catch (err) {
        next(err);
    }
}
