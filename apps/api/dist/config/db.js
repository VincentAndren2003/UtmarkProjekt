"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
/**
 * Gateway does not connect to MongoDB.
 * (Auth/Profile services own the DB connection in microservice mode.)
 */
async function connectDB() {
    return;
}
