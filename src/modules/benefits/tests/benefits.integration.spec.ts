import { jest } from '@jest/globals';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { createMock } from '@golevelup/ts-jest';
import { ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { KonsiINSSService } from 'src/shared/integrations/konsi-inss/konsi-inss.service';
import { RedisService } from 'src/shared/integrations/redis/redis.service';
import { TestContainers } from 'src/shared/integrations/testcontainers/testcontainers';
import request from 'supertest';
import { IBenefits } from '../benefits.types';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { ConfigModule } from '@nestjs/config';
import { BenefitsService } from '../benefits.service';
import { SearchBenefitsResponseDTO } from '../dto/search-benefits.dto';
import { configModule } from 'src/shared/env/env.module';

describe('BenefitsController (integration)', () => {
  let app: NestExpressApplication;
  let redisService: RedisService;
  let konsiINSSService: KonsiINSSService;
  let benefitsService: BenefitsService;
  let amqpConnection: AmqpConnection;

  const fakeCPFs = ['34322835040', '86923000041', '56894687030'];
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
    await TestContainers.startContainers();
    TestContainers.setupEnv();

    const module = await Test.createTestingModule({
      imports: [AppModule],
      providers: [
        {
          provide: KonsiINSSService,
          useValue: createMock<KonsiINSSService>(),
        },
      ],
    })
      .overrideModule(configModule)
      .useModule(
        ConfigModule.forRoot({
          isGlobal: true,
          ignoreEnvFile: true,
          load: [],
        }),
      )
      .compile();

    app = module.createNestApplication<NestExpressApplication>(
      new ExpressAdapter(),
    );
    app.useGlobalPipes(
      new ValidationPipe({
        transform: true,
        forbidNonWhitelisted: true,
      }),
    );

    redisService = module.get<RedisService>(RedisService);
    konsiINSSService = module.get<KonsiINSSService>(KonsiINSSService);
    benefitsService = module.get<BenefitsService>(BenefitsService);
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);

    await app.init();
  }, 120000);

  afterAll(async () => {
    await amqpConnection.close();
    await redisService.quit();
    await app.close();

    await TestContainers.stopContainers();
  }, 60000);

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /enqueue', () => {
    it('should enqueue CPFs and proccess them', async () => {
      jest
        .spyOn(konsiINSSService, 'getAuthToken')
        .mockResolvedValue('fake-auth-token');
      jest
        .spyOn(konsiINSSService, 'getBenefitsFromCPF')
        .mockResolvedValue(fakeBenefits);

      const response = await request(app.getHttpServer())
        .post('/benefits/enqueue')
        .send({ cpfs: fakeCPFs })
        .expect(200);

      await new Promise((r) => setTimeout(r, 3000));

      // Check if CPFs were cached, indexed and fetched
      for (const cpf of fakeCPFs) {
        const cachedBenefits = await benefitsService.getBenefitsCacheByCPF(cpf);
        expect(cachedBenefits).toEqual(fakeBenefits);

        const searchResponse = await benefitsService.searchBenefits(cpf);
        expect(searchResponse.hits[0]).toEqual({
          benefits: fakeBenefits,
        });
      }

      expect(response.body).toEqual({ success: true });
    });

    it('should return 400 if no CPFs are provided', async () => {
      await request(app.getHttpServer()).post('/benefits/enqueue').expect(400);
    });

    it('should return 400 if provided invalid CPFs', async () => {
      await request(app.getHttpServer())
        .post('/benefits/enqueue')
        .send({ cpfs: ['1234567890', '12345678901'] })
        .expect(400);
    });
  });

  describe('POST /search', () => {
    it('should search for benefits by CPF', async () => {
      await benefitsService.addBenefitsToIndex(fakeCPFs[0], fakeBenefits);

      const response = await request(app.getHttpServer())
        .post('/benefits/search')
        .send({ cpf: fakeCPFs[0] })
        .expect(200);

      const body = response.body as SearchBenefitsResponseDTO;
      expect(body.hits[0]).toEqual({
        benefits: fakeBenefits,
      });
    });

    it('should return a empty hits array if CPF is not indexed', async () => {
      const response = await request(app.getHttpServer())
        .post('/benefits/search')
        .send({ cpf: '41502259079' })
        .expect(200);

      const body = response.body as SearchBenefitsResponseDTO;
      expect(body.hits).toEqual([]);
    });

    it('should return 400 if no CPF is provided', async () => {
      await request(app.getHttpServer()).post('/benefits/search').expect(400);
    });

    it('should return 400 if provided invalid CPF', async () => {
      await request(app.getHttpServer())
        .post('/benefits/search')
        .send({ cpf: '1234567890' })
        .expect(400);
    });
  });
});
