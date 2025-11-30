import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { StorageService } from '../../services/blockchain/storage.service';

@Injectable()
export class ProposalsService {
  constructor(private readonly _storageService: StorageService) {}

  findAll() {
    try {
      const proposals = this._storageService.getProposals();

      const updatedProposals = proposals.map((p: any) => {
        const { votes, ...proposal } = p;
        return proposal;
      });

      return {
        success: true,
        data: updatedProposals,
        count: updatedProposals.length,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }

  findOne(id: number) {
    const proposal = this._storageService.getProposal(id.toString());

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return proposal;
  }

  findVotes(id: number) {
    const proposal = this._storageService.getProposal(id.toString());

    if (!proposal) {
      throw new NotFoundException('Proposal not found');
    }

    return proposal.votes;
  }
}
