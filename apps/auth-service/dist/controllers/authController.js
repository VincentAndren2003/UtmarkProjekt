"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signup = signup;
exports.login = login;
exports.deleteMe = deleteMe;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
async function signup(req, res, next) {
    try {
        const { email, password } = req.body ?? {};
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const normalizedEmail = String(email).trim().toLowerCase();
        const existing = await User_1.User.findOne({ email: normalizedEmail });
        if (existing) {
            res.status(409).json({ error: 'Email already in use' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(String(password), 10);
        const user = await User_1.User.create({ email: normalizedEmail, passwordHash });
        const token = (0, jwt_1.signToken)({ userId: user.id });
        res.status(201).json({
            token,
            user: { id: user.id, email: user.email },
        });
    }
    catch (err) {
        next(err);
    }
}
async function login(req, res, next) {
    try {
        const { email, password } = req.body ?? {};
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }
        const user = await User_1.User.findOne({
            email: String(email).trim().toLowerCase(),
        });
        if (!user) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
        const ok = await bcryptjs_1.default.compare(String(password), user.passwordHash);
        if (!ok) {
            res.status(401).json({ error: 'Invalid credentials' });
            return;
        }
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
async function deleteMe(req, res, next) {
    try {
        const userId = req.header('x-user-id');
        if (!userId) {
            res.status(401).json({ error: 'Missing x-user-id (gateway auth required)' });
            return;
        }
        await User_1.User.findByIdAndDelete(userId);
        res.status(204).send();
    }
    catch (err) {
        next(err);
    }
}
