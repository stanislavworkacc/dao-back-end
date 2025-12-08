import { Injectable, Logger } from '@nestjs/common';
import { generateNonce } from 'siwe';
import { AuthService } from '../../auth.service';


@Injectable()
export class NonceService {
  private readonly logger: Logger = new Logger(NonceService.name);

  constructor(private readonly _authService: AuthService) {
  }


  generateNonce(address: string): { nonce: string } {
    const lower: string = address.toLowerCase();
    const nonce: string = generateNonce();

    this._authService.nonces.set(lower, nonce);
    this.logger.debug(`Generated nonce for ${lower}: ${nonce}`);

    return { nonce };
  }
}
