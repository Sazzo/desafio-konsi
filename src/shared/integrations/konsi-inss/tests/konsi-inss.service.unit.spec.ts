import fetchMock from 'jest-fetch-mock';
fetchMock.enableMocks();

import { Test } from '@nestjs/testing';
import { KonsiINSSService } from '../konsi-inss.service';
import { EnvService } from 'src/shared/env/env.service';
import { createMock } from '@golevelup/ts-jest';
import { jest } from '@jest/globals';
import {
  IKonsiINSSBenefitsResponse,
  IKonsiINSSTokenResponse,
} from '../konsi-inss.types';
import { Logger } from 'src/shared/logger/logger.provider';

describe('KonsiINSSService', () => {
  let konsiINSSService: KonsiINSSService;
  let envService: EnvService;

  const fakeAuthTokenResponse: IKonsiINSSTokenResponse = {
    success: true,
    data: {
      token: 'fake-token',
      expiresIn: '2025-01-01 15:00',
      type: 'Bearer',
    },
  };
  const fakeBenefitsResponse: IKonsiINSSBenefitsResponse = {
    success: true,
    data: {
      cpf: '12345678901',
      beneficios: [
        {
          numero_beneficio: '123456789',
          codigo_tipo_beneficio: '1',
        },
      ],
    },
  };

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      providers: [
        KonsiINSSService,
        {
          provide: EnvService,
          useValue: createMock<EnvService>(),
        },
        {
          provide: Logger,
          useValue: createMock<Logger>(),
        },
      ],
    }).compile();

    konsiINSSService = module.get<KonsiINSSService>(KonsiINSSService);
    envService = module.get<EnvService>(EnvService);

    jest.spyOn(envService, 'get').mockReturnValue('');
  });

  beforeEach(() => {
    fetchMock.resetMocks();
  });

  describe('getAuthToken', () => {
    it('should fetch and return the auth token', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(fakeAuthTokenResponse));

      const authToken = await konsiINSSService.getAuthToken();

      expect(authToken).toEqual(fakeAuthTokenResponse.data.token);
    });

    it('should throw an error if the request is not 2xx', async () => {
      jest.spyOn(envService, 'get').mockReturnValue('fake-url');

      fetchMock.mockResponseOnce('', { status: 400 });

      await expect(konsiINSSService.getAuthToken()).rejects.toThrow();
    });
  });

  describe('getBenefitsFromCPF', () => {
    it('should fetch and return the benefits from a CPF', async () => {
      fetchMock.mockResponseOnce(JSON.stringify(fakeBenefitsResponse));

      const benefits = await konsiINSSService.getBenefitsFromCPF(
        'fake-token',
        '12345678901',
      );

      expect(benefits).toEqual(fakeBenefitsResponse.data.beneficios);
    });

    it('should throw an error if the request is not 2xx', async () => {
      fetchMock.mockResponseOnce('', { status: 400 });

      await expect(
        konsiINSSService.getBenefitsFromCPF('fake-token', '12345678901'),
      ).rejects.toThrow();
    });
  });
});
