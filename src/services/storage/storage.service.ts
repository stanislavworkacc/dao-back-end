import { Injectable } from '@nestjs/common';

@Injectable()
export class StorageService {
  public readonly events: any[] = [];
  public readonly proposals = new Map<string, any>();

  constructor() {
    this.proposals.set(String(1), {
      id: 1,
      creator: '0x0000000000000000000000000000000000000001',
      description: 'Test proposal',
      startBlock: 1,
      createdAt: '2022-01-01T00:00:00Z',
      endBlock: 1,
      executedAt: '2022-01-01T00:00:00Z',
      executed: false,
      voteCountFor: 0,
      voteCountAgainst: 0,
      transactionHash: '0x0000000000000000000000000000000000000001',
      votes: [],
    });
  }

  getProposals(): any[] {
    return Array.from(this.proposals.values());
  }
}