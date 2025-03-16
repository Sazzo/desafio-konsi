import { Transform } from 'class-transformer';
import { IsCPF } from 'class-validator-cpf';
import { IBenefits, IBenefitsIndex } from '../benefits.types';

export class SearchBenefitsRequestDTO {
  @IsCPF()
  // Remove all non-digit characters (., -) from the CPF.
  @Transform(({ value }: { value: string }) => value.replace(/\D/g, ''))
  cpf: string;
}

// Only reason we're "redefining" the interfaces here is to make them available to Swagger/OpenAPI.
// Since Nest.js can't infer the types from the interfaces, only from the classes.
export class BenefitsDTO implements IBenefits {
  numero_beneficio: string;
  codigo_tipo_beneficio: string;
}
export class BenefitsIndexDTO implements IBenefitsIndex {
  benefits: BenefitsDTO[];
}
export class SearchBenefitsResponseDTO {
  hits: (BenefitsIndexDTO | undefined)[];
}
