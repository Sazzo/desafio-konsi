import { jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { EnvService } from '../env.service';
import { ConfigService } from '@nestjs/config';
import { createMock } from '@golevelup/ts-jest';
import { Env } from '../schema';

describe('EnvService', () => {
  let envService: EnvService;
  let configService: ConfigService<Env, true>;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        EnvService,
        {
          provide: ConfigService,
          useValue: createMock<ConfigService<Env, true>>(),
        },
      ],
    }).compile();

    envService = module.get<EnvService>(EnvService);
    configService = module.get<ConfigService<Env, true>>(ConfigService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('get', () => {
    it('should return the value of the environment variable', () => {
      const key = 'PORT';
      const value = '3000';

      jest.spyOn(configService, 'get').mockReturnValue(value);

      expect(envService.get(key)).toBe(value);
    });

    it("should return undefined if the environment variable doesn't exist", () => {
      const key = 'PORT';

      jest.spyOn(configService, 'get').mockReturnValue(undefined);

      expect(envService.get(key)).toBe(undefined);
    });
  });
});
