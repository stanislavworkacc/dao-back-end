import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service';

@Module({
  providers: [StorageService, StorageService],
})
export class StorageModule {}
