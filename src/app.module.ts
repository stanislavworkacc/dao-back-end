import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ProposalsModule } from './modules/proposals/proposals.module';
import { BlockchainModule } from './services/blockchain/blockchain.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'dev-siwe-secret',
      signOptions: {
        expiresIn: '10m',
      },
    }),
    ScheduleModule.forRoot(),
    BlockchainModule,
    AuthModule,
    ProposalsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
