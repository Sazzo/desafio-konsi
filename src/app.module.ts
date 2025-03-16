import { Module } from '@nestjs/common';
import { BenefitsModule } from './modules/benefits/benefits.module';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './shared/env/schema';
import { EnvModule } from './shared/env/env.module';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  validate: (env) => envSchema.parse(env),
});
@Module({
  imports: [
    configModule,
    EnvModule, // Provides type-safe access to environment variables through the ConfigService.
    BenefitsModule,
  ],
})
export class AppModule {}
