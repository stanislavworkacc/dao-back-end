import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  nonces: Map<string, string> = new Map<string, string>();
}
