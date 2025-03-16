import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsCPF } from 'class-validator-cpf';

export class EnqueueCPFSDTO {
  @IsCPF({ each: true })
  // Remove all non-digit characters (., -) from the CPFs.
  @Transform(({ value }: { value: string[] }) =>
    value.map((cpf) => cpf.replace(/\D/g, '')),
  )
  @ApiProperty()
  cpfs: string[];
}

export class EnqueueCPFSResponseDTO {
  success: boolean;
}
