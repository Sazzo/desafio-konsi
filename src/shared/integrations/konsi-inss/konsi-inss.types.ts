export interface IKonsiINSSTokenResponse {
  success: boolean;
  data: {
    token: string;
    type: string;
    expiresIn: string;
  };
}

export interface IKonsiINSSBenefitsData {
  numero_beneficio: string;
  codigo_tipo_beneficio: string;
}

export interface IKonsiINSSBenefitsResponse {
  success: boolean;
  data: {
    cpf: string;
    beneficios: IKonsiINSSBenefitsData[];
  };
}
