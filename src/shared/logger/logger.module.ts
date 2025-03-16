import { Module } from '@nestjs/common';
import { Logger } from './logger.provider';

@Module({
  providers: [Logger],
  exports: [Logger],
})
export class LoggerModule {}
