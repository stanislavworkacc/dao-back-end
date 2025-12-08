import { Body, Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
import type { Response, Request } from 'express';
import { NonceService } from './services/nonce/nonce.service';
import { VerifyService } from './services/verify/verify.service';
import { GetNonceDto } from './dto/get-nonce.dto';
import { VerifySiweDto } from './dto/verify-siwe.dto';
import { Web3AuthResult } from './interfaces/web3-auth-result.interface';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly _nonceService: NonceService,
    private readonly _verifyService: VerifyService,
  ) {
  }

  @Get('nonce')
  getNonce(@Query() query: GetNonceDto) {
    return this._nonceService.generateNonce(query.address);
  }

  @Post('verify')
  async verify(
    @Body() dto: VerifySiweDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const result: Web3AuthResult = await this._verifyService.verifySiwe(
      dto.message,
      dto.signature,
    );

    if (result.success && result.token) {
      const maxAgeMs: number = 10 * 60 * 1000;

      res.cookie('siwe_token', result.token, {
        domain: req.hostname,
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: maxAgeMs,
        path: '/',
      });
    }

    return result;
  }
}
