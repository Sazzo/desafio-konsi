import { Global, Module } from '@nestjs/common';
import { EnvService } from './env.service';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './schema';

export const configModule = ConfigModule.forRoot({
  validate: (env) =>
    // Only validate environment variables in non-test environments
    process.env.NODE_ENV === 'test'
      ? envSchema.safeParse(env)
      : envSchema.parse(env),
});

@Global()
@Module({
  imports: [configModule],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
