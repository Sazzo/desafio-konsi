import { Injectable } from '@nestjs/common';
import {
  IKonsiINSSBenefitsResponse,
  IKonsiINSSTokenResponse,
} from './konsi-inss.types';
import { Logger } from 'src/shared/logger/logger.provider';
import { EnvService } from 'src/shared/env/env.service';

@Injectable()
export class KonsiINSSService {
  constructor(
    private readonly logger: Logger,
    private readonly envService: EnvService,
  ) {
    this.logger.setContext(KonsiINSSService.name);
  }

  async getAuthToken() {
    const tokenResponse = await fetch(
      `${this.envService.get('KONSI_INSS_API_URL')}/api/v1/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this.envService.get('KONSI_INSS_API_AUTH_USERNAME'),
          password: this.envService.get('KONSI_INSS_API_AUTH_PASSWORD'),
        }),
      },
    );

    if (!tokenResponse.ok)
      throw new Error(
        `Failed to get auth token. API returned ${tokenResponse.status}`,
      );

    const token = (await tokenResponse.json()) as IKonsiINSSTokenResponse;

    return token.data.token;
  }

  async getBenefitsFromCPF(authToken: string, cpf: string) {
    const benefitsResponse = await fetch(
      `${this.envService.get('KONSI_INSS_API_URL')}/api/v1/inss/consulta-beneficios?cpf=${cpf}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      },
    );

    if (!benefitsResponse.ok)
      throw new Error(
        `Failed to get benefits from CPF. API returned ${benefitsResponse.status}`,
      );

    const benefits =
      (await benefitsResponse.json()) as IKonsiINSSBenefitsResponse;

    return benefits.data.beneficios;
  }
}
