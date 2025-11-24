import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ProposalsService } from './proposals.service';

@Controller('proposals')
export class ProposalsController {
  constructor(private readonly proposalsService: ProposalsService) {}
  @Get()
  findAll() {
    return this.proposalsService.findAll();
  }

  @Get(':id')
  getProposalById(@Param('id', ParseIntPipe) id: number) {
    const proposal = this.proposalsService.findOne(id);

    return {
      success: true,
      data: proposal,
    };
  }

}
