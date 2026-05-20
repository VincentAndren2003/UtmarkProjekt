const dotenv = require('dotenv');

module.exports = {
  apps: [
    {
      name: 'api',
      script: './apps/api/dist/server.js',
      env: dotenv.config({ path: './apps/api/.env' }).parsed,
    },
  ],
};
