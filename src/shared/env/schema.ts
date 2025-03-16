import { z } from 'zod';

export const envSchema = z.object({
  PORT: z.coerce.number().default(3000),

  KONSI_INSS_API_URL: z.string(),
  KONSI_INSS_API_AUTH_USERNAME: z.string(),
  KONSI_INSS_API_AUTH_PASSWORD: z.string(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.coerce.number(),
  REDIS_AUTH_USERNAME: z.string().optional(),
  REDIS_AUTH_PASSWORD: z.string().optional(),

  ELASTICSEARCH_HOST: z.string(),
  ELASTICSEARCH_PORT: z.coerce.number(),
  ELASTICSEARCH_AUTH_USERNAME: z.string(),
  ELASTICSEARCH_AUTH_PASSWORD: z.string(),

  RABBITMQ_HOST: z.string(),
  RABBITMQ_PORT: z.coerce.number(),
  RABBITMQ_AUTH_USERNAME: z.string().optional(),
  RABBITMQ_AUTH_PASSWORD: z.string().optional(),
});
export type Env = z.infer<typeof envSchema>;
