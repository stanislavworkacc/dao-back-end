import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  public readonly events: any[] = [];
  public readonly proposals = new Map<string, any>();

  getProposals(): any[] {
    return Array.from(this.proposals.values());
  }
}