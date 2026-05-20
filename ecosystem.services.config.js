const dotenv = require('dotenv');

module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: './apps/auth-service/dist/server.js',
      env: dotenv.config({ path: './apps/auth-service/.env' }).parsed,
    },
    {
      name: 'profile-service',
      script: './apps/profile-service/dist/server.js',
      env: dotenv.config({ path: './apps/profile-service/.env' }).parsed,
    },
    {
      name: 'routes-service',
      script: './apps/routes-service/dist/server.js',
      env: dotenv.config({ path: './apps/routes-service/.env' }).parsed,
    },
    {
      name: 'friend-service',
      script: './apps/friend-service/dist/server.js',
      env: dotenv.config({ path: './apps/friend-service/.env' }).parsed,
    },
  ],
};
