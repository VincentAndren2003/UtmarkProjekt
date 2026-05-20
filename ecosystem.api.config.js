module.exports = {
  apps: [
    {
      name: 'api',
      script: './apps/api/dist/server.js',
      env_file: './apps/api/.env',
    },
  ],
};
