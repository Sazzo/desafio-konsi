import { IKonsiINSSBenefitsData } from 'src/shared/integrations/konsi-inss/konsi-inss.types';

// Represents the message that will be sent to the fetch benefits from CPF queue and then consumed.
export interface IFetchBenefitsFromCPFMessage {
  cpf: string;
}

// Represents the benefits that will be stored in the cache and indexed.
export type IBenefits = IKonsiINSSBenefitsData;

// Represents the benefits index in Elasticsearch.
export interface IBenefitsIndex {
  benefits: IBenefits[];
}
