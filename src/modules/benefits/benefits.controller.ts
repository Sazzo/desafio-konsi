import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { BenefitsService } from './benefits.service';
import { EnqueueCPFSDTO, EnqueueCPFSResponseDTO } from './dto/enqueue-cpfs.dto';
import {
  SearchBenefitsRequestDTO,
  SearchBenefitsResponseDTO,
} from './dto/search-benefits.dto';

@Controller('benefits')
export class BenefitsController {
  constructor(private readonly benefitsService: BenefitsService) {}

  /**
   * Enqueue CPFs to fetch benefits.
   * @returns {EnqueueCPFSResponseDTO} Enqueue CPFs response.
   * @throws {400} Validation error. CPFs must be an array of strings and in a valid format.
   */
  @Post('enqueue')
  @HttpCode(200)
  enqueueCPFsToFetchBenefits(
    @Body() enqueueCPFsDto: EnqueueCPFSDTO,
  ): Promise<EnqueueCPFSResponseDTO> {
    return this.benefitsService.enqueueCPFsToFetchBenefits(enqueueCPFsDto.cpfs);
  }

  /**
   * Search benefits by CPF.
   * @returns {SearchBenefitsResponseDTO} Search benefits response.
   * @throws {400} Validation error. CPF must be a string and in a valid format.
   */
  @Post('search')
  @HttpCode(200)
  searchBenefits(
    @Body() searchBenefitsDto: SearchBenefitsRequestDTO,
  ): Promise<SearchBenefitsResponseDTO> {
    return this.benefitsService.searchBenefits(searchBenefitsDto.cpf);
  }
}
