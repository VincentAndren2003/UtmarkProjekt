module.exports = {
  apps: [
    {
      name: 'api',
      cwd: 'apps/api',
      script: 'dist/server.js',
      env_file: '.env',
      env: {
        PORT: 3000,
      },
    },
    {
      name: 'auth-service',
      cwd: 'apps/auth-service',
      script: 'dist/server.js',
      env_file: '.env',
      env: {
        PORT: 3001,
      },
    },
    {
      name: 'profile-service',
      cwd: 'apps/profile-service',
      script: 'dist/server.js',
      env_file: '.env',
      env: {
        PORT: 3002,
      },
    },
  ],
};
