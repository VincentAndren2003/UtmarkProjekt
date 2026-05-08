const path = require('path');

const appsApi = __dirname;
const appsAuth = path.join(__dirname, '..', 'auth-service');
const appsProfile = path.join(__dirname, '..', 'profile-service');

module.exports = {
  apps: [
    {
      name: 'api',
      cwd: appsApi,
      script: path.join(appsApi, 'dist', 'server.js'),
      env_file: path.join(appsApi, '.env'),
      env: {
        PORT: 3000,
      },
    },
    {
      name: 'auth-service',
      cwd: appsAuth,
      script: path.join(appsAuth, 'dist', 'server.js'),
      env_file: path.join(appsAuth, '.env'),
      env: {
        PORT: 3001,
      },
    },
    {
      name: 'profile-service',
      cwd: appsProfile,
      script: path.join(appsProfile, 'dist', 'server.js'),
      env_file: path.join(appsProfile, '.env'),
      env: {
        PORT: 3002,
      },
    },
  ],
};
