import { Module } from '@nestjs/common';
import { ProposalsService } from './proposals.service';
import { ProposalsController } from './proposals.controller';
import { StorageService } from '../../services/storage/storage.service';

@Module({
  controllers: [ProposalsController],
  providers: [ProposalsService, StorageService],
})
export class ProposalsModule {}
