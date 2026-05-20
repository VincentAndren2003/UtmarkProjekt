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
    PORT: Number(process.env.PORT ?? 3002),
    MONGODB_URI: required('MONGODB_URI'),
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
};
