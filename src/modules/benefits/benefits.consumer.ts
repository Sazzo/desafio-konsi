import { RabbitSubscribe } from '@golevelup/nestjs-rabbitmq';
import * as Constants from 'src/shared/constants';
import { Injectable } from '@nestjs/common';
import { IFetchBenefitsFromCPFMessage } from './benefits.types';
import { KonsiINSSService } from 'src/shared/integrations/konsi-inss/konsi-inss.service';
import { BenefitsService } from './benefits.service';
import { Logger } from 'src/shared/logger/logger.provider';

@Injectable()
export class BenefitsConsumer {
  constructor(
    private readonly benefitsService: BenefitsService,
    private readonly konsiINSSService: KonsiINSSService,
    private readonly logger: Logger,
  ) {
    this.logger.setContext(BenefitsConsumer.name);
  }

  @RabbitSubscribe({
    exchange: Constants.BENEFITS_EXCHANGE_NAME,
    queue: Constants.FETCH_BENEFITS_FROM_CPF_QUEUE,
    routingKey: Constants.FETCH_BENEFITS_FROM_CPF_ROUTING_KEY,
  })
  async consumeCPFToFetchBenefits(message: IFetchBenefitsFromCPFMessage) {
    this.logger.log('Received a new CPF to consume and fetch benefits');

    const cachedCPFBenefits = await this.benefitsService.getBenefitsCacheByCPF(
      message.cpf,
    );

    if (cachedCPFBenefits) {
      this.logger.log(
        'Benefits for CPF already cached, skipping fetching from Konsi INSS',
      );

      await this.benefitsService.addBenefitsToIndex(
        message.cpf,
        cachedCPFBenefits,
      );
      return;
    }

    this.logger.log(
      "Received a non-cached CPF, fetching benefits from Konsi INSS' API",
    );

    const authToken = await this.konsiINSSService.getAuthToken();
    const benefits = await this.konsiINSSService.getBenefitsFromCPF(
      authToken,
      message.cpf,
    );

    await this.benefitsService.setBenefitsCacheByCPF(message.cpf, benefits);
    await this.benefitsService.addBenefitsToIndex(message.cpf, benefits);

    this.logger.log(
      'Benefits for CPF fetched, indexed and cached successfully',
    );
    return;
  }
}
