module.exports = {
  apps: [
    {
      name: 'auth-service',
      script: './apps/auth-service/dist/server.js',
      env_file: './apps/auth-service/.env',
    },
    {
      name: 'profile-service',
      script: './apps/profile-service/dist/server.js',
      env_file: './apps/profile-service/.env',
    },
    {
      name: 'routes-service',
      script: './apps/routes-service/dist/server.js',
      env_file: './apps/routes-service/.env',
    },
    {
      name: 'friend-service',
      script: './apps/friend-service/dist/server.js',
      env_file: './apps/friend-service/.env',
    },
  ],
};