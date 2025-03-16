import { jest } from '@jest/globals';
import { createMock } from '@golevelup/ts-jest';
import { Test } from '@nestjs/testing';
import { EnvService } from 'src/shared/env/env.service';
import { RedisService } from '../redis.service';

// Dummy test since the RedisService is just a wrapper around the ioredis library
describe('RedisService', () => {
  let redisService: RedisService;
  let envService: EnvService;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RedisService,
        {
          provide: EnvService,
          useValue: createMock<EnvService>(),
        },
      ],
    }).compile();

    redisService = module.get<RedisService>(RedisService);
    envService = module.get<EnvService>(EnvService);

    jest.mock('ioredis');
    jest.spyOn(envService, 'get').mockReturnValue('');
  });

  it('should be defined', () => {
    expect(redisService).toBeDefined();
  });
});
