import { describe, expect, jest } from '@jest/globals';
import { Test } from '@nestjs/testing';
import { BenefitsConsumer } from '../benefits.consumer';
import { BenefitsService } from '../benefits.service';
import { createMock } from '@golevelup/ts-jest';
import { KonsiINSSService } from 'src/shared/integrations/konsi-inss/konsi-inss.service';
import { IBenefits } from '../benefits.types';
import { Logger } from 'src/shared/logger/logger.provider';

describe('BenefitsConsumer', () => {
  let benefitsConsumer: BenefitsConsumer;
  let benefitsService: BenefitsService;
  let konsiINSSService: KonsiINSSService;

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
        BenefitsConsumer,
        {
          provide: BenefitsService,
          useValue: createMock<BenefitsService>(),
        },
        {
          provide: KonsiINSSService,
          useValue: createMock<KonsiINSSService>(),
        },
        {
          provide: Logger,
          useValue: createMock<Logger>(),
        },
      ],
    }).compile();

    benefitsConsumer = module.get<BenefitsConsumer>(BenefitsConsumer);
    benefitsService = module.get<BenefitsService>(BenefitsService);
    konsiINSSService = module.get<KonsiINSSService>(KonsiINSSService);
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('consumeCPFToFetchBenefits', () => {
    it('should fetch benefits from Konsi INSS and cache them', async () => {
      jest
        .spyOn(benefitsService, 'getBenefitsCacheByCPF')
        .mockResolvedValue(null);
      jest
        .spyOn(konsiINSSService, 'getAuthToken')
        .mockResolvedValue('fake-auth-token');
      jest
        .spyOn(konsiINSSService, 'getBenefitsFromCPF')
        .mockResolvedValue(fakeBenefits);

      const setBenefitsCacheByCPF = jest.spyOn(
        benefitsService,
        'setBenefitsCacheByCPF',
      );
      const addBenefitsToIndex = jest.spyOn(
        benefitsService,
        'addBenefitsToIndex',
      );

      await benefitsConsumer.consumeCPFToFetchBenefits({
        cpf: fakeCPFs[0],
      });

      expect(setBenefitsCacheByCPF).toHaveBeenCalledWith(
        fakeCPFs[0],
        fakeBenefits,
      );
      expect(addBenefitsToIndex).toHaveBeenCalledWith(
        fakeCPFs[0],
        fakeBenefits,
      );
    });

    it('should not fetch benefits from Konsi INSS if they are already cached', async () => {
      jest
        .spyOn(benefitsService, 'getBenefitsCacheByCPF')
        .mockResolvedValue(fakeBenefits);

      const setBenefitsCacheByCPF = jest.spyOn(
        benefitsService,
        'setBenefitsCacheByCPF',
      );
      const addBenefitsToIndex = jest.spyOn(
        benefitsService,
        'addBenefitsToIndex',
      );
      const getAuthToken = jest.spyOn(konsiINSSService, 'getAuthToken');
      const getBenefitsFromCPF = jest.spyOn(
        konsiINSSService,
        'getBenefitsFromCPF',
      );

      await benefitsConsumer.consumeCPFToFetchBenefits({
        cpf: fakeCPFs[0],
      });

      expect(getAuthToken).not.toHaveBeenCalled();
      expect(getBenefitsFromCPF).not.toHaveBeenCalled();
      expect(setBenefitsCacheByCPF).not.toHaveBeenCalled();
      expect(addBenefitsToIndex).toHaveBeenCalledWith(
        fakeCPFs[0],
        fakeBenefits,
      );
    });

    it('should return if there are no benefits', async () => {
      jest
        .spyOn(benefitsService, 'getBenefitsCacheByCPF')
        .mockResolvedValue(null);
      jest
        .spyOn(konsiINSSService, 'getAuthToken')
        .mockResolvedValue('fake-auth-token');
      jest.spyOn(konsiINSSService, 'getBenefitsFromCPF').mockResolvedValue([]);

      const setBenefitsCacheByCPF = jest.spyOn(
        benefitsService,
        'setBenefitsCacheByCPF',
      );
      const addBenefitsToIndex = jest.spyOn(
        benefitsService,
        'addBenefitsToIndex',
      );

      await benefitsConsumer.consumeCPFToFetchBenefits({
        cpf: fakeCPFs[0],
      });

      expect(setBenefitsCacheByCPF).not.toHaveBeenCalled();
      expect(addBenefitsToIndex).not.toHaveBeenCalled();
    });
  });
});
