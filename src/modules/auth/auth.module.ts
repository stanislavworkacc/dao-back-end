import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { NonceService } from './services/nonce/nonce.service';
import { VerifyService } from './services/verify/verify.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AuthController],
  providers: [AuthService, NonceService, VerifyService, JwtService],
})
export class AuthModule {}
