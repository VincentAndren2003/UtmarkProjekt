"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
const mongoose_1 = require("mongoose");
const profileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    age: { type: Number, required: true, min: 0 },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true,
    },
}, { timestamps: true });
exports.Profile = (0, mongoose_1.model)('Profile', profileSchema);
