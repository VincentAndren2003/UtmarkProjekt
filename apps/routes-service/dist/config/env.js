"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
require("dotenv/config");
function required(name) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return value;
}
exports.env = {
    PORT: Number(process.env.port ?? 3003),
    MONGODB_URI: required('MONGODB_URI'),
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    PROFILE_SERVICE_URL: process.env.PROFILE_SERVICE_URL,
    PROFILE_SERVICE_TOKEN: process.env.PROFILE_SERVICE_TOKEN,
};
