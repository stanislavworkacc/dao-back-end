import { Injectable } from '@nestjs/common';
import { StorageService } from '../../services/storage/storage.service';

@Injectable()
export class ProposalsService {
  constructor(private readonly _storageService: StorageService) {}

  findAll() {
    return `This action returns all proposals`;
  }
}
