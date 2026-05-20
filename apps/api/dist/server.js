"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const env_1 = require("./config/env");
async function bootstrap() {
    const app = (0, app_1.createApp)();
    app.listen(env_1.env.PORT, () => {
        console.warn(`API listening on http://localhost:${env_1.env.PORT}`);
    });
}
bootstrap().catch((err) => {
    console.error('Failed to start API:', err);
    process.exit(1);
});
