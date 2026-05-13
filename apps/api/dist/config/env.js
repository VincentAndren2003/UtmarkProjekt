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
    PORT: Number(process.env.PORT ?? 3000),
    JWT_SECRET: required('JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
    AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL ?? 'http://127.0.0.1:3001',
    PROFILE_SERVICE_URL: process.env.PROFILE_SERVICE_URL ?? 'http://127.0.0.1:3002',
};
