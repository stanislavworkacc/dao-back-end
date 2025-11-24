import { Controller, Get } from '@nestjs/common';
import { ProposalsService } from './proposals.service';

@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}
  @Get()
  findAll() {
    return this.proposalsService.findAll();
  }
}
