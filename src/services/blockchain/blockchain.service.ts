import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import DAO_ABI from '../../abis/DAOContract.json';
import { ethers, Network } from 'ethers';
import { Interval } from '@nestjs/schedule';
import { StorageService } from './storage.service';

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger: Logger = new Logger(BlockchainService.name);
  private readonly provider: ethers.JsonRpcProvider;
  private readonly wallet: ethers.Wallet;
  private readonly daoContract: ethers.Contract;

  constructor(
    private readonly _storageService: StorageService,
  ) {
    const rpcUrl: string = process.env.RPC_URL!;
    const daoAddress: string = process.env.DAO_ADDRESS!;
    const privateKey: string = process.env.PRIVATE_KEY!;

    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    this.wallet = new ethers.Wallet(privateKey, this.provider);

    this.daoContract = new ethers.Contract(daoAddress, DAO_ABI, this.wallet);
  }

  async onModuleInit() {
    try {
      this.logger.log('Starting Web3 DAO Event Indexer & API Service...');

      const network: Network = await this.provider.getNetwork();
      this.logger.log(
        `Current network: ${network.name} (chainId: ${network.chainId})`,
      );

      const blockNumber = await this.provider.getBlockNumber();
      this.logger.log(`Current block number: ${blockNumber}`);
    } catch (e) {
      this.logger.error('Failed to initialize blockchain provider', e as Error);
    }
  }

  getDaoContract() {
    return this.daoContract;
  }

  getProvider() {
    return this.provider;
  }

  getWallet() {
    return this.wallet;
  }


  @Interval(5000)
  async pollEvents() {

    try {
      const currentBlock = await this.provider.getBlockNumber();
      const fromBlock = this._storageService.lastBlockProcessed + 1;

      if (fromBlock > currentBlock) {
        return;
      }

      this.logger.log(`Polling events from ${fromBlock} to ${currentBlock}`);

      const [proposalCreatedEvents, votedEvents, proposalExecutedEvents] =
        await Promise.all([
          this.daoContract.queryFilter(
            'ProposalCreated',
            fromBlock,
            currentBlock,
          ),
          this.daoContract.queryFilter('Voted', fromBlock, currentBlock),
          this.daoContract.queryFilter(
            'ProposalExecuted',
            fromBlock,
            currentBlock,
          ),
        ]);

      if (proposalCreatedEvents.length > 0) {
        this.logger.log(
          `Found ${proposalCreatedEvents.length} ProposalCreated events`,
        );
        this.handleProposalCreated(proposalCreatedEvents);
      }

      if (votedEvents.length > 0) {
        this.logger.log(`Found ${votedEvents.length} Voted events`);
        // this.handleVoteEvents(votedEvents);
      }

      // 7. якщо ProposalExecuted знайдені → обробка
      if (proposalExecutedEvents.length > 0) {
        this.logger.log(
          `Found ${proposalExecutedEvents.length} ProposalExecuted events`,
        );
        // this.handleProposalExecuted(proposalExecutedEvents);
      }


      this._storageService.lastBlockProcessed = currentBlock;
    } catch (error) {
      this.logger.error('Error while polling events', error);
    }
  }

  private handleProposalCreated(events: any) {
    for (const event of events) {
      try {
        const [id, creator, description] = event.args;

        const idStr = id.toString();

        this.logger.log('\nProposalCreated event detected');
        this.logger.log(`Proposal ID: ${idStr}`);
        this.logger.log(`Creator: ${creator}`);
        this.logger.log(`Description: ${description}`);
        this.logger.log(`Block Number: ${event.blockNumber}`);
        this.logger.log(`Timestamp: ${(event).timestamp}`);
        this.logger.log(`Transaction Hash: ${event.transactionHash}`);

        const proposal = {
          id: idStr,
          creator,
          description,
          startBlock: event.blockNumber,
          createdAt: new Date(),
          endBlock: null,
          executedAt: null,
          executed: false,
          voteCountFor: '0',
          voteCountAgainst: '0',
          transactionHash: event.transactionHash,
          votes: [] as any[],
        };


        console.log("SETTTT", idStr);
        this._storageService.proposals.set(idStr, proposal);
      } catch (error) {
        this.logger.error('Error while handling ProposalCreated event', error);
      }
    }
  }
}
