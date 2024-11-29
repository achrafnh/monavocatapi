import { config } from 'dotenv';
import { logger } from './logger.js';

const result = config();

if (result.error) {
  logger.error('Error loading .env file:', result.error);
  process.exit(1);
}

const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'DB_PORT',
  'JWT_SECRET'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    logger.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}