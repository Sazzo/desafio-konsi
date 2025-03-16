import { Module } from '@nestjs/common';
import { KonsiINSSService } from './konsi-inss.service';
import { LoggerModule } from 'src/shared/logger/logger.module';

@Module({
  imports: [LoggerModule],
  providers: [KonsiINSSService],
  exports: [KonsiINSSService],
})
export class KonsiINSSModule {}
