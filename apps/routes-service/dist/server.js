"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const db_1 = require("./config/db");
const env_1 = require("./config/env");
async function bootstrap() {
    await (0, db_1.connectDB)();
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.PORT, () => {
        console.warn(`routes-service listening on http://localhost:${env_1.env.PORT}`);
    });
}
bootstrap().catch((err) => {
    console.error('Failed to start routes-service:', err);
    process.exit(1);
});
