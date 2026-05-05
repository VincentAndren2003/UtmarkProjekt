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
    MONGODB_URI: required('MONGODB_URI'),
    JWT_SECRET: required('JWT_SECRET'),
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
};
