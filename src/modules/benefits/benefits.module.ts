import { Module } from '@nestjs/common';
import { BenefitsController } from './benefits.controller';
import { BenefitsService } from './benefits.service';
import { BenefitsConsumer } from './benefits.consumer';

import { RabbitMQModule } from 'src/shared/integrations/rabbitmq/rabbitmq.module';
import { ElasticsearchModule } from 'src/shared/integrations/elasticsearch/elasticsearch.module';
import { RedisModule } from 'src/shared/integrations/redis/redis.module';
import { KonsiINSSModule } from 'src/shared/integrations/konsi-inss/konsi-inss.module';
import { LoggerModule } from 'src/shared/logger/logger.module';

@Module({
  imports: [
    KonsiINSSModule,
    RabbitMQModule,
    ElasticsearchModule,
    RedisModule,
    LoggerModule,
  ],
  controllers: [BenefitsController],
  providers: [BenefitsService, BenefitsConsumer],
})
export class BenefitsModule {}
