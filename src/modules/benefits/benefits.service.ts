import { Injectable, OnModuleInit } from '@nestjs/common';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import * as Constants from 'src/shared/constants';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { RedisService } from 'src/shared/integrations/redis/redis.service';
import { IBenefits, IBenefitsIndex } from './benefits.types';

@Injectable()
export class BenefitsService implements OnModuleInit {
  constructor(
    private readonly amqpConnection: AmqpConnection,
    private readonly elasticsearchService: ElasticsearchService,
    private readonly redisService: RedisService,
  ) {}

  async onModuleInit() {
    await this.createBenefitsIndexIfNotExists();
  }

  async enqueueCPFsToFetchBenefits(cpfs: string[]) {
    for (const cpf of cpfs) {
      await this.amqpConnection.publish(
        Constants.BENEFITS_EXCHANGE_NAME,
        Constants.FETCH_BENEFITS_FROM_CPF_ROUTING_KEY,
        {
          cpf,
        },
      );
    }

    return {
      success: true,
    };
  }

  async searchBenefits(cpf: string) {
    const searchResponse =
      await this.elasticsearchService.search<IBenefitsIndex>({
        index: Constants.BENEFITS_INDEX,
        query: {
          match: {
            _id: cpf,
          },
        },
      });

    return {
      hits: searchResponse.hits.hits.map((hit) => hit._source),
    };
  }

  async getBenefitsCacheByCPF(cpf: string) {
    const storedBenefits = await this.redisService.hget(
      `benefits:${cpf}`,
      'benefits',
    );
    if (!storedBenefits) return null;

    return JSON.parse(storedBenefits) as IBenefits[];
  }

  setBenefitsCacheByCPF(cpf: string, benefits: IBenefits[]) {
    // SETs would work here too instead of a Hashmap, but conceptually it makes more sense to use a Hashmap
    // Even though there's no real performance gain in this case, because of the data serialization (JSON.stringify)

    // Serializing benefits into a string and then deserializing it later can cause performance issues if benefits is too big
    // The reason we're doing this is because Redis dont't supports object arrays natively in Hashmaps
    return this.redisService.hset(`benefits:${cpf}`, {
      benefits: JSON.stringify(benefits),
    });
  }

  async createBenefitsIndexIfNotExists() {
    const benefitsIndexExists = await this.elasticsearchService.indices.exists({
      index: Constants.BENEFITS_INDEX,
    });
    if (benefitsIndexExists) return;

    await this.elasticsearchService.indices.create({
      index: Constants.BENEFITS_INDEX,
      mappings: {
        properties: {
          // Structure comes from IBenefitsIndex (benefits.types) which is used when indexing benefits
          // Sadly, the elasticsearch client doesn't allow to type this properly
          benefits: {
            type: 'nested',
            properties: {
              numero_beneficio: { type: 'keyword' },
              codigo_tipo_beneficio: { type: 'keyword' },
            },
          },
        },
      },
    });

    return;
  }

  async addBenefitsToIndex(cpf: string, benefits: IBenefits[]) {
    return this.elasticsearchService.index<IBenefitsIndex>({
      index: Constants.BENEFITS_INDEX,
      id: cpf,
      body: {
        benefits,
      },
    });
  }
}
