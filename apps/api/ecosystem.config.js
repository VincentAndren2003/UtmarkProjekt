require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'server',
      script: 'dist/server.js',
      env: {
        PORT: 3000,
        MONGODB_URI: 'mongodb://127.0.0.1:27017/utmarkprojekt',
        JWT_SECRET: '#very-LONG-RANDOM-secret',
        JWT_EXPIRES_IN: '7d',
        CORS_ORIGIN: '*',
      },
    },
  ],
};
