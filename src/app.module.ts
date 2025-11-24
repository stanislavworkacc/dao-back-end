import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { StorageModule } from './services/storage/storage.module';

@Module({
  imports: [
    StorageModule,
    ProposalsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
