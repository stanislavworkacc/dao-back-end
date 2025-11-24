import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { StorageService } from '../../services/storage/storage.service';

@Injectable()
export class ProposalsService {
  constructor(private readonly _storageService: StorageService) {}

  findAll() {
    try {
      const proposals = this._storageService.getProposals();

      return {
        success: true,
        data: proposals,
        count: proposals.length,
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('Internal server error');
    }
  }
}
