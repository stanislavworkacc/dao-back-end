import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { StorageModule } from './services/storage/storage.module';
import { BlockchainModule } from './services/blockchain/blockchain.module';

@Module({
  imports: [
    StorageModule,
    BlockchainModule,
    ProposalsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
