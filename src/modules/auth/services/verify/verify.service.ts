import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { SiweMessage } from 'siwe';
import { Web3AuthResult } from '../../interfaces/web3-auth-result.interface';
import { AuthService } from '../../auth.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class VerifyService {
  private readonly logger = new Logger(VerifyService.name);
  private readonly appDomain: string = process.env.APP_DOMAIN || 'localhost:4200';

  constructor(
    private readonly _authService: AuthService,
    private readonly jwtService: JwtService,
  ) {
  }

  async verifySiwe(
    message: string,
    signature: string,
  ): Promise<Web3AuthResult> {
    try {
      const msg = new SiweMessage(message);
      const lower: string = msg.address.toLowerCase();
      const storedNonce: string | undefined = this._authService.nonces.get(lower);

      if (!storedNonce) {
        throw new UnauthorizedException('Nonce not found or already used');
      }

      const { success, data } = await msg.verify({
        signature,
        nonce: storedNonce,
        domain: this.appDomain,
      });

      if (!success) {
        throw new UnauthorizedException('SIWE verification failed');
      }

      this._authService.nonces.delete(lower);

      this.logger.log(`SIWE auth success for ${data.address} on chain ${data.chainId}`);

      const payload = {
        sub: lower,
        chainId: data.chainId,
        type: 'siwe',
      };

      const token: string = this.jwtService.sign(payload, { secret: process.env.JWT_SECRET! });

      return {
        success: true,
        address: data.address,
        chainId: Number(data.chainId),
        token,
        message: 'Authentication successful',
      };
    } catch (e) {
      this.logger.error('SIWE verification error', e as Error);
      throw new UnauthorizedException('Invalid SIWE message or signature');
    }
  }
}
