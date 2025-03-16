import { Module } from '@nestjs/common';
import * as NestRabbitMQ from '@golevelup/nestjs-rabbitmq';
import * as Constants from 'src/shared/constants';
import { EnvService } from 'src/shared/env/env.service';

@Module({
  imports: [
    NestRabbitMQ.RabbitMQModule.forRootAsync({
      useFactory: (envService: EnvService) => ({
        exchanges: [
          {
            // This use case would actually work with the default exchange, but its preferred to use a custom one.
            // Since we're using only one queue currently, we're using the direct exchange type.
            name: Constants.BENEFITS_EXCHANGE_NAME,
            type: 'direct',
            createExchangeIfNotExists: true,
          },
        ],
        queues: [
          {
            name: Constants.FETCH_BENEFITS_FROM_CPF_QUEUE,
            exchange: Constants.BENEFITS_EXCHANGE_NAME,
            routingKey: Constants.FETCH_BENEFITS_FROM_CPF_ROUTING_KEY,
            createQueueIfNotExists: true,
          },
        ],
        uri: `amqp://${envService.get('RABBITMQ_AUTH_USERNAME')}:${envService.get('RABBITMQ_AUTH_PASSWORD')}@${envService.get('RABBITMQ_HOST')}:${envService.get('RABBITMQ_PORT')}`,
      }),
      inject: [EnvService],
    }),
  ],
  exports: [NestRabbitMQ.RabbitMQModule],
})
export class RabbitMQModule {}
