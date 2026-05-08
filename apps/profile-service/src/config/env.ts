import 'dotenv/config';

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

export const env = {
  PORT: Number(process.env.PORT ?? 3002),
  MONGODB_URI: required('MONGODB_URI'),
  CORS_ORIGIN: process.env.CORS_ORIGIN ?? '*',
};

