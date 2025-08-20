import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().transform(Number).default('5000'),
  CLIENT_URL: z.string().url(),
  CORS_EXTRA_ORIGINS: z.string().optional().transform((val) => 
    val ? val.split(',').map(origin => origin.trim()) : []
  ),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRE: z.string().default('30d'),
  BCRYPT_SALT_ROUNDS: z.string().transform(Number).default('12'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default('100'),
});

export const env = envSchema.parse(process.env);