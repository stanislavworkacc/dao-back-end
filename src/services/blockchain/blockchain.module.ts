import { Global, Module } from '@nestjs/common';
import { BlockchainService } from './blockchain.service';
import { StorageService } from './storage.service';

@Global()
@Module({
  providers: [BlockchainService, StorageService],
  exports: [BlockchainService, StorageService]
})
export class BlockchainModule {

}
