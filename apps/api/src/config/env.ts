import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 3000),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN ?? '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
  AUTH_SERVICE_URL: process.env.AUTH_SERVICE_URL ?? 'http://127.0.0.1:3001',
  PROFILE_SERVICE_URL:
    process.env.PROFILE_SERVICE_URL ?? 'http://127.0.0.1:3002',
  MONGODB_URI: required('MONGODB_URI'),
  DB_NAME: process.env.DB_NAME ?? 'test',
};
