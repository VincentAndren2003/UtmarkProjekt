"use strict";
// This file handles signup and login
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
// -----------------------------------------------------------------------------
// POST /api/auth/signup
// Creates a new user account and returns a JWT to use for future requests.
// -----------------------------------------------------------------------------
async function signup(req, res, next) {
    try {
        // Pull email + password out of the JSON body the phone sent us.
        // (req.body became a real JS object thanks to express.json() in app.ts)
        // The "?? {}" means: if body is somehow undefined, use an empty object
        // so the destructure below doesn't crash.
        const { email, password } = req.body ?? {};
        // Bail out early if anything is missing.
        // 400 = "Bad Request" — the client sent something invalid.
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        // Lowercase + trim so "Alice@TEST.com " is treated the same as
        // "alice@test.com". Otherwise people would get duplicate accounts.
        const normalizedEmail = email.trim().toLowerCase();
        // Check if someone already signed up with this email.
        // .findOne returns the matching doc, or null if no match.
        const existing = await User_1.User.findOne({ email: normalizedEmail });
        if (existing) {
            // 409 = "Conflict": resource already exists, can't create another.
            res.status(409).json({ error: 'Email already in use' });
            return;
        }
        // bcrypt scrambles the password into a hash we can safely store.
        // We never save the real password — if our DB ever leaks, the actual
        // passwords stay secret.
        // The "10" is the cost factor: how slow the hashing is. Slower = harder
        // for an attacker to brute-force. 10 is a fine default.
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        // Save the new user. Mongoose validates against the schema in
        // models/User.ts (e.g. email must be a string, must be unique, etc.).
        const user = await User_1.User.create({ email: normalizedEmail, passwordHash });
        // Make a JWT — a signed string that proves who this user is.
        // The phone stores it (in expo-secure-store) and sends it back in the
        // Authorization header on every protected request.
        const token = (0, jwt_1.signToken)({ userId: user.id });
        // 201 = "Created". Send back the token + the user info we DO want to
        // expose. Never send passwordHash — the phone has no business with it.
        res.status(201).json({
            token,
            user: { id: user.id, email: user.email },
        });
    }
    catch (err) {
        // If anything blew up (DB down, schema validation failed, etc.),
        // hand it off to the errorHandler middleware (registered last in
        // app.ts). That centralizes our error responses.
        next(err);
    }
}
// -----------------------------------------------------------------------------
// POST /api/auth/login
// Checks credentials and gives back a JWT if they match.
// -----------------------------------------------------------------------------
async function login(req, res, next) {
    try {
        const { email, password } = req.body ?? {};
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        // Look up the user by their normalized email.
        const user = await User_1.User.findOne({ email: email.trim().toLowerCase() });
        // SECURITY NOTE: we use the SAME error message + status for both
        // "no such user" and "wrong password". If we said "no such user" only
        // when the user didn't exist, a hacker could probe our API to figure
        // out which emails are registered. Don't leak that info.
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // bcrypt.compare hashes the password they typed (with the same salt
        // baked into the stored hash) and checks if it matches what we saved
        // when they signed up. Returns true/false.
        const ok = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!ok) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        // All good — give them a fresh token and the basic user info.
        const token = (0, jwt_1.signToken)({ userId: user.id });
        res.status(200).json({
            token,
            user: { id: user.id, email: user.email },
        });
    }
    catch (err) {
        next(err);
    }
}
