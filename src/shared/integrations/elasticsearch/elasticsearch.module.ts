import { Module } from '@nestjs/common';
import * as NestElasticsearch from '@nestjs/elasticsearch';
import { EnvModule } from 'src/shared/env/env.module';
import { EnvService } from 'src/shared/env/env.service';

@Module({
  imports: [
    NestElasticsearch.ElasticsearchModule.registerAsync({
      imports: [EnvModule],
      useFactory: (envService: EnvService) => ({
        node: `http://${envService.get('ELASTICSEARCH_HOST')}:${envService.get('ELASTICSEARCH_PORT')}`,
        auth: envService.get('ELASTICSEARCH_AUTH_USERNAME')
          ? {
              username: envService.get('ELASTICSEARCH_AUTH_USERNAME'),
              password: envService.get('ELASTICSEARCH_AUTH_PASSWORD'),
            }
          : undefined,
      }),
      inject: [EnvService],
    }),
  ],
  exports: [NestElasticsearch.ElasticsearchModule],
})
export class ElasticsearchModule {}
