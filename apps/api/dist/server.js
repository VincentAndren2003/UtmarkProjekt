"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
const mongoose_1 = __importDefault(require("mongoose"));
async function bootstrap() {
    await mongoose_1.default.connect(process.env.MONGODB_URI, {
        dbName: process.env.DB_NAME,
    });
    console.warn('Ansluten till MongoDB');
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.PORT, () => {
        console.warn(`API listening on http://localhost:${env_1.env.PORT}`);
    });
}
bootstrap().catch((err) => {
    console.error('Failed to start API:', err);
    process.exit(1);
});
