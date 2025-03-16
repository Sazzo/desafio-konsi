import { describe, expect, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { BenefitsService } from '../benefits.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { createMock } from '@golevelup/ts-jest';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { RedisService } from 'src/shared/integrations/redis/redis.service';
import * as Constants from 'src/shared/constants';
import { SearchResponse } from 'node_modules/@elastic/elasticsearch/lib/api/types';
import { IBenefits, IBenefitsIndex } from '../benefits.types';

const elasticsearchServiceMock = createMock<ElasticsearchService>();
const redisServiceMock = createMock<RedisService>();
const amqpConnectionMock = createMock<AmqpConnection>();

describe('BenefitsService', () => {
  let benefitsService: BenefitsService;
  let elasticsearchService: ElasticsearchService;
  let redisService: RedisService;
  let amqpConnection: AmqpConnection;

  const fakeCPFs = ['12345678901', '12345678902', '12345678903'];
  const fakeBenefits: IBenefits[] = [
    {
      numero_beneficio: '12345678901',
      codigo_tipo_beneficio: '01',
    },
    {
      numero_beneficio: '12345678902',
      codigo_tipo_beneficio: '02',
    },
  ];

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BenefitsService,
        {
          provide: ElasticsearchService,
          useValue: elasticsearchServiceMock,
        },
        {
          provide: RedisService,
          useValue: redisServiceMock,
        },
        {
          provide: AmqpConnection,
          useValue: amqpConnectionMock,
        },
      ],
    }).compile();

    benefitsService = module.get<BenefitsService>(BenefitsService);
    elasticsearchService =
      module.get<ElasticsearchService>(ElasticsearchService);
    redisService = module.get<RedisService>(RedisService);
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('onModuleInit', () => {
    it('should create benefits index if it does not exist', async () => {
      const elasticsearchServiceIndicesExists = jest.spyOn(
        elasticsearchService.indices,
        'exists',
      );
      const elasticsearchServiceIndicesCreate = jest.spyOn(
        elasticsearchService.indices,
        'create',
      );

      elasticsearchServiceIndicesExists.mockResolvedValue(false);

      await benefitsService.onModuleInit();

      expect(elasticsearchServiceIndicesCreate).toHaveBeenCalled();
    });
  });

  describe('enqueueCPFsToFetchBenefits', () => {
    it('should enqueue CPFs to fetch benefits', async () => {
      const amqpConnectionPublish = jest.spyOn(amqpConnection, 'publish');

      await benefitsService.enqueueCPFsToFetchBenefits(fakeCPFs);

      expect(amqpConnectionPublish).toHaveBeenCalledTimes(fakeCPFs.length);

      // Expect that each CPF was enqueued
      for (const cpf of fakeCPFs) {
        expect(amqpConnectionPublish).toHaveBeenCalledWith(
          Constants.BENEFITS_EXCHANGE_NAME,
          Constants.FETCH_BENEFITS_FROM_CPF_ROUTING_KEY,
          {
            cpf,
          },
        );
      }
    });
  });

  describe('searchBenefits', () => {
    it('should search benefits by CPF', async () => {
      const cpf = fakeCPFs[0];
      const searchResponse: SearchResponse<IBenefitsIndex> = {
        took: 1,
        timed_out: false,
        _shards: {
          total: 1,
          successful: 1,
          skipped: 0,
          failed: 0,
        },
        hits: {
          hits: [
            {
              _id: cpf,
              _index: Constants.BENEFITS_INDEX,
              _source: {
                benefits: fakeBenefits,
              },
            },
          ],
        },
      };

      jest
        .spyOn(elasticsearchService, 'search')
        .mockResolvedValue(searchResponse);

      const response = await benefitsService.searchBenefits(cpf);

      expect(response).toEqual({
        hits: searchResponse.hits.hits.map((hit) => hit._source),
      });
    });

    it('should return an empty array if no benefits are found', async () => {
      const cpf = fakeCPFs[0];
      const searchResponse: SearchResponse<IBenefitsIndex> = {
        took: 1,
        timed_out: false,
        _shards: {
          total: 1,
          successful: 1,
          skipped: 0,
          failed: 0,
        },
        hits: {
          hits: [],
        },
      };

      jest
        .spyOn(elasticsearchService, 'search')
        .mockResolvedValue(searchResponse);

      const response = await benefitsService.searchBenefits(cpf);

      expect(response).toEqual({
        hits: [],
      });
    });
  });

  describe('getBenefitsCacheByCPF', () => {
    it('should get benefits cache by CPF', async () => {
      const cpf = fakeCPFs[0];

      jest
        .spyOn(redisService, 'hget')
        .mockResolvedValue(JSON.stringify(fakeBenefits));

      const response = await benefitsService.getBenefitsCacheByCPF(cpf);

      expect(response).toEqual(fakeBenefits);
    });

    it('should return null if no benefits are found in cache', async () => {
      const cpf = '12345678901';

      jest.spyOn(redisService, 'hget').mockResolvedValue(null);

      const response = await benefitsService.getBenefitsCacheByCPF(cpf);

      expect(response).toBeNull();
    });
  });

  describe('setBenefitsCacheByCPF', () => {
    it('should set benefits cache by CPF', async () => {
      const cpf = fakeCPFs[0];

      // hset returns the number of fields that were added, and since we only add one to the hashmap (benefits), it should return 1.
      jest.spyOn(redisService, 'hset').mockResolvedValue(1);

      const response = await benefitsService.setBenefitsCacheByCPF(
        cpf,
        fakeBenefits,
      );

      expect(response).toBe(1);
    });
  });

  describe('createBenefitsIndexIfNotExists', () => {
    it('should create benefits index if it does not exist', async () => {
      jest
        .spyOn(elasticsearchService.indices, 'exists')
        .mockResolvedValue(false);
      const elasticsearchServiceIndicesCreate = jest.spyOn(
        elasticsearchService.indices,
        'create',
      );

      await benefitsService.createBenefitsIndexIfNotExists();

      expect(elasticsearchServiceIndicesCreate).not.toThrow();
      expect(elasticsearchServiceIndicesCreate).toHaveBeenCalled();
    });

    it('should not create benefits index if it already exists', async () => {
      jest
        .spyOn(elasticsearchService.indices, 'exists')
        .mockResolvedValue(true);
      const elasticsearchServiceIndicesCreate = jest.spyOn(
        elasticsearchService.indices,
        'create',
      );

      await benefitsService.createBenefitsIndexIfNotExists();

      expect(elasticsearchServiceIndicesCreate).not.toHaveBeenCalled();
    });
  });

  describe('addBenefitsToIndex', () => {
    it('should add benefits to elastic index', async () => {
      const cpf = fakeCPFs[0];

      jest.spyOn(elasticsearchService, 'index').mockResolvedValue({
        _id: cpf,
        _index: Constants.BENEFITS_INDEX,
        _shards: {
          failed: 0,
          successful: 1,
          total: 1,
        },
        _version: 1,
        result: 'created',
      });

      const response = await benefitsService.addBenefitsToIndex(
        cpf,
        fakeBenefits,
      );

      expect(response.result).toEqual('created');
    });
  });
});
