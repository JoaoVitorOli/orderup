import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGINS: z
    .string()
    .default('')
    .transform((value) =>
      value
        .split(',')
        .map((origin) => origin.trim())
        .filter(Boolean),
    )
    .pipe(
      z.array(
        z.url({ protocol: /^https?$/ }).transform((url) => new URL(url).origin),
      ),
    ),
  URL_BASE: z.url().min(1),
});

export type Env = z.infer<typeof envSchema>;