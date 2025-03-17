import { Module } from '@nestjs/common';
import { BenefitsModule } from './modules/benefits/benefits.module';
import { EnvModule } from './shared/env/env.module';

@Module({
  imports: [
    EnvModule, // Provides type-safe access to environment variables through the ConfigService.
    BenefitsModule,
  ],
})
export class AppModule {}
