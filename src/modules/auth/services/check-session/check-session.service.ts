import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { SessionHealthResult } from '../../interfaces/session-health.interface';
import { VerifyService } from '../verify/verify.service';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

@Injectable()
export class CheckSessionService {
  private readonly logger: Logger = new Logger(VerifyService.name);
  private readonly appDomain: string =
    process.env.APP_DOMAIN || 'localhost:4200';

  constructor(
    private readonly jwtService: JwtService,
  ) {
  }

  checkSession(req: Request): SessionHealthResult {
    const token: string | undefined = req.cookies?.['siwe_token'];
    if (!token) {
      this.logger.debug('checkSession: no siwe_token cookie');
      throw new UnauthorizedException('No active session');
    }

    try {
      const decoded: JwtPayload = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET!,
      });

      let expiresAt: string | null = null;
      if (decoded.exp) {
        expiresAt = new Date(decoded.exp * 1000).toISOString();
      }

      return {
        success: true,
        address: decoded.sub,
        chainId: decoded.chainId,
        expiresAt,
      };
    } catch (e) {
      this.logger.warn('checkSession: invalid or expired token', e as Error);
      throw new UnauthorizedException('Session expired or invalid');
    }
  }
}
